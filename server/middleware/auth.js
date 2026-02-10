const jwt = require('jsonwebtoken');
const { query } = require('../config/database-mysql');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied. No token provided.'
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied. No token provided.'
        }
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cscaprep-super-secret-jwt-key-change-in-production');
      
      // Verify user exists and is active
      const userResult = await query(
        'SELECT id, email, full_name, track_id, is_active FROM users WHERE id = ?',
        [decoded.userId]
      );
      
      if (userResult.length === 0) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid token. User not found.'
          }
        });
      }
      
      if (!userResult[0].is_active) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Account is deactivated.'
          }
        });
      }
      
      req.user = userResult[0];
      next();
    } catch (jwtError) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token.'
        }
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const userResult = await query(
        'SELECT id, email, full_name, track_id, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
        req.user = userResult.rows[0];
      }
      
      next();
    } catch (jwtError) {
      next();
    }
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};
