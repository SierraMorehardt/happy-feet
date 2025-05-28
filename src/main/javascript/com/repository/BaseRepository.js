// In-memory storage for all repositories
const storage = new Map();

/**
 * Base repository class providing common operations
 */
export class BaseRepository {
    constructor(model) {
        this.model = model;
        this.collection = new Map();
        storage.set(model.name, this.collection);
    }

    /**
     * Find all entities
     * @returns {Promise<Array>} List of entities
     */
    async findAll() {
        return Array.from(this.collection.values());
    }

    /**
     * Find entity by ID
     * @param {string} id - Entity ID
     * @returns {Promise<Object|null>} Found entity or null
     */
    async findById(id) {
        return this.collection.get(id) || null;
    }

    /**
     * Find one entity by query
     * @param {Function} predicate - Function to test each element
     * @returns {Promise<Object|null>} Found entity or null
     */
    async findOne(predicate) {
        for (const entity of this.collection.values()) {
            if (predicate(entity)) {
                return entity;
            }
        }
        return null;
    }

    /**
     * Create a new entity
     * @param {Object} data - Entity data
     * @returns {Promise<Object>} Created entity
     */
    async create(data) {
        const entity = new this.model(data);
        entity.id = Date.now().toString();
        this.collection.set(entity.id, entity);
        return entity;
    }

    /**
     * Update an existing entity
     * @param {string} id - Entity ID
     * @param {Object} data - Update data
     * @param {Object} options - Update options
     * @returns {Promise<Object|null>} Updated entity or null if not found
     */
    async update(id, data, options = { new: true }) {
        return this.model.findByIdAndUpdate(id, data, options);
    }

    /**
     * Delete an entity
     * @param {string|number} id - Entity ID
     * @returns {Promise<boolean>} True if deleted successfully
     */
    async delete(id) {
        const result = await this.model.findByIdAndDelete(id);
        return result !== null;
    }

    /**
     * Count documents matching a query
     * @param {Object} query - Query object
     * @returns {Promise<number>} Count of matching documents
     */
    async count(query = {}) {
        return this.model.countDocuments(query);
    }

    /**
     * Check if a document exists matching the query
     * @param {Object} query - Query object
     * @returns {Promise<boolean>} True if document exists
     */
    async exists(query) {
        const count = await this.count(query);
        return count > 0;
    }
}
