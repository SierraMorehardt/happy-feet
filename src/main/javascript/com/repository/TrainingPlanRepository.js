class TrainingPlanRepository {
    constructor() {
        this.trainingPlans = [];
    }

    save(trainingPlan) {
        this.trainingPlans.push(trainingPlan);
        return trainingPlan;
    }

    findById(id) {
        return this.trainingPlans.find(plan => plan.id === id) || null;
    }

    // Add other methods as needed (e.g., delete, findAll)
}

module.exports = { TrainingPlanRepository };
