const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const ProgressLockingSystem = require('../utils/progressLocking');

const router = express.Router();
const progressLocking = new ProgressLockingSystem(query);

// Get today's daily plan
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT dp.id, dp.plan_date, dp.modules, dp.total_minutes, 
              dp.completed_minutes, dp.status, dp.created_at
       FROM daily_plans dp
       WHERE dp.user_id = $1 AND dp.plan_date = CURRENT_DATE
       ORDER BY dp.created_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ data: null });
    }

    const plan = result.rows[0];
    
    res.json({
      data: {
        id: plan.id,
        planDate: plan.plan_date,
        modules: plan.modules,
        totalMinutes: plan.total_minutes,
        completedMinutes: plan.completed_minutes,
        status: plan.status,
        createdAt: plan.created_at
      }
    });
  } catch (error) {
    console.error('Get daily plan error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get daily plan'
      }
    });
  }
});

// Generate daily plan
router.post('/generate', authMiddleware, [
  body('preferredMinutes').isInt({ min: 60, max: 120 }).withMessage('Preferred minutes must be between 60 and 120')
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

    const { preferredMinutes = 90 } = req.body;

    // Check if plan already exists for today
    const existingPlan = await query(
      `SELECT id FROM daily_plans 
       WHERE user_id = $1 AND plan_date = CURRENT_DATE`,
      [req.user.id]
    );

    if (existingPlan.rows.length > 0) {
      return res.status(409).json({
        error: {
          code: 'PLAN_EXISTS',
          message: 'Daily plan already exists for today'
        }
      });
    }

    // Generate plan using progress locking system
    const plan = await progressLocking.generateDailyPlan(req.user.id, preferredMinutes);

    // Save plan to database
    const result = await query(
      `INSERT INTO daily_plans (user_id, plan_date, modules, total_minutes, status, created_at)
       VALUES ($1, CURRENT_DATE, $2, $3, 'PENDING', NOW())
       RETURNING id, plan_date, modules, total_minutes, completed_minutes, status, created_at`,
      [req.user.id, JSON.stringify(plan.modules), plan.totalMinutes]
    );

    const savedPlan = result.rows[0];

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, activity_type, activity_data) VALUES ($1, $2, $3)',
      [
        req.user.id,
        'DAILY_PLAN_GENERATED',
        JSON.stringify({
          planId: savedPlan.id,
          totalMinutes: plan.totalMinutes,
          modulesCount: plan.modules.length
        })
      ]
    );

    res.status(201).json({
      message: 'Daily plan generated successfully',
      data: {
        id: savedPlan.id,
        planDate: savedPlan.plan_date,
        modules: plan.modules,
        totalMinutes: savedPlan.total_minutes,
        completedMinutes: savedPlan.completed_minutes,
        status: savedPlan.status,
        createdAt: savedPlan.created_at
      }
    });
  } catch (error) {
    console.error('Generate daily plan error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate daily plan'
      }
    });
  }
});

// Complete daily plan
router.put('/:planId/complete', authMiddleware, [
  body('completedMinutes').isInt({ min: 0 }).withMessage('Completed minutes must be a positive integer')
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

    const { planId } = req.params;
    const { completedMinutes } = req.body;

    // Verify plan belongs to user
    const planResult = await query(
      `SELECT dp.*, u.current_streak
       FROM daily_plans dp
       JOIN users u ON dp.user_id = u.id
       WHERE dp.id = $1 AND dp.user_id = $2`,
      [planId, req.user.id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Daily plan not found'
        }
      });
    }

    const plan = planResult.rows[0];

    // Update plan status
    const status = completedMinutes >= plan.total_minutes ? 'COMPLETED' : 'IN_PROGRESS';
    
    await query(
      `UPDATE daily_plans 
       SET completed_minutes = $1, status = $2
       WHERE id = $3 AND user_id = $4`,
      [completedMinutes, status, planId, req.user.id]
    );

    // Update user streak if plan is completed
    if (status === 'COMPLETED') {
      await updateUserStreak(req.user.id);
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, activity_type, activity_data) VALUES ($1, $2, $3)',
      [
        req.user.id,
        'DAILY_COMPLETE',
        JSON.stringify({
          planId,
          completedMinutes,
          totalMinutes: plan.total_minutes,
          status
        })
      ]
    );

    res.json({
      message: 'Daily plan updated successfully',
      data: {
        planId,
        completedMinutes,
        status,
        totalMinutes: plan.total_minutes,
        completionPercentage: Math.round((completedMinutes / plan.total_minutes) * 100)
      }
    });
  } catch (error) {
    console.error('Complete daily plan error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to complete daily plan'
      }
    });
  }
});

// Helper function to update user streak
async function updateUserStreak(userId) {
  try {
    // Get last activity date
    const lastActivityResult = await query(
      `SELECT timestamp FROM activity_logs 
       WHERE user_id = $1 AND activity_type = 'DAILY_COMPLETE'
       ORDER BY timestamp DESC 
       LIMIT 1`,
      [userId]
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastActivityResult.rows.length > 0) {
      const lastActivity = new Date(lastActivityResult.rows[0].timestamp);
      lastActivity.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day - increment streak
        await query(
          `UPDATE users 
           SET current_streak = current_streak + 1,
               longest_streak = GREATEST(longest_streak, current_streak + 1)
           WHERE id = $1`,
          [userId]
        );
      } else if (daysDiff > 1) {
        // Gap in days - reset streak
        await query(
          'UPDATE users SET current_streak = 1 WHERE id = $1',
          [userId]
        );
      }
    } else {
      // First daily completion
      await query(
        'UPDATE users SET current_streak = 1 WHERE id = $1',
        [userId]
      );
    }
  } catch (error) {
    console.error('Update user streak error:', error);
  }
}

module.exports = router;
