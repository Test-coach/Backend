import { body, validationResult } from 'express-validator';

// Validation result handler
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Registration validation rules
export const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('username').trim().isLength({ min: 3 }),
  validateRequest
];

// Login validation rules
export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  validateRequest
]; 