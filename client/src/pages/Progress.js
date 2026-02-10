import React, { useState, useEffect } from 'react';
import { useProgress } from '../contexts/ProgressContext';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target,
  Calendar,
  Award
} from 'lucide-react';

const Progress = () => {
  const { getOverallProgress, getSkillHeatmap } = useProgress();
  const [overallProgress, setOverallProgress] = useState(null);
  const [skillHeatmap, setSkillHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progressData = await getOverallProgress();
        const heatmapData = await getSkillHeatmap();
        setOverallProgress(progressData);
        setSkillHeatmap(heatmapData);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [getOverallProgress, getSkillHeatmap]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600">Track your learning journey and performance metrics</p>
        </div>

        {/* Overall Progress */}
        {overallProgress && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
                <BarChart3 className="h-5 w-5 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {overallProgress.progressPercentage}%
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Streak</h3>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {overallProgress.currentStreak} days
              </div>
              <div className="text-sm text-gray-600">Keep it up!</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Study Time</h3>
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round(overallProgress.totalStudyMinutes / 60)}h
              </div>
              <div className="text-sm text-gray-600">Total hours</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Best Streak</h3>
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {overallProgress.longestStreak} days
              </div>
              <div className="text-sm text-gray-600">Personal record</div>
            </div>
          </div>
        )}

        {/* Skill Heatmap */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Subject Mastery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillHeatmap.map((subject, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{subject.subjectName}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mastery Level</span>
                    <span className="font-semibold text-primary-600">
                      {Math.round(subject.masteryLevel)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="font-semibold text-green-600">
                      {subject.modulesCompleted}/{subject.totalModules}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${subject.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Activity</h2>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">{day}</div>
                <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
