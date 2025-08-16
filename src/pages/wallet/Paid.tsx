import { PopiconsCircleCheckDuotone } from "@popicons/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useStore from "../../state/store";
import { getMerchantConfig } from "../../config";
import { Navbar } from "../../components/Navbar";
import { PageContainer } from "../../components/PageContainer";
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
      <Navbar />
      <PageContainer>
        <div className="flex flex-col items-center justify-center w-full max-w-xs md:max-w-md lg:max-w-lg wide:max-w-screen-md mx-auto py-2 md:py-4">
          {/* Payment success block with responsive sizing */}
          <div className="flex flex-col items-center justify-center">
            {/* Success icon with appropriate sizing for landscape mode */}
            <PopiconsCircleCheckDuotone 
              className="w-28 h-28 md:w-36 md:h-36 lg:w-36 lg:h-36 lg:landscape:w-28 lg:landscape:h-28 wide:w-56 wide:h-56 wide:landscape:w-40 wide:landscape:h-40 text-charge-green mx-auto mb-6 md:mb-8 lg:mb-8 lg:landscape:mb-5 wide:mb-10 wide:landscape:mb-8" 
            />
            
            {/* Success message with responsive text size */}
            <span className="text-base md:text-xl lg:text-xl lg:landscape:text-lg wide:text-3xl wide:landscape:text-2xl mb-8 md:mb-10 lg:mb-10 lg:landscape:mb-6 wide:mb-12 wide:landscape:mb-8">
              Payment received
            </span>
            
            {/* Add a tip button with appropriate sizing */}
            {showTipButton && (
              <div className="w-full max-w-xs md:max-w-md lg:max-w-md lg:landscape:max-w-sm wide:max-w-xl wide:landscape:max-w-md">
                <button 
                  onClick={handleTip} 
                  className={`${actionButtonClass} w-full h-10 md:h-12 lg:h-12 lg:landscape:h-10 wide:h-16 wide:landscape:h-12 text-sm md:text-base lg:text-base lg:landscape:text-base wide:text-2xl wide:landscape:text-xl`}
                >
                  Add a tip
                </button>
              </div>
            )}
          </div>
          
          {/* New payment button with appropriate sizing */}
          <div className="w-full max-w-xs md:max-w-md lg:max-w-md lg:landscape:max-w-sm wide:max-w-xl wide:landscape:max-w-md mt-8 md:mt-10 lg:mt-10 lg:landscape:mt-6 wide:mt-12 wide:landscape:mt-8">
            <Link to="../new" className="w-full">
              <button className="btn bg-white text-black hover:bg-gray-200 w-full h-10 md:h-12 lg:h-12 lg:landscape:h-10 wide:h-16 wide:landscape:h-12 text-sm md:text-base lg:text-base lg:landscape:text-base wide:text-2xl wide:landscape:text-xl">
                New payment
              </button>
            </Link>
          </div>
        </div>
      </PageContainer>
    </>
  );
}