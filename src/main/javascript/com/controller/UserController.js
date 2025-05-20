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
        this.router.put('/profile', this.authenticateToken.bind(this), this.updateProfile.bind(this));
    }

    // Middleware to authenticate JWT token
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Access token is required' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token' });
            }
            req.user = user;
            next();
        });
    }

    async registerUser(req, res) {
        try {
            const user = await this.userService.register(req.body);
            
            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Don't send password hash back to client
            const { passwordHash, ...userData } = user;
            
            res.status(201).json({
                user: userData,
                token
            });
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
            
            const result = await this.userService.login(email, password);
            
            // Generate JWT token
            const token = jwt.sign(
                { userId: result.user.id, email: result.user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Update the token in the response
            result.token = token;
            
            res.json(result);
        } catch (error) {
            logger.error(`Login error: ${error.message}`);
            res.status(401).json({ error: 'Invalid credentials' });
        }
    }
    
    async getProfile(req, res) {
        try {
            const user = await this.userService.getProfile(req.user.userId);
            res.json(user);
        } catch (error) {
            logger.error(`Get profile error: ${error.message}`);
            res.status(404).json({ error: 'User not found' });
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
}

// No default export - UserController should be instantiated with dependencies
