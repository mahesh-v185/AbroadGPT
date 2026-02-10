import React, { useState, useEffect } from 'react';
import { useProgress } from '../contexts/ProgressContext';
import { 
  Calendar, 
  Clock, 
  Target, 
  CheckCircle,
  Play,
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const WeeklyTest = () => {
  const { getWeeklyTest } = useProgress();
  const [weeklyTest, setWeeklyTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const loadWeeklyTest = async () => {
      try {
        const test = await getWeeklyTest();
        setWeeklyTest(test);
      } catch (error) {
        console.error('Failed to load weekly test:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyTest();
  }, [getWeeklyTest]);

  const startTest = async () => {
    setStarting(true);
    try {
      // In a real app, this would start the test
      console.log('Starting weekly test...');
    } catch (error) {
      console.error('Failed to start test:', error);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading weekly test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Assessment</h1>
          <p className="text-gray-600">Comprehensive test covering this week's modules</p>
        </div>

        {!weeklyTest ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">No Test Available</h2>
            <p className="text-gray-600 mb-6">
              Weekly tests become available after completing sufficient modules.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium text-yellow-900">Complete More Modules</p>
                  <p className="text-sm text-yellow-700">
                    Finish at least 3 modules to unlock weekly assessments
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Test Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Test Overview</h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    weeklyTest.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    weeklyTest.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {weeklyTest.status.replace('_', ' ')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Questions</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">48</p>
                    <p className="text-sm text-blue-700">Multiple choice</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Time Limit</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">60</p>
                    <p className="text-sm text-green-700">Minutes</p>
                  </div>
                </div>

                {/* Modules Covered */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Modules Covered</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weeklyTest.modulesCovered?.map((module, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">{module}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {weeklyTest.status === 'PENDING' && (
                    <button
                      onClick={startTest}
                      disabled={starting}
                      className="btn btn-primary btn-lg"
                    >
                      {starting ? 'Starting...' : 'Start Test'}
                      <Play className="h-5 w-5 ml-2" />
                    </button>
                  )}
                  
                  {weeklyTest.status === 'COMPLETED' && (
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{weeklyTest.score}%</p>
                        <p className="text-sm text-gray-600">Your Score</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{weeklyTest.percentage}%</p>
                        <p className="text-sm text-gray-600">Percentage</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-gray-900 mb-4">Test Tips</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Time Management</p>
                      <p className="text-sm text-gray-600">
                        Allocate ~1.25 minutes per question
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Read Carefully</p>
                      <p className="text-sm text-gray-600">
                        Understand each question before answering
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <BarChart3 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Stay Calm</p>
                      <p className="text-sm text-gray-600">
                        Don't rush through difficult questions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-gray-900 mb-4">Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Best Score</span>
                    <span className="font-medium text-green-600">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="font-medium text-blue-600">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tests Taken</span>
                    <span className="font-medium text-gray-900">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Improvement</span>
                    <span className="font-medium text-green-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +12%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyTest;
