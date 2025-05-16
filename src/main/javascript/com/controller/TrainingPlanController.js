const express = require('express');
const { TrainingPlanRequest } = require('../dto/TrainingPlanRequest');
const { TrainingPlan } = require('../model/TrainingPlan');
const { User } = require('../model/User');
const { TrainingPlanRepository } = require('../repository/TrainingPlanRepository');
const { UserRepository } = require('../repository/UserRepository');
const { WorkoutRepository } = require('../repository/WorkoutRepository');
const { RaceResultRepository } = require('../repository/RaceResultRepository');
const { RaceResult } = require('../model/RaceResult');

const router = express.Router();

class TrainingPlanController {
    constructor(trainingPlanRepository, userRepository, workoutRepository, raceResultRepository) {
        this.trainingPlanRepository = trainingPlanRepository;
        this.userRepository = userRepository;
        this.workoutRepository = workoutRepository;
        this.raceResultRepository = raceResultRepository;
    }

    async createTrainingPlan(req, res) {
        const request = new TrainingPlanRequest(req.body);
        const userOpt = await this.userRepository.findById(request.userId);
        if (!userOpt) {
            return res.status(400).send('User not found');
        }

        const raceResults = await this.raceResultRepository.findByUserOrderByDateDesc(userOpt);
        let bestResult = null;
        let bestPace = Infinity;
        for (const rr of raceResults) {
            if (rr.distance > 0 && rr.time > 0) {
                const pace = rr.time / rr.distance; // min/km
                if (pace < bestPace) {
                    bestPace = pace;
                    bestResult = rr;
                }
            }
        }

        // Use bestResult to suggest paces/intensities
        let easyPace = 'Easy';
        let tempoPace = 'Moderate';
        let longRunPace = 'Hard';
        if (bestResult) {
            const easy = bestPace * 1.25; // 25% slower
            const tempo = bestPace * 1.10; // 10% slower
            const longRun = bestPace * 1.20; // 20% slower
            easyPace = `${easy.toFixed(1)} min/km`;
            tempoPace = `${tempo.toFixed(1)} min/km`;
            longRunPace = `${longRun.toFixed(1)} min/km`;
        }

        // Further logic for creating the training plan would go here
        // Respond with the created training plan or other relevant data
        res.status(201).send({ easyPace, tempoPace, longRunPace });
    }
}

const trainingPlanController = new TrainingPlanController(
    new TrainingPlanRepository(),
    new UserRepository(),
    new WorkoutRepository(),
    new RaceResultRepository()
);

router.post('/training-plan', (req, res) => trainingPlanController.createTrainingPlan(req, res));

module.exports = router;
