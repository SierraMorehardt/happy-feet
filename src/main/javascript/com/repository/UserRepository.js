import { BaseRepository } from './BaseRepository.js';
import { User } from '../model/User.js';
import bcrypt from 'bcrypt';
import { logger } from '../utils/logger.js';

// In-memory storage for users (temporary solution)
const users = new Map();

// Keep track of users created during this session
const sessionUsers = new Map();

// Helper to get all users (both persistent and session)
function getAllUsers() {
    const allUsers = new Map(users);
    for (const [id, user] of sessionUsers) {
        allUsers.set(id, user);
    }
    return allUsers;
}

/**
 * Repository for User model
 */
export class UserRepository extends BaseRepository {
    constructor() {
        super(User);
        // Add some test users if none exist
        if (users.size === 0 && sessionUsers.size === 0) {
            this.initializeTestUsers();
        }
    }
    
    async initializeTestUsers() {
        try {
            const testUser = {
                name: 'Test User',
                email: 'testuser@example.com',
                passwordHash: await bcrypt.hash('password123', 10),
                username: 'testuser',
                age: 28,
                gender: 'female',
                currentWeeklyMileage: 0,
                longestRecentRun: 13
            };
            await this.create(testUser);
            console.log('Initialized test user');
        } catch (error) {
            console.error('Failed to initialize test users:', error);
        }
    }

    /**
     * Find user by email
     * @param {string} email - User's email
     * @returns {Promise<Object|null>} User or null if not found
     */
    async findByEmail(email) {
        try {
            logger.debug('Looking up user by email:', email);
            
            // First check session users (most recently created)
            for (const [id, user] of sessionUsers.entries()) {
                if (user.email === email) {
                    logger.debug('Found user in session storage:', { 
                        email, 
                        userId: id,
                        hasPasswordHash: !!user.passwordHash 
                    });
                    return user;
                }
            }
            
            // Then check persistent storage
            for (const [id, user] of users.entries()) {
                if (user.email === email) {
                    logger.debug('Found user in persistent storage:', { 
                        email, 
                        userId: id,
                        hasPasswordHash: !!user.passwordHash 
                    });
                    return user;
                }
            }
            
            logger.debug('User not found by email:', email);
            return null;
        } catch (error) {
            logger.error('Error in findByEmail:', error);
            throw error;
        }
    }

    /**
     * Check if email is already in use
     * @param {string} email - Email to check
     * @returns {Promise<boolean>} True if email is in use
     */
    async isEmailInUse(email) {
        const user = await this.findByEmail(email);
        return user !== null;
    }

    /**
     * Create a new user
     * @param {Object} data - User data
     * @returns {Promise<User>} Created user
     */
    async create(data) {
        try {
            logger.debug('Creating user with data:', { 
                email: data.email,
                hasPasswordHash: !!data.passwordHash 
            });
            
            // Check if user with this email already exists
            if (await this.findByEmail(data.email)) {
                throw new Error('Email already in use');
            }
            
            // The password should already be hashed by the service layer
            logger.debug('Creating new user with data:', { 
                email: data.email,
                hasPasswordHash: !!data.passwordHash 
            });
            
            // Create a new user instance with the provided data
            const user = new User(data);
            
            // Generate a new ID if one wasn't provided
            if (!user.id) {
                user.id = Date.now().toString(); // Simple ID generation for demo
            }
            
            // Store in session users (will be lost on server restart)
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                age: user.age,
                gender: user.gender,
                currentWeeklyMileage: user.currentWeeklyMileage,
                longestRecentRun: user.longestRecentRun,
                passwordHash: user.passwordHash
            };
            
            sessionUsers.set(user.id, userData);
            
            logger.debug('User created and stored in session:', { 
                userId: userData.id,
                email: userData.email,
                storedInSession: sessionUsers.has(user.id)
            });
            
            // Verify the user can be retrieved
            const storedUser = sessionUsers.get(user.id);
            if (!storedUser) {
                throw new Error('Failed to store user in session');
            }
            
            return storedUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Find user by ID
     * @param {string} id - User ID
     * @returns {Promise<User|null>} User or null if not found
     */
    async findById(id) {
        const allUsers = getAllUsers();
        const user = allUsers.get(id) || null;
        console.log('Find by ID:', { id, userFound: !!user });
        return user;
    }

    /**
     * Update user's password
     * @param {string} userId - User ID
     * @param {string} newPassword - New password (will be hashed by the model)
     * @returns {Promise<User|null>} Updated user or null if not found
     */
    async updatePassword(userId, newPassword) {
        const user = await this.findById(userId);
        if (!user) return null;
        
        user.passwordHash = newPassword;
        users.set(userId, user);
        return user;
    }

    /**
     * Find users by role
     * @param {string} role - User role
     * @returns {Promise<Array>} List of users with the specified role
     */
    async findByRole(role) {
        return this.model.find({ role }, null, options);
    }
}
