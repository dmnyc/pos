import React, { useState, useEffect } from 'react';
import { useRequirePin } from '../hooks/useRequirePin';
import { AlertModal, ConfirmModal } from '../components/Modals';
import { Template } from './Template';
import { CheckForUpdates } from '../components/settings';
import {
  getMerchantConfig,
  saveMerchantConfig,
  getTipSettings,
  saveTipSettings,
  defaultMerchantConfig,
  defaultTipSettings
} from '../config';
import { playPaymentChime } from '../utils/audioUtils';
import CodepenLightning from '../components/animations/CodepenLightning';
import { localStorageKeys } from '../constants';
import { Button, init, disconnect, closeModal, WebLNProviders } from "@getalby/bitcoin-connect-react";
import type { WebLNProvider } from "@webbtc/webln-types";

export function Settings() {
  useRequirePin();
  const [merchantConfig, setMerchantConfig] = useState(getMerchantConfig());
  const [tipSettings, setTipSettings] = useState(getTipSettings());
  const [tipWalletNwcUrl, setTipWalletNwcUrl] = useState(() => {
    return window.localStorage.getItem(localStorageKeys.tipWalletNwcUrl) || '';
  });
  // If we have a saved wallet URL from localStorage, assume it's valid
  const [tipWalletNwcUrlValid, setTipWalletNwcUrlValid] = useState<boolean | null>(() => {
    const savedUrl = window.localStorage.getItem(localStorageKeys.tipWalletNwcUrl);
    return savedUrl ? true : null;
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [showLightningPreview, setShowLightningPreview] = useState(false);
  
  // State for bitcoin-connect wallet selection modal
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [tipWalletConnecting, setTipWalletConnecting] = useState(false);

  // Modal states
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });


  useEffect(() => {
    // Reset the saved message after 3 seconds
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  useEffect(() => {
    // Update the theme when changed in settings
    document.documentElement.setAttribute('data-theme', merchantConfig.theme);
  }, [merchantConfig.theme]);
  
  // Initialize bitcoin-connect when showing wallet selector
  useEffect(() => {
    if (showWalletSelector) {
      init({
        appName: `${merchantConfig.displayName || "Sats Factory POS"} - Tip Wallet`,
        appIcon: merchantConfig.logoUrl,
        filters: ["nwc"],
        showBalance: false,
        providerConfig: {
          nwc: {
            authorizationUrlOptions: {
              requestMethods: ["get_info", "make_invoice", "lookup_invoice"],
              isolated: true,
              metadata: {
                app_store_app_id: "lightningpos-tips",
              },
            },
          },
        },
      });
      
      // Cleanup on unmount
      return () => {
        disconnect();
      };
    }
  }, [showWalletSelector, merchantConfig]);

  const handleMerchantConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const newValue = type === 'checkbox' ? checked : value;
    setMerchantConfig(prev => ({ ...prev, [name]: newValue }));
  };

  const handleChimePreview = () => {
    playPaymentChime();
  };

  const handleLightningPreview = () => {
    setShowLightningPreview(true);
    setTimeout(() => {
      setShowLightningPreview(false);
    }, 1000);
  };
  
  const handleClearTipWallet = () => {
    setTipWalletNwcUrl('');
    setTipWalletNwcUrlValid(null);
    window.localStorage.removeItem(localStorageKeys.tipWalletNwcUrl);
  };
  
  // Function to handle connection to the tip wallet
  const handleConnectTipWallet = () => {
    // First, ensure any existing connection is disconnected
    disconnect();
    
    // Clear any existing bitcoin-connect state
    window.localStorage.removeItem("bc-authorize");
    window.localStorage.removeItem("bc-provider");
    
    // Now show the wallet selector
    setShowWalletSelector(true);
  };
  
  // Function to handle tip wallet provider connection
  const handleTipProviderConnection = (provider: WebLNProvider) => {
    setTipWalletConnecting(true);
    
    // Immediately start the async work but return void to satisfy the type
    (async () => {
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
        const nwcUrl = nostrProvider.client.nostrWalletConnectUrl;
        
        // Check if this is the same as the main wallet URL
        const mainWalletUrl = window.localStorage.getItem(localStorageKeys.nwcUrl);
        if (mainWalletUrl === nwcUrl) {
          throw new Error("The tip wallet must be different from your main wallet. Please connect a different wallet.");
        }
        
        // Save the NWC URL to state
        setTipWalletNwcUrl(nwcUrl);
        setTipWalletNwcUrlValid(true);
        
        // Close the wallet selector
        setShowWalletSelector(false);
        setTipWalletConnecting(false);
      } catch (error) {
        setAlertState({
          isOpen: true,
          title: 'Connection Error',
          message: error instanceof Error ? error.message : 'Failed to connect to wallet. Please try again.'
        });
        disconnect();
        setShowWalletSelector(false);
        setTipWalletConnecting(false);
      }
    })();
  };

  // Add state for the raw percentage input as a controlled input
  const [tipPercentagesInput, setTipPercentagesInput] = useState(() => {
    return tipSettings.defaultPercentages.join(', ');
  });

  useEffect(() => {
    // Initialize the input state when tipSettings are first loaded
    setTipPercentagesInput(tipSettings.defaultPercentages.join(', '));
  }, [tipSettings.defaultPercentages]); // Added the missing dependency

  const handleTipToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setTipSettings(prev => ({ ...prev, enabled }));
    
    // If tips are disabled, also clear the tip wallet URL
    if (!enabled) {
      setTipWalletNwcUrl('');
      setTipWalletNwcUrlValid(null);
      window.localStorage.removeItem(localStorageKeys.tipWalletNwcUrl);
    }
  };

  const handleCustomTipToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTipSettings(prev => ({ ...prev, allowCustom: e.target.checked }));
  };

  const handlePercentagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Only allow numbers and commas
    const filteredInput = input.replace(/[^0-9,\s]/g, '');
    
    // Limit to max 24 characters
    const truncatedInput = filteredInput.slice(0, 24);
    
    setTipPercentagesInput(truncatedInput);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate tip wallet URL if secondary wallet is enabled
    if (tipSettings.enabled && tipSettings.useSecondaryWallet) {
      if (!tipWalletNwcUrl.trim()) {
        setAlertState({
          isOpen: true,
          title: 'Missing Tip Wallet',
          message: 'Please connect a NWC-enabled Lightning wallet for tips by clicking the "Connect Separate Wallet for Tips" button'
        });
        return;
      }
      
      if (tipWalletNwcUrlValid !== true) {
        setAlertState({
          isOpen: true,
          title: 'Tip Wallet Not Validated',
          message: 'Your tip wallet may not be properly connected. Please try connecting it again.'
        });
        return;
      }
    }

    // Parse the tip percentages from the raw input
    try {
      // Parse and validate the input
      const percentages = tipPercentagesInput
        .split(',')
        .map((p: string) => parseInt(p.trim()))
        .filter((p: number) => !isNaN(p) && p > 0);
      
      // Limit to maximum 6 tip presets
      const limitedPercentages = percentages.slice(0, 6);

      // Update the tip settings with the parsed percentages
      const updatedTipSettings = {
        ...tipSettings,
        defaultPercentages: limitedPercentages.length > 0 ? limitedPercentages : [15, 18, 20, 25] // fallback to defaults if empty
      };

      // Ensure the fixed fields are preserved with their default values
      const updatedConfig = {
        ...merchantConfig,
        displayName: "Sats Factory POS",
        description: "Point-of-Sale for bitcoin lightning payments"
      };

      // Save the tip wallet URL to localStorage if it's provided and tips are enabled with secondary wallet
      if (tipSettings.enabled && tipSettings.useSecondaryWallet && tipWalletNwcUrl) {
        window.localStorage.setItem(localStorageKeys.tipWalletNwcUrl, tipWalletNwcUrl);
      } else {
        // If tips are disabled or secondary wallet is not used, remove the tip wallet URL
        window.localStorage.removeItem(localStorageKeys.tipWalletNwcUrl);
      }

      saveMerchantConfig(updatedConfig);
      saveTipSettings(updatedTipSettings);
      setSaved(true);
    } catch (error) {
      console.error('Invalid tip percentages format', error);
      setAlertState({
        isOpen: true,
        title: 'Invalid Format',
        message: 'Please check your tip percentages format. Use numbers separated by commas (e.g., 10, 15, 20, 25)'
      });
    }
  };

  // Reset settings to default values
  const handleResetDefaults = () => {
    setResetConfirmOpen(true);
  };

  const confirmReset = () => {
    // Set merchant config to default values, including standard theme
    setMerchantConfig({
      ...defaultMerchantConfig
    });

    // Reset tip settings
    setTipSettings({...defaultTipSettings});

    // Reset tip percentages input field
    setTipPercentagesInput(defaultTipSettings.defaultPercentages.join(', '));
    
    // Clear the tip wallet URL
    setTipWalletNwcUrl('');
    setTipWalletNwcUrlValid(null);
    window.localStorage.removeItem(localStorageKeys.tipWalletNwcUrl);

    // Save changes to localStorage
    saveMerchantConfig({
      ...defaultMerchantConfig
    });
    saveTipSettings(defaultTipSettings);

    // Apply the standard theme immediately
    document.documentElement.setAttribute('data-theme', 'standard');

    setSaved(true);
  };

  return (
    <>
      <Template title="Merchant Settings">
        <div className="w-full space-y-4">

          <div className="tabs tabs-boxed mb-3 md:mb-4 bg-gray-900">
            <a
              className={`tab text-xs md:text-sm lg:text-base ${activeTab === 'branding' ? 'bg-white text-black' : 'text-white'}`}
              onClick={() => setActiveTab('branding')}
            >
              Branding
            </a>
            <a
              className={`tab text-xs md:text-sm lg:text-base ${activeTab === 'tips' ? 'bg-white text-black' : 'text-white'}`}
              onClick={() => setActiveTab('tips')}
            >
              Tips
            </a>
            <a
              className={`tab text-xs md:text-sm lg:text-base ${activeTab === 'advanced' ? 'bg-white text-black' : 'text-white'}`}
              onClick={() => setActiveTab('advanced')}
            >
              Advanced
            </a>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
            {activeTab === 'branding' && (
              <div className="space-y-2 md:space-y-4">
                <div>
                  <label className="block text-white mb-1 md:mb-2 text-xs md:text-sm lg:text-base">Store Name</label>
                  <input
                    type="text"
                    name="name"
                    value={merchantConfig.name}
                    onChange={handleMerchantConfigChange}
                    className="input input-bordered w-full bg-gray-900 text-white h-8 md:h-10 lg:h-12 text-sm md:text-base lg:text-lg settings-input"
                    placeholder="Store Name"
                  />
                </div>

                <div>
                  <label className="block text-white mb-1 md:mb-2 text-xs md:text-sm lg:text-base">Logo URL</label>
                  <input
                    type="text"
                    name="logoUrl"
                    value={merchantConfig.logoUrl}
                    onChange={handleMerchantConfigChange}
                    className="input input-bordered w-full bg-gray-900 text-white h-8 md:h-10 lg:h-12 text-sm md:text-base lg:text-lg settings-input"
                    placeholder="https://example.com/logo.png"
                  />
                  {/* Logo preview */}
                  <div className="mt-2 md:mt-3 p-2 md:p-3 bg-gray-800 rounded-lg flex justify-center items-center">
                    <div className="p-2 md:p-3 bg-black rounded flex justify-center items-center">
                      <img
                        src={merchantConfig.logoUrl}
                        alt="Logo Preview"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/images/satsfactory_logo.svg"; }}
                        className="h-10 md:h-14 lg:h-16 max-w-[200px] md:max-w-[280px] lg:max-w-[320px] object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1 md:py-2 cursor-pointer">
                    <span className="label-text text-white text-xs md:text-sm lg:text-base">Payment Effect</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleLightningPreview}
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-white"
                      >
                        Preview
                      </button>
                      <input
                        type="checkbox"
                        name="paymentEffectEnabled"
                        className="toggle toggle-sm md:toggle-md"
                        style={{
                          backgroundColor: merchantConfig.paymentEffectEnabled ? '#ffcc99' : '#4b5563',
                          borderColor: merchantConfig.paymentEffectEnabled ? '#ffcc99' : '#6b7280'
                        }}
                        checked={merchantConfig.paymentEffectEnabled}
                        onChange={handleMerchantConfigChange}
                      />
                    </div>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label py-1 md:py-2 cursor-pointer">
                    <span className="label-text text-white text-xs md:text-sm lg:text-base">Payment Chime</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleChimePreview}
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-white"
                      >
                        Preview
                      </button>
                      <input
                        type="checkbox"
                        name="paymentChimeEnabled"
                        className="toggle toggle-sm md:toggle-md"
                        style={{
                          backgroundColor: merchantConfig.paymentChimeEnabled ? '#ffcc99' : '#4b5563',
                          borderColor: merchantConfig.paymentChimeEnabled ? '#ffcc99' : '#6b7280'
                        }}
                        checked={merchantConfig.paymentChimeEnabled}
                        onChange={handleMerchantConfigChange}
                      />
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-white mb-1 md:mb-2 text-xs md:text-sm lg:text-base">Theme</label>
                  <select
                    name="theme"
                    value={merchantConfig.theme}
                    onChange={handleMerchantConfigChange}
                    className="select select-bordered w-full bg-gray-900 text-white h-8 md:h-10 lg:h-12 text-sm md:text-base lg:text-lg settings-select"
                  >
                    <option value="standard">Standard</option>
                    <option value="industrial">Industrial</option>
                    <option value="orangepill">Orange Pill</option>
                    <option value="purplepill">Purple Pill</option>
                    <option value="nostrich">Nostrich</option>
                    <option value="beehive">Beehive</option>
                    <option value="liquidity">Liquidity</option>
                    <option value="acidity">Acidity</option>
                    <option value="nutjob">Nutjob</option>
                    <option value="bluescreen">Bluescreen</option>
                    <option value="cypher">Cypher</option>
                    <option value="safari">Safari</option>
                    <option value="solidstate">Solid State</option>
                    <option value="blocktron">Blocktron</option>
                    <option value="surfboard">Surfboard</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="space-y-2 md:space-y-4 w-full">
                <div className="form-control">
                  <label className="label py-1 md:py-2 cursor-pointer">
                    <span className="label-text text-white text-xs md:text-sm lg:text-base">Enable Tips</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-sm md:toggle-md"
                      style={{
                        backgroundColor: tipSettings.enabled ? '#ffcc99' : '#4b5563',
                        borderColor: tipSettings.enabled ? '#ffcc99' : '#6b7280'
                      }}
                      checked={tipSettings.enabled}
                      onChange={handleTipToggle}
                    />
                  </label>
                </div>

                {tipSettings.enabled && (
                  <>
                    <div>
                      <label className="block text-white mb-1 md:mb-2 text-xs md:text-sm lg:text-base">
                        Tip Percentages (comma-separated)
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full bg-gray-900 text-white h-8 md:h-10 lg:h-12 text-sm md:text-base lg:text-lg settings-input"
                        value={tipPercentagesInput}
                        onChange={handlePercentagesChange}
                        placeholder="15, 18, 20, 25"
                        maxLength={24}
                      />
                      <span className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2 block">
                        Enter percentage values separated by commas
                      </span>
                    </div>

                    <div className="form-control">
                      <label className="label py-1 md:py-2 cursor-pointer">
                        <span className="label-text text-white text-xs md:text-sm lg:text-base">Allow Custom Tip Amount</span>
                        <input
                          type="checkbox"
                          className="toggle toggle-sm md:toggle-md"
                          style={{
                            backgroundColor: tipSettings.allowCustom ? '#ffcc99' : '#4b5563',
                            borderColor: tipSettings.allowCustom ? '#ffcc99' : '#6b7280'
                          }}
                          checked={tipSettings.allowCustom}
                          onChange={handleCustomTipToggle}
                        />
                      </label>
                    </div>
                    
                    <div className="divider text-gray-500 text-sm">Optional Tip Wallet</div>
                    
                    <div className="form-control">
                      <label className="label py-1 md:py-2 cursor-pointer">
                        <span className="label-text text-white text-xs md:text-sm lg:text-base">Use Separate Wallet for Tips</span>
                        <input
                          type="checkbox"
                          className="toggle toggle-sm md:toggle-md"
                          style={{
                            backgroundColor: tipSettings.useSecondaryWallet ? '#ffcc99' : '#4b5563',
                            borderColor: tipSettings.useSecondaryWallet ? '#ffcc99' : '#6b7280'
                          }}
                          checked={tipSettings.useSecondaryWallet}
                          onChange={(e) => {
                            const useSecondaryWallet = e.target.checked;
                            setTipSettings(prev => ({ ...prev, useSecondaryWallet }));
                            
                            // If disabling secondary wallet, clear the tip wallet URL
                            if (!useSecondaryWallet) {
                              setTipWalletNwcUrl('');
                              setTipWalletNwcUrlValid(null);
                              window.localStorage.removeItem(localStorageKeys.tipWalletNwcUrl);
                            }
                          }}
                        />
                      </label>
                    </div>
                    
                    {tipSettings.useSecondaryWallet && (
                      <div>
                        <label className="block text-white mb-1 md:mb-2 text-xs md:text-sm lg:text-base">
                          Tip Wallet
                        </label>
                        {tipWalletNwcUrl ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center bg-gray-900 text-white rounded-md p-2 border border-gray-700">
                              <div className="flex-grow">
                                <div className="font-mono text-xs md:text-sm truncate max-w-full">
                                  {tipWalletNwcUrl.substring(0, 20)}...{tipWalletNwcUrl.substring(tipWalletNwcUrl.length - 10)}
                                </div>
                                <div className="text-green-500 text-xs">
                                  Wallet connected successfully
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={handleClearTipWallet}
                                className="btn btn-xs bg-gray-700 hover:bg-gray-600 text-gray-300"
                              >
                                Clear
                              </button>
                            </div>
                            <span className="text-xs md:text-sm text-gray-400 block">
                              Connect a separate NWC-enabled Lightning wallet for receiving tips
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="w-full">
                              {showWalletSelector ? (
                                <div className="flex flex-col items-center justify-center bg-gray-900 p-4 rounded-md border border-gray-700">
                                  <Button onConnected={handleTipProviderConnection} />
                                  {tipWalletConnecting && (
                                    <div className="mt-3 text-sm text-gray-400 flex items-center">
                                      <span className="loading loading-spinner loading-xs mr-2"></span>
                                      Connecting...
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowWalletSelector(false);
                                      disconnect();
                                    }}
                                    className="mt-3 btn btn-sm bg-gray-700 hover:bg-gray-600 text-gray-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleConnectTipWallet}
                                  className="btn bg-gray-700 hover:bg-gray-600 text-white w-full"
                                >
                                  Connect Separate Wallet for Tips
                                </button>
                              )}
                            </div>
                            <span className="text-xs md:text-sm text-gray-400 block">
                              Must be different from your main wallet
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            {activeTab === 'advanced' && (
              <div className="space-y-4 md:space-y-6 w-full">
                <CheckForUpdates className="mb-4" />
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Application Recovery</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    If you're experiencing issues with the application, you can try refreshing it.
                    This won't clear your PIN or wallet connection.
                  </p>
                  <button 
                    type="button"
                    onClick={() => {
                      // Add cache-busting parameter but keep all other query params
                      const url = new URL(window.location.href);
                      url.searchParams.set('refresh', Date.now().toString());
                      window.location.href = url.toString();
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm transition-colors"
                  >
                    Refresh Application
                  </button>
                </div>
              </div>
            )}

            {(activeTab === 'branding' || activeTab === 'tips') && (
              <div className="pt-2 md:pt-4 space-y-2 md:space-y-3 w-full">
                <button
                  type="submit"
                  className={`w-full h-10 md:h-12 lg:h-14 text-sm md:text-base lg:text-lg btn settings-button ${merchantConfig.theme === "standard"
                    ? "bg-charge-green text-white hover:bg-green-500"
                    : merchantConfig.theme === "orangepill"
                      ? "bg-orange-pill-gradient text-black hover:bg-orange-pill-hover"
                      : merchantConfig.theme === "purplepill"
                        ? "bg-purple-pill-gradient text-white hover:bg-purple-pill-hover"
                        : merchantConfig.theme === "nostrich"
                        ? "bg-nostrich-gradient text-white hover:bg-nostrich-hover"
                        : merchantConfig.theme === "beehive"
                          ? "bg-beehive-yellow text-black hover:bg-beehive-hover"
                          : merchantConfig.theme === "liquidity"
                            ? "bg-liquidity-gradient text-black hover:bg-liquidity-hover"
                            : merchantConfig.theme === "acidity"
                              ? "bg-acidity-gradient text-black hover:bg-acidity-hover"
                              : merchantConfig.theme === "nutjob"
                                ? "bg-nutjob-gradient text-black hover:bg-nutjob-hover"
                                : merchantConfig.theme === "safari"
                                  ? "bg-safari-gradient text-black hover:bg-safari-hover"
                                  : merchantConfig.theme === "solidstate"
                                    ? "bg-solidstate-gradient text-white hover:bg-solidstate-hover"
                                    : merchantConfig.theme === "blocktron"
                                      ? "bg-blocktron-gradient text-white hover:bg-blocktron-hover"
                                      : merchantConfig.theme === "surfboard"
                                        ? "bg-surfboard-gradient text-white hover:bg-surfboard-hover"
                                        : merchantConfig.theme === "cypher"
                                          ? "bg-cypher-gradient text-cypher-green hover:bg-cypher-hover"
                                          : merchantConfig.theme === "bluescreen"
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "btn-industrial-gradient"
                  }`}
                >
                  Save Settings
                </button>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="btn btn-ghost text-gray-400 hover:bg-gray-800 hover:text-white w-full h-10 md:h-12 lg:h-14 text-sm md:text-base lg:text-lg settings-button"
                >
                  Restore Default Settings
                </button>
              </div>
            )}

            {saved && (
              <div className="text-charge-green text-center mt-2 md:mt-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 mr-1 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs md:text-sm lg:text-base">Settings saved successfully!</span>
              </div>
            )}
          </form>
        </div>
      </Template>

      <ConfirmModal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={confirmReset}
        title="Reset Settings"
        message="Are you sure you want to restore default settings? This will reset your store name, logo, and tip settings, and switch to the Standard theme."
        confirmText="Reset All"
        isDanger
      />

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
      />

      {showLightningPreview && <CodepenLightning duration={1000} />}
    </>
  );
}