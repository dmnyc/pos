import React from 'react';
import { clearSession } from '../utils/sessionUtils';
import { useNavigate } from 'react-router-dom';
import { PopiconsLockDuotone } from "@popicons/react";
import toast from 'react-hot-toast';

interface FloatingLockButtonProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

/**
 * A floating lock button component that can be placed on payment screens
 * for quick access to locking the POS system.
 */
export const FloatingLockButton: React.FC<FloatingLockButtonProps> = ({
  position = 'top-right',
  className = '',
}) => {
  const navigate = useNavigate();

  // Position classes mapping
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const handleLock = () => {
    // Clear the session
    clearSession();
    // Show toast notification
    toast.success('POS locked. PIN required for next operation.', {
      duration: 3000,
    });
    // Navigate to home
    navigate('/');
  };

  return (
    <button
      onClick={handleLock}
      className={`fixed z-50 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-colors duration-200 ${positionClasses[position]} ${className}`}
      aria-label="Lock POS system"
    >
      <div className="flex items-center space-x-1">
        <PopiconsLockDuotone className="h-5 w-5" />
      </div>
    </button>
  );
};

export default FloatingLockButton;