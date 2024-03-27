const viewPersonalDetailsElement          = document.querySelector(".view-personal-info-link");
const viewPersonalDetailsSubMenuElement   = document.querySelector(".personal-details-sub-menu");
const homePageElement                     = document.querySelector(".home-page-link");
const homePageSubMenuElement              = document.querySelector(".home-page-sub-menu");
const successMessageElement               = document.querySelector(".success-msg");
const sectionOneFormElement               = document.querySelector(".section-1-form");
const sectionTwoFormElement               = document.querySelector(".section-2-form");
const sectionThreeFormElement             = document.querySelector(".section-3-form");
const sectionFourFormElement              = document.querySelector(".section-4-form");
const spinner                             = document.querySelector(".user-info .spinner");
const errorMessageElement                 = document.querySelector(".error-msg");



/**
 * toggle the appearance of personal details and manages the clicked state accordingly.
 * 
 * When the specified element is clicked, this function toggles the appearance
 * of personal details and updates the clicked state accordingly. It applies
 * different styles and text content to the element based on the current clicked state.
 * 
 * @param {HTMLElement} viewPersonalDetailsElement - The HTML element representing
 *     the clickable area for viewing personal details.
 * @param {HTMLElement} viewPersonalDetailsSubMenuElement - The HTML element representing
 *     the submenu area containing personal details.
 * @returns {void}
 * 
 * @description This function uses an Immediately Invoked Function Expression (IIFE)
 *     to create a local scope for the 'clicked' variable, preventing it from polluting
 *     the global scope.
 */
(function togglePersonalDetailsSection() {
    let clicked = true; 

    viewPersonalDetailsElement.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Define an object to store element references and messages
        const elementObj = {
            mainLinkElement: viewPersonalDetailsElement,
            subMenuElement: viewPersonalDetailsSubMenuElement,
            openMessage   : "Close Personal Details",
            closeMessage  : "Personal Section",
        }

        // Call the helper function to handle the click event
        clicked = handleClickedHelper(clicked, elementObj); 
    });

})();

/**
 * toggle the appearance of homepage section and manages the clicked state accordingly.
 * 
 * When the specified element is clicked, this function toggles the appearance
 * of homepage section and updates the clicked state accordingly. It applies
 * different styles and text content to the element based on the current clicked state.
 * 
 * @param {HTMLElement} homePageElement - The HTML element representing
 *     the clickable area for accessing the homepage section.
 * @param {HTMLElement} homePageSubMenuElement - The HTML element representing
 *     the submenu area containing the homepage section details.
 * @returns {void}
 * 
 * @description This function uses an Immediately Invoked Function Expression (IIFE)
 *     to create a local scope for the 'clicked' variable, preventing it from polluting
 *     the global scope.
 */
(function toggleHomePageSection() {
    let clicked = true; 

    homePageElement.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Define an object to store element references and messages
        const elementObj = {
            mainLinkElement: homePageElement,
            subMenuElement: homePageSubMenuElement,
            openMessage   : "Edit Home Section",
            closeMessage  : "Homepage Section",
        }

        // Call the helper function to handle the click event
        clicked = handleClickedHelper(clicked, elementObj); 
    });

})();

// handleClicked function definition
function handleClickedHelper(clicked, elementObj) {
   
    
    if (!(elementObj.mainLinkElement && elementObj.subMenuElement)) {
        throw new Error("The value elements required to open the submenu couldn't be found!!!");
    }

    // Toggle styles and text content based on the current clicked state
    if (clicked) {
        elementObj.mainLinkElement.classList.remove("dashboard-bg");
        elementObj.mainLinkElement.classList.add("background-active");
        elementObj.subMenuElement.classList.add("active");
        elementObj.mainLinkElement.textContent = elementObj.openMessage;
    } else {
        elementObj.subMenuElement.classList.remove("active");
        elementObj.subMenuElement.classList.remove("background-active");
        elementObj.mainLinkElement.classList.add("dashboard-bg");
        elementObj.mainLinkElement.textContent = elementObj.closeMessage;
    }

    return !clicked;
}


sectionOneFormElement.addEventListener("submit", handleSectionOneSubmission);
sectionTwoFormElement.addEventListener("submit", handleSectionTwoSubmission);
sectionThreeFormElement.addEventListener("submit", handleSectionThreeSubmission);
sectionFourFormElement.addEventListener("submit", handleSectionFourSubmission);


function handleSectionOneSubmission(e) {

    const inputTitleSelector       = "#home-page-section-1-title";
    const inputDescriptionSelector = "#home-page-section-1-description";
    const saveButtonSelector       = ".edit-home-page-section-btn";
    const timeObj                  = {};
    const url                      = "/edit-homepage-section/1"

    const [inputTitle, inputDescription, saveButton] = getSectionElements(inputTitleSelector, 
                                                                          inputDescriptionSelector, 
                                                                          saveButtonSelector);

    e.preventDefault();

    timeObj.TIME_IN_MILLISECONDS_TO_SHOW_SPINNER = 3000;
    timeObj.TIME_IN_MILLISECONDS_TO_DISPLAY_MSG = 4000;

    handleFormSubmission(inputTitle, inputDescription, saveButton, sectionOneFormElement, timeObj, url)

}

function handleSectionTwoSubmission(e) {

    const inputTitleSelectorID       = "#home-page-section-2-title";
    const inputDescriptionSelectorID = "#home-page-section-2-description";
    const saveButtonSelectorClass    = ".edit-home-page-section-two-btn";
    const url                      = "/edit-homepage-section/2";

    const [inputTitle, inputDescription, saveButton] = getSectionElements(inputTitleSelectorID, 
                                                                          inputDescriptionSelectorID, 
                                                                          saveButtonSelectorClass);
    
    e.preventDefault();
    const timeObj = {};

    timeObj.TIME_IN_MILLISECONDS_TO_SHOW_SPINNER = 3000;
    timeObj.TIME_IN_MILLISECONDS_TO_DISPLAY_MSG = 6000;

    handleFormSubmission(inputTitle, inputDescription, saveButton, sectionTwoFormElement, timeObj, url);
}



function handleSectionThreeSubmission(e) {

    const inputTitleSelector       = "#home-page-section-3-title";
    const inputDescriptionSelector = "#home-page-section-3-description";
    const saveButtonSelector       = ".edit-home-page-section-three-btn";
    const url                      = "/edit-homepage-section/3";
   
    const [inputTitle, inputDescription, saveButton] = getSectionElements(inputTitleSelector, 
                                                                            inputDescriptionSelector, 
                                                                            saveButtonSelector);
    
    e.preventDefault();
    const timeObj = {};

    timeObj.TIME_IN_MILLISECONDS_TO_SHOW_SPINNER = 3000;
    timeObj.TIME_IN_MILLISECONDS_TO_DISPLAY_MSG = 6000;

    handleFormSubmission(inputTitle, inputDescription, saveButton, sectionThreeFormElement, timeObj, url);
}




function handleSectionFourSubmission(e) {

    const inputTitleSelector       = "#home-page-section-4-title";
    const inputDescriptionSelector = "#home-page-section-4-description";
    const saveButtonSelector       = ".edit-home-page-section-four-btn";
    const url                      = "/edit-homepage-section/4";
   
  
    const [inputTitle, inputDescription, saveButton] = getSectionElements(inputTitleSelector, 
                                                                            inputDescriptionSelector, 
                                                                            saveButtonSelector);
    
    e.preventDefault();
    const timeObj = {};

    timeObj.TIME_IN_MILLISECONDS_TO_SHOW_SPINNER = 3000;
    timeObj.TIME_IN_MILLISECONDS_TO_DISPLAY_MSG = 4000;

    handleFormSubmission(inputTitle, inputDescription, saveButton, sectionFourFormElement, timeObj, url);
}

/**
 * Retrieves DOM elements based on provided selectors for input title, input description, and save button.
 *
 * @param {string} inputTitleSelector - The CSS selector for the input title element.
 * @param {string} inputDescriptionSelector - The CSS selector for the input description element.
 * @param {string} saveButtonSelector - The CSS selector for the save button element.
 * @returns {Array} An array containing the input title element, input description element, and save button element.
 * @throws {Error} Throws an error if any of the provided selectors are incorrect or missing.
 */
function getSectionElements(inputTitleSelector, inputDescriptionSelector, saveButtonSelector) {
    const inputTitleElement = document.querySelector(inputTitleSelector);
    const inputDescriptionElement = document.querySelector(inputDescriptionSelector);
    const saveButtonElement = document.querySelector(saveButtonSelector);

    if (!(inputTitleElement || inputDescriptionElement || saveButtonElement)) {
        throw new Error("One or more of the selector elements are incorrect or missing.");
    }
    return [inputTitleElement, inputDescriptionElement, saveButtonElement];
}




/**
 * Handles the submission of a form based on specified conditions and updates UI elements accordingly.
 *
 * @param {HTMLInputElement} inputTitle - The input element for the title.
 * @param {HTMLInputElement} inputDescription - The input element for the description.
 * @param {HTMLButtonElement} saveButton - The button element for saving the form.
 * @param {object} timeObj - An object containing time durations for spinner and message display.
 */
 async function handleFormSubmission(inputTitle, inputDescription, saveButton, formToSubmit, timeObj, url) {
    if (!inputTitle || !inputDescription || !saveButton || !formToSubmit || !timeObj) {
        console.error("One or more required parameters are missing.");
        return;
    }

    if (inputTitle.value && inputDescription.value && saveButton) {

        spinner.style.display = "block";
        saveButton.disabled   = true;

        const sectionObj      = {"title": inputTitle.value, "description": inputDescription.value};

        try {
            const response = await getFetchJson(url, sectionObj)
            if (!response.ok) {
                showError(timeObj);
                spinner.style.display = "none";
            }
            if (response.ok) {


                setTimeout(() => {
                    spinner.style.display = "none";
                }, timeObj.TIME_IN_MILLISECONDS_TO_SHOW_SPINNER)
              
                showSuccess(timeObj);
                formToSubmit.reset();
            }
        } catch (error) {
            console.error(error);
            spinner.style.display = "none";
        }
       
    

        saveButton.disabled = false;
       
        
    } else {
       showError(timeObj);
    }
}


function showError(timeObj) {
    errorMessageElement.classList.add("active");
    setTimeout(() => {
        errorMessageElement.classList.remove("active");
    }, timeObj.TIME_IN_MILLISECONDS_TO_SHOW_SPINNER + 1000);
}


function showSuccess(timeObj)  {
    successMessageElement.classList.add("active");
    setTimeout(() => {
        successMessageElement.classList.remove("active");
    }, timeObj.TIME_IN_MILLISECONDS_TO_DISPLAY_MSG);

}


async function getFetchJson(url, message) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
    });
    return response;
}
