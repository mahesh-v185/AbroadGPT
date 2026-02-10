import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { progressAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ProgressContext = createContext();

const initialState = {
  overallProgress: null,
  skillHeatmap: [],
  dailyPlan: null,
  studySessions: [],
  weeklyTests: [],
  moduleProgress: [],
  isLoading: false,
  error: null,
};

const progressReducer = (state, action) => {
  switch (action.type) {
    case 'PROGRESS_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'PROGRESS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: null,
        [action.payload.type]: action.payload.data,
      };
    case 'PROGRESS_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'UPDATE_DAILY_PLAN':
      return {
        ...state,
        dailyPlan: action.payload,
      };
    case 'ADD_STUDY_SESSION':
      return {
        ...state,
        studySessions: [action.payload, ...state.studySessions],
      };
    case 'UPDATE_MODULE_PROGRESS':
      const updatedProgress = state.moduleProgress.map(module =>
        module.moduleId === action.payload.moduleId
          ? { ...module, ...action.payload }
          : module
      );
      
      // If module not found, add it
      if (!updatedProgress.find(m => m.moduleId === action.payload.moduleId)) {
        updatedProgress.push(action.payload);
      }
      
      return {
        ...state,
        moduleProgress: updatedProgress,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const ProgressProvider = ({ children }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadProgressData();
    }
  }, [isAuthenticated]);

  const loadProgressData = async () => {
    try {
      dispatch({ type: 'PROGRESS_START' });
      
      // Load all progress data in parallel
      const [
        overallResponse,
        heatmapResponse,
        dailyPlanResponse,
        sessionsResponse,
        weeklyTestsResponse,
        moduleProgressResponse,
      ] = await Promise.all([
        progressAPI.getOverallProgress(),
        progressAPI.getSkillHeatmap(),
        progressAPI.getDailyPlan().catch(() => ({ data: null })),
        progressAPI.getStudySessions(),
        progressAPI.getWeeklyTests(),
        progressAPI.getModuleProgress(),
      ]);

      dispatch({
        type: 'PROGRESS_SUCCESS',
        payload: { type: 'overallProgress', data: overallResponse.data },
      });
      
      dispatch({
        type: 'PROGRESS_SUCCESS',
        payload: { type: 'skillHeatmap', data: heatmapResponse.data },
      });
      
      dispatch({
        type: 'PROGRESS_SUCCESS',
        payload: { type: 'dailyPlan', data: dailyPlanResponse.data },
      });
      
      dispatch({
        type: 'PROGRESS_SUCCESS',
        payload: { type: 'studySessions', data: sessionsResponse.data },
      });
      
      dispatch({
        type: 'PROGRESS_SUCCESS',
        payload: { type: 'weeklyTests', data: weeklyTestsResponse.data },
      });
      
      dispatch({
        type: 'PROGRESS_SUCCESS',
        payload: { type: 'moduleProgress', data: moduleProgressResponse.data },
      });
    } catch (error) {
      dispatch({
        type: 'PROGRESS_FAILURE',
        payload: 'Failed to load progress data',
      });
    }
  };

  const generateDailyPlan = async (preferredMinutes = 90) => {
    try {
      const response = await progressAPI.generateDailyPlan({ preferredMinutes });
      dispatch({
        type: 'UPDATE_DAILY_PLAN',
        payload: response.data,
      });
      toast.success('Daily plan generated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to generate daily plan';
      toast.error(message);
      throw error;
    }
  };

  const completeDailyPlan = async (completedMinutes) => {
    try {
      const response = await progressAPI.completeDailyPlan({ completedMinutes });
      dispatch({
        type: 'UPDATE_DAILY_PLAN',
        payload: response.data,
      });
      
      // Update overall progress
      await loadProgressData();
      
      toast.success('Daily plan completed!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to complete daily plan';
      toast.error(message);
      throw error;
    }
  };

  const startStudySession = async (moduleId, sessionType) => {
    try {
      const response = await progressAPI.startStudySession({ moduleId, sessionType });
      dispatch({
        type: 'ADD_STUDY_SESSION',
        payload: response.data,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to start study session';
      toast.error(message);
      throw error;
    }
  };

  const endStudySession = async (sessionId, data) => {
    try {
      const response = await progressAPI.endStudySession(sessionId, data);
      
      // Update the session in state
      const updatedSessions = state.studySessions.map(session =>
        session.id === sessionId ? { ...session, ...response.data } : session
      );
      
      dispatch({
        type: 'PROGRESS_SUCCESS',
        payload: { type: 'studySessions', data: updatedSessions },
      });
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to end study session';
      toast.error(message);
      throw error;
    }
  };

  const updateModuleProgress = async (moduleId, progressData) => {
    try {
      const response = await progressAPI.updateModuleProgress(moduleId, progressData);
      
      dispatch({
        type: 'UPDATE_MODULE_PROGRESS',
        payload: {
          moduleId,
          ...response.data,
        },
      });
      
      // Reload overall progress to get updated metrics
      const overallResponse = await progressAPI.getOverallProgress();
      dispatch({
        type: 'PROGRESS_SUCCESS',
        payload: { type: 'overallProgress', data: overallResponse.data },
      });
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to update progress';
      toast.error(message);
      throw error;
    }
  };

  const submitQuestionAttempt = async (questionId, answer, sessionId) => {
    try {
      const response = await progressAPI.submitQuestionAttempt(questionId, {
        answer,
        sessionId,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to submit answer';
      toast.error(message);
      throw error;
    }
  };

  const getWeeklyProgress = async (startDate, endDate) => {
    try {
      const response = await progressAPI.getWeeklyProgress(startDate, endDate);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to get weekly progress';
      toast.error(message);
      throw error;
    }
  };

  const exportProgress = async (format, startDate, endDate) => {
    try {
      const response = await progressAPI.exportProgress(format, startDate, endDate);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `progress.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Progress exported as ${format.toUpperCase()}`);
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to export progress';
      toast.error(message);
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    loadProgressData,
    generateDailyPlan,
    completeDailyPlan,
    startStudySession,
    endStudySession,
    updateModuleProgress,
    submitQuestionAttempt,
    getWeeklyProgress,
    exportProgress,
    clearError,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
