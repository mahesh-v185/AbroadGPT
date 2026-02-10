import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Clock, 
  Award,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Users,
  Lock
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Target,
      title: 'Disciplined Learning',
      description: 'Mandatory daily study plans with 60-120 minute focused sessions',
    },
    {
      icon: BarChart3,
      title: 'Measurable Progress',
      description: 'Real-time tracking with detailed analytics and skill heatmaps',
    },
    {
      icon: Lock,
      title: 'Locked Progression',
      description: 'Cannot skip modules - must master each topic before advancing',
    },
    {
      icon: TrendingUp,
      title: 'Adaptive Learning',
      description: 'Personalized study paths based on diagnostic test results',
    },
    {
      icon: Clock,
      title: 'Consistency Tracking',
      description: 'Streak bonuses and inactivity penalties to maintain discipline',
    },
    {
      icon: Award,
      title: 'Performance Analytics',
      description: 'Detailed reports with percentile rankings and improvement metrics',
    },
  ];

  const tracks = [
    {
      name: 'Computer Science Core Areas',
      description: 'Comprehensive CS fundamentals preparation',
      subjects: ['Programming Foundations', 'Data Structures & Algorithms', 'OOP', 'Operating Systems', 'Databases', 'Networks'],
      color: 'blue',
      link: '/track-selection'
    },
    {
      name: 'Chinese Government Scholarship',
      description: 'Preparation for CSC and Chinese university entrance exams',
      subjects: ['Mathematics', 'English', 'Logical Reasoning', 'Chinese Language'],
      color: 'red',
      link: '/track-selection'
    }
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'CSCA Student',
      content: 'The disciplined approach forced me to stay consistent. I completed the entire curriculum in 3 months!',
      rating: 5
    },
    {
      name: 'Sarah Liu',
      role: 'Chinese Scholarship Applicant',
      content: 'The diagnostic test identified my weak areas perfectly. My scores improved by 40% in just 6 weeks.',
      rating: 5
    },
    {
      name: 'Michael Park',
      role: 'CS Graduate',
      content: 'Finally a platform that doesn\'t let you cheat the system. You either master it or you don\'t move on.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Master Your Exam Preparation
              <span className="block text-primary-200">With Discipline and Precision</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              No content dumps. No passive learning. Just structured, disciplined preparation that 
              exposes your weaknesses and forces improvement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/track-selection"
                className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-4"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold px-8 py-4"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Serious Students
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform enforces the discipline needed for real exam success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tracks Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Track
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select one track and commit to mastery
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {tracks.map((track, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-primary-300 transition-colors">
                <div className={`w-16 h-16 bg-${track.color}-100 rounded-lg flex items-center justify-center mb-6`}>
                  <BookOpen className={`h-8 w-8 text-${track.color}-600`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{track.name}</h3>
                <p className="text-gray-600 mb-6">{track.description}</p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Subjects Covered:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {track.subjects.map((subject, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{subject}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={track.link}
                  className="btn btn-primary w-full font-semibold"
                >
                  Choose This Track
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A systematic approach to guaranteed improvement
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Choose Track', description: 'Select CSCA or Chinese Scholarship track' },
              { step: 2, title: 'Diagnostic Test', description: 'Mandatory 90-minute assessment' },
              { step: 3, title: 'Daily Study', description: '60-120 minutes of structured learning' },
              { step: 4, title: 'Progress Tracking', description: 'Real-time analytics and weekly tests' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Student Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of students who achieved their goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join disciplined learners who achieve real results
          </p>
          <Link
            to="/track-selection"
            className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-4"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
