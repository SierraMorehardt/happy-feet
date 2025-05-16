class WorkoutResponse {
    constructor(data) {
        this.id = data.id || null;
        this.date = data.date || null;
        this.type = data.type || '';
        this.distance = data.distance || 0.0;
        this.intensity = data.intensity || '';
        this.completed = data.completed || false;
    }

    getId() { return this.id; }
    setId(id) { this.id = id; }
    getDate() { return this.date; }
    setDate(date) { this.date = date; }
    getType() { return this.type; }
    setType(type) { this.type = type; }
    getDistance() { return this.distance; }
    setDistance(distance) { this.distance = distance; }
    getIntensity() { return this.intensity; }
    setIntensity(intensity) { this.intensity = intensity; }
    getCompleted() { return this.completed; }
    setCompleted(completed) { this.completed = completed; }
}

module.exports = { WorkoutResponse };
