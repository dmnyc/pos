import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequirePin } from '../hooks/useRequirePin';
import { AlertModal, ConfirmModal } from '../components/Modals';
import { ExactBackButton } from '../components/ExactBackButton';
import { 
  getMerchantConfig, 
  saveMerchantConfig, 
  getTipSettings, 
  saveTipSettings,
  defaultMerchantConfig,
  defaultTipSettings
} from '../config';
import { playPaymentChime } from '../utils/audioUtils';

export function Settings() {
  useRequirePin();
  const [merchantConfig, setMerchantConfig] = useState(getMerchantConfig());
  const [tipSettings, setTipSettings] = useState(getTipSettings());
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
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

  // Add state for the raw percentage input as a controlled input
  const [tipPercentagesInput, setTipPercentagesInput] = useState(() => {
    return tipSettings.defaultPercentages.join(', ');
  });

  useEffect(() => {
    // Initialize the input state when tipSettings are first loaded
    setTipPercentagesInput(tipSettings.defaultPercentages.join(', '));
  }, []); // Empty dependency array means this runs once on mount

  const handleTipToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTipSettings(prev => ({ ...prev, enabled: e.target.checked }));
  };

  const handleCustomTipToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTipSettings(prev => ({ ...prev, allowCustom: e.target.checked }));
  };

  const handlePercentagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only store the raw input, don't try to parse it yet
    setTipPercentagesInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse the tip percentages from the raw input
    try {
      const percentages = tipPercentagesInput
        .split(',')
        .map(p => parseInt(p.trim()))
        .filter(p => !isNaN(p) && p > 0);
      
      // Update the tip settings with the parsed percentages
      const updatedTipSettings = {
        ...tipSettings,
        defaultPercentages: percentages.length > 0 ? percentages : [10, 15, 20, 25] // fallback to defaults if empty
      };
      
      // Ensure the fixed fields are preserved with their default values
      const updatedConfig = {
        ...merchantConfig,
        displayName: "Sats Factory POS",
        description: "Point-of-Sale for bitcoin lightning payments"
      };
      
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
                      className="toggle toggle-sm md:toggle-md bg-gray-600 border-gray-600" 
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
                      />
                      <span className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2 block">
                        Enter percentages separated by commas (e.g., 10, 15, 20, 25)
                      </span>
                    </div>
                    
                    <div className="form-control">
                      <label className="label py-1 md:py-2 cursor-pointer">
                        <span className="label-text text-white text-xs md:text-sm lg:text-base">Allow Custom Tip Amount</span>
                        <input 
                          type="checkbox" 
                          className="toggle toggle-sm md:toggle-md bg-gray-600 border-gray-600" 
                          checked={tipSettings.allowCustom}
                          onChange={handleCustomTipToggle}
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}
            
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
    </div>
  );
}