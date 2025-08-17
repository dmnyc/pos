import { Link, useNavigate, useLocation } from "react-router-dom";
import { MerchantLogo } from "./MerchantLogo";
import { ConfirmModal } from "./Modals";
import {
  PopiconsBulbDuotone,
  PopiconsLogoutDuotone,
  PopiconsShareDuotone,
  PopiconsSettingsDuotone,
  PopiconsKeyDuotone,
  PopiconsFileDuotone,
  PopiconsHeartDuotone, // Still needed for the menu item
} from "@popicons/react";
import { localStorageKeys, getMerchantConfig } from "../config";
import { verifyPin } from "../utils/pinUtils";
import { useState, useRef, useEffect } from "react";
import { getNavbarHeightClasses, getNavbarMinHeightClasses } from "../utils/layoutConstants";

export function Navbar() {
  const config = getMerchantConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLogout = async () => {
    const verified = await verifyPin();
    if (verified) {
      // Clear wallet connection and security PIN
      window.localStorage.removeItem(localStorageKeys.nwcUrl);
      window.localStorage.removeItem('pos_pin');

      // APPROACH 1: Completely remove merchant config (will use default on next load)
      window.localStorage.removeItem(localStorageKeys.merchantConfig);

      // APPROACH 2: Or reset it to default (keeping the name)
      // const currentConfig = getMerchantConfig();
      // const resetConfig = {
      //   ...defaultMerchantConfig,
      //   name: currentConfig.name // Keep just the merchant name
      // };
      // saveMerchantConfig(resetConfig);

      handleMenuItemClick();
      navigate('/');
    }
  };

  return (
    <div className={`navbar bg-black text-white ${getNavbarHeightClasses()} px-0`} data-theme={config.theme}>
      {/* Left section with menu button */}
      <div className="w-10 md:w-12 lg:w-16 wide:w-16 flex justify-center items-center">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="text-gray-400 flex items-center justify-center h-8 w-8 md:h-8 md:w-8 lg:h-10 lg:w-10 wide:h-10 wide:w-10 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 wide:h-6 wide:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {isOpen && (
            <ul className="absolute top-full left-0 mt-1 menu bg-black rounded-box z-[1] w-48 md:w-56 lg:w-64 wide:w-64 p-2 md:p-3 shadow text-white">
              <li key="settings">
                <Link to="/settings" className="text-white text-base md:text-lg wide:text-lg py-3 flex items-center" onClick={handleMenuItemClick}>
                  <PopiconsSettingsDuotone className="h-4 w-4 md:w-5 md:h-5 wide:w-5 wide:h-5 mr-2 md:mr-3" /> Settings
                </Link>
              </li>
              <li key="share">
                <Link to="../share" className="text-white text-base md:text-lg wide:text-lg py-3 flex items-center" onClick={handleMenuItemClick}>
                  <PopiconsShareDuotone className="w-4 h-4 md:w-5 md:h-5 wide:w-5 wide:h-5 mr-2 md:mr-3" /> Share
                </Link>
              </li>
              <li key="tiponly">
                <Link to="../tiponly" className="text-white text-base md:text-lg wide:text-lg py-3 flex items-center" onClick={handleMenuItemClick}>
                  <PopiconsHeartDuotone className="w-4 h-4 md:w-5 md:h-5 wide:w-5 wide:h-5 mr-2 md:mr-3" /> Tip Only
                </Link>
              </li>
              <li key="security">
                <Link to="/security/status" className="text-white text-base md:text-lg wide:text-lg py-3 flex items-center" onClick={handleMenuItemClick}>
                  <PopiconsKeyDuotone className="h-4 w-4 md:w-5 md:h-5 wide:w-5 wide:h-5 mr-2 md:mr-3" /> Security
                </Link>
              </li>
              <li key="about">
                <Link to="/about" className="text-white text-base md:text-lg wide:text-lg py-3 flex items-center" onClick={handleMenuItemClick}>
                  <PopiconsBulbDuotone className="h-4 w-4 md:w-5 md:h-5 wide:w-5 wide:h-5 mr-2 md:mr-3" /> About
                </Link>
              </li>
              <li key="disclaimers">
                <Link to="/disclaimers" className="text-white text-base md:text-lg wide:text-lg py-3 flex items-center" onClick={handleMenuItemClick}>
                  <PopiconsFileDuotone className="h-4 w-4 md:w-5 md:h-5 wide:w-5 wide:h-5 mr-2 md:mr-3" /> Disclaimers
                </Link>
              </li>
              <li key="logout" className="mt-1 border-t border-gray-800 pt-1">
                <button
                  onClick={() => setLogoutConfirmOpen(true)}
                  className="w-full text-left text-red-500 text-base md:text-lg wide:text-lg py-3 flex items-center"
                >
                  <PopiconsLogoutDuotone className="h-4 w-4 md:w-5 md:h-5 wide:w-5 wide:h-5 mr-2 md:mr-3" /> Log out
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Center section with logo */}
      <div className={`flex-1 flex justify-center items-center ${getNavbarMinHeightClasses()}`}>
        <MerchantLogo />
      </div>

      {/* Right section with heart icon for Tip Only */}
      <div className="w-10 md:w-12 lg:w-16 wide:w-16 flex justify-center items-center">
        {location.pathname !== "/wallet/tiponly" ? (
          <Link
            to="../tiponly"
            className="group flex items-center justify-center h-8 w-8 md:h-8 md:w-8 lg:h-10 lg:w-10 wide:h-10 wide:w-10 focus:outline-none transition-all"
            aria-label="Tip Only"
          >
            <svg viewBox="0 0 512 512" className="h-5 w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 wide:h-6 wide:w-6">
              <path fill="#444444" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
              <path fill="#666666" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </svg>
          </Link>
        ) : (
          <div className="relative flex items-center justify-center">
            <span className="absolute right-full whitespace-nowrap mr-1.5 text-[10px] md:text-xs lg:text-xs wide:text-sm text-[#e5e7eb] self-center font-bold">Tip Only</span>
            <Link
              to="../new"
              className="group flex items-center justify-center h-8 w-8 md:h-8 md:w-8 lg:h-10 lg:w-10 wide:h-10 wide:w-10 focus:outline-none transition-all"
              aria-label="Exit Tip Only"
            >
              <svg viewBox="0 0 512 512" className="h-5 w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 wide:h-6 wide:w-6">
                <path fill="#ef4445" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                <path fill="#cc3333" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you wish to log out? Your POS connection will be lost."
        confirmText="Log Out"
        isDanger
      />
    </div>
  );
}