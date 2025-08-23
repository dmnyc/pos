import { useEffect } from 'react';
import { setupSessionTimeout } from '../utils/sessionUtils';
import { toast } from 'react-hot-toast';

/**
 * Hook to manage session timeouts
 * Sets up a timeout to clear the session after it expires and show notification
 */
export const useSessionManager = () => {
  useEffect(() => {
    // Set up session timeout to clear the session when it expires
    const cleanupTimeout = setupSessionTimeout(() => {
      // Show notification when session expires automatically
      toast.success('Session expired. PIN will be required for the next secure operation.', {
        duration: 3000,
        style: { background: '#333', color: '#fff' },
      });
    });

    // Return the cleanup function for the timeout
    return cleanupTimeout;
  }, []);
};