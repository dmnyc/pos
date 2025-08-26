import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setupSessionTimeout } from '../utils/sessionUtils';
import { toast } from 'react-hot-toast';

/**
 * Hook to manage session timeouts
 * Sets up a timeout to clear the session after it expires and show notification
 */
export const useSessionManager = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set up session timeout to clear the session when it expires
    const cleanupTimeout = setupSessionTimeout(() => {
      // Check if we're currently on a protected page
      const protectedPaths = ['/settings', '/security'];
      const isOnProtectedPage = protectedPaths.some(path => location.pathname.startsWith(path));

      if (isOnProtectedPage) {
        // Redirect to POS screen immediately if on a protected page
        toast.error('Session expired. Returning to POS.', {
          duration: 2000,
          style: { background: '#dc2626', color: '#fff' },
        });
        navigate('/');
      } else {
        // Show notification for non-protected pages
        toast.success('Session expired. PIN will be required for the next secure operation.', {
          duration: 3000,
          style: { background: '#333', color: '#fff' },
        });
      }
    });

    // Return the cleanup function for the timeout
    return cleanupTimeout;
  }, [navigate, location]);
};