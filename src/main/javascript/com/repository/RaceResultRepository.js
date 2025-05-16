class RaceResultRepository {
    constructor() {
        this.raceResults = [];
    }

    save(raceResult) {
        this.raceResults.push(raceResult);
        return raceResult;
    }

    findByUserOrderByDateDesc(user) {
        return this.raceResults
            .filter(rr => rr.user.id === user.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Add other methods as needed (e.g., delete, findAll)
}

module.exports = { RaceResultRepository };
