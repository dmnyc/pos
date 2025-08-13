import { Link } from "react-router-dom";
import { MerchantLogo } from "./MerchantLogo";
import {
  PopiconsBulbDuotone,
  PopiconsLeftSidebarTopNavDuotone,
  PopiconsLogoutDuotone,
  PopiconsShareDuotone,
  PopiconsSettingsDuotone,
} from "@popicons/react";
import { localStorageKeys, getMerchantConfig } from "../config";

export function Navbar() {
  const config = getMerchantConfig();
  
  return (
    <div className="navbar bg-black text-white h-10" data-theme={config.theme}>
      {/* Left section with menu button */}
      <div className="w-8 flex justify-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="text-gray-400 flex items-center justify-center h-8 w-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-black rounded-box z-[1] w-36 p-2 shadow text-white"
          >
            <li key="share">
              <Link to="../share" className="text-white text-xs py-1">
                <PopiconsShareDuotone className="w-3 h-3" /> Share
              </Link>
            </li>
            <li key="settings">
              <Link to="/settings" className="text-white text-xs py-1">
                <PopiconsSettingsDuotone className="h-3 w-3" /> Settings
              </Link>
            </li>
            <li key="about">
              <Link to="/about" className="text-white text-xs py-1">
                <PopiconsBulbDuotone className="h-3 w-3" /> About
              </Link>
            </li>
            <li key="logout">
              <Link
                to="/"
                onClick={(e) => {
                  if (!confirm("Are you sure you wish to log out? Your POS connection will be lost.")) {
                    e.preventDefault();
                    return;
                  }
                  window.localStorage.removeItem(localStorageKeys.nwcUrl);
                }}
                className="text-red-500 text-xs py-1"
              >
                <PopiconsLogoutDuotone className="h-3 w-3" /> Log out
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Center section with logo - smaller size */}
      <div className="flex-1 flex justify-center">
        <MerchantLogo style={{ height: '24px', width: 'auto', maxWidth: '140px' }} />
      </div>
      
      {/* Empty space to balance the navbar */}
      <div className="w-8"></div>
    </div>
  );
}