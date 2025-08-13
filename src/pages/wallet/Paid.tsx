import { PopiconsCircleCheckDuotone } from "@popicons/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useStore from "../../state/store";
import { getMerchantConfig } from "../../config";
import { Navbar } from "../../components/Navbar";

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
  }, [location]);

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
    ? "btn bg-charge-green text-white hover:bg-green-500 w-full"
    : config.theme === "orangepill"
      ? "btn bg-orange-pill-gradient text-black hover:bg-orange-pill-hover w-full"
      : config.theme === "nostrich"
        ? "btn bg-nostrich-gradient text-white hover:bg-nostrich-hover w-full"
        : config.theme === "beehive"
          ? "btn bg-beehive-yellow text-black hover:bg-beehive-hover w-full"
          : config.theme === "safari"
            ? "btn bg-safari-gradient text-black hover:bg-safari-hover w-full"
            : config.theme === "blocktron"
              ? "btn bg-blocktron-gradient text-white hover:bg-blocktron-hover w-full"
              : "btn btn-industrial-gradient w-full";

  return (
    <>
      {/* Use Navbar component for consistent logo placement */}
      <Navbar />
      <div className="flex w-full h-full flex-col items-center justify-between bg-black text-white" data-theme={config.theme}>
        <div className="flex flex-col gap-3 justify-center items-center grow py-2">
          <div className="text-center">
            <PopiconsCircleCheckDuotone className="w-40 h-40 text-charge-green" />
            <span className="text-lg">Payment received</span>
          </div>
          
          {showTipButton && (
            <button 
              onClick={handleTip} 
              className={`${actionButtonClass} h-12 text-sm`}
            >
              Add a tip
            </button>
          )}
        </div>
        
        {/* New payment button moved to the bottom of the screen */}
        <div className="w-full max-w-xs mx-auto mb-6">
          <Link to="../new" className="w-full">
            <button className="btn bg-white text-black hover:bg-gray-200 w-full h-12 text-sm">
              New payment
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}