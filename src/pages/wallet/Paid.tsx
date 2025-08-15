import { PopiconsCircleCheckDuotone } from "@popicons/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useStore from "../../state/store";
import { getMerchantConfig } from "../../config";
import { Navbar } from "../../components/Navbar";
import { playPaymentChime } from "../../utils/audioUtils";

export function Paid() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lastInvoiceData } = useStore();
  const [showTipButton, setShowTipButton] = useState(true);
  const config = getMerchantConfig();
  
  // Check if we're coming from a tip payment
  useEffect(() => {
    // If this payment was a tip, don't show the tip button
    const isTipPayment = location.state?.isTipPayment || false;
    setShowTipButton(!isTipPayment);
    
    // Play payment chime if enabled
    if (config.paymentChimeEnabled) {
      // Small delay to ensure page has loaded
      setTimeout(() => {
        playPaymentChime();
      }, 300);
    }
  }, [location, config.paymentChimeEnabled]);

  const handleTip = () => {
    if (lastInvoiceData) {
      try {
        // Include the currently selected currency when navigating to tip page
        const currency = localStorage.getItem("pos:currency") || "USD";
        
        // Add currency to the invoice data
        const tipData = {
          ...lastInvoiceData,
          currency
        };
        
        console.log("Passing tip data:", tipData);
        
        // Encode the invoice data so we can pass it to the tip page
        const encodedData = btoa(JSON.stringify(tipData));
        navigate(`../tip/${encodedData}`);
      } catch (error) {
        console.error("Error preparing tip data:", error);
        // If there's an error, still try to navigate to the tip page
        navigate('../tip/eyJhbW91bnQiOjEwMDAsImRlc2NyaXB0aW9uIjoiVGVzdCIsImN1cnJlbmN5IjoiVVNEIn0=');
      }
    } else {
      console.log("No invoice data available, using fallback");
      // Fallback with some default data if lastInvoiceData is null
      const fallbackData = {
        amount: 1000,
        description: "Payment",
        currency: "USD"
      };
      const encodedData = btoa(JSON.stringify(fallbackData));
      navigate(`../tip/${encodedData}`);
    }
  };

  // Action button class based on theme
  const actionButtonClass = config.theme === "standard" 
    ? "btn bg-charge-green text-white hover:bg-green-500 w-full h-10"
    : config.theme === "orangepill"
      ? "btn bg-orange-pill-gradient text-black hover:bg-orange-pill-hover w-full h-10"
      : config.theme === "nostrich"
        ? "btn bg-nostrich-gradient text-white hover:bg-nostrich-hover w-full h-10"
        : config.theme === "beehive"
          ? "btn bg-beehive-yellow text-black hover:bg-beehive-hover w-full h-10"
          : config.theme === "safari"
            ? "btn bg-safari-gradient text-black hover:bg-safari-hover w-full h-10"
            : config.theme === "blocktron"
              ? "btn bg-blocktron-gradient text-white hover:bg-blocktron-hover w-full h-10"
              : "btn btn-industrial-gradient w-full h-10";

  return (
    <>
      {/* Use Navbar component for consistent logo placement */}
      <Navbar />
      <div className="flex w-full h-[calc(100vh-40px)] md:h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] flex-col items-center justify-between bg-black text-white" data-theme={config.theme}>
        <div className="flex flex-col items-center justify-between w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto h-full py-4">
          {/* Flexible spacer at top */}
          <div className="flex-grow"></div>
          
          {/* Payment success block - all elements kept together as a single unit */}
          <div className="flex flex-col items-center justify-center">
            {/* Success icon and message */}
            <PopiconsCircleCheckDuotone className="w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 text-charge-green mx-auto mb-6 md:mb-8" />
            <span className="text-base md:text-xl lg:text-2xl mb-8 md:mb-10 lg:mb-12">Payment received</span>
            
            {/* Add a tip button */}
            {showTipButton && (
              <button 
                onClick={handleTip} 
                className={`${actionButtonClass.replace('h-10', 'h-10 md:h-12 lg:h-14')} w-full text-sm md:text-base lg:text-lg`}
              >
                Add a tip
              </button>
            )}
          </div>
          
          {/* Flexible spacer at bottom */}
          <div className="flex-grow"></div>
          
          {/* New payment button at bottom */}
          <div className="w-full">
            <Link to="../new" className="w-full">
              <button className="btn bg-white text-black hover:bg-gray-200 w-full h-10 md:h-12 lg:h-14 text-sm md:text-base lg:text-lg">
                New payment
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}