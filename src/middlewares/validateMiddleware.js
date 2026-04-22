import Joi from 'joi';

/**
 * Reusable validation middleware using Joi.
 * 
 * Takes a Joi schema and validates the incoming `req.body` against it.
 * If validation fails, it intercepts the request and sends back a 400 Bad Request
 * with a clean, easy-to-read list of exactly what fields failed validation.
 * If validation passes, it replaces `req.body` with the sanitized data and calls `next()`.
 * 
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate against.
 * @returns {Function} Express middleware function.
 */
export const validate = (schema) => {
    return (req, res, next) => {
        // Validate the request body
        // abortEarly: false ensures we collect ALL validation errors, not just the first one it finds
        // stripUnknown: true securely removes any extra fields the user passed that aren't in our schema
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            // Map over the Joi error details to extract just the human-readable messages
            const errorMessages = error.details.map((detail) => detail.message);
            
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid request data',
                errors: errorMessages
            });
        }

        // Replace req.body with the perfectly validated and sanitized data
        req.body = value;
        next();
    };
};
