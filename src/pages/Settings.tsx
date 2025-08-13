import React, { useState, useEffect } from 'react';
import { Backbar } from '../components/Backbar';
import { 
  getMerchantConfig, 
  saveMerchantConfig, 
  getTipSettings, 
  saveTipSettings,
  defaultMerchantConfig,
  defaultTipSettings
} from '../config';

export function Settings() {
  const [merchantConfig, setMerchantConfig] = useState(getMerchantConfig());
  const [tipSettings, setTipSettings] = useState(getTipSettings());
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');

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
    const { name, value } = e.target;
    setMerchantConfig(prev => ({ ...prev, [name]: value }));
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
      alert('Please check your tip percentages format. Use numbers separated by commas (e.g., 10, 15, 20, 25)');
    }
  };

  // Reset settings to default values
  const handleResetDefaults = () => {
    if (confirm("Are you sure you want to restore default settings? This will reset your store name, logo, and tip settings, and switch to the Standard theme.")) {
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
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-black text-white" data-theme={merchantConfig.theme}>
      <Backbar />
      <div className="w-full max-w-lg mx-auto p-2">
        <h1 className="text-xl font-bold mb-3">Merchant Settings</h1>
      
      <div className="tabs tabs-boxed mb-3 bg-gray-900">
        <a 
          className={`tab text-xs ${activeTab === 'branding' ? 'bg-white text-black' : 'text-white'}`}
          onClick={() => setActiveTab('branding')}
        >
          Branding
        </a>
        <a 
          className={`tab text-xs ${activeTab === 'tips' ? 'bg-white text-black' : 'text-white'}`}
          onClick={() => setActiveTab('tips')}
        >
          Tips
        </a>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        {activeTab === 'branding' && (
          <div className="space-y-2">
            <div>
              <label className="block text-white mb-1 text-xs">Store Name</label>
              <input
                type="text"
                name="name"
                value={merchantConfig.name}
                onChange={handleMerchantConfigChange}
                className="input input-bordered w-full bg-gray-900 text-white h-8 text-sm"
                placeholder="Store Name"
              />
            </div>
            
            <div>
              <label className="block text-white mb-1 text-xs">Logo URL</label>
              <input
                type="text"
                name="logoUrl"
                value={merchantConfig.logoUrl}
                onChange={handleMerchantConfigChange}
                className="input input-bordered w-full bg-gray-900 text-white h-8 text-sm"
                placeholder="https://example.com/logo.png"
              />
              {/* Logo preview */}
              <div className="mt-2 p-2 bg-gray-800 rounded-lg flex justify-center items-center">
                <div className="p-2 bg-black rounded inline-block">
                  <img 
                    src={merchantConfig.logoUrl} 
                    alt="Logo Preview" 
                    onError={(e) => { (e.target as HTMLImageElement).src = "/images/satsfactory_logo.svg"; }}
                    style={{ maxHeight: '60px', maxWidth: '240px', objectFit: 'contain' }} 
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-white mb-1 text-xs">Theme</label>
              <select
                name="theme"
                value={merchantConfig.theme}
                onChange={handleMerchantConfigChange}
                className="select select-bordered w-full bg-gray-900 text-white h-8 text-sm"
              >
                <option value="standard">Standard</option>
                <option value="industrial">Industrial</option>
                <option value="orangepill">Orange Pill</option>
                <option value="nostrich">Nostrich</option>
                <option value="beehive">Beehive</option>
                <option value="safari">Safari</option>
                <option value="blocktron">Blocktron</option>
              </select>
              
              {/* Preview of current theme buttons */}
              <div className="mt-2 p-2 bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Theme Preview:</p>
                <div className="flex gap-2">
                  {merchantConfig.theme === "standard" ? (
                    <button type="button" className="btn bg-charge-green text-white hover:bg-green-500 h-8 text-xs">
                      Standard Button
                    </button>
                  ) : merchantConfig.theme === "orangepill" ? (
                    <button type="button" className="btn bg-orange-pill-gradient text-black hover:bg-orange-pill-hover h-8 text-xs">
                      Orange Pill Button
                    </button>
                  ) : merchantConfig.theme === "nostrich" ? (
                    <button type="button" className="btn bg-nostrich-gradient text-white hover:bg-nostrich-hover h-8 text-xs">
                      Nostrich Button
                    </button>
                  ) : merchantConfig.theme === "beehive" ? (
                    <button type="button" className="btn bg-beehive-yellow text-black hover:bg-beehive-hover h-8 text-xs">
                      Beehive Button
                    </button>
                  ) : merchantConfig.theme === "safari" ? (
                    <button type="button" className="btn bg-safari-gradient text-black hover:bg-safari-hover h-8 text-xs">
                      Safari Button
                    </button>
                  ) : merchantConfig.theme === "blocktron" ? (
                    <button type="button" className="btn bg-blocktron-gradient text-white hover:bg-blocktron-hover h-8 text-xs">
                      Blocktron Button
                    </button>
                  ) : (
                    <button type="button" className="btn btn-industrial-gradient h-8 text-xs">
                      Industrial Button
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'tips' && (
          <div className="space-y-2">
            <div className="form-control">
              <label className="label py-1 cursor-pointer">
                <span className="label-text text-white text-xs">Enable Tips</span>
                <input 
                  type="checkbox" 
                  className="toggle toggle-sm bg-gray-600 border-gray-600" 
                  checked={tipSettings.enabled}
                  onChange={handleTipToggle}
                />
              </label>
            </div>
            
            {tipSettings.enabled && (
              <>
                <div>
                  <label className="block text-white mb-1 text-xs">
                    Tip Percentages (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full bg-gray-900 text-white h-8 text-sm"
                    value={tipPercentagesInput}
                    onChange={handlePercentagesChange}
                    placeholder="10, 15, 20, 25"
                  />
                  <span className="text-xs text-gray-400 mt-1 block">
                    Enter percentages separated by commas (e.g., 10, 15, 20, 25)
                  </span>
                </div>
                
                <div className="form-control">
                  <label className="label py-1 cursor-pointer">
                    <span className="label-text text-white text-xs">Allow Custom Tip Amount</span>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-sm bg-gray-600 border-gray-600" 
                      checked={tipSettings.allowCustom}
                      onChange={handleCustomTipToggle}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="pt-2 space-y-2">
          <button 
            type="submit" 
            className={merchantConfig.theme === "standard" 
              ? "btn bg-charge-green text-white hover:bg-green-500 w-full h-10 text-sm" 
              : merchantConfig.theme === "orangepill"
                ? "btn bg-orange-pill-gradient text-black hover:bg-orange-pill-hover w-full h-10 text-sm"
                : merchantConfig.theme === "nostrich"
                  ? "btn bg-nostrich-gradient text-white hover:bg-nostrich-hover w-full h-10 text-sm"
                  : merchantConfig.theme === "beehive"
                    ? "btn bg-beehive-yellow text-black hover:bg-beehive-hover w-full h-10 text-sm"
                    : merchantConfig.theme === "safari"
                      ? "btn bg-safari-gradient text-black hover:bg-safari-hover w-full h-10 text-sm"
                      : merchantConfig.theme === "blocktron"
                        ? "btn bg-blocktron-gradient text-white hover:bg-blocktron-hover w-full h-10 text-sm"
                        : "btn btn-industrial-gradient w-full h-10 text-sm"
            }
          >
            Save Settings
          </button>
          
          <button 
            type="button"
            onClick={handleResetDefaults}
            className="btn btn-ghost text-gray-400 hover:bg-gray-800 hover:text-white w-full h-10 text-sm"
          >
            Restore Default Settings
          </button>
        </div>
        
        {saved && (
          <div className="text-charge-green text-center mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs">Settings saved successfully!</span>
          </div>
        )}
      </form>
      </div>
    </div>
  );
}