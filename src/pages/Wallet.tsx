import { webln } from "@getalby/sdk";
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { localStorageKeys } from "../constants";
import useStore from "../state/store";
import { getTipSettings } from "../config";

export function Wallet() {
  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => {
      const nwcUrl = window.localStorage.getItem(localStorageKeys.nwcUrl);
      const tipWalletNwcUrl = window.localStorage.getItem(localStorageKeys.tipWalletNwcUrl);
      const tipSettings = getTipSettings();
      
      if (nwcUrl) {
        // Initialize main wallet provider
        try {
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
            } catch (error) {
              console.error("Failed to initialize tip wallet:", error);
              // Don't fail on tip wallet init error, just log it
            }
          }
        } catch (error) {
          console.error(error);
          alert("Failed to load wallet: " + error);
          navigate("/");
        }
      } else {
        navigate("/");
      }
    })();
  }, [navigate]);

  return (
    <div className="flex flex-col w-full h-full p-2">
      <Outlet />
    </div>
  );
}
