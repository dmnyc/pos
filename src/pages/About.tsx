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
      <div className="flex flex-grow gap-4 md:gap-6 lg:gap-8 flex-col justify-center items-center pt-16">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{config.displayName}</h1>
        <p className="text-center text-sm md:text-base lg:text-lg">{config.description}</p>
        <div className="text-center max-w-xs md:max-w-md lg:max-w-lg px-4">
          <p className="mb-3 md:mb-4 lg:mb-5 text-sm md:text-base lg:text-lg">
            Sats Factory POS ⚡️🏭 is powered by Nostr Wallet Connect (NWC). 
          </p>
          <p className="mb-3 md:mb-4 lg:mb-5 text-sm md:text-base lg:text-lg">
            Based on BuzzPay, the open-source Lightning POS by Alby. 🐝💜
          </p>
          <p className="mb-3 md:mb-4 lg:mb-5 text-xs md:text-sm lg:text-base">
            <a href="https://satsfactory.com" className="text-gray-600 hover:text-gray-500">satsfactory.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}