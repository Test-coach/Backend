const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { AuthError } = require('../utils/errors');
const prisma = require('../../../db/prisma');

class JwtService {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  async generateToken(userId) {
    try {
      const token = jwt.sign({ id: userId }, this.secret, {
        expiresIn: this.expiresIn
      });

      // Store token in user_sessions
      await prisma.userSession.create({
        data: {
          user_id: userId,
          token,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          device_info: {},
          ip_address: null
        }
      });

      return token;
    } catch (error) {
      const authError = new AuthError('Error generating token', 500);
      throw authError;
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret);
      
      // Check if token exists in user_sessions
      const session = await prisma.userSession.findFirst({
        where: {
          token,
          expires_at: {
            gt: new Date()
          }
        }
      });

      if (!session) {
        const authError = new AuthError('Invalid or expired token', 401);
        throw authError;
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const authError = new AuthError('Invalid or expired token', 401);
        throw authError;
      }
      const authError = new AuthError('Invalid token', 401);
      throw authError;
    }
  }

  async hashPassword(password) {
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  async findUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        is_active: true,
        is_verified: true
      }
    });

    if (!user) {
      const authError = new AuthError('User not found', 404);
      throw authError;
    }

    return user;
  }

  async findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password_hash: true,
        role: true,
        is_active: true,
        is_verified: true
      }
    });
  }

  async invalidateToken(token) {
    await prisma.userSession.deleteMany({
      where: { token }
    });
  }

  async invalidateAllUserTokens(userId) {
    await prisma.userSession.deleteMany({
      where: { user_id: userId }
    });
  }
}

module.exports = { JwtService }; 