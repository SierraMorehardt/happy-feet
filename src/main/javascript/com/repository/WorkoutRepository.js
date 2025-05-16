class WorkoutRepository {
    constructor() {
        this.workouts = [];
    }

    save(workout) {
        this.workouts.push(workout);
        return workout;
    }

    findById(id) {
        return this.workouts.find(workout => workout.id === id) || null;
    }

    // Add other methods as needed (e.g., delete, findAll)
}

module.exports = { WorkoutRepository };
