import { Link } from "react-router-dom";
import { MerchantLogo } from "./MerchantLogo";
import {
  PopiconsBulbDuotone,
  PopiconsLogoutDuotone,
  PopiconsShareDuotone,
  PopiconsSettingsDuotone,
} from "@popicons/react";
import { localStorageKeys, getMerchantConfig } from "../config";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const config = getMerchantConfig();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Toggle the dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Close the dropdown when a menu item is clicked
  const handleMenuItemClick = () => {
    setIsOpen(false);
  };
  
  return (
    <div className="navbar bg-black text-white h-10 px-0" data-theme={config.theme}>
      {/* Left section with menu button */}
      <div className="w-8 flex justify-center items-center">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={toggleDropdown}
            className="text-gray-400 flex items-center justify-center h-6 w-6 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {isOpen && (
            <ul className="absolute top-full left-0 mt-1 menu bg-black rounded-box z-[1] w-48 p-2 shadow text-white">
              <li key="share">
                <Link to="../share" className="text-white text-base py-3 flex items-center" onClick={handleMenuItemClick}>
                  <PopiconsShareDuotone className="w-4 h-4 mr-2" /> Share
                </Link>
              </li>
              <li key="settings">
                <Link to="/settings" className="text-white text-base py-3 flex items-center" onClick={handleMenuItemClick}>
                  <PopiconsSettingsDuotone className="h-4 w-4 mr-2" /> Settings
                </Link>
              </li>
              <li key="about">
                <Link to="/about" className="text-white text-base py-3 flex items-center" onClick={handleMenuItemClick}>
                  <PopiconsBulbDuotone className="h-4 w-4 mr-2" /> About
                </Link>
              </li>
              <li key="logout" className="mt-1">
                <Link
                  to="/"
                  onClick={(e) => {
                    if (!confirm("Are you sure you wish to log out? Your POS connection will be lost.")) {
                      e.preventDefault();
                      return;
                    }
                    window.localStorage.removeItem(localStorageKeys.nwcUrl);
                    handleMenuItemClick();
                  }}
                  className="text-red-500 text-base py-3 flex items-center"
                >
                  <PopiconsLogoutDuotone className="h-4 w-4 mr-2" /> Log out
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
      
      {/* Center section with logo */}
      <div className="flex-1 flex justify-center items-center min-h-[40px]">
        <MerchantLogo style={{ height: '20px', width: 'auto', maxWidth: '140px' }} />
      </div>
      
      {/* Empty space to balance the navbar */}
      <div className="w-8"></div>
    </div>
  );
}