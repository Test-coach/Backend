export const registerSchema = {
    body: {
      type: 'object',
      required: ['username', 'password', 'email'],
      properties: {
        username: { type: 'string', minLength: 3 },
        password: { type: 'string', minLength: 6 },
        email: { type: 'string', format: 'email' }
      }
    }
  };
  
  export const loginSchema = {
    body: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string' },
        password: { type: 'string' }
      }
    }
  }; 