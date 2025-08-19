import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequirePin } from '../hooks/useRequirePin';
import { AlertModal, ConfirmModal } from '../components/Modals';
import { ExactBackButton } from '../components/ExactBackButton';
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

export function Settings() {
  useRequirePin();
  const [merchantConfig, setMerchantConfig] = useState(getMerchantConfig());
  const [tipSettings, setTipSettings] = useState(getTipSettings());
  const [tipWalletNwcUrl, setTipWalletNwcUrl] = useState(() => {
    return window.localStorage.getItem(localStorageKeys.tipWalletNwcUrl) || '';
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [showLightningPreview, setShowLightningPreview] = useState(false);
  const navigate = useNavigate();

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

  const handleBack = () => {
    const hasWallet = window.localStorage.getItem("pos:nwcUrl");
    if (hasWallet) {
      navigate("/wallet/new");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    // Reset the saved message after 3 seconds
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  // Update the theme when changed in settings
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', merchantConfig.theme);
  }, [merchantConfig.theme]);

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
    window.localStorage.removeItem(localStorageKeys.tipWalletNwcUrl);
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
        defaultPercentages: limitedPercentages.length > 0 ? limitedPercentages : [10, 15, 20, 25] // fallback to defaults if empty
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
    <div className="h-full bg-black text-white" data-theme={merchantConfig.theme}>
      <ExactBackButton onBack={handleBack} theme={merchantConfig.theme} />
      <div className="flex flex-grow flex-col overflow-auto pt-16">
        <div className="w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto p-2 md:p-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">Merchant Settings</h1>

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
                    <div className="p-2 md:p-3 bg-black rounded inline-block">
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
                    <option value="nostrich">Nostrich</option>
                    <option value="beehive">Beehive</option>
                    <option value="liquidity">Liquidity</option>
                    <option value="safari">Safari</option>
                    <option value="blocktron">Blocktron</option>
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
                        placeholder="10, 15, 20, 25"
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
                              window.localStorage.removeItem(localStorageKeys.tipWalletNwcUrl);
                            }
                          }}
                        />
                      </label>
                    </div>
                    
                    {tipSettings.useSecondaryWallet && (
                      <div>
                        <label className="block text-white mb-1 md:mb-2 text-xs md:text-sm lg:text-base">
                          Tip Wallet NWC URL
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            className="input input-bordered w-full bg-gray-900 text-white h-8 md:h-10 lg:h-12 text-sm md:text-base lg:text-lg settings-input pr-20"
                            value={tipWalletNwcUrl || ''}
                            onChange={(e) => setTipWalletNwcUrl(e.target.value)}
                            placeholder="nostr+walletconnect://..."
                          />
                          <button
                            type="button"
                            onClick={handleClearTipWallet}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-xs bg-gray-700 hover:bg-gray-600 text-gray-300"
                          >
                            Clear
                          </button>
                        </div>
                        <span className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2 block">
                          Connect a separate NWC wallet for receiving tips
                        </span>
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
                      : merchantConfig.theme === "nostrich"
                        ? "bg-nostrich-gradient text-white hover:bg-nostrich-hover"
                        : merchantConfig.theme === "beehive"
                          ? "bg-beehive-yellow text-black hover:bg-beehive-hover"
                          : merchantConfig.theme === "liquidity"
                            ? "bg-liquidity-gradient text-black hover:bg-liquidity-hover"
                            : merchantConfig.theme === "safari"
                            ? "bg-safari-gradient text-black hover:bg-safari-hover"
                            : merchantConfig.theme === "blocktron"
                              ? "bg-blocktron-gradient text-white hover:bg-blocktron-hover"
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
      </div>

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
    </div>
  );
}