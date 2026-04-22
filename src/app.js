import Express from "express";
import swaggerUi from "swagger-ui-express";
import yamljs from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import v1Router from "./routes/v1Router.js";
import viewRoutes from "./routes/viewRoutes.js";
import { globalErrorHandler } from "./middlewares/errorMiddleware.js";

// Reconstruct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// create an express app
const app = Express();

// Configure EJS as the templating engine
app.set('view engine', 'ejs');
// Tell Express exactly where to look for the view templates
app.set('views', path.join(__dirname, 'views'));

// Serve static assets (like compiled Tailwind CSS, images, etc.) from the 'public' folder
app.use(Express.static(path.join(__dirname, 'public')));

// 1. Set Security HTTP Headers (Helmet)
// This automatically prevents common attacks like Cross-Site Scripting (XSS) and Clickjacking.
// We configure Content Security Policy (CSP) to allow our inline EJS scripts, Tailwind styles, and Google Fonts.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

// 2. Rate Limiting
// Limits requests from the same IP to prevent Brute Force and Denial of Service (DoS) attacks
const limiter = rateLimit({
    max: 100, // Limit each IP to 100 requests per windowMs
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again in 15 minutes.'
});
// Apply the rate limiter to all /api routes
app.use('/api', limiter);

// Load Swagger document
const swaggerDocument = yamljs.load(path.join(__dirname, 'docs', 'swagger.yaml'));

// middleware for parsing JSON and URL-encoded request bodies
// We set a strict payload limit (10kb) to prevent malicious actors from sending massive payloads that crash the server
app.use(Express.json({ limit: '10kb' }));
app.use(Express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 3. Data Sanitization against NoSQL Query Injection
// This removes extremely dangerous characters like `$` and `.` from req.body and req.params
// Example: prevents `{ "email": { "$gt": "" }, "password": "password" }` attacks
// We apply this manually because the default middleware crashes on Express 5's read-only req.query getter
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    // Note: We skip req.query because it is a getter in Express 5 and we don't accept mongo queries there anyway
    next();
});

// View Routes (Frontend pages rendered via EJS)
app.use('/', viewRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Server is up and running...",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// API Documentation Route
// The Swagger UI will be available at /api-docs and acts as a fully interactive API client
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Legacy unversioned routes (Maintained to ensure absolutely NO breaking changes for existing clients)
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Scalable Versioned Routes (v1)
app.use('/api/v1', v1Router);

// Unknown routes (404 fallback)
app.use((req, res, next) => {
    const error = new Error(`Can't find ${req.originalUrl} on this server!`);
    error.statusCode = 404;
    next(error); // Pass the error to the global error handler
});

// Global Error Handling Middleware (MUST be the last middleware)
app.use(globalErrorHandler);

export default app;