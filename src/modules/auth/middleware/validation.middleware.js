const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const { registerSchema, loginSchema } = require('../schemas/auth.schema');
const { ValidationError } = require('../../../core/errors');

function validateWithSchema(schema) {
  const validate = ajv.compile(schema);
  return (req, res, next) => {
    const valid = validate(req.body);
    if (!valid) {
      const formattedErrors = validate.errors.map(err => ({
        field: err.instancePath.replace(/^\//, ''),
        message: err.message
      }));
      return next(new ValidationError('Validation failed', formattedErrors));
    }
    next();
  };
}

const validateRegistration = validateWithSchema(registerSchema);
const validateLogin = validateWithSchema(loginSchema);

module.exports = {
  validateRegistration,
  validateLogin
}; 