const registrationFormElement      = document.querySelector("#register-form");
const usernameFieldElement         = document.querySelector(".username-field");
const emailFieldElement            = document.querySelector(".email-field");
const passwordFieldElement         = document.querySelector(".password-field");
const confirmPasswordElement       = document.querySelector(".confirm-password-field");
const registrationErrorsElement    = document.querySelector("#registration-errors");
const registrationWarningTitleElement = document.querySelector(".error-warning-userform-title");

const passwordStrengthBoard        = document.querySelector(".password-strength");
const passwordLowercaseElement     = document.querySelector(".contains-lower-case");
const passwordUppercaseElement     = document.querySelector(".contains-capital");
const passwordNumberElement        = document.querySelector(".contains-number");
const passwordSpecialCharElement   = document.querySelector(".contains-special-char");
const passwordIsLengthValidElement = document.querySelector(".is-length-vaiid");
const doPasswordsMatchElement      = document.querySelector(".do-password-match");
const passwordBoardStrengthHeader  = document.querySelector(".password-strength-header");
const registerBtnElement           = document.querySelector(".register-btn");

const emailExistsMessage           = document.querySelector(".email-exists");
const spinnerElement               = document.querySelector(".spinner");








if (!(passwordFieldElement && passwordStrengthBoard)) {
    throw new Error("The elements need for the password field couldn't be found!!!")
}

const inputFieldElementsArray = [passwordFieldElement, confirmPasswordElement]

inputFieldElementsArray.forEach((inputFieldElement) => {

    inputFieldElement.addEventListener("input", handleInputChange);
    inputFieldElement.addEventListener("keyup", handleKeyUp);
    inputFieldElement.addEventListener("focus", handleInputChange);
})

registrationFormElement.addEventListener("submit", handleSubmission);



/**
 * Handles input change events on password input fields.
 * Triggers the passwordHelper function to process the password input.
 * @param {Event} event - The input change event.
 */
async function handleInputChange(event) {
    await passwordHelper(event);
}


/**
 * Handles keyup events on password input fields.
 * Triggers the passwordHelper function to process the password input.
 * @param {Event} event - The keyup event.
 */
async function handleKeyUp(event) {
    await passwordHelper(event);
}



async function handleSubmission(event) {
    event.preventDefault();

    const username           = usernameFieldElement.value;
    const email              = emailFieldElement.value;
    const password           = passwordFieldElement.value;
    const confirmPassword    = confirmPasswordElement.value;
    
     const url = "/handle-form-submission";
     const registerForm = {
            email: email,
            username: username,
            password: password,
            confirmPassword: confirmPassword,
        }
    
    spinnerElement.style.display = "block";

    const requestBody = { userForm: registerForm }

    // check for password one whether it is valid

    if (!(password === confirmPassword)) {
      const msg = {
        "PASSWORD_MATCH": "Invalid - Passwords doesn't match",
      }
      registrationWarningTitleElement.classList.remove("hidden");
      createErrorsMsgStatement(msg);
      spinnerElement.style.display = "none";
     
    } else {

      const resp = await getFetchJson(url, requestBody);
      registrationWarningTitleElement.classList.add("hidden");
      registrationErrorsElement.innerHTML = '';
      handleFormResponse(resp);

    }

} 

async function handleFormResponse(resp) {

    const MILLISECONDS = 2000;

    if (!resp.ok) {
        spinnerElement.style.display = "none";
        throw new Error("Something went wrong !!")
    }
    const response = await resp.json();

    if (response.IS_SUCCESS) {
        registrationWarningTitleElement.classList.add("hidden");
        registrationErrorsElement.innerHTML = '';

        setTimeout(() => {
            spinnerElement.style.display = "none";
         
            registrationFormElement.submit();
           
        }, MILLISECONDS)
       
      
    } else {

        registrationWarningTitleElement.classList.remove("hidden");
        createErrorsMsgStatement(response);
        spinnerElement.style.display = "none";


    }

}


function createErrorsMsgStatement(msgObj) {
    registrationErrorsElement.innerHTML = '';
    const fragment = document.createDocumentFragment("div");


    if (!(registrationErrorsElement) ) {
        throw new Error("Couldn't find the element needed to display the error msg!");
    }

    for (const key in msgObj) {
        if (typeof msgObj[key] === 'string' && msgObj[key].startsWith("Invalid -")) {
            const pTag = document.createElement("p");
            pTag.classList.add("form-error", "center");
            pTag.textContent = msgObj[key];
            fragment.appendChild(pTag);
        }
    }

    // Append the warnings to register errors
    registrationErrorsElement.appendChild(fragment);

}


/**
 * Helper function for processing password input and checking its strength.
 * Sends a request to the server to check password strength and updates the UI accordingly.
 * @param {Event} event - The event containing the password input.
 */
async function passwordHelper(event) {
    const password = event.target.value.trim();

    updatePasswordBoardTitle(event.target.name);  // Display in the password board the field the user is working in e.g password or confirm pasword

    if (password) {
        passwordStrengthBoard.classList.add("active");
        passwordStrengthBoard.classList.remove("hidden");

        const url = "/check-password-strength";
        const response = await getFetchJson(url, {password: password})
      
        if (response.ok) {
            try {
              const strengthData = await response.json(); // password strength

              handleResponse(strengthData);
            } catch (error) {
              console.error('Error parsing JSON response:', error);
            }
          } else {
            console.error('Response not OK:', response.status, response.statusText);
          }
          
        
    } else {
      
        passwordStrengthBoard.classList.remove("active");
        passwordStrengthBoard.classList.add("hidden");
        console.log("not found!!")
    }
}


/**
 * Updates the title of the password strength board based on the password 
 * input field the user is working in.
 * If the input field name the user is working in is "confirm-password", 
 * sets the title to "Confirm Password otherwise, sets it to "Password".
 * @param {string} name - The name of the input field.
 */
function updatePasswordBoardTitle(name) {
    passwordBoardStrengthHeader.textContent = name === "confirm-password" ? "Confirm Password" : "Password";
}


/**
 * Handles the response data from the password strength check and updates the password strength 
 * indicators accordingly.
 * @param {Object} strengthData - The response data containing password strength information.
 */
function handleResponse(strengthData) {
    switch (true) {
        case strengthData.HAS_AT_LEAST_ONE_LOWERCASE === true || !strengthData.HAS_AT_LEAST_ONE_LOWERCASE:
            updatePasswordElement(passwordLowercaseElement, strengthData.HAS_AT_LEAST_ONE_LOWERCASE);
            doPasswordsMatch();
          
        case strengthData.HAS_AT_LEAST_ONE_UPPERCASE === true || !strengthData.HAS_AT_LEAST_ONE_UPPERCASE:
            updatePasswordElement(passwordUppercaseElement, strengthData.HAS_AT_LEAST_ONE_UPPERCASE);
            doPasswordsMatch();
         
        case strengthData.HAS_AT_LEAST_ONE_NUMBER === true || !strengthData.HAS_AT_LEAST_ONE_NUMBER:
            updatePasswordElement(passwordNumberElement, strengthData.HAS_AT_LEAST_ONE_NUMBER);
            doPasswordsMatch();
          
        case strengthData.HAS_AT_LEAST_ONE_SPECIAL_CHARS === true || !strengthData.HAS_AT_LEAST_ONE_SPECIAL_CHARS:
            updatePasswordElement(passwordSpecialCharElement, strengthData.HAS_AT_LEAST_ONE_SPECIAL_CHARS);
            doPasswordsMatch();
           
        case strengthData.HAS_AT_LEAST_EIGHT_CHARACTERS === true || !strengthData.HAS_AT_LEAST_EIGHT_CHARACTERS:
            updatePasswordElement(passwordIsLengthValidElement, strengthData.HAS_AT_LEAST_EIGHT_CHARACTERS);
            doPasswordsMatch();
        
        case true:
           const arePasswordsAMatch = doPasswordsMatch();
           updatePasswordElement(doPasswordsMatchElement, arePasswordsAMatch)
      
           
    }
}



function doPasswordsMatch() {
    const password        = passwordFieldElement.value;
    const confirmPassword = confirmPasswordElement.value;
    return password === confirmPassword;
}





/**
 * Updates the styling of the given element based on the provided indicator.
 * If the indicator is true, adds the "semi-bold" class and removes the "opacity" class from the element;
 * otherwise, adds the "opacity" class and removes the "semi-bold" class.
 * @param {HTMLElement} element - The HTML element to update.
 * @param {boolean} indicator - A boolean indicating whether the element should be styled as active or inactive.
 */
function updatePasswordElement(element, indicator) {
    if (indicator) {
        element.classList.remove("opacity");
        element.classList.add("semi-bold");
    } else {
        element.classList.add("opacity");
        element.classList.remove("semi-bold");
    }
}

/**
 * Sends a POST request to the specified URL with the provided message data and returns the response.
 * @param {string} url - The URL to send the request to.
 * @param {Object} message - The message data to be sent in the request body (should be JSON serializable).
 * @returns {Promise<Response>} A promise that resolves to the response from the server.
 */
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


(function togglePassword() {
    let showPassword = false;

    const passwordElement = document.querySelector("#password");
    const confirmPasswordElement = document.querySelector("#confirm-password");
    const showPasswordToggle = document.querySelector("#show-password-toggle");

    if (!(passwordElement && confirmPasswordElement && showPasswordToggle)) {
        throw new Error("The elements needed weren't found");
    }
    
    showPasswordToggle.addEventListener('click', handleShowPasswordClick);

    function handleShowPasswordClick() {
        if (showPassword) {
            confirmPasswordElement.type = "password";
            passwordElement.type = "password";
        } else {
            confirmPasswordElement.type = "text";
            passwordElement.type = "text";
        }
        showPassword = !showPassword;
    }
})();