import React, { useEffect, useState } from 'react';

/**
 * App version number from package.json, made available through Vite's environment variables
 */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.1.0';

interface VersionInfo {
  version: string;
  buildNumber?: string;
  buildDate?: string;
}

interface VersionLabelProps {
  className?: string;
  showPrefix?: boolean;
  showBuild?: boolean;
}

/**
 * A small, reusable component to display the app version
 */
export const VersionLabel: React.FC<VersionLabelProps> = ({ 
  className = '', 
  showPrefix = false,
  showBuild = false
}) => {
  const [buildNumber, setBuildNumber] = useState<string | null>(null);

  useEffect(() => {
    if (showBuild) {
      // Fetch version info to get the build number
      fetch('/version.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch version info');
          }
          return response.json();
        })
        .then((data: VersionInfo) => {
          if (data.buildNumber) {
            setBuildNumber(data.buildNumber);
          }
        })
        .catch(error => {
          console.warn('Error fetching build number:', error);
        });
    }
  }, [showBuild]);

  return (
    <span className={`text-xs opacity-50 ${className}`}>
      {showPrefix ? 'v' : ''}{APP_VERSION}
      {showBuild && buildNumber && <span className="ml-1">(build {buildNumber})</span>}
    </span>
  );
};