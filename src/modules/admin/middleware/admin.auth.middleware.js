const { JwtService } = require('../services/admin.jwt.service');
const { AuthError } = require('../../shared/utils/error');

const jwtService = new JwtService();

async function isAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new AuthError('No token provided', 401).sendResponse(res);
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return new AuthError('Invalid token format', 401).sendResponse(res);
    }
    // Verify token and get user id
    const decoded = await jwtService.verifyToken(token);
    const user = await jwtService.findUserById(decoded.id);
    if (!user || user.role !== 'admin') {
      return new AuthError('Forbidden: Admins only', 403).sendResponse(res);
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode) {
      return new AuthError(error.message, error.statusCode).sendResponse(res);
    }
    return new AuthError('Invalid or expired token', 401).sendResponse(res);
  }
}

module.exports = { isAdmin };
