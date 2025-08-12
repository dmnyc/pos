import { PopiconsCircleCheckDuotone } from "@popicons/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useStore from "../../state/store";

export function Paid() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lastInvoiceData } = useStore();
  const [showTipButton, setShowTipButton] = useState(true);
  
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

  return (
    <div className="bg-black text-white h-full flex flex-col" data-theme="dark">
      <div className="flex flex-col justify-between items-center h-full py-4">
        <div className="flex flex-col gap-5 justify-center items-center grow">
          <div className="text-center">
            <PopiconsCircleCheckDuotone className="w-56 h-56 text-charge-green" />
            <span className="text-xl">Payment received</span>
          </div>
          
          {showTipButton && (
            <button 
              onClick={handleTip} 
              className="btn bg-charge-green text-white hover:bg-green-500 w-full"
            >
              Add a tip
            </button>
          )}
        </div>
        
        {/* New payment button moved to the bottom of the screen */}
        <div className="w-full px-4 mt-8">
          <Link to="../new" className="w-full">
            <button className="btn bg-white text-black hover:bg-gray-200 w-full">
              New payment
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}