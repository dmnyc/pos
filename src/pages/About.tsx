import { useNavigate } from "react-router-dom";
import { getMerchantConfig } from "../config";
import { ExactBackButton } from "../components/ExactBackButton";

export function About() {
  const config = getMerchantConfig();
  const navigate = useNavigate();
  
  const handleBack = () => {
    const hasWallet = window.localStorage.getItem("pos:nwcUrl");
    if (hasWallet) {
      navigate("/wallet/new");
    } else {
      navigate("/");
    }
  };
  
  return (
    <div className="h-full bg-black text-white" data-theme="dark">
      <ExactBackButton onBack={handleBack} />
      <div className="flex flex-grow gap-4 flex-col justify-center items-center pt-16">
        <h1 className="text-3xl font-bold">{config.displayName}</h1>
        <p className="text-center text-sm">{config.description}</p>
        <div className="text-center">
          <p className="mb-3 text-sm">
            Sats Factory POS ⚡️🏭 is powered by Nostr Wallet Connect. 
          </p>
          <p className="mb-3 text-sm">
            Based on the open-source Lightning POS by Alby. 🐝💜
          </p>
          <p className="mb-3 text-xs">
            <a href="https://satsfactory.com" className="text-gray-600 hover:text-gray-500">satsfactory.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}