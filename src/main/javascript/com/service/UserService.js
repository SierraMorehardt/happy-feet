import { BaseService } from './BaseService.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../model/User.js';
import { logger } from '../utils/logger.js';
import { 
    BadRequestError, 
    UnauthorizedError, 
    ConflictError,
    NotFoundError 
} from '../errors/AppError.js';

export class UserService extends BaseService {
    constructor(userRepository, bcryptLib = bcrypt, jwtLib = jwt) {
        super(userRepository);
        this.bcrypt = bcryptLib;
        this.jwt = jwtLib;
    }

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Created user
     * @throws {Error} If registration fails
     */
    async register(userData) {
        logger.debug('Starting user registration with data:', { 
            email: userData.email,
            username: userData.username,
            hasPassword: !!userData.password 
        });

        const { name, email, password, username, age, gender, currentWeeklyMileage, longestRecentRun } = userData;

        // Validate required fields
        if (!name || !email || !password) {
            const error = new BadRequestError('Name, email, and password are required');
            logger.error('Validation failed:', error.message, { name, email, hasPassword: !!password });
            throw error;
        }

        // Check if user already exists
        const existingUser = await this.repository.findByEmail(email);
        if (existingUser) {
            const error = new ConflictError('Email already in use');
            logger.error('Registration failed:', error.message, { email });
            throw error;
        }

        try {
            // Hash the password before creating the user
            const saltRounds = 10;
            logger.debug('Hashing password...');
            const passwordHash = await this.bcrypt.hash(password, saltRounds);
            logger.debug('Password hashed successfully');

            // Create user data object with hashed password
            const userData = {
                name,
                email,
                username,
                age,
                gender,
                currentWeeklyMileage,
                longestRecentRun,
                passwordHash // Already hashed
            };

            logger.debug('Creating user in repository...', { email });
            const savedUser = await this.repository.create(userData);
            
            if (!savedUser) {
                throw new Error('Failed to create user in repository');
            }
            
            logger.debug('User saved successfully', { 
                userId: savedUser.id,
                email: savedUser.email,
                hasPasswordHash: !!savedUser.passwordHash
            });
            
            // Verify the user can be retrieved
            const foundUser = await this.repository.findByEmail(email);
            if (!foundUser) {
                throw new Error('User was created but cannot be found by email');
            }
            
            logger.debug('Verified user can be found by email:', { 
                email,
                foundUserId: foundUser.id 
            });
            
            // Return user data without password hash
            const { passwordHash: _, ...userResponse } = foundUser;
            return userResponse;
        } catch (error) {
            logger.error('Error during user registration:', error.message, { 
                error: error.stack,
                email 
            });
            throw error;
        }
    }


    /**
     * Authenticate user and generate JWT token
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data with auth token
     * @throws {Error} If authentication fails
     */
    async login(email, password) {
        logger.debug('Login attempt for email:', email);
        
        if (!email || !password) {
            logger.error('Email or password not provided');
            throw new UnauthorizedError('Email and password are required');
        }

        logger.debug('Looking up user by email...');
        const user = await this.repository.findByEmail(email);
        
        if (!user) {
            logger.error(`User not found with email: ${email}`);
            throw new UnauthorizedError('Invalid email or password');
        }

        logger.debug('User found, verifying password...');
        
        // Check if user has a password hash
        if (!user.passwordHash) {
            logger.error('No password hash found for user:', email);
            throw new UnauthorizedError('Invalid email or password');
        }

        // Verify the password
        let isValidPassword = false;
        try {
            logger.debug('Comparing passwords...');
            isValidPassword = await this.bcrypt.compare(password, user.passwordHash);
            logger.debug('Password comparison result:', isValidPassword);
        } catch (error) {
            logger.error('Error comparing passwords:', error.message);
            throw new UnauthorizedError('Error during authentication');
        }
        
        if (!isValidPassword) {
            logger.error('Invalid password for user:', email);
            logger.debug('Stored password hash (first 10 chars):', 
                user.passwordHash ? user.passwordHash.substring(0, 10) + '...' : 'undefined');
            throw new UnauthorizedError('Invalid email or password');
        }

        // Generate JWT with consistent payload structure
        const payload = {
            userId: user.id,
            email: user.email
        };
        
        const token = this.jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        logger.debug(`Generated token for user ${user.email} with payload:`, payload);
        
        // Return user data without password hash
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            age: user.age,
            gender: user.gender,
            currentWeeklyMileage: user.currentWeeklyMileage,
            longestRecentRun: user.longestRecentRun
        };
        
        return { 
            user: userResponse, 
            token,
            expiresIn: '24h' // Add expiration info for client
        };
    }

    /**
     * Get user profile by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User profile
     * @throws {Error} If user not found
     */
    async getProfile(userId) {
        logger.debug('Looking up user by ID:', userId);
        
        if (!userId) {
            logger.error('No user ID provided to getProfile');
            throw new Error('User ID is required');
        }
        
        try {
            const user = await this.repository.findById(userId);
            logger.debug('User lookup result:', { 
                userId,
                userFound: !!user,
                userEmail: user?.email 
            });
            
            if (!user) {
                logger.warn(`User not found with ID: ${userId}`);
                throw new NotFoundError('User not found');
            }

            // Return user data without password hash
            const { passwordHash, ...userData } = user;
            return userData;
        } catch (error) {
            logger.error('Error in getProfile:', {
                error: error.message,
                stack: error.stack,
                userId
            });
            
            // Re-throw with more context
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new Error('Failed to retrieve user profile');
        }
    }

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated user
     * @throws {Error} If update fails
     */
    async updateProfile(userId, updateData) {
        // Prevent updating sensitive fields
        const { id, email, passwordHash, ...safeUpdateData } = updateData;
        
        return this.repository.update(userId, safeUpdateData);
    }
}
