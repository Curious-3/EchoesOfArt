// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Auth middleware to protect routes
export const protect = async (req, res, next) => {
  try {
    //  Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    //  Extract token
    const token = authHeader.split(' ')[1];
    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    //  Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

    //  Get user from database (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    //  Attach user to request object
    req.user = user;

    //  Proceed to next middleware or route
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token is not valid or expired' });
  }
};

// Export default for ES Modules
//export default protect;
