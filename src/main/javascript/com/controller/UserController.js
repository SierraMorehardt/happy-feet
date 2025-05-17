import { Router } from 'express';
import { UserRegistrationRequest } from '../dto/UserRegistrationRequest';
import { LoginRequest } from '../dto/LoginRequest';
import { User } from '../model/User';
import { compare } from 'bcrypt'; 

const router = Router();

class UserController {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async registerUser(req, res) {
        const request = new UserRegistrationRequest(req.body);
        if (!request.name || !request.email || !request.password) {
            return res.status(400).send('Required fields are missing');
        }

        if (await this.userRepository.findByEmail(request.email)) {
            return res.status(409).send('Email already in use');
        }

        const user = new User();
        user.setName(request.name);
        user.setEmail(request.email);

        user.setAge(request.age);
        user.setGender(request.gender);
        user.setCurrentWeeklyMileage(request.currentWeeklyMileage);
        user.setLongestRecentRun(request.longestRecentRun);
        user.setUsername(request.username);
        await this.userRepository.save(user);
        logger.info(`User registered successfully: ${user.getEmail()}`);
        return res.status(201).send(user);
    }

    async login(req, res) {
        const request = new LoginRequest(req.body);
        
        // Validate request
        if (!request.email || !request.password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        try {
            // Find user by email
            const user = await this.userRepository.findByEmail(request.email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Verify password
            const isValidPassword = await compare(request.password, user.getPassword());
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Login successful
            return res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.getId(),
                    name: user.getName(),
                    email: user.getEmail(),
                    username: user.getUsername()
                }
            });
        } catch (error) {
            logger.error('Login error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

router.post('/register', (req, res) => userController.registerUser(req, res));
router.post('/login', (req, res) => userController.login(req, res));

export default router;
