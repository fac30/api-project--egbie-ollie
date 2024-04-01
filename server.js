import fetch from "node-fetch"; // for HTTP requests
import express, { response } from "express"; // for HTTP requests
import session from 'express-session';


import bodyParser from 'body-parser';
import path from "path";
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
import { getOptions } from './utils/getFetchOptions.js';
import { getFormattedDate } from "./utils/dates.js";
import { fetchOrUseCache } from "./utils/fetchHelper.js";
import User from "./models/user.js";



import { PasswordStrengthChecker, PasswordImplementer} from "./utils/password.js";
import { MemoryCache } from "./utils/memCache.js";
import {MemoryDB, CacheSaveTypes} from "./utils/cache.js";
import { saveDynamicPageSection } from "./utils/pageSectionService.js";
import Movie from "./models/movie.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;

let memoryDB   = null;


// Serve static files from the "static" directory
app.use(express.static(path.join(__dirname, "public")));




// render where we want to serve the files
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



import rateLimit from 'express-rate-limit';


// // Create a rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,      // 15 minutes
  max: 100,                      // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Apply the rate limiter to all requests
app.use(limiter);

// Session Middleware
app.use(session({
  secret: SECRET_KEY,  
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Adjust secure option based on your deployment environment
}));

app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.isAdmin = req.session.isAdmin;
  next();
});


// Initialization the cache when the server starts
function initializeCache(req, res, next) {
  const memCache = new MemoryCache();
  if (!memoryDB) {
    memoryDB = new MemoryDB(memCache);
    memoryDB.createTables();
    
  }

  next();      
       
}



function isAuthenticated (req, res, next)  {
  if (req.session.userId) {
      return res.redirect("/landing-page"); 
  }
  next();
};


const authenticateUser = (req, res, next) => {
  if (req.session.userId) {
      next();
  } else {
      res.status(401).send("Unauthorized access. Please log in.");
  }
};


app.use(initializeCache);

// Parse JSON bodies
app.use(bodyParser.json());
app.use(express.json()); // Middleware to parse JSON request bodies


// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

const authorizationKey = process.env.MOVIE_API_READ_ACCESS_TOKEN;
const options          = getOptions(authorizationKey);


// Route to handle requests for jokes
app.get("/joke", async (req, res) => {
  try {
    // Request to JokeAPI
    const response = await fetch("https://v2.jokeapi.dev/joke/Any?contains=pint");
    // const data = await response.json();
    // const joke = data.contents.jokes[0].joke.text;

    // Send the joke back as JSON
    // res.json({ joke });
  } catch (error) {
    console.error("Error fetching joke:", error);
    res.status(500).json({ error: "Failed to fetch joke" });
  }
});



// Dashboard
app.get("/admin", authenticateUser, async(req, res) => {

  const userObj = memoryDB.getCacheByName(req.session.userId);

 
  if (!userObj) {
    return res.status(500).send("Something went wrong!!");
  }

  const user = User.setDataFromCache(userObj);

  if (!user) {
    throw new Error("Something went wrong the user was not found!!")
  }

  
  
  res.render("admin/admin",  {joined: user.dateJoined, 
                              hashedPassword: user.password,
                              email: user.email,
                              remainingSpace: memoryDB.remainingSpace,
                              maximumSize: memoryDB.maximumSize,
                              noOfSearchTermsMade: user.countSearchTerms(),
                              ratings: user.countRatings(),
                              favourites: user.countFavourites(),
                              watchList: user.countWatchlistItems(),
                              NO_OF_API_REQUESTS: user.countAPIRequests(),
                              
                          });
})



app.post("/admin", authenticateUser, async(req, res) => {
  res.render("admin/admin");
})



// Admin form
app.post("/admin-form",  async(req, res) => {
  

  const username = req.body.username;
  const password = req.body.password;
  let invalid;

  const userObj = memoryDB.getCacheByName(username);
  if (userObj) {
    const user  = User.setDataFromCache(userObj); 
    
    // Take the user's plaintext password entered and compared to the one in the database
    const result = await PasswordImplementer.verifyPassword(password, user.password);
   
    if (result && user.isActive && user.isAdmin) {
      req.session.userId = user.username;
      req.session.isAdmin = true;
      return res.status(200).redirect("/landing-page");
    }
  
}
  invalid = "Incorrect email and username";  

  res.render("authentication/admin-form", {invalid: invalid});
})


app.get("/admin-form",  async(req, res) => {
  
  let invalid;  

  res.render("authentication/admin-form", {invalid: invalid});
})



// register
app.get("/register", isAuthenticated, async(req, res) => {
  res.render("authentication/register");
})



app.post("/register", async(req, res) => {

  const form = req.body;

  if (!form) {
    return res.status(400).send("No form data provided");
  }
   
    const user =  User.createNewUser(memoryDB, form.username);  
    user.setUsername(form.username);
    user.setEmail(form.email);
   
    const passwordImplementer = new PasswordImplementer(form.password);
  
    try {
      const hashedPassword =  await passwordImplementer.hashPassword();
      user.setPassword(hashedPassword);
      user.save()
     
    } catch (error) {
      res.status(500).send(`Something went wrong couldn't encrypt the password! ${error}`);
    } 

    return res.redirect("/login");

})


// login
app.get("/login", isAuthenticated, async(req, res) => {
  let invalid;
  res.render("authentication/login", {invalid: invalid});
})



app.post("/login", isAuthenticated, async(req, res) => {

  const username = req.body.username;
  const password = req.body.password;
  let invalid;

  const userObj = memoryDB.getCacheByName(username);

  // Takes the complicated nested user data stored in the cache and stores it a way that can be accessed by "dot notation"
  const user  = User.setDataFromCache(userObj); 

  if (user) {
      
      // Take the user's plaintext password entered and compared to the one in the database
      const result = await PasswordImplementer.verifyPassword(password, user.password);
      if (result && user.isActive) {
        req.session.userId = user.username;
        return res.status(200).redirect("/landing-page");
      }
    
  }
  invalid = "Incorrect email and username";  
 
  return res.render("authentication/login", {invalid: invalid});
  
})


//landing page
app.get("/landing-page", async(req, res) => {
  res.render("landing-page");
})



// index 
app.get("/", async (req, res) => {
 
  const tableName = "default";
  const mainCache = memoryDB.getCacheByName(tableName);

  if (!mainCache) {
    res.status(500).send("Something went wrong!");
  }
  
  const sectionArray  =  mainCache?.homePage;

  if (!sectionArray) {
    res.status(404).send("Something went wrong!!");
  }

  return res.render("index", { sectionArray: sectionArray});
});



// search movies
app.post("/movies", async (req, res) => {

  const searchQuery = req.body.search;
  const url         = `https://api.themoviedb.org/3/search/movie?query=${searchQuery}&include_adult=false&language=en-US&page=`;

  const data        = {};
  let movieData     = {};
  data.error        = "Something went wrong and we couldn't find your search";
  data.consoleError = "Error fetching movie data: ";
  data.saveAs       = CacheSaveTypes.search;
  data.fetcError    = "Failed to fetch movie data : ";
  data.tableName    = searchQuery;
  const category    = CacheSaveTypes.search;
  
  const username    = req.session.userId;
 
  const cache = username ? memoryDB.getCacheByName(username) : memoryDB.getDefaultCache();
  data.tableArray = cache.searchTerms;


  try {

    movieData = await fetchOrUseCache(url, options, req, data, memoryDB);

  } catch (error) {
      console.error(data.consoleError + error);
      return res.status(500).json({ error: "Failed to fetch your search query" });
  }
  


  return res.render("movies/movies.ejs", 
                    {movies: movieData.data, 
                    url:process.env.MOVIE_IMAGE_BASE_URL, 
                    category: category,
                    searchQuery: searchQuery },
          );
    
});


app.get("/movies", async(req, res) => {
  const searchQuery = null;
  const movies      = {};
  return res.render("movies/movies.ejs", {searchQuery: searchQuery, movies: movies});
})



// details page
app.get("/detail/:id/:category", async(req, res) => {
 
  const id       = req.params.id;   
  const userId   = req.session.userId;
  const category = req.params.category;;
  
  const cache    = userId ? memoryDB.getCacheByName(userId) : memoryDB.getDefaultCache();
  const movie    = new Movie(cache);

  movie.setCategory(category);
  const results = movie.getMovieByID(id);
  

  return res.render("movies/detail", { id: id, movieData: results, url: process.env.MOVIE_IMAGE_BASE_URL});

;
 
});






app.get("/latest-films", async(req, res) => {


  const url         = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';
  const data        = {}
  let movieData     = {};
  data.consoleError = "Error fetching the latest films";
  data.fetcError    = "Failed to fetch the latest films";
  data.tableName    = "latest-films";
  data.error        = data.consoleError;
  data.saveAs       = CacheSaveTypes.movies;
  const username    = req.session.userId;
  let cache         = username ? memoryDB.getCacheByName(username) : memoryDB.getDefaultCache();
  data.tableArray   =  cache.movies;
  const category    = CacheSaveTypes.movies;

  try {

    movieData = await fetchOrUseCache(url, options, req, data, memoryDB);

  } catch (error) {
    console.error(data.consoleError + error);
    return res.status(500).json({ error: "Failed to fetch your search query" });
  }
  
  return res.render("movies/films.ejs", {movies: movieData.data,
                                        category: category,
                                        url:process.env.MOVIE_IMAGE_BASE_URL })
})


app.get("/tv-shows", async(req, res) => {
  
  const url         = 'https://api.themoviedb.org/3/trending/tv/day?language=en-US';
  const data        = {};  
  const category    =  CacheSaveTypes.tvShows;   
  const username    = req.session.userId;  
  let tvShowsData   = {}
  let cache         = username ? memoryDB.getCacheByName(username) : memoryDB.getDefaultCache();
  data.consoleError = "Error fetching the latest TV shows";
  data.fetcError    = "Failed to fetch the latest show";
  data.tableName    = "tv-shows";
  data.error        = data.consoleError;
  data.saveAs       = CacheSaveTypes.tvShows;
  data.tableArray   =  cache.tvShows;
 
  try {
  
      tvShowsData = await fetchOrUseCache(url, options, req, data, memoryDB );
   
  } catch (error) {
      console.error("Error fetching movie data:", error);
    return res.status(500).json({ error: "Failed to fetch movie data" });
  }

  return res.render("movies/tv-shows.ejs", {tvShows: tvShowsData.data,
                                            category: category,
                                            url:process.env.MOVIE_IMAGE_BASE_URL })
})





app.get("/change-password", authenticateUser, async(req, res) => {
  res.render("passwords/change-password");
})

app.post("/change-password", authenticateUser,   async(req, res) => {
  res.render("passwords/change-password");
})


app.get("/forgotten-password", async(req, res) => {
  res.render("passwords/forgotten-password");
})

app.post("/forgotten-password", async(req, res) => {
  res.render("passwords/forgotten-password");
})




app.get("/logout", authenticateUser, async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/"); // Redirect to the homepage or any other page after logout
  });
});






app.post("/check-password-strength",  (req, res) => {
  
  let passwordObj = {};

  if (!req.body || !("password" in req.body)) {
    const error = {};
    error.ERROR = "Something went wrong, and the password couldn't be extracted!!";
    return res.json(error);
  } 
  
  const password = req.body.password.trim();

  if (password.length > 0) {
    const passwd = new PasswordStrengthChecker(password);
    passwordObj  = passwd.checkPasswordStrength();
   
  } 

  return res.json(passwordObj)
  
});


app.post("/is-email-unique", (req, res) => {

  if (!("email" in req.body)) {
    throw new Error("Something went wrong and the email couldn't be retrieved!!!")
  }

  // If the an obj is returned it means that the email is not unique
  // then in that case return false otherwise true

  const email     = req.body.email;
  const userCache = memoryDB.getByEmail(email);
  const userObj   = {}

  userObj.IS_EMAIL_UNIQUE = userCache === null ? true : false
  return res.json(userObj);

})


app.post("/edit-homepage-section/:id", authenticateUser, (req, res) => {
  const sectionID = req.params.id;
  const tableName = "default";
  let sectionName = null;

  switch (sectionID) {
      case "1":
          sectionName = "SectionOne";
          saveDynamicPageSection(req, sectionName, tableName, memoryDB);
          break;
      case "2":
          sectionName = "SectionTwo";
          saveDynamicPageSection(req, sectionName, tableName, memoryDB);
          break;
      case "3":
          sectionName = "SectionThree";
          saveDynamicPageSection(req, sectionName, tableName, memoryDB);
          break;
      case "4":
          sectionName = "SectionFour";
          saveDynamicPageSection(req, sectionName, tableName, memoryDB);
          break;
      default:
          res.status(400).send("Invalid section ID");
          return;
  }

  res.status(200).send("Section updated successfully");
});


app.post("/handle-form-submission", (req, res) => {

  const userForm = req.body.userForm;
  if (!userForm) {
    res.json(userForm)
    return res.status(400).send("Something went wrong and we couldn't register you");

  }

  const userFormObj = {};
  let cacheObj = memoryDB.getCacheByName(userForm.username);

 
  switch (true) {

    case cacheObj:
      userFormObj.MSG =  "Invalid - A user by that name already exists!";
      break;
    
    case cacheObj === null:
       const emailObj        = memoryDB.getByEmail(userForm.email);
       userFormObj.EMAIL_MSG = emailObj ? "Invalid - A user by that email already exists!": "Valid email address";
      
    case true:
       const passwordChecker  = new PasswordStrengthChecker(userForm.password);
       const response         = passwordChecker.isValid();
       const validPasswordMsg = "Valid password";
       const validEmailMsg    = "Valid email address";

       userFormObj.PASSWORD_MSG = response ? validPasswordMsg : "Invalid - The password doesn't meet the strength requirements";
       userFormObj.IS_SUCCESS = userFormObj.PASSWORD_MSG === validPasswordMsg && userFormObj.EMAIL_MSG === validEmailMsg;

      }

    
  return res.json(userFormObj);
})


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});