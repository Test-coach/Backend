import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRegistration, validateLogin } from '../../middleware/validation.middleware.js';

const router = express.Router();
const authController = new AuthController();

// Routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/me', authController.getCurrentUser);

export default router; 