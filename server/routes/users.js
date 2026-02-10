const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database-mysql');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, full_name, track_id, created_at, is_active
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const user = result[0];

    res.json({
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        trackId: user.track_id,
        createdAt: user.created_at,
        isActive: user.is_active
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user profile'
      }
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, [
  body('fullName').optional().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters')
], async (req, res) => {
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

    const { fullName } = req.body;
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (fullName) {
      updateFields.push(`full_name = $${paramIndex++}`);
      updateValues.push(fullName);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No valid fields to update'
        }
      });
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(req.user.id);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING full_name, updated_at
    `;

    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, activity_type, activity_data) VALUES ($1, $2, $3)',
      [req.user.id, 'PROFILE_UPDATE', JSON.stringify({ fields: Object.keys(req.body) })]
    );

    res.json({
      message: 'Profile updated successfully',
      data: {
        fullName: result.rows[0].full_name,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update profile'
      }
    });
  }
});

// Get user progress
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    // Get overall progress
    const userResult = await query(
      `SELECT current_streak, longest_streak, total_study_minutes, progress_percentage 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    // Get weekly progress
    const weeklyResult = await query(
      `SELECT DATE(created_at) as date, 
              SUM(CASE WHEN activity_type = 'DAILY_COMPLETE' THEN 1 ELSE 0 END) as completed,
              COUNT(*) as activities
       FROM activity_logs 
       WHERE user_id = $1 
         AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [req.user.id]
    );

    // Get skill heatmap data
    const heatmapResult = await query(
      `SELECT s.id as subject_id, s.name as subject_name,
              COUNT(m.id) as total_modules,
              COUNT(CASE WHEN up.status = 'COMPLETED' THEN 1 END) as completed_modules,
              AVG(CASE WHEN up.status = 'COMPLETED' THEN up.score_percentage END) as average_score,
              SUM(up.time_spent_minutes) as total_time_minutes
       FROM subjects s
       LEFT JOIN modules m ON s.id = m.subject_id
       LEFT JOIN user_progress up ON m.id = up.module_id AND up.user_id = $1
       WHERE s.track_id = (SELECT track_id FROM users WHERE id = $1)
       GROUP BY s.id, s.name
       ORDER BY s.order_index`,
      [req.user.id]
    );

    const user = userResult.rows[0] || {};

    res.json({
      data: {
        progressPercentage: user.progress_percentage || 0,
        currentStreak: user.current_streak || 0,
        longestStreak: user.longest_streak || 0,
        totalStudyMinutes: user.total_study_minutes || 0,
        weeklyProgress: weeklyResult.rows.map(row => ({
          date: row.date,
          minutes: row.completed * 90, // Assuming 90 min per completed day
          completed: row.completed > 0
        })),
        subjects: heatmapResult.rows.map(subject => ({
          subjectId: subject.subject_id,
          subjectName: subject.subject_name,
          masteryLevel: subject.average_score || 0,
          modulesCompleted: subject.completed_modules,
          totalModules: subject.total_modules,
          progressPercentage: subject.total_modules > 0 
            ? (subject.completed_modules / subject.total_modules) * 100 
            : 0,
          timeSpentMinutes: subject.total_time_minutes || 0
        }))
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user progress'
      }
    });
  }
});

// Get user heatmap
router.get('/heatmap', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT s.id as subject_id, s.name as subject_name,
              COUNT(m.id) as total_modules,
              COUNT(CASE WHEN up.status = 'COMPLETED' THEN 1 END) as completed_modules,
              AVG(CASE WHEN up.status = 'COMPLETED' THEN up.score_percentage END) as average_score,
              SUM(up.time_spent_minutes) as total_time_minutes
       FROM subjects s
       LEFT JOIN modules m ON s.id = m.subject_id
       LEFT JOIN user_progress up ON m.id = up.module_id AND up.user_id = $1
       WHERE s.track_id = (SELECT track_id FROM users WHERE id = $1)
       GROUP BY s.id, s.name
       ORDER BY s.order_index`,
      [req.user.id]
    );

    res.json({
      data: result.rows.map(subject => ({
        subjectId: subject.subject_id,
        subjectName: subject.subject_name,
        masteryLevel: subject.average_score || 0,
        modulesCompleted: subject.completed_modules,
        totalModules: subject.total_modules,
        progressPercentage: subject.total_modules > 0 
          ? (subject.completed_modules / subject.total_modules) * 100 
          : 0,
        timeSpentMinutes: subject.total_time_minutes || 0
      }))
    });
  } catch (error) {
    console.error('Get heatmap error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get skill heatmap'
      }
    });
  }
});

module.exports = router;
