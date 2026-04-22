/**
 * Global Error Handling Middleware.
 * 
 * In Express, a middleware with exactly 4 parameters `(err, req, res, next)` 
 * is automatically recognized as an error handler. Any time `next(error)` is called 
 * from a controller or an async error is thrown, it will end up here.
 * 
 * This ensures that no matter where an error happens, the frontend ALWAYS 
 * receives a consistent, predictable JSON response format.
 * 
 * @param {Error} err - The error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 */
export const globalErrorHandler = (err, req, res, next) => {
    // Determine the status code. 
    // If the error object has a custom statusCode, use it. Otherwise, default to 500 (Internal Server Error).
    let statusCode = err.statusCode || 500;
    
    // Default message
    let message = err.message || 'Something went wrong on the server.';

    // --- Handling specific known database/system errors ---

    // 1. Mongoose Duplicate Key Error (e.g., trying to register an email that already exists)
    if (err.code === 11000) {
        statusCode = 400; // Bad Request
        const field = Object.keys(err.keyValue)[0];
        message = `An account with that ${field} already exists. Please use a different one.`;
    }

    // 2. Mongoose Validation Error (e.g., required fields missing)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(err.errors).map(el => el.message);
        message = `Invalid input data: ${errors.join('. ')}`;
    }

    // 3. Mongoose CastError (e.g., passing an invalid ObjectId format in the URL like /api/tasks/123)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}.`;
    }

    // 4. JWT Authentication Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401; // Unauthorized
        message = 'Invalid token. Please log in again.';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Your token has expired. Please log in again.';
    }

    // --- Send the consistent error response ---
    res.status(statusCode).json({
        status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
        message: message,
        // In development, it's very helpful to see the exact error stack trace.
        // In production, we hide it to prevent leaking sensitive application details to users/attackers.
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};
