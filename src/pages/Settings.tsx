import React, { useState, useEffect } from 'react';
import { Backbar } from '../components/Backbar';
import { 
  getMerchantConfig, 
  saveMerchantConfig, 
  getTipSettings, 
  saveTipSettings 
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

  const handleMerchantConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMerchantConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleTipToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTipSettings(prev => ({ ...prev, enabled: e.target.checked }));
  };

  const handleCustomTipToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTipSettings(prev => ({ ...prev, allowCustom: e.target.checked }));
  };

  const handlePercentagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentagesString = e.target.value;
    try {
      // Parse comma-separated list of percentages
      const percentages = percentagesString
        .split(',')
        .map(p => parseInt(p.trim()))
        .filter(p => !isNaN(p) && p > 0);
      
      setTipSettings(prev => ({ ...prev, defaultPercentages: percentages }));
    } catch (error) {
      console.error('Invalid tip percentages format', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMerchantConfig(merchantConfig);
    saveTipSettings(tipSettings);
    setSaved(true);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-black text-white" data-theme="dark">
      <Backbar />
      <h1 className="text-2xl font-bold mb-6">Merchant Settings</h1>
      
      <div className="tabs tabs-boxed mb-6 bg-gray-900">
        <a 
          className={`tab ${activeTab === 'branding' ? 'bg-white text-black' : 'text-white'}`}
          onClick={() => setActiveTab('branding')}
        >
          Branding
        </a>
        <a 
          className={`tab ${activeTab === 'tips' ? 'bg-white text-black' : 'text-white'}`}
          onClick={() => setActiveTab('tips')}
        >
          Tips
        </a>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'branding' && (
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Store Name</label>
              <input
                type="text"
                name="name"
                value={merchantConfig.name}
                onChange={handleMerchantConfigChange}
                className="input input-bordered w-full bg-gray-900 text-white"
                placeholder="Store Name"
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">Display Name</label>
              <input
                type="text"
                name="displayName"
                value={merchantConfig.displayName}
                onChange={handleMerchantConfigChange}
                className="input input-bordered w-full bg-gray-900 text-white"
                placeholder="Display Name"
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">Logo URL</label>
              <input
                type="text"
                name="logoUrl"
                value={merchantConfig.logoUrl}
                onChange={handleMerchantConfigChange}
                className="input input-bordered w-full bg-gray-900 text-white"
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">Primary Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  name="primaryColor"
                  value={merchantConfig.primaryColor}
                  onChange={handleMerchantConfigChange}
                  className="mr-2 h-10 w-10 cursor-pointer"
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={merchantConfig.primaryColor}
                  onChange={handleMerchantConfigChange}
                  className="input input-bordered flex-1 bg-gray-900 text-white"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-white mb-2">Secondary Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  name="secondaryColor"
                  value={merchantConfig.secondaryColor}
                  onChange={handleMerchantConfigChange}
                  className="mr-2 h-10 w-10 cursor-pointer"
                />
                <input
                  type="text"
                  name="secondaryColor"
                  value={merchantConfig.secondaryColor}
                  onChange={handleMerchantConfigChange}
                  className="input input-bordered flex-1 bg-gray-900 text-white"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-white mb-2">Description</label>
              <input
                type="text"
                name="description"
                value={merchantConfig.description}
                onChange={handleMerchantConfigChange}
                className="input input-bordered w-full bg-gray-900 text-white"
                placeholder="Point-of-Sale for bitcoin lightning payments"
              />
            </div>
          </div>
        )}
        
        {activeTab === 'tips' && (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text text-white">Enable Tips</span>
                <input 
                  type="checkbox" 
                  className="toggle bg-gray-600 border-gray-600" 
                  checked={tipSettings.enabled}
                  onChange={handleTipToggle}
                />
              </label>
            </div>
            
            {tipSettings.enabled && (
              <>
                <div>
                  <label className="block text-white mb-2">
                    Tip Percentages (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full bg-gray-900 text-white"
                    value={tipSettings.defaultPercentages.join(', ')}
                    onChange={handlePercentagesChange}
                    placeholder="10, 15, 20, 25"
                  />
                  <span className="text-xs text-gray-400 mt-1 block">
                    Enter percentages separated by commas (e.g., 10, 15, 20, 25)
                  </span>
                </div>
                
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text text-white">Allow Custom Tip Amount</span>
                    <input 
                      type="checkbox" 
                      className="toggle bg-gray-600 border-gray-600" 
                      checked={tipSettings.allowCustom}
                      onChange={handleCustomTipToggle}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="pt-4">
          <button type="submit" className="btn bg-charge-green text-white hover:bg-green-500 w-full">
            Save Settings
          </button>
        </div>
        
        {saved && (
          <div className="alert bg-charge-green text-white shadow-lg">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Settings saved successfully!</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}