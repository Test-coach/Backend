const { JwtService } = require('../services/jwt.service');
const { AuthError } = require('../utils/errors');
const prisma = require('../../../db/prisma');

const jwtService = new JwtService();

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const error = new AuthError('No token provided', 401);
      return error.sendResponse(res);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      const error = new AuthError('Invalid token format', 401);
      return error.sendResponse(res);
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
      const error = new AuthError('User not found', 404);
      return error.sendResponse(res);
    }

    if (!user.is_active) {
      const error = new AuthError('User account is inactive', 403);
      return error.sendResponse(res);
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
    if (error instanceof AuthError) {
      return error.sendResponse(res);
    }
    next(error);
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new AuthError('Authentication required', 401);
      return error.sendResponse(res);
    }

    if (!roles.includes(req.user.role)) {
      const error = new AuthError('Insufficient permissions', 403);
      return error.sendResponse(res);
    }

    next();
  };
};

const authorizePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new AuthError('Authentication required', 401);
      return error.sendResponse(res);
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
      const error = new AuthError('Insufficient permissions', 403);
      return error.sendResponse(res);
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRole,
  authorizePermission
}; 