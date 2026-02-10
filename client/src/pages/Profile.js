import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Calendar,
  Award,
  Target,
  Clock
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ fullName: formData.fullName });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and view your achievements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-outline btn-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      disabled
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Full Name</h3>
                    <p className="text-lg text-gray-900">{user.fullName}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Email Address</h3>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-lg text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Track</h3>
                    <p className="text-lg text-gray-900">
                      {user.trackId === 1 ? 'CSCA Core Sciences' : 'Chinese Government Scholarship'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Member Since</h3>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-lg text-gray-900">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats & Achievements */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Statistics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary-600" />
                    <span className="text-sm text-gray-600">Progress</span>
                  </div>
                  <span className="font-semibold text-primary-600">
                    {user.progressPercentage || 0}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Study Time</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {Math.round((user.totalStudyMinutes || 0) / 60)}h
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Current Streak</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {user.currentStreak || 0} days
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Achievements</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Award className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-gray-900">First Steps</p>
                    <p className="text-sm text-gray-600">Completed diagnostic test</p>
                  </div>
                </div>

                {(user.currentStreak || 0) >= 7 && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Target className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Week Warrior</p>
                      <p className="text-sm text-gray-600">7-day study streak</p>
                    </div>
                  </div>
                )}

                {(user.currentStreak || 0) >= 30 && (
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Award className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Dedicated Learner</p>
                      <p className="text-sm text-gray-600">30-day study streak</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
