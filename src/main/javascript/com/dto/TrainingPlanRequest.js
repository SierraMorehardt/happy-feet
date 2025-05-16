class TrainingPlanRequest {
    constructor(data) {
        this.userId = data.userId;
        // Add other properties as needed based on the Java class
    }

    getUserId() {
        return this.userId;
    }

    setUserId(userId) {
        this.userId = userId;
    }
    
    // Add other getters and setters as needed
}

module.exports = { TrainingPlanRequest };
