import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { postgresConfig } from '../../config/database.config.js';
import { jwtConfig, passwordConfig } from '../../config/auth.config.js';
import { AuthError } from '../utils/errors.js';

const pgPool = new Pool(postgresConfig);

export class JwtService {
  constructor() {
    this.secret = jwtConfig.secret;
    this.saltRounds = passwordConfig.saltRounds;
  }

  async generateToken(userId) {
    return jwt.sign({ id: userId }, this.secret, { expiresIn: jwtConfig.expiresIn });
  }

  async verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (err) {
      throw new AuthError('Invalid token', 401);
    }
  }

  async hashPassword(password) {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  async findUserById(userId) {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (!rows[0]) {
        throw new AuthError('User not found', 404);
      }
      return rows[0];
    } finally {
      client.release();
    }
  }

  async findUserByEmail(email) {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      return rows[0];
    } finally {
      client.release();
    }
  }
}

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