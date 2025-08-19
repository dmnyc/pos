export interface MerchantConfig {
  name: string;
  displayName: string;
  logoUrl: string;
  description: string;
  theme: "standard" | "industrial" | "orangepill" | "nostrich" | "beehive" | "liquidity" | "safari" | "blocktron";
  paymentChimeEnabled: boolean;
  paymentEffectEnabled: boolean;
}

export interface TipSettings {
  enabled: boolean;
  defaultPercentages: number[];
  allowCustom: boolean;
  useSecondaryWallet: boolean; // New setting to determine which wallet to use for tips
}

// Import the localStorageKeys from constants
import { localStorageKeys } from './constants';

// Default configuration
export const defaultMerchantConfig: MerchantConfig = {
  name: "Sats Factory",
  displayName: "Sats Factory POS",
  logoUrl: "/images/satsfactory_logo.svg",
  description: "Point-of-Sale for bitcoin lightning payments",
  theme: "standard",
  paymentChimeEnabled: false,
  paymentEffectEnabled: true
};

// Default tip settings
export const defaultTipSettings: TipSettings = {
  enabled: true,
  defaultPercentages: [10, 15, 20, 25],
  allowCustom: true,
  useSecondaryWallet: false
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
        // Copy everything except primaryColor and secondaryColor, use _var convention to indicate intentionally unused
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // Always enforce certain fixed values
  return {
    ...defaultMerchantConfig,
    ...savedConfig,
    // Always override these specific fields
    displayName: "Sats Factory POS",
    description: "Point-of-Sale for bitcoin lightning payments"
  };
}

// Function to get tip settings with defaults applied for missing values
export function getTipSettings(): TipSettings {
  const savedSettings = loadTipSettings();
  return { ...defaultTipSettings, ...savedSettings };
}

// Parse and apply merchant config from URL parameters
export function applyMerchantConfigFromUrl(searchParams: URLSearchParams): void {
  // First check for new compressed format
  const compressedConfig = searchParams.get("config");
  if (compressedConfig) {
    try {
      const configObject = JSON.parse(atob(compressedConfig));
      applyCompressedConfig(configObject);
      return;
    } catch (error) {
      console.error("Failed to parse compressed config:", error);
      // Fall back to individual parameters
    }
  }

  // Handle legacy individual parameters (backward compatibility)
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

  // Check for currency (legacy)
  const currency = searchParams.get("currency");
  if (currency) {
    localStorage.setItem(localStorageKeys.currency, currency);
  }

  // Save if any changes were made
  if (updated) {
    saveMerchantConfig(config);
  }
}

// Define interface for compressed config
interface CompressedConfig {
  name?: string;
  logoUrl?: string;
  theme?: "standard" | "industrial" | "orangepill" | "nostrich" | "beehive" | "liquidity" | "safari" | "blocktron";
  paymentChime?: boolean;
  currency?: string;
  tips?: {
    enabled?: boolean;
    percentages?: number[];
    allowCustom?: boolean;
  };
}

// Apply compressed configuration object
function applyCompressedConfig(configObject: CompressedConfig): void {

  let merchantUpdated = false;
  let tipUpdated = false;

  const currentMerchantConfig = getMerchantConfig();
  const currentTipSettings = getTipSettings();

  // Apply merchant config settings
  const newMerchantConfig = { ...currentMerchantConfig };

  if (configObject.name) {
    newMerchantConfig.name = configObject.name;
    merchantUpdated = true;
  }

  if (configObject.logoUrl) {
    newMerchantConfig.logoUrl = configObject.logoUrl;
    merchantUpdated = true;
  }

  if (configObject.theme && ["standard", "industrial", "orangepill", "nostrich", "beehive", "liquidity", "safari", "blocktron"].includes(configObject.theme)) {
    newMerchantConfig.theme = configObject.theme;
    merchantUpdated = true;
  }

  if (typeof configObject.paymentChime === 'boolean') {
    newMerchantConfig.paymentChimeEnabled = configObject.paymentChime;
    merchantUpdated = true;
  }

  // Apply currency setting
  if (configObject.currency) {
    localStorage.setItem(localStorageKeys.currency, configObject.currency);
  }

  // Apply tip settings
  const newTipSettings = { ...currentTipSettings };

  if (configObject.tips) {
    if (typeof configObject.tips.enabled === 'boolean') {
      newTipSettings.enabled = configObject.tips.enabled;
      tipUpdated = true;
    }

    if (Array.isArray(configObject.tips.percentages)) {
      newTipSettings.defaultPercentages = configObject.tips.percentages;
      tipUpdated = true;
    }

    if (typeof configObject.tips.allowCustom === 'boolean') {
      newTipSettings.allowCustom = configObject.tips.allowCustom;
      tipUpdated = true;
    }
  }

  // Save updated configurations
  if (merchantUpdated) {
    saveMerchantConfig(newMerchantConfig);
  }

  if (tipUpdated) {
    saveTipSettings(newTipSettings);
  }
}

// Import MAX_MEMO_LENGTH from constants.ts instead of redefining it
// export const MAX_MEMO_LENGTH = 159;