import { HashRouter as Router, Route, Routes, useParams, useNavigate } from "react-router-dom";
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
import { localStorageKeys, getMerchantConfig } from "./config";
import { ErrorBoundary, VersionChecker, RecoveryButton } from "./components/utility";

function App() {
  // State for the recovery button
  const [showRecoveryButton, setShowRecoveryButton] = useState(false);
  
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

  // Check for any errors during initial load
  useEffect(() => {
    // After 5 seconds, enable the recovery button
    // This helps in case of subtle rendering issues that don't trigger error boundaries
    const timer = setTimeout(() => {
      setShowRecoveryButton(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-full flex-col items-center justify-center font-sans py-0 md:py-1">
        {/* Version checker - periodically checks for updates */}
        <VersionChecker checkInterval={30 * 60 * 1000} /> {/* Check every 30 minutes */}
        
        <Router>
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
        </Router>
        
        {/* Recovery button (conditionally shown) */}
        {showRecoveryButton && (
          <div className="fixed top-2 right-2 z-50 opacity-50 hover:opacity-100 transition-opacity">
            <RecoveryButton 
              className="scale-75 origin-top-right"
              buttonText="⚡ Refresh App"
              explanation=""
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
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