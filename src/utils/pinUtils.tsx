import { createRoot } from 'react-dom/client';
import { PinModal } from '../components/PinModal';
import { AlertModal } from '../components/Modals';
import { isSessionActive, startSession } from './sessionUtils';

const showAlert = (title: string, message: string): Promise<void> => {
  return new Promise((resolve) => {
    const modalContainer = document.createElement('div');
    document.body.appendChild(modalContainer);
    const root = createRoot(modalContainer);

    const cleanup = () => {
      root.unmount();
      document.body.removeChild(modalContainer);
      resolve();
    };

    root.render(
      <AlertModal
        isOpen
        title={title}
        message={message}
        onClose={cleanup}
      />
    );
  });
};

export const verifyPin = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const storedPin = localStorage.getItem('pos_pin');

    if (!storedPin) {
      showAlert('Error', 'Security PIN is not set').then(() => resolve(false));
      return;
    }

    // Check if session is active (user verified PIN within the last 5 minutes)
    if (isSessionActive()) {
      // If session is active, no need to re-enter PIN
      resolve(true);
      return;
    }

    // Create a div for the modal
    const modalContainer = document.createElement('div');
    document.body.appendChild(modalContainer);
    const root = createRoot(modalContainer);

    // Function to clean up the modal
    const cleanup = () => {
      root.unmount();
      document.body.removeChild(modalContainer);
    };

    // Render the modal
    root.render(
      <PinModal
        isOpen
        onClose={() => {
          cleanup();
          resolve(false);
        }}
        onSubmit={async (enteredPin) => {
          if (enteredPin === storedPin) {
            // Start a new session when PIN is successfully verified
            startSession();
            cleanup();
            resolve(true);
          } else {
            cleanup();
            await showAlert('Error', 'Incorrect PIN');
            resolve(false);
          }
        }}
      />
    );
  });
};