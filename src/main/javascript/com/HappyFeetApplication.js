const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();

// Load environment variables and constants
require('dotenv').config();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize in-memory storage
const registeredEmails = new Set();
const users = new Map();

// User model structure
const User = {
    id: null,
    name: '',
    email: '',
    password: '',
    username: '',
    createdAt: null,
    updatedAt: null,
    lastLogin: null,
    role: 'user',
    status: 'active'
};

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
}));

// Request validation middleware
const validate = (validations) => async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Request validation middleware for registration
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Invalid email format'),
    body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('username').trim().notEmpty().withMessage('Username is required')
];

// Authentication middleware
async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// User registration route
app.post('/api/register', validate(registerValidation), async (req, res) => {
    try {
        const { name, email, password, username } = req.body;

        // Validate required fields
        if (!name || !email || !password || !username) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (registeredEmails.has(email)) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { 
            name,
            password: hashedPassword,
            username,
            createdAt: new Date()
        };
        
        users.set(email, user);
        registeredEmails.add(email);

        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
        return res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: {
                name,
                email,
                username
            }
        });
    } catch (error) {
        console.error('Registration failed:', error);
        return res.status(500).json({ error: 'Registration failed' });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = users.get(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login time
        const updatedUser = { ...user, lastLogin: new Date() };
        users.set(email, updatedUser);

        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                username: updatedUser.username,
                role: updatedUser.role,
                status: updatedUser.status,
                lastLogin: updatedUser.lastLogin
            }
        });
    } catch (error) {
        console.error('Login failed:', error);
        return res.status(500).json({ error: 'Login failed' });
    }
});

// Protected routes

// Get user profile
app.get('/api/user/profile', authenticate, async (req, res) => {
    try {
        const user = users.get(req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                status: user.status,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Failed to get user profile:', error);
        return res.status(500).json({ error: 'Failed to get user profile' });
    }
});

// Update user profile
app.put('/api/user/profile', authenticate, async (req, res) => {
    try {
        const { name, username } = req.body;
        const user = users.get(req.user.email);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = { ...user, name, username, updatedAt: new Date() };
        users.set(req.user.email, updatedUser);

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                username: updatedUser.username,
                role: updatedUser.role,
                status: updatedUser.status,
                lastLogin: updatedUser.lastLogin,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            }
        });
    } catch (error) {
        console.error('Failed to update user profile:', error);
        return res.status(500).json({ error: 'Failed to update user profile' });
    }
});

// Get user activity history (admin only)
app.get('/api/user/activity', authenticate, async (req, res) => {
    try {
        const user = users.get(req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only admin can view activity history
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Get all users with their last login times
        const activityHistory = Array.from(users.entries()).map(([email, user]) => ({
            email,
            lastLogin: user.lastLogin,
            status: user.status
        }));

        return res.status(200).json({
            activityHistory
        });
    } catch (error) {
        console.error('Failed to get activity history:', error);
        return res.status(500).json({ error: 'Failed to get activity history' });
    }
});

// Admin routes

// Get all users (admin only)
app.get('/api/admin/users', authenticate, async (req, res) => {
    try {
        const user = users.get(req.user.email);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const allUsers = Array.from(users.entries()).map(([email, user]) => ({
            id: user.id,
            name: user.name,
            email,
            username: user.username,
            role: user.role,
            status: user.status,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));

        return res.status(200).json({ users: allUsers });
    } catch (error) {
        console.error('Failed to get users:', error);
        return res.status(500).json({ error: 'Failed to get users' });
    }
});

// Update user role (admin only)
app.put('/api/admin/users/:email/role', authenticate, async (req, res) => {
    try {
        const user = users.get(req.user.email);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const targetEmail = req.params.email;
        const targetUser = users.get(targetEmail);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const updatedUser = { ...targetUser, role, updatedAt: new Date() };
        users.set(targetEmail, updatedUser);

        return res.status(200).json({
            message: 'User role updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: targetEmail,
                username: updatedUser.username,
                role: updatedUser.role,
                status: updatedUser.status,
                lastLogin: updatedUser.lastLogin,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            }
        });
    } catch (error) {
        console.error('Failed to update user role:', error);
        return res.status(500).json({ error: 'Failed to update user role' });
    }
});

// Error handling middleware
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
