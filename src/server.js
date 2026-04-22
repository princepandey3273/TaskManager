import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

const startServer = async () => {
    // Connect to database before starting the server
    await connectDB();

    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port}`);
    });
};

startServer();