import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../service/UserService.js';
import { logger } from '../utils/logger.js';

export class UserController {
    /**
     * Create a new UserController
     * @param {UserService} userService - The user service instance
     */
    constructor(userService) {
        if (!(userService instanceof UserService)) {
            throw new Error('UserService instance is required');
        }
        this.userService = userService;
        this.router = Router();
        this.initializeRoutes();
    }
    
    initializeRoutes() {
        this.router.post('/register', this.registerUser.bind(this));
        this.router.post('/login', this.login.bind(this));
        this.router.get('/profile', this.authenticateToken.bind(this), this.getProfile.bind(this));
        this.router.get('/:id', this.authenticateToken.bind(this), this.getUserById.bind(this));
        this.router.put('/profile', this.authenticateToken.bind(this), this.updateProfile.bind(this));
    }

    // Middleware to authenticate JWT token
    authenticateToken = async (req, res, next) => {
        try {
            // Get the token from the Authorization header
            const authHeader = req.headers['authorization'];
            if (!authHeader) {
                logger.warn('No authorization header provided');
                return res.status(401).json({ error: 'Access token is required' });
            }

            // Extract the token from the Bearer scheme
            const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
            if (!token) {
                logger.warn('No token provided in authorization header');
                return res.status(401).json({ error: 'Access token is required' });
            }

            logger.debug(`Verifying token: ${token.substring(0, 10)}...`);

            // Verify the token synchronously
            try {
                const user = jwt.verify(token, process.env.JWT_SECRET);
                logger.debug(`Token verified for user: ${user.email}`);
                
                // Attach the user to the request object
                req.user = user;
                return next();
            } catch (err) {
                logger.error(`Token verification failed: ${err.message}`, {
                    name: err.name,
                    expiredAt: err.expiredAt,
                    currentTime: new Date().toISOString(),
                    tokenStart: token.substring(0, 10)
                });
                
                return res.status(403).json({ 
                    error: 'Invalid or expired token',
                    details: process.env.NODE_ENV === 'development' ? {
                        message: err.message,
                        name: err.name,
                        expiredAt: err.expiredAt
                    } : undefined
                });
            }
        } catch (error) {
            logger.error(`Unexpected error in token authentication: ${error.message}`, { 
                error: error.message,
                stack: error.stack 
            });
            return res.status(500).json({ 
                error: 'Internal server error during authentication',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async registerUser(req, res) {
        try {
            const user = await this.userService.register(req.body);
            
            // Log the user in automatically after registration
            const { email, password } = req.body;
            const result = await this.userService.login(email, password);
            
            logger.debug(`User registered and logged in: ${email}`);
            
            res.status(201).json(result);
        } catch (error) {
            logger.error(`Registration error: ${error.message}`);
            const statusCode = error.message === 'Email already in use' ? 409 : 400;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
            
            // The token is already generated in the UserService
            const result = await this.userService.login(email, password);
            
            res.json(result);
        } catch (error) {
            logger.error(`Login error: ${error.message}`);
            res.status(401).json({ error: 'Invalid credentials' });
        }
    }
    
    async getProfile(req, res) {
        try {
            logger.debug('Getting profile for user:', {
                userId: req.user.userId,
                email: req.user.email,
                userFromToken: req.user
            });
            
            const user = await this.userService.getProfile(req.user.userId);
            logger.debug('Found user:', user);
            
            if (!user) {
                logger.warn('User not found in repository:', req.user.userId);
                return res.status(404).json({ error: 'User not found' });
            }
            
            res.json(user);
        } catch (error) {
            logger.error(`Get profile error: ${error.message}`, {
                error: error.stack,
                userId: req.user?.userId,
                email: req.user?.email
            });
            res.status(404).json({ 
                error: 'User not found',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    async updateProfile(req, res) {
        try {
            const updatedUser = await this.userService.updateProfile(
                req.user.userId, 
                req.body
            );
            res.json(updatedUser);
        } catch (error) {
            logger.error(`Update profile error: ${error.message}`);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Get user by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getUserById(req, res) {
        try {
            const userId = req.params.id;
            logger.debug(`Fetching user by ID: ${userId}`);
            
            const user = await this.userService.getProfile(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Only allow users to view their own profile unless they're an admin
            if (user.id !== req.user.userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to view this user' });
            }
            
            res.json(user);
        } catch (error) {
            logger.error(`Error getting user by ID: ${error.message}`, {
                error: error.stack,
                userId: req.params.id
            });
            res.status(500).json({ error: 'Failed to fetch user' });
        }
    }
}

// No default export - UserController should be instantiated with dependencies
