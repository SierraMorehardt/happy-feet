import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { TrainingPlanService } from '../service/TrainingPlanService.js';
import { logger } from '../utils/logger.js';

export class TrainingPlanController {
    /**
     * Create a new TrainingPlanController
     * @param {TrainingPlanService} trainingPlanService - The training plan service instance
     */
    constructor(trainingPlanService) {
        if (!trainingPlanService) {
            throw new Error('TrainingPlanService instance is required');
        }
        this.trainingPlanService = trainingPlanService;
        this.router = Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post('/', this.authenticateToken, this.createTrainingPlan.bind(this));
        this.router.get('/', this.authenticateToken, this.getUserTrainingPlans.bind(this));
        this.router.get('/:id', this.authenticateToken, this.getTrainingPlan.bind(this));
        this.router.put('/:id', this.authenticateToken, this.updateTrainingPlan.bind(this));
        this.router.delete('/:id', this.authenticateToken, this.deleteTrainingPlan.bind(this));
    }

    // Middleware to authenticate JWT token (duplicated from UserController - consider moving to a separate middleware)
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

    async createTrainingPlan(req, res) {
        try {
            const trainingPlan = await this.trainingPlanService.createTrainingPlan(
                req.body,
                req.user.userId
            );
            res.status(201).json(trainingPlan);
        } catch (error) {
            logger.error(`Create training plan error: ${error.message}`);
            res.status(400).json({ error: error.message });
        }
    }

    async getUserTrainingPlans(req, res) {
        try {
            const { status } = req.query;
            const options = status ? { status } : {};
            
            const trainingPlans = await this.trainingPlanService.getUserTrainingPlans(
                req.user.userId,
                options
            );
            res.json(trainingPlans);
        } catch (error) {
            logger.error(`Get user training plans error: ${error.message}`);
            res.status(500).json({ error: 'Failed to fetch training plans' });
        }
    }

    async getTrainingPlan(req, res) {
        try {
            const trainingPlan = await this.trainingPlanService.getTrainingPlan(
                req.params.id,
                req.user.userId
            );
            
            if (!trainingPlan) {
                return res.status(404).json({ error: 'Training plan not found' });
            }
            
            res.json(trainingPlan);
        } catch (error) {
            logger.error(`Get training plan error: ${error.message}`);
            res.status(500).json({ error: 'Failed to fetch training plan' });
        }
    }

    async updateTrainingPlan(req, res) {
        try {
            const updatedPlan = await this.trainingPlanService.updateTrainingPlan(
                req.params.id,
                req.body,
                req.user.userId
            );
            res.json(updatedPlan);
        } catch (error) {
            logger.error(`Update training plan error: ${error.message}`);
            const statusCode = error.message.includes('not found') ? 404 : 400;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async deleteTrainingPlan(req, res) {
        try {
            const success = await this.trainingPlanService.deleteTrainingPlan(
                req.params.id,
                req.user.userId
            );
            
            if (!success) {
                return res.status(404).json({ error: 'Training plan not found' });
            }
            
            res.status(204).send();
        } catch (error) {
            logger.error(`Delete training plan error: ${error.message}`);
            res.status(500).json({ error: 'Failed to delete training plan' });
        }
    }
}

// No default export - TrainingPlanController should be instantiated with dependencies
