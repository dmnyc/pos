import { Invoice } from "@getalby/lightning-tools";
import QRCode from "qrcode.react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import useStore from "../../state/store";
import { getMerchantConfig } from "../../config";

export function Pay() {
  const { invoice } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { provider, setLastInvoiceData } = useStore();
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [hasCopied, setCopied] = useState(false);
  const [fiatAmount, setFiatAmount] = useState<string | null>(null);
  const isTipPayment = location.state?.isTipPayment || false;
  const config = getMerchantConfig();

  function copyQr() {
    try {
      if (!invoice) {
        return;
      }
      window.navigator.clipboard.writeText(invoice);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!provider) {
      return;
    }
    if (invoice) {
      const inv = new Invoice({ pr: invoice });
      const { satoshi, description } = inv;
      setAmount(satoshi);
      if (description) {
        setDescription(description);
        
        // Extract fiat amount from description if available
        // Format is typically "Store Name - $X.XX"
        const fiatMatch = description.match(/\s-\s(\$[\d,.]+)/);
        if (fiatMatch && fiatMatch[1]) {
          setFiatAmount(fiatMatch[1]);
        }
      }
      
      // Save invoice data for potential tip
      if (!isTipPayment) {
        // Get the current currency
        const currency = localStorage.getItem("pos:currency") || "SATS";
        setLastInvoiceData({ 
          amount: satoshi, 
          description,
          currency 
        });
      }

      const interval = setInterval(async () => {
        console.log("Checking invoice", invoice);
        const response = await provider.lookupInvoice({
          paymentRequest: invoice,
        });
        if (response.paid) {
          // Pass through whether this was a tip payment
          navigate("../paid", { state: { isTipPayment } });
        }
      }, 3000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [invoice, navigate, provider, setLastInvoiceData, isTipPayment]);

  if (!invoice) {
    return null;
  }

  // Simplify the description to just show the merchant name
  const merchantName = description.split(' -')[0] || config.name;

  return (
    <>
      {/* Use the same Navbar component as the New Payment page */}
      <Navbar />
      <div className="flex w-full h-full flex-col items-center justify-between bg-black text-white" data-theme={config.theme}>
        <div className="flex flex-col items-center justify-center w-full flex-1">
          {/* Main content section */}
          <div className="flex flex-1 flex-col items-center justify-center py-4">
            {/* Amount display - sats amount with smaller font for large numbers and smaller "sats" label */}
            <div className="flex items-baseline justify-center mb-2">
              <span className="text-4xl md:text-5xl font-mono tracking-wide">
                {new Intl.NumberFormat().format(amount)}
              </span>
              <span className="text-lg md:text-xl text-gray-400 ml-2 font-mono">
                sats
              </span>
            </div>
            
            {/* Show fiat amount if available - smaller than sats */}
            {fiatAmount && (
              <p className="text-xl text-gray-400 mb-4 font-mono">{fiatAmount}</p>
            )}
            
            {/* Merchant name */}
            <p className="text-sm text-gray-400 mb-6">{merchantName}</p>
            
            {/* QR Code */}
            <div 
              className="relative flex items-center justify-center p-4 bg-white rounded-lg mb-6" 
              onClick={copyQr}
            >
              <QRCode value={invoice} size={230} />
            </div>
            
            {/* Payment status */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {!hasCopied && <span className="loading loading-spinner loading-xs text-white mr-2"></span>}
              <p className="text-base">{hasCopied ? "Invoice Copied!" : "Waiting for payment..."}</p>
            </div>
            
            {/* Bottom section with smaller, red cancel button that matches the keypad delete button style */}
            <div className="w-full max-w-xs mx-auto mb-6">
              <button
                onClick={() => {
                  navigate("../new");
                }}
                className="btn bg-red-500 text-white hover:bg-red-600 active:bg-red-700 w-full h-10 sm:h-12 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}