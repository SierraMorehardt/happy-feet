/**
 * Base application error class
 */
export class AppError extends Error {
    /**
     * Create a new AppError
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     * @param {string} code - Application-specific error code
     * @param {boolean} isOperational - Whether the error is operational (vs. programming error)
     */
    constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        // Capture stack trace, excluding constructor call from it
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 400 Bad Request Error
 */
export class BadRequestError extends AppError {
    constructor(message = 'Bad Request', code = 'BAD_REQUEST') {
        super(message, 400, code);
    }
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
        super(message, 401, code);
    }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', code = 'FORBIDDEN') {
        super(message, 403, code);
    }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found', code = 'NOT_FOUND') {
        super(message, 404, code);
    }
}

/**
 * 409 Conflict Error
 */
export class ConflictError extends AppError {
    constructor(message = 'Conflict', code = 'CONFLICT') {
        super(message, 409, code);
    }
}

/**
 * 422 Validation Error
 */
export class ValidationError extends AppError {
    /**
     * @param {string|Array} errors - Validation error messages
     * @param {string} message - Custom error message
     */
    constructor(errors, message = 'Validation failed') {
        super(message, 422, 'VALIDATION_ERROR');
        this.errors = Array.isArray(errors) ? errors : [errors];
    }
}

export default {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError
};
