import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - only redirect if not on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Tracks and Content API
export const contentAPI = {
  getTracks: () => api.get('/tracks'),
  getTrackSubjects: (trackId) => api.get(`/tracks/${trackId}/subjects`),
  getSubjectModules: (subjectId) => api.get(`/subjects/${subjectId}/modules`),
  getModule: (moduleId) => api.get(`/modules/${moduleId}`),
  getModuleQuestions: (moduleId) => api.get(`/modules/${moduleId}/questions`),
  getQuestionAttempts: (moduleId) => api.get(`/questions/attempts/${moduleId}`),
};

// Diagnostic API
export const diagnosticAPI = {
  getAvailableTests: () => api.get('/diagnostic/available'),
  startTest: (testId) => api.post('/diagnostic/start', { diagnosticTestId: testId }),
  submitTest: (sessionId, answers) => api.post('/diagnostic/submit', { sessionId, answers }),
  getResults: (userId) => api.get(`/diagnostic/results/${userId}`),
};

// Daily Plans API
export const dailyPlanAPI = {
  getToday: () => api.get('/daily-plan/today'),
  generate: (data) => api.post('/daily-plan/generate', data),
  complete: (planId, data) => api.put(`/daily-plan/${planId}/complete`, data),
};

// Study Sessions API
export const sessionAPI = {
  start: (data) => api.post('/sessions/start', data),
  end: (sessionId, data) => api.post(`/sessions/${sessionId}/end`, data),
  getHistory: () => api.get('/sessions/history'),
};

// Progress API
export const progressAPIBasic = {
  getOverallProgress: () => api.get('/users/progress'),
  getSkillHeatmap: () => api.get('/users/heatmap'),
  getModuleProgress: () => api.get('/progress/modules'),
  updateModuleProgress: (moduleId, data) => api.post('/progress/update', { moduleId, ...data }),
  getWeeklyProgress: (startDate, endDate) => 
    api.get('/progress/weekly', { params: { startDate, endDate } }),
  exportProgress: (format, startDate, endDate) => 
    api.get(`/export/progress/${format}`, { 
      params: { startDate, endDate },
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),
};

// Questions API
export const questionsAPI = {
  attempt: (questionId, data) => api.post(`/questions/${questionId}/attempt`, data),
  getAttempts: (moduleId) => api.get(`/questions/attempts/${moduleId}`),
};

// Weekly Tests API
export const weeklyTestAPI = {
  getCurrent: () => api.get('/weekly-tests/current'),
  start: (testId) => api.post('/weekly-tests/start', { weeklyTestId: testId }),
  submit: (sessionId, answers) => api.post('/weekly-tests/submit', { sessionId, answers }),
};

// System Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
};

// Progress specific API (combining multiple endpoints)
export const progressAPI = {
  getOverallProgress: () => api.get('/users/progress'),
  getSkillHeatmap: () => api.get('/users/heatmap'),
  getDailyPlan: () => dailyPlanAPI.getToday(),
  getStudySessions: () => sessionAPI.getHistory(),
  getWeeklyTests: () => weeklyTestAPI.getCurrent(),
  getModuleProgress: () => api.get('/progress/modules'),
  generateDailyPlan: (data) => dailyPlanAPI.generate(data),
  completeDailyPlan: (data) => {
    // Get today's plan first, then complete it
    return dailyPlanAPI.getToday().then(response => {
      const planId = response.data.id;
      return dailyPlanAPI.complete(planId, data);
    });
  },
  startStudySession: (data) => sessionAPI.start(data),
  endStudySession: (sessionId, data) => sessionAPI.end(sessionId, data),
  updateModuleProgress: (moduleId, data) => api.post('/progress/update', { moduleId, ...data }),
  submitQuestionAttempt: (questionId, data) => questionsAPI.attempt(questionId, data),
  getWeeklyProgress: (startDate, endDate) => 
    api.get('/progress/weekly', { params: { startDate, endDate } }),
  exportProgress: (format, startDate, endDate) => 
    api.get(`/export/progress/${format}`, { 
      params: { startDate, endDate },
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),
};

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.error?.message || error.response.data?.message || 'Server error';
    return {
      message,
      status: error.response.status,
      code: error.response.data?.error?.code,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      code: 'NETWORK_ERROR',
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      code: 'UNKNOWN_ERROR',
    };
  }
};

// Utility function to create FormData for file uploads
export const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

// WebSocket connection for real-time updates
export const createWebSocketConnection = () => {
  const token = localStorage.getItem('token');
  const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
  
  return new WebSocket(`${wsUrl}?token=${token}`);
};

export default api;
