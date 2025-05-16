class LoginRequest {
    constructor(data) {
        this.email = data.email || '';
        this.password = data.password || '';
    }

    getEmail() {
        return this.email;
    }

    setEmail(email) {
        this.email = email;
    }

    getPassword() {
        return this.password;
    }

    setPassword(password) {
        this.password = password;
    }
}

module.exports = { LoginRequest };
