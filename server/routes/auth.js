const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Use MySQL database
const { query, execute } = require('../config/database-mysql');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('fullName').isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('trackId').isInt({ min: 1, max: 2 }).withMessage('Invalid track ID')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

// Helper functions
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'cscaprep-super-secret-jwt-key-change-in-production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register endpoint
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { email, password, fullName, trackId } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUser.length > 0) {
      return res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await execute(
      'INSERT INTO users (email, password_hash, full_name, track_id) VALUES (?, ?, ?, ?)',
      [email.toLowerCase(), passwordHash, fullName, trackId || 1]
    );

    // Generate tokens
    const userId = result.insertId;
    const token = generateToken(userId);

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: {
          id: userId,
          email,
          fullName,
          trackId: trackId || 1
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

// Login endpoint
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const { email, password } = req.body;

    // Find user
    const users = await query(
      `SELECT id, email, password_hash, full_name, track_id, is_active 
       FROM users WHERE email = ?`,
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Account is deactivated'
        }
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          trackId: user.track_id
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Login failed'
      }
    });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await logActivity(req.user.id, 'LOGOUT', { timestamp: new Date().toISOString() });

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Logout failed'
      }
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Refresh token required'
        }
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Verify user still exists and is active
    const users = await query(
      'SELECT id, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid refresh token'
        }
      });
    }

    const newToken = generateToken(decoded.userId);

    res.json({
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token'
      }
    });
  }
});

module.exports = router;
