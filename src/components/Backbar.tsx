import { PopiconsArrowLeftDuotone } from "@popicons/react";
import { To, useLocation, useNavigate } from "react-router-dom";
import { getMerchantConfig } from "../config";

type BackbarProps = {
  navigateTo?: string | -1;
};

export function Backbar({ navigateTo }: BackbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const config = getMerchantConfig();
  
  const handleBack = () => {
    // Check current location and handle it appropriately
    if (location.pathname === "/settings") {
      // If on settings page, go back to home or wallet
      const hasWallet = window.localStorage.getItem("pos:nwcUrl");
      if (hasWallet) {
        navigate("/wallet/new");
      } else {
        navigate("/");
      }
    } else {
      // For other pages, use the provided navigateTo or default to "../new"
      navigate((navigateTo as To) || "../new");
    }
  };
  
  return (
    <div className="navbar bg-black text-white" data-theme={config.theme}>
      <div className="flex-none">
        <button
          className="btn btn-ghost m-1 text-white"
          onClick={handleBack}
        >
          <PopiconsArrowLeftDuotone className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}