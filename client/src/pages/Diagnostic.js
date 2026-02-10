import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { diagnosticAPI } from '../services/api';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  FileText,
  Play,
  RotateCcw,
  Target
} from 'lucide-react';
import ReactCountdown from 'react-countdown';

const Diagnostic = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDiagnosticTest();
  }, []);

  const loadDiagnosticTest = async () => {
    try {
      const response = await diagnosticAPI.getAvailableTests();
      const availableTest = response.data.find(t => t.is_active);
      
      if (!availableTest) {
        setLoading(false);
        return;
      }

      // Load sample questions based on track
      const sampleQuestions = getSampleQuestions(user?.trackId);
      setTest({
        ...availableTest,
        questions: sampleQuestions
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load diagnostic test:', error);
      setLoading(false);
    }
  };

  const getSampleQuestions = (trackId) => {
    if (trackId === 1) {
      // Official CSCA Track Questions
      return [
        {
          id: 1,
          questionText: "If A = {1, 2, 3, 4, 5} and B = {2, 4, 6, 8}, what is A ∩ B?",
          options: ["{1, 2, 3, 4, 5, 6, 8}", "{2, 4}", "{1, 3, 5}", "{6, 8}"],
          correctAnswer: "{2, 4}",
          subject: "Mathematics",
          difficulty: 1
        },
        {
          id: 2,
          questionText: "A car accelerates from rest to 20 m/s in 5 seconds. What is its acceleration?",
          options: ["2 m/s²", "4 m/s²", "5 m/s²", "10 m/s²"],
          correctAnswer: "4 m/s²",
          subject: "Physics",
          difficulty: 1
        },
        {
          id: 3,
          questionText: "What is the molar mass of H₂O?",
          options: ["16 g/mol", "18 g/mol", "20 g/mol", "22 g/mol"],
          correctAnswer: "18 g/mol",
          subject: "Chemistry",
          difficulty: 1
        },
        {
          id: 4,
          questionText: "Solve the inequality: x² - 4x + 3 > 0",
          options: ["x < 1 or x > 3", "1 < x < 3", "x ≤ 1 or x ≥ 3", "1 ≤ x ≤ 3"],
          correctAnswer: "x < 1 or x > 3",
          subject: "Mathematics",
          difficulty: 2
        },
        {
          id: 5,
          questionText: "What is the resistance of a circuit with 12V battery and 3A current?",
          options: ["1 Ω", "3 Ω", "4 Ω", "36 Ω"],
          correctAnswer: "4 Ω",
          subject: "Physics",
          difficulty: 1
        }
      ];
    } else {
      // Chinese Scholarship Track Questions
      return [
        {
          id: 101,
          questionText: "Solve: 3x - 7 = 2x + 5",
          options: ["x = 10", "x = 12", "x = 14", "x = 16"],
          correctAnswer: "x = 12",
          subject: "Mathematics",
          difficulty: 1
        },
        {
          id: 102,
          questionText: "Complete the series: 3, 7, 13, 21, 31, ?",
          options: ["41", "43", "45", "47"],
          correctAnswer: "43",
          subject: "Logical & Quantitative Reasoning",
          difficulty: 2
        },
        {
          id: 103,
          questionText: "Choose the correct form: 'The team ___ playing well.'",
          options: ["is", "are", "was", "were"],
          correctAnswer: "is",
          subject: "English",
          difficulty: 1
        },
        {
          id: 104,
          questionText: "What does '你好' (nǐ hǎo) mean?",
          options: ["Hello", "Goodbye", "Thank you", "Sorry"],
          correctAnswer: "Hello",
          subject: "Chinese Language",
          difficulty: 1
        },
        {
          id: 105,
          questionText: "What is sin(30°)?",
          options: ["0", "1/2", "√3/2", "1"],
          correctAnswer: "1/2",
          subject: "Mathematics",
          difficulty: 1
        }
      ];
    }
  };

  const startTest = async () => {
    try {
      const response = await diagnosticAPI.startTest(test.id);
      setSessionId(response.data.sessionId);
      setTestStarted(true);
      setTimeLeft(test.timeLimitMinutes * 60);
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitTest = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer,
        timeTaken: 60 // Placeholder
      }));

      await diagnosticAPI.submitTest(sessionId, formattedAnswers);
      setTestCompleted(true);
    } catch (error) {
      console.error('Failed to submit test:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateScore = () => {
    if (!test) return 0;
    
    let correct = 0;
    test.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    return Math.round((correct / test.questions.length) * 100);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Excellent! You have strong fundamentals.';
    if (score >= 60) return 'Good! You have a solid foundation to build upon.';
    if (score >= 40) return 'Fair. You need to focus on fundamentals.';
    return 'Needs improvement. We\'ll help you build from the basics.';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading diagnostic test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Test Available</h2>
          <p className="text-gray-600 mb-4">Diagnostic test is not available at the moment.</p>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (testCompleted) {
    const score = calculateScore();
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
              score >= 60 ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {score >= 60 ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : (
                <Target className="h-10 w-10 text-yellow-600" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Diagnostic Complete!
            </h2>
            
            <div className={`text-4xl font-bold mb-4 ${getScoreColor(score)}`}>
              {score}%
            </div>
            
            <p className="text-gray-600 mb-6">
              {getScoreMessage(score)}
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Questions Answered:</span>
                <span className="font-medium">{Object.keys(answers).length}/{test.questions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Correct Answers:</span>
                <span className="font-medium">
                  {test.questions.filter(q => answers[q.id] === q.correctAnswer).length}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/app/dashboard')}
              className="w-full btn btn-primary font-semibold"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <FileText className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Diagnostic Test
              </h1>
              <p className="text-gray-600">
                This assessment helps us create a personalized learning path for you
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-4">Test Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    {test.questions.length} Questions
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    {test.timeLimitMinutes} Minutes
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    {test.passingThreshold}% Passing Score
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    One-time Only
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-yellow-900 mb-2">Important Instructions</h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• This test can only be taken once</li>
                <li>• You cannot skip questions or go back during the test</li>
                <li>• The test will auto-submit when time expires</li>
                <li>• Find a quiet place with stable internet connection</li>
              </ul>
            </div>

            <button
              onClick={startTest}
              className="w-full btn btn-primary btn-lg font-semibold flex items-center justify-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Start Diagnostic Test</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Question {currentQuestion + 1} of {test.questions.length}
              </h2>
              <span className="text-sm text-gray-600">{question.subject}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <ReactCountdown
                  date={Date.now() + timeLeft * 1000}
                  renderer={({ minutes, seconds }) => (
                    <span className={`font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                    </span>
                  )}
                  onComplete={() => submitTest()}
                />
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {question.questionText}
          </h3>

          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <label
                key={index}
                className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() => handleAnswerSelect(question.id, option)}
                  className="mr-3"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="btn btn-outline flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {currentQuestion === test.questions.length - 1 ? (
              <button
                onClick={submitTest}
                disabled={submitting || Object.keys(answers).length < test.questions.length}
                className="btn btn-primary flex items-center space-x-2"
              >
                {submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={!answers[question.id]}
                className="btn btn-primary flex items-center space-x-2"
              >
                <span>Next</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;
