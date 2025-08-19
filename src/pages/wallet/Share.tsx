import QRCode from "qrcode.react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMerchantConfig, getTipSettings } from "../../config";
import { localStorageKeys } from "../../constants";
import { PopiconsClipboardCheckDuotone, PopiconsClipboardDuotone } from "@popicons/react";
import { ExactBackButton } from "../../components/ExactBackButton";
import { useRequirePin } from "../../hooks/useRequirePin";
import { AlertModal } from "../../components/Modals";

export function Share() {
  useRequirePin(); // Add PIN protection

  const [shareURI, setShareURI] = useState("");
  const [copied, setCopied] = useState(false);
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const nwcUrl = window.localStorage.getItem(localStorageKeys.nwcUrl);
    if (nwcUrl) {
      const merchantConfig = getMerchantConfig();
      const tipSettings = getTipSettings();
      const currency = localStorage.getItem(localStorageKeys.currency) || "USD";

      // Create compressed configuration objec
      const configObject = {
        name: merchantConfig.name,
        logoUrl: merchantConfig.logoUrl,
        theme: merchantConfig.theme,
        currency: currency,
        paymentChime: merchantConfig.paymentChimeEnabled,
        tips: {
          enabled: tipSettings.enabled,
          percentages: tipSettings.defaultPercentages,
          allowCustom: tipSettings.allowCustom
        }
      };

      const nwcEncoded = btoa(nwcUrl);
      const configEncoded = btoa(JSON.stringify(configObject));

      // Generate URL compatible with HashRouter
      const baseUrl = window.location.origin + window.location.pathname;
      setShareURI(`${baseUrl}#/?nwc=${nwcEncoded}&config=${configEncoded}`);
    }
  }, []);

  function copy() {
    try {
      window.navigator.clipboard.writeText(shareURI);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      setAlertState({
        isOpen: true,
        title: 'Copy Failed',
        message: `Failed to copy: ${error}`
      });
    }
  }

  const handleBack = () => {
    navigate("../new");
  };

  return (
    <div className="h-full bg-black text-white" data-theme="dark">
      <ExactBackButton onBack={handleBack} />
      <div className="flex flex-grow gap-4 md:gap-6 lg:gap-8 flex-col justify-center items-center pt-16">
        <p className="text-sm md:text-base lg:text-lg">Scan to connect another device:</p>
        <div className="relative flex items-center justify-center p-4 md:p-5 lg:p-6 bg-white rounded-lg">
          <QRCode value={shareURI} size={240} className="md:hidden" />
          <QRCode value={shareURI} size={300} className="hidden md:block lg:hidden" />
          <QRCode value={shareURI} size={360} className="hidden lg:block" />
        </div>
        <p className="text-sm md:text-base lg:text-lg">or copy the link below:</p>
        <div className="flex border-2 border-gray-700 rounded-lg bg-gray-900 mb-2 w-full max-w-xs md:max-w-md lg:max-w-lg">
          <input
            type="text"
            value={shareURI}
            className="input overflow-ellipsis w-full text-xs md:text-sm lg:text-base bg-gray-900 text-white h-10 md:h-12 lg:h-14"
            readOnly
          />
          <div className="w-1 h-full border-l-gray-700 border-l-2"></div>
          <button className="p-4 md:p-5 lg:p-6 text-white" onClick={copy}>
            {copied ? (
              <PopiconsClipboardCheckDuotone className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            ) : (
              <PopiconsClipboardDuotone className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            )}
          </button>
        </div>
        {copied && (
          <p className="text-xs md:text-sm lg:text-base text-green-500 animate-pulse">Link copied to clipboard!</p>
        )}
      </div>

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
      />
    </div>
  );
}