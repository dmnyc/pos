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

  const [showRawInvoice, setShowRawInvoice] = useState(false);

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

  function toggleRawInvoice() {
    setShowRawInvoice(!showRawInvoice);
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
      <div className="flex w-full h-[calc(100vh-40px)] md:h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] flex-col items-center justify-center bg-black text-white" data-theme={config.theme}>
        <div className="flex flex-col items-center justify-between w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto h-full py-4">
          {/* Flexible spacer at top */}
          <div className="flex-grow"></div>
          
          {/* Payment information block - all elements kept together as a single unit */}
          <div className="flex flex-col items-center justify-center">
            {/* Amount information */}
            <div className="text-center mb-3 md:mb-4 lg:mb-5">
              <div className="flex items-center justify-center">
                <span className="text-gray-400 text-sm md:text-base lg:text-lg mr-1 md:mr-2">
                  {isTipPayment ? "Tip amount:" : "Amount:"}
                </span>
                <span className="text-white text-base md:text-lg lg:text-xl font-medium">
                  {new Intl.NumberFormat().format(amount)} sats
                </span>
              </div>
              
              {/* Show fiat amount if available */}
              {fiatAmount && fiatAmount.length > 0 && (
                <p className="text-sm md:text-base lg:text-lg text-gray-400">
                  {fiatAmount}
                </p>
              )}
            </div>
            
            {/* Merchant name - with reduced margin as part of the unit */}
            <p className="text-sm md:text-base lg:text-lg text-gray-400 mb-4 md:mb-5 lg:mb-6">{merchantName}</p>
            
            {/* QR Code */}
            <div 
              className="relative flex items-center justify-center p-3 md:p-4 lg:p-5 bg-white rounded-lg mb-4 md:mb-5 lg:mb-6 cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={copyQr}
            >
              {/* Tap to copy indicator */}
              <div className="absolute top-0 right-0 left-0 bg-black bg-opacity-70 text-white text-xs md:text-sm text-center py-1 rounded-t-lg">
                Tap to copy invoice
              </div>
              
              <QRCode value={invoice} size={180} className="md:hidden" />
              <QRCode value={invoice} size={240} className="hidden md:block lg:hidden" />
              <QRCode value={invoice} size={300} className="hidden lg:block" />
            </div>
            
            {/* Payment status and countdown timer */}
            <div className="flex flex-col items-center gap-0 md:gap-1 mb-2 md:mb-3 lg:mb-4">
              <div className="flex items-center justify-center">
                {!hasCopied && <span className="loading loading-spinner loading-xs md:loading-sm text-white mr-1 md:mr-2"></span>}
                <p className="text-sm md:text-base lg:text-lg">{hasCopied ? "Invoice Copied!" : "Waiting for payment..."}</p>
              </div>
              <div className="text-sm md:text-base lg:text-lg text-gray-400">
                Expires in: <span className="font-mono">{formatTime(countdown)}</span>
              </div>
              
              {/* Toggle raw invoice for testing */}
              <button 
                className="mt-2 text-xs text-gray-500 hover:text-gray-300 underline"
                onClick={toggleRawInvoice}
              >
                {showRawInvoice ? "Hide invoice details" : "Show invoice details"}
              </button>
              
              {/* Raw invoice display for testing */}
              {showRawInvoice && (
                <div className="mt-2 w-full max-w-xs md:max-w-md px-2">
                  <div className="bg-gray-900 border border-gray-700 rounded p-2 w-full">
                    <p className="text-gray-400 text-xs mb-1">Invoice (tap to copy):</p>
                    <div 
                      className="text-gray-300 text-xs font-mono break-all cursor-pointer p-1 hover:bg-gray-800 rounded" 
                      onClick={copyQr}
                    >
                      {invoice.substring(0, 30)}...{invoice.substring(invoice.length - 30)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Flexible spacer at bottom */}
          <div className="flex-grow"></div>
          
          {/* Cancel button at bottom */}
          <div className="w-full">
            <button
              onClick={() => {
                navigate("../new");
              }}
              className="btn bg-red-500 text-white hover:bg-red-600 active:bg-red-700 w-full h-8 md:h-10 lg:h-12 text-sm md:text-base lg:text-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}