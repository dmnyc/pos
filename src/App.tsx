import { HashRouter as Router, Route, Routes, useParams, useNavigate, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import { Wallet } from "./pages/Wallet";
import { NotFound } from "./pages/NotFound";
import { New } from "./pages/wallet/New";
import { Pay } from "./pages/wallet/Pay";
import { Paid } from "./pages/wallet/Paid";
import { Share } from "./pages/wallet/Share";
import { About } from "./pages/About";
import { Settings } from "./pages/Settings";
import { TipPage } from "./pages/wallet/Tip";
import { TipOnly } from "./pages/wallet/TipOnly";
import Security from "./pages/Security";
import { Disclaimers } from "./pages/Disclaimers";
import React, { useEffect, useState } from "react";
import { getMerchantConfig } from "./config";
import { localStorageKeys } from "./constants";
import { ErrorBoundary, VersionChecker, RecoveryButton } from "./components/utility";

// Main App wrapper that adds router
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

// Main content component that needs router context
function AppContent() {
  // State for the recovery button
  const [showRecoveryButton, setShowRecoveryButton] = useState(false);
  const location = useLocation();
  
  // Apply the theme from merchant config
  const config = getMerchantConfig();

  // Set the theme when the app loads
  useEffect(() => {
    // Valid themes are "standard" and "industrial" and all other supported themes
    const validTheme = ["standard", "industrial", "orangepill", "nostrich", 
                        "beehive", "liquidity", "safari", "blocktron"].includes(config.theme)
      ? config.theme
      : "standard";

    // Apply the theme to the root element for DaisyUI
    document.documentElement.setAttribute("data-theme", validTheme);
  }, [config.theme]);

  // Check if user is authenticated (has NWC URL and PIN)
  const isAuthenticated = () => {
    return !!localStorage.getItem(localStorageKeys.nwcUrl) && 
           !!localStorage.getItem('pos_pin');
  };

  // Check if the current path is the security page
  const isSecurityPage = location.pathname.startsWith('/security');

  // Detect any open modals
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  // Set up modal detection
  useEffect(() => {
    const checkForModals = () => {
      // Check for modal backdrops and common modal containers
      const modalElements = document.querySelectorAll(
        '.fixed.inset-0.bg-black.bg-opacity-50, .modal-backdrop, [role="dialog"]'
      );
      
      setIsAnyModalOpen(modalElements.length > 0 || isSecurityPage);
    };

    // Check immediately
    checkForModals();
    
    // Set up an observer to detect DOM changes that might indicate modals
    const observer = new MutationObserver(checkForModals);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden'],
    });
    
    // Also check periodically for modals that might be added by React
    const intervalId = setInterval(checkForModals, 500);
    
    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [isSecurityPage]);

  // Show recovery button only after 5 seconds and only if:
  // 1. User is not authenticated
  // 2. We're not on the security page
  // 3. No modals are open
  useEffect(() => {
    // After 5 seconds for normal recovery button (standard production timeout)
    const timer = setTimeout(() => {
      setShowRecoveryButton(!isAuthenticated() && !isSecurityPage && !isAnyModalOpen);
    }, 5000);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array to only run once on mount

  // Re-check conditions when location changes or modal state changes
  // But don't show the button until the initial timer has fired
  useEffect(() => {
    // Only update if the button is already showing (after initial delay)
    if (showRecoveryButton) {
      setShowRecoveryButton(!isAuthenticated() && !isSecurityPage && !isAnyModalOpen);
    }
  }, [location, isAnyModalOpen, isSecurityPage, showRecoveryButton]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center font-sans py-0 md:py-1">
      {/* Version checker - periodically checks for updates */}
      <VersionChecker checkInterval={30 * 60 * 1000} /> {/* Check every 30 minutes */}
      
      {/* Emergency recovery button removed for production */}
      
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/wallet" Component={Wallet}>
          <Route path="new" Component={New} />
          <Route path="pay/:invoice" Component={Pay} />
          <Route path="paid" Component={Paid} />
          <Route path="tip/:invoice" Component={TipPage} />
          <Route path="tiponly" Component={TipOnly} />
          <Route path="share" Component={Share} />
          <Route path=":legacyWallet/new" Component={LegacyWalletRedirect} />
        </Route>
        <Route path="/settings" Component={Settings} />
        <Route path="/security/*" Component={Security} />
        <Route path="/disclaimers" Component={Disclaimers} />
        <Route path="/about" Component={About} />
        <Route path="/*" Component={NotFound} />
      </Routes>
      
      {/* Recovery button (conditionally shown) */}
      {showRecoveryButton && (
        <div className="fixed top-2 right-2 z-40 opacity-50 hover:opacity-100 transition-opacity">
          <RecoveryButton 
            className="scale-75 origin-top-right"
            buttonText="⚡ Refresh App"
            explanation=""
          />
        </div>
      )}
    </div>
  );
}

export default App;

// TODO: remove after 2025-01-01
function LegacyWalletRedirect() {
  const { legacyWallet } = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!legacyWallet) {
      return;
    }

    window.localStorage.setItem(localStorageKeys.nwcUrl, legacyWallet);
    navigate("/wallet/new");
  }, [navigate, legacyWallet]);

  return null;
}