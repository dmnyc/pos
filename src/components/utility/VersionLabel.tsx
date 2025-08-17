import React from 'react';

/**
 * App version number from package.json, made available through Vite's environment variables
 */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

interface VersionLabelProps {
  className?: string;
  showPrefix?: boolean;
}

/**
 * A small, reusable component to display the app version
 */
export const VersionLabel: React.FC<VersionLabelProps> = ({ 
  className = '', 
  showPrefix = false 
}) => {
  return (
    <span className={`text-xs opacity-50 ${className}`}>
      {showPrefix ? 'v' : ''}{APP_VERSION}
    </span>
  );
};