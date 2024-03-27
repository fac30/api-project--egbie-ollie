import { CacheSaveTypes } from "./cache.js";


/**
 * Saves data related to a section of a dynamic webpage.
 * @param {Object} req - The request object containing the data to save.
 * @param {string} sectionName - The name of the section to save the data to.
 * @param {string} tableName - The name of the table in the database to save the data to.
 * @param {Object} memoryDBInstance - An instance of the memory database.
 */
function saveDynamicPageSection(req, sectionName, tableName, memoryDBInstance) {
    const { title, description } = req.body;
    
    // Set the cache name and save type for the memory database
    memoryDBInstance.setCacheName(tableName);
    memoryDBInstance.setSaveAs(CacheSaveTypes.homePage);
    
    // Create an object containing the data to save
    const itemToSave = [{ title, description }];
    
    // Save the data to the specified section in the database
    memoryDBInstance.setItemToSave(sectionName, itemToSave);
    memoryDBInstance.save();
}

export {
    saveDynamicPageSection
}

