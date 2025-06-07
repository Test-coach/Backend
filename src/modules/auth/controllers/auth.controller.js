const { JwtService } = require('../services/jwt.service');
const { AuthError } = require('../utils/errors');
const prisma = require('../../../db/prisma');

class AuthController {
  constructor() {
    this.jwtService = new JwtService();
  }

  async register(req, res, next) {
    try {
      const { email, username, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        throw new AuthError('Email or username already exists', 400);
      }

      // Hash password
      const hashedPassword = await this.jwtService.hashPassword(password);

      // Create user with default preferences
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password_hash: hashedPassword,
          preferences: {
            create: {} // Creates default preferences
          }
        },
        select: {
          id: true,
          email: true,
          username: true
        }
      });

      // Generate token
      const token = await this.jwtService.generateToken(user.id);

      res.status(201).json({
        message: 'User registered successfully',
        user,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new AuthError('Invalid credentials', 401);
      }

      // Verify password
      const isValidPassword = await this.jwtService.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new AuthError('Invalid credentials', 401);
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() }
      });

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
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          username: true,
          profile: true,
          preferences: true
        }
      });

      if (!user) {
        throw new AuthError('User not found', 404);
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, avatar, bio, phoneNumber } = req.body;

      const profile = await prisma.userProfile.upsert({
        where: { user_id: req.user.id },
        update: {
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatar,
          bio,
          phone: phoneNumber
        },
        create: {
          user_id: req.user.id,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatar,
          bio,
          phone: phoneNumber
        }
      });

      res.json({
        message: 'Profile updated successfully',
        profile
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const { theme, emailNotifications, pushNotifications, privacySettings } = req.body;

      const preferences = await prisma.userPreference.update({
        where: { user_id: req.user.id },
        data: {
          theme,
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          privacy_settings: privacySettings
        }
      });

      res.json({
        message: 'Preferences updated successfully',
        preferences
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AuthController }; 