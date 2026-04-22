import Express from 'express';
import * as taskController from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createTaskSchema, updateTaskSchema } from '../validations/taskValidation.js';

const router = Express.Router();

// We apply the `protect` middleware to the entire router.
// This guarantees that absolutely no task routes can be accessed without a valid JWT token!
router.use(protect);

/**
 * @route   /api/v1/tasks
 */
router.route('/')
    .post(validate(createTaskSchema), taskController.createTask)  // Create a new task (with validation)
    .get(taskController.getTasks);    // Get all tasks (filtered by ownership or admin)

/**
 * @route   /api/v1/tasks/:id
 */
router.route('/:id')
    .put(validate(updateTaskSchema), taskController.updateTask)   // Update a specific task (with validation)
    .delete(taskController.deleteTask); // Delete a specific task

export default router;
