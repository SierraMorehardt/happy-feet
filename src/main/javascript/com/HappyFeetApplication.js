import express, { json, urlencoded } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from './utils/logger.js';
import { userRouter } from './controller/UserController.js';

class HappyFeetApplication {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8080;
        this.env = process.env.NODE_ENV || 'development';
        
        this.initializeConfig();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    initializeConfig() {
        // Ensure required environment variables are set
        const requiredEnvVars = [
            'JWT_SECRET',
            'DATABASE_URL',
            'NODE_ENV'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
            if (this.env === 'production') {
                process.exit(1);
            }
        }

        // Set application-wide settings
        this.app.set('trust proxy', 1); // Trust first proxy
        this.app.set('json spaces', 2);
        
        // Configure view engine if needed
        // const __filename = fileURLToPath(import.meta.url);
        // const __dirname = dirname(__filename);
        // this.app.set('views', join(__dirname, 'views'));
        // this.app.set('view engine', 'ejs');
    }

    initializeMiddlewares() {
        // Security headers
        this.app.use(helmet());
        
        // Parse JSON and urlencoded request bodies
        this.app.use(json({ limit: '10kb' }));
        this.app.use(urlencoded({ extended: true, limit: '10kb' }));
        
        // Enable CORS
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: process.env.RATE_LIMIT_MAX || 100, // Limit each IP to 100 requests per windowMs
            standardHeaders: true,
            legacyHeaders: false,
            message: { error: 'Too many requests, please try again later.' }
        });
        this.app.use(limiter);
        
        // Request logging
        this.app.use((req, res, next) => {
            logger.info(`${req.method} ${req.originalUrl}`);
            next();
        });
    }
    
    initializeRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: this.env
            });
        });
        
        // API routes
        this.app.use('/api/users', userRouter);
        
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                status: 'error',
                message: 'Not Found',
                path: req.originalUrl
            });
        });
    }
    
    initializeErrorHandling() {
        // Global error handler
        this.app.use((err, req, res, next) => {
            logger.error(`[${new Date().toISOString()}] ${err.stack}`);
            
            const statusCode = err.statusCode || 500;
            const response = {
                status: 'error',
                message: err.message || 'Internal Server Error'
            };
            
            if (this.env === 'development') {
                response.stack = err.stack;
            }
            
            res.status(statusCode).json(response);
        });
    }
    
    start() {
        const server = this.app.listen(this.port, () => {
            logger.info(`Server running in ${this.env} mode on port ${this.port}`);
        });
        
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
            logger.error(err);
            server.close(() => {
                process.exit(1);
            });
        });
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
            logger.error(err);
            process.exit(1);
        });
        
        // Handle SIGTERM (for Docker, Kubernetes, etc.)
        process.on('SIGTERM', () => {
            logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
            server.close(() => {
                logger.info('💥 Process terminated!');
            });
        });
        
        return server;
    }
}

// Create and export the application instance
export const app = new HappyFeetApplication();

// Start the server if this file is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    app.start();
}

export default app;
