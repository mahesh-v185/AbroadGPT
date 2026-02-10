const express = require('express');
const { query } = require('../config/database');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all tracks
router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, description, code FROM tracks ORDER BY id'
    );

    res.json({
      data: result.rows
    });
  } catch (error) {
    console.error('Get tracks error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get tracks'
      }
    });
  }
});

// Get subjects for a track
router.get('/:trackId/subjects', authMiddleware, async (req, res) => {
  try {
    const { trackId } = req.params;

    // Verify user has access to this track
    const userTrackResult = await query(
      'SELECT track_id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userTrackResult.rows[0].track_id !== parseInt(trackId)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied to this track'
        }
      });
    }

    const result = await query(
      `SELECT id, name, description, order_index, created_at 
       FROM subjects 
       WHERE track_id = $1 
       ORDER BY order_index`,
      [trackId]
    );

    // Get module counts for each subject
    const subjectsWithModules = await Promise.all(
      result.rows.map(async (subject) => {
        const moduleResult = await query(
          `SELECT COUNT(*) as module_count,
                  COUNT(CASE WHEN up.status = 'COMPLETED' THEN 1 END) as completed_count
           FROM modules m
           LEFT JOIN user_progress up ON m.id = up.module_id AND up.user_id = $1
           WHERE m.subject_id = $2`,
          [req.user.id, subject.id]
        );

        return {
          ...subject,
          totalModules: parseInt(moduleResult.rows[0].module_count),
          completedModules: parseInt(moduleResult.rows[0].completed_count),
          modules: [] // Will be populated if needed
        };
      })
    );

    res.json({
      data: subjectsWithModules
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get subjects'
      }
    });
  }
});

// Get modules for a subject
router.get('/subjects/:subjectId/modules', authMiddleware, async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Verify user has access to this subject
    const result = await query(
      `SELECT m.id, m.title, m.description, m.order_index, m.unlock_threshold, 
              m.estimated_minutes, up.status, up.score_percentage, up.attempts, 
              up.best_score, up.time_spent_minutes, up.completed_at
       FROM modules m
       LEFT JOIN user_progress up ON m.id = up.module_id AND up.user_id = $1
       WHERE m.subject_id = $2
       ORDER BY m.order_index`,
      [req.user.id, subjectId]
    );

    // Check module unlock status
    const modulesWithStatus = await Promise.all(
      result.rows.map(async (module) => {
        const isUnlocked = await checkModuleUnlock(req.user.id, module.id);
        
        return {
          id: module.id,
          title: module.title,
          description: module.description,
          orderIndex: module.order_index,
          unlockThreshold: module.unlock_threshold,
          estimatedMinutes: module.estimated_minutes,
          status: module.status || 'LOCKED',
          userScore: module.score_percentage,
          attempts: module.attempts || 0,
          bestScore: module.best_score,
          timeSpentMinutes: module.time_spent_minutes || 0,
          completedAt: module.completed_at,
          unlocked: isUnlocked
        };
      })
    );

    res.json({
      data: modulesWithStatus
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get modules'
      }
    });
  }
});

// Get module details
router.get('/modules/:moduleId', authMiddleware, async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Get module details
    const moduleResult = await query(
      `SELECT m.*, s.name as subject_name, s.track_id
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

    // Check if module is unlocked
    const isUnlocked = await checkModuleUnlock(req.user.id, module.id);

    if (!isUnlocked) {
      return res.status(423).json({
        error: {
          code: 'MODULE_LOCKED',
          message: 'Module is locked. Complete previous modules first.'
        }
      });
    }

    // Get user progress for this module
    const progressResult = await query(
      `SELECT status, score_percentage, attempts, best_score, time_spent_minutes, completed_at
       FROM user_progress 
       WHERE user_id = $1 AND module_id = $2`,
      [req.user.id, moduleId]
    );

    res.json({
      data: {
        id: module.id,
        title: module.title,
        description: module.description,
        content: module.content,
        diagramUrl: module.diagram_url,
        estimatedMinutes: module.estimated_minutes,
        unlockThreshold: module.unlock_threshold,
        subjectName: module.subject_name,
        progress: progressResult.rows[0] || null
      }
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get module'
      }
    });
  }
});

// Get module questions
router.get('/modules/:moduleId/questions', authMiddleware, async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Verify module access
    const isUnlocked = await checkModuleUnlock(req.user.id, moduleId);
    if (!isUnlocked) {
      return res.status(423).json({
        error: {
          code: 'MODULE_LOCKED',
          message: 'Module is locked. Complete previous modules first.'
        }
      });
    }

    // Get questions for the module
    const mcqResult = await query(
      `SELECT id, question_text, options, correct_answer, explanation, 
              difficulty, points, time_limit_seconds
       FROM questions 
       WHERE module_id = $1 AND question_type = 'MCQ'
       ORDER BY id`,
      [moduleId]
    );

    const codingResult = await query(
      `SELECT id, question_text, sample_input, expected_output, 
              difficulty, points, time_limit_seconds
       FROM questions 
       WHERE module_id = $1 AND question_type = 'CODING'
       ORDER BY id`,
      [moduleId]
    );

    const caseResult = await query(
      `SELECT id, question_text, expected_answer, difficulty, points, time_limit_seconds
       FROM questions 
       WHERE module_id = $1 AND question_type = 'CASE'
       ORDER BY id`,
      [moduleId]
    );

    res.json({
      data: {
        mcqs: mcqResult.rows.map(q => ({
          id: q.id,
          questionText: q.question_text,
          options: q.options,
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          points: q.points,
          timeLimitSeconds: q.time_limit_seconds
        })),
        coding: codingResult.rows.map(q => ({
          id: q.id,
          questionText: q.question_text,
          sampleInput: q.sample_input,
          expectedOutput: q.expected_output,
          difficulty: q.difficulty,
          points: q.points,
          timeLimitSeconds: q.time_limit_seconds
        })),
        case: caseResult.rows.map(q => ({
          id: q.id,
          questionText: q.question_text,
          expectedAnswer: q.expected_answer,
          difficulty: q.difficulty,
          points: q.points,
          timeLimitSeconds: q.time_limit_seconds
        }))
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get questions'
      }
    });
  }
});

// Helper function to check if module is unlocked
async function checkModuleUnlock(userId, moduleId) {
  try {
    // Get module and its subject
    const moduleResult = await query(
      `SELECT m.order_index, s.order_index as subject_order, s.track_id
       FROM modules m
       JOIN subjects s ON m.subject_id = s.id
       WHERE m.id = $1`,
      [moduleId]
    );

    if (moduleResult.rows.length === 0) {
      return false;
    }

    const module = moduleResult.rows[0];

    // First module in first subject is always unlocked after diagnostic
    if (module.subject_order === 1 && module.order_index === 1) {
      const diagnosticResult = await query(
        'SELECT diagnostic_completed FROM users WHERE id = $1',
        [userId]
      );
      return diagnosticResult.rows[0].diagnostic_completed;
    }

    // Check if previous module in the same subject is completed with sufficient score
    const previousModuleResult = await query(
      `SELECT up.score_percentage, up.status
       FROM modules m
       JOIN user_progress up ON m.id = up.module_id AND up.user_id = $1
       WHERE m.subject_id = (SELECT subject_id FROM modules WHERE id = $2)
         AND m.order_index = $3 - 1`,
      [userId, moduleId, module.order_index]
    );

    if (previousModuleResult.rows.length === 0) {
      return false;
    }

    const previousProgress = previousModuleResult.rows[0];
    return previousProgress.status === 'COMPLETED' && 
           previousProgress.score_percentage >= 70; // Default threshold
  } catch (error) {
    console.error('Check module unlock error:', error);
    return false;
  }
}

module.exports = router;
