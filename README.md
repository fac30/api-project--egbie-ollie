

### Clever Movies: Your Ultimate Movie and TV Series Companion
CleverMovies is a dynamic web application that fetches movie and TV series data from an external API and provides a personalized experience for users. With CleverMovies, you can browse through a vast collection of titles, search for specific movies or TV series, and even track your favourites.

### Features
 - **Browse and Search**: Easily explore a wide range of movies and TV series using the search bars even a  guest.
 - **Details**: Provides detailed information about each movie, including title, release year, plot summary, and more.
  - **Personalized Experience**: Create an account to save your favourite movies, rate them, etc.
 - **Administrator Privileges**: Admin users can manage the website's content globally, making changes to the homepage and other sections as needed
- Displays a collection of movies on the homepage.

### Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
 - **Database**: Custom caching system implemented for efficient data management and retrieval (data is persistent only while the app is running).
 - **External AP**I: TMBD (The Movie Database) API
 - 

ADD MENU HERE


## Things Todo

### Making the Site Responsive

 - Currently the site it is not resonsive and doesn't dapts seamlessly to different screen sizes, such as those of mobile phones, tablets, and desktops.


### Converting px to rem

Currently the site is using px which is fixed in value and doesn't scale across different screens. This will be converted to rems to ensure that text and other elements adjust proportionally based on the user's preferred font size settings and device characteristics.


#### Tidy Up CSS:

- **Remove Redundant Styles**: Identify and eliminate redundant or unused CSS rules to reduce file size and improve loading times.

- **Consolidate Similar Styles**: Merge similar styles into reusable classes or components to avoid duplication and streamline code maintenance.

- **Optimize Selectors**: Use efficient CSS selectors to target elements more precisely and minimize the browser's rendering workload.

- **Group Related Styles**: Organize CSS rules logically by grouping related styles together, such as layout, typography, and colors, to improve code clarity and maintainability.

- **Commenting**: Add descriptive comments to clarify the purpose and functionality of different sections or styles within the stylesheet, facilitating easier navigation and understanding
 
### Future Site Enhancements
- Allow users to choose which cache to delete from in order to free up space.
- Enable users to add movies/TV shows to their favourites by clicking the favourite icon.
- Implement a rating system for movies/TV shows, allowing users to rate their viewing experience.
- Provide users with the ability to view or delete items stored in their search cache, currently the user can only see the number of search they have made in dashboard.
- Allow users to manage their favoirite items by viewing or deleting them from their cache, alongside displaying the total count of favourite items.
- Enable users to view and manage their movie/TV show ratings, including the option to delete them.
- Display the number of API calls made to provide transparency to users regarding data retrieval.

### Add some tests


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

![TV shows page](https://drive.google.com/uc?id=1Mrg72dHrsGZPHGG_10nVE_3aCYD4rN8C)



### Latest films

![Image Description](https://drive.google.com/uc?id=1VcQMqjPjGS17Ps-A7ltKQNzL-FsCs22J)


### Search content
![Image Description](https://drive.google.com/uc?id=19gT-6Q_4fuOSSpXoDoNXBMZKYSJUoy_0)



### Dynamic Film and TV Show Pages

Apart from the home page, the Film and TV show pages are dynamically generated and fetched from an API. When you first start the server, the application checks its cache for any existing films and TV shows. If the cache is empty, it queries the API to populate it, before storing the retrieved data in the cache.

Once the application is running, any requests for the TV shows and Film pages are served directly from the cache. This caching mechanism ensures that the server does not repeatedly reach out to the API for the same data, significantly improving performance and reducing unnecessary API calls. This is also done for any searches you have done


### Register ensuring that you use only the strongest password.
![Register](https://drive.google.com/uc?id=1aaxhS3HfpSXJTEyQv0EGKNYLi0ph021h)


### Checks your password before allowing entry
![Ilogin](https://drive.google.com/uc?id=1B_3GfivfHjbm73wLf2RL2dw_DskYQCF7)


### Anti-brute force attack

#### What is a brute force attack?
A brute force attack is a method used by attackers to gain unauthorized access to a system or data by systematically trying all possible combinations of characters, typically passwords or encryption keys. Attackes employ techniques like rainbow tables or dictionary attacks, which contain precomputed hashes or commonly used passwords (thousands), brute force attacks involve exhaustive searching. This attack is usually automated, allowing attackers to rapidly test numerous combinations until the correct one is found. If you password word is weak or can be found in the dictionary then your system is vulnerable to brute force attacks, to counteract this security measures are placed to ensure that an account lockout policies or rate limiting to mitigate the risk. These measures work by restricting the number of login attempts within a given time frame, thereby slowing down or deterring brute force attacks. The given time frame increase each time a user gets the password wrong

![Ianti-brute force](https://drive.google.com/uc?id=1QyLDUeeYWy05cW_0bUgqVW-4VXcxP99y)



### Landing page
![Image Description](https://drive.google.com/uc?id=1LI3hEc7JEclL2nHhbMug5aF5jhCn_AGs)




### Additional message
Finish the rest of Readme to go here
