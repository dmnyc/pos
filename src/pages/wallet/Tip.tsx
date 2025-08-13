import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Backbar } from '../../components/Backbar';
import useStore from '../../state/store';
import { getMerchantConfig, getTipSettings } from '../../config';
import { fiat } from "@getalby/lightning-tools";

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
      // Custom tip - convert from fiat to sats if needed
      if (customTipValue && fiatRate && currency !== "SATS") {
        // Convert fiat value to sats (fiatValue * satsPerUnit)
        const fiatValue = parseFloat(customTipValue);
        if (!isNaN(fiatValue)) {
          const satValue = Math.round(fiatValue * fiatRate);
          setTipAmount(satValue);
        } else {
          setTipAmount(0);
        }
      } else if (currency === "SATS") {
        setTipAmount(parseInt(customTipValue) || 0);
      }
    } else if (selectedTip === NO_TIP) {
      setTipAmount(0);
    }
  }, [selectedTip, baseAmount, customTipValue, fiatRate, currency]);

  // Handle tip selection - memoized to prevent unnecessary re-renders
  const handleTipSelection = useCallback((tip: number | string) => {
    console.log(`Selected tip: ${tip}`);
    setSelectedTip(tip);
    
    // If selecting custom, prepare a default value
    if (tip === CUSTOM_TIP) {
      // Only set a default value if the current value is empty
      if (!customTipValue && fiatRate && currency !== "SATS") {
        const defaultTipPercentage = 0.15; // 15%
        const defaultTip = (baseAmount * defaultTipPercentage) / fiatRate;
        setCustomTipValue(defaultTip.toFixed(2));
      } else if (!customTipValue && currency === "SATS") {
        // For SATS, default to 15% of the base amount
        const defaultTip = Math.round(baseAmount * 0.15);
        setCustomTipValue(defaultTip.toString());
      }
      
      // Focus the input field after a short delay to ensure it's rendered
      setTimeout(() => {
        if (customInputRef.current) {
          customInputRef.current.focus();
        }
      }, 100);
    }
  }, [customTipValue, fiatRate, currency, baseAmount]);

  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // For fiat currencies, allow decimal points
    if (currency !== "SATS") {
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

  const handleSubmit = async () => {
    if (!provider || tipAmount <= 0) {
      navigate('/wallet/new');
      return;
    }

    try {
      setIsLoading(true);
      
      let tipMemo = `${config.displayName} - Tip`;
      if (currency !== "SATS" && customTipValue) {
        tipMemo += ` (${currency} ${customTipValue})`;
      }
      
      const invoice = await provider.makeInvoice({
        amount: tipAmount.toString(),
        defaultMemo: tipMemo,
      });
      
      // Pass state indicating this is a tip payment
      navigate(`../pay/${invoice.paymentRequest}`, { state: { isTipPayment: true } });
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
      return `${amount} sats`;
    }
    
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  // Button styling based on theme
  const getButtonClass = (isSelected: boolean) => {
    if (isSelected) {
      return "btn bg-white text-black";
    } else {
      return "btn btn-outline text-white";
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
                ? "btn bg-safari-gradient text-white hover:bg-safari-hover w-full"
                : "btn btn-industrial-gradient w-full";

  return (
    <div className="bg-black text-white h-full" data-theme={config.theme}>
      <Backbar />
      <div className="flex grow flex-col items-center justify-center gap-3 p-2">
        <h2 className="text-xl font-bold text-center">Would you like to add a tip?</h2>
        
        <div className="text-center mb-2">
          {currency !== "SATS" && fiatRate ? (
            <p className="text-gray-400 text-xs">
              Base amount: {formatCurrency(baseAmountInFiat)} ({baseAmount} sats)
            </p>
          ) : (
            <p className="text-gray-400 text-xs">Base amount: {baseAmount} sats</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-1 w-full max-w-md">
          <button
            className={`${getButtonClass(selectedTip === NO_TIP)} text-xs h-8`}
            onClick={() => handleTipSelection(NO_TIP)}
          >
            No Tip
          </button>
          
          {tipSettings.defaultPercentages.map(tip => (
            <button
              key={tip}
              className={`${getButtonClass(selectedTip === tip)} text-xs h-8`}
              onClick={() => handleTipSelection(tip)}
            >
              {tip}%
            </button>
          ))}
          
          {tipSettings.allowCustom && (
            <button
              className={`btn col-span-2 ${getButtonClass(selectedTip === CUSTOM_TIP)} text-xs h-8`}
              onClick={() => handleTipSelection(CUSTOM_TIP)}
            >
              Custom Tip
            </button>
          )}
        </div>
        
        {selectedTip === CUSTOM_TIP && (
          <div className="w-full max-w-md mt-1">
            <label className="label py-1">
              <span className="label-text text-white text-xs">
                Enter custom tip amount {currency !== "SATS" ? `(in ${currency})` : "(in sats)"}
              </span>
            </label>
            <div className="relative">
              {currency !== "SATS" && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                  {currency === "USD" ? "$" : currency + " "}
                </span>
              )}
              <input
                ref={customInputRef}
                type="text"
                className={`input input-bordered w-full bg-gray-900 text-white h-8 text-sm ${currency !== "SATS" ? "pl-8" : ""}`}
                value={customTipValue}
                onChange={handleCustomTipChange}
                placeholder={currency !== "SATS" ? "0.00" : "Enter amount in sats"}
              />
            </div>
          </div>
        )}
        
        {tipAmount > 0 && (
          <div className="text-center mt-2">
            {currency !== "SATS" && fiatRate && selectedTip === CUSTOM_TIP ? (
              <>
                <p className="text-lg font-semibold">
                  Tip amount: {formatCurrency(parseFloat(customTipValue) || 0)}
                </p>
                <p className="text-xs text-gray-400">
                  {tipAmount} sats
                </p>
              </>
            ) : currency !== "SATS" && fiatRate ? (
              <>
                <p className="text-lg font-semibold">
                  Tip amount: {formatCurrency((baseAmountInFiat * (selectedTip as number)) / 100)}
                </p>
                <p className="text-xs text-gray-400">
                  {tipAmount} sats
                </p>
              </>
            ) : (
              <p className="text-lg font-semibold">Tip amount: {tipAmount} sats</p>
            )}
            
            <p className="text-xs text-gray-400 mt-1">
              Total with tip: {baseAmount + tipAmount} sats
            </p>
          </div>
        )}
        
        <div className="w-full max-w-md flex flex-col gap-2 mt-3">
          {tipAmount > 0 ? (
            <button
              className={`${actionButtonClass} h-10 text-sm`}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              Add Tip
              {isLoading && <span className="loading loading-spinner ml-2"></span>}
            </button>
          ) : (
            <button
              className="btn bg-white text-black hover:bg-gray-200 w-full h-10 text-sm"
              onClick={handleSkip}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}