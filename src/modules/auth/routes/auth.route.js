const express = require('express');
const { AuthController } = require('../controllers/auth.controller');
const { validateRegistration, validateLogin } = require('../middleware/validation.middleware');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();
const authController = new AuthController();

// Routes
router.post('/register', validateRegistration, authController.register.bind(authController));
router.post('/login', validateLogin, authController.login.bind(authController));
router.get('/me', authenticateJWT, authController.getProfile.bind(authController));

module.exports = router; 