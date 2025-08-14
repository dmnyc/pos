import QRCode from "qrcode.react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { localStorageKeys } from "../../config";
import { PopiconsClipboardCheckDuotone, PopiconsClipboardDuotone } from "@popicons/react";
import { ExactBackButton } from "../../components/ExactBackButton";

export function Share() {
  const [shareURI, setShareURI] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const nwcUrl = window.localStorage.getItem(localStorageKeys.nwcUrl);
    if (nwcUrl) {
      console.log("Restoring wallet URL", nwcUrl);
      const nwcEncoded = btoa(nwcUrl);
      setShareURI(
        window.location.href.replace(
          "/wallet/share",
          `?nwc=${nwcEncoded}&name=${localStorage.getItem(localStorageKeys.label) || ""}&currency=${localStorage.getItem(localStorageKeys.currency) || "USD"}`
        )
      );
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
      alert("Failed to copy: " + error);
    }
  }
  
  const handleBack = () => {
    navigate("../new");
  };

  return (
    <div className="h-full bg-black text-white" data-theme="dark">
      <ExactBackButton onBack={handleBack} />
      <div className="flex flex-grow gap-4 flex-col justify-center items-center pt-16">
        <p className="text-sm">Scan to connect another device:</p>
        <div className="relative flex items-center justify-center p-4 bg-white">
          <QRCode value={shareURI} size={240} />
        </div>
        <p className="text-sm">or copy the link below:</p>
        <div className="flex border-2 border-gray-700 rounded-lg bg-gray-900 mb-2">
          <input
            type="text"
            value={shareURI}
            className="input overflow-ellipsis w-full max-w-xs text-xs bg-gray-900 text-white"
            readOnly
          />
          <div className="w-1 h-full border-l-gray-700 border-l-2"></div>
          <button className="p-4 text-white" onClick={copy}>
            {copied ? (
              <PopiconsClipboardCheckDuotone className="w-4 h-4" />
            ) : (
              <PopiconsClipboardDuotone className="w-4 h-4" />
            )}
          </button>
        </div>
        {copied && (
          <p className="text-xs text-green-500 animate-pulse">Link copied to clipboard!</p>
        )}
      </div>
    </div>
  );
}