// Session management utilities

// Session expiration time (5 minutes in milliseconds)
const SESSION_EXPIRATION_TIME = 5 * 60 * 1000;

// Check if the session is active
export const isSessionActive = (): boolean => {
  const sessionExpiration = localStorage.getItem('pos_session_expiration');
  
  if (!sessionExpiration) {
    return false;
  }

  const expirationTime = parseInt(sessionExpiration, 10);
  return expirationTime > Date.now();
};

// Start a new session by setting the expiration timestamp
export const startSession = (): void => {
  const expirationTime = Date.now() + SESSION_EXPIRATION_TIME;
  localStorage.setItem('pos_session_expiration', expirationTime.toString());
};

// Clear the session
export const clearSession = (): void => {
  localStorage.removeItem('pos_session_expiration');
};

// Extend the current session by resetting the expiration time
export const extendSession = (): void => {
  if (isSessionActive()) {
    startSession();
  }
};

// Set up a session timeout that will clear the session after expiration
export const setupSessionTimeout = (): (() => void) => {
  // Calculate time until expiration
  const sessionExpiration = localStorage.getItem('pos_session_expiration');
  if (!sessionExpiration) {
    return () => {}; // No session, no timeout needed
  }

  const expirationTime = parseInt(sessionExpiration, 10);
  const timeUntilExpiration = expirationTime - Date.now();
  
  if (timeUntilExpiration <= 0) {
    clearSession();
    return () => {};
  }

  // Set timeout to clear session when it expires
  const timeoutId = setTimeout(() => {
    clearSession();
  }, timeUntilExpiration);

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
  };
};