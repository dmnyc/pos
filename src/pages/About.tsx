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
      <div className="flex flex-grow gap-4 md:gap-6 lg:gap-8 flex-col justify-center items-center pt-28 pb-16">
        <img
          src="/images/satsfactory_logo.svg"
          alt="Sats Factory Logo"
          className="w-36 md:w-48 lg:w-60 mx-auto mb-4 md:mb-6 lg:mb-8"
        />
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{config.displayName}</h1>
        <p className="text-center text-sm md:text-base lg:text-lg">{config.description}</p>
        <div className="text-center max-w-xs md:max-w-md lg:max-w-lg px-4">
          <p className="mb-3 md:mb-4 lg:mb-5 text-sm md:text-base lg:text-lg">
            Sats Factory POS ⚡️🏭 is powered by Nostr Wallet Connect (NWC). 
          </p>
          <p className="mb-3 md:mb-4 lg:mb-5 text-sm md:text-base lg:text-lg">
            Based on BuzzPay, the open-source Lightning POS by Alby. 🐝💜
          </p>
          <p className="mb-8 text-xs md:text-sm lg:text-base">
            <a href="https://satsfactory.com" className="text-gray-600 hover:text-gray-500">satsfactory.com</a>
          </p>

          <hr className="border-gray-800 w-full max-w-md mx-auto mb-8" />

          <div className="text-left max-w-2xl mx-auto space-y-4 text-gray-300 py-4">
            <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-6">Our Story</h2>
            
            <p>
              Sats Factory POS was born from a clear need in the bitcoin payments space: the lack of accessible, 
              non-custodial Lightning Network point-of-sale systems for small businesses.
            </p>

            <h3 className="text-lg font-semibold text-white mt-6">Breaking Down Barriers</h3>
            <p>
              Traditional Lightning POS systems often require small businesses to commit to recurring monthly fees before 
              they can even gauge their bitcoin-paying customer base. We're changing that by eliminating subscription 
              fees and providing flexible backend options that work for businesses of any size.
            </p>

            <h3 className="text-lg font-semibold text-white mt-6">True Flexibility</h3>
            <p>
              Businesses can choose their preferred wallet setup:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Run their own Lightning node</li>
              <li>Use a standalone Alby Hub</li>
              <li>Connect any NWC-compatible wallet</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-6">Rethinking Tipping</h3>
            <p>
              We've taken a more respectful approach to digital tipping, addressing common issues with modern POS systems that rely on tip shaming and pressure tactics:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Tips are truly optional, not demanded</li>
              <li>No manipulative inconsistent tip ordering</li>
              <li>Clear separation between payment and gratuity</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-6">Bitcoin-Native Design</h3>
            <p>
              Our tipping system is designed around bitcoin's push-payment nature. Tips are handled as separate, 
              optional transactions after the main payment. This approach:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Respects customer choice</li>
              <li>Makes accounting easier with clearly labeled tip transactions</li>
              <li>Aligns with bitcoin's trustless principles</li>
            </ul>

            <p className="mt-6 italic">
              This is our vision for commerce on a bitcoin standard - transparent, respectful, and truly optional tipping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;