import {
  Button,
  closeModal,
  disconnect,
  init,
  WebLNProviders,
} from "@getalby/bitcoin-connect-react";
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MerchantLogo } from "../components/MerchantLogo";
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

  React.useEffect(() => {
    // Apply merchant configuration from URL parameters
    applyMerchantConfigFromUrl(params);

    const label = params.get("label") || params.get("name");
    if (label) {
      localStorage.setItem(localStorageKeys.label, label); // Save the label to local storage
    }

    const currency = params.get("currency");
    if (currency) {
      localStorage.setItem(localStorageKeys.currency, currency); // Save the currency to local storage
    } else {
      // Set USD as default if not specified
      localStorage.setItem(localStorageKeys.currency, "USD");
    }

    // Load label from query parameter and save it to local storage
    const nwcEncoded = params.get("nwc");
    if (nwcEncoded) {
      try {
        const nwcUrl = atob(nwcEncoded);
        // store the wallet URL so PWA can restore it (PWA always loads on the homepage)
        window.localStorage.setItem(localStorageKeys.nwcUrl, nwcUrl);
        navigate(`/wallet/new`);
      } catch (error) {
        console.error(error);
        alert("Failed to load wallet: " + error);
      }
    }
    const nwcUrl = window.localStorage.getItem(localStorageKeys.nwcUrl);
    if (nwcUrl) {
      navigate(`/wallet/new`);
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

  return (
    <>
      <div
        className="flex flex-col justify-center items-center w-full h-full bg-black"
        data-theme={config.theme}
      >
        <div className="flex flex-1 flex-col justify-center items-center max-w-lg w-full px-4">
          {/* Responsive logo size */}
          <div className="flex justify-center w-full mb-8 md:mb-10 lg:mb-12">
            <MerchantLogo className="w-[300px] md:w-[400px] lg:w-[600px] h-auto max-w-[90vw]" />
          </div>

          <p className="text-center mb-24 md:mb-28 lg:mb-32 text-white text-sm md:text-base lg:text-lg">
            {config.description}
          </p>
          <Button
            onConnected={async (provider) => {
              try {
                const info = await provider.getInfo();
                if (info.methods.includes("sendPayment")) {
                  if (
                    !confirm(
                      "The provided connection secret seems to be able to make payments. This could lead to lost funds if you share the PoS URL with others. Are you sure you wish to continue?"
                    )
                  ) {
                    disconnect();
                    return;
                  }
                }
                if (
                  !info.methods.includes("makeInvoice") ||
                  !info.methods.includes("lookupInvoice")
                ) {
                  throw new Error(
                    "Missing permissions. Make sure your select make_invoice and lookup_invoice."
                  );
                }
                if (!(provider instanceof WebLNProviders.NostrWebLNProvider)) {
                  throw new Error("WebLN provider is not an instance of NostrWebLNProvider");
                }
                // TODO: below line should not be needed when modal is updated to close automatically after connecting
                closeModal();
                window.localStorage.setItem(
                  localStorageKeys.nwcUrl,
                  provider.client.nostrWalletConnectUrl
                );
                navigate(`/wallet/new`);
              } catch (error) {
                console.error(error);
                alert(error);
                disconnect();
              }
            }}
            className="md:transform md:scale-110 lg:scale-125"
          />
          <button className="btn mt-8 md:mt-10 lg:mt-12 btn-sm md:btn-md lg:btn text-black bg-white hover:bg-gray-200" onClick={importWallet}>
            Import wallet URL
          </button>
        </div>
        <Footer />
      </div>
    </>
  );
}

// Needed on iOS because PWA localStorage is not shared with Safari.
// PWA can only be installed with a static URL (e.g. "/pos/").
function importWallet() {
  const config = getMerchantConfig();
  const url = prompt(
    `On ${config.displayName} in another browser, go to the sidebar menu -> Share, copy the share URL and paste it here.`
  );
  if (url) {
    window.location.href = url;
  }
}