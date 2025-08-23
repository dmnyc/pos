import React, { useState, useEffect } from 'react';
import { isSessionActive } from '../utils/sessionUtils';

interface SessionTimeoutIndicatorProps {
  className?: string;
  inline?: boolean;
}

/**
 * A subtle indicator that shows the session timeout status
 * Green: > 1 minute remaining
 * Yellow: ≤ 1 minute remaining (when countdown appears)
 * Hidden: No active session
 */
export const SessionTimeoutIndicator: React.FC<SessionTimeoutIndicatorProps> = ({
  className = '',
  inline = false
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    const updateTimeRemaining = () => {
      if (!isSessionActive()) {
        setTimeRemaining(null);
        return;
      }

      const sessionExpiration = localStorage.getItem('pos_session_expiration');
      if (!sessionExpiration) {
        setTimeRemaining(null);
        return;
      }

      const expirationTime = parseInt(sessionExpiration, 10);
      const remaining = Math.max(0, expirationTime - Date.now());
      setTimeRemaining(remaining);
    };

    // Update immediately
    updateTimeRemaining();

    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render if no session is active
  if (timeRemaining === null) {
    return null;
  }

  // Determine color based on time remaining (aligned with countdown display)
  const getIndicatorColor = () => {
    const secondsRemaining = timeRemaining / 1000;
    
    if (secondsRemaining > 60) {
      return 'bg-green-500'; // Green: > 1 minute
    } else {
      return 'bg-yellow-500'; // Yellow: ≤ 1 minute (when countdown shows)
    }
  };

  // Get tooltip text with remaining time
  const getTooltipText = () => {
    const secondsRemaining = Math.ceil(timeRemaining / 1000);
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    
    if (minutes > 0) {
      return `Session expires in ${minutes}m ${seconds}s`;
    } else {
      return `Session expires in ${seconds}s`;
    }
  };

  const baseClasses = inline 
    ? `flex items-center ${className}` 
    : `fixed top-4 left-16 z-30 ${className}`;

  return (
    <div
      className={baseClasses}
      title={getTooltipText()}
    >
      <div className="flex items-center space-x-1">
        {/* Simple dot indicator */}
        <div 
          className={`w-2.5 h-2.5 rounded-full ${getIndicatorColor()} transition-colors duration-500`}
        />
        
        {/* Show seconds when < 60 seconds for 2-minute timer */}
        {timeRemaining < 60000 && (
          <span className="text-[10px] text-gray-400 font-mono opacity-75">
            {Math.ceil(timeRemaining / 1000)}s
          </span>
        )}
      </div>
    </div>
  );
};

export default SessionTimeoutIndicator;