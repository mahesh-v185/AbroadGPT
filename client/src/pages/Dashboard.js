import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import AuthTest from '../components/AuthTest';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp,
  Flame,
  Play,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Award
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    overallProgress, 
    skillHeatmap, 
    dailyPlan, 
    studySessions,
    generateDailyPlan 
  } = useProgress();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dailyPlan && overallProgress) {
      handleGeneratePlan();
    }
  }, [dailyPlan, overallProgress]);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      await generateDailyPlan(90);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-orange-600';
    if (streak >= 7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const recentSessions = studySessions?.slice(0, 5) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AuthTest />
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.fullName?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">
          Here's your learning progress and today's plan
        </p>
      </div>

      {/* Stats Grid */}
      {overallProgress && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">
                {overallProgress.progressPercentage?.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Overall Progress</h3>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(overallProgress.progressPercentage)}`}
                style={{ width: `${overallProgress.progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Flame className={`h-8 w-8 ${getStreakColor(overallProgress.currentStreak)}`} />
              <span className="text-2xl font-bold text-gray-900">
                {overallProgress.currentStreak}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
            <p className="text-xs text-gray-500 mt-1">
              Best: {overallProgress.longestStreak} days
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(overallProgress.totalStudyMinutes / 60)}h
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Study Time</h3>
            <p className="text-xs text-gray-500 mt-1">
              {overallProgress.totalStudyMinutes} minutes
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Award className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {skillHeatmap?.filter(s => s.masteryLevel >= 80).length || 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Mastered Subjects</h3>
            <p className="text-xs text-gray-500 mt-1">
              of {skillHeatmap?.length || 0} total
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Plan */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Today's Study Plan</h2>
                {!dailyPlan && !loading && (
                  <button
                    onClick={handleGeneratePlan}
                    className="btn btn-primary btn-sm"
                  >
                    Generate Plan
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Generating your plan...</p>
                </div>
              ) : dailyPlan ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(dailyPlan.planDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        dailyPlan.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800'
                          : dailyPlan.status === 'IN_PROGRESS'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {dailyPlan.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {dailyPlan.modules?.map((module, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            module.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <div>
                            <h4 className="font-medium text-gray-900">{module.title}</h4>
                            <p className="text-sm text-gray-600">{module.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {module.allocatedMinutes} min
                          </span>
                          {module.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Link
                              to={`/app/module/${module.moduleId}`}
                              className="btn btn-primary btn-sm"
                            >
                              <Play className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Progress: {dailyPlan.completedMinutes}/{dailyPlan.totalMinutes} minutes
                      </span>
                      <span className="font-medium text-gray-900">
                        {Math.round((dailyPlan.completedMinutes / dailyPlan.totalMinutes) * 100)}%
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(dailyPlan.completedMinutes / dailyPlan.totalMinutes) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No daily plan generated yet</p>
                  <button
                    onClick={handleGeneratePlan}
                    className="btn btn-primary"
                  >
                    Generate Today's Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Skill Heatmap */}
          {skillHeatmap && skillHeatmap.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Skill Mastery</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {skillHeatmap.slice(0, 5).map((subject) => (
                    <div key={subject.subjectId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {subject.subjectName}
                        </span>
                        <span className="text-sm text-gray-600">
                          {subject.masteryLevel.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(subject.masteryLevel)}`}
                          style={{ width: `${subject.masteryLevel}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/app/progress"
                  className="mt-4 block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Detailed Progress →
                </Link>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {recentSessions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        session.sessionType === 'TEST' ? 'bg-green-500' :
                        session.sessionType === 'PRACTICE' ? 'bg-blue-500' :
                        session.sessionType === 'LEARN' ? 'bg-yellow-500' :
                        'bg-purple-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.moduleTitle}
                        </p>
                        <p className="text-xs text-gray-600">
                          {session.sessionType} • {session.durationMinutes} min
                        </p>
                      </div>
                      {session.score && (
                        <span className="text-sm font-medium text-gray-900">
                          {session.score}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <Link
                  to="/app/progress"
                  className="mt-4 block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All Activity →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
