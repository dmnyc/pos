import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyPin } from '../utils/pinUtils';

export const useRequirePin = () => {
  const navigate = useNavigate();
  const pinChecked = useRef(false);

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

      const verified = await verifyPin();
      if (!verified) {
        navigate(-1);
      }
    };

    checkPin();
  }, [navigate]);
};