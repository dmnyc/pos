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
    // For root-level pages like settings and about, go to home or wallet
    if (location.pathname === "/settings" || location.pathname === "/about") {
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
    <div className="navbar bg-black text-white h-14" data-theme={config.theme}>
      <div className="w-8 flex justify-start">
        <button
          className="text-gray-400 flex items-center justify-center h-8 w-8"
          onClick={handleBack}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="square" strokeLinejoin="miter" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="flex-1"></div>
      <div className="w-8"></div>
    </div>
  );
}