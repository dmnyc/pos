import React from 'react';
import { getMerchantConfig } from '../config';

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export function MerchantLogo({ className, style }: Props) {
  const config = getMerchantConfig();
  
  // If merchant has a custom logo URL that's different from the default, use that
  if (config.logoUrl && !config.logoUrl.includes("satsfactory_logo.svg") && config.logoUrl !== "/logo.svg") {
    return (
      <img 
        src={config.logoUrl} 
        alt={config.displayName} 
        className={className}
        style={style}
      />
    );
  }
  
  // Use the Satsfactory logo (default)
  return (
    <img 
      src="/images/satsfactory_logo.svg"
      alt={config.displayName} 
      className={className}
      style={{
        ...style,
        maxWidth: '100%', // Ensure it doesn't overflow its container
        height: 'auto',   // Maintain aspect ratio
        display: 'block'  // Remove any extra space below the image
      }}
    />
  );
}