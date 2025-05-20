import { BaseRepository } from './BaseRepository.js';
import { TrainingPlan } from '../model/TrainingPlan.js';

/**
 * Repository for TrainingPlan model
 */
export class TrainingPlanRepository extends BaseRepository {
    constructor() {
        super(TrainingPlan);
    }

    /**
     * Find training plans by user ID
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of training plans for the user
     */
    async findByUserId(userId, options = {}) {
        return this.model.find({ userId }, null, options);
    }

    /**
     * Find active training plan for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} Active training plan or null if not found
     */
    async findActivePlan(userId) {
        return this.model.findOne({ 
            userId, 
            status: 'active' 
        });
    }

    /**
     * Find completed training plans for a user
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of completed training plans
     */
    async findCompletedPlans(userId, options = {}) {
        return this.model.find({ 
            userId, 
            status: 'completed' 
        }, null, options);
    }

    /**
     * Count training plans by status for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Counts by status
     */
    async countByStatus(userId) {
        const result = await this.model.aggregate([
            { $match: { userId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        return result.reduce((acc, { _id, count }) => ({
            ...acc,
            [_id]: count
        }), {});
    }
}
