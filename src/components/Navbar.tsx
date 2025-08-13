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
          <div tabIndex={0} role="button" className="btn btn-ghost btn-xs m-1 text-white p-0">
            <PopiconsLeftSidebarTopNavDuotone className="h-5 w-5" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-black rounded-box z-[1] w-52 p-2 shadow text-white"
          >
            <li key="share">
              <Link to="../share" className="text-white text-xs py-1">
                <PopiconsShareDuotone className="w-3 h-3" /> Share with a co-worker
              </Link>
            </li>
            <li key="settings">
              <Link to="/settings" className="text-white text-xs py-1">
                <PopiconsSettingsDuotone className="h-3 w-3" /> Settings
              </Link>
            </li>
            <li key="about">
              <Link to="/about" className="text-white text-xs py-1">
                <PopiconsBulbDuotone className="h-3 w-3" /> About {config.displayName}
              </Link>
            </li>
            <li key="logout">
              <Link
                to="/"
                onClick={(e) => {
                  if (!confirm("Are you sure you wish to log out? your wallet will be lost.")) {
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