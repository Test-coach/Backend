const { JwtService } = require('../services/jwt.service');
const { AuthError } = require('../utils/errors');
const prisma = require('../../../db/prisma');
const SuccessResponse = require('../utils/success');

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
        const error = new AuthError('Email or username already exists', 400);
        return error.sendResponse(res);
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
      const sendDate = {email: user.email}

      return new SuccessResponse('User registered successfully', { sendDate, token }).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
      next(error);
    }
  }

  async login(req, res) {
    try {
      const { email, username, password } = req.body;
      const identifier = email || username;

      if (!identifier) {
        const error = new AuthError('Email or username is required', 400);
        return error.sendResponse(res);
      }

      // Find user using jwtService
      const user = await this.jwtService.findUserByCredentials(identifier);
      if (!user) {
        const error = new AuthError('Invalid credentials', 401);
        return error.sendResponse(res);
      }

      // Verify password
      const isValidPassword = await this.jwtService.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        const error = new AuthError('Invalid credentials', 401);
        return error.sendResponse(res);
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() }
      });

      // Generate token
      const token = await this.jwtService.generateToken(user.id);

      const sendData = { email: user.email, username: user.username };
      return new SuccessResponse('Login successful', { sendData, token }).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
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
        const error = new AuthError('User not found', 404);
        return error.sendResponse(res);
      }

      return new SuccessResponse('Profile retrieved successfully', { user }).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
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

      return new SuccessResponse('Profile updated successfully', { profile }).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
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

      return new SuccessResponse('Preferences updated successfully', { preferences }).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
      next(error);
    }
  }
}

module.exports = { AuthController }; 