import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Code, 
  Database, 
  Network,
  Globe,
  Calculator,
  Brain,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

const TrackSelection = () => {
  const navigate = useNavigate();

  const tracks = [
    {
      id: 1,
      name: 'CSCA Core Sciences',
      code: 'CSCA',
      description: 'China Scholarship Council Core Science Subjects for undergraduate studies in science and engineering',
      icon: Calculator,
      color: 'blue',
      duration: '3-4 months',
      difficulty: 'Intermediate to Advanced',
      subjects: [
        { name: 'Mathematics', icon: Calculator, modules: 4 },
        { name: 'Physics', icon: Target, modules: 5 },
        { name: 'Chemistry', icon: Brain, modules: 4 }
      ],
      outcomes: [
        'Master fundamental science concepts',
        'Develop problem-solving skills',
        'Prepare for university-level studies',
        'Excel in CSCA examinations'
      ],
      dailyCommitment: '90-120 minutes'
    },
    {
      id: 2,
      name: 'Chinese Government Scholarship',
      code: 'CHINESE_SCHOLARSHIP',
      description: 'Complete preparation for CSC scholarship exams and Chinese university entrance assessments',
      icon: Globe,
      color: 'red',
      duration: '2-3 months',
      difficulty: 'Intermediate',
      subjects: [
        { name: 'Mathematics', icon: Calculator, modules: 6 },
        { name: 'English', icon: MessageSquare, modules: 5 },
        { name: 'Logical & Quantitative Reasoning', icon: Brain, modules: 4 },
        { name: 'Chinese Language (Optional)', icon: Globe, modules: 3 }
      ],
      outcomes: [
        'Excel in scholarship exams',
        'Master quantitative reasoning',
        'Improve English proficiency',
        'Basic Chinese communication'
      ],
      dailyCommitment: '60-90 minutes'
    }
  ];

  const handleTrackSelect = (trackId) => {
    // Store selected track in localStorage for registration
    localStorage.setItem('selectedTrack', trackId);
    navigate('/register');
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        icon: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-600',
        icon: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Choose Your Learning Track</h1>
              <p className="text-gray-600 mt-1">
                Select one track to begin your disciplined learning journey
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Target className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Important Notice</h3>
              <p className="text-yellow-700 mt-2">
                <strong>Track selection is permanent.</strong> Once you choose a track and register, 
                you cannot switch to another track. This ensures focused, disciplined learning 
                without distractions. Choose carefully based on your goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Track Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {tracks.map((track) => {
            const Icon = track.icon;
            const colors = getColorClasses(track.color);
            
            return (
              <div key={track.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Track Header */}
                <div className={`${colors.bg} border-b ${colors.border} p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 ${colors.text} bg-white rounded-lg flex items-center justify-center`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{track.name}</h2>
                        <p className="text-gray-600">{track.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                        {track.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Track Content */}
                <div className="p-6">
                  <p className="text-gray-700 mb-6">{track.description}</p>

                  {/* Track Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Daily: {track.dailyCommitment}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {track.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Subjects Covered</h3>
                    <div className="space-y-3">
                      {track.subjects.map((subject, index) => {
                        const SubjectIcon = subject.icon;
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <SubjectIcon className="h-5 w-5 text-gray-600" />
                              <span className="font-medium text-gray-900">{subject.name}</span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {subject.modules} modules
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Outcomes</h3>
                    <div className="space-y-2">
                      {track.outcomes.map((outcome, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-gray-700">{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleTrackSelect(track.id)}
                    className={`w-full btn text-white font-semibold py-3 px-6 rounded-lg ${colors.button} transition-colors flex items-center justify-center space-x-2`}
                  >
                    <span>Choose This Track</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Track Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-600">CSCA</th>
                  <th className="text-center py-3 px-4 font-semibold text-red-600">Chinese Scholarship</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Focus Area</td>
                  <td className="py-3 px-4 text-center">Computer Science Fundamentals</td>
                  <td className="py-3 px-4 text-center">Scholarship Exam Preparation</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Technical Depth</td>
                  <td className="py-3 px-4 text-center">Very High</td>
                  <td className="py-3 px-4 text-center">Moderate</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Mathematics</td>
                  <td className="py-3 px-4 text-center">Applied CS Math</td>
                  <td className="py-3 px-4 text-center">Comprehensive</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Language Focus</td>
                  <td className="py-3 px-4 text-center">English (Technical)</td>
                  <td className="py-3 px-4 text-center">English + Chinese</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Career Outcome</td>
                  <td className="py-3 px-4 text-center">Tech Industry Preparation</td>
                  <td className="py-3 px-4 text-center">Scholarship & University</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackSelection;
