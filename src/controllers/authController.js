import * as authService from '../services/authService.js';

/**
 * Helper function to securely store the JWT token in an HTTP-only cookie.
 * 
 * Why HTTP-only? It prevents client-side JavaScript from reading the cookie,
 * which eliminates the risk of Cross-Site Scripting (XSS) attacks stealing the token.
 * 
 * @param {Object} user - The authenticated user object
 * @param {string} token - The JWT token
 * @param {number} statusCode - HTTP status code (e.g., 200 or 201)
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (user, token, statusCode, res) => {
    // Define secure cookie options
    const cookieOptions = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiration
        httpOnly: true, // Crucial for security: prevents XSS
        secure: process.env.NODE_ENV === 'production' // Use HTTPS in production
    };

    // Attach the cookie to the response
    res.cookie('jwt', token, cookieOptions);

    // Send the standard JSON response
    res.status(statusCode).json({
        status: 'success',
        data: {
            user,
            token
        }
    });
};

/**
 * Controller to handle user registration.
 * Extracts user data from the request body, calls the auth service,
 * and sends back the registered user and JWT token.
 * 
 * @param {Object} req - Express request object containing user details in req.body.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function to pass errors.
 */
export const register = async (req, res, next) => {
    try {
        // The service layer handles all business logic, hashing, and database saving.
        const { user, token } = await authService.registerUser(req.body);

        // Send token via HTTP-only cookie and JSON response
        sendTokenResponse(user, token, 201, res);
    } catch (error) {
        error.statusCode = 400; // Validation or duplicate email
        next(error);
    }
};

/**
 * Controller to handle user login.
 * Extracts email and password, calls the auth service for verification,
 * and sends back the authenticated user and JWT token.
 * 
 * @param {Object} req - Express request object containing email and password in req.body.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // The service layer verifies the credentials and returns the user + token
        const { user, token } = await authService.loginUser(email, password);
        
        // Send token via HTTP-only cookie and JSON response
        sendTokenResponse(user, token, 200, res);
    } catch (error) {
        error.statusCode = 401; // Unauthorized
        next(error);
    }
};

/**
 * Controller to handle user logout.
 * Clears the JWT cookie securely.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const logout = (req, res) => {
    // Overwrite the cookie with a dummy value and a very short expiration time
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
        httpOnly: true
    });
    
    res.status(200).json({ status: 'success' });
};
