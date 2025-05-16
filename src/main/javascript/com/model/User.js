class User {
    constructor(data) {
        this.id = null;
        this.trainingPlans = [];
        this.name = data.name || '';
        this.email = data.email || '';
        this.passwordHash = data.passwordHash || '';
        this.username = data.username || '';
        this.age = data.age || null;
        this.gender = data.gender || null;
        this.currentWeeklyMileage = data.currentWeeklyMileage || 0.0;
        this.longestRecentRun = data.longestRecentRun || 0;
    }

    getTrainingPlans() {
        return this.trainingPlans;
    }

    setTrainingPlans(trainingPlans) {
        this.trainingPlans = trainingPlans;
        for (let trainingPlan of trainingPlans) {
            trainingPlan.setUser(this);
        }
    }

    getId() {
        return this.id;
    }

    setId(id) {
        this.id = id;
    }

    // Add other getters and setters as needed
}

module.exports = { User };
