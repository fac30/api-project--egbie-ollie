
// import { v4 as uuidv4 } from 'uuid';

/**
 * A class representing an in-memory cache with a size limit.
 */
class MemoryCache {
    /**
     * Constructs a new MemoryCache object with a specified size limit.
     * @param {number} sizeInMB - The size limit of the cache in megabytes (default is 5MB).
     */
    constructor(sizeInMB = 5, ) {
        this.cache = {};
        this._localStorageSize = sizeInMB * 1024 * 1024; // 5MB
        this._spaceUsed = 0;
        this.id = null;
 
    }

    setID(id) {
        this.id = id;
    }

    /**
     * Retrieves an item from the cache with the specified key.
     * @param {string} key - The key of the item to retrieve.
     * @returns {*} The value associated with the key, or undefined if the key does not exist.
     * @throws {Error} If the key does not exist in the cache.
     */
    getItem(key) {

        if (!(key in this.cache)) {
            throw new Error(`Key '${key}' not found in cache.`);
        }
        return JSON.parse(this.cache[key]);

    }

    /**
     * Adds an item to the cache with the specified key and value.
     * @param {string} key - The key under which to store the value.
     * @param {*} value - The value to be stored in the cache.
     * @throws {Error} If the cache size limit would be exceeded by adding the new item.
     */
    setItem(key, value) {
        if (!(key && value)) {
            throw new Error("The key or value cannot be empty!!")
        }
        if (this.spaceUsed + estimateObjectSize(value) > this.localStorageSize) {
            throw new Error("Cache size limit exceeded. Unable to add item.");
        }

        if (this.id === null) {
            throw new Error("There is no ID associated with the cache. Set an ID before setting an item");
        }
        // Add item to cache
        this.cache[key] = JSON.stringify(value);
        this._spaceUsed += estimateObjectSize(value);
    }

    /**
     * Removes the item with the specified key from the cache.
     * @param {string} key - The key of the item to remove from the cache.
     * @throws {Error} If the key does not exist in the cache.
     */
    removeItem(key) {

        if (!(key in this.cache)) {
            throw new Error(`Key '${key}' not found in cache. Unable to remove.`);
        }

        // Remove item from cache
        const removedItemSize = estimateObjectSize(this.cache[key]);
        delete this.cache[key];
        this._returnRemovedItemSpace(removedItemSize);
    }

    removeTableItemByIndex(index, tableToRemeove) {
        if (!Array.isArray(tableToRemeove)) {
            throw new Error("The tableToRemove is not an Array");
        }

        if (tableToRemeove.length === 0) {
            return;
        }

        const entry = tableToRemeove[index];
        if (!entry) {
            return 0;
        }

        // Check if the parent id matches this meme cache otherwise the table doesn't belong to memeCache 
        if (entry.parentID !== this.id) {
            throw new Error("The table entry doesn't belong to parent cache")
        }

        this._returnRemovedItemSpace(entry);
        tableToRemeove.splice(index, 1);      // Remove the entry from table
      
    }

    _returnRemovedItemSpace(entry) {
        const size = estimateObjectSize(entry);
        this._spaceUsed -= size; // Add the size of the object back to space used  

    }
    /**
     * Sets the size limit of the cache.
     * @param {number} sizeInMB - The new size limit of the cache in megabytes.
     * @throws {Error} If the specified size is not a valid number or exceeds the maximum size limit.
     */
    setSize(sizeInMB) {
        if (typeof sizeInMB !== "number" || !Number.isInteger(sizeInMB)) {
            throw new Error("The size limit must be an integer number in megabytes");
        }

        if (sizeInMB <= 0) {
            throw new Error("The size limit must be a positive number");
        }

        if (sizeInMB > this._localStorageSize / (1024 * 1024)) {
            throw new Error("The size limit cannot exceed the maximum limit of 5MB");
        }
      
        this._localStorageSize = sizeInMB * 1024 * 1024;
      
    }

    /**
     * Retrieves the current availabe space of the cache in bytes.
     * @returns {number} The current size of the cache in bytes.
    */
    get availableSpace() {
        return this._localStorageSize - this._spaceUsed;
    }

    get spaceUsed() {
        return this._spaceUsed;
    }

    get localStorageSize() {
        return this._localStorageSize;
    }

    /**
     * Retrieves the current available space of the cache in MB.
     * @returns {number} The current size of the cache in megabytes.
     */
    toMB() {
        const MB = 1024
        return this.availableSpace / (MB * MB)
    }



}


/**
    * Estimates the size of a list of objects in bytes.
    * @param {Array} list - The list of objects to estimate the size of.
    * @returns {number} The estimated size of the list in bytes.
    */

function estimateListSize(elemArray) {

    console.log(typeof elemArray);
    if (elemArray.length === 0) {
        return 0;
    }
    let totalSize = 0;
    elemArray.forEach(item => {
        totalSize += this._estimateObjectSize(item);
    });
    return totalSize;
}


/**
 * Estimates the size of an object in bytes by converting it to a JSON string.
 * @param {Object} obj - The object to estimate the size of.
 * @returns {number} The estimated size of the object in bytes, or -1 if an error occurs.
 */
function estimateObjectSize(obj) {
    try {
        if (!obj) {
            return 0;
        }
        const jsonString = JSON.stringify(obj);
        const sizeInBytes = new Blob([jsonString]).size;

        return sizeInBytes;
    } catch (error) {
        console.error("Error estimating object size:", error);
        return -1; // Return -1 to indicate an error
    }
}




export {
    MemoryCache,
    estimateListSize,
    estimateObjectSize
};
