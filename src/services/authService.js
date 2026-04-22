import { User } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Registers a new user.
 * 
 * @param {Object} userData - The data for the new user.
 * @param {string} userData.name - User's full name.
 * @param {string} userData.email - User's email address.
 * @param {string} userData.password - User's plain text password.
 * @param {string} [userData.role] - Optional role ('user' or 'admin').
 * @returns {Promise<Object>} An object containing the created user (without password) and a JWT token.
 * @throws {Error} If the email is already in use or validation fails.
 */
export const registerUser = async (userData) => {
    const { name, email, password, role } = userData;

    // 1. Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('A user with this email already exists.');
    }

    // 2. Hash the user's password securely
    const hashedPassword = await hashPassword(password);

    // 3. Create the new user in the database
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role
    });

    // 4. Generate a JWT token for the newly registered user
    const token = generateToken({
        id: newUser._id,
        role: newUser.role
    });

    // 5. Remove the password from the returned user object for security
    // We convert the mongoose document to a plain JavaScript object first
    const userObject = newUser.toObject();
    delete userObject.password;

    return {
        user: userObject,
        token
    };
};

/**
 * Authenticates a user and generates a login token.
 * 
 * @param {string} email - The user's email address.
 * @param {string} password - The user's plain text password.
 * @returns {Promise<Object>} An object containing the authenticated user data and a JWT token.
 * @throws {Error} If the email is not found or the password does not match.
 */
export const loginUser = async (email, password) => {
    // 1. Find the user by email
    // NOTE: We use .select('+password') because we explicitly excluded the password 
    // from default queries in the User model using `select: false`.
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
        // Generic error message to prevent email enumeration attacks
        throw new Error('Invalid email or password.');
    }

    // 2. Compare the provided password with the hashed password in the database
    const isPasswordMatch = await comparePassword(password, user.password);
    
    if (!isPasswordMatch) {
        throw new Error('Invalid email or password.');
    }

    // 3. Generate a JWT token for the authenticated user
    const token = generateToken({
        id: user._id,
        role: user.role
    });

    // 4. Remove the password from the returned user object
    const userObject = user.toObject();
    delete userObject.password;

    return {
        user: userObject,
        token
    };
};
