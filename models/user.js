import { CacheSaveTypes } from "../utils/cache.js";
import { getFormattedDate } from "../utils/dates.js";


class User {
    constructor(memDB=null) {

        this.memDB     = memDB;
        this.isAdmin    = null;
        this.dateJoined = null;
        this.username   = null;
        this.email      = null;
        this.isActive   = null;
        this.password   = null;
        this._searchTerms = null;
        this._favourites = null;
        this._ratings    = null;
        this._watchingList = null;
        this._keywords  = null;
        this._API_CALLS = null;
        this._isCreateNewCalled = false;

        this._objToSave = {};

    }

    static setDataFromCache(cache) {
        if (typeof cache != "object") {
            throw new Error("The cache must be an object!!")
        }
        const userObj = cache?.authentication[0]?.authentication[0];
       
        const user = new User(cache);
              user.dateJoined  = userObj.joined;
              user.username   = userObj.username;
              user.email = userObj.email;
              user.password = userObj.password;
              user.isActive = userObj.isActive;
              user.isAdmin = userObj.isAdmin;
            
              user._setSearchTerms(cache.searchTerms);
              user._setRatings(cache?.ratings);
              user._setFavourites(cache?.favourites);
              user._setWatchList(cache?.watchingList);
              user._setKeywords(cache?.keywords);

              return user;  // return an instance of the class
            
             
    }

    static createNewUser(cacheDB, username) {

        cacheDB.reset();
        cacheDB.setCacheName(username);
        cacheDB.createTables();
        cacheDB.setSaveAs(CacheSaveTypes.authentication);
        
        const user              = new User(cacheDB);
        const date              = new Date();
        user._objToSave.joined  = getFormattedDate(date);
        user._isCreateNewCalled = true;
        return user;
       
    }

    setUsername(username) {
        this._objToSave.username = username;
    }

    setEmail(email) {
        this._objToSave.email = email;
    }

    setPassword(password) {
        this._objToSave.password = password;
    }

    setIsAdmin(isAdmin=true) {
        this._objToSave.isAdmin = isAdmin;
    }

    setActive(isActive=true) {
        this._objToSave.isActive = isActive;
    }
    

    _setSearchTerms(searchTerms) {
        this._searchTerms = searchTerms;
    }

    _setRatings(ratings) {
        this._ratings = ratings;
    }

    _setFavourites(favourites) {
        this._favourites = favourites;
    }

    _setWatchList(watchList){
        this._watchingList = watchList;
    }

    _setKeywords(keyWords) {
        this._keywords = keyWords;
    }
    /**
     * Counts the number of search terms.
     * @returns {number} The number of search terms.
    */
    countSearchTerms() {
        return this._searchTerms.length;
    }

    /**
     * Counts the number of favourites.
     * @returns {number} The number of favourites.
     */
    countFavourites() {
        return this._favourites.length;
    }

    /**
     * Counts the number of ratings.
     * @returns {number} The number of ratings.
     */
    countRatings() {
        return this._ratings.length;
    }

    /**
     * Counts the number of watchlist items.
     * @returns {number} The number of watchlist items.
     */
    countWatchlistItems() {
        return this._watchingList.length;
    }

    /**
     * Counts the number of API requests.
     * @returns {number} The number of API requests.
     */
    countAPIRequests() {
        return this._API_CALLS === null ? 0 : this._API_CALLS
    }

    save() {

        if (!this._isCreateNewCalled) {
            throw new Error("The create new User must be called and the instance returned used")
        }
        this.setActive();
        this.setIsAdmin();
        this.memDB.setItemToSave(CacheSaveTypes.authentication, [this._objToSave]); // Table to save to
        this.memDB.save();

        return User.createNewUser(this.memDB, this.username);
       
    }



}

export default User;