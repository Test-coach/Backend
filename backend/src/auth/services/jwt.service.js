import { AuthError } from '../utils/errors.js';

export default class AuthService {
  constructor(fastify, userRepository) {
    this.fastify = fastify;
    this.userRepository = userRepository;
  }

  async register({ username, password, email }) {
    // Check if user exists
    const existingUsers = await this.userRepository.findByUsernameOrEmail(username, email);
    if (existingUsers.length > 0) {
      throw new AuthError('User already exists', 400);
    }

    const hashedPassword = await this.fastify.bcrypt.hash(password);

    // Create user
    const user = await this.userRepository.createUser({
      username,
      password: hashedPassword,
      email
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email
    };
  }

  async login(username, password) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new AuthError('Invalid credentials', 401);
    }

    const validPassword = await this.fastify.bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new AuthError('Invalid credentials', 401);
    }

    const token = this.fastify.jwt.sign({ 
      id: user.id,
      username: user.username 
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  }
} 