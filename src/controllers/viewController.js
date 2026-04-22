import * as authService from '../services/authService.js';
import * as taskService from '../services/taskService.js';

/**
 * View Controller for rendering frontend templates.
 * 
 * This controller acts as the bridge between the backend and the EJS views,
 * ensuring strict separation of concerns. Instead of sending raw JSON data,
 * it injects dynamic data into HTML templates and serves them to the browser.
 */

export const getHome = (req, res) => {
    // res.render automatically looks in the 'src/views' directory
    // and injects the provided object (title) into the EJS template.
    res.render('index', { 
        title: 'Task Management System' 
    });
};

export const getLogin = (req, res) => {
    res.render('auth/login', { 
        title: 'Sign In',
        error: null
    });
};

export const getRegister = (req, res) => {
    res.render('auth/register', { 
        title: 'Create Account',
        error: null
    });
};

/**
 * Handle UI Login Submission
 */
export const submitLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.loginUser(email, password);
        
        // Store JWT securely in HTTP-only cookie
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });
        
        // Set stateless flash success message
        res.cookie('flash_success', 'Successfully logged in!', { maxAge: 5000, httpOnly: true });

        // Redirect to dashboard/home after successful login
        res.redirect('/');
    } catch (error) {
        // UI Flow: If login fails, re-render the login page and inject the error message
        res.render('auth/login', { 
            title: 'Sign In',
            error: error.message 
        });
    }
};

/**
 * Handle UI Registration Submission
 */
export const submitRegister = async (req, res) => {
    try {
        const { user, token } = await authService.registerUser(req.body);
        
        // Store JWT securely in HTTP-only cookie
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });
        
        // Set stateless flash success message
        res.cookie('flash_success', 'Account created successfully!', { maxAge: 5000, httpOnly: true });

        res.redirect('/');
    } catch (error) {
        // UI Flow: If registration fails, re-render the registration page and inject the error message
        res.render('auth/register', { 
            title: 'Create Account',
            error: error.message 
        });
    }
};

/**
 * Render the Protected Dashboard
 */
export const getDashboard = (req, res) => {
    res.render('dashboard', { 
        title: 'My Dashboard',
        user: req.user // Injected by protectUI middleware
    });
};

/**
 * Handle UI Logout
 */
export const logout = (req, res) => {
    // Clear the HTTP-only cookie by setting an immediate expiration date
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    });
    
    // Set stateless flash success message
    res.cookie('flash_success', 'You have been safely logged out.', { maxAge: 5000, httpOnly: true });

    // Redirect to home page
    res.redirect('/');
};

// ==========================================
// TASK MANAGEMENT UI CONTROLLERS
// ==========================================

/**
 * Render the Task List View
 */
export const getTasksView = async (req, res) => {
    try {
        const tasks = await taskService.getTasks(req.user);
        res.render('tasks/index', {
            title: 'Manage Tasks',
            tasks,
            error: null
        });
    } catch (error) {
        res.render('tasks/index', {
            title: 'Manage Tasks',
            tasks: [],
            error: error.message
        });
    }
};

/**
 * Handle Task Creation
 */
export const createTaskView = async (req, res) => {
    try {
        await taskService.createTask(req.body, req.user);
        res.redirect('/tasks');
    } catch (error) {
        // Fetch tasks again to render the page with the error
        const tasks = await taskService.getTasks(req.user).catch(() => []);
        res.render('tasks/index', {
            title: 'Manage Tasks',
            tasks,
            error: error.message
        });
    }
};

/**
 * Render the Task Edit View
 */
export const getEditTaskView = async (req, res) => {
    try {
        // taskService doesn't have a specific `getTaskById` that we export cleanly without an error, 
        // so we'll fetch all user tasks and find the right one, or just call updateTask without updates?
        // Let's just import the Task model or find it using mongoose directly if we want.
        // Actually, let's fetch all and filter to guarantee ownership without writing a new service method.
        const tasks = await taskService.getTasks(req.user);
        const task = tasks.find(t => t._id.toString() === req.params.id);
        
        if (!task) {
            return res.redirect('/tasks');
        }

        res.render('tasks/edit', {
            title: 'Edit Task',
            task,
            error: null
        });
    } catch (error) {
        res.redirect('/tasks');
    }
};

/**
 * Handle Task Update
 */
export const updateTaskView = async (req, res) => {
    try {
        await taskService.updateTask(req.params.id, req.body, req.user);
        res.redirect('/tasks');
    } catch (error) {
        // Pass error to edit view
        const tasks = await taskService.getTasks(req.user).catch(() => []);
        const task = tasks.find(t => t._id.toString() === req.params.id);
        
        if (!task) return res.redirect('/tasks');
        
        res.render('tasks/edit', {
            title: 'Edit Task',
            task,
            error: error.message
        });
    }
};

/**
 * Handle Task Deletion
 */
export const deleteTaskView = async (req, res) => {
    try {
        await taskService.deleteTask(req.params.id, req.user);
        res.redirect('/tasks');
    } catch (error) {
        res.redirect('/tasks');
    }
};
