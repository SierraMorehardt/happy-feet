import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../model/User.js';
import { logger } from '../utils/logger.js';

const router = Router();

export class UserController {
    constructor(userRepository, bcryptLib = bcrypt) {
        this.userRepository = userRepository;
        this.bcrypt = bcryptLib;
        this.router = Router();
        this.initializeRoutes();
    }
    
    initializeRoutes() {
        this.router.post('/register', this.registerUser.bind(this));
        this.router.post('/login', this.login.bind(this));
    }

    async registerUser(req, res) {
        try {
            const { name, email, password, username, age, gender, currentWeeklyMileage, longestRecentRun } = req.body;
            
            // Basic validation
            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Name, email, and password are required' });
            }

            // Check if user already exists
            const existingUser = await this.userRepository.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({ error: 'Email already in use' });
            }

            // Create new user
            const user = User.create({
                name,
                email,
                username,
                age,
                gender,
                currentWeeklyMileage,
                longestRecentRun,
                passwordHash: password // This should be hashed by the repository
            });

            // Save user (repository should handle password hashing)
            const savedUser = await this.userRepository.save(user);
            
            // Handle case where savedUser might not have toJSON method
            const userResponse = typeof savedUser.toJSON === 'function' 
                ? savedUser.toJSON() 
                : { ...savedUser };
                
            // Remove password hash from response
            delete userResponse.passwordHash;
            
            logger.info(`User registered successfully: ${savedUser.email}`);
            return res.status(201).json(userResponse);
            
        } catch (error) {
            logger.error('Registration error:', error);
            const status = error.name === 'ValidationError' ? 400 : 500;
            return res.status(status).json({ 
                error: error.message || 'Registration failed',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }


    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Validate request
            if (!email || !password) {
                logger.debug('Login attempt missing email or password');
                return res.status(400).json({ error: 'Email and password are required' });
            }

            logger.debug(`Login attempt for email: ${email}`);
            
            // Find user by email
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                logger.debug('User not found for email:', email);
                // Don't reveal that the email doesn't exist for security
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            logger.debug('User found, comparing passwords...');
            
            // Verify password
            const isValidPassword = await this.bcrypt.compare(password, user.passwordHash);
            logger.debug(`Password comparison result: ${isValidPassword}`);
            
            if (!isValidPassword) {
                logger.debug(`Invalid password for user: ${email}`);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            logger.debug('Login successful for user:', email);
            
            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: user.id,
                    email: user.email 
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1h' }
            );
            
            // Login successful
            return res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username
                },
                token: token
            });
            
        } catch (error) {
            logger.error('Login error:', error);
            return res.status(500).json({ 
                error: 'Login failed',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

// Create a router instance for standalone usage
export const userRouter = new UserController().router; // Note: You should inject the repository here in a real app
