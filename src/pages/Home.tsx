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
import QRScanner from "../components/QRScanner";
import {
  localStorageKeys,
  getMerchantConfig,
  applyMerchantConfigFromUrl
} from "../config";
import { Footer } from "../components/Footer";

// Use the WebLN provider from library
import type { WebLNProvider } from "@webbtc/webln-types";

export function Home() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const config = getMerchantConfig();
  const [confirmData, setConfirmData] = useState<{
    isOpen: boolean;
    provider: WebLNProvider | null;
  }>({
    isOpen: false,
    provider: null
  });

  const [importPromptOpen, setImportPromptOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [showScanner, setShowScanner] = useState(false);

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

  // Use a synchronous version to match the Button's expected callback type
  const handleProviderConnection = (provider: WebLNProvider) => {
    // Immediately start the async work but return void to satisfy the type
    (async () => {
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
    })();
  };

  const completeConnection = async (provider: WebLNProvider) => {
    try {
      if (!(provider instanceof WebLNProviders.NostrWebLNProvider)) {
        throw new Error("WebLN provider is not an instance of NostrWebLNProvider");
      }

      const info = await provider.getInfo();
      if (!info.methods.includes("makeInvoice") || !info.methods.includes("lookupInvoice")) {
        throw new Error("Missing permissions. Make sure you select make_invoice and lookup_invoice.");
      }

      closeModal();
      // Type assertion to access the nostrWalletConnectUrl property
      const nostrProvider = provider as unknown as { client: { nostrWalletConnectUrl: string } };
      window.localStorage.setItem(
        localStorageKeys.nwcUrl,
        nostrProvider.client.nostrWalletConnectUrl
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
        <div className="flex flex-1 flex-col justify-center items-center max-w-xl lg:max-w-2xl w-full px-4">
          <div className="flex justify-center w-full mb-8 md:mb-10 lg:mb-12">
            <MerchantLogo
              className="h-auto w-auto max-w-[675px] md:max-w-[900px] lg:max-w-[1350px] max-h-[30vh] md:max-h-[35vh] lg:max-h-[40vh]"
              isHomePage={true}
            />
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
            className="btn mt-8 md:mt-10 lg:mt-12 btn-sm md:btn-md lg:btn !bg-gray-800 hover:!bg-gray-300 !text-white hover:!text-black transition-colors duration-300"
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
          setShowScanner(false);
        }}
        title="Import Wallet URL"
        size={showScanner ? 'large' : 'default'}
        message={(
          <div>
            {showScanner ? (
              <QRScanner
                onResult={(result) => {
                  setImportUrl(result);
                  setShowScanner(false);
                }}
                onClose={() => setShowScanner(false)}
              />
            ) : (
              <>
                <p className="mb-4">{`On ${config.displayName} in another browser, go to the sidebar menu → Share, copy the share URL and paste it here.`}</p>
                <div className="flex w-full mb-4">
                  <input
                    type="text"
                    value={importUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImportUrl(e.target.value)}
                    className="flex-grow p-2 border rounded-l bg-gray-700 border-gray-600 text-white"
                    placeholder="Paste URL here"
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-3 rounded-r border border-gray-600"
                    aria-label="Scan QR code"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-400">Or click the camera icon to scan a QR code with your device camera.</p>
              </>
            )}
          </div>
        ) as unknown as string}
        buttonText={showScanner ? "Cancel" : "Import"}
        onConfirm={() => {
          if (showScanner) {
            setShowScanner(false);
          } else if (importUrl.trim()) {
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