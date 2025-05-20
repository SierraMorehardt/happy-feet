/**
 * Base service class providing common functionality for all services
 */
export class BaseService {
    constructor(repository) {
        if (new.target === BaseService) {
            throw new Error('BaseService cannot be instantiated directly');
        }
        this.repository = repository;
    }

    /**
     * Find all entities
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of entities
     */
    async findAll(options = {}) {
        return this.repository.findAll(options);
    }

    /**
     * Find entity by ID
     * @param {string|number} id - Entity ID
     * @returns {Promise<Object|null>} Found entity or null
     */
    async findById(id) {
        return this.repository.findById(id);
    }

    /**
     * Create a new entity
     * @param {Object} data - Entity data
     * @returns {Promise<Object>} Created entity
     */
    async create(data) {
        return this.repository.create(data);
    }

    /**
     * Update an existing entity
     * @param {string|number} id - Entity ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} Updated entity
     */
    async update(id, data) {
        return this.repository.update(id, data);
    }

    /**
     * Delete an entity
     * @param {string|number} id - Entity ID
     * @returns {Promise<boolean>} True if deleted successfully
     */
    async delete(id) {
        return this.repository.delete(id);
    }
}
