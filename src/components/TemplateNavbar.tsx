import { getMerchantConfig } from "../config";
import { getNavbarHeightClasses, getNavbarMinHeightClasses } from "../utils/layoutConstants";
import { SessionTimeoutIndicator } from "./SessionTimeoutIndicator";

interface TemplateNavbarProps {
  onBack: () => void;
}

export function TemplateNavbar({ onBack }: TemplateNavbarProps) {
  const config = getMerchantConfig();

  return (
    <div className={`navbar bg-black text-white ${getNavbarHeightClasses()} px-0 mt-2 ml-2 w-full max-w-full overflow-x-hidden`} data-theme={config.theme}>
      {/* Left section with back button and session indicator - matching exact Navbar structure */}
      <div className="flex items-center justify-start pl-2 md:pl-3 lg:pl-4 wide:pl-4 w-20 md:w-24 lg:w-28 wide:w-28">
        <div className="relative">
          <button
            onClick={onBack}
            className="text-gray-400 flex items-center justify-center h-8 w-8 md:h-8 md:w-8 lg:h-10 lg:w-10 wide:h-10 wide:w-10 focus:outline-none"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 wide:h-6 wide:w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <path strokeLinecap="square" strokeLinejoin="miter" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        {/* Session timeout indicator positioned right of back button */}
        <SessionTimeoutIndicator inline className="ml-2" />
      </div>

      {/* Center section - empty to match Navbar structure but without logo */}
      <div className={`flex-1 flex justify-center items-center ${getNavbarMinHeightClasses()}`}>
        {/* Empty center section */}
      </div>

      {/* Right section - empty to match Navbar width structure */}
      <div className="w-20 md:w-24 lg:w-28 wide:w-28 flex justify-center items-center">
        {/* Empty right section */}
      </div>
    </div>
  );
}