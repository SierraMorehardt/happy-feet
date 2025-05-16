class TrainingPlanResponse {
    constructor(data) {
        this.id = data.id || null;
        this.raceType = data.raceType || '';
        this.raceDate = data.raceDate || null;
        this.currentLevel = data.currentLevel || '';
        this.generatedOn = data.generatedOn || null;
        this.workouts = data.workouts || [];
    }

    getId() { return this.id; }
    setId(id) { this.id = id; }
    getRaceType() { return this.raceType; }
    setRaceType(raceType) { this.raceType = raceType; }
    getRaceDate() { return this.raceDate; }
    setRaceDate(raceDate) { this.raceDate = raceDate; }
    getCurrentLevel() { return this.currentLevel; }
    setCurrentLevel(currentLevel) { this.currentLevel = currentLevel; }
    getGeneratedOn() { return this.generatedOn; }
    setGeneratedOn(generatedOn) { this.generatedOn = generatedOn; }
    getWorkouts() { return this.workouts; }
    setWorkouts(workouts) { this.workouts = workouts; }
}

module.exports = { TrainingPlanResponse };
