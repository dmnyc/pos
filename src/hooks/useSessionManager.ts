import { useEffect } from 'react';
import { extendSession, isSessionActive, setupSessionTimeout } from '../utils/sessionUtils';

/**
 * Hook to automatically extend the session when the user is active
 * Listens for user activity events like mouse movements, clicks, key presses
 * Also sets up a timeout to clear the session after it expires
 */
export const useSessionManager = () => {
  useEffect(() => {
    // Set up session timeout to clear the session when it expires
    const cleanupTimeout = setupSessionTimeout();

    // Only set up activity listeners if there's an active session
    if (!isSessionActive()) {
      return cleanupTimeout;
    }

    // Events that indicate user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Debounce the session extension to avoid too many updates
    let timeout: NodeJS.Timeout | null = null;
    
    const handleActivity = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(() => {
        // Extend the session if it's active
        if (isSessionActive()) {
          extendSession();
          // Reset the session timeout when extending
          cleanupTimeout();
          setupSessionTimeout();
        }
      }, 1000); // Debounce for 1 second
    };

    // Add event listeners for all activity events
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Clean up event listeners and timeout
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      
      cleanupTimeout();
    };
  }, []);
};