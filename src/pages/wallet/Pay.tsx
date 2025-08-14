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
  const [fiatAmount, setFiatAmount] = useState<string>("");
  const isTipPayment = location.state?.isTipPayment || false;
  // Safely convert passedFiatAmount to string or empty string
  const passedFiatAmount = location.state?.fiatAmount ? String(location.state.fiatAmount) : "";
  const config = getMerchantConfig();
  const [countdown, setCountdown] = useState(180); // 3 minutes in seconds

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

  // Format the countdown time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (!provider) {
      return;
    }
    if (invoice) {
      const inv = new Invoice({ pr: invoice });
      const { satoshi, description } = inv;
      setAmount(satoshi);
      
      // Set description and determine fiat amount
      if (description) {
        setDescription(description);
        
        // For tip payments, use the fiat amount passed through navigation state if available
        if (isTipPayment && passedFiatAmount.length > 0) {
          setFiatAmount(passedFiatAmount);
        } else {
          // Otherwise, extract fiat amount from description if available (regular payments)
          // Format is typically "Store Name - $X.XX"
          const fiatMatch = description.match(/\s-\s(\$[\d,.]+|\w+\s[\d,.]+)/);
          if (fiatMatch && fiatMatch[1]) {
            setFiatAmount(fiatMatch[1]);
          }
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

      // Check invoice status every 3 seconds
      const paymentCheckInterval = setInterval(async () => {
        console.log("Checking invoice", invoice);
        try {
          const response = await provider.lookupInvoice({
            paymentRequest: invoice,
          });
          if (response.paid) {
            // Clear both intervals when paid
            clearInterval(paymentCheckInterval);
            // Pass through whether this was a tip payment
            navigate("../paid", { state: { isTipPayment } });
          }
        } catch (error) {
          console.error("Error checking invoice:", error);
        }
      }, 3000);
      
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            // Clear both intervals when countdown ends
            clearInterval(countdownInterval);
            clearInterval(paymentCheckInterval);
            // Navigate back to new payment screen
            navigate("../new");
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);

      return () => {
        clearInterval(paymentCheckInterval);
        clearInterval(countdownInterval);
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
      <div className="flex w-full h-[calc(100vh-32px)] flex-col items-center justify-between bg-black text-white overflow-hidden" data-theme={config.theme}>
        <div className="flex flex-col items-center justify-center w-full flex-1">
          {/* Main content section - more compact */}
          <div className="flex flex-1 flex-col items-center justify-center py-1">
            {/* Amount display - more compact */}
            <div className="text-center mb-2">
              <div className="flex items-center justify-center">
                <span className="text-gray-400 text-xs mr-1">
                  {isTipPayment ? "Tip amount:" : "Amount:"}
                </span>
                <span className="text-white text-sm font-medium">
                  {new Intl.NumberFormat().format(amount)} sats
                </span>
              </div>
              
              {/* Show fiat amount if available */}
              {fiatAmount && fiatAmount.length > 0 && (
                <p className="text-xs text-gray-400">
                  {fiatAmount}
                </p>
              )}
            </div>
            
            {/* Merchant name */}
            <p className="text-xs text-gray-400 mb-1">{merchantName}</p>
            
            {/* QR Code - reduced size */}
            <div 
              className="relative flex items-center justify-center p-2 bg-white rounded-lg mb-2" 
              onClick={copyQr}
            >
              <QRCode value={invoice} size={180} />
            </div>
            
            {/* Payment status and countdown timer - reduced spacing */}
            <div className="flex flex-col items-center gap-0 mb-2">
              <div className="flex items-center justify-center">
                {!hasCopied && <span className="loading loading-spinner loading-xs text-white mr-1"></span>}
                <p className="text-xs">{hasCopied ? "Invoice Copied!" : "Waiting for payment..."}</p>
              </div>
              <div className="text-xs text-gray-400">
                Expires in: <span className="font-mono">{formatTime(countdown)}</span>
              </div>
            </div>
            
            {/* Bottom section with smaller, red cancel button */}
            <div className="w-full max-w-xs mx-auto mb-1 flex-shrink-0">
              <button
                onClick={() => {
                  navigate("../new");
                }}
                className="btn bg-red-500 text-white hover:bg-red-600 active:bg-red-700 w-full h-7 text-sm"
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