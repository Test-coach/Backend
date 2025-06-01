import { AuthError } from '../utils/errors.js';

export default class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async register(request, reply) {
    try {
      const { username, password, email } = request.body;
      const user = await this.authService.register({ username, password, email });
      return reply.code(201).send({
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return reply.code(error.statusCode).send({ error: error.message });
      }
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }

  async login(request, reply) {
    try {
      const { username, password } = request.body;
      const result = await this.authService.login(username, password);
      return reply.code(200).send(result);
    } catch (error) {
      if (error instanceof AuthError) {
        return reply.code(error.statusCode).send({ error: error.message });
      }
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  }
} 