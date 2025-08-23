// Session management utilities

// Session expiration time (2 minutes in milliseconds)
const SESSION_EXPIRATION_TIME = 2 * 60 * 1000;

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

// Extend the current session (for manual use only, not automatic)
export const extendSession = (): void => {
  if (!isSessionActive()) {
    return;
  }

  // Add 2 minutes from now (fresh session)
  const newExpiration = Date.now() + SESSION_EXPIRATION_TIME;
  localStorage.setItem('pos_session_expiration', newExpiration.toString());
};

// Set up a session timeout that will clear the session after expiration
export const setupSessionTimeout = (onExpire?: () => void): (() => void) => {
  // Calculate time until expiration
  const sessionExpiration = localStorage.getItem('pos_session_expiration');
  if (!sessionExpiration) {
    return () => {}; // No session, no timeout needed
  }

  const expirationTime = parseInt(sessionExpiration, 10);
  const timeUntilExpiration = expirationTime - Date.now();
  
  if (timeUntilExpiration <= 0) {
    clearSession();
    if (onExpire) onExpire();
    return () => {};
  }

  // Set timeout to clear session when it expires
  const timeoutId = setTimeout(() => {
    clearSession();
    if (onExpire) onExpire();
  }, timeUntilExpiration);

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
  };
};