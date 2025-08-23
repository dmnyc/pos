import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../utils/sessionUtils';

interface LockButtonProps {
  className?: string;
  variant?: 'icon' | 'text' | 'full';
}

/**
 * A button component that locks the POS system by clearing the current session
 * and redirecting to the home screen.
 */
export const LockButton: React.FC<LockButtonProps> = ({ 
  className = '', 
  variant = 'full' 
}) => {
  const navigate = useNavigate();

  const handleLock = () => {
    // Clear the active session
    clearSession();
    
    // Navigate to home screen
    navigate('/');
  };

  // Determine button content based on variant
  const buttonContent = () => {
    switch (variant) {
      case 'icon':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
        );
      case 'text':
        return 'Lock';
      case 'full':
      default:
        return (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
            <span>Lock POS</span>
          </div>
        );
    }
  };

  // Base button styling with variant-specific adjustments
  const buttonClass = `
    ${variant === 'icon' ? 'p-2 rounded-full' : 'px-3 py-2 rounded-md'} 
    bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200
    ${className}
  `;

  return (
    <button 
      className={buttonClass}
      onClick={handleLock}
      aria-label="Lock POS system"
    >
      {buttonContent()}
    </button>
  );
};

export default LockButton;