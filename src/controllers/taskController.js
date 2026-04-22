import * as taskService from '../services/taskService.js';

/**
 * Controller to create a new task.
 * Passes the request body and the authenticated user to the service.
 */
export const createTask = async (req, res, next) => {
    try {
        const task = await taskService.createTask(req.body, req.user);
        res.status(201).json({
            status: 'success',
            data: { task }
        });
    } catch (error) {
        error.statusCode = 400;
        next(error);
    }
};

/**
 * Controller to get tasks.
 * The service determines whether to return all tasks (if admin) or just the user's tasks.
 */
export const getTasks = async (req, res, next) => {
    try {
        const tasks = await taskService.getTasks(req.user);
        res.status(200).json({
            status: 'success',
            results: tasks.length,
            data: { tasks }
        });
    } catch (error) {
        error.statusCode = 500;
        next(error);
    }
};

/**
 * Controller to update a task.
 * Passes the task ID from the URL parameters, the updated data, and the authenticated user to the service.
 */
export const updateTask = async (req, res, next) => {
    try {
        const task = await taskService.updateTask(req.params.id, req.body, req.user);
        res.status(200).json({
            status: 'success',
            data: { task }
        });
    } catch (error) {
        error.statusCode = error.message.includes('permission') ? 403 : 400;
        next(error);
    }
};

/**
 * Controller to delete a task.
 * Passes the task ID and the authenticated user to the service.
 */
export const deleteTask = async (req, res, next) => {
    try {
        await taskService.deleteTask(req.params.id, req.user);
        // 204 No Content is standard for successful deletions
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        error.statusCode = error.message.includes('permission') ? 403 : 400;
        next(error);
    }
};
