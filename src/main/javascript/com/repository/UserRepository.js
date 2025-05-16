class UserRepository {
    constructor() {
        this.users = [];
    }

    save(user) {
        this.users.push(user);
        return user;
    }

    findById(id) {
        return this.users.find(user => user.id === id) || null;
    }

    findByEmail(email) {
        return this.users.find(user => user.email === email) || null;
    }

    // Add other methods as needed (e.g., delete, findAll)
}

module.exports = { UserRepository };
