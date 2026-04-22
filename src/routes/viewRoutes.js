import Express from 'express';
import * as viewController from '../controllers/viewController.js';
import { protectUI, checkUser } from '../middlewares/authMiddleware.js';

const router = Express.Router();

// Apply checkUser globally to all view routes so the header knows the login state
router.use(checkUser);

// Maps the root URL '/' to the home view
router.get('/', viewController.getHome);

// Authentication UI GET routes
router.get('/login', viewController.getLogin);
router.get('/register', viewController.getRegister);
router.get('/logout', viewController.logout);

// Authentication UI POST routes (Form Submissions)
router.post('/login', viewController.submitLogin);
router.post('/register', viewController.submitRegister);

// Protected UI routes
router.get('/dashboard', protectUI, viewController.getDashboard);

// Task Management UI Routes (Protected)
router.get('/tasks', protectUI, viewController.getTasksView);
router.post('/tasks', protectUI, viewController.createTaskView);
router.get('/tasks/:id/edit', protectUI, viewController.getEditTaskView);
router.post('/tasks/:id/edit', protectUI, viewController.updateTaskView);
router.post('/tasks/:id/delete', protectUI, viewController.deleteTaskView);

export default router;
