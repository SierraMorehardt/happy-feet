import { BaseRepository } from './BaseRepository.js';
import { Workout } from '../model/Workout.js';

/**
 * Repository for Workout model
 */
export class WorkoutRepository extends BaseRepository {
    constructor() {
        super(Workout);
    }

    /**
     * Find workouts by training plan ID
     * @param {string} trainingPlanId - Training plan ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of workouts for the training plan
     */
    async findByTrainingPlanId(trainingPlanId, options = {}) {
        return this.model.find({ trainingPlanId }, null, options);
    }

    /**
     * Find workouts by user ID
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of workouts for the user
     */
    async findByUserId(userId, options = {}) {
        return this.model.find({ userId }, null, options);
    }

    /**
     * Find workouts by date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of workouts within the date range
     */
    async findByDateRange(startDate, endDate, options = {}) {
        return this.model.find({
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }, null, options);
    }

    /**
     * Get workout statistics for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Workout statistics
     */
    async getWorkoutStats(userId) {
        const stats = await this.model.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalWorkouts: { $sum: 1 },
                    totalDistance: { $sum: '$distance' },
                    totalDuration: { $sum: '$duration' },
                    avgDistance: { $avg: '$distance' },
                    avgDuration: { $avg: '$duration' },
                    avgPace: { $avg: { $divide: ['$duration', '$distance'] } }
                }
            }
        ]);

        return stats[0] || {
            totalWorkouts: 0,
            totalDistance: 0,
            totalDuration: 0,
            avgDistance: 0,
            avgDuration: 0,
            avgPace: 0
        };
    }
}
