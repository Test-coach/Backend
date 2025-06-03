import { JwtService } from '../auth/services/jwt.service.js';
import { AuthError } from '../auth/utils/errors.js';

const jwtService = new JwtService();

export const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new AuthError('No token provided', 401);
    }

    const decoded = await jwtService.verifyToken(token);
    const user = await jwtService.findUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
}; 