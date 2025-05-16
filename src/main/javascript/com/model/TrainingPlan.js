class TrainingPlan {
    constructor() {
        this.id = null;
        this.user = null;
        this.workouts = [];
        this.raceType = '';
        this.raceDate = null;
        this.currentLevel = '';
        this.generatedOn = null;
    }

    getId() {
        return this.id;
    }

    setId(id) {
        this.id = id;
    }

    getUser() {
        return this.user;
    }

    setUser(user) {
        this.user = user;
    }

    getWorkouts() {
        return this.workouts;
    }

    setWorkouts(workouts) {
        this.workouts = workouts;
        for (let workout of workouts) {
            workout.setTrainingPlan(this);
        }
    }

    getRaceType() {
        return this.raceType;
    }

    setRaceType(raceType) {
        this.raceType = raceType;
    }

    getRaceDate() {
        return this.raceDate;
    }

    setRaceDate(raceDate) {
        this.raceDate = raceDate;
    }

    getCurrentLevel() {
        return this.currentLevel;
    }

    setCurrentLevel(currentLevel) {
        this.currentLevel = currentLevel;
    }

    getGeneratedOn() {
        return this.generatedOn;
    }

    setGeneratedOn(generatedOn) {
        this.generatedOn = generatedOn;
    }
}
