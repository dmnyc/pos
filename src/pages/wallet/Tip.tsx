import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../../state/store';
import { getMerchantConfig, getTipSettings } from '../../config';
import { fiat } from "@getalby/lightning-tools";
import { Navbar } from '../../components/Navbar';

const CUSTOM_TIP = 'custom';
const NO_TIP = 'none';

export function TipPage() {
  const { invoice } = useParams();
  const navigate = useNavigate();
  const { provider } = useStore();
  const [baseAmount, setBaseAmount] = useState<number>(0); // Base amount in sats
  const [selectedTip, setSelectedTip] = useState<string | number>(NO_TIP); // Default to No Tip
  const [customTipValue, setCustomTipValue] = useState<string>('');
  const [tipAmount, setTipAmount] = useState<number>(0); // Tip amount in sats
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>("USD"); // Default to USD
  const [fiatRate, setFiatRate] = useState<number | null>(null);
  const [baseAmountInFiat, setBaseAmountInFiat] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [customTipCurrency, setCustomTipCurrency] = useState<string>("FIAT"); // "FIAT" or "SATS"
  const config = getMerchantConfig();
  const tipSettings = getTipSettings();
  const customInputRef = useRef<HTMLInputElement>(null);

  // Load currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem("pos:currency");
    if (savedCurrency && savedCurrency !== "SATS") {
      setCurrency(savedCurrency);
    }
  }, []);

  // Get exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        if (currency === "SATS") return;
        
        // Get how many sats per unit of currency
        const satsPerUnit = await fiat.getSatoshiValue({ amount: 1, currency });
        setFiatRate(satsPerUnit);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    };
    
    fetchRate();
  }, [currency]);

  // Initialize the component once - separated from tip selection logic
  useEffect(() => {
    // Don't re-run this effect if already initialized
    if (isInitialized) return;

    // If tips are disabled, redirect to new payment page
    if (!tipSettings.enabled) {
      navigate('/wallet/new');
      return;
    }

    // Decode invoice to get original amount
    if (invoice) {
      try {
        const decodedInvoice = JSON.parse(atob(invoice));
        setBaseAmount(decodedInvoice.amount);
        
        // Check if there's a currency in the invoice data
        if (decodedInvoice.currency && decodedInvoice.currency !== "SATS") {
          setCurrency(decodedInvoice.currency);
        }
        
        // Set initialization flag
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to decode invoice:', error);
        navigate('/wallet/new');
      }
    }
  }, [invoice, navigate, tipSettings, isInitialized]);

  // Calculate base amount in fiat when exchange rate is available
  useEffect(() => {
    if (fiatRate && baseAmount) {
      // Convert sats to fiat (baseAmount / satsPerUnit)
      const fiatAmount = baseAmount / fiatRate;
      setBaseAmountInFiat(fiatAmount);
    }
  }, [fiatRate, baseAmount]);

  // Calculate tip amount based on selected percentage or custom value
  useEffect(() => {
    if (typeof selectedTip === 'number') {
      // Percentage-based tip
      const calculatedTip = Math.round(baseAmount * (selectedTip / 100));
      setTipAmount(calculatedTip);
    } else if (selectedTip === CUSTOM_TIP) {
      // Custom tip - handle based on selected currency format
      if (customTipValue) {
        if (customTipCurrency === "FIAT" && fiatRate && currency !== "SATS") {
          // Convert fiat value to sats (fiatValue * satsPerUnit)
          const fiatValue = parseFloat(customTipValue);
          if (!isNaN(fiatValue)) {
            const satValue = Math.round(fiatValue * fiatRate);
            setTipAmount(satValue);
          } else {
            setTipAmount(0);
          }
        } else {
          // Using SATS directly
          setTipAmount(parseInt(customTipValue) || 0);
        }
      } else {
        setTipAmount(0);
      }
    } else if (selectedTip === NO_TIP) {
      setTipAmount(0);
    }
  }, [selectedTip, baseAmount, customTipValue, fiatRate, currency, customTipCurrency]);

  // Handle tip selection - memoized to prevent unnecessary re-renders
  const handleTipSelection = useCallback((tip: number | string) => {
    console.log(`Selected tip: ${tip}`);
    setSelectedTip(tip);
    
    // If selecting custom, prepare a default value
    if (tip === CUSTOM_TIP) {
      // Set default currency for custom tip - use fiat when available
      if (currency !== "SATS" && fiatRate) {
        setCustomTipCurrency("FIAT");
      } else {
        setCustomTipCurrency("SATS");
      }
      
      // Only set a default value if the current value is empty
      if (!customTipValue) {
        // Default to 15% tip
        if (customTipCurrency === "FIAT" && fiatRate && currency !== "SATS") {
          const defaultTipPercentage = 0.15; // 15%
          const defaultTip = (baseAmount * defaultTipPercentage) / fiatRate;
          setCustomTipValue(defaultTip.toFixed(2));
        } else {
          // For SATS, default to 15% of the base amount
          const defaultTip = Math.round(baseAmount * 0.15);
          setCustomTipValue(defaultTip.toString());
        }
      }
      
      // Focus the input field after a short delay to ensure it's rendered
      setTimeout(() => {
        if (customInputRef.current) {
          customInputRef.current.focus();
        }
      }, 100);
    }
  }, [customTipValue, fiatRate, currency, baseAmount, customTipCurrency]);

  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // For fiat currencies, allow decimal points
    if (customTipCurrency === "FIAT" && currency !== "SATS") {
      // Remove anything that's not a digit or decimal point
      value = value.replace(/[^0-9.]/g, '');
      
      // Ensure only one decimal point
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Limit to 2 decimal places
      if (parts.length === 2 && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
      }
    } else {
      // For SATS, only allow integers
      value = value.replace(/[^0-9]/g, '');
    }
    
    setCustomTipValue(value);
  };
  
  // Handle toggle between fiat and sats for custom tip
  const handleCurrencyToggle = () => {
    if (customTipCurrency === "FIAT" && fiatRate) {
      // Switch from FIAT to SATS
      setCustomTipCurrency("SATS");
      
      // Convert the current value to sats if it exists and is valid
      if (customTipValue) {
        const fiatValue = parseFloat(customTipValue);
        if (!isNaN(fiatValue) && fiatRate) {
          const satValue = Math.round(fiatValue * fiatRate);
          setCustomTipValue(satValue.toString());
        }
      }
    } else {
      // Switch from SATS to FIAT
      setCustomTipCurrency("FIAT");
      
      // Convert the current value to fiat if it exists and is valid
      if (customTipValue && fiatRate) {
        const satValue = parseInt(customTipValue);
        if (!isNaN(satValue)) {
          const fiatValue = satValue / fiatRate;
          setCustomTipValue(fiatValue.toFixed(2));
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!provider || tipAmount <= 0) {
      navigate('/wallet/new');
      return;
    }

    try {
      setIsLoading(true);
      
      let tipMemo = `${config.displayName} - Tip`;
      
      // Include fiat amount in the memo for display on the payment screen
      let fiatDisplay = "";
      if (currency !== "SATS" && fiatRate) {
        if (customTipCurrency === "FIAT" && customTipValue) {
          // If user entered amount in fiat, use that directly
          fiatDisplay = `${currency} ${customTipValue}`;
          tipMemo += ` (${fiatDisplay})`;
        } else {
          // Otherwise calculate fiat equivalent
          const fiatValue = tipAmount / fiatRate;
          fiatDisplay = `${currency} ${fiatValue.toFixed(2)}`;
          tipMemo += ` (${fiatDisplay})`;
        }
      }
      
      const invoice = await provider.makeInvoice({
        amount: tipAmount.toString(),
        defaultMemo: tipMemo,
      });
      
      // Pass state indicating this is a tip payment along with the fiat amount
      navigate(`../pay/${invoice.paymentRequest}`, { 
        state: { 
          isTipPayment: true,
          fiatAmount: fiatDisplay
        }
      });
    } catch (error) {
      console.error('Failed to create tip invoice:', error);
      alert(`Failed to create tip invoice: ${error}`);
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/wallet/new');
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    if (currency === "SATS") {
      return `${amount} ${amount === 1 ? "sat" : "sats"}`;
    }
    
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  // Button styling based on theme
  const getButtonClass = (isSelected: boolean) => {
    if (isSelected) {
      return "bg-white text-black hover:bg-gray-200";
    } else {
      return "bg-transparent border border-gray-700 text-white hover:bg-gray-800";
    }
  };

  // Action button class based on theme
  const actionButtonClass = 
    tipAmount <= 0 || isLoading
      ? "btn bg-gray-600 text-white w-full" // Inactive state for all themes
      : config.theme === "standard" 
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
      <div className="flex w-full h-[calc(100vh-40px)] md:h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] flex-col items-center justify-center bg-black text-white" data-theme={config.theme}>
        <div className="flex flex-col items-center justify-between w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto h-full py-4">
          {/* Flexible spacer at top */}
          <div className="flex-grow"></div>
          
          {/* Tip content - all elements kept together as a single unit */}
          <div className="flex flex-col items-center justify-center w-full px-2">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-6 md:mb-8 lg:mb-10">Would you like to add a tip?</h2>
            
            <div className="text-center mb-6 md:mb-8 lg:mb-10">
              {currency !== "SATS" && fiatRate ? (
                <>
                  <div className="flex items-center justify-center">
                    <span className="text-gray-400 text-sm md:text-base lg:text-lg mr-1 md:mr-2">Base amount:</span>
                    <span className="text-white text-lg md:text-xl lg:text-2xl font-medium">{formatCurrency(baseAmountInFiat)}</span>
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm lg:text-base">
                    {baseAmount} {baseAmount === 1 ? "sat" : "sats"}
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="text-gray-400 text-sm md:text-base lg:text-lg mr-1 md:mr-2">Base amount:</span>
                  <span className="text-white text-lg md:text-xl lg:text-2xl font-medium">{baseAmount} {baseAmount === 1 ? "sat" : "sats"}</span>
                </div>
              )}
            </div>
            
            {/* Tip options - grid for percentage buttons */}
            <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4 w-full mb-6 md:mb-8">
              {tipSettings.defaultPercentages.map(tip => (
                <button
                  key={tip}
                  className={`btn ${getButtonClass(selectedTip === tip)} text-sm sm:text-base md:text-lg h-12 md:h-14 lg:h-16 font-bold`}
                  onClick={() => handleTipSelection(tip)}
                >
                  {tip}%
                </button>
              ))}
              
              {tipSettings.allowCustom && (
                <button
                  className={`btn col-span-2 ${getButtonClass(selectedTip === CUSTOM_TIP)} text-sm sm:text-base md:text-lg h-12 md:h-14 lg:h-16 font-bold mt-1`}
                  onClick={() => handleTipSelection(CUSTOM_TIP)}
                >
                  Custom Tip
                </button>
              )}
            </div>
            
            {/* Custom tip input section */}
            {selectedTip === CUSTOM_TIP && (
              <div className="w-full mb-6 md:mb-8">
                <div className="flex justify-between items-center mb-1 md:mb-2">
                  <label className="label-text text-white text-xs md:text-sm">
                    Enter custom tip amount
                  </label>
                  {currency !== "SATS" && fiatRate && (
                    <div className="join border border-gray-600 rounded-md">
                      <button 
                        type="button"
                        className={`join-item px-3 py-1 text-xs md:text-sm font-medium ${customTipCurrency === "FIAT" 
                          ? 'bg-white text-black' 
                          : 'bg-transparent text-gray-300'}`}
                        onClick={() => {
                          if (customTipCurrency !== "FIAT") handleCurrencyToggle();
                        }}
                      >
                        {currency}
                      </button>
                      <button 
                        type="button"
                        className={`join-item px-3 py-1 text-xs md:text-sm font-medium ${customTipCurrency === "SATS" 
                          ? 'bg-white text-black' 
                          : 'bg-transparent text-gray-300'}`}
                        onClick={() => {
                          if (customTipCurrency !== "SATS") handleCurrencyToggle();
                        }}
                      >
                        SATS
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  {customTipCurrency === "FIAT" && currency !== "SATS" && (
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs md:text-sm">
                      {currency === "USD" ? "$" : currency + " "}
                    </span>
                  )}
                  <input
                    ref={customInputRef}
                    type="text"
                    className={`input input-bordered w-full bg-gray-900 text-white h-10 md:h-12 lg:h-14 text-sm md:text-base ${customTipCurrency === "FIAT" && currency !== "SATS" ? "pl-8 md:pl-10" : ""}`}
                    value={customTipValue}
                    onChange={handleCustomTipChange}
                    placeholder={customTipCurrency === "FIAT" && currency !== "SATS" ? "0.00" : "Enter amount in sats"}
                  />
                </div>
              </div>
            )}
            
            {/* Tip amount display */}
            {tipAmount > 0 && (
              <div className="text-center mb-6 md:mb-8">
                {selectedTip === CUSTOM_TIP ? (
                  customTipCurrency === "FIAT" && currency !== "SATS" && fiatRate ? (
                    <>
                      <div className="flex items-center justify-center">
                        <span className="text-gray-400 text-sm md:text-base lg:text-lg mr-1 md:mr-2">Tip amount:</span>
                        <span className="text-white text-lg md:text-xl lg:text-2xl font-medium">{formatCurrency(parseFloat(customTipValue) || 0)}</span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-400">
                        {tipAmount} {tipAmount === 1 ? "sat" : "sats"}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center">
                        <span className="text-gray-400 text-sm md:text-base lg:text-lg mr-1 md:mr-2">Tip amount:</span>
                        <span className="text-white text-lg md:text-xl lg:text-2xl font-medium">{tipAmount} {tipAmount === 1 ? "sat" : "sats"}</span>
                      </div>
                      {currency !== "SATS" && fiatRate && (
                        <p className="text-xs md:text-sm text-gray-400">
                          {formatCurrency(tipAmount / fiatRate)}
                        </p>
                      )}
                    </>
                  )
                ) : currency !== "SATS" && fiatRate ? (
                  <>
                    <div className="flex items-center justify-center">
                      <span className="text-gray-400 text-sm md:text-base lg:text-lg mr-1 md:mr-2">Tip amount:</span>
                      <span className="text-white text-lg md:text-xl lg:text-2xl font-medium">{formatCurrency((baseAmountInFiat * (selectedTip as number)) / 100)}</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400">
                      {tipAmount} {tipAmount === 1 ? "sat" : "sats"}
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="text-gray-400 text-sm md:text-base lg:text-lg mr-1 md:mr-2">Tip amount:</span>
                    <span className="text-white text-lg md:text-xl lg:text-2xl font-medium">{tipAmount} {tipAmount === 1 ? "sat" : "sats"}</span>
                  </div>
                )}
                
                <p className="text-xs md:text-sm text-gray-400 mt-3">
                  Total with tip: {baseAmount + tipAmount} {(baseAmount + tipAmount) === 1 ? "sat" : "sats"}
                </p>
              </div>
            )}
            
            {/* Action button */}
            <div className="w-full">
              {tipAmount > 0 ? (
                <button
                  className={`${actionButtonClass} h-12 md:h-14 lg:h-16 text-base md:text-lg lg:text-xl font-bold`}
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  Add Tip
                  {isLoading && <span className="loading loading-spinner ml-2"></span>}
                </button>
              ) : (
                <button
                  className="btn bg-white text-black hover:bg-gray-200 w-full h-12 md:h-14 lg:h-16 text-base md:text-lg lg:text-xl font-bold"
                  onClick={handleSkip}
                >
                  No Tip
                </button>
              )}
            </div>
          </div>
          
          {/* Flexible spacer at bottom */}
          <div className="flex-grow"></div>
        </div>
      </div>
    </>
  );
}