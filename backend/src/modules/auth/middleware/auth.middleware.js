const { JwtService } = require('../services/jwt.service');
const { AuthError } = require('../utils/errors');

const jwtService = new JwtService();

const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new AuthError('No token provided', 401);
    }

    const decoded = await jwtService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(new AuthError('Invalid token', 401));
  }
};

module.exports = { authenticateJWT }; 