import { HashRouter as Router, Route, Routes, useParams, useNavigate, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import { Wallet } from "./pages/Wallet";
import { NotFound } from "./pages/NotFound";
import { New } from "./pages/wallet/New";
import { Pay } from "./pages/wallet/Pay";
import { Paid } from "./pages/wallet/Paid";
import { Share } from "./pages/wallet/Share";
import { Settings } from "./pages/Settings";
import { TipPage } from "./pages/wallet/Tip";
import { TipOnly } from "./pages/wallet/TipOnly";
import Security from "./pages/Security";
import { Template } from "./pages/Template";
import { TemplateTest } from "./pages/TemplateTest";
import React, { useEffect, useState } from "react";
import { getMerchantConfig } from "./config";
import { localStorageKeys } from "./constants";
import { ErrorBoundary, VersionChecker, RecoveryButton } from "./components/utility";
import { useSessionManager } from "./hooks/useSessionManager";
import { Toaster } from 'react-hot-toast';

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
  // Initialize session manager for PIN timeout
  useSessionManager();
  
  // State for the recovery button
  const [showRecoveryButton, setShowRecoveryButton] = useState(false);
  const location = useLocation();
  
  // Apply the theme from merchant config
  const config = getMerchantConfig();

  // Set the theme when the app loads
  useEffect(() => {
    // Valid themes are "standard" and "industrial" and all other supported themes
    const validTheme = ["standard", "industrial", "orangepill", "nostrich", 
                        "beehive", "liquidity", "safari", "blocktron", "surfboard"].includes(config.theme)
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
      {/* Toast notifications */}
      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
          style: {
            background: '#333',
            color: '#fff',
            paddingLeft: '16px',
            paddingRight: '16px',
          },
        },
      }} />
      
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
        <Route path="/disclaimers" Component={() => (
          <Template title="Disclaimers & Privacy Information">
            <p className="text-gray-400 mb-8">Last Updated: August 15, 2025</p>

            <div className="mb-12">
              <p>Please read these disclaimers and privacy information carefully before using the Sats Factory POS application.</p>
            </div>

            <h2 className="text-xl md:text-2xl font-bold mb-6">I. Disclaimers</h2>

            <p>By using the Sats Factory POS application ("the software"), you acknowledge that you have read, understood, and agree to be bound by the terms outlined below. If you do not agree with these terms, do not use the software.</p>

            <h3 className="text-lg font-bold mt-8 mb-4">1. Use At Your Own Risk</h3>
            <p>Your use of the Sats Factory POS software is entirely <strong>AT YOUR OWN RISK</strong>. This software is an open-source project that uses Nostr Wallet Connect (NWC) technology. You are solely responsible for your actions and for any loss or damage that may arise from using this application.</p>

            <h3 className="text-lg font-bold mt-8 mb-4">2. Non-Custodial Software</h3>
            <p className="mb-4">
              Sats Factory POS is a <strong>100% non-custodial</strong> application. This means:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>We <strong>NEVER</strong> hold, custody, or control your funds</li>
              <li>The software is an interface that connects to your wallet via NWC</li>
              <li>You control whether to use read-only or payment-enabled wallet connections</li>
              <li>You are solely responsible for the security of your connected wallet and NWC connection string</li>
              <li>Your PIN code is stored only in your local device and cannot be recovered if lost</li>
            </ul>

            <h3 className="text-lg font-bold mt-8 mb-4">3. No Warranties or Guarantees</h3>
            <p>THE SOFTWARE IS PROVIDED <strong>"AS IS"</strong>, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT.</p>
            <p>We do not guarantee that the software will be secure, uninterrupted, or bug-free. The entire risk as to the quality and performance of the software is with you.</p>

            <h3 className="text-lg font-bold mt-8 mb-4">4. Limitation of Liability</h3>
            <p>IN NO EVENT SHALL THE DEVELOPERS, CONTRIBUTORS, OR COPYRIGHT HOLDERS OF SATS FACTORY POS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
            <p>This includes any loss of funds, loss of profits, business interruption, or any other direct or indirect damages.</p>

            <h3 className="text-lg font-bold mt-8 mb-4">5. Education vs Financial Advice</h3>
            <p className="mb-4">
              Sats Factory POS is a software tool. While Sats Factory does provide professional bitcoin education and consultation services, including guidance on:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Lightning node setup and management</li>
              <li>Wallet selection and configuration</li>
              <li>Bitcoin technical education</li>
              <li>Best practices for merchants</li>
            </ul>
            <p className="mb-4">
              The software itself and its documentation do not constitute:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Financial advice</li>
              <li>Investment advice</li>
              <li>Tax advice</li>
              <li>Legal advice</li>
            </ul>
            <p>
              For matters related to your business's financial, tax, or legal situation, please consult with qualified professionals in these areas before making any decisions.
              For bitcoin education and technical consultation, you can reach out to us through{' '}
              <a href="https://satsfactory.com/hi" className="text-[#ffcc99] hover:text-[#ffbb77]">our contact form</a>.
            </p>

            <h3 className="text-lg font-bold mt-8 mb-4">6. Progressive Web App</h3>
            <p className="mb-4">Sats Factory POS is a Progressive Web App (PWA) that can be installed on your device. When installed:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Your settings are stored locally on your device</li>
              <li>Your PIN is specific to that installation</li>
              <li>Reinstalling the PWA will reset all settings including your PIN</li>
            </ul>

            <h2 className="text-xl md:text-2xl font-bold mt-12 mb-6">II. Privacy Information</h2>

            <p className="mb-6">Effective Date: August 15, 2025</p>

            <h3 className="text-lg font-bold mt-8 mb-4">1. Introduction</h3>
            <p>This privacy information describes how Sats Factory POS handles information. We are committed to collecting only the minimum information necessary to provide the service.</p>

            <h3 className="text-lg font-bold mt-8 mb-4">2. Information We Do Not Collect</h3>
            <p className="mb-4">We do not collect or store:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Personal Information</li>
              <li>Wallet private keys or seed phrases</li>
              <li>NWC connection strings</li>
              <li>Transaction history</li>
              <li>PIN codes</li>
              <li>Merchant settings</li>
            </ul>

            <h3 className="text-lg font-bold mt-8 mb-4">3. Local Storage</h3>
            <p className="mb-4">The following information is stored only on your local device:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Your PIN code</li>
              <li>Merchant name and logo settings</li>
              <li>Theme preferences</li>
              <li>NWC connection string</li>
              <li>Currency preferences</li>
            </ul>

            <h3 className="text-lg font-bold mt-8 mb-4">4. Contact</h3>
            <p>
              For questions about these disclaimers or to report security concerns, please visit{' '}
              <a href="https://satsfactory.com/hi" className="text-[#ffcc99] hover:text-[#ffbb77]">
                https://satsfactory.com/hi
              </a>
            </p>
          </Template>
        )} />
        <Route path="/about" Component={() => (
          <Template title="Sats Factory POS">
            <img
              src="/images/satsfactory_logo.svg"
              alt="Sats Factory Logo"
              className="w-36 md:w-48 lg:w-60 mx-auto mb-4 md:mb-6 lg:mb-8"
            />
            <p className="text-center text-sm md:text-base lg:text-lg mb-3 md:mb-4 lg:mb-5">
              Sats Factory POS ⚡️🏭 is powered by Nostr Wallet Connect (NWC). 
            </p>
            <p className="text-center text-sm md:text-base lg:text-lg mb-3 md:mb-4 lg:mb-5">
              Based on BuzzPay, the open-source Lightning POS by Alby. 🐝💜
            </p>
            <p className="text-center mb-8 text-xs md:text-sm lg:text-base">
              <a href="https://satsfactory.com" className="text-gray-600 hover:text-gray-500">satsfactory.com</a>
            </p>

            <hr className="border-gray-800 w-full max-w-md mx-auto mb-8" />

            <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-6">Our Story</h2>
            
            <p>
              Sats Factory POS was born from a clear need in the bitcoin payments space: the lack of accessible, 
              non-custodial Lightning Network point-of-sale options for small businesses.
            </p>

            <h3 className="text-lg font-semibold text-white mt-6">Breaking Down Barriers</h3>
            <p>
              Traditional Lightning POS systems often require small businesses to commit to recurring monthly fees before 
              they can even gauge their bitcoin-paying customer base. We're changing that by eliminating subscription 
              fees and providing flexible backend options that work for businesses of any size.
            </p>

            <h3 className="text-lg font-semibold text-white mt-6">True Flexibility</h3>
            <p>
              Businesses can choose their preferred wallet setup:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Run their own Lightning node</li>
              <li>Use a standalone Alby Hub</li>
              <li>Connect any NWC-compatible wallet</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-6">Rethinking Tipping</h3>
            <p>
              We've taken a more respectful approach to digital tipping, addressing common frustrations with modern POS systems that rely on tip shaming and pressure tactics:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Tips are truly optional, not demanded</li>
              <li>No manipulative inconsistent tip ordering</li>
              <li>Clear separation between payment and gratuity</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-6">Bitcoin-Native Design</h3>
            <p>
              Our tipping system is designed around bitcoin's push-payment nature. Tips are handled as separate, 
              optional transactions after the main payment. This approach:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Respects customer choice</li>
              <li>Makes accounting easier with clearly labeled tip transactions</li>
              <li>Aligns with bitcoin's trustless principles</li>
            </ul>

            <p className="mt-6 italic">
              This is our vision for commerce on a bitcoin standard.
            </p>
          </Template>
        )} />
        <Route path="/template" Component={TemplateTest} />
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