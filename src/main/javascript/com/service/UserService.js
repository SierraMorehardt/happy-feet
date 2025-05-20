import { BaseService } from './BaseService.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../model/User.js';
import { logger } from '../utils/logger.js';

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
        const { name, email, password, username, age, gender, currentWeeklyMileage, longestRecentRun } = userData;

        // Validate required fields
        if (!name || !email || !password) {
            throw new Error('Name, email, and password are required');
        }

        // Check if user already exists
        const existingUser = await this.repository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already in use');
        }

        // Create user entity
        const user = User.create({
            name,
            email,
            username,
            age,
            gender,
            currentWeeklyMileage,
            longestRecentRun,
            passwordHash: password // Repository should hash this
        });

        // Save user (repository should handle password hashing)
        return this.repository.save(user);
    }


    /**
     * Authenticate user and generate JWT token
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data with auth token
     * @throws {Error} If authentication fails
     */
    async login(email, password) {
        const user = await this.repository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValidPassword = await this.bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT
        const token = this.jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user data without password hash
        const { passwordHash, ...userData } = user;
        return { user: userData, token };
    }

    /**
     * Get user profile by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User profile
     * @throws {Error} If user not found
     */
    async getProfile(userId) {
        const user = await this.repository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Return user data without password hash
        const { passwordHash, ...userData } = user;
        return userData;
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
