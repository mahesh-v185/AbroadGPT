import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if it's the webdriver error or similar browser extension errors
    if (error.message && (
      error.message.includes('webdriver') || 
      error.message.includes('Cannot redefine property') ||
      error.message.includes('chrome') ||
      error.message.includes('selenium')
    )) {
      console.warn('Browser extension error detected and suppressed:', error.message);
      // Don't show error UI for webdriver errors as they're non-critical
      this.setState({ hasError: false });
      return;
    }
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Don't show error UI for webdriver errors
      if (this.state.error.message && (
        this.state.error.message.includes('webdriver') || 
        this.state.error.message.includes('Cannot redefine property') ||
        this.state.error.message.includes('chrome') ||
        this.state.error.message.includes('selenium')
      )) {
        return this.props.children;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 text-center mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <div className="text-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 p-4 bg-gray-100 rounded text-sm">
                <summary className="cursor-pointer font-medium">Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
