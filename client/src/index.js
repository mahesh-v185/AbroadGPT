import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Disable Sentry completely
window.Sentry = {
  captureException: () => {},
  captureMessage: () => {},
  addBreadcrumb: () => {},
  withScope: () => {},
  configureScope: () => {},
  setUser: () => {},
  setTags: () => {},
  setExtra: () => {},
  setContext: () => {}
};

// Global error handler for browser extension errors
window.addEventListener('error', (event) => {
  // Suppress webdriver and browser extension errors
  if (event.message && (
    event.message.includes('webdriver') || 
    event.message.includes('Cannot redefine property') ||
    event.message.includes('chrome') ||
    event.message.includes('selenium')
  )) {
    console.warn('Browser extension error suppressed:', event.message);
    event.preventDefault();
    return false;
  }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  // Suppress webdriver and browser extension errors in promises
  if (event.reason && event.reason.message && (
    event.reason.message.includes('webdriver') || 
    event.reason.message.includes('Cannot redefine property') ||
    event.reason.message.includes('chrome') ||
    event.reason.message.includes('selenium')
  )) {
    console.warn('Browser extension promise error suppressed:', event.reason.message);
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
