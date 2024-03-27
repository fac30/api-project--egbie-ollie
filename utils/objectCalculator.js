/**
 * Estimates the size of an object in bytes by converting it to a JSON string.
 * @param {Object} obj - The object to estimate the size of.
 * @returns {number} The estimated size of the object in bytes.
 */
function estimateObjectSize(obj) {
    const jsonString = JSON.stringify(obj);
    const sizeInBytes  = new Blob([jsonString]).size;
    return sizeInBytes;
  }
  

  

  module.exports = {
    estimateObjectSize
  };
  