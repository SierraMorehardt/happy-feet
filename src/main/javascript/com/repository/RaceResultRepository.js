import { BaseRepository } from './BaseRepository.js';
import { RaceResult } from '../model/RaceResult.js';

/**
 * Repository for RaceResult model
 */
export class RaceResultRepository extends BaseRepository {
    constructor() {
        super(RaceResult);
    }

    /**
     * Find race results by user ID, ordered by date descending
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of race results for the user
     */
    async findByUserIdOrderByDateDesc(userId, options = {}) {
        const sort = { date: -1 };
        const query = { userId };
        
        return this.model.find(query, null, { ...options, sort });
    }

    /**
     * Find race results by race type
     * @param {string} raceType - Type of race (e.g., '5k', '10k', 'half-marathon', 'marathon')
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of race results for the race type
     */
    async findByRaceType(raceType, options = {}) {
        return this.model.find({ raceType }, null, options);
    }

    /**
     * Find personal best race results for a user by race type
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Object with race types as keys and best time as values
     */
    async findPersonalBests(userId) {
        const results = await this.model.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$raceType',
                    bestTime: { $min: '$timeInSeconds' },
                    bestRace: { $first: '$$ROOT' }
                }
            },
            {
                $project: {
                    _id: 0,
                    raceType: '$_id',
                    bestTime: 1,
                    raceDate: '$bestRace.date',
                    raceName: '$bestRace.raceName',
                    location: '$bestRace.location'
                }
            }
        ]);

        return results.reduce((acc, { raceType, ...rest }) => ({
            ...acc,
            [raceType]: rest
        }), {});
    }

    /**
     * Get race statistics for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Race statistics
     */
    async getRaceStats(userId) {
        const stats = await this.model.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalRaces: { $sum: 1 },
                    byRaceType: {
                        $push: {
                            raceType: '$raceType',
                            timeInSeconds: '$timeInSeconds',
                            date: '$date'
                        }
                    },
                    firstRace: { $min: '$date' },
                    lastRace: { $max: '$date' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRaces: 1,
                    firstRace: 1,
                    lastRace: 1,
                    raceTypes: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: '$byRaceType.raceType' },
                                as: 'rt',
                                in: {
                                    k: '$$rt',
                                    v: {
                                        count: {
                                            $size: {
                                                $filter: {
                                                    input: '$byRaceType',
                                                    as: 'race',
                                                    cond: { $eq: ['$$race.raceType', '$$rt'] }
                                                }
                                            }
                                        },
                                        bestTime: {
                                            $min: {
                                                $filter: {
                                                    input: '$byRaceType',
                                                    as: 'race',
                                                    cond: { $eq: ['$$race.raceType', '$$rt'] }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        return stats[0] || {
            totalRaces: 0,
            firstRace: null,
            lastRace: null,
            raceTypes: {}
        };
    }
}
