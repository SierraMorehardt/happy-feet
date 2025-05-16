class RaceResult {
    constructor(data) {
        this.id = null;
        this.user = data.user || null;
        this.raceType = data.raceType || '';
        this.distance = data.distance || 0;
        this.date = data.date || new Date();
        this.time = data.time || 0;
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

    getRaceType() {
        return this.raceType;
    }

    setRaceType(raceType) {
        this.raceType = raceType;
    }

    getDistance() {
        return this.distance;
    }

    setDistance(distance) {
        this.distance = distance;
    }

    getDate() {
        return this.date;
    }

    setDate(date) {
        this.date = date;
    }

    getTime() {
        return this.time;
    }

    setTime(time) {
        this.time = time;
    }
}

module.exports = { RaceResult };
