import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

/**
 * Authentication Middleware.
 * 
 * This middleware protects routes by verifying the presence and validity of a JWT token
 * in the Authorization header. If the token is valid, it attaches the user document 
 * to the `req` object for the next middleware or controller to use.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        // 1. Check if the Authorization header exists and starts with "Bearer"
        // Standard format is: "Authorization: Bearer <token>"
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // Extract just the token string, discarding the "Bearer " prefix
            token = req.headers.authorization.split(' ')[1];
        } 
        // Fallback: Check if the token was sent securely via HTTP-only cookie 
        // This allows our EJS UI to interact seamlessly with our JSON API
        else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        // 2. If no token was found, the user is not authenticated
        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'You are not logged in. Please provide a valid token to get access.'
            });
        }

        // 3. Verify the token using our JWT utility
        // This will automatically throw an error if the token is expired or tampered with
        const decoded = verifyToken(token);

        // 4. Verify that the user still exists in the database
        // (A user could have been deleted after the token was issued)
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: 'fail',
                message: 'The user belonging to this token no longer exists in the system.'
            });
        }

        // 5. Attach the fully authenticated user object to the request.
        // This allows any subsequent controllers to easily access the logged-in user via `req.user`
        req.user = currentUser;

        // 6. Grant access to the protected route
        next();
        
    } catch (error) {
        // This catch block easily catches the "Invalid or expired authentication token" 
        // error thrown by the verifyToken utility, or any database errors.
        return res.status(401).json({
            status: 'fail',
            message: error.message || 'Authentication failed. Please log in again.'
        });
    }
};

/**
 * Role-Based Authorization Middleware.
 * 
 * Must be used AFTER the `protect` middleware.
 * Checks if the logged-in user (req.user) has one of the required roles.
 * 
 * @param {...string} roles - An array of allowed roles (e.g., 'admin', 'user').
 * @returns {Function} Express middleware function.
 */
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user is guaranteed to exist here because this runs after `protect`
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action.'
            });
        }
        
        next();
    };
};

/**
 * UI Authentication Middleware.
 * 
 * Specifically designed for EJS view routes. Instead of returning JSON errors,
 * it redirects unauthenticated users back to the login page.
 */
export const protectUI = async (req, res, next) => {
    try {
        // Check for the HTTP-only cookie we set during login/register
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.redirect('/login');
        }

        // Verify token validity
        const decoded = verifyToken(token);

        // Verify user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.redirect('/login');
        }

        // Attach user to request for the controller to use
        req.user = currentUser;
        
        next();
    } catch (error) {
        // If token is tampered with or expired, redirect to login
        res.redirect('/login');
    }
};

/**
 * Global UI User State Middleware.
 * 
 * Soft-checks if a user is logged in via cookie. Does NOT restrict access.
 * Merely attaches the user to `res.locals` so EJS can conditionally render
 * the "Dashboard" vs "Sign In" buttons in the navigation header.
 */
export const checkUser = async (req, res, next) => {
    // 1. Handle Stateless Flash Messages
    // If a redirect happened and set a flash cookie, read it into res.locals and destroy the cookie
    if (req.cookies.flash_success) {
        res.locals.success = req.cookies.flash_success;
        res.clearCookie('flash_success');
    }
    if (req.cookies.flash_error) {
        res.locals.error = req.cookies.flash_error;
        res.clearCookie('flash_error');
    }

    // 2. Check Authentication State
    try {
        const token = req.cookies.jwt;
        if (token) {
            const decoded = verifyToken(token);
            const currentUser = await User.findById(decoded.id);
            if (currentUser) {
                // Attach to res.locals which EJS automatically exposes to all templates
                res.locals.user = currentUser;
            }
        }
    } catch (error) {
        // Silently fail, user simply appears logged out
    }
    next();
};
