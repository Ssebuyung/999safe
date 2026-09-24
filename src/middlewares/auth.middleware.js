const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and protect routes
 * Token should be sent in Authorization header as: Bearer <token>
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check Authorization header for token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route - No token provided'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route - Invalid token'
    });
  }
};

/**
 * Optional: Middleware to check user role (for future use)
 * Add roles to User model: role: { type: String, enum: ['user', 'admin'], default: 'user' }
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    next();
  };
};
