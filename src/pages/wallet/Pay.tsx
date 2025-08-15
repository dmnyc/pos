import { Invoice } from "@getalby/lightning-tools";
import QRCode from "qrcode.react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import useStore from "../../state/store";
import { getMerchantConfig } from "../../config";
import { fiat } from "@getalby/lightning-tools";

export function Pay() {
  const { invoice } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { provider, setLastInvoiceData } = useStore();
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [hasCopied, setCopied] = useState(false);
  const [fiatAmount, setFiatAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [calculatedFiatAmount, setCalculatedFiatAmount] = useState<string>("");
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

  // Copy the full invoice when clicking on the raw invoice display
  function copyFullInvoice() {
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
    // Load currency from localStorage
    const savedCurrency = localStorage.getItem("pos:currency");
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  useEffect(() => {
    // Calculate fiat amount if using fiat currency and no fiat amount from description
    const calculateFiatAmount = async () => {
      if (currency !== "SATS" && amount > 0 && !fiatAmount) {
        try {
          // Get the exchange rate (how many sats per unit of currency)
          const satsPerUnit = await fiat.getSatoshiValue({ amount: 1, currency });
          // Convert sats to fiat (amount in sats / sats per unit)
          const fiatValue = amount / satsPerUnit;
          const formatted = new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: currency 
          }).format(fiatValue);
          setCalculatedFiatAmount(formatted);
        } catch (error) {
          console.error("Error calculating fiat amount:", error);
        }
      }
    };

    calculateFiatAmount();
  }, [amount, currency, fiatAmount]);

  useEffect(() => {
    if (!provider) {
      return;
    }
    if (invoice) {
      const inv = new Invoice({ pr: invoice });
      const { satoshi, description } = inv;
      // Ensure amount is parsed as a number
      const parsedAmount = parseInt(satoshi.toString(), 10);
      setAmount(parsedAmount);
      
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
        try {
          const response = await provider.lookupInvoice({
            paymentRequest: invoice,
          });
          if (response.paid) {
            clearInterval(paymentCheckInterval);
            navigate("../paid", { state: { isTipPayment } });
          }
        } catch (error) {
          // Silent fail - will retry on next interval
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
                  {new Intl.NumberFormat().format(amount)} {parseInt(amount.toString(), 10) === 1 ? "sat" : "sats"}
                </span>
              </div>
              
              {/* Show fiat amount if available or calculated */}
              {((fiatAmount && fiatAmount.length > 0) || (calculatedFiatAmount && currency !== "SATS")) && (
                <p className="text-sm md:text-base lg:text-lg text-gray-400">
                  {fiatAmount || calculatedFiatAmount}
                </p>
              )}
            </div>
            
            {/* Merchant name - with reduced margin as part of the unit */}
            <p className="text-sm md:text-base lg:text-lg text-gray-400 mb-4 md:mb-5 lg:mb-6">{merchantName}</p>
            
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div 
                className="flex items-center justify-center p-3 md:p-4 lg:p-5 bg-white rounded-lg cursor-pointer hover:shadow-lg transition-shadow mb-4 md:mb-5 lg:mb-6" 
                onClick={copyQr}
              >
                <QRCode value={invoice} size={180} className="md:hidden" />
                <QRCode value={invoice} size={240} className="hidden md:block lg:hidden" />
                <QRCode value={invoice} size={300} className="hidden lg:block" />
              </div>
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
                className="mt-2 text-xs text-gray-500 hover:text-gray-300"
                onClick={toggleRawInvoice}
              >
                {showRawInvoice ? "Hide invoice details" : "Show invoice details"}
              </button>
              
              {/* Raw invoice display for testing */}
              {showRawInvoice && (
                <div className="mt-2 w-full max-w-xs md:max-w-md px-2">
                  <div className="bg-gray-900 border border-gray-700 rounded p-2 w-full">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-gray-400 text-xs">Lightning Invoice:</p>
                      <button
                        className="text-xs bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1 flex items-center"
                        onClick={copyFullInvoice}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy
                      </button>
                    </div>
                    <div className="text-gray-300 text-xs font-mono break-all p-1 bg-gray-800 rounded max-h-20 overflow-y-auto">
                      {invoice}
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