import React from 'react';
import { getMerchantConfig } from '../config';

type Props = {
  className?: string;
  style?: React.CSSProperties;
  isHomePage?: boolean; // New prop to identify when used on home page
};

export function MerchantLogo({ className, style, isHomePage = false }: Props) {
  const config = getMerchantConfig();
  
  // Determine which logo source to use
  const isDefaultLogo = !config.logoUrl || 
                        config.logoUrl.includes("satsfactory_logo.svg") || 
                        config.logoUrl === "/logo.svg";
  
  const logoSrc = isDefaultLogo ? "/images/satsfactory_logo.svg" : config.logoUrl;
  
  // Size classes for different contexts
  const navbarSizeClasses = 'h-8 md:h-10 lg:h-14 wide:h-14 w-auto max-w-[160px] md:max-w-[220px] lg:max-w-[280px] wide:max-w-[300px]';
  
  // Size classes for home page - constrain height more strictly for custom logos
  const homePageSizeClasses = isDefaultLogo 
    ? 'h-auto w-auto max-w-[675px] md:max-w-[900px] lg:max-w-[1350px] max-h-[30vh] md:max-h-[35vh] lg:max-h-[40vh]'
    : 'h-auto w-auto max-w-[320px] md:max-w-[420px] lg:max-w-[520px] max-h-[30vh] md:max-h-[35vh] lg:max-h-[40vh]';
  
  // Apply appropriate size classes based on context and custom className
  let sizeClasses = '';
  
  if (className) {
    // If custom class provided, use it but still apply some constraints for custom logos
    if (!isDefaultLogo) {
      sizeClasses = 'max-h-[40vh] max-w-[520px]'; // Add size constraints for custom logos
    }
  } else if (isHomePage) {
    // On home page without custom class
    sizeClasses = homePageSizeClasses;
  } else {
    // In navbar or other locations without custom class
    sizeClasses = navbarSizeClasses;
  }
  
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