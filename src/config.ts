export interface MerchantConfig {
  name: string;
  displayName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
}

export interface TipSettings {
  enabled: boolean;
  defaultPercentages: number[];
  allowCustom: boolean;
}

// Default configuration with updated color scheme
export const defaultMerchantConfig: MerchantConfig = {
  name: "Lightning POS",
  displayName: "Lightning POS",
  logoUrl: "/images/satsfactory_logo.svg", 
  primaryColor: "#000000", // Black background
  secondaryColor: "#FFFFFF", // White text
  description: "Point-of-Sale for bitcoin lightning payments"
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
      return JSON.parse(storedConfig);
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

  // Check for primary color
  const primaryColor = searchParams.get("primary_color");
  if (primaryColor) {
    config.primaryColor = primaryColor;
    updated = true;
  }

  // Check for secondary color
  const secondaryColor = searchParams.get("secondary_color");
  if (secondaryColor) {
    config.secondaryColor = secondaryColor;
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