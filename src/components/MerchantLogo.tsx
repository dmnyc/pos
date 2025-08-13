import React from 'react';
import { getMerchantConfig } from '../config';

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export function MerchantLogo({ className, style }: Props) {
  const config = getMerchantConfig();
  const isCustomLogo = config.logoUrl && 
                      !config.logoUrl.includes("satsfactory_logo.svg") && 
                      config.logoUrl !== "/logo.svg";
  
  // If merchant has a custom logo URL that's different from the default, use that
  if (isCustomLogo) {
    // For custom logos, use different styling to allow them to be larger
    const customLogoStyle = {
      ...style,
      // Override the fixed height constraint while maintaining maxWidth
      height: style?.height ? undefined : 'auto',
      maxHeight: '60px', // Much taller logos - doubled from 36px
      maxWidth: style?.maxWidth || '240px', // Much wider logos - increased by 33%
      objectFit: 'contain' as 'contain', // Ensure the logo fits within bounds while maintaining aspect ratio
    };
    
    return (
      <img 
        src={config.logoUrl} 
        alt={config.displayName} 
        className={className}
        style={customLogoStyle}
      />
    );
  }
  
  // Use the Satsfactory logo (default) with original constraints
  return (
    <img 
      src="/images/satsfactory_logo.svg"
      alt={config.displayName} 
      className={className}
      style={style}
    />
  );
}