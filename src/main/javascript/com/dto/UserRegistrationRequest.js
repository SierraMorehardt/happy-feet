class UserRegistrationRequest {
    constructor(data) {
        this.name = data.name || '';
        this.email = data.email || '';
        this.password = data.password || '';
        this.age = data.age || null;
        this.gender = data.gender || null;
        this.currentWeeklyMileage = data.currentWeeklyMileage || 0.0;
        this.longestRecentRun = data.longestRecentRun || 0;
        this.username = data.username || '';
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
    }

    // Add other getters and setters as needed
}

module.exports = { UserRegistrationRequest };
