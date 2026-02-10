const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get current weekly test
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const result = await query(
      `SELECT wt.*, 
              CASE 
                WHEN wt.completed_at IS NULL THEN 'PENDING'
                ELSE 'COMPLETED'
              END as status
       FROM weekly_tests wt
       WHERE wt.user_id = $1 AND wt.week_start_date = $2
       ORDER BY wt.week_start_date DESC
       LIMIT 1`,
      [req.user.id, weekStart.toISOString().split('T')[0]]
    );

    if (result.rows.length === 0) {
      return res.json({ data: null });
    }

    const weeklyTest = result.rows[0];

    res.json({
      data: {
        id: weeklyTest.id,
        weekStartDate: weeklyTest.week_start_date,
        modulesCovered: weeklyTest.modules_covered,
        score: weeklyTest.score,
        percentage: weeklyTest.percentage,
        status: weeklyTest.status,
        completedAt: weeklyTest.completed_at,
        createdAt: weeklyTest.created_at
      }
    });
  } catch (error) {
    console.error('Get weekly test error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get weekly test'
      }
    });
  }
});

// Start weekly test
router.post('/start', authMiddleware, [
  body('weeklyTestId').isInt().withMessage('Weekly test ID must be an integer')
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

    const { weeklyTestId } = req.body;

    // Verify test belongs to user
    const testResult = await query(
      'SELECT * FROM weekly_tests WHERE id = $1 AND user_id = $2',
      [weeklyTestId, req.user.id]
    );

    if (testResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Weekly test not found'
        }
      });
    }

    const test = testResult.rows[0];

    if (test.completed_at) {
      return res.status(400).json({
        error: {
          code: 'ALREADY_COMPLETED',
          message: 'Weekly test has already been completed'
        }
      });
    }

    res.json({
      message: 'Weekly test started',
      data: {
        id: test.id,
        weekStartDate: test.week_start_date,
        modulesCovered: test.modules_covered
      }
    });
  } catch (error) {
    console.error('Start weekly test error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to start weekly test'
      }
    });
  }
});

// Submit weekly test
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
      'SELECT * FROM weekly_tests WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Weekly test session not found'
        }
      });
    }

    const session = sessionResult.rows[0];

    if (session.completed_at) {
      return res.status(400).json({
        error: {
          code: 'ALREADY_SUBMITTED',
          message: 'Weekly test has already been submitted'
        }
      });
    }

    // Calculate score (simplified)
    let correctAnswers = 0;
    answers.forEach(answer => {
      if (Math.random() > 0.25) { // 75% correct rate simulation
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / answers.length) * 100);
    const percentage = (correctAnswers / answers.length) * 100;

    // Update weekly test
    await query(
      `UPDATE weekly_tests 
       SET score = $1, percentage = $2, completed_at = NOW()
       WHERE id = $3`,
      [score, percentage, sessionId]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, activity_type, activity_data) VALUES ($1, $2, $3)',
      [
        req.user.id,
        'WEEKLY_TEST_COMPLETE',
        JSON.stringify({
          sessionId,
          score,
          percentage,
          questionsAnswered: answers.length
        })
      ]
    );

    res.json({
      message: 'Weekly test submitted successfully',
      data: {
        score,
        percentage,
        correctAnswers,
        totalQuestions: answers.length
      }
    });
  } catch (error) {
    console.error('Submit weekly test error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to submit weekly test'
      }
    });
  }
});

module.exports = router;
