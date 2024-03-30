

### Clever Movies: Your Ultimate Movie and TV Series Companion
CleverMovies is a dynamic web application that fetches movie and TV series data from an external API and provides a personalized experience for users. With CleverMovies, you can browse through a vast collection of titles, search for specific movies or TV series, and even track your favorites.

### Features
 - **Browse and Search**: Easily explore a wide range of movies and TV series using the search bars even a  guest.
 - **Details**: Provides detailed information about each movie, including title, release year, plot summary, and more.
  - **Personalized Experience**: Create an account to save your favorite movies, rate them, etc.
 - **Administrator Privileges**: Admin users can manage the website's content globally, making changes to the homepage and other sections as needed
- Displays a collection of movies on the homepage.

### Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
 - **Database**: Custom caching system implemented for efficient data management and retrieval (data is persistent only while the app is running).
 - **External AP**I: TMBD (The Movie Database) API
 - 
 
Get Started
- Head over to https://www.themoviedb.org/signupand and sign up. 
- You will then receive two keys an **API Key** and **API Read Access Token**

Next clone the repository
```sh
    git clone https://github.com/fac30/api-project--egbie-ollie .
```

Install the necessary dpendencies:
```sh
    npm install
```

Next we need to generate a session key?
#### What is a session key
##### Session Keys in Web Development  
 - In web development, session keys serve as unique identifiers assigned to each user's session. These keys are essential for maintaining session state and enabling stateful interactions between the client and server.

##### Key Functions:

 -  **Identification**: Session keys uniquely identify each user's session. They allow the server to recognize returning users and associate subsequent requests with the correct session.

 - **Authentication**: Session keys are often used in authentication processes. Once a user logs in, a session key is generated and stored on the client side. This key is then used to authenticate subsequent requests from the same user
  
 - **Authorization**: Session keys enable the server to authorize access to protected resources based on the user's session. Authorized actions and resources are associated with specific session keys.

 -  **State Management**: Session keys facilitate the storage and retrieval of session-specific data on the server side. This data may include user preferences, shopping cart items, and other session-related information.   



Next run the html file called **secretKeyGenerator.html** either by live search or by opening it up in the browser. It should look like this:


### Generator session key page
![Image Description](https://drive.google.com/uc?id=1accTVxC3a5gBHg-70HcIbMWzXU9iaxs6)


#### Now use that newly generate key and open an .env file and enter into the following fields. Your .env file should look something like this

``` sh
 

MOVIE_API_KEY                 = 
MOVIE_API_READ_ACCESS_TOKEN   = 
SECRET_KEY                    =


PORT                   = 3000
MOVIE_DATABASE_URL     = https://api.themoviedb.org/3
MOVIE_IMAGE_BASE_URL   = https://image.tmdb.org/t/p/original

```


#### Once done run the command
``` sh
  npm run dev
```

#### Next enter the url
``` sh
  http:127.0.0.1:3000
```

#### If everything is okay you will see the following pages when you click on the various links


### Home page

![Home Page Description](https://drive.google.com/uc?id=1zpPFMeiSCQF7Ygdl-shUXDM5PznDCsRQ)



### TV shows

![TV shows page](https://drive.google.com/uc?id=1VYqbaa9ofojJXG4HMuwAwwxoqbHY2pt1)



### Latest films

![Image Description](https://drive.google.com/uc?id=1VcQMqjPjGS17Ps-A7ltKQNzL-FsCs22J)


### To be continued....
### Will upload the changes I have made to website after I complete the readme.md



