import React from 'react';

/**
 * A recovery button component that helps users recover from blank screens or stale cache issues.
 * This can be displayed either:
 * 1. When an error boundary catches an error
 * 2. As a small button in the corner of the app for users experiencing issues
 * 3. After a version mismatch is detected
 */
export const RecoveryButton: React.FC<{
  className?: string;
  buttonText?: string;
  explanation?: string;
}> = ({ 
  className = '', 
  buttonText = 'App not working? Click to refresh', 
  explanation = 'This will clear cached data and reload the application.'
}) => {
  
  /**
   * Performs a complete app refresh by:
   * 1. Unregistering service workers
   * 2. Clearing caches
   * 3. Reloading the page
   */
  const handleRecovery = async () => {
    try {
      // Show loading state
      const button = document.getElementById('recovery-button');
      if (button) {
        button.textContent = 'Clearing data...';
        button.setAttribute('disabled', 'true');
      }

      // Set a timeout to force reload even if something goes wrong
      const forceReloadTimeout = setTimeout(() => {
        window.location.reload();
      }, 5000); // Force reload after 5 seconds if stuck

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
          console.log('Service worker unregistered');
        }
      }

      // Clear caches
      if ('caches' in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(
          cacheKeys.map(key => window.caches.delete(key))
        );
        console.log('Caches cleared');
      }

      // Clear localStorage (except critical items if needed)
      // Optional: You could preserve certain settings if needed
      window.localStorage.clear();
      console.log('localStorage cleared');

      // Cancel the force reload timeout since we're doing it manually
      clearTimeout(forceReloadTimeout);

      // Reload with cache busting parameter
      window.location.href = window.location.href.split('?')[0] + 
        '?fresh=' + Date.now();
    } catch (error) {
      console.error('Recovery failed:', error);
      alert('Recovery failed. Please try closing all browser windows and reopening the app.');
      
      // Force reload as last resort
      window.location.reload();
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        id="recovery-button"
        onClick={handleRecovery}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow-md transition-colors"
      >
        {buttonText}
      </button>
      {explanation && (
        <p className="mt-2 text-xs text-gray-500 max-w-xs text-center">
          {explanation}
        </p>
      )}
    </div>
  );
};