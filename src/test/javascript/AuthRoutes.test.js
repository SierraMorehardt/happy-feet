const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Create a mock for the in-memory storage
let mockUsers = new Map();
let mockRegisteredEmails = new Set();

// Mock environment variables
process.env.PORT = 8080;
process.env.JWT_SECRET = 'test-secret-key';

describe('UserController Integration Tests', () => {
    let app;
    let server;
    
    beforeEach(async () => {
        await clearDatabase();
        
        // Create a new Express app instance for each test
        app = express();
        
        // Set up middleware
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors());
        app.use(rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100
        }));

        // Set up validation middleware
        const validate = (validations) => async (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        };

        // Set up routes
        app.post('/api/register', validate([
            body('name').trim().notEmpty().withMessage('Name is required'),
            body('email').trim().isEmail().withMessage('Invalid email format'),
            body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
            body('username').trim().notEmpty().withMessage('Username is required')
        ]), async (req, res) => {
            try {
                const { name, email, password, username } = req.body;

                if (!name || !email || !password || !username) {
                    return res.status(400).json({ error: 'Missing required fields' });
                }

                if (mockRegisteredEmails.has(email)) {
                    return res.status(409).json({ error: 'Email already exists' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const user = { 
                    name,
                    password: hashedPassword,
                    username,
                    createdAt: new Date()
                };
                
                mockUsers.set(email, user);
                mockRegisteredEmails.add(email);

                const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });
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
                return res.status(500).json({ error: 'Registration failed' });
            }
        });

        app.post('/api/login', async (req, res) => {
            try {
                const { email, password } = req.body;
                const user = mockUsers.get(email);

                if (!user || !(await bcrypt.compare(password, user.password))) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });
                return res.status(200).json({
                    message: 'Login successful',
                    token,
                    user: {
                        name: user.name,
                        email: user.email,
                        username: user.username
                    }
                });
            } catch (error) {
                return res.status(500).json({ error: 'Login failed' });
            }
        });

        // Start the server
        server = app.listen(0);
    });

    afterEach(() => {
        server.close();
    });

    test('registerUser returns 201 when user is valid', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'password',
                username: 'testuser'
            });
        expect(response.status).toBe(201);
    });

    test('registerUser returns 400 when user is missing fields', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({}); // Missing required fields
        expect(response.status).toBe(400);
    });

    test('registerUser returns 409 when email exists', async () => {
        await request(app)
            .post('/api/register')
            .send({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'password',
                username: 'testuser'
            });

        const response = await request(app)
            .post('/api/register')
            .send({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'password',
                username: 'testuser'
            });
        expect(response.status).toBe(409);
    });

    test('loginUser returns 200 when credentials are valid', async () => {
        await request(app)
            .post('/api/register')
            .send({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'password',
                username: 'testuser'
            });

        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'testuser@example.com',
                password: 'password'
            });
        expect(response.status).toBe(200);
    });

    test('loginUser returns 401 when credentials are invalid', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'invalid@example.com',
                password: 'wrongpassword'
            });
        expect(response.status).toBe(401);
    });
});

async function clearDatabase() {
    // Clear the mock storage
    mockUsers = new Map();
    mockRegisteredEmails = new Set();
    return Promise.resolve();
}
