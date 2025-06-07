const registerSchema = {
  type: 'object',
  required: ['email', 'password', 'username'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
    username: { type: 'string', minLength: 3 }
  }
};

const loginSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' }
  }
};

module.exports = {
  registerSchema,
  loginSchema
}; 