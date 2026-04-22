import Joi from 'joi';

/**
 * Validation schema for creating a new task.
 */
export const createTaskSchema = Joi.object({
    title: Joi.string().max(100).trim().required().messages({
        'string.empty': 'Task title is required.',
        'string.max': 'Title cannot exceed 100 characters.'
    }),
    description: Joi.string().max(1000).trim().required().messages({
        'string.empty': 'Task description is required.',
        'string.max': 'Description cannot exceed 1000 characters.'
    }),
    status: Joi.string().valid('pending', 'in-progress', 'completed').optional().messages({
        'any.only': 'Status must be pending, in-progress, or completed.'
    })
});

/**
 * Validation schema for updating an existing task.
 * All fields are optional since we might only want to update one thing,
 * but at least one field MUST be provided.
 */
export const updateTaskSchema = Joi.object({
    title: Joi.string().max(100).trim().optional().messages({
        'string.empty': 'Task title cannot be empty.',
        'string.max': 'Title cannot exceed 100 characters.'
    }),
    description: Joi.string().max(1000).trim().optional().messages({
        'string.empty': 'Task description cannot be empty.',
        'string.max': 'Description cannot exceed 1000 characters.'
    }),
    status: Joi.string().valid('pending', 'in-progress', 'completed').optional().messages({
        'any.only': 'Status must be pending, in-progress, or completed.'
    })
}).min(1).messages({
    'object.min': 'You must provide at least one field (title or description) to update.'
});
