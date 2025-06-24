const { JwtService } = require('../services/admin.jwt.service');

const jwtService = new JwtService();

async function isAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    // Verify token and get user id
    const decoded = await jwtService.verifyToken(token);
    const user = await jwtService.findUserById(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { isAdmin };
