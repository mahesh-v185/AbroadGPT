import React, { useState, useEffect } from 'react';
import { useProgress } from '../contexts/ProgressContext';
import { 
  Calendar, 
  Clock, 
  Target, 
  CheckCircle,
  Play,
  BookOpen,
  Code,
  Brain,
  RotateCcw
} from 'lucide-react';

const DailyPlan = () => {
  const { generateDailyPlan, getTodayPlan } = useProgress();
  const [todayPlan, setTodayPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const loadTodayPlan = async () => {
      try {
        const plan = await getTodayPlan();
        setTodayPlan(plan);
      } catch (error) {
        console.error('Failed to load today\'s plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodayPlan();
  }, [getTodayPlan]);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const newPlan = await generateDailyPlan(90);
      setTodayPlan(newPlan);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setGenerating(false);
    }
  };

  const startSession = (module) => {
    // In a real app, this would start a study session
    console.log('Starting session for module:', module.title);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading today\'s plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Study Plan</h1>
          <p className="text-gray-600">Your personalized learning plan for today</p>
        </div>

        {!todayPlan ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">No Plan for Today</h2>
            <p className="text-gray-600 mb-6">
              Generate your personalized daily study plan to get started with focused learning.
            </p>
            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="btn btn-primary btn-lg"
            >
              {generating ? 'Generating...' : 'Generate Daily Plan'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Plan Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Today's Plan</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Total Time</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {todayPlan.totalMinutes} minutes
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Modules</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {todayPlan.modules?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Study Blocks */}
                <div className="space-y-4">
                  {todayPlan.modules?.map((module, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{module.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{module.allocatedMinutes} minutes</span>
                            <span>•</span>
                            <span className="capitalize">{module.type}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => startSession(module)}
                          className="btn btn-primary btn-sm"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Study Tips */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-gray-900 mb-4">Study Tips</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Learn First</p>
                      <p className="text-sm text-gray-600">
                        Start with new concepts and explanations
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Code className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Practice Next</p>
                      <p className="text-sm text-gray-600">
                        Apply knowledge with exercises
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Brain className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Test Yourself</p>
                      <p className="text-sm text-gray-600">
                        Evaluate understanding with quizzes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleGeneratePlan}
                    disabled={generating}
                    className="btn btn-outline w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Regenerate Plan
                  </button>
                  
                  <button className="btn btn-outline w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyPlan;
