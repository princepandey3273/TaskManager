import bcrypt from 'bcrypt';

// The cost factor controls how much time is needed to calculate a single bcrypt hash.
// 10 is currently a standard balance between security and performance.
const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password using bcrypt.
 * 
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} The resulting hashed password.
 * @throws {Error} If the hashing process fails.
 */
export const hashPassword = async (password) => {
    try {
        if (!password) {
            throw new Error('Password is required for hashing.');
        }
        
        // Generate a salt and securely hash the password
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        return hashedPassword;
    } catch (error) {
        throw new Error('Failed to hash password.');
    }
};

/**
 * Compares a plain text password against a stored hashed password.
 * 
 * @param {string} plainTextPassword - The raw password entered by the user.
 * @param {string} hashedPassword - The hashed password retrieved from the database.
 * @returns {Promise<boolean>} True if the passwords match, false otherwise.
 * @throws {Error} If the comparison process fails.
 */
export const comparePassword = async (plainTextPassword, hashedPassword) => {
    try {
        if (!plainTextPassword || !hashedPassword) {
            throw new Error('Both plain text and hashed passwords are required for comparison.');
        }
        
        // bcrypt.compare safely evaluates the hash against the plain text string
        const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
        
        return isMatch;
    } catch (error) {
        throw new Error('Failed to compare passwords.');
    }
};
