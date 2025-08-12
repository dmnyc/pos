import { Link } from "react-router-dom";
import { MerchantLogo } from "./MerchantLogo";
import {
  PopiconsBulbDuotone,
  PopiconsLeftSidebarTopNavDuotone,
  PopiconsLogoutDuotone,
  PopiconsShareDuotone,
  PopiconsSettingsDuotone,
} from "@popicons/react";
import { localStorageKeys } from "../config";
import { getMerchantConfig } from "../config";

export function Navbar() {
  const config = getMerchantConfig();
  
  return (
    <div className="navbar bg-black text-white" data-theme="dark">
      {/* Left section with menu button */}
      <div className="w-10 flex justify-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-sm m-1 text-white">
            <PopiconsLeftSidebarTopNavDuotone className="h-6 w-6" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-black rounded-box z-[1] w-60 p-2 shadow text-white"
          >
            <li key="share">
              <Link to="../share" className="text-white">
                <PopiconsShareDuotone className="w-4 h-4" /> Share with a co-worker
              </Link>
            </li>
            <li key="settings">
              <Link to="/settings" className="text-white">
                <PopiconsSettingsDuotone className="h-4 w-4" /> Settings
              </Link>
            </li>
            <li key="about">
              <Link to="/about" className="text-white">
                <PopiconsBulbDuotone className="h-4 w-4" /> About {config.displayName}
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
                className="text-red-500"
              >
                <PopiconsLogoutDuotone className="h-4 w-4" /> Log out
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Center section with logo - smaller size, matches screenshot */}
      <div className="flex-1 flex justify-center">
        <MerchantLogo style={{ height: '30px', width: 'auto', maxWidth: '160px' }} />
      </div>
      
      {/* Empty space to balance the navbar */}
      <div className="w-10"></div>
    </div>
  );
}