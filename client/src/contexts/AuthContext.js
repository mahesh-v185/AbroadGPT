import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  console.log('AuthReducer: Action received:', action.type, action.payload);
  
  switch (action.type) {
    case 'AUTH_START':
      console.log('AuthReducer: AUTH_START - Setting loading true');
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      console.log('AuthReducer: AUTH_SUCCESS - Setting authenticated true');
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      console.log('AuthReducer: AUTH_FAILURE - Setting authenticated false');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      console.log('AuthReducer: LOGOUT - Clearing auth state');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      console.log('AuthReducer: Unknown action:', action.type);
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('AuthContext: Initializing auth, token exists:', !!token);
      
      if (token) {
        try {
          const response = await authAPI.getProfile();
          console.log('AuthContext: Profile response:', response);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.data,
              token,
            },
          });
        } catch (error) {
          console.error('AuthContext: Profile fetch error:', error);
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login process for:', email);
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.login({ email, password });
      console.log('AuthContext: Login response received:', response);
      
      const { user, token } = response.data;
      console.log('AuthContext: Extracted user and token:', { user, token: token ? '***' : 'null' });
      
      localStorage.setItem('token', token);
      console.log('AuthContext: Token stored in localStorage');
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      console.log('AuthContext: AUTH_SUCCESS dispatched, state should be updated');
      
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Login failed';
      console.error('AuthContext: Login error:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.register(userData);
      
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data,
      });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
