const { JwtService } = require('../services/jwt.service');
const { Pool } = require('pg');
const { AuthError } = require('../utils/errors');
const { pool } = require('../../../db/postgres');

class AuthController {
  constructor() {
    this.jwtService = new JwtService();
  }

  async register(req, res, next) {
    const client = await pool.connect();
    try {
      const { email, username, password } = req.body;

      // Check if user already exists
      const { rows: existingUsers } = await client.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUsers.length > 0) {
        throw new AuthError('Email or username already exists', 400);
      }

      // Hash password
      const hashedPassword = await this.jwtService.hashPassword(password);

      // Create user
      const { rows: [user] } = await client.query(
        'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username',
        [email, username, hashedPassword]
      );

      // Generate token
      const token = await this.jwtService.generateToken(user.id);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      });
    } catch (error) {
      next(error);
    } finally {
      client.release();
    }
  }

  async login(req, res, next) {
    const client = await pool.connect();
    try {
      const { email, password } = req.body;

      // Find user
      const { rows: [user] } = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (!user) {
        throw new AuthError('Invalid credentials', 401);
      }

      // Verify password
      const isValidPassword = await this.jwtService.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new AuthError('Invalid credentials', 401);
      }

      // Generate token
      const token = await this.jwtService.generateToken(user.id);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      });
    } catch (error) {
      next(error);
    } finally {
      client.release();
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await this.jwtService.findUserById(req.user.id);
      res.json({
        id: user.id,
        email: user.email,
        username: user.username
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AuthController }; 