import React from 'react';
import { getMerchantConfig } from '../config';

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export function MerchantLogo({ className, style }: Props) {
  const config = getMerchantConfig();
  
  // Apply consistent logo styling for both default and custom logos
  const logoStyle = {
    ...style,
    // Override the fixed height constraint while maintaining maxWidth
    height: style?.height ? undefined : 'auto',
    maxHeight: '60px', // Same height for all logos
    maxWidth: style?.maxWidth || '240px', // Same width constraint for all logos
    objectFit: 'contain' as 'contain', // Ensure the logo fits within bounds while maintaining aspect ratio
  };
  
  // Determine which logo source to use
  const isDefaultLogo = !config.logoUrl || 
                        config.logoUrl.includes("satsfactory_logo.svg") || 
                        config.logoUrl === "/logo.svg";
  
  const logoSrc = isDefaultLogo ? "/images/satsfactory_logo.svg" : config.logoUrl;
  
  return (
    <img 
      src={logoSrc}
      alt={config.displayName} 
      className={className}
      style={logoStyle}
      onError={(e) => {
        // Fallback to default logo if custom logo fails to load
        const target = e.target as HTMLImageElement;
        if (!isDefaultLogo) {
          target.src = "/images/satsfactory_logo.svg";
        }
      }}
    />
  );
}