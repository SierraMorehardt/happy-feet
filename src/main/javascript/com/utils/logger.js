import winston from 'winston';

const { combine, timestamp, printf, colorize, align } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
    const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${message}${metaString}`;
});

// Determine log level based on environment
const getLogLevel = () => {
    if (process.env.NODE_ENV === 'test') return 'debug';
    return process.env.LOG_LEVEL || 'info';
};

// Create a logger instance
const logger = winston.createLogger({
    level: getLogLevel(),
    format: combine(
        colorize({ all: true }),
        timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        align(),
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            level: getLogLevel(),
            handleExceptions: true,
            json: false,
            colorize: true,
        })
    ],
    exitOnError: false
});

// Add file transports only in non-test environment
if (process.env.NODE_ENV !== 'test') {
    logger.add(new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5,
    }));
    
    logger.add(new winston.transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 10485760, // 10MB
        maxFiles: 5,
    }));
}

// Create logs directory if it doesn't exist
import { existsSync, mkdirSync } from 'fs';
if (!existsSync('logs')) {
    mkdirSync('logs');
}

export { logger };

// Handle uncaught exceptions and unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception thrown:', error);
    process.exit(1);
});
