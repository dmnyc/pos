export interface MerchantConfig {
  name: string;
  displayName: string;
  logoUrl: string;
  description: string;
  theme: "standard" | "industrial";
}

export interface TipSettings {
  enabled: boolean;
  defaultPercentages: number[];
  allowCustom: boolean;
}

// Default configuration
export const defaultMerchantConfig: MerchantConfig = {
  name: "Lightning POS",
  displayName: "Lightning POS",
  logoUrl: "/images/satsfactory_logo.svg", 
  description: "Point-of-Sale for bitcoin lightning payments",
  theme: "standard"
};

// Default tip settings
export const defaultTipSettings: TipSettings = {
  enabled: true,
  defaultPercentages: [10, 15, 20, 25],
  allowCustom: true
};

// Function to load merchant configuration from localStorage
export function loadMerchantConfig(): MerchantConfig {
  const storedConfig = localStorage.getItem(localStorageKeys.merchantConfig);
  
  if (storedConfig) {
    try {
      // Handle migration from old config format with primaryColor/secondaryColor
      const parsedConfig = JSON.parse(storedConfig);
      
      // If the old format is found (has primaryColor but no theme)
      if (parsedConfig.primaryColor && !parsedConfig.theme) {
        // Copy everything except primaryColor and secondaryColor
        const { primaryColor, secondaryColor, ...rest } = parsedConfig;
        // Add theme property
        return { 
          ...rest, 
          theme: "standard" // Default to standard theme for migrated configs
        };
      }
      
      return parsedConfig;
    } catch (e) {
      console.error("Failed to parse stored merchant config", e);
    }
  }
  
  // Return default if no stored config
  return defaultMerchantConfig;
}

// Function to load tip settings from localStorage
export function loadTipSettings(): TipSettings {
  const storedSettings = localStorage.getItem(localStorageKeys.tipSettings);
  
  if (storedSettings) {
    try {
      return JSON.parse(storedSettings);
    } catch (e) {
      console.error("Failed to parse stored tip settings", e);
    }
  }
  
  // Return default if no stored settings
  return defaultTipSettings;
}

// Function to save merchant configuration to localStorage
export function saveMerchantConfig(config: MerchantConfig): void {
  localStorage.setItem(localStorageKeys.merchantConfig, JSON.stringify(config));
}

// Function to save tip settings to localStorage
export function saveTipSettings(settings: TipSettings): void {
  localStorage.setItem(localStorageKeys.tipSettings, JSON.stringify(settings));
}

// Function to get merchant configuration with defaults applied for missing values
export function getMerchantConfig(): MerchantConfig {
  const savedConfig = loadMerchantConfig();
  return { ...defaultMerchantConfig, ...savedConfig };
}

// Function to get tip settings with defaults applied for missing values
export function getTipSettings(): TipSettings {
  const savedSettings = loadTipSettings();
  return { ...defaultTipSettings, ...savedSettings };
}

// Parse and apply merchant config from URL parameters
export function applyMerchantConfigFromUrl(searchParams: URLSearchParams): void {
  const config = getMerchantConfig();
  let updated = false;

  // Check for merchant name/label
  const merchantName = searchParams.get("merchant_name");
  if (merchantName) {
    config.name = merchantName;
    config.displayName = merchantName;
    updated = true;
  }

  // Check for logo URL
  const logoUrl = searchParams.get("logo_url");
  if (logoUrl) {
    config.logoUrl = logoUrl;
    updated = true;
  }

  // Check for theme
  const theme = searchParams.get("theme");
  if (theme === "standard" || theme === "industrial") {
    config.theme = theme;
    updated = true;
  }

  // Check for description
  const description = searchParams.get("description");
  if (description) {
    config.description = description;
    updated = true;
  }

  // Save if any changes were made
  if (updated) {
    saveMerchantConfig(config);
  }
}

export const localStorageKeys = {
  nwcUrl: "pos:nwcUrl",
  currency: "pos:currency",
  label: "pos:label",
  merchantConfig: "pos:merchantConfig",
  tipSettings: "pos:tipSettings",
};

export const MAX_MEMO_LENGTH = 159;