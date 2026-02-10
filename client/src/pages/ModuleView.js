import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Play, 
  CheckCircle,
  ArrowLeft,
  FileText,
  Code,
  Brain
} from 'lucide-react';

const ModuleView = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateModuleProgress } = useProgress();
  const [module, setModule] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    const loadModule = async () => {
      try {
        // In a real app, these would be API calls
        const moduleData = {
          id: moduleId,
          title: 'Sample Module',
          description: 'This is a sample module for demonstration',
          content: '<h2>Module Content</h2><p>Learning materials would go here...</p>',
          estimatedMinutes: 60,
          status: 'UNLOCKED'
        };
        
        const questionsData = {
          mcqs: [
            {
              id: 1,
              questionText: 'Sample MCQ question?',
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 'Option A',
              explanation: 'Explanation for the correct answer'
            }
          ]
        };

        setModule(moduleData);
        setQuestions(questionsData);
      } catch (error) {
        console.error('Failed to load module:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, [moduleId]);

  const startStudySession = async (sessionType) => {
    try {
      const session = {
        id: Date.now(),
        moduleId: parseInt(moduleId),
        sessionType,
        startTime: new Date()
      };
      setCurrentSession(session);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const completeModule = async () => {
    try {
      await updateModuleProgress(parseInt(moduleId), 85, 60);
      navigate('/app/dashboard');
    } catch (error) {
      console.error('Failed to complete module:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Module not found</h2>
          <p className="text-gray-600">The requested module could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="btn btn-outline btn-sm mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{module.title}</h1>
                <p className="text-gray-600 mb-4">{module.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{module.estimatedMinutes} minutes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>70% to unlock next</span>
                  </div>
                </div>
              </div>
              
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                module.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                module.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                module.status === 'UNLOCKED' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {module.status === 'COMPLETED' && <CheckCircle className="h-4 w-4 mr-1" />}
                {module.status.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Learn Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Learn</h2>
              </div>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: module.content }}
              />
              <button
                onClick={() => startStudySession('LEARN')}
                className="btn btn-primary w-full mt-4"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Learning Session
              </button>
            </div>

            {/* Practice Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center mb-4">
                <Code className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Practice</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Apply your knowledge with practice problems and exercises.
              </p>
              <button
                onClick={() => startStudySession('PRACTICE')}
                className="btn btn-outline w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Practice Session
              </button>
            </div>

            {/* Questions Section */}
            {questions && questions.mcqs && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Questions</h2>
                </div>
                <div className="space-y-4">
                  {questions.mcqs.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <p className="font-medium text-gray-900 mb-3">
                        {index + 1}. {question.questionText}
                      </p>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              className="text-primary-600"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => startStudySession('TEST')}
                  className="btn btn-primary w-full mt-4"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Start Test Session
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Module Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Module Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estimated Time</span>
                  <span className="font-medium">{module.estimatedMinutes} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Difficulty</span>
                  <span className="font-medium">Intermediate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Questions</span>
                  <span className="font-medium">{questions?.mcqs?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Best Score</span>
                  <span className="font-medium text-primary-600">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Attempts</span>
                  <span className="font-medium">2/3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time Spent</span>
                  <span className="font-medium">45 min</span>
                </div>
              </div>
              
              {module.status !== 'COMPLETED' && (
                <button
                  onClick={completeModule}
                  className="btn btn-primary w-full mt-4"
                >
                  Complete Module
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleView;
