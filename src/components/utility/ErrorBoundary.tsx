import { Component, ErrorInfo, ReactNode } from 'react';
import { RecoveryButton } from './RecoveryButton';
import { localStorageKeys } from '../../constants';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree.
 * It will display a fallback UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  // Check if user is authenticated (has NWC URL and PIN)
  isAuthenticated(): boolean {
    return !!localStorage.getItem(localStorageKeys.nwcUrl) && 
           !!localStorage.getItem('pos_pin');
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // For authenticated users, we just show a simple error message with a reload button
      // instead of the full recovery button (which would clear localStorage and PIN)
      if (this.isAuthenticated()) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6 text-center">
              <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
              <p className="mb-6 text-gray-400">
                The application encountered an unexpected error. You can try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Reload Page
              </button>
              
              {this.state.error && (
                <div className="mt-6 p-3 bg-gray-900 rounded text-left overflow-auto text-xs text-gray-400">
                  <p className="font-mono">{this.state.error.toString()}</p>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      // For non-authenticated users, show the full recovery UI
      return this.props.fallback || (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="mb-6 text-gray-400">
              The application encountered an unexpected error. Try refreshing the app to continue.
            </p>
            <RecoveryButton buttonText="Refresh Application" />
            
            {this.state.error && (
              <div className="mt-6 p-3 bg-gray-900 rounded text-left overflow-auto text-xs text-gray-400">
                <p className="font-mono">{this.state.error.toString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}