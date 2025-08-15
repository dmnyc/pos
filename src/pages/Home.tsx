import {
  Button,
  closeModal,
  disconnect,
  init,
  WebLNProviders,
} from "@getalby/bitcoin-connect-react";
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MerchantLogo } from "../components/MerchantLogo";
import { ConfirmModal, AlertModal } from "../components/Modals";
import { 
  localStorageKeys, 
  getMerchantConfig,
  applyMerchantConfigFromUrl 
} from "../config";
import { Footer } from "../components/Footer";

export function Home() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const config = getMerchantConfig();
  const [confirmData, setConfirmData] = useState<{
    isOpen: boolean;
    provider: any | null;
  }>({
    isOpen: false,
    provider: null
  });

  const [importPromptOpen, setImportPromptOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const showAlert = (title: string, message: string) => {
    setAlertState({ isOpen: true, title, message });
  };

  React.useEffect(() => {
    // Apply merchant configuration from URL parameters
    applyMerchantConfigFromUrl(params);

    const label = params.get("label") || params.get("name");
    if (label) {
      localStorage.setItem(localStorageKeys.label, label);
    }

    const currency = params.get("currency");
    if (currency) {
      localStorage.setItem(localStorageKeys.currency, currency);
    } else {
      localStorage.setItem(localStorageKeys.currency, "USD");
    }

    const nwcEncoded = params.get("nwc");
    if (nwcEncoded) {
      try {
        const nwcUrl = atob(nwcEncoded);
        window.localStorage.setItem(localStorageKeys.nwcUrl, nwcUrl);
        // Check for PIN before navigating
        const hasPin = window.localStorage.getItem('pos_pin');
        navigate(hasPin ? '/wallet/new' : '/security');
      } catch (error) {
        showAlert('Connection Error', 'Failed to load wallet. Please try again.');
      }
    }
    const nwcUrl = window.localStorage.getItem(localStorageKeys.nwcUrl);
    if (nwcUrl) {
      const hasPin = window.localStorage.getItem('pos_pin');
      navigate(hasPin ? '/wallet/new' : '/security');
    }
  }, [navigate, params]);

  React.useEffect(() => {
    init({
      appName: config.displayName,
      appIcon: config.logoUrl,
      filters: ["nwc"],
      showBalance: false,
      providerConfig: {
        nwc: {
          authorizationUrlOptions: {
            requestMethods: ["get_info", "make_invoice", "lookup_invoice"],
            isolated: true,
            metadata: {
              app_store_app_id: "lightningpos",
            },
          },
        },
      },
    });
    disconnect();
  }, [config]);

  const handleProviderConnection = async (provider: any) => {
    try {
      const info = await provider.getInfo();
      if (info.methods.includes("sendPayment")) {
        setConfirmData({
          isOpen: true,
          provider
        });
        return;
      }
      await completeConnection(provider);
    } catch (error) {
      showAlert('Connection Error', 'Failed to connect to wallet. Please try again.');
      disconnect();
    }
  };

  const completeConnection = async (provider: any) => {
    try {
      if (!(provider instanceof WebLNProviders.NostrWebLNProvider)) {
        throw new Error("WebLN provider is not an instance of NostrWebLNProvider");
      }
      
      const info = await provider.getInfo();
      if (!info.methods.includes("makeInvoice") || !info.methods.includes("lookupInvoice")) {
        throw new Error("Missing permissions. Make sure you select make_invoice and lookup_invoice.");
      }

      closeModal();
      window.localStorage.setItem(
        localStorageKeys.nwcUrl,
        provider.client.nostrWalletConnectUrl
      );
      
      const hasPin = window.localStorage.getItem('pos_pin');
      navigate(hasPin ? '/wallet/new' : '/security');
    } catch (error) {
      showAlert('Connection Error', error instanceof Error ? error.message : 'Failed to complete connection.');
      disconnect();
    }
  };

  const handleConfirm = () => {
    if (confirmData.provider) {
      completeConnection(confirmData.provider);
    }
  };

  const handleImport = () => {
    setImportPromptOpen(true);
  };

  const handleImportUrl = (url: string) => {
    try {
      // Parse the imported URL to extract parameters
      const urlObj = new URL(url);
      let searchParams: URLSearchParams;
      
      // Check if it's a hash-based URL (our new format)
      if (urlObj.hash && urlObj.hash.includes('?')) {
        // Extract query params from hash (e.g., #/?nwc=...&config=...)
        const hashQuery = urlObj.hash.split('?')[1];
        searchParams = new URLSearchParams(hashQuery);
      } else {
        // Fall back to regular query params for backward compatibility
        searchParams = urlObj.searchParams;
      }
      
      // Apply the configuration from imported URL
      applyMerchantConfigFromUrl(searchParams);
      
      // Handle NWC URL
      const nwcEncoded = searchParams.get("nwc");
      if (nwcEncoded) {
        const nwcUrl = atob(nwcEncoded);
        window.localStorage.setItem(localStorageKeys.nwcUrl, nwcUrl);
        
        // Handle other parameters
        const label = searchParams.get("label") || searchParams.get("name");
        if (label) {
          localStorage.setItem(localStorageKeys.label, label);
        }

        const currency = searchParams.get("currency");
        if (currency) {
          localStorage.setItem(localStorageKeys.currency, currency);
        }
        
        setImportPromptOpen(false);
        setImportUrl('');
        
        // Check for PIN before navigating
        const hasPin = window.localStorage.getItem('pos_pin');
        navigate(hasPin ? '/wallet/new' : '/security');
      } else {
        showAlert('Import Error', 'No wallet connection found in the provided URL.');
      }
    } catch (error) {
      showAlert('Import Error', 'Invalid URL format. Please check the URL and try again.');
    }
  };

  return (
    <>
      <div
        className="flex flex-col justify-center items-center w-full h-full bg-black"
        data-theme={config.theme}
      >
        <div className="flex flex-1 flex-col justify-center items-center max-w-lg w-full px-4">
          <div className="flex justify-center w-full mb-8 md:mb-10 lg:mb-12">
            <MerchantLogo className="w-[300px] md:w-[400px] lg:w-[600px] h-auto max-w-[90vw]" />
          </div>

          <p className="text-center mb-24 md:mb-28 lg:mb-32 text-white text-sm md:text-base lg:text-lg">
            {config.description}
          </p>
          <div className="md:transform md:scale-110 lg:scale-125">
            <Button
              onConnected={handleProviderConnection}
            />
          </div>
          <button 
            className="btn mt-8 md:mt-10 lg:mt-12 btn-sm md:btn-md lg:btn text-black bg-white hover:bg-gray-200" 
            onClick={handleImport}
          >
            Import wallet URL
          </button>
        </div>
        <Footer />
      </div>

      <ConfirmModal
        isOpen={confirmData.isOpen}
        onClose={() => {
          setConfirmData({ isOpen: false, provider: null });
          disconnect();
        }}
        onConfirm={handleConfirm}
        title="Warning: Payment Permissions"
        message="The provided connection secret seems to be able to make payments. This could lead to lost funds if you share the POS URL with others. It is strongly encouraged to use a read-only connection. Do you wish to continue?"
        confirmText="Continue"
        isDanger
      />

      <AlertModal
        isOpen={importPromptOpen}
        onClose={() => {
          setImportPromptOpen(false);
          setImportUrl('');
        }}
        title="Import Wallet URL"
        message={(
          <div>
            <p className="mb-4">{`On ${config.displayName} in another browser, go to the sidebar menu -> Share, copy the share URL and paste it here.`}</p>
            <input
              type="text"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              className="w-full p-2 border rounded bg-gray-700 border-gray-600 text-white"
              placeholder="Paste URL here"
            />
          </div>
        ) as unknown as string}
        buttonText="Import"
        onConfirm={() => {
          if (importUrl.trim()) {
            handleImportUrl(importUrl.trim());
          }
        }}
      />

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
      />
    </>
  );
}