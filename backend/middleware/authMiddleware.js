const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify user is authenticated via JWT
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from Bearer <token>
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_luxury_bag_token_key_123');

      // Add user info to request object
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found in system.' });
      }
      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return res.status(401).json({ message: 'Not authorized, token expired or invalid.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no authorization token.' });
  }
};

/**
 * Middleware to enforce admin roles
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access forbidden. Administrator privileges required.' });
  }
};

/**
 * Optional authentication middleware that parses JWT if present but doesn't block if absent
 */
const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_luxury_bag_token_key_123');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.error('Optional JWT Verification Error (ignored for guest):', error);
    }
  }
  next();
};

module.exports = { protect, adminOnly, optionalProtect };
