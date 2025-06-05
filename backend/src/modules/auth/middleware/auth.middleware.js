const { JwtService } = require('../services/jwt.service');
const { AuthError } = require('../utils/errors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const jwtService = new JwtService();

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AuthError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthError('Invalid token format', 401);
    }

    const decoded = await jwtService.verifyToken(token);
    
    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        userRole: true
      }
    });

    if (!user) {
      throw new AuthError('User not found', 404);
    }

    if (!user.is_active) {
      throw new AuthError('User account is inactive', 403);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      permissions: user.userRole?.permissions || {}
    };

    next();
  } catch (error) {
    next(error);
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AuthError('Insufficient permissions', 403));
    }

    next();
  };
};

const authorizePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthError('Authentication required', 401));
    }

    const { permissions } = req.user;
    
    // Check if user has all permissions
    if (permissions.all === true) {
      return next();
    }

    // Check specific permission
    const hasPermission = permission.split('.').reduce((obj, key) => {
      return obj && obj[key];
    }, permissions);

    if (!hasPermission) {
      return next(new AuthError('Insufficient permissions', 403));
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRole,
  authorizePermission
}; 