import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { validationResult, body } from 'express-validator';

// Set up mocks before importing the controller
jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compare: jest.fn().mockImplementation((password, hash) => {
    console.log(`Mock bcrypt.compare called with:`, { password, hash });
    return Promise.resolve(true);
  }),
  hash: jest.fn().mockResolvedValue('hashed-password')
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockImplementation((payload, secret, options) => {
    console.log('JWT sign called with:', { payload, secret, options });
    return 'mocked-jwt-token';
  })
}));

// Import JWT and other modules after setting up the mocks
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../../main/javascript/com/model/User.js';

// Mock the User model
jest.mock('../../main/javascript/com/model/User.js', () => {
  return {
    User: {
      create: jest.fn().mockImplementation((data) => ({
        ...data,
        id: '123',
        save: jest.fn().mockResolvedValue({
          ...data,
          id: '123',
          toJSON: () => {
            const { passwordHash, ...rest } = data;
            return rest;
          }
        })
      }))
    }
  };
});

// Mock the user repository
const mockUserRepository = {
  findByEmail: jest.fn(),
  save: jest.fn().mockImplementation(user => Promise.resolve({
    ...user,
    id: '123',
    toJSON: () => {
      const { passwordHash, ...rest } = user;
      return rest;
    }
  })),
};

// Import the actual UserController after mocks are set up
import { UserController } from '../../main/javascript/com/controller/UserController.js';

// Mock environment variables
process.env.PORT = 8080;
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

describe('UserController Integration Tests', () => {
    let app;
    let userController;
    
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

        // Create a mock bcrypt instance
        const mockBcrypt = {
            compare: jest.fn().mockResolvedValue(true),
            hash: jest.fn().mockResolvedValue('hashed-password')
        };
        
        // Mock JWT sign function
        const mockJwt = {
            sign: jest.fn().mockReturnValue('mocked-jwt-token')
        };
        
        // Initialize UserController with mock repository and bcrypt
        userController = new UserController(mockUserRepository, mockBcrypt);
        
        // Mock the JWT sign function
        jest.mock('jsonwebtoken', () => ({
            ...jest.requireActual('jsonwebtoken'),
            sign: mockJwt.sign
        }));
        
        // Set up routes
        app.post('/api/register', (req, res) => userController.registerUser(req, res));
        app.post('/api/login', (req, res) => userController.login(req, res));
    });

    describe('POST /api/register', () => {
        it('should register a new user', async () => {
            const mockUser = {
                id: '123',
                name: 'Test User',
                email: 'test@example.com',
                username: 'testuser'
            };
            
            // Mock the repository responses
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.save.mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/api/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    username: 'testuser',
                    password: 'password123',
                    age: 25,
                    gender: 'male',
                    currentWeeklyMileage: 10,
                    longestRecentRun: 5
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name', 'Test User');
            expect(response.body).toHaveProperty('email', 'test@example.com');
            expect(response.body).not.toHaveProperty('password');
            expect(mockUserRepository.save).toHaveBeenCalled();
        });

        it('should return 409 if email already exists', async () => {
            const existingUser = {
                id: '123',
                name: 'Existing User',
                email: 'existing@example.com',
                username: 'existinguser'
            };

            mockUserRepository.findByEmail.mockResolvedValue(existingUser);

            const response = await request(app)
                .post('/api/register')
                .send({
                    name: 'New User',
                    email: 'existing@example.com',
                    username: 'newuser',
                    password: 'password123'
                });

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('error', 'Email already in use');
            expect(mockUserRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('POST /api/login', () => {
        it('should login with valid credentials', async () => {
            // Enable debug logging for tests
            process.env.DEBUG = 'happy-feet:*';
            
            const mockUser = {
                id: '123',
                name: 'Test User',
                email: 'test@example.com',
                username: 'testuser',
                passwordHash: 'hashed-password',
                toJSON: function() {
                    const { passwordHash, ...rest } = this;
                    return rest;
                }
            };

            // Mock the repository to return our user
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            
            // Mock bcrypt compare to return true for the test
            jest.spyOn(bcrypt, 'compare').mockImplementation((password, hash) => {
                console.log(`Comparing password: ${password}, hash: ${hash}`);
                // Always return true for the test
                return Promise.resolve(true);
            });

            // Create a spy on jwt.sign
            const jwtSignSpy = jest.spyOn(jwt, 'sign');
            
            console.log('Sending login request...');
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            console.log('Response status:', response.status);
            console.log('Response body:', JSON.stringify(response.body, null, 2));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).not.toHaveProperty('passwordHash');
            expect(jwtSignSpy).toHaveBeenCalled();
            
            // Clean up the spy
            jwtSignSpy.mockRestore();
        });

        it('should return 401 with invalid credentials', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid credentials');
        });
    });
});
