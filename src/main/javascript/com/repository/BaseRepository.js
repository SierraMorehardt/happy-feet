/**
 * Base repository class providing common database operations
 */
export class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    /**
     * Find all entities
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of entities
     */
    async findAll(options = {}) {
        return this.model.find(options);
    }

    /**
     * Find entity by ID
     * @param {string|number} id - Entity ID
     * @param {Object} options - Query options
     * @returns {Promise<Object|null>} Found entity or null
     */
    async findById(id, options = {}) {
        return this.model.findById(id, options);
    }

    /**
     * Find one entity by query
     * @param {Object} query - Query object
     * @param {Object} options - Query options
     * @returns {Promise<Object|null>} Found entity or null
     */
    async findOne(query, options = {}) {
        return this.model.findOne(query, options);
    }

    /**
     * Create a new entity
     * @param {Object} data - Entity data
     * @returns {Promise<Object>} Created entity
     */
    async create(data) {
        const entity = new this.model(data);
        return entity.save();
    }

    /**
     * Update an existing entity
     * @param {string|number} id - Entity ID
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
