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
    static tvShows   = "tvshows";
    
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



    getAllMovies() {

        const mainSection = this._memCache.getCacheByName(CacheSaveTypes.main);
        if (mainSection) {
            const moviesArray = mainSection.movies[0].movies.results;
            const pageNumber  = mainSection.movies[0].movies.page;
            return [moviesArray, pageNumber];
        }
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
            let table = tables[this._saveAs];

            // Whenever a new item is being saved to a given table the memory database determines if there is enough
            // space to save it in that given table. If there is not enough space the DB starts from the table the user wants
            // to insert items into and starts deleting the oldest entries in order to make space for the new entry.
            //
            // However if the giventable that is going to be inserted in, it means that the room has to be made
            // else where by deleting from a different table to make space before inserting in the user's given table
            // This is done by calling this  method "this._determineTableToDelete"
            // if (table.length === 0) {
            //     table = this._determineTableToDelete(tables);
            //     console.log("getting new table..")
            // }           
            this._deleteOldestEntriesFromTable(newItem, table);
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

    /**
     * Retrieves all items from the cache belong to a specific category.
     * @returns {Array} An array of all items in the cache.
     */
    getAllItems(allCategories = true) {
        // Implementation for getting all items
    }

    /**
     * Sets the name of the storage for the cache items.
     * @param {string} name - The name of the storage.
     */
    setItemStorageName(name) {
        // Implementation for setting item storage name

        // {"TV films": [ {}, {}, {}, {} .... {}]}
    }


    /**
     * Finds items in the cache by name.
     * @param {string} name - The name to search for.
     * @param {number} limitToFetch - The maximum number of items to fetch.
     * @returns {Array} An array of items found in the cache.
     */
    static findItemsByTitle(title, limitToFetch) {
        // Implementation for finding items by name
    }

    /**
     * Finds an item in the cache by ID.
     * @param {number} id - The ID of the item to find.
     * @param {Array} movieList - The list of movies to search.
     * @returns {*} The item found in the cache, or undefined if not found.
     */
    findItemByID(id, movieList) {
        return movieList.find(obj => obj.id === id);
    }

    parseMovieResults(data) {

        if (!data) {
            return [];
        }
        // Get an array of values from the object
        const valuesArray = Object.values(data);
      
        
        for (const value of valuesArray) {
         
          if (Array.isArray(value) && value[0] && value[0].results) {
           
            return value[0].results;
          }
        }
      
        return [];
      }

    getDefaultCache() {
        const defaultCache = JSON.parse(this._memCache.cache.default);
        return defaultCache;
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

    
        if (this._cacheName.toLowerCase() === "Default Cache".toLowerCase()) {
            cache = {
                searchTerms: [], // list of objects
                parentID: this._id,
            };
        } else {
            cache = {
                searchTerms: [], // The Array reprenst a table nad list of objects 
                favourites: [], // list of objects
                ratings: [], // list of objects
                watchingList: [], // list of objects
                keyWords: [], // list of objects
                authentication: [],
                profile: [],       // list of objects  
                parentId: this._id,
            };


        }

        this._cache = cache;
        this.save();
        this._createMainTable();
    }

    /**
     * Creates the main cache containing items to be displayed on the home page.
     * This includes recommended, featured, movies, and TV shows.
     * This cache is separate from the user's personal cache.
     */
    _createMainTable() {

        const currentCacheName = this.cacheName;
        this.setCacheName("main");

        this._cache = {

            recommended: [],
            featured: [],
            movies: [],
            tvShows: [],
            homePage: [],
            API_CALLS: [],
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
        // Objective: Check if the database is nearing capacity; if so, invoke '_deleteOldestEntriesFromTable'.
        // This process systematically removes the oldest entries, ensuring at least 30% of storage is freed
        // before adding new entries. Currently, it returns false, but this check occurs at the cache level.
        // Consequently, if the database reaches full capacity, the cache ceases to accept new data.

        // This '_deleteOldestEntriesFromTable' already does it but it is not wired to this functio
        
        // Return false if there is enough space available, indicating that the storage is not at capacity
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


    /**
     * Deletes the oldest entries from the cache within the entry which is a list until enough space is available,
     *  based on timestamp.
     * If no cache data is found or no entries are present, the method does nothing.
     * @param {Object} newTableEntry - The new cache entry to be added.
     * @param {Object} tableToDeleteFrom - The cache object containing lists from which entries will be deleted.
     */
    _deleteOldestEntriesFromTable(newTableEntry, tableToDeleteFrom) {

        const removalPercentage = 0.3;  //  0.3 => 30%
        const tableIndexToDelete = 0;    // deletes the oldest from the table
  
        const spaceNeeded        = this._memCache.availableSpace - estimateObjectSize(newTableEntry);
        const totalSpaceToBeFreed = spaceNeeded + (this._memCache.availableSpace * removalPercentage) // Delete the space need + 30% of the table entry

        let running = true;

        while (running) {

            if (this._isLocalStorageAtCapacity(newTableEntry) && this._memCache.availableSpace > totalSpaceToBeFreed && tableToDeleteFrom.length > 0) {
                this._memCache.removeTableItemByIndex(tableIndexToDelete, tableToDeleteFrom);

            } else {
                running = false;

            }

        }

    }

    /**
      * Determines which table to delete based on certain criteria.
      * @param {Object} cache - The cache object containing multiple tables.
      * @returns {string} The name of the table to delete.
     */
    _determineTableToDelete(tables) {

        let tableToDelete = null;

        // Check if any table meets the criteria for deletion by deleting the user table in order of
        // list importance
        // The order of deletion is Keywords, searchTerms, ratings, watchingList, favourites

        if (tables.keyWords.length > 0) {
            tableToDelete = tables.keyWords;
        } else if (tables.searchTerms.length > 0) {
            tableToDelete = tables.searchTerms;
        } else if (tables.ratings.length > 0) {
            tableToDelete = tables.ratings;
        } else if (tables.watchingList.length > 0) {
            tableToDelete = tables.watchList;
        } else if (tables.favourites.length > 0) {
            tableToDelete = tables.watchList;
        }

        if (tableToDelete === null) {
            throw new Error("Something went wrong -- couldn't find a table to delete!!");
        }
        return tableToDelete;

    }

}


export {MemoryDB, CacheSaveTypes}


