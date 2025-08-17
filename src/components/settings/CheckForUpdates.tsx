import React, { useState } from 'react';
import { APP_VERSION } from '../utility/VersionLabel';

interface VersionInfo {
  version: string;
  buildNumber?: string;
  buildDate?: string;
}

interface CheckForUpdatesProps {
  className?: string;
}

export const CheckForUpdates: React.FC<CheckForUpdatesProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'current' | 'outdated' | 'error'>('idle');
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

  const checkForUpdates = async () => {
    try {
      setStatus('checking');
      
      // Fetch version info with cache busting to ensure we get the latest
      const response = await fetch(`/version.json?t=${Date.now()}`);
      
      if (!response.ok) {
        console.warn('Version check failed: Server responded with', response.status);
        setStatus('error');
        return;
      }

      const data: VersionInfo = await response.json();
      setVersionInfo(data);
      
      // Check if versions match
      if (data.version && data.version !== APP_VERSION) {
        console.log(`App version mismatch: running ${APP_VERSION}, latest is ${data.version}`);
        setStatus('outdated');
      } else {
        setStatus('current');
      }
    } catch (error) {
      console.warn('Version check failed:', error);
      setStatus('error');
    }
  };

  // Simple reload function that doesn't clear data
  const refreshApp = () => {
    // Add cache-busting parameter but keep all other query params
    const url = new URL(window.location.href);
    url.searchParams.set('refresh', Date.now().toString());
    window.location.href = url.toString();
  };

  return (
    <div className={`${className}`}>
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">App Version</h3>
        
        <div className="flex flex-col space-y-2">
          <div className="text-sm text-gray-400">
            Current version: <span className="text-white">{APP_VERSION}</span>
            {versionInfo?.buildNumber && (
              <span className="text-gray-500 ml-1">(build {versionInfo.buildNumber})</span>
            )}
          </div>
          
          {versionInfo?.buildDate && (
            <div className="text-sm text-gray-400">
              Build date: <span className="text-gray-300">{versionInfo.buildDate}</span>
            </div>
          )}
          
          {status === 'outdated' && versionInfo && (
            <div className="text-sm text-green-400">
              New version available: <span className="font-medium">{versionInfo.version}</span>
            </div>
          )}
          
          {status === 'current' && (
            <div className="text-sm text-green-400">
              Your app is up to date!
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-sm text-red-400">
              Could not check for updates. Please try again.
            </div>
          )}
          
          <div className="flex space-x-3 mt-2">
            <button
              onClick={checkForUpdates}
              disabled={status === 'checking'}
              className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm transition-colors"
            >
              {status === 'checking' ? 'Checking...' : 'Check for Updates'}
            </button>
            
            {status === 'outdated' && (
              <button
                onClick={refreshApp}
                className="bg-green-600 hover:bg-green-500 text-white py-1 px-3 rounded text-sm transition-colors"
              >
                Update Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};