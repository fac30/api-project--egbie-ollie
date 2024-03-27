/**
 * Formats the given date according to the specified locale.
 * @param {Date} date - The date to be formatted.
 * @param {string} [locale="en-GB"] - The locale to be used for formatting (default is "en-GB").
 * @returns {string} The formatted date string.
 */
function getFormattedDate(date, locale = "en-GB") {
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return date.toLocaleDateString(locale, options);
}



export {
    getFormattedDate,
}