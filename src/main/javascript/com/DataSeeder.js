// Import statements
const { User } = require('./model/User');
const { TrainingPlan } = require('./model/TrainingPlan');
const { Workout } = require('./model/Workout');
const { UserRepository } = require('./repository/UserRepository');
const { TrainingPlanRepository } = require('./repository/TrainingPlanRepository');
const { WorkoutRepository } = require('./repository/WorkoutRepository');

// Define the seedDatabase function
async function seedDatabase(userRepo, planRepo, workoutRepo, passwordEncoder) {
    if (await userRepo.count() === 0) {
        // Create user
        const user = new User();
        user.name = "Sierra Morehardt";
        user.email = "sierramorehardt@gmail.com";
        user.passwordHash = await passwordEncoder.hash("password123");
        user.age = 28;
        user.username = "sierra.morehardt";
        user.currentWeeklyMileage = 0.0;
        user.longestRecentRun = 13;
        await userRepo.save(user);

        // Create training plan
        const plan = new TrainingPlan();
        plan.user = user;
        plan.raceType = "Half-marathon";
        plan.raceDate = new Date('2025-12-01');
        plan.currentLevel = "Intermediate";
        plan.generatedOn = new Date('2025-06-01');
        await planRepo.save(plan);

        // Create workouts (first 2 weeks as sample)
        const w1 = new Workout();
        w1.trainingPlan = plan;
        w1.date = new Date('2025-06-03');
        w1.type = "Easy Run";
        w1.distance = 5.0;
        w1.intensity = "Easy";
        w1.completed = false;

        const w2 = new Workout();
        w2.trainingPlan = plan;
        w2.date = new Date('2025-06-04');
        w2.type = "Rest";
        w2.distance = 0.0;
        w2.intensity = "";
        w2.completed = false;

        const w3 = new Workout();
        w3.trainingPlan = plan;
        w3.date = new Date('2025-06-05');
        w3.type = "Tempo Run";
        w3.distance = 7.0;
        w3.intensity = "Moderate";
        w3.completed = false;

        // Add more workouts as needed for 2 weeks...
        await workoutRepo.saveAll([w1, w2, w3]);
    }
}

module.exports = { seedDatabase };