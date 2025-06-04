const { body, validationResult } = require('express-validator');

// Validation result handler
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Registration validation rules
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('username').isLength({ min: 3 }),
  validateRequest
];

// Login validation rules
const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  validateRequest
];

module.exports = {
  validateRequest,
  validateRegistration,
  validateLogin
}; 