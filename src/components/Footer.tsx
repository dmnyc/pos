import React from 'react';
import { VersionLabel } from './utility/VersionLabel';

export function Footer() {
  const handleRefresh = () => {
    // Add cache-busting parameter but keep all other query params
    const url = new URL(window.location.href);
    url.searchParams.set('refresh', Date.now().toString());
    window.location.href = url.toString();
  };

  return (
    <div className="mb-4 md:mb-6 lg:mb-8 flex flex-col w-full justify-center items-center text-gray-400 px-4 text-center">
      <span className="block text-sm md:text-base lg:text-lg">Sats Factory POS ⚡️🏭 is powered by Alby & NWC. 🐝💜</span>
      <div className="flex items-center mt-1">
        <VersionLabel showPrefix={true} showBuild={true} />
        <button 
          onClick={handleRefresh} 
          className="ml-2 text-xs opacity-50 hover:opacity-100 focus:outline-none transition-opacity"
          aria-label="Refresh application"
          title="Refresh application"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}