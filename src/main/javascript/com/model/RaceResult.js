/**
 * Represents a race result for a user
 */
export class RaceResult {
    #id;
    #userId;
    #raceName;
    #raceType;
    #distance;
    #timeInSeconds;
    #date;
    #location;
    #ageGroup;
    #genderPlace;
    #overallPlace;
    #finishers;
    #notes;
    #splits;
    #elevationGain;
    #weather;
    #shoes;
    #raceUrl;

    /**
     * Create a new RaceResult
     * @param {Object} data - Race result data
     */
    constructor(data = {}) {
        this.#id = data.id || null;
        this.#userId = data.userId || null;
        this.#raceName = data.raceName || '';
        this.#raceType = data.raceType || ''; // e.g., '5k', '10k', 'half-marathon', 'marathon', 'ultra'
        this.#distance = data.distance || 0; // in meters
        this.#timeInSeconds = data.timeInSeconds || 0; // in seconds
        this.#date = data.date ? new Date(data.date) : new Date();
        this.#location = data.location || ''; // e.g., 'New York, NY'
        this.#ageGroup = data.ageGroup || ''; // e.g., 'M30-34'
        this.#genderPlace = data.genderPlace || null;
        this.#overallPlace = data.overallPlace || null;
        this.#finishers = data.finishers || null; // Total number of finishers
        this.#notes = data.notes || '';
        this.#splits = Array.isArray(data.splits) ? [...data.splits] : []; // Array of split times in seconds
        this.#elevationGain = data.elevationGain || 0; // in meters
        this.#weather = data.weather || ''; // e.g., 'Sunny, 65°F, Wind: 5mph'
        this.#shoes = data.shoes || ''; // Shoe model used for the race
        this.#raceUrl = data.raceUrl || ''; // URL to official results
    }

    // Getters
    get id() { return this.#id; }
    get userId() { return this.#userId; }
    get raceName() { return this.#raceName; }
    get raceType() { return this.#raceType; }
    get distance() { return this.#distance; }
    get timeInSeconds() { return this.#timeInSeconds; }
    get date() { return new Date(this.#date); }
    get location() { return this.#location; }
    get ageGroup() { return this.#ageGroup; }
    get genderPlace() { return this.#genderPlace; }
    get overallPlace() { return this.#overallPlace; }
    get finishers() { return this.#finishers; }
    get notes() { return this.#notes; }
    get splits() { return [...this.#splits]; }
    get elevationGain() { return this.#elevationGain; }
    get weather() { return this.#weather; }
    get shoes() { return this.#shoes; }
    get raceUrl() { return this.#raceUrl; }

    // Setters with validation
    set id(id) { this.#id = id; }
    
    set userId(userId) {
        if (!userId) throw new Error('User ID is required');
        this.#userId = userId;
    }
    
    set raceName(name) {
        if (typeof name !== 'string' || !name.trim()) {
            throw new Error('Race name is required');
        }
        this.#raceName = name.trim();
    }
    
    set raceType(type) {
        const validTypes = ['5k', '10k', 'half-marathon', 'marathon', 'ultra', 'other'];
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid race type. Must be one of: ${validTypes.join(', ')}`);
        }
        this.#raceType = type;
    }
    
    set distance(meters) {
        if (typeof meters !== 'number' || meters < 0) {
            throw new Error('Distance must be a non-negative number');
        }
        this.#distance = meters;
    }
    
    set timeInSeconds(seconds) {
        if (typeof seconds !== 'number' || seconds < 0) {
            throw new Error('Time must be a non-negative number of seconds');
        }
        this.#timeInSeconds = seconds;
    }
    
    set date(date) {
        if (!(date instanceof Date)) {
            throw new Error('Date must be a valid Date object');
        }
        this.#date = new Date(date);
    }
    
    set location(location) {
        this.#location = String(location || '');
    }
    
    set ageGroup(group) {
        this.#ageGroup = String(group || '');
    }
    
    set genderPlace(place) {
        if (place !== null && (typeof place !== 'number' || place < 1)) {
            throw new Error('Gender place must be null or a positive number');
        }
        this.#genderPlace = place;
    }
    
    set overallPlace(place) {
        if (place !== null && (typeof place !== 'number' || place < 1)) {
            throw new Error('Overall place must be null or a positive number');
        }
        this.#overallPlace = place;
    }
    
    set finishers(count) {
        if (count !== null && (typeof count !== 'number' || count < 0)) {
            throw new Error('Finishers count must be null or a non-negative number');
        }
        this.#finishers = count;
    }
    
    set notes(notes) {
        this.#notes = String(notes || '');
    }
    
    set splits(splitTimes) {
        if (!Array.isArray(splitTimes)) {
            throw new Error('Splits must be an array');
        }
        if (!splitTimes.every(time => typeof time === 'number' && time >= 0)) {
            throw new Error('All split times must be non-negative numbers');
        }
        this.#splits = [...splitTimes];
    }
    
    set elevationGain(meters) {
        if (typeof meters !== 'number' || meters < 0) {
            throw new Error('Elevation gain must be a non-negative number');
        }
        this.#elevationGain = meters;
    }
    
    set weather(weather) {
        this.#weather = String(weather || '');
    }
    
    set shoes(shoeModel) {
        this.#shoes = String(shoeModel || '');
    }
    
    set raceUrl(url) {
        this.#raceUrl = String(url || '');
    }
    
    /**
     * Calculate the average pace in seconds per kilometer
     * @returns {number} Pace in seconds per kilometer, or 0 if distance is 0
     */
    getPacePerKilometer() {
        if (this.#distance === 0) return 0;
        return (this.#timeInSeconds / this.#distance) * 1000;
    }
    
    /**
     * Calculate the average pace in seconds per mile
     * @returns {number} Pace in seconds per mile, or 0 if distance is 0
     */
    getPacePerMile() {
        if (this.#distance === 0) return 0;
        return (this.#timeInSeconds / this.#distance) * 1609.34; // 1 mile = 1609.34 meters
    }
    
    /**
     * Format time as HH:MM:SS
     * @param {number} [seconds=this.#timeInSeconds] - Time in seconds to format
     * @returns {string} Formatted time string
     */
    formatTime(seconds = this.#timeInSeconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * Calculate age grading for the race result
     * @param {number} age - Age of the runner
     * @param {string} gender - 'male' or 'female'
     * @returns {Object} Age grading information
     */
    calculateAgeGrading(age, gender) {
        // This is a simplified version - in a real app, you'd use official age grading tables
        const factors = {
            '5k': { male: 13.5, female: 15.5 },
            '10k': { male: 27.5, female: 31.5 },
            'half-marathon': { male: 58.5, female: 67.5 },
            'marathon': { male: 120, female: 138 },
            'ultra': { male: 240, female: 276 }
        };
        
        const factor = factors[this.#raceType]?.[gender.toLowerCase()] || 60; // Default to 60 minutes if not found
        const standardTime = factor * 60; // Convert to seconds
        
        // Age adjustment (simplified)
        const ageDifference = age - 30; // Standard age is 30
        const ageAdjustment = Math.max(0, ageDifference * 0.02); // 2% slower per year over 30
        const adjustedStandardTime = standardTime * (1 + ageAdjustment);
        
        const ageGrade = (adjustedStandardTime / this.#timeInSeconds) * 100;
        
        return {
            ageGrade: Math.min(100, ageGrade).toFixed(2) + '%',
            standardTime: this.formatTime(standardTime),
            adjustedStandardTime: this.formatTime(adjustedStandardTime),
            worldRecordFactor: (this.#timeInSeconds / standardTime).toFixed(2) + 'x'
        };
    }
    
    /**
     * Convert the race result to a plain object
     * @returns {Object} Plain object representation of the race result
     */
    toJSON() {
        return {
            id: this.#id,
            userId: this.#userId,
            raceName: this.#raceName,
            raceType: this.#raceType,
            distance: this.#distance,
            timeInSeconds: this.#timeInSeconds,
            timeFormatted: this.formatTime(),
            date: this.#date.toISOString(),
            location: this.#location,
            ageGroup: this.#ageGroup,
            genderPlace: this.#genderPlace,
            overallPlace: this.#overallPlace,
            finishers: this.#finishers,
            notes: this.#notes,
            splits: this.#splits,
            elevationGain: this.#elevationGain,
            weather: this.#weather,
            shoes: this.#shoes,
            raceUrl: this.#raceUrl,
            pacePerKm: this.getPacePerKilometer(),
            pacePerMile: this.getPacePerMile(),
            pacePerKmFormatted: this.formatTime(this.getPacePerKilometer()) + '/km',
            pacePerMileFormatted: this.formatTime(this.getPacePerMile()) + '/mi'
        };
    }
}
