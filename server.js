import fetch from "node-fetch"; // for HTTP requests
import express from "express"; // for HTTP requests
import session from 'express-session';


import bodyParser from 'body-parser';
import path from "path";
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
import { getOptions } from './utils/getFetchOptions.js';
import { getFormattedDate } from "./utils/dates.js";



import { PasswordStrengthChecker, PasswordImplementer} from "./utils/password.js";
import { MemoryCache } from "./utils/memCache.js";
import {MemoryDB, CacheSaveTypes} from "./utils/cache.js";
import { saveDynamicPageSection } from "./utils/pageSectionService.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

let memoryDB   = null;


// Serve static files from the "static" directory
app.use(express.static(path.join(__dirname, "public")));




// render where we want to serve the files
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



import rateLimit from 'express-rate-limit';
import { cache } from "ejs";

// Create a rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,      // 15 minutes
  max: 100,                      // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Apply the rate limiter to all requests
app.use(limiter);

// Session Middleware
app.use(session({
  secret: 'your-secret-key',  // replace this with a real key
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
    
    // memoryDB.setSaveAs(CacheSaveTypes.API_CALLS);

    // const API_INFO = {API_NAME: "TMDB API", 
    //                  noOfRequestsMade: 0,
    //                  MOVIE_API_KEY: process.env.MOVIE_API_KEY,
    //                  MOVIE_API_READ_ACCESS_TOKEN: process.env.MOVIE_API_READ_ACCESS_TOKEN,
    //                  MOVIE_DATABASE_URL: process.env.MOVIE_DATABASE_URL,
    //                  MOVIE_IMAGE_BASE_URL: process.env.MOVIE_IMAGE_BASE_URL
    //                 }

    // const itemObjectToSave = [API_INFO]

    // memoryDB.setItemToSave("API_INFO", itemObjectToSave)
    // memoryDB.save();
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
const MOVIE_API_KEY    = process.env.MOVIE_API_KEY;
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




app.post("/movies", async (req, res) => {

  const searchQuery = req.body.search;
  const url  = `https://api.themoviedb.org/3/search/movie?query=${searchQuery}&include_adult=false&language=en-US&page=`;


  const movieData = {}
  const response = await fetch(url, options);
  
      try {
        if (!response.ok) {
          movieData.error =  "Something went wrong and we couldn't find your search";
        } else {
          const movieJson = await response.json();
          movieData.data  = movieJson;
          // console.log(movieData.data)

          if (req.session.userId) {
            memoryDB.reset();
            memoryDB.setCacheName(req.session.userId);
            memoryDB.setSaveAs(CacheSaveTypes.search);

            const movie = movieData.data.results.search((movie) => {
              
            })
            memoryDB.setItemToSave(searchQuery, [ movieJson])
       
         } else {
             memoryDB.reset();
             memoryDB.setSaveAs(CacheSaveTypes.search);
             memoryDB.setItemToSave(searchQuery.toLowerCase(), [ movieJson])
            

           
             console.log(memoryDB.cache);
             console.log("here")
         }
         memoryDB.save();

        
        }
      } catch (error) {
        console.error("Error fetching movie data:", error);
        res.status(500).json({ error: "Failed to fetch movie data" });
      }
    

    res.render("movies/movies", 
          {movies: movieData.data, url:process.env.MOVIE_IMAGE_BASE_URL, searchQuery: searchQuery },
          );
    
});




app.get("/movies", async(req, res) => {
  return res.render("movies/movies");
})



app.get("/detail/:id", async(req, res) => {
 
  const id     = req.params.id; // Access the ID from the UR 
  const userId = req.session.userId;

  let cache;
  let search;
  
  if (userId) {
     cache = memoryDB.getCacheByName(req.session.userId);
     search = cache.searchTerms;
  } else {
   
    cache = memoryDB.getDefaultCache();
    search = cache.searchTerms;
    
  }


  if (search) {
    
    
    search = search[0];
    const result = memoryDB.parseMovieResults(search);
    search = result.length > 0 ? result[0] : []

  }
 
  return res.render("movies/detail", { id: id, movieData: search, url: process.env.MOVIE_IMAGE_BASE_URL});
;
 
});


app.get("/", async (req, res) => {
 
  const tableName = "main";
  const mainCache = memoryDB.getCacheByName(tableName);

  if (!mainCache) {
    res.status(500).send("Something went wrong!");
  }
  
  const sectionArray  =  mainCache?.homePage;

  if (!sectionArray) {
    res.status(404).send("Something went wrong!!");
  }

  // console.log(memoryDB)
  return res.render("index", { sectionArray: sectionArray});
});


app.get("/landing-page", async(req, res) => {
  res.render("landing-page");
})


app.get("/admin", authenticateUser, async(req, res) => {

  const user = memoryDB.getCacheByName(req.session.userId);
 
  if (!user) {
    return res.status(500).send("Something went wrong!!");
  }

  const userAuth = user.authentication[0].authentication[0];
  
  res.render("admin/admin",  {joined: userAuth.joined, 
                              hashedPassword: userAuth.password,
                              email: userAuth.email,
                              remainingSpace: memoryDB.remainingSpace,
                              maximumSize: memoryDB.maximumSize,
                              noOfSearchTermsMade: user.searchTerms.length,
                              ratings: user.ratings.length,
                              favourites: user.favourites.length,
                              watchList: user.watchingList.length,
                              NO_OF_API_REQUESTS: 0,
                              
                          });
})



app.post("/admin", authenticateUser, async(req, res) => {
  res.render("admin/admin");
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

app.get("/login", isAuthenticated, async(req, res) => {
  let invalid;
  res.render("authentication/login", {invalid: invalid});
})


app.get("/logout", isAuthenticated, async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/"); // Redirect to the homepage or any other page after logout
  });
});


app.post("/admin-form",  async(req, res) => {
  

  const username = req.body.username;
  const password = req.body.password;
  let invalid;

  const userObj = memoryDB.getCacheByName(username);
  if (userObj) {
    let user =  userObj.authentication[0].authentication;

    user = user[0]
    
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



app.post("/login", isAuthenticated, async(req, res) => {

  const username = req.body.username;
  const password = req.body.password;
  let invalid;

  const userObj = memoryDB.getCacheByName(username);

  if (userObj) {
      let user =  userObj.authentication[0].authentication;

      user = user[0]
      
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


app.get("/register", isAuthenticated, async(req, res) => {
  res.render("authentication/register");
})



app.post("/register", async(req, res) => {

  const form = req.body;

  if (!form) {
    return res.status(400).send("No form data provided");
  }
   
    memoryDB.reset();
    memoryDB.setCacheName(form.username);
    memoryDB.createTables();
    memoryDB.setSaveAs(CacheSaveTypes.authentication);

    const passwordImplementer = new PasswordImplementer(form.password);
    const date = new Date();

    const userObj = {

      username : form.username,
      email    : form.email,
      joined   : getFormattedDate(date),
      isAdmin  : true,
      isActive : true,
     
    }

    try {
      const hashedPassword =  await passwordImplementer.hashPassword();
      userObj.password     =  hashedPassword;

    } catch (error) {
      res.status(500).send(`Something went wrong couldn't encrypt the password! ${error}`);
    } 

    // main.authentication[{authentication : [{}]}]
    memoryDB.setItemToSave(CacheSaveTypes.authentication, [userObj]); // Table to save to
    memoryDB.save();

    return res.redirect("/login");


})


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
  const tableName = "main";
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