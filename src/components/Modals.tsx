import React, { type ReactElement } from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  children?: React.ReactNode;
  size?: 'default' | 'large';
}

interface AlertModalProps extends BaseModalProps {
  message: string | ReactElement;
  buttonText?: string;
  onConfirm?: () => void;
}

interface ConfirmModalProps extends BaseModalProps {
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'default'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-gray-900 rounded-lg p-6 mx-4 relative ${size === 'large' ? 'w-full max-w-md' : 'w-full max-w-sm'}`}>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "OK",
  onConfirm,
  size
}) => (
  <BaseModal isOpen={isOpen} title={title} onClose={onClose} size={size}>
    <div className="text-white mb-6">{message}</div>
    <div className="flex justify-center">
      <button
        onClick={() => {
          if (onConfirm) {
            onConfirm();
          } else {
            onClose?.();
          }
        }}
        className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg transition-colors text-base"
      >
        {buttonText}
      </button>
    </div>
  </BaseModal>
);

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  size
}) => (
  <BaseModal isOpen={isOpen} title={title} onClose={onClose} size={size}>
    <p className="text-white mb-6">{message}</p>
    <div className="flex space-x-3">
      <button
        onClick={onClose}
        className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
      >
        {cancelText}
      </button>
      <button
        onClick={() => {
          onConfirm();
          onClose?.();
        }}
        className={`flex-1 py-2 px-4 ${
          isDanger
            ? 'bg-red-600 hover:bg-red-500'
            : 'bg-gray-600 hover:bg-gray-500'
        } text-white rounded-lg transition-colors`}
      >
        {confirmText}
      </button>
    </div>
  </BaseModal>
);