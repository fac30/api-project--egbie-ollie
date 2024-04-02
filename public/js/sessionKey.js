const secretKeyFormElement = document.querySelector(".secretKeyForm");
const nameElement          = document.querySelector(".title")
const sideBar              = document.querySelector(".side-bar-msg");
const sideBarTextAreaField = document.querySelector("#session-key-text-area");
const copyBtnElement       = document.querySelector(".copy-btn");
const closeBtn             = document.querySelector(".close-btn");
const spinner              = document.querySelector(".spinner");


secretKeyFormElement.addEventListener("submit", handleFormSubmission);
copyBtnElement.addEventListener("click", handleCopyBtn);
closeBtn.addEventListener("click", handleCloseBtn);


async function handleFormSubmission(e) {
    e.preventDefault();
    const TIME_IN_MILLISECOND_TO_DISPLAY_SPINNER = 3000;
  

    spinner.style.display = "block";

    setTimeout(() =>{
       spinner.style.display = "none";

       generateKey()
        

    }, TIME_IN_MILLISECOND_TO_DISPLAY_SPINNER)

  


    function generateKey() {
        const sessionKey = generateSessionKey();
   
        if (sideBar.classList.contains("hidden")) {
           sideBar.classList.remove("hidden");
           sideBarTextAreaField.value = sessionKey;
        }
    }
  
    
    

}

async function handleCopyBtn(e) {
   
    const string = sideBarTextAreaField.value;
    if (string) {
        await copyTextToClipboard(string);
        copyBtnElement.textContent = "copied!"
        copyBtnElement.disabled = true;
        copyBtnElement.style.opacity = 0.6;
    }
}


function handleCloseBtn(e) {
    sideBar.classList.add("hidden");
    resetBtn();
}

function resetBtn() {
    copyBtnElement.textContent = "copy";
    copyBtnElement.disabled = false;
    copyBtnElement.style.opacity = 1;
}


function getRandomCharacter(character) {
    return character.charAt(Math.floor((Math.random() * character.length)));
}

function generateSessionKey() {

    const capital     = "ABCDEFGHIJKLMNOPQRSTUVWXYXZ";
    const lower       = "abcdefghijklmnopqrstuvwxyz";
    const punctuation = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
    const string      = `${capital}${lower}${punctuation}`;

    const sessionKeyArray = [];

    for (let i=0; i < string.length; i++) {
        const char = getRandomCharacter(string);
        sessionKeyArray.push(char);
    }

    const sessionKeyString = sessionKeyArray.join("");
    const name = getName().replace(" ", ""); // replace any spaces with an empty space;

    return `SessionKey$-${name}-${sessionKeyString}`;

    
}

function getName() {

    if (!nameElement) {
        throw new Error("The name is not found!!")
    }
    return nameElement.value;
}



async function copyTextToClipboard(textToCopy) {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = "Failed to copy the text - Please copy manually!";
      const msgErrorElement = document.querySelector(".error");
      msgErrorElement.textContent = errorMsg;

    }
  }
  
  