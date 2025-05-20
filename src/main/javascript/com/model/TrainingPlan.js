/**
 * Represents a training plan for a user
 */
export class TrainingPlan {
    #id;
    #userId;
    #workouts;
    #raceType;
    #raceDate;
    #currentLevel;
    #generatedOn;
    #status;
    #goalTime;
    #startDate;
    #endDate;
    #notes;

    /**
     * Create a new TrainingPlan
     * @param {Object} data - Training plan data
     */
    constructor(data = {}) {
        this.#id = data.id || null;
        this.#userId = data.userId || null;
        this.#workouts = data.workouts || [];
        this.#raceType = data.raceType || '';
        this.#raceDate = data.raceDate ? new Date(data.raceDate) : null;
        this.#currentLevel = data.currentLevel || 'beginner';
        this.#generatedOn = data.generatedOn ? new Date(data.generatedOn) : new Date();
        this.#status = data.status || 'active'; // 'active', 'completed', 'cancelled'
        this.#goalTime = data.goalTime || null; // in seconds
        this.#startDate = data.startDate ? new Date(data.startDate) : new Date();
        this.#endDate = data.endDate ? new Date(data.endDate) : null;
        this.#notes = data.notes || '';
    }

    // Getters
    get id() { return this.#id; }
    get userId() { return this.#userId; }
    get workouts() { return [...this.#workouts]; }
    get raceType() { return this.#raceType; }
    get raceDate() { return this.#raceDate ? new Date(this.#raceDate) : null; }
    get currentLevel() { return this.#currentLevel; }
    get generatedOn() { return new Date(this.#generatedOn); }
    get status() { return this.#status; }
    get goalTime() { return this.#goalTime; }
    get startDate() { return this.#startDate ? new Date(this.#startDate) : null; }
    get endDate() { return this.#endDate ? new Date(this.#endDate) : null; }
    get notes() { return this.#notes; }

    // Setters with validation
    set id(id) { this.#id = id; }
    
    set userId(userId) {
        if (!userId) throw new Error('User ID is required');
        this.#userId = userId;
    }
    
    set workouts(workouts) {
        if (!Array.isArray(workouts)) {
            throw new Error('Workouts must be an array');
        }
        this.#workouts = [...workouts];
    }
    
    set raceType(raceType) {
        const validRaceTypes = ['5k', '10k', 'half-marathon', 'marathon', 'custom'];
        if (!validRaceTypes.includes(raceType)) {
            throw new Error(`Invalid race type. Must be one of: ${validRaceTypes.join(', ')}`);
        }
        this.#raceType = raceType;
    }
    
    set raceDate(date) {
        if (date && !(date instanceof Date)) {
            throw new Error('Race date must be a valid Date object');
        }
        this.#raceDate = date ? new Date(date) : null;
    }
    
    set currentLevel(level) {
        const validLevels = ['beginner', 'intermediate', 'advanced'];
        if (!validLevels.includes(level)) {
            throw new Error(`Invalid level. Must be one of: ${validLevels.join(', ')}`);
        }
        this.#currentLevel = level;
    }
    
    set status(status) {
        const validStatuses = ['active', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        this.#status = status;
    }
    
    set goalTime(seconds) {
        if (seconds !== null && (typeof seconds !== 'number' || seconds < 0)) {
            throw new Error('Goal time must be a positive number of seconds or null');
        }
        this.#goalTime = seconds;
    }
    
    set startDate(date) {
        if (date && !(date instanceof Date)) {
            throw new Error('Start date must be a valid Date object');
        }
        this.#startDate = date ? new Date(date) : null;
    }
    
    set endDate(date) {
        if (date && !(date instanceof Date)) {
            throw new Error('End date must be a valid Date object or null');
        }
        this.#endDate = date ? new Date(date) : null;
    }
    
    set notes(notes) {
        this.#notes = String(notes || '');
    }
    
    /**
     * Add a workout to the training plan
     * @param {Object} workout - Workout to add
     */
    addWorkout(workout) {
        if (!workout || typeof workout !== 'object') {
            throw new Error('Workout must be an object');
        }
        this.#workouts.push(workout);
    }
    
    /**
     * Remove a workout from the training plan
     * @param {string} workoutId - ID of the workout to remove
     * @returns {boolean} True if workout was removed, false if not found
     */
    removeWorkout(workoutId) {
        const initialLength = this.#workouts.length;
        this.#workouts = this.#workouts.filter(w => w.id !== workoutId);
        return this.#workouts.length < initialLength;
    }
    
    /**
     * Get the duration of the training plan in weeks
     * @returns {number} Duration in weeks, or 0 if dates are not set
     */
    getDurationInWeeks() {
        if (!this.#startDate || !this.#endDate) return 0;
        const diffTime = Math.abs(this.#endDate - this.#startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    }
    
    /**
     * Convert the training plan to a plain object
     * @returns {Object} Plain object representation of the training plan
     */
    toJSON() {
        return {
            id: this.#id,
            userId: this.#userId,
            workouts: this.#workouts,
            raceType: this.#raceType,
            raceDate: this.#raceDate ? this.#raceDate.toISOString() : null,
            currentLevel: this.#currentLevel,
            generatedOn: this.#generatedOn.toISOString(),
            status: this.#status,
            goalTime: this.#goalTime,
            startDate: this.#startDate ? this.#startDate.toISOString() : null,
            endDate: this.#endDate ? this.#endDate.toISOString() : null,
            notes: this.#notes
        };
    }
}
