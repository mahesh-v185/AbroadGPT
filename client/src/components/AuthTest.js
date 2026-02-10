import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthTest = () => {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Auth State Debug</h3>
      <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
      <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      <p><strong>Token:</strong> {token ? 'Exists' : 'None'}</p>
      <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
      <p><strong>LocalStorage Token:</strong> {localStorage.getItem('token') ? 'Exists' : 'None'}</p>
      
      <button 
        onClick={() => {
          console.log('AuthTest - Current state:', { user, token, isAuthenticated, isLoading });
          console.log('AuthTest - localStorage:', localStorage.getItem('token'));
        }}
        style={{ 
          padding: '10px', 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Log State to Console
      </button>
    </div>
  );
};

export default AuthTest;
