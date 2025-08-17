import React, { useEffect, useState } from 'react';
import { RecoveryButton } from './RecoveryButton';

// This should match your package.json version
// We'll dynamically inject this during the build process
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

interface VersionCheckerProps {
  checkInterval?: number; // in milliseconds, default 1 hour
}

/**
 * VersionChecker periodically checks if the running application version
 * matches the latest version on the server.
 * 
 * It will prompt users to refresh when a new version is detected.
 */
export const VersionChecker: React.FC<VersionCheckerProps> = ({ 
  checkInterval = 60 * 60 * 1000 // 1 hour default
}) => {
  const [outdated, setOutdated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Function to check for version mismatch
  const checkVersion = async () => {
    try {
      // Fetch version info with cache busting
      const response = await fetch(`/version.json?t=${Date.now()}`);
      
      if (!response.ok) {
        console.warn('Version check failed: Server responded with', response.status);
        return;
      }

      const data = await response.json();
      
      // If versions don't match, show the update notification
      if (data.version && data.version !== APP_VERSION) {
        console.log(`App version mismatch: running ${APP_VERSION}, latest is ${data.version}`);
        setOutdated(true);
        setModalOpen(true);
      }
    } catch (error) {
      console.warn('Version check failed:', error);
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkVersion();
    
    // Set up periodic checks
    const intervalId = setInterval(checkVersion, checkInterval);
    
    // Check when the app regains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkInterval]);

  // No UI needed if everything is up to date
  if (!outdated || !modalOpen) {
    return null;
  }

  // Modal UI for update notification
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4">Update Available</h2>
        <p className="text-gray-300 mb-6">
          A new version of the application is available. Please refresh to get the latest features and fixes.
        </p>
        <div className="flex justify-between">
          <button 
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Later
          </button>
          <RecoveryButton 
            buttonText="Update Now" 
            explanation="" 
            className="ml-4"
          />
        </div>
      </div>
    </div>
  );
};