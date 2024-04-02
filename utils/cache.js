import { estimateObjectSize } from "./memCache.js";

import { v4 as uuidv4 } from 'uuid';



/**
 * Class representing cache save types for the CacheManager class.
 * Encapsulates constants for different types of data to be saved in the cache.
 */
class CacheSaveTypes {
    /**
     * Initializes constants for different types of data to be saved.
     */
    static search = 'searchTerms';
    static favourites = 'favourites';
    static ratings = 'ratings';
    static watchList = 'watchingList';
    static authentication = 'authentication';
    static profile = 'profile';
    static homePage = 'homePage';
    static API_CALLS = "API_CALLS";
    static main      = "main";
    static movies    = "movies";
    static tvShows   = "tvShows";
    
}



class MemoryDB {
    /**
     * Constructs a new Cache object.
     * @param {MemoryCache} mainCache - An instance of MemoryCache to be used as the main cache storage.
     * @param {string} [defaultCacheName="Default"] - The default name of the cache.
     */
    constructor(memCache, defaultCacheName = "Default") {

        this._cacheName = defaultCacheName;
        this._filter_flags = {};
        this._localCache = {};
        this._saveAs = null;
        this._memCache = memCache;
        this._id = null;

        if (typeof this._memCache.cache !== "object") {
            throw new Error("The cache must be an instance of an object the cache")
        }
        this._generateID(); // Creates a unique ID for the DB 
        this._memCache.setID(this._id);

    }

    /**
     * Create an id for the table
     */
    _generateID() {
        this._id = uuidv4();
    }

    /**
     * Gets the name of the cache.
     * @returns {string} The name of the cache.
     */
    get cacheName() {
        return this._cacheName.toLowerCase();
    }


    /**
     * Sets the name of the cache.
     * @param {string} name - The new name for the cache.
     */
    setCacheName(name) {
        if (name) {this._cacheName = name.toLowerCase()}
        
    }

    getByEmail(email) {
        
        for (const key in this._memCache.cache) {
            if (Object.hasOwnProperty.call(this._memCache.cache, key)) {
                const userData = this._memCache.cache[key];
                if (userData && userData.authentication) {
                    for (const authData of userData.authentication) {
                        if (email.toLowerCase() === authData.email.toLowerCase()) {
                            return authData;
                        }
                    }
                }
            }
        }
        return null;
    }
    
    
    isSearchTermInCache(searchTerm, tableToSearch) {
        
        if (!Array.isArray(tableToSearch)) {
            throw new Error("The table must be an Array!!")
        }
        for (const tableObj of tableToSearch) {
            if (searchTerm.toLowerCase() in tableObj) {
                return [true, tableObj[searchTerm.toLowerCase()][0]];
            }
        }
        return [false, {}];
    }

    /**
    * Sets the save type for the item to be saved. This ensures that when the item
    * is saved using the save method it is stored in the right table
    * @param {string} saveAs - The type of data to save.
    */
    setSaveAs(saveAs) {
        this._saveAs = saveAs;
    }


    /**
     * Sets an item to be saved in the cache.
     * @param {string} key - The key under which the item will be saved.
     * @param {*} item - The item to be saved.
    */
    setItemToSave(key, item) {

        if (!this._saveAs) {
            console.error('Save type not specified.');
            return;
        }

        const tables = this.getCacheByName(this._cacheName);
        if (!tables) {
            return;
        }

        // Create a new entry
        const date = new Date();
        

        const newItem = { [key.toLowerCase()]: item, timeStamp: date.getTime(), parentID: this._id };

        // Check if adding the new item exceeds localStorage limit
        const atCapacity = this._isLocalStorageAtCapacity(newItem);
        if (atCapacity) {
           
            // Will implement later
            // Goal whenever a user storage has reached it limits a message will
            // be sent to the user in the admin dashboard informing them that they
            // will no longer be able to add anymore storage and they should delete
            // some items.
        }


        // Save the new item based on the specified save type
        this._saveItemToSpecifiedTable(tables, newItem);
    }

    /**
     * Saves the new item in the cache based on the specified save type.
     * @param {Object} tables - The existing user cache object.
     * @param {Object} newItem - The new item to be saved.
    */
    _saveItemToSpecifiedTable(tables, newItem) {
        switch (this._saveAs) {
            case CacheSaveTypes.search:
                tables.searchTerms.push(newItem);
                break;
            case CacheSaveTypes.favourites:
                tables.favourites.push(newItem);
                break;
            case CacheSaveTypes.ratings:
                tables.ratings.push(newItem);
                break;
            case CacheSaveTypes.watchList:
                tables.watchingList.push(newItem);
                break;
            case CacheSaveTypes.keyWords:
                tables.keyWords.push(newItem);
                break;
            case CacheSaveTypes.authentication:
                tables.authentication.push(newItem);
                break;
            case CacheSaveTypes.profile:
                tables.profile.push(newItem);
                break;
            case CacheSaveTypes.homePage:
                tables.homePage.push(newItem);
                break;
            case CacheSaveTypes.API_CALLS:
                tables.API_CALLS.push(newItem);
            case CacheSaveTypes.movies:
                tables.movies.push(newItem);
            case CacheSaveTypes.tvShows:
                tables.tvShows.push(newItem)
        }
        // Update the cache
        this._cache = tables;
    }

    /**
    * Saves the item in the cache.
    */
    save() {

        if (Object.keys(this._cache).length === 0) {
            return;
        }

        this._memCache.setItem(this._cacheName.toLowerCase(), this._cache);
        this._clearLocalCache();              // Clear the local cache to ensure we not saving any data that already saved
    }


    /**
    * Retrieves a cache from localStorage based on the specified cache name.
    * @param {string} cacheName - The name of the cache to retrieve from localStorage.
    * @returns {Object|null} The retrieved cache object, or null if the cache does not exist or an error occurs.
    */
    getCacheByName(cacheName) {
        try {
            return this._memCache.getItem(cacheName.toLowerCase());
        } catch (error) {
            console.error('Error while retrieving cache:', error.message);
            return null;
        }
    }


    getDefaultCache() {
        return JSON.parse(this._memCache.cache.default);
    }


    /**
     * Resets the cache to its initial state.
     * @param {string} [newName="Default Cache"] - The new name for the cache.
     */
    reset(newName = "default") {
        this._cacheID = null;
        this._cacheName = newName;
    }


    /**
     * Creates the caches based on the specified cache name.
     * If the cache name is "Default Cache", it creates a basic cache structure.
     * Otherwise, it creates a cache structure with various categories.
     * The created cache is then saved.
     */
    createTables() {

        if (!this._cacheName) {
            throw new Error("The Cache name cannot be empty");
        }

        const cacheObj = this.getCacheByName(this._cacheName);

        // we only want to create a cache if it doesn't already exists
        if (cacheObj) {
            return;
        }

        let cache = [];

        this._createDefault();
        if (this._cacheName.toLowerCase() != "default".toLowerCase()) {
            cache = {
                searchTerms: [], // The Array reprenst a table nad list of objects 
                favourites: [], // list of objects
                ratings: [], // list of objects
                watchingList: [], // list of objects
                keyWords: [], // list of objects
                authentication: [],
                movies: [],
                tvShows: [],
                profile: [],       // list of objects  
                parentId: this._id,
            };

        }

        this._cache = cache;
        this.save();

    }

    /**
     * Creates the main cache containing items to be displayed on the home page.
     * This includes recommended, featured, movies, and TV shows.
     * This cache is separate from the user's personal cache.
     */
    _createDefault() {

        const currentCacheName = this.cacheName;
        this.setCacheName("default");

        this._cache = {
            searchTerms: [], // list of objects
            movies: [],
            tvShows: [],
            homePage: [],
            parentId: this._id

        };

        this.save();
        this.setCacheName(currentCacheName);
    }

    _clearLocalCache() {
        this._cache = {}
    }

    /**
     * Checks if adding a new item to localStorage exceeds the storage limit.
     * If space available returns false or true.
     * @param {Object} newItem - The new item to be added to localStorage.
     * @throws {Error} If the newItem parameter is not an object.
     */
    _isLocalStorageAtCapacity(newItem) {
        if (typeof newItem !== "object") {
            throw new Error("The new item must be an object!!");
        }
       
        
        // Deferred implementation for later optimization.
        // Will Check if the cache is full. If the cache is full will alert the user
        // and the user will chose what data to delete from the table
        // For now it returns false
        // The user will be able to delete from any table except for authentication and profile
        
        return false;
    }


    /**
     * Retrieves the maximum size of the cache from localStorage.
     *
     * @returns {number} The maximum size of the cache.
     */
    get maximumSize() {
        return this._memCache.localStorageSize;
    }


    /**
     * Retrieves the remaining space available in the cache.
     *
     * @returns {number} The remaining space available in the cache.
     */
    get remainingSpace() {
        return this._memCache.availableSpace;
    }


  
}


export {MemoryDB, CacheSaveTypes}


