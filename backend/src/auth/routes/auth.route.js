import AuthController from '../controllers/auth.controller.js';
import AuthService from '../services/jwt.service.js';
import UserRepository from '../repositories/userRepository.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

export default async function authRoutes(fastify) {
  // Initialize dependencies
  const userRepository = new UserRepository(fastify);
  const authService = new AuthService(fastify, userRepository);
  const authController = new AuthController(authService);

  // Register routes
  fastify.post('/register', {
    schema: registerSchema,
    handler: authController.register.bind(authController)
  });

  fastify.post('/login', {
    schema: loginSchema,
    handler: authController.login.bind(authController)
  });

  // Add health check for microservice readiness
  fastify.get('/health', async () => ({
    status: 'OK',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  }));
} 