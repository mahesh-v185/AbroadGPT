const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Start study session
router.post('/start', authMiddleware, [
  body('moduleId').isInt().withMessage('Module ID must be an integer'),
  body('sessionType').isIn(['LEARN', 'PRACTICE', 'RECALL', 'TEST']).withMessage('Invalid session type')
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

    const { moduleId, sessionType } = req.body;

    // Verify module access
    const moduleResult = await query(
      `SELECT m.title, s.track_id
       FROM modules m
       JOIN subjects s ON m.subject_id = s.id
       WHERE m.id = $1`,
      [moduleId]
    );

    if (moduleResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Module not found'
        }
      });
    }

    const module = moduleResult.rows[0];

    // Verify user has access to this track
    const userTrackResult = await query(
      'SELECT track_id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userTrackResult.rows[0].track_id !== module.track_id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied to this module'
        }
      });
    }

    // Create study session
    const result = await query(
      `INSERT INTO study_sessions (user_id, module_id, start_time, session_type)
       VALUES ($1, $2, NOW(), $3)
       RETURNING id, user_id, module_id, start_time, session_type`,
      [req.user.id, moduleId, sessionType]
    );

    const session = result.rows[0];

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, activity_type, activity_data) VALUES ($1, $2, $3)',
      [
        req.user.id,
        'SESSION_START',
        JSON.stringify({
          sessionId: session.id,
          moduleId,
          sessionType
        })
      ]
    );

    res.status(201).json({
      message: 'Study session started',
      data: {
        id: session.id,
        moduleId: session.module_id,
        startTime: session.start_time,
        sessionType: session.session_type
      }
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to start study session'
      }
    });
  }
});

// End study session
router.post('/:sessionId/end', authMiddleware, [
  body('durationMinutes').isInt({ min: 0 }).withMessage('Duration must be a positive integer'),
  body('questionsAttempted').optional().isInt({ min: 0 }).withMessage('Questions attempted must be a positive integer'),
  body('questionsCorrect').optional().isInt({ min: 0 }).withMessage('Questions correct must be a positive integer'),
  body('score').optional().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100')
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

    const { sessionId } = req.params;
    const { durationMinutes, questionsAttempted = 0, questionsCorrect = 0, score } = req.body;

    // Verify session belongs to user
    const sessionResult = await query(
      `SELECT ss.*, m.title as module_title
       FROM study_sessions ss
       JOIN modules m ON ss.module_id = m.id
       WHERE ss.id = $1 AND ss.user_id = $2`,
      [sessionId, req.user.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Study session not found'
        }
      });
    }

    const session = sessionResult.rows[0];

    if (session.end_time) {
      return res.status(400).json({
        error: {
          code: 'SESSION_ALREADY_ENDED',
          message: 'Study session has already ended'
        }
      });
    }

    // Update session
    await query(
      `UPDATE study_sessions 
       SET end_time = NOW(), 
           duration_minutes = $1,
           questions_attempted = $2,
           questions_correct = $3,
           score = $4
       WHERE id = $5 AND user_id = $6`,
      [durationMinutes, questionsAttempted, questionsCorrect, score, sessionId, req.user.id]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, activity_type, activity_data) VALUES ($1, $2, $3)',
      [
        req.user.id,
        'SESSION_END',
        JSON.stringify({
          sessionId,
          durationMinutes,
          questionsAttempted,
          questionsCorrect,
          score
        })
      ]
    );

    res.json({
      message: 'Study session ended',
      data: {
        id: parseInt(sessionId),
        moduleId: session.module_id,
        moduleTitle: session.module_title,
        startTime: session.start_time,
        endTime: new Date(),
        durationMinutes,
        sessionType: session.session_type,
        questionsAttempted,
        questionsCorrect,
        score
      }
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to end study session'
      }
    });
  }
});

// Get study session history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const result = await query(
      `SELECT ss.id, ss.module_id, m.title as module_title, s.name as subject_name,
              ss.start_time, ss.end_time, ss.duration_minutes, ss.session_type,
              ss.questions_attempted, ss.questions_correct, ss.score
       FROM study_sessions ss
       JOIN modules m ON ss.module_id = m.id
       JOIN subjects s ON m.subject_id = s.id
       WHERE ss.user_id = $1
       ORDER BY ss.start_time DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), parseInt(offset)]
    );

    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) as total FROM study_sessions WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      data: {
        sessions: result.rows.map(row => ({
          id: row.id,
          moduleId: row.module_id,
          moduleTitle: row.module_title,
          subjectName: row.subject_name,
          startTime: row.start_time,
          endTime: row.end_time,
          durationMinutes: row.duration_minutes,
          sessionType: row.session_type,
          questionsAttempted: row.questions_attempted,
          questionsCorrect: row.questions_correct,
          score: row.score
        })),
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < parseInt(countResult.rows[0].total)
        }
      }
    });
  } catch (error) {
    console.error('Get session history error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get session history'
      }
    });
  }
});

module.exports = router;
