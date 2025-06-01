export class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
} 