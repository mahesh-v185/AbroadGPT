const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get available diagnostic tests
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT dt.*, t.name as track_name, t.code as track_code
       FROM diagnostic_tests dt
       JOIN tracks t ON dt.track_id = t.id
       WHERE dt.is_active = true AND dt.track_id = $1`,
      [req.user.track_id]
    );

    res.json({
      data: result.rows.map(test => ({
        id: test.id,
        trackId: test.track_id,
        trackName: test.track_name,
        trackCode: test.track_code,
        name: test.name,
        totalQuestions: test.total_questions,
        timeLimitMinutes: test.time_limit_minutes,
        passingThreshold: test.passing_threshold,
        isActive: test.is_active
      }))
    });
  } catch (error) {
    console.error('Get diagnostic tests error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get diagnostic tests'
      }
    });
  }
});

// Start diagnostic test
router.post('/start', authMiddleware, [
  body('diagnosticTestId').isInt().withMessage('Diagnostic test ID must be an integer')
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

    const { diagnosticTestId } = req.body;

    // Verify test exists and user has access
    const testResult = await query(
      `SELECT dt.*, t.name as track_name
       FROM diagnostic_tests dt
       JOIN tracks t ON dt.track_id = t.id
       WHERE dt.id = $1 AND dt.is_active = true AND dt.track_id = $2`,
      [diagnosticTestId, req.user.track_id]
    );

    if (testResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Diagnostic test not found'
        }
      });
    }

    // Check if user has already taken diagnostic
    const existingResult = await query(
      'SELECT id FROM user_diagnostics WHERE user_id = $1',
      [req.user.id]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        error: {
          code: 'ALREADY_TAKEN',
          message: 'Diagnostic test can only be taken once'
        }
      });
    }

    const test = testResult.rows[0];

    // Create user diagnostic record
    const result = await query(
      `INSERT INTO user_diagnostics (user_id, diagnostic_test_id, started_at)
       VALUES ($1, $2, NOW())
       RETURNING id`,
      [req.user.id, diagnosticTestId]
    );

    const userDiagnostic = result.rows[0];

    res.status(201).json({
      message: 'Diagnostic test started',
      data: {
        sessionId: userDiagnostic.id,
        testId: test.id,
        testName: test.name,
        totalQuestions: test.total_questions,
        timeLimitMinutes: test.time_limit_minutes,
        passingThreshold: test.passing_threshold
      }
    });
  } catch (error) {
    console.error('Start diagnostic test error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to start diagnostic test'
      }
    });
  }
});

// Submit diagnostic test
router.post('/submit', authMiddleware, [
  body('sessionId').isInt().withMessage('Session ID must be an integer'),
  body('answers').isArray().withMessage('Answers must be an array')
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

    const { sessionId, answers } = req.body;

    // Verify session belongs to user
    const sessionResult = await query(
      `SELECT ud.*, dt.total_questions, dt.passing_threshold
       FROM user_diagnostics ud
       JOIN diagnostic_tests dt ON ud.diagnostic_test_id = dt.id
       WHERE ud.id = $1 AND ud.user_id = $2`,
      [sessionId, req.user.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Diagnostic session not found'
        }
      });
    }

    const session = sessionResult.rows[0];

    if (session.completed_at) {
      return res.status(400).json({
        error: {
          code: 'ALREADY_SUBMITTED',
          message: 'Diagnostic test has already been submitted'
        }
      });
    }

    // Calculate score
    let correctAnswers = 0;
    answers.forEach(answer => {
      // In a real implementation, you'd verify against actual questions
      // For now, we'll simulate scoring
      if (Math.random() > 0.3) { // 70% correct rate simulation
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / answers.length) * 100);
    const percentage = (correctAnswers / session.total_questions) * 100;
    const passed = percentage >= session.passing_threshold;

    // Update user diagnostic
    await query(
      `UPDATE user_diagnostics 
       SET score = $1, percentage = $2, completed_at = NOW()
       WHERE id = $3`,
      [score, percentage, sessionId]
    );

    // Update user
    await query(
      `UPDATE users 
       SET diagnostic_completed = true, diagnostic_score = $1
       WHERE id = $2`,
      [score, req.user.id]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, activity_type, activity_data) VALUES ($1, $2, $3)',
      [
        req.user.id,
        'DIAGNOSTIC_COMPLETE',
        JSON.stringify({
          sessionId,
          score,
          percentage,
          passed,
          questionsAnswered: answers.length
        })
      ]
    );

    res.json({
      message: 'Diagnostic test submitted successfully',
      data: {
        score,
        percentage,
        passed,
        correctAnswers,
        totalQuestions: answers.length,
        passingThreshold: session.passing_threshold
      }
    });
  } catch (error) {
    console.error('Submit diagnostic test error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to submit diagnostic test'
      }
    });
  }
});

// Get diagnostic results
router.get('/results/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only see their own results
    if (parseInt(userId) !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    const result = await query(
      `SELECT ud.*, dt.name as test_name, t.name as track_name
       FROM user_diagnostics ud
       JOIN diagnostic_tests dt ON ud.diagnostic_test_id = dt.id
       JOIN tracks t ON dt.track_id = t.id
       WHERE ud.user_id = $1
       ORDER BY ud.completed_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'No diagnostic results found'
        }
      });
    }

    const diagnostic = result.rows[0];

    res.json({
      data: {
        score: diagnostic.score,
        percentage: diagnostic.percentage,
        testName: diagnostic.test_name,
        trackName: diagnostic.track_name,
        startedAt: diagnostic.started_at,
        completedAt: diagnostic.completed_at,
        weaknessAreas: diagnostic.weakness_areas || []
      }
    });
  } catch (error) {
    console.error('Get diagnostic results error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get diagnostic results'
      }
    });
  }
});

module.exports = router;
