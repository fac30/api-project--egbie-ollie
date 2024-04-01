/**

* Handles the response from a fetch request, updating the provided data object and saving it to memoryDB if necessary.
 * 
 * @param {Object} req - The request object containing session data.
 * @param {Response} response - The response object from the fetch request.
 * @param {Object} data - The data object to be updated with the response data.
 * @param {MemoryDB} memoryDB - The memory database object for caching data.
 * @throws {Error} Throws an error if there is an issue handling the fetch response.
 */
async function handleFetchResponse(req, response, data, memoryDB) {
    try {
        if (!response.ok) {
            data.error = data.error;
        } else {
            const objectJson = await response.json();
            data.data        = objectJson;

            if (req.session.userId) {
                memoryDB.reset();
                memoryDB.setCacheName(req.session.userId);
              
            } else {
                memoryDB.reset();
               
            }
    
            memoryDB.setSaveAs(data.saveAs);
            memoryDB.setItemToSave(data.tableName.toLowerCase(), [objectJson]);

            try {
                memoryDB.save();
            } catch (error) {
                console.log("Couldn't save data - the cache is full")
            }

            return data;
          
        }
    } catch (error) {
        console.error(data.consoleError, error);
        throw new Error(data.fetchError + error);
    }
}



/**
 * Fetches data from the given URL using the specified options or retrieves it from cache if found.
 * 
 * @param {string} url - The URL to fetch data from.
 * @param {object} options - The options object for the fetch request.
 * @param {Object} req - The request object containing session data.
 * @param {Object} data - The data object to store fetched data or cache data.
 * @param {MemoryDB} memoryDB - The memory database object for caching data.
 * @returns {Promise<Object>} A promise resolving to the fetched or cached data.
 */
async function fetchOrUseCache(url, options, req, data, memoryDB) {
    
    let storedData = {};
    let response;
    const [isFound, cacheData] = memoryDB.isSearchTermInCache(data.tableName, data.tableArray);

    try {

        if (isFound) {
            
            // Use data from cache
            storedData.data = cacheData;
            console.log("getting from fetched data in cache...")
            return storedData
           
        } else {
            // Fetch data from the API
            response  = await fetch(url, options);
            storedData = await handleFetchResponse(req, response, data, memoryDB);
            console.log("Fetching data from the API....")
        }

        // Handle error or fetch data again if necessary
        if (!response.ok) {
            storedData.error = data.error;
        } else if (!isFound) {
            response   = await fetch(url, options);
            storedData = await handleFetchResponse(req, response, data, memoryDB);
        }
        return storedData;

    } catch (error) {
        console.error("Error fetching or using cache:", error);
        throw error;
    }

   
}

export {
    fetchOrUseCache,
    handleFetchResponse,
}   