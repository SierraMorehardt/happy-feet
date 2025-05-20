import { BaseRepository } from './BaseRepository.js';
import { User } from '../model/User.js';

/**
 * Repository for User model
 */
export class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    /**
     * Find user by email
     * @param {string} email - User's email
     * @returns {Promise<Object|null>} User or null if not found
     */
    async findByEmail(email) {
        return this.model.findOne({ email });
    }

    /**
     * Check if email is already in use
     * @param {string} email - Email to check
     * @returns {Promise<boolean>} True if email is in use
     */
    async isEmailInUse(email) {
        const count = await this.model.countDocuments({ email });
        return count > 0;
    }

    /**
     * Update user's password
     * @param {string} userId - User ID
     * @param {string} newPassword - New password (will be hashed by the model)
     * @returns {Promise<Object|null>} Updated user or null if not found
     */
    async updatePassword(userId, newPassword) {
        return this.model.findByIdAndUpdate(
            userId,
            { password: newPassword },
            { new: true }
        );
    }

    /**
     * Find users by role
     * @param {string} role - User role
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of users with the specified role
     */
    async findByRole(role, options = {}) {
        return this.model.find({ role }, null, options);
    }
}
