const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('../../../db/postgres');
const { jwtConfig, passwordConfig } = require('../../../config/auth.config');
const { AuthError } = require('../utils/errors');

class JwtService {
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
    const client = await pool.connect();
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
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      return rows[0];
    } finally {
      client.release();
    }
  }
}

module.exports = { JwtService }; 