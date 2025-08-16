import React from 'react';
import { getMerchantConfig } from '../config';

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export function MerchantLogo({ className, style }: Props) {
  const config = getMerchantConfig();
  
  // Determine which logo source to use
  const isDefaultLogo = !config.logoUrl || 
                        config.logoUrl.includes("satsfactory_logo.svg") || 
                        config.logoUrl === "/logo.svg";
  
  const logoSrc = isDefaultLogo ? "/images/satsfactory_logo.svg" : config.logoUrl;
  
  // Apply default size classes only if no custom className provided
  const sizeClasses = className 
    ? '' 
    : 'h-8 md:h-10 lg:h-14 wide:h-14 w-auto max-w-[160px] md:max-w-[220px] lg:max-w-[280px] wide:max-w-[300px]';
  
  return (
    <img 
      src={logoSrc}
      alt={config.displayName} 
      className={`${className || ''} ${sizeClasses} object-contain`}
      style={style}
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