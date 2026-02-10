const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Submit question attempt
router.post('/:questionId/attempt', authMiddleware, [
  body('answer').notEmpty().withMessage('Answer is required'),
  body('sessionId').optional().isInt().withMessage('Session ID must be an integer')
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

    const { questionId } = req.params;
    const { answer, sessionId } = req.body;

    // Verify question exists and user has access
    const questionResult = await query(
      `SELECT q.correct_answer, q.module_id, m.title as module_title, s.track_id
       FROM questions q
       JOIN modules m ON q.module_id = m.id
       JOIN subjects s ON m.subject_id = s.id
       WHERE q.id = $1`,
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Question not found'
        }
      });
    }

    const question = questionResult.rows[0];

    // Verify user has access to this track
    const userTrackResult = await query(
      'SELECT track_id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userTrackResult.rows[0].track_id !== question.track_id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied to this question'
        }
      });
    }

    // Check if user has already attempted this question
    const existingAttempt = await query(
      'SELECT id FROM question_attempts WHERE user_id = $1 AND question_id = $2',
      [req.user.id, questionId]
    );

    if (existingAttempt.rows.length > 0) {
      return res.status(409).json({
        error: {
          code: 'ATTEMPT_EXISTS',
          message: 'Question already attempted'
        }
      });
    }

    // Calculate if answer is correct
    const isCorrect = answer === question.correct_answer;

    // Record attempt
    const result = await query(
      `INSERT INTO question_attempts (user_id, question_id, session_id, user_answer, is_correct, attempted_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, is_correct, attempted_at`,
      [req.user.id, questionId, sessionId, answer, isCorrect]
    );

    const attempt = result.rows[0];

    res.status(201).json({
      message: 'Question attempt recorded',
      data: {
        id: attempt.id,
        isCorrect: attempt.is_correct,
        attemptedAt: attempt.attempted_at
      }
    });
  } catch (error) {
    console.error('Submit question attempt error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to submit question attempt'
      }
    });
  }
});

// Get question attempts for a module
router.get('/attempts/:moduleId', authMiddleware, async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Verify module access
    const moduleResult = await query(
      `SELECT m.id, s.track_id
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

    // Get question attempts
    const result = await query(
      `SELECT qa.id, qa.question_id, q.question_text, qa.user_answer, 
              q.correct_answer, qa.is_correct, qa.time_taken_seconds, qa.attempted_at
       FROM question_attempts qa
       JOIN questions q ON qa.question_id = q.id
       WHERE qa.user_id = $1 AND q.module_id = $2
       ORDER BY qa.attempted_at DESC`,
      [req.user.id, moduleId]
    );

    res.json({
      data: result.rows.map(row => ({
        questionId: row.question_id,
        questionText: row.question_text,
        userAnswer: row.user_answer,
        correctAnswer: row.correct_answer,
        isCorrect: row.is_correct,
        timeTakenSeconds: row.time_taken_seconds,
        attemptedAt: row.attempted_at
      }))
    });
  } catch (error) {
    console.error('Get question attempts error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get question attempts'
      }
    });
  }
});

module.exports = router;
