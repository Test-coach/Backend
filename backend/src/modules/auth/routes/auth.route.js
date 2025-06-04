const express = require('express');
const { AuthController } = require('../controllers/auth.controller');
const { validateRegistration, validateLogin } = require('../middleware/validation.middleware');

const router = express.Router();
const authController = new AuthController();

// Routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/me', authController.getCurrentUser);

module.exports = router; 