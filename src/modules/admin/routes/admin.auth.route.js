const express = require("express");
const { validateRegistration, validateLogin, validateAdminLogin } = require('../middleware/admin.validation.middleware');
const authController = require('../controllers/admin.auth.controller');

const router = express.Router();

// Routes
router.post('/register', validateRegistration, authController.register.bind(authController));
router.post('/login', validateAdminLogin, authController.login.bind(authController));

module.exports = router;