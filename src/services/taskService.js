import { Task } from '../models/Task.js';

/**
 * Creates a new task for a specific user.
 * 
 * @param {Object} taskData - The task details (title, description, etc.).
 * @param {Object} user - The authenticated user object.
 * @returns {Promise<Object>} The newly created task document.
 * @throws {Error} If validation fails or database operation errors.
 */
export const createTask = async (taskData, user) => {
    try {
        const newTask = await Task.create({
            ...taskData,
            userId: user._id // Attach the user ID from the authenticated request
        });
        
        return newTask;
    } catch (error) {
        throw new Error(`Failed to create task: ${error.message}`);
    }
};

/**
 * Retrieves all tasks belonging to a specific user.
 * 
 * @param {Object} user - The authenticated user object.
 * @returns {Promise<Array>} An array of task documents.
 * @throws {Error} If the database query fails.
 */
export const getTasks = async (user) => {
    try {
        // If the user is an admin, they can see all tasks.
        // Otherwise, only fetch tasks where the userId matches the logged-in user.
        const query = user.role === 'admin' ? {} : { userId: user._id };
        const tasks = await Task.find(query).sort({ createdAt: -1 }); // Sort by newest first
        return tasks;
    } catch (error) {
        throw new Error(`Failed to retrieve tasks: ${error.message}`);
    }
};

/**
 * Updates an existing task, ensuring the user actually owns it.
 * 
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} updateData - The fields to update (title, description).
 * @param {Object} user - The authenticated user object requesting the update.
 * @returns {Promise<Object>} The updated task document.
 * @throws {Error} If task is not found, not owned by user, or update fails.
 */
export const updateTask = async (taskId, updateData, user) => {
    // 1. Find the task by its ID
    const task = await Task.findById(taskId);

    if (!task) {
        throw new Error('Task not found.');
    }

    // 2. Ownership Validation: Ensure the logged-in user actually owns this task OR is an admin
    // We must convert ObjectIds to strings to safely compare them
    const isOwner = task.userId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw new Error('You do not have permission to modify this task.');
    }

    // 3. Apply the updates
    // We use findByIdAndUpdate to apply changes cleanly and get the new version back
    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        updateData,
        { 
            returnDocument: 'after', // Returns the newly updated document instead of the old one
            runValidators: true // Ensures the update respects Mongoose schema rules (maxlength, etc)
        }
    );

    return updatedTask;
};

/**
 * Deletes an existing task, ensuring the user actually owns it.
 * 
 * @param {string} taskId - The ID of the task to delete.
 * @param {Object} user - The authenticated user object requesting the deletion.
 * @returns {Promise<Object>} The deleted task document.
 * @throws {Error} If task is not found, not owned by user, or deletion fails.
 */
export const deleteTask = async (taskId, user) => {
    // 1. Find the task by its ID
    const task = await Task.findById(taskId);

    if (!task) {
        throw new Error('Task not found.');
    }

    // 2. Ownership Validation: Ensure the logged-in user actually owns this task OR is an admin
    const isOwner = task.userId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw new Error('You do not have permission to delete this task.');
    }

    // 3. Delete the task
    await Task.findByIdAndDelete(taskId);

    return task; // Return the deleted task data just in case the controller needs it
};
