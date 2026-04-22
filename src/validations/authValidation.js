import Joi from 'joi';

/**
 * Validation schema for user registration.
 */
export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).trim().required().messages({
        'string.empty': 'Name cannot be empty.',
        'string.min': 'Name must be at least 2 characters long.',
        'string.max': 'Name cannot exceed 50 characters.'
    }),
    email: Joi.string().email().trim().lowercase().required().messages({
        'string.email': 'Please provide a valid email address.',
        'string.empty': 'Email is required.'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 6 characters long.'
    }),
    role: Joi.string().valid('user', 'admin').optional().messages({
        'any.only': 'Role must be either "user" or "admin".'
    })
});

/**
 * Validation schema for user login.
 */
export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address.',
        'string.empty': 'Email is required.'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required.'
    })
});
