import bcrypt from 'bcrypt';


/**
 * A utility class for checking the strength of passwords.
 */
class PasswordStrengthChecker {
    /**
     * Creates an instance of PasswordStrengthChecker.
     * @param {string} password - The password to be checked.
     * @param {number} [defaultNum=8] - The default minimum length of the password.
     */
    constructor(password, defaultNum = 8) {
        this.password = password;
        this.defaultNum = defaultNum;
    }

    setPassword(password) {
        this.password = password;
    }
    
    /**
     * Checks if the password contains at least one special character.
     * @param {string} password - The password to be checked.
     * @returns {boolean} True if the password contains at least one special character, otherwise false.
     */
    containsAtLeastOneSpecialChar(password) {
        return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    }

    /**
     * Checks if the password contains at least a specified number of characters.
     * @param {string} password - The password to be checked.
     * @param {number} [length=this.defaultNum] - The minimum length required for the password.
     * @returns {boolean} True if the password meets the minimum length requirement, otherwise false.
     */
    containsAtLeastLengthChars(password, length = this.defaultNum) {
        return password.length >= length;
    }

    /**
     * Checks if the password contains at least one digit.
     * @param {string} password - The password to be checked.
     * @returns {boolean} True if the password contains at least one digit, otherwise false.
     */
    containsNumber(password) {
        return /\d/.test(password);
    }

    /**
     * Checks if the password contains at least one lowercase letter.
     * @param {string} password - The password to be checked.
     * @returns {boolean} True if the password contains at least one lowercase letter, otherwise false.
     */
    containsLowercaseChars(password) {
        return /[a-z]/.test(password);
    }

    /**
     * Checks if the password contains at least one uppercase letter.
     * @param {string} password - The password to be checked.
     * @returns {boolean} True if the password contains at least one uppercase letter, otherwise false.
     */
    containsUppercaseChars(password) {
        return /[A-Z]/.test(password);
    }

    /**
     * Checks the strength of the password based on various criteria.
     * @returns {Object} An object containing password strength indicators.
     */
    checkPasswordStrength() {
        const passwordObj = {};

        passwordObj.HAS_AT_LEAST_ONE_SPECIAL_CHARS = this.containsAtLeastOneSpecialChar(this.password);
        passwordObj.HAS_AT_LEAST_EIGHT_CHARACTERS = this.containsAtLeastLengthChars(this.password);
        passwordObj.HAS_AT_LEAST_ONE_NUMBER = this.containsNumber(this.password);
        passwordObj.HAS_AT_LEAST_ONE_LOWERCASE = this.containsLowercaseChars(this.password);
        passwordObj.HAS_AT_LEAST_ONE_UPPERCASE = this.containsUppercaseChars(this.password);

        passwordObj.IS_PASSWORD_STRONG =
            passwordObj.HAS_AT_LEAST_ONE_SPECIAL_CHARS &&
            passwordObj.HAS_AT_LEAST_EIGHT_CHARACTERS &&
            passwordObj.HAS_AT_LEAST_ONE_NUMBER &&
            passwordObj.HAS_AT_LEAST_ONE_LOWERCASE &&
            passwordObj.HAS_AT_LEAST_ONE_UPPERCASE;

        return passwordObj;
    }


    /**
     * Checks if the password meets the defined strength criteria.
     * @returns {boolean} True if the password meets the strength criteria, otherwise false.
     */
    isValid() {
        // Get password strength indicators
        const passwordStrengthIndicators = this.checkPasswordStrength();
        let validIndicatorsCount         = 0;

        // Get the expected count of valid indicators
        const expectedValidIndicatorsCount = Object.keys(passwordStrengthIndicators).length;

       
        for (let key in passwordStrengthIndicators) {
          
            if (passwordStrengthIndicators[key]) {
                validIndicatorsCount++;
            }
        }

    
    return expectedValidIndicatorsCount === validIndicatorsCount;
}


}


class PasswordImplementer {

    /**
     * Constructs a new PasswordImplementer object.
     * @param {string} plainPassword - The plain text password to be hashed or verified.
     * @param {number} saltRoundsToEncrypt - The number of salt rounds to use for password hashing. Default is 10.
     */
    constructor(plainPassword, saltRoundsToEncrypt = 10) {
        this.password            = plainPassword;
        this.saltRoundsToEncrypt = saltRoundsToEncrypt;
    }

    /**
     * Hashes the plain text password using bcrypt.
     * @returns {Promise<string>} A promise that resolves with the hashed password.
     * @throws {Error} Throws an error if password hashing fails.
     */
    async hashPassword() {
        try {
            return await bcrypt.hash(this.password, this.saltRoundsToEncrypt);
        } catch (error) {
            throw new Error(`Password encryption failed: ${error}`);
        }
    }

    /**
     * Verifies the plain text password against a hashed password using bcrypt.
     * @param {string} hashPassword - The hashed password to compare against.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the passwords match.
     * @throws {Error} Throws an error if password verification fails.
     */
    static async verifyPassword(password, hashPassword) {
      
        try {
            return await bcrypt.compare(password, hashPassword);
        } catch (error) {
            throw new Error(`Password verification failed: ${error}`);
        }
    }
}


export { PasswordStrengthChecker, PasswordImplementer };
