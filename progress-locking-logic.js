// CSCA PREP WEB - Progress Locking Logic & Module Unlock System

class ProgressLockingSystem {
    constructor(database) {
        this.db = database;
        this.UNLOCK_THRESHOLD = 70; // Default threshold
        this.MAX_ATTEMPTS = 3;
        this.RETAKE_COOLDOWN_HOURS = 24;
        this.INACTIVITY_PENALTY_DAYS = 3;
        this.PROGRESS_PENALTY_PERCENTAGE = 10;
    }

    /**
     * Check if a module is unlocked for a user
     */
    async isModuleUnlocked(userId, moduleId) {
        const query = `
            SELECT m.*, up.status, up.score_percentage, up.attempts,
                   s.order_index as subject_order, sub.order_index as module_order
            FROM modules m
            JOIN user_progress up ON m.id = up.module_id AND up.user_id = $1
            JOIN subjects s ON m.subject_id = s.id
            LEFT JOIN modules sub ON s.id = sub.subject_id
            WHERE m.id = $2
        `;
        
        const result = await this.db.query(query, [userId, moduleId]);
        
        if (!result.rows[0]) {
            return { unlocked: false, reason: 'Module not found' };
        }

        const module = result.rows[0];

        // First module in first subject is always unlocked after diagnostic
        if (module.subject_order === 1 && module.module_order === 1) {
            const diagnosticCompleted = await this.isDiagnosticCompleted(userId);
            return { 
                unlocked: diagnosticCompleted, 
                reason: diagnosticCompleted ? 'First module' : 'Diagnostic required' 
            };
        }

        // Check if previous module in same subject is completed with sufficient score
        const previousModule = await this.getPreviousModule(module.subject_id, module.module_order);
        if (!previousModule) {
            return { unlocked: false, reason: 'No previous module found' };
        }

        const previousProgress = await this.getUserModuleProgress(userId, previousModule.id);
        
        if (!previousProgress || previousProgress.status !== 'COMPLETED') {
            return { 
                unlocked: false, 
                reason: `Previous module "${previousModule.title}" not completed`,
                prerequisiteModule: previousModule
            };
        }

        if (previousProgress.score_percentage < this.UNLOCK_THRESHOLD) {
            return { 
                unlocked: false, 
                reason: `Previous module score ${previousProgress.score_percentage}% < ${this.UNLOCK_THRESHOLD}%`,
                prerequisiteModule: previousModule
            };
        }

        return { unlocked: true, reason: 'Prerequisites met' };
    }

    /**
     * Attempt to complete a module and potentially unlock next one
     */
    async attemptModuleCompletion(userId, moduleId, score, timeSpentMinutes) {
        // Get current progress
        const currentProgress = await this.getUserModuleProgress(userId, moduleId);
        
        // Check if user can attempt (cooldown period)
        if (currentProgress && currentProgress.attempts >= this.MAX_ATTEMPTS) {
            return {
                success: false,
                reason: `Maximum attempts (${this.MAX_ATTEMPTS}) reached`,
                canRetry: false
            };
        }

        if (currentProgress && currentProgress.last_attempt_at) {
            const hoursSinceLastAttempt = this.getHoursSince(currentProgress.last_attempt_at);
            if (hoursSinceLastAttempt < this.RETAKE_COOLDOWN_HOURS) {
                return {
                    success: false,
                    reason: `Must wait ${this.RETAKE_COOLDOWN_HOURS - hoursSinceLastAttempt} hours before retry`,
                    canRetry: true,
                    cooldownRemaining: this.RETAKE_COOLDOWN_HOURS - hoursSinceLastAttempt
                };
            }
        }

        // Update or create progress record
        await this.updateModuleProgress(userId, moduleId, score, timeSpentMinutes);

        const passed = score >= this.UNLOCK_THRESHOLD;
        let nextModuleUnlocked = null;

        if (passed) {
            // Mark module as completed
            await this.markModuleCompleted(userId, moduleId);
            
            // Check and unlock next module
            nextModuleUnlocked = await this.unlockNextModule(userId, moduleId);
        }

        // Update overall user progress
        await this.updateOverallProgress(userId);

        return {
            success: true,
            passed,
            score,
            threshold: this.UNLOCK_THRESHOLD,
            attemptsRemaining: this.MAX_ATTEMPTS - (currentProgress?.attempts || 0) - 1,
            nextModuleUnlocked,
            canRetry: !passed && (currentProgress?.attempts || 0) < this.MAX_ATTEMPTS - 1
        };
    }

    /**
     * Unlock the next module after completing current one
     */
    async unlockNextModule(userId, completedModuleId) {
        const completedModule = await this.getModule(completedModuleId);
        const nextModule = await this.getNextModule(completedModule.subject_id, completedModule.order_index);

        if (!nextModule) {
            return null; // No next module (last in subject)
        }

        // Check if all prerequisites are met
        const canUnlock = await this.isModuleUnlocked(userId, nextModule.id);
        
        if (canUnlock.unlocked) {
            // Create progress record for next module if it doesn't exist
            await this.ensureProgressRecord(userId, nextModule.id);
            
            return {
                moduleId: nextModule.id,
                title: nextModule.title,
                subjectId: nextModule.subject_id
            };
        }

        return null;
    }

    /**
     * Check and apply inactivity penalties
     */
    async checkInactivityPenalties(userId) {
        const lastActivity = await this.getLastActivityDate(userId);
        if (!lastActivity) return null;

        const daysInactive = this.getDaysSince(lastActivity);
        
        if (daysInactive > this.INACTIVITY_PENALTY_DAYS) {
            // Apply penalty
            await this.applyInactivityPenalty(userId);
            
            return {
                penaltyApplied: true,
                daysInactive,
                penaltyPercentage: this.PROGRESS_PENALTY_PERCENTAGE,
                streakReset: true
            };
        }

        return { penaltyApplied: false, daysInactive };
    }

    /**
     * Generate daily study plan based on progress and weaknesses
     */
    async generateDailyPlan(userId, preferredMinutes = 90) {
        const userProgress = await this.getUserOverallProgress(userId);
        const weaknesses = await this.getUserWeaknesses(userId);
        const availableTime = Math.min(preferredMinutes, 120); // Max 120 minutes

        const plan = {
            date: new Date().toISOString().split('T')[0],
            totalMinutes: availableTime,
            modules: [],
            status: 'PENDING'
        };

        // Allocate time based on priority:
        // 1. Incomplete modules from previous day
        // 2. Weak areas
        // 3. New modules (if unlocked)
        
        const incompleteModules = await this.getIncompleteModules(userId);
        const unlockedModules = await this.getUnlockedModules(userId);

        // Time allocation strategy
        const learnTime = Math.floor(availableTime * 0.3); // 30% learning
        const practiceTime = Math.floor(availableTime * 0.5); // 50% practice
        const recallTime = Math.floor(availableTime * 0.2); // 20% recall

        // Add modules to plan
        if (incompleteModules.length > 0) {
            const module = incompleteModules[0];
            plan.modules.push({
                moduleId: module.id,
                title: module.title,
                type: 'COMPLETE',
                allocatedMinutes: Math.min(availableTime, module.estimated_minutes || 60)
            });
        } else if (unlockedModules.length > 0) {
            const module = unlockedModules[0];
            plan.modules.push({
                moduleId: module.id,
                title: module.title,
                type: 'NEW',
                allocatedMinutes: Math.min(learnTime, module.estimated_minutes || 60)
            });
        }

        // Add practice for weak areas
        if (weaknesses.length > 0 && practiceTime > 0) {
            plan.modules.push({
                moduleId: weaknesses[0].id,
                title: `Practice: ${weaknesses[0].title}`,
                type: 'PRACTICE',
                allocatedMinutes: practiceTime
            });
        }

        // Add recall session
        if (recallTime > 0) {
            plan.modules.push({
                type: 'RECALL',
                title: 'Spaced Repetition Review',
                allocatedMinutes: recallTime
            });
        }

        return plan;
    }

    /**
     * Get user's skill heatmap data
     */
    async getSkillHeatmap(userId) {
        const query = `
            SELECT 
                s.id as subject_id,
                s.name as subject_name,
                COUNT(m.id) as total_modules,
                COUNT(CASE WHEN up.status = 'COMPLETED' THEN 1 END) as completed_modules,
                AVG(CASE WHEN up.status = 'COMPLETED' THEN up.score_percentage END) as average_score,
                SUM(up.time_spent_minutes) as total_time_minutes
            FROM subjects s
            LEFT JOIN modules m ON s.id = m.subject_id
            LEFT JOIN user_progress up ON m.id = up.module_id AND up.user_id = $1
            WHERE s.track_id = (SELECT track_id FROM users WHERE id = $1)
            GROUP BY s.id, s.name
            ORDER BY s.order_index
        `;

        const result = await this.db.query(query, [userId]);
        
        return result.rows.map(subject => ({
            subjectId: subject.subject_id,
            subjectName: subject.subject_name,
            masteryLevel: subject.average_score || 0,
            modulesCompleted: subject.completed_modules,
            totalModules: subject.total_modules,
            progressPercentage: subject.total_modules > 0 
                ? (subject.completed_modules / subject.total_modules) * 100 
                : 0,
            timeSpentMinutes: subject.total_time_minutes || 0
        }));
    }

    // Helper methods
    async isDiagnosticCompleted(userId) {
        const result = await this.db.query(
            'SELECT diagnostic_completed FROM users WHERE id = $1',
            [userId]
        );
        return result.rows[0]?.diagnostic_completed || false;
    }

    async getPreviousModule(subjectId, currentOrder) {
        const result = await this.db.query(
            'SELECT * FROM modules WHERE subject_id = $1 AND order_index = $2',
            [subjectId, currentOrder - 1]
        );
        return result.rows[0];
    }

    async getNextModule(subjectId, currentOrder) {
        const result = await this.db.query(
            'SELECT * FROM modules WHERE subject_id = $1 AND order_index = $2',
            [subjectId, currentOrder + 1]
        );
        return result.rows[0];
    }

    async getUserModuleProgress(userId, moduleId) {
        const result = await this.db.query(
            'SELECT * FROM user_progress WHERE user_id = $1 AND module_id = $2',
            [userId, moduleId]
        );
        return result.rows[0];
    }

    async updateModuleProgress(userId, moduleId, score, timeSpentMinutes) {
        const upsertQuery = `
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
        `;

        await this.db.query(upsertQuery, [
            userId, 
            moduleId, 
            score >= this.UNLOCK_THRESHOLD ? 'COMPLETED' : 'IN_PROGRESS',
            score,
            1,
            score,
            timeSpentMinutes
        ]);
    }

    async markModuleCompleted(userId, moduleId) {
        await this.db.query(
            'UPDATE user_progress SET status = $1, completed_at = NOW() WHERE user_id = $2 AND module_id = $3',
            ['COMPLETED', userId, moduleId]
        );
    }

    async ensureProgressRecord(userId, moduleId) {
        await this.db.query(
            `INSERT INTO user_progress (user_id, module_id, status) 
             VALUES ($1, $2, 'UNLOCKED') 
             ON CONFLICT (user_id, module_id) DO NOTHING`,
            [userId, moduleId]
        );
    }

    async updateOverallProgress(userId) {
        const query = `
            SELECT 
                COUNT(*) as total_modules,
                COUNT(CASE WHEN up.status = 'COMPLETED' THEN 1 END) as completed_modules,
                AVG(CASE WHEN up.status = 'COMPLETED' THEN up.score_percentage END) as avg_score
            FROM modules m
            LEFT JOIN subjects s ON m.subject_id = s.id
            LEFT JOIN user_progress up ON m.id = up.module_id AND up.user_id = $1
            WHERE s.track_id = (SELECT track_id FROM users WHERE id = $1)
        `;

        const result = await this.db.query(query, [userId]);
        const stats = result.rows[0];

        const progressPercentage = stats.total_modules > 0 
            ? (stats.completed_modules / stats.total_modules) * 100 
            : 0;

        await this.db.query(
            'UPDATE users SET progress_percentage = $1 WHERE id = $2',
            [progressPercentage, userId]
        );

        return progressPercentage;
    }

    async getLastActivityDate(userId) {
        const result = await this.db.query(
            'SELECT timestamp FROM activity_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 1',
            [userId]
        );
        return result.rows[0]?.timestamp;
    }

    async applyInactivityPenalty(userId) {
        await this.db.query(
            'UPDATE users SET current_streak = 0, progress_percentage = GREATEST(0, progress_percentage - $1) WHERE id = $2',
            [this.PROGRESS_PENALTY_PERCENTAGE, userId]
        );
    }

    getHoursSince(date) {
        return (new Date() - new Date(date)) / (1000 * 60 * 60);
    }

    getDaysSince(date) {
        return Math.floor(this.getHoursSince(date) / 24);
    }

    async getIncompleteModules(userId) {
        const query = `
            SELECT m.* FROM modules m
            JOIN user_progress up ON m.id = up.module_id
            WHERE up.user_id = $1 AND up.status != 'COMPLETED'
            ORDER BY up.last_attempt_at DESC NULLS LAST
        `;
        const result = await this.db.query(query, [userId]);
        return result.rows;
    }

    async getUnlockedModules(userId) {
        const query = `
            SELECT m.* FROM modules m
            JOIN user_progress up ON m.id = up.module_id
            WHERE up.user_id = $1 AND up.status = 'UNLOCKED'
            ORDER BY m.order_index
        `;
        const result = await this.db.query(query, [userId]);
        return result.rows;
    }

    async getUserWeaknesses(userId) {
        const query = `
            SELECT m.*, up.score_percentage
            FROM modules m
            JOIN user_progress up ON m.id = up.module_id
            WHERE up.user_id = $1 AND up.status = 'COMPLETED' AND up.score_percentage < 80
            ORDER BY up.score_percentage ASC
            LIMIT 3
        `;
        const result = await this.db.query(query, [userId]);
        return result.rows;
    }

    async getUserOverallProgress(userId) {
        const result = await this.db.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );
        return result.rows[0];
    }

    async getModule(moduleId) {
        const result = await this.db.query('SELECT * FROM modules WHERE id = $1', [moduleId]);
        return result.rows[0];
    }
}

module.exports = ProgressLockingSystem;
