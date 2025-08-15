import React from 'react';
import { getMerchantConfig } from '../config';
import { getFullHeightClasses } from '../utils/layoutConstants';

type Props = {
  children: React.ReactNode;
  className?: string;
  justify?: 'center' | 'start' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'center' | 'start' | 'end' | 'stretch' | 'baseline';
};

/**
 * PageContainer component for consistent layout across all pages
 * Automatically sets the correct height based on navbar size at different breakpoints
 * 
 * @param children - Content to display inside the container
 * @param className - Additional classes to apply to the container
 * @param justify - Justification of content (default: 'center')
 * @param align - Alignment of content (default: 'center')
 */
export function PageContainer({ 
  children, 
  className = '', 
  justify = 'center',
  align = 'center'
}: Props) {
  const config = getMerchantConfig();

  // Map justify and align props to Tailwind classes
  const justifyClass = {
    'center': 'justify-center',
    'start': 'justify-start',
    'end': 'justify-end',
    'between': 'justify-between',
    'around': 'justify-around',
    'evenly': 'justify-evenly'
  }[justify];

  const alignClass = {
    'center': 'items-center',
    'start': 'items-start',
    'end': 'items-end',
    'stretch': 'items-stretch',
    'baseline': 'items-baseline'
  }[align];
  
  return (
    <div 
      className={`flex w-full ${getFullHeightClasses()} flex-col ${justifyClass} ${alignClass} bg-black text-white ${className}`}
      data-theme={config.theme}
    >
      {children}
    </div>
  );
}