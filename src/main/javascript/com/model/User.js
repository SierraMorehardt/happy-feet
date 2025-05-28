export class User {
    #id;
    #trainingPlans;
    #name;
    #email;
    #passwordHash;
    #username;
    #age;
    #gender;
    #currentWeeklyMileage;
    #longestRecentRun;

    constructor(data = {}) {
        this.#id = data.id || null;
        this.#trainingPlans = [];
        this.#name = data.name || '';
        this.#email = data.email || '';
        this.#passwordHash = data.passwordHash || '';
        this.#username = data.username || '';
        this.#age = data.age || null;
        this.#gender = data.gender || null;
        this.#currentWeeklyMileage = data.currentWeeklyMileage || 0.0;
        this.#longestRecentRun = data.longestRecentRun || 0;
    }

    // Getters
    get id() { return this.#id; }
    get trainingPlans() { return [...this.#trainingPlans]; }
    get name() { return this.#name; }
    get email() { return this.#email; }
    get passwordHash() { return this.#passwordHash; }
    get username() { return this.#username; }
    get age() { return this.#age; }
    get gender() { return this.#gender; }
    get currentWeeklyMileage() { return this.#currentWeeklyMileage; }
    get longestRecentRun() { return this.#longestRecentRun; }

    // Setters with validation
    set id(id) { this.#id = id; }
    
    set name(name) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('Name must be a non-empty string');
        }
        this.#name = name.trim();
    }
    
    set email(email) {
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Invalid email format');
        }
        this.#email = email;
    }
    
    set passwordHash(hash) {
        if (hash && typeof hash !== 'string') {
            throw new Error('Password hash must be a string');
        }
        this.#passwordHash = hash;
    }
    
    set username(username) {
        if (username && typeof username !== 'string') {
            throw new Error('Username must be a string');
        }
        this.#username = username;
    }
    
    set age(age) {
        if (age !== null && (typeof age !== 'number' || age < 0 || !Number.isInteger(age))) {
            throw new Error('Age must be a positive integer or null');
        }
        this.#age = age;
    }
    
    set gender(gender) {
        if (gender !== null && !['male', 'female', 'other', 'prefer not to say'].includes(gender)) {
            throw new Error('Invalid gender value');
        }
        this.#gender = gender;
    }
    
    set currentWeeklyMileage(mileage) {
        if (typeof mileage !== 'number' || mileage < 0) {
            throw new Error('Weekly mileage must be a non-negative number');
        }
        this.#currentWeeklyMileage = mileage;
    }
    
    set longestRecentRun(distance) {
        if (typeof distance !== 'number' || distance < 0) {
            throw new Error('Longest recent run must be a non-negative number');
        }
        this.#longestRecentRun = distance;
    }

    // Methods
    setTrainingPlans(trainingPlans) {
        if (!Array.isArray(trainingPlans)) {
            throw new Error('Training plans must be an array');
        }
        this.#trainingPlans = [...trainingPlans];
        for (const trainingPlan of this.#trainingPlans) {
            if (trainingPlan && typeof trainingPlan.setUser === 'function') {
                trainingPlan.setUser(this);
            }
        }
    }

    // Static factory method
    static create(data) {
        const user = new User();
        
        // Set properties using setters for validation
        if (data.id !== undefined) user.id = data.id;
        if (data.name !== undefined) user.name = data.name;
        if (data.email !== undefined) user.email = data.email;
        if (data.username !== undefined) user.username = data.username;
        if (data.age !== undefined) user.age = data.age;
        if (data.gender !== undefined) user.gender = data.gender;
        if (data.currentWeeklyMileage !== undefined) user.currentWeeklyMileage = data.currentWeeklyMileage;
        if (data.longestRecentRun !== undefined) user.longestRecentRun = data.longestRecentRun;
        
        // Special handling for password hash
        if (data.passwordHash !== undefined) {
            user.passwordHash = data.passwordHash;
        } else if (data.password !== undefined) {
            // If plain password is provided, it should be hashed by the service
            throw new Error('Password must be hashed before creating user');
        }
        
        return user;
    }

    // Convert to plain object
    toJSON() {
        return {
            id: this.#id,
            name: this.#name,
            email: this.#email,
            username: this.#username,
            age: this.#age,
            gender: this.#gender,
            currentWeeklyMileage: this.#currentWeeklyMileage,
            longestRecentRun: this.#longestRecentRun
            // Note: passwordHash is intentionally excluded
        };
    }
}
