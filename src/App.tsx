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
import React, { useEffect } from "react";
import { localStorageKeys, getMerchantConfig } from "./config";

function App() {
  // Apply the theme from merchant config
  const config = getMerchantConfig();
  
  // Set the theme when the app loads
  useEffect(() => {
    // Valid themes are "standard" and "industrial"
    const validTheme = config.theme === "standard" || config.theme === "industrial" 
      ? config.theme 
      : "standard";
      
    // Apply the theme to the root element for DaisyUI
    document.documentElement.setAttribute("data-theme", validTheme);
  }, [config.theme]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center font-sans py-0 md:py-1">
      <Router>
        <Routes>
          <Route path="/" Component={Home} />
          <Route path="/wallet" Component={Wallet}>
            <Route path="new" Component={New} />
            <Route path="pay/:invoice" Component={Pay} />
            <Route path="paid" Component={Paid} />
            <Route path="tip/:invoice" Component={TipPage} />
            <Route path="share" Component={Share} />
            <Route path=":legacyWallet/new" Component={LegacyWalletRedirect} />
          </Route>
          <Route path="/settings" Component={Settings} />
          <Route path="/about" Component={About} />
          <Route path="/*" Component={NotFound} />
        </Routes>
      </Router>
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