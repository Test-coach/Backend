const { JwtService } = require('../services/jwt.service');
const { Pool } = require('pg');
const { AuthError } = require('../utils/errors');
const { postgresConfig } = require('../../../config/database.config');

if (!postgresConfig.connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pgPool = new Pool(postgresConfig);
const jwtService = new JwtService();

class AuthController {
  async register(req, res) {
    try {
      const { email, password, username } = req.body;
      
      // Check if user exists
      const existingUser = await jwtService.findUserByEmail(email);
      if (existingUser) {
        throw new AuthError('User already exists', 400);
      }

      // Hash password
      const hashedPassword = await jwtService.hashPassword(password);

      // Create user
      const client = await pgPool.connect();
      try {
        const { rows: newUser } = await client.query(
          'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id, email, username',
          [email, hashedPassword, username]
        );

        // Generate token
        const token = await jwtService.generateToken(newUser[0].id);

        res.status(201).json({
          message: 'User registered successfully',
          user: {
            id: newUser[0].id,
            email: newUser[0].email,
            username: newUser[0].username
          },
          token
        });
      } finally {
        client.release();
      }
    } catch (err) {
      if (err instanceof AuthError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error(err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await jwtService.findUserByEmail(email);
      if (!user) {
        throw new AuthError('Invalid credentials', 401);
      }

      // Verify password
      const validPassword = await jwtService.comparePassword(password, user.password);
      if (!validPassword) {
        throw new AuthError('Invalid credentials', 401);
      }

      // Generate token
      const token = await jwtService.generateToken(user.id);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      });
    } catch (err) {
      if (err instanceof AuthError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error(err);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new AuthError('No token provided', 401);
      }

      const decoded = await jwtService.verifyToken(token);
      const user = await jwtService.findUserById(decoded.id);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      });
    } catch (err) {
      if (err instanceof AuthError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error(err);
      res.status(500).json({ error: 'Failed to get user data' });
    }
  }
}

module.exports = { AuthController }; 