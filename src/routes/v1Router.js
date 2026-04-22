import Express from 'express';
import authRoutes from './authRoutes.js';
import taskRoutes from './taskRoutes.js';

const v1Router = Express.Router();

/**
 * API Version 1 Router
 * 
 * This file centralizes all v1 routes. By mounting this router in app.js at `/api/v1`,
 * we can easily add a `v2Router` in the future without breaking any existing v1 clients.
 */

v1Router.use('/auth', authRoutes);
v1Router.use('/tasks', taskRoutes);

export default v1Router;
