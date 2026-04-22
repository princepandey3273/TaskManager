import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (retries = 5, delay = 5000) => {
    while (retries > 0) {
        try {
            await mongoose.connect(env.dbUrl);
            console.log('MongoDB connected successfully!');
            return;
        } catch (error) {
            retries -= 1;
            console.error(`MongoDB connection failed. Retries left: ${retries}`);
            console.error(`Error: ${error.message}`);
            
            if (retries === 0) {
                console.error('Could not connect to MongoDB after multiple attempts. Exiting process...');
                process.exit(1);
            }
            
            // Waitting for the delay before retrying
            await new Promise(res => setTimeout(res, delay));
        }
    }
};
