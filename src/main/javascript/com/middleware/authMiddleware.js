import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

/**
 * Middleware to authenticate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token is required' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        logger.error(`Token verification failed: ${err.message}`, {
            name: err.name,
            expiredAt: err.expiredAt,
            currentTime: new Date().toISOString(),
            tokenStart: token.substring(0, 10)
        });
        
        return res.status(403).json({ 
            error: 'Invalid or expired token',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};
