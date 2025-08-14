import React, { useState, useEffect } from 'react';

// Standard class names for consistent styling
const buttonClasses = "flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg transition-colors"
const secondaryButtonClasses = "flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
const pinInputClasses = "w-full p-3 text-center text-2xl tracking-widest bg-gray-700 border border-gray-600 rounded-lg text-white"

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  message?: string;
}

export const PinModal: React.FC<PinModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  message = "Enter your PIN to continue"
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Clear pin when modal opens/closes
  useEffect(() => {
    setPin('');
    setError(false);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError(true);
      return;
    }
    onSubmit(pin);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-sm mx-4">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-4 text-white">{message}</h2>
          
          <div className="mb-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setError(false);
                setPin(e.target.value);
              }}
              className={`${pinInputClasses} ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-[#ffcc99]'}`}
              placeholder="••••"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">
                PIN must be at least 4 digits
              </p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={secondaryButtonClasses}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={buttonClasses}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};