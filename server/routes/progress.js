const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const ProgressLockingSystem = require('../utils/progressLocking');
const EvaluationScoringSystem = require('../utils/evaluationScoring');

const router = express.Router();
const progressLocking = new ProgressLockingSystem(query);
const evaluationScoring = new EvaluationScoringSystem();

// Get module progress
router.get('/modules', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT up.module_id, m.title as module_title, up.status, 
              up.score_percentage, up.attempts, up.best_score, 
              up.time_spent_minutes, up.completed_at, s.name as subject_name
       FROM user_progress up
       JOIN modules m ON up.module_id = m.id
       JOIN subjects s ON m.subject_id = s.id
       WHERE up.user_id = $1
       ORDER BY up.last_attempt_at DESC NULLS LAST`,
      [req.user.id]
    );

    res.json({
      data: result.rows.map(row => ({
        moduleId: row.module_id,
        moduleTitle: row.module_title,
        subjectName: row.subject_name,
        status: row.status,
        scorePercentage: row.score_percentage,
        attempts: row.attempts,
        bestScore: row.best_score,
        timeSpentMinutes: row.time_spent_minutes,
        completedAt: row.completed_at
      }))
    });
  } catch (error) {
    console.error('Get module progress error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get module progress'
      }
    });
  }
});

// Update module progress
router.post('/update', authMiddleware, [
  body('moduleId').isInt().withMessage('Module ID must be an integer'),
  body('score').isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('timeSpentMinutes').isInt({ min: 0 }).withMessage('Time spent must be a positive integer'),
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

    const { moduleId, score, timeSpentMinutes, sessionType } = req.body;

    // Attempt module completion
    const result = await progressLocking.attemptModuleCompletion(
      req.user.id,
      moduleId,
      score,
      timeSpentMinutes
    );

    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'MODULE_ATTEMPT_FAILED',
          message: result.reason
        }
      });
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, activity_type, activity_data) VALUES ($1, $2, $3)',
      [
        req.user.id,
        result.passed ? 'MODULE_COMPLETE' : 'MODULE_ATTEMPT',
        JSON.stringify({
          moduleId,
          score,
          timeSpentMinutes,
          sessionType,
          passed: result.passed
        })
      ]
    );

    res.json({
      message: 'Progress updated successfully',
      data: {
        passed: result.passed,
        score: result.score,
        threshold: result.threshold,
        attemptsRemaining: result.attemptsRemaining,
        nextModuleUnlocked: result.nextModuleUnlocked,
        canRetry: result.canRetry
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update progress'
      }
    });
  }
});

// Get weekly progress
router.get('/weekly', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const queryParams = [req.user.id];

    if (startDate) {
      dateFilter += ` AND DATE(ss.start_time) >= $${queryParams.length + 1}`;
      queryParams.push(startDate);
    }

    if (endDate) {
      dateFilter += ` AND DATE(ss.start_time) <= $${queryParams.length + 1}`;
      queryParams.push(endDate);
    }

    const result = await query(
      `SELECT DATE(ss.start_time) as study_date,
              COUNT(*) as sessions_completed,
              SUM(ss.duration_minutes) as total_minutes,
              AVG(ss.score) as average_score,
              COUNT(CASE WHEN ss.score >= 70 THEN 1 END) as sessions_passed
       FROM study_sessions ss
       WHERE ss.user_id = $1 ${dateFilter}
       GROUP BY DATE(ss.start_time)
       ORDER BY study_date DESC`,
      queryParams
    );

    // Calculate weekly summary
    const weeklySummary = {
      totalSessions: result.rows.reduce((sum, row) => sum + row.sessions_completed, 0),
      totalMinutes: result.rows.reduce((sum, row) => sum + row.total_minutes, 0),
      averageScore: result.rows.length > 0 
        ? result.rows.reduce((sum, row) => sum + row.average_score, 0) / result.rows.length 
        : 0,
      sessionsPassed: result.rows.reduce((sum, row) => sum + row.sessions_passed, 0)
    };

    res.json({
      data: {
        weeklySummary,
        dailyBreakdown: result.rows.map(row => ({
          date: row.study_date,
          sessionsCompleted: row.sessions_completed,
          minutes: row.total_minutes,
          averageScore: row.average_score,
          modulesCompleted: row.sessions_passed
        }))
      }
    });
  } catch (error) {
    console.error('Get weekly progress error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get weekly progress'
      }
    });
  }
});

// Export progress
router.get('/export/:format', authMiddleware, async (req, res) => {
  try {
    const { format } = req.params;
    const { startDate, endDate } = req.query;

    if (!['pdf', 'json', 'csv'].includes(format)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid export format'
        }
      });
    }

    // Get comprehensive progress data
    const userData = await query(
      `SELECT id, email, full_name, track_id, created_at, 
              current_streak, longest_streak, total_study_minutes, progress_percentage
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    const moduleProgress = await query(
      `SELECT up.module_id, m.title as module_title, s.name as subject_name,
              up.status, up.score_percentage, up.attempts, up.best_score,
              up.time_spent_minutes, up.completed_at
       FROM user_progress up
       JOIN modules m ON up.module_id = m.id
       JOIN subjects s ON m.subject_id = s.id
       WHERE up.user_id = $1
       ORDER BY up.completed_at DESC NULLS LAST`,
      [req.user.id]
    );

    const studySessions = await query(
      `SELECT ss.*, m.title as module_title, s.name as subject_name
       FROM study_sessions ss
       JOIN modules m ON ss.module_id = m.id
       JOIN subjects s ON m.subject_id = s.id
       WHERE ss.user_id = $1
       ORDER BY ss.start_time DESC`,
      [req.user.id]
    );

    const exportData = {
      user: userData.rows[0],
      moduleProgress: moduleProgress.rows,
      studySessions: studySessions.rows,
      exportedAt: new Date().toISOString(),
      dateRange: { startDate, endDate }
    };

    if (format === 'json') {
      res.json(exportData);
    } else if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="progress-${Date.now()}.csv"`);
      res.send(csv);
    } else if (format === 'pdf') {
      // Generate PDF (would require a PDF library like PDFKit)
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="progress-${Date.now()}.pdf"`);
      // PDF generation logic here
      res.send('PDF generation not implemented yet');
    }
  } catch (error) {
    console.error('Export progress error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to export progress'
      }
    });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  const headers = [
    'Module ID', 'Module Title', 'Subject', 'Status', 'Score (%)', 
    'Attempts', 'Best Score (%)', 'Time Spent (minutes)', 'Completed At'
  ];
  
  const rows = data.moduleProgress.map(row => [
    row.module_id,
    row.module_title,
    row.subject_name,
    row.status,
    row.score_percentage,
    row.attempts,
    row.best_score,
    row.time_spent_minutes,
    row.completed_at
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

module.exports = router;
