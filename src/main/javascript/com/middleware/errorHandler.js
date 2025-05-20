import { logger } from '../utils/logger.js';
import { ValidationError } from '../errors/AppError.js';

/**
 * Error handling middleware for Express
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
    // Default to 500 (Internal Server Error) if status code is not set
    const statusCode = err.statusCode || 500;
    
    // Log the error
    logger.error(`[${new Date().toISOString()}] ${err.stack}`);
    
    // In development, send the full error stack trace
    if (process.env.NODE_ENV === 'development') {
        return res.status(statusCode).json({
            status: 'error',
            statusCode,
            message: err.message,
            stack: err.stack,
            errors: err.errors,
            code: err.code || 'INTERNAL_SERVER_ERROR'
        });
    }
    
    // In production, don't leak error details
    const response = {
        status: 'error',
        statusCode,
        message: statusCode >= 500 ? 'Something went wrong' : err.message,
        code: err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR')
    };
    
    // Add validation errors if they exist
    if (err instanceof ValidationError && err.errors) {
        response.errors = err.errors;
    }
    
    res.status(statusCode).json(response);
};

/**
 * Catch 404 and forward to error handler
 */
export const notFoundHandler = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

/**
 * Async handler to wrap async/await route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped route handler with error handling
 */
export const asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
