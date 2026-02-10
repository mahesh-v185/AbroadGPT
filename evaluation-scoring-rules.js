// CSCA PREP WEB - Evaluation & Scoring Rules System

class EvaluationScoringSystem {
    constructor() {
        this.scoringRules = {
            moduleUnlockThreshold: 70, // Percentage needed to unlock next module
            maxAttemptsPerModule: 3,
            retakeCooldownHours: 24,
            timeBonusThreshold: 0.8, // Complete within 80% of time for bonus
            streakBonusDays: [7, 14, 30], // Milestone days for streak bonuses
            streakBonusPercentages: [5, 10, 15], // Bonus percentages
            inactivityPenaltyDays: 3,
            inactivityPenaltyPercentage: 10,
            weeklyTestWeight: 0.3, // 30% of overall score
            dailyPlanWeight: 0.4, // 40% of overall score
            moduleTestWeight: 0.3 // 30% of overall score
        };

        this.questionWeights = {
            mcq: 1.0,
            coding: 2.0,
            essay: 3.0,
            case: 2.5
        };

        this.difficultyMultipliers = {
            1: 1.0, // Easy
            2: 1.2, // Medium
            3: 1.5, // Hard
            4: 2.0, // Very Hard
            5: 2.5  // Expert
        };
    }

    /**
     * Calculate score for a module test
     */
    calculateModuleScore(attempts, timeSpentSeconds, timeLimitSeconds, questions) {
        let totalPoints = 0;
        let earnedPoints = 0;

        // Calculate base score from questions
        questions.forEach(question => {
            const weight = this.questionWeights[question.questionType] || 1.0;
            const difficultyMultiplier = this.difficultyMultipliers[question.difficulty] || 1.0;
            const questionPoints = question.points * weight * difficultyMultiplier;
            
            totalPoints += questionPoints;
            
            if (question.isCorrect) {
                earnedPoints += questionPoints;
            }
        });

        let baseScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

        // Apply time bonus
        const timeEfficiency = timeSpentSeconds / timeLimitSeconds;
        let timeBonus = 0;
        if (timeEfficiency <= this.scoringRules.timeBonusThreshold) {
            timeBonus = Math.min(5, (1 - timeEfficiency) * 10); // Max 5% bonus
        }

        // Apply attempt penalty
        let attemptPenalty = 0;
        if (attempts > 1) {
            attemptPenalty = (attempts - 1) * 2; // 2% penalty per additional attempt
        }

        const finalScore = Math.min(100, Math.max(0, baseScore + timeBonus - attemptPenalty));

        return {
            baseScore: Math.round(baseScore * 100) / 100,
            timeBonus: Math.round(timeBonus * 100) / 100,
            attemptPenalty: Math.round(attemptPenalty * 100) / 100,
            finalScore: Math.round(finalScore * 100) / 100,
            passed: finalScore >= this.scoringRules.moduleUnlockThreshold,
            totalPoints,
            earnedPoints
        };
    }

    /**
     * Calculate weekly test score
     */
    calculateWeeklyTestScore(questions, timeSpentSeconds, timeLimitSeconds) {
        let totalWeightedPoints = 0;
        let earnedWeightedPoints = 0;
        let subjectScores = {};

        questions.forEach(question => {
            const weight = this.questionWeights[question.questionType] || 1.0;
            const difficultyMultiplier = this.difficultyMultipliers[question.difficulty] || 1.0;
            const weightedPoints = question.points * weight * difficultyMultiplier;
            
            totalWeightedPoints += weightedPoints;
            
            if (question.isCorrect) {
                earnedWeightedPoints += weightedPoints;
            }

            // Track scores by subject
            if (!subjectScores[question.subjectId]) {
                subjectScores[question.subjectId] = { correct: 0, total: 0 };
            }
            subjectScores[question.subjectId].total += weightedPoints;
            if (question.isCorrect) {
                subjectScores[question.subjectId].correct += weightedPoints;
            }
        });

        const overallScore = totalWeightedPoints > 0 ? (earnedWeightedPoints / totalWeightedPoints) * 100 : 0;

        // Calculate subject-wise scores
        Object.keys(subjectScores).forEach(subjectId => {
            const subject = subjectScores[subjectId];
            subject.percentage = subject.total > 0 ? (subject.correct / subject.total) * 100 : 0;
        });

        // Calculate percentile rank (simulated - in real system would compare with other users)
        const percentileRank = this.calculatePercentileRank(overallScore);

        return {
            overallScore: Math.round(overallScore * 100) / 100,
            subjectScores,
            percentileRank,
            totalWeightedPoints,
            earnedWeightedPoints,
            timeEfficiency: timeSpentSeconds / timeLimitSeconds,
            performanceLevel: this.getPerformanceLevel(overallScore)
        };
    }

    /**
     * Calculate daily plan completion score
     */
    calculateDailyPlanScore(dailyPlan, completedMinutes, activities) {
        const plannedMinutes = dailyPlan.totalMinutes;
        const completionRate = Math.min(1, completedMinutes / plannedMinutes);
        
        let activityScores = {};
        let totalActivityScore = 0;
        let activityCount = 0;

        // Score each activity type
        activities.forEach(activity => {
            const activityScore = this.calculateActivityScore(activity);
            activityScores[activity.type] = activityScore;
            totalActivityScore += activityScore;
            activityCount++;
        });

        const averageActivityScore = activityCount > 0 ? totalActivityScore / activityCount : 0;
        
        // Weight completion rate and activity performance
        const dailyScore = (completionRate * 60) + (averageActivityScore * 40);

        return {
            dailyScore: Math.round(dailyScore * 100) / 100,
            completionRate: Math.round(completionRate * 100),
            activityScores,
            completedMinutes,
            plannedMinutes,
            bonusEarned: completionRate >= 1 ? 5 : 0 // 5% bonus for completing full plan
        };
    }

    /**
     * Calculate individual activity score
     */
    calculateActivityScore(activity) {
        switch (activity.type) {
            case 'LEARN':
                return this.calculateLearningScore(activity);
            case 'PRACTICE':
                return this.calculatePracticeScore(activity);
            case 'RECALL':
                return this.calculateRecallScore(activity);
            case 'TEST':
                return this.calculateTestScore(activity);
            default:
                return 0;
        }
    }

    calculateLearningScore(activity) {
        // Score based on time spent and comprehension checks
        const timeScore = Math.min(100, (activity.timeSpent / activity.allocatedTime) * 100);
        const comprehensionScore = activity.comprehensionChecks ? 
            (activity.comprehensionChecks.correct / activity.comprehensionChecks.total) * 100 : 80;
        
        return (timeScore * 0.4) + (comprehensionScore * 0.6);
    }

    calculatePracticeScore(activity) {
        // Score based on practice questions
        if (!activity.questions) return 0;
        
        const correct = activity.questions.filter(q => q.correct).length;
        const total = activity.questions.length;
        
        return total > 0 ? (correct / total) * 100 : 0;
    }

    calculateRecallScore(activity) {
        // Score based on spaced repetition performance
        if (!activity.recallQuestions) return 0;
        
        let totalScore = 0;
        let questionCount = 0;
        
        activity.recallQuestions.forEach(question => {
            const timeBonus = question.timeSpent < question.timeLimit ? 5 : 0;
            const correctnessScore = question.correct ? 95 : 0;
            totalScore += correctnessScore + timeBonus;
            questionCount++;
        });
        
        return questionCount > 0 ? totalScore / questionCount : 0;
    }

    calculateTestScore(activity) {
        // Score based on test performance
        return this.calculateModuleScore(
            activity.attempts || 1,
            activity.timeSpent,
            activity.timeLimit,
            activity.questions || []
        ).finalScore;
    }

    /**
     * Calculate overall progress score
     */
    calculateOverallProgressScore(userId, progressData) {
        const { moduleScores, weeklyTestScores, dailyPlanScores, currentStreak } = progressData;
        
        // Calculate weighted averages
        const moduleAverage = this.calculateAverage(moduleScores);
        const weeklyTestAverage = this.calculateAverage(weeklyTestScores);
        const dailyPlanAverage = this.calculateAverage(dailyPlanScores);
        
        // Apply weights
        const weightedScore = 
            (moduleAverage * this.scoringRules.moduleTestWeight) +
            (weeklyTestAverage * this.scoringRules.weeklyTestWeight) +
            (dailyPlanAverage * this.scoringRules.dailyPlanWeight);
        
        // Apply streak bonus
        const streakBonus = this.calculateStreakBonus(currentStreak);
        
        const finalScore = Math.min(100, weightedScore + streakBonus);
        
        return {
            moduleAverage,
            weeklyTestAverage,
            dailyPlanAverage,
            weightedScore: Math.round(weightedScore * 100) / 100,
            streakBonus,
            finalScore: Math.round(finalScore * 100) / 100,
            masteryLevel: this.getMasteryLevel(finalScore)
        };
    }

    /**
     * Calculate streak bonus
     */
    calculateStreakBonus(currentStreak) {
        let bonus = 0;
        
        this.scoringRules.streakBonusDays.forEach((milestone, index) => {
            if (currentStreak >= milestone) {
                bonus = this.scoringRules.streakBonusPercentages[index];
            }
        });
        
        return bonus;
    }

    /**
     * Calculate percentile rank (simulated)
     */
    calculatePercentileRank(score) {
        // In a real system, this would query the database to compare with other users
        // For now, we'll simulate based on score ranges
        if (score >= 95) return 99;
        if (score >= 90) return 95;
        if (score >= 85) return 85;
        if (score >= 80) return 75;
        if (score >= 75) return 60;
        if (score >= 70) return 45;
        if (score >= 65) return 30;
        if (score >= 60) return 20;
        return 10;
    }

    /**
     * Get performance level based on score
     */
    getPerformanceLevel(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Good';
        if (score >= 70) return 'Satisfactory';
        if (score >= 60) return 'Needs Improvement';
        return 'Poor';
    }

    /**
     * Get mastery level based on overall score
     */
    getMasteryLevel(score) {
        if (score >= 95) return 'Master';
        if (score >= 85) return 'Expert';
        if (score >= 75) return 'Advanced';
        if (score >= 65) return 'Intermediate';
        if (score >= 55) return 'Beginner';
        return 'Novice';
    }

    /**
     * Calculate average of array of scores
     */
    calculateAverage(scores) {
        if (!scores || scores.length === 0) return 0;
        const sum = scores.reduce((acc, score) => acc + score, 0);
        return sum / scores.length;
    }

    /**
     * Generate performance report
     */
    generatePerformanceReport(userId, progressData, timeRange) {
        const overallScore = this.calculateOverallProgressScore(userId, progressData);
        
        const report = {
            userId,
            timeRange,
            overallScore,
            generatedAt: new Date().toISOString(),
            recommendations: this.generateRecommendations(overallScore, progressData),
            strengths: this.identifyStrengths(progressData),
            weaknesses: this.identifyWeaknesses(progressData),
            nextMilestones: this.getNextMilestones(overallScore.finalScore),
            studyTimeStats: this.calculateStudyTimeStats(progressData)
        };
        
        return report;
    }

    /**
     * Generate personalized recommendations
     */
    generateRecommendations(overallScore, progressData) {
        const recommendations = [];
        
        if (overallScore.finalScore < 70) {
            recommendations.push({
                type: 'IMPROVEMENT',
                priority: 'HIGH',
                message: 'Focus on completing daily study plans consistently to build foundational knowledge.'
            });
        }
        
        if (overallScore.moduleAverage < overallScore.weeklyTestAverage) {
            recommendations.push({
                type: 'STRATEGY',
                priority: 'MEDIUM',
                message: 'Your weekly test performance is strong. Apply the same preparation approach to individual modules.'
            });
        }
        
        if (progressData.currentStreak < 7) {
            recommendations.push({
                type: 'CONSISTENCY',
                priority: 'HIGH',
                message: 'Build a study streak of at least 7 days to unlock streak bonuses and improve retention.'
            });
        }
        
        return recommendations;
    }

    /**
     * Identify user strengths
     */
    identifyStrengths(progressData) {
        const strengths = [];
        
        if (progressData.weeklyTestScores.length > 0) {
            const avgWeekly = this.calculateAverage(progressData.weeklyTestScores);
            if (avgWeekly >= 80) {
                strengths.push('Strong weekly test performance');
            }
        }
        
        if (progressData.currentStreak >= 14) {
            strengths.push('Excellent study consistency');
        }
        
        return strengths;
    }

    /**
     * Identify user weaknesses
     */
    identifyWeaknesses(progressData) {
        const weaknesses = [];
        
        if (progressData.dailyPlanScores.length > 0) {
            const avgDaily = this.calculateAverage(progressData.dailyPlanScores);
            if (avgDaily < 70) {
                weaknesses.push('Daily plan completion needs improvement');
            }
        }
        
        if (progressData.moduleScores.length > 0) {
            const avgModule = this.calculateAverage(progressData.moduleScores);
            if (avgModule < 70) {
                weaknesses.push('Module test scores below threshold');
            }
        }
        
        return weaknesses;
    }

    /**
     * Get next milestones for user
     */
    getNextMilestones(currentScore) {
        const milestones = [];
        
        if (currentScore < 70) {
            milestones.push({ score: 70, description: 'Reach satisfactory performance level' });
        }
        
        if (currentScore < 80) {
            milestones.push({ score: 80, description: 'Achieve good performance level' });
        }
        
        if (currentScore < 90) {
            milestones.push({ score: 90, description: 'Reach excellent performance level' });
        }
        
        if (currentScore < 95) {
            milestones.push({ score: 95, description: 'Achieve mastery level' });
        }
        
        return milestones;
    }

    /**
     * Calculate study time statistics
     */
    calculateStudyTimeStats(progressData) {
        const totalMinutes = progressData.totalStudyMinutes || 0;
        const totalHours = totalMinutes / 60;
        const averageDaily = totalMinutes / (progressData.activeDays || 1);
        
        return {
            totalMinutes,
            totalHours: Math.round(totalHours * 100) / 100,
            averageDailyMinutes: Math.round(averageDaily),
            efficiency: progressData.completedModules > 0 ? 
                Math.round((progressData.completedModules / totalHours) * 100) / 100 : 0
        };
    }

    /**
     * Apply inactivity penalty
     */
    applyInactivityPenalty(currentScore, daysInactive) {
        if (daysInactive > this.scoringRules.inactivityPenaltyDays) {
            const penalty = this.scoringRules.inactivityPenaltyPercentage;
            return Math.max(0, currentScore - penalty);
        }
        return currentScore;
    }

    /**
     * Check if user can retake a module
     */
    canRetakeModule(lastAttemptDate, attempts) {
        if (attempts >= this.scoringRules.maxAttemptsPerModule) {
            return { canRetake: false, reason: 'Maximum attempts reached' };
        }
        
        if (lastAttemptDate) {
            const hoursSinceAttempt = (new Date() - new Date(lastAttemptDate)) / (1000 * 60 * 60);
            if (hoursSinceAttempt < this.scoringRules.retakeCooldownHours) {
                return {
                    canRetake: false,
                    reason: `Must wait ${this.scoringRules.retakeCooldownHours - hoursSinceAttempt} more hours`,
                    cooldownRemaining: this.scoringRules.retakeCooldownHours - hoursSinceAttempt
                };
            }
        }
        
        return { canRetake: true };
    }
}

module.exports = EvaluationScoringSystem;
