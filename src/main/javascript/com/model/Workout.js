/**
 * Represents a workout in a training plan
 */
export class Workout {
    #id;
    #trainingPlanId;
    #userId;
    #date;
    #type;
    #distance;
    #duration;
    #intensity;
    #completed;
    #notes;
    #completedAt;
    #actualDistance;
    #actualDuration;
    #perceivedEffort;

    /**
     * Create a new Workout
     * @param {Object} data - Workout data
     */
    constructor(data = {}) {
        this.#id = data.id || null;
        this.#trainingPlanId = data.trainingPlanId || null;
        this.#userId = data.userId || null;
        this.#date = data.date ? new Date(data.date) : new Date();
        this.#type = data.type || ''; // e.g., 'easy', 'long', 'interval', 'tempo', 'race', 'rest', 'cross-train'
        this.#distance = data.distance || 0.0; // in miles or kilometers
        this.#duration = data.duration || 0; // in minutes
        this.#intensity = data.intensity || 'moderate'; // 'easy', 'moderate', 'hard'
        this.#completed = data.completed || false;
        this.#notes = data.notes || '';
        this.#completedAt = data.completedAt ? new Date(data.completedAt) : null;
        this.#actualDistance = data.actualDistance || null; // in same unit as distance
        this.#actualDuration = data.actualDuration || null; // in minutes
        this.#perceivedEffort = data.perceivedEffort || null; // 1-10 scale
    }

    // Getters
    get id() { return this.#id; }
    get trainingPlanId() { return this.#trainingPlanId; }
    get userId() { return this.#userId; }
    get date() { return new Date(this.#date); }
    get type() { return this.#type; }
    get distance() { return this.#distance; }
    get duration() { return this.#duration; }
    get intensity() { return this.#intensity; }
    get completed() { return this.#completed; }
    get notes() { return this.#notes; }
    get completedAt() { return this.#completedAt ? new Date(this.#completedAt) : null; }
    get actualDistance() { return this.#actualDistance; }
    get actualDuration() { return this.#actualDuration; }
    get perceivedEffort() { return this.#perceivedEffort; }

    // Setters with validation
    set id(id) { this.#id = id; }
    
    set trainingPlanId(trainingPlanId) {
        if (!trainingPlanId) throw new Error('Training plan ID is required');
        this.#trainingPlanId = trainingPlanId;
    }
    
    set userId(userId) {
        if (!userId) throw new Error('User ID is required');
        this.#userId = userId;
    }
    
    set date(date) {
        if (!(date instanceof Date)) {
            throw new Error('Date must be a valid Date object');
        }
        this.#date = new Date(date);
    }
    
    set type(type) {
        const validTypes = ['easy', 'long', 'interval', 'tempo', 'race', 'rest', 'cross-train'];
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid workout type. Must be one of: ${validTypes.join(', ')}`);
        }
        this.#type = type;
    }
    
    set distance(distance) {
        if (typeof distance !== 'number' || distance < 0) {
            throw new Error('Distance must be a non-negative number');
        }
        this.#distance = distance;
    }
    
    set duration(minutes) {
        if (typeof minutes !== 'number' || minutes < 0) {
            throw new Error('Duration must be a non-negative number of minutes');
        }
        this.#duration = minutes;
    }
    
    set intensity(level) {
        const validLevels = ['easy', 'moderate', 'hard'];
        if (!validLevels.includes(level)) {
            throw new Error(`Invalid intensity level. Must be one of: ${validLevels.join(', ')}`);
        }
        this.#intensity = level;
    }
    
    set completed(isCompleted) {
        this.#completed = Boolean(isCompleted);
        if (this.#completed && !this.#completedAt) {
            this.#completedAt = new Date();
        }
    }
    
    set notes(notes) {
        this.#notes = String(notes || '');
    }
    
    set actualDistance(distance) {
        if (distance !== null && (typeof distance !== 'number' || distance < 0)) {
            throw new Error('Actual distance must be null or a non-negative number');
        }
        this.#actualDistance = distance;
    }
    
    set actualDuration(minutes) {
        if (minutes !== null && (typeof minutes !== 'number' || minutes < 0)) {
            throw new Error('Actual duration must be null or a non-negative number of minutes');
        }
        this.#actualDuration = minutes;
    }
    
    set perceivedEffort(effort) {
        if (effort !== null && (typeof effort !== 'number' || effort < 1 || effort > 10)) {
            throw new Error('Perceived effort must be null or a number between 1 and 10');
        }
        this.#perceivedEffort = effort;
    }
    
    /**
     * Mark the workout as completed with optional details
     * @param {Object} details - Completion details
     * @param {number} [details.actualDistance] - Actual distance completed
     * @param {number} [details.actualDuration] - Actual duration in minutes
     * @param {number} [details.perceivedEffort] - Perceived effort (1-10)
     * @param {string} [details.notes] - Additional notes
     */
    complete({ actualDistance = null, actualDuration = null, perceivedEffort = null, notes = '' } = {}) {
        this.completed = true;
        this.actualDistance = actualDistance;
        this.actualDuration = actualDuration;
        this.perceivedEffort = perceivedEffort;
        this.notes = notes || this.notes;
    }
    
    /**
     * Calculate the pace for this workout
     * @param {boolean} [useActual=false] - Whether to use actual distance/duration if available
     * @returns {number|null} Pace in minutes per unit distance, or null if not enough data
     */
    calculatePace(useActual = false) {
        const distance = useActual && this.#actualDistance !== null ? this.#actualDistance : this.#distance;
        const duration = useActual && this.#actualDuration !== null ? this.#actualDuration : this.#duration;
        
        if (!distance || !duration) return null;
        return duration / distance;
    }
    
    /**
     * Convert the workout to a plain object
     * @returns {Object} Plain object representation of the workout
     */
    toJSON() {
        return {
            id: this.#id,
            trainingPlanId: this.#trainingPlanId,
            userId: this.#userId,
            date: this.#date.toISOString(),
            type: this.#type,
            distance: this.#distance,
            duration: this.#duration,
            intensity: this.#intensity,
            completed: this.#completed,
            notes: this.#notes,
            completedAt: this.#completedAt ? this.#completedAt.toISOString() : null,
            actualDistance: this.#actualDistance,
            actualDuration: this.#actualDuration,
            perceivedEffort: this.#perceivedEffort
        };
    }
}
