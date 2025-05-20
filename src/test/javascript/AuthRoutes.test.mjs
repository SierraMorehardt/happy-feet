import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { validationResult, body } from 'express-validator';
import { UserService } from '../../main/javascript/com/service/UserService.js';

// Set up mocks before importing the controller
jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed-password')
}));

// Mock JWT
const mockJwtSign = jest.fn().mockReturnValue('mocked-jwt-token');
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  sign: mockJwtSign
}));

// Import JWT and other modules after setting up the mocks
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Create a mock UserService class that extends the real one
class MockUserService extends UserService {
  constructor() {
    const mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn()
    };
    super(mockRepository);
    
    // Setup default mock implementations
    this.register = jest.fn();
    this.login = jest.fn();
    this.getProfile = jest.fn();
    this.updateProfile = jest.fn();
  }
}

// Mock environment variables
process.env.PORT = 8080;
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

// Import the controller after setting up mocks
import { UserController } from '../../main/javascript/com/controller/UserController.js';

// Test suite
describe('UserController Integration Tests', () => {
    let app;
    let userController;
    let mockUserService;
    
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        
        // Create a new Express app for testing
        app = express();
        
        // Set up middleware
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors());
        app.use(rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100
        }));

        // Create a mock UserService instance
        mockUserService = new MockUserService();
        
        // Setup default mock implementations
        mockUserService.register.mockImplementation((userData) => {
            return Promise.resolve({
                id: '123',
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        });
        
        mockUserService.login.mockImplementation((email, password) => {
            return Promise.resolve({
                user: {
                    id: '123',
                    email: email,
                    firstName: 'Test',
                    lastName: 'User'
                },
                token: 'mocked-jwt-token'
            });
        });
        
        mockUserService.getProfile.mockResolvedValue({
            id: '123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
        });
        
        mockUserService.updateProfile.mockImplementation((userId, updates) => {
            return Promise.resolve({
                id: userId,
                email: updates.email || 'test@example.com',
                firstName: updates.firstName || 'Test',
                lastName: updates.lastName || 'User'
            });
        });

        // Mock JWT sign function
        jest.mock('jsonwebtoken', () => ({
            ...jest.requireActual('jsonwebtoken'),
            sign: jest.fn().mockReturnValue('mocked-jwt-token')
        }));
        
        // Initialize UserController with mock UserService
        userController = new UserController(mockUserService);
        
        // Set up routes using the router from the controller
        app.use('/api', userController.router);
    });

    describe('POST /api/register', () => {
        it('should register a new user', async () => {
            const mockUser = {
                id: '123',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            // Reset and setup the mock
            mockUserService.register.mockReset();
            mockUserService.register.mockResolvedValue(mockUser);
            
            const response = await request(app)
                .post('/api/register')
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    password: 'password123'
                });
                
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('id', '123');
            expect(response.body.user.email).toBe('test@example.com');
            expect(response.body.user.firstName).toBe('Test');
            expect(response.body.user.lastName).toBe('User');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('firstName', 'Test');
            expect(response.body.user).toHaveProperty('lastName', 'User');
            expect(response.body.user).not.toHaveProperty('password');
            expect(mockUserService.register).toHaveBeenCalledWith({
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'password123'
            });
        });

        it('should return 409 if email already exists', async () => {
            // Mock the UserService to throw a conflict error
            mockUserService.register.mockRejectedValueOnce({
                statusCode: 409,
                message: 'Email already in use'
            });
            
            const response = await request(app)
                .post('/api/register')
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'existing@example.com',
                    password: 'password123'
                });
                
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('error', 'Email already in use');
            expect(mockUserService.register).toHaveBeenCalledWith({
                firstName: 'Test',
                lastName: 'User',
                email: 'existing@example.com',
                password: 'password123'
            });
        });
    });

    describe('POST /api/login', () => {
        it('should login with valid credentials', async () => {
            // Mock the UserService login method
            mockUserService.login.mockReset();
            mockUserService.login.mockResolvedValue({
                user: {
                    id: '123',
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User'
                },
                token: 'mocked-jwt-token'
            });
            
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });
                
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('test@example.com');
            expect(response.body.user.firstName).toBe('Test');
            expect(response.body.user.lastName).toBe('User');
            expect(response.body).toHaveProperty('token');
            expect(mockUserService.login).toHaveBeenCalledWith('test@example.com', 'password123');
        });
        
        it('should return 401 with invalid credentials', async () => {
            // Mock the UserService to throw an unauthorized error
            mockUserService.login.mockReset();
            mockUserService.login.mockRejectedValue({
                statusCode: 401,
                message: 'Invalid credentials'
            });
            
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'wrongpassword'
                });
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid credentials');
            expect(mockUserService.login).toHaveBeenCalledWith('nonexistent@example.com', 'wrongpassword');
        });
    });
});
