// Simplified version of progress locking logic for the server
class ProgressLockingSystem {
  constructor(database) {
    this.db = database;
    this.UNLOCK_THRESHOLD = 70;
    this.MAX_ATTEMPTS = 3;
    this.RETAKE_COOLDOWN_HOURS = 24;
  }

  async attemptModuleCompletion(userId, moduleId, score, timeSpentMinutes) {
    try {
      // Get current progress
      const currentResult = await this.db.query(
        'SELECT * FROM user_progress WHERE user_id = $1 AND module_id = $2',
        [userId, moduleId]
      );

      const currentProgress = currentResult.rows[0];
      const attempts = (currentProgress?.attempts || 0) + 1;
      const passed = score >= this.UNLOCK_THRESHOLD;

      // Update or create progress record
      await this.db.query(`
        INSERT INTO user_progress (user_id, module_id, status, score_percentage, attempts, best_score, time_spent_minutes, last_attempt_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (user_id, module_id) 
        DO UPDATE SET 
          status = EXCLUDED.status,
          score_percentage = EXCLUDED.score_percentage,
          attempts = user_progress.attempts + 1,
          best_score = GREATEST(user_progress.best_score, EXCLUDED.best_score),
          time_spent_minutes = user_progress.time_spent_minutes + EXCLUDED.time_spent_minutes,
          last_attempt_at = NOW()
      `, [userId, moduleId, passed ? 'COMPLETED' : 'IN_PROGRESS', score, attempts, score, timeSpentMinutes]);

      let nextModuleUnlocked = null;
      if (passed) {
        nextModuleUnlocked = await this.unlockNextModule(userId, moduleId);
      }

      return {
        success: true,
        passed,
        score,
        threshold: this.UNLOCK_THRESHOLD,
        attemptsRemaining: this.MAX_ATTEMPTS - attempts,
        nextModuleUnlocked,
        canRetry: !passed && attempts < this.MAX_ATTEMPTS
      };
    } catch (error) {
      console.error('Module completion error:', error);
      return {
        success: false,
        reason: 'Internal error occurred'
      };
    }
  }

  async unlockNextModule(userId, completedModuleId) {
    try {
      // Get next module in the same subject
      const result = await this.db.query(`
        SELECT m.id, m.title, m.subject_id
        FROM modules m
        WHERE m.subject_id = (SELECT subject_id FROM modules WHERE id = $1)
          AND m.order_index = (SELECT order_index FROM modules WHERE id = $1) + 1
        LIMIT 1
      `, [completedModuleId]);

      if (result.rows.length === 0) {
        return null; // No next module
      }

      const nextModule = result.rows[0];

      // Create progress record for next module
      await this.db.query(`
        INSERT INTO user_progress (user_id, module_id, status)
        VALUES ($1, $2, 'UNLOCKED')
        ON CONFLICT (user_id, module_id) DO NOTHING
      `, [userId, nextModule.id]);

      return {
        moduleId: nextModule.id,
        title: nextModule.title,
        subjectId: nextModule.subject_id
      };
    } catch (error) {
      console.error('Unlock next module error:', error);
      return null;
    }
  }

  async generateDailyPlan(userId, preferredMinutes = 90) {
    try {
      // Get incomplete modules
      const incompleteResult = await this.db.query(`
        SELECT m.id, m.title, m.estimated_minutes
        FROM modules m
        JOIN user_progress up ON m.id = up.module_id AND up.user_id = $1
        WHERE up.status != 'COMPLETED'
        ORDER BY up.last_attempt_at DESC NULLS LAST
        LIMIT 3
      `, [userId]);

      const modules = incompleteResult.rows.map(module => ({
        moduleId: module.id,
        title: module.title,
        type: 'COMPLETE',
        allocatedMinutes: Math.min(preferredMinutes, module.estimated_minutes || 60)
      }));

      return {
        date: new Date().toISOString().split('T')[0],
        totalMinutes: preferredMinutes,
        modules
      };
    } catch (error) {
      console.error('Generate daily plan error:', error);
      return {
        date: new Date().toISOString().split('T')[0],
        totalMinutes: preferredMinutes,
        modules: []
      };
    }
  }
}

module.exports = ProgressLockingSystem;
