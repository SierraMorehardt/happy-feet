import { BaseService } from './BaseService.js';
import { logger } from '../utils/logger.js';

export class TrainingPlanService extends BaseService {
    constructor(
        trainingPlanRepository, 
        userRepository, 
        workoutRepository, 
        raceResultRepository
    ) {
        super(trainingPlanRepository);
        this.userRepository = userRepository;
        this.workoutRepository = workoutRepository;
        this.raceResultRepository = raceResultRepository;
    }

    /**
     * Create a new training plan for a user
     * @param {Object} planData - Training plan data
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Created training plan
     * @throws {Error} If user not found or plan creation fails
     */
    async createTrainingPlan(planData, userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Get user's race results to calculate appropriate training paces
        const raceResults = await this.raceResultRepository.findByUserOrderByDateDesc(user);
        const bestResult = this._findBestRaceResult(raceResults);
        
        // Calculate training paces based on best race result
        const trainingPaces = this._calculateTrainingPaces(bestResult);

        // Create the training plan with calculated paces
        const trainingPlan = {
            ...planData,
            userId,
            trainingPaces,
            status: 'active',
            startDate: new Date(planData.startDate || Date.now()),
            endDate: planData.endDate ? new Date(planData.endDate) : null
        };

        // Save the training plan
        return this.repository.create(trainingPlan);
    }

    /**
     * Get all training plans for a user
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of training plans
     */
    async getUserTrainingPlans(userId, options = {}) {
        return this.repository.findByUserId(userId, options);
    }

    /**
     * Update a training plan
     * @param {string} planId - Training plan ID
     * @param {Object} updateData - Data to update
     * @param {string} userId - User ID (for authorization)
     * @returns {Promise<Object>} Updated training plan
     * @throws {Error} If plan not found or not authorized
     */
    async updateTrainingPlan(planId, updateData, userId) {
        const plan = await this.repository.findById(planId);
        if (!plan) {
            throw new Error('Training plan not found');
        }

        if (plan.userId !== userId) {
            throw new Error('Not authorized to update this plan');
        }

        return this.repository.update(planId, updateData);
    }

    /**
     * Delete a training plan
     * @param {string} planId - Training plan ID
     * @param {string} userId - User ID (for authorization)
     * @returns {Promise<boolean>} True if deleted successfully
     * @throws {Error} If plan not found or not authorized
     */
    async deleteTrainingPlan(planId, userId) {
        const plan = await this.repository.findById(planId);
        if (!plan) {
            throw new Error('Training plan not found');
        }

        if (plan.userId !== userId) {
            throw new Error('Not authorized to delete this plan');
        }

        return this.repository.delete(planId);
    }

    // Private helper methods

    /**
     * Find the best race result from a list of results
     * @private
     * @param {Array} raceResults - List of race results
     * @returns {Object|null} Best race result or null if none found
     */
    _findBestRaceResult(raceResults) {
        let bestResult = null;
        let bestPace = Infinity;

        for (const result of raceResults) {
            if (result.distance > 0 && result.time > 0) {
                const pace = result.time / result.distance; // min/km
                if (pace < bestPace) {
                    bestPace = pace;
                    bestResult = result;
                }
            }
        }


        return bestResult;
    }

    /**
     * Calculate training paces based on race result
     * @private
     * @param {Object} raceResult - Race result data
     * @returns {Object} Training paces for different workout types
     */
    _calculateTrainingPaces(raceResult) {
        if (!raceResult) {
            // Default paces if no race result is available
            return {
                easy: '5:30-6:00 min/km',
                tempo: '4:45-5:15 min/km',
                interval: '4:15-4:45 min/km',
                longRun: '5:00-5:30 min/km',
                race: '4:30-5:00 min/km'
            };
        }


        const bestPace = raceResult.time / raceResult.distance; // min/km
        
        // Calculate different training paces based on best race pace
        return {
            easy: this._formatPaceRange(bestPace * 1.25, 0.1), // 25% slower ±5%
            tempo: this._formatPaceRange(bestPace * 1.1, 0.05),  // 10% slower ±2.5%
            interval: this._formatPaceRange(bestPace * 0.9, 0.05), // 10% faster ±2.5%
            longRun: this._formatPaceRange(bestPace * 1.15, 0.05), // 15% slower ±2.5%
            race: this._formatPaceRange(bestPace, 0.03) // Race pace ±1.5%
        };
    }

    /**
     * Format pace range as a string
     * @private
     * @param {number} basePace - Base pace in min/km
     * @param {number} variation - Variation factor (±)
     * @returns {string} Formatted pace range (e.g., "5:30-6:00 min/km")
     */
    _formatPaceRange(basePace, variation) {
        const minPace = basePace * (1 - variation);
        const maxPace = basePace * (1 + variation);
        
        const formatPace = (pace) => {
            const minutes = Math.floor(pace);
            const seconds = Math.round((pace - minutes) * 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };

        return `${formatPace(minPace)}-${formatPace(maxPace)} min/km`;
    }
}
