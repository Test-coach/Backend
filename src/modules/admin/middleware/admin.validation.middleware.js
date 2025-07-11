const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../../../core/errors');
const { adminLoginSchema } = require('../schema/admin.auth.schema');
const { AuthError } = require('../../shared/utils/error');

// Validation result handler
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
    throw new ValidationError('Validation failed', formattedErrors);
  }
  next();
};

// Registration validation rules
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  validateRequest
];

// Login validation rules
const validateLogin = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('username')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .exists()
    .withMessage('Password is required'),
  body()
    .custom((value, { req }) => {
      if (!req.body.email && !req.body.username) {
        throw new Error('Either email or username is required');
      }
      return true;
    }),
  validateRequest
];

function validateAdminLogin(req, res, next) {
  const { error } = adminLoginSchema.validate(req.body);
  if (error) {
    return new AuthError(error.details[0].message, 400).sendResponse(res);
  }
  next();
}

module.exports = {
  validateRequest,
  validateRegistration,
  validateLogin,
  validateAdminLogin
}; 