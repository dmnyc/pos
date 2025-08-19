import { webln } from "@getalby/sdk";
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { localStorageKeys } from "../constants";
import useStore from "../state/store";
import { getTipSettings } from "../config";
import { AlertModal } from "../components/Modals";

export function Wallet() {
  const navigate = useNavigate();
  
  // State for the alert modal
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  React.useEffect(() => {
    (async () => {
      try {
        const nwcUrl = window.localStorage.getItem(localStorageKeys.nwcUrl);
        const tipWalletNwcUrl = window.localStorage.getItem(localStorageKeys.tipWalletNwcUrl);
        const tipSettings = getTipSettings();
        
        if (!nwcUrl) {
          navigate("/");
          return;
        }
        
        // Initialize main wallet provider
        const _provider = new webln.NostrWebLNProvider({
          nostrWalletConnectUrl: nwcUrl,
        });
        
        await _provider.enable();
        useStore.getState().setProvider(_provider);
        
        // Initialize tip wallet provider if available and enabled
        if (tipSettings.useSecondaryWallet && tipWalletNwcUrl) {
          try {
            const _tipProvider = new webln.NostrWebLNProvider({
              nostrWalletConnectUrl: tipWalletNwcUrl,
            });
            await _tipProvider.enable();
            useStore.getState().setTipProvider(_tipProvider);
          } catch (tipError) {
            console.error("Failed to initialize tip wallet:", tipError);
            // Don't fail on tip wallet init error, just log it
            // Clear the tip provider to ensure it doesn't cause issues
            useStore.getState().setTipProvider(undefined);
            // Also clear the stored URL if we couldn't connect to it
            window.localStorage.removeItem(localStorageKeys.tipWalletNwcUrl);
          }
        } else {
          // Make sure tip provider is cleared if not being used
          useStore.getState().setTipProvider(undefined);
          
          // If tip wallet is disabled but URL is still stored, remove it
          if (!tipSettings.useSecondaryWallet && tipWalletNwcUrl) {
            window.localStorage.removeItem(localStorageKeys.tipWalletNwcUrl);
          }
        }
      } catch (error) {
        console.error("Main wallet initialization error:", error);
        setAlertState({
          isOpen: true,
          title: 'Wallet Connection Error',
          message: `Failed to load wallet: ${error}`
        });
        navigate("/");
      }
    })();
  }, [navigate]);

  return (
    <div className="flex flex-col w-full h-full p-2">
      <Outlet />
      
      {/* Alert Modal for errors */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
      />
    </div>
  );
}
