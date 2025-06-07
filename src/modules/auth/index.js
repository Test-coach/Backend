const authRoutes = require('./routes/auth.route');
const { authenticateJWT } = require('./middleware/auth.middleware');
const { JwtService } = require('./services/jwt.service');
const { AuthController } = require('./controllers/auth.controller');

module.exports = {
  authRoutes,
  authenticateJWT,
  JwtService,
  AuthController
}; 