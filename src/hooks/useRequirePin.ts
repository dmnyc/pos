import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyPin } from '../utils/pinUtils';
import { isSessionActive } from '../utils/sessionUtils';

export const useRequirePin = () => {
  const navigate = useNavigate();
  const pinChecked = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkPin = async () => {
      if (pinChecked.current) return;
      pinChecked.current = true;

      const storedPin = localStorage.getItem('pos_pin');

      if (!storedPin) {
        alert('Please set up a security PIN first');
        navigate('/security');
        return;
      }

      // Check if session is active before verifying PIN
      if (isSessionActive()) {
        return; // No need to verify PIN if session is active
      }

      const verified = await verifyPin();
      if (!verified) {
        navigate(-1);
      }
    };

    // Function to check session status continuously
    const checkSessionStatus = () => {
      if (!isSessionActive()) {
        // Session has expired, redirect to POS screen (home)
        navigate('/');
        return;
      }
    };

    // Initial PIN check
    checkPin();

    // Set up interval to check session status every 5 seconds
    // Only start monitoring after initial PIN check is complete
    const startMonitoring = () => {
      intervalRef.current = setInterval(checkSessionStatus, 5000);
    };

    // Start monitoring after a short delay to allow initial setup
    const monitoringTimeout = setTimeout(startMonitoring, 1000);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearTimeout(monitoringTimeout);
    };
  }, [navigate]);
};