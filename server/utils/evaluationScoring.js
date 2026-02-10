// Simplified evaluation and scoring system for the server
class EvaluationScoringSystem {
  constructor() {
    this.scoringRules = {
      moduleUnlockThreshold: 70,
      maxAttemptsPerModule: 3,
      retakeCooldownHours: 24,
      timeBonusThreshold: 0.8,
      weeklyTestWeight: 0.3,
      dailyPlanWeight: 0.4,
      moduleTestWeight: 0.3
    };

    this.questionWeights = {
      mcq: 1.0,
      coding: 2.0,
      essay: 3.0,
      case: 2.5
    };

    this.difficultyMultipliers = {
      1: 1.0,
      2: 1.2,
      3: 1.5,
      4: 2.0,
      5: 2.5
    };
  }

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
      timeBonus = Math.min(5, (1 - timeEfficiency) * 10);
    }

    // Apply attempt penalty
    let attemptPenalty = 0;
    if (attempts > 1) {
      attemptPenalty = (attempts - 1) * 2;
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

    // Calculate percentile rank (simulated)
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

  calculatePercentileRank(score) {
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

  getPerformanceLevel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  }

  getMasteryLevel(score) {
    if (score >= 95) return 'Master';
    if (score >= 85) return 'Expert';
    if (score >= 75) return 'Advanced';
    if (score >= 65) return 'Intermediate';
    if (score >= 55) return 'Beginner';
    return 'Novice';
  }
}

module.exports = EvaluationScoringSystem;
