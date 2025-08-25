import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../../state/store';
import { getMerchantConfig, getTipSettings } from '../../config';
import { fiat } from "@getalby/lightning-tools";
import { Navbar } from '../../components/Navbar';
import { getCurrencySymbol } from '../../utils/currencyUtils';
import { localStorageKeys } from '../../constants';
import { AlertModal } from '../../components/Modals';

const CUSTOM_TIP = 'custom';
const NO_TIP = 'none';

export function TipPage() {
  const { invoice } = useParams();
  const navigate = useNavigate();
  // Not directly using providers here - getting them in handleSubmit
  const { /* provider, tipProvider */ } = useStore();
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
  
  // State for the alert modal
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // Load currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem(localStorageKeys.currency);
    if (savedCurrency) {
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

    // Decode invoice to get original amoun
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
    const updateTipAmount = async () => {
      if (typeof selectedTip === 'number') {
        // For percentage-based tips 
        if (currency === "SATS") {
          // If base currency is SATS, just use percentage of base amount
          const calculatedTip = Math.round(baseAmount * (selectedTip / 100));
          setTipAmount(calculatedTip);
        } else if (baseAmountInFiat > 0) {
          try {
            // Calculate the tip amount in fiat
            const tipFiatAmount = baseAmountInFiat * (selectedTip / 100);
            // Use direct API call to get satoshi value, matching the Payment logic
            const satValue = await fiat.getSatoshiValue({ amount: tipFiatAmount, currency });
            setTipAmount(satValue);
          } catch (error) {
            console.error("Error converting percentage tip to sats:", error);
            // Fallback to the old method if API call fails
            const calculatedTip = Math.round(baseAmount * (selectedTip / 100));
            setTipAmount(calculatedTip);
          }
        } else {
          // Fallback if baseAmountInFiat isn't available yet
          const calculatedTip = Math.round(baseAmount * (selectedTip / 100));
          setTipAmount(calculatedTip);
        }
      } else if (selectedTip === CUSTOM_TIP) {
        // Custom tip - handle based on selected currency format
        if (customTipValue) {
          if (customTipCurrency === "FIAT" && currency !== "SATS") {
            try {
              // Use the same direct API call method as the Payment component
              const fiatValue = parseFloat(customTipValue);
              if (!isNaN(fiatValue)) {
                // Use direct API call to get satoshi value, matching the Payment logic
                const satValue = await fiat.getSatoshiValue({ amount: fiatValue, currency });
                setTipAmount(satValue);
              } else {
                setTipAmount(0);
              }
            } catch (error) {
              console.error("Error converting tip to sats:", error);
              // Fallback to using the stored rate if API call fails
              if (fiatRate) {
                const fiatValue = parseFloat(customTipValue);
                if (!isNaN(fiatValue)) {
                  const satValue = Math.round(fiatValue * fiatRate);
                  setTipAmount(satValue);
                }
              }
            }
          } else {
            // Using SATS directly - ensure it's parsed correctly
            const parsedValue = parseInt(customTipValue) || 0;
            
            // Log the parsed value to help debug
            console.log(`Custom tip SATS value: ${customTipValue} -> ${parsedValue}`);
            
            // Don't apply any additional conversion when currency is SATS
            setTipAmount(parsedValue);
          }
        } else {
          setTipAmount(0);
        }
      } else if (selectedTip === NO_TIP) {
        setTipAmount(0);
      }
    };

    updateTipAmount();
  }, [selectedTip, baseAmount, baseAmountInFiat, customTipValue, currency, customTipCurrency, fiatRate]);

  // Handle tip selection - memoized to prevent unnecessary re-renders
  const handleTipSelection = useCallback((tip: number | string) => {
    // console.log(`Selected tip: ${tip}`);
    setSelectedTip(tip);

    // If selecting custom, prepare a default value
    if (tip === CUSTOM_TIP) {
      // Set default currency for custom tip - use fiat when available
      if (currency !== "SATS" && fiatRate) {
        setCustomTipCurrency("FIAT");
      } else {
        setCustomTipCurrency("SATS");
      }

      // Clear any existing custom tip value when selecting custom tip
      setCustomTipValue('');

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
      
      // For FIAT currencies, check the estimated sats value
      if (value && fiatRate) {
        const fiatValue = parseFloat(value);
        if (!isNaN(fiatValue)) {
          const estimatedSats = Math.round(fiatValue * fiatRate);
          if (estimatedSats > 100000000) {
            setAlertState({
              isOpen: true,
              title: 'Amount Too Large',
              message: 'Your input exceeds the maximum amount.'
            });
            return; // Don't update the value
          }
        }
      }
    } else {
      // For SATS, only allow integers
      value = value.replace(/[^0-9]/g, '');
      
      // Check if the value exceeds the 100,000,000 sats limit
      const parsedValue = parseInt(value) || 0;
      if (parsedValue > 100000000) {
        setAlertState({
          isOpen: true,
          title: 'Amount Too Large',
          message: 'Your input exceeds the maximum amount.'
        });
        return; // Don't update the value
      }
      
      // Directly update tipAmount to ensure UI consistency when using SATS
      if (value) {
        console.log(`Direct tipAmount update: ${parsedValue} sats`);
        setTipAmount(parsedValue);
      } else {
        setTipAmount(0);
      }
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
          
          // Check if converted value exceeds the limit
          if (satValue > 100000000) {
            setAlertState({
              isOpen: true,
              title: 'Amount Too Large',
              message: 'The converted amount exceeds the maximum amount.'
            });
            // Don't change the currency mode, stay in FIAT
            return;
          }
          
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
    const tipSettings = getTipSettings();
    const { provider, tipProvider } = useStore.getState();
    
    // Determine which provider to use for the tip
    // Only use secondary wallet if explicitly configured AND available
    const shouldUseTipWallet = tipSettings.useSecondaryWallet && tipProvider;
    const activeProvider = shouldUseTipWallet ? tipProvider : provider;
    
    if (!activeProvider) {
      console.error("No wallet provider available for tip");
      navigate('/wallet/new');
      return;
    }
    
    if (tipAmount <= 0) {
      navigate('/wallet/new');
      return;
    }

    try {
      setIsLoading(true);

      let tipMemo = `${config.name} - Tip`;

      // Only include fiat amount in memo if not using SATS currency
      let fiatDisplay = "";
      if (currency !== "SATS" && fiatRate) {
        const currencySymbol = getCurrencySymbol(currency);
        let amount = "";
        
        // Always use the accurate calculated fiat amount from tipAmount
        if (selectedTip === CUSTOM_TIP && customTipCurrency === "FIAT" && customTipValue) {
          // For custom tips entered in fiat, use the entered value
          amount = customTipValue;
        } else {
          // For percentage tips or custom tips in sats, calculate fiat equivalent
          try {
            // More accurate way: Calculate the fiat equivalent by getting rate for 1 sat
            // and then multiplying by tipAmount
            const oneSat = await fiat.getFiatValue({ satoshi: 1, currency });
            const fiatValue = oneSat * tipAmount;
            amount = fiatValue.toFixed(2);
          } catch (error) {
            console.error("Error getting fiat value:", error);
            // Fallback to the less accurate stored rate
            const fiatValue = tipAmount / fiatRate;
            amount = fiatValue.toFixed(2);
          }
        }
        
        // Format: Store Name - Tip (USD $0.01) - space after currency code but not after symbol
        if (currencySymbol.isSymbol) {
          fiatDisplay = `${currency} ${currencySymbol.symbol}${amount}`;
        } else {
          fiatDisplay = `${currency} ${amount}`;
        }
        
        tipMemo += ` (${fiatDisplay})`;
      }

      // Double-check to ensure correct amount for SATS currency
      let invoiceAmount = tipAmount.toString();
      
      // Special handling for custom SATS input to ensure consistency
      if (currency === "SATS" && customTipCurrency === "SATS" && selectedTip === CUSTOM_TIP && customTipValue) {
        const directParsedValue = parseInt(customTipValue) || 0;
        invoiceAmount = directParsedValue.toString();
        console.log(`Custom SATS value used directly: ${invoiceAmount}`);
      } else {
        // Add logging to debug the issue
        console.log(`Creating tip invoice with amount: ${invoiceAmount} sats`);
      }
      
      const invoice = await activeProvider.makeInvoice({
        amount: invoiceAmount,
        defaultMemo: tipMemo,
      });

      // Pass state indicating this is a tip payment along with the fiat amount
      navigate(`../pay/${invoice.paymentRequest}`, {
        state: {
          isTipPayment: true,
          fiatAmount: fiatDisplay,
          isUsingSecondaryWallet: tipSettings.useSecondaryWallet && tipProvider !== undefined
        }
      });
    } catch (error) {
      console.error('Failed to create tip invoice:', error);
      setAlertState({
        isOpen: true,
        title: 'Tip Creation Failed',
        message: `Failed to create tip invoice: ${error}`
      });
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

    // Use compact spacing between symbol and amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'narrowSymbol'
    }).format(amount);
  };

  // Display format for tip amount that uses the actual conversion rate
  const [displayFiatTipAmount, setDisplayFiatTipAmount] = useState<string>("");
  
  // Update displayed fiat amount when tipAmount changes
  useEffect(() => {
    const updateDisplayAmount = async () => {
      if (tipAmount > 0 && currency !== "SATS") {
        try {
          // Get accurate fiat value based on current tip amount
          const fiatValue = await fiat.getFiatValue({ satoshi: tipAmount, currency });
          setDisplayFiatTipAmount(
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
              currencyDisplay: 'narrowSymbol'
            }).format(fiatValue)
          );
        } catch (error) {
          console.error("Error updating display amount:", error);
          // Fallback to calculated value
          if (fiatRate) {
            const fiatValue = tipAmount / fiatRate;
            setDisplayFiatTipAmount(
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                currencyDisplay: 'narrowSymbol'
              }).format(fiatValue)
            );
          }
        }
      } else {
        setDisplayFiatTipAmount("");
      }
    };
    
    updateDisplayAmount();
  }, [tipAmount, currency, fiatRate]);

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
              : config.theme === "liquidity"
                ? "btn bg-liquidity-gradient text-black hover:bg-liquidity-hover w-full"
                : config.theme === "acidity"
                  ? "btn bg-acidity-gradient text-black hover:bg-acidity-hover w-full"
                  : config.theme === "nutjob"
                    ? "btn bg-nutjob-gradient text-black hover:bg-nutjob-hover w-full"
                    : config.theme === "safari"
                      ? "btn bg-safari-gradient text-black hover:bg-safari-hover w-full"
                      : config.theme === "solidstate"
                        ? "btn bg-solidstate-gradient text-white hover:bg-solidstate-hover w-full"
                        : config.theme === "blocktron"
                          ? "btn bg-blocktron-gradient text-white hover:bg-blocktron-hover w-full"
                          : config.theme === "surfboard"
                            ? "btn bg-surfboard-gradient text-white hover:bg-surfboard-hover w-full"
                            : "btn btn-industrial-gradient w-full";

  return (
    <>
      {/* Use Navbar component for consistent logo placement */}
      <Navbar />
      <div className="flex w-full h-[calc(100vh-48px)] md:h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] wide:h-[calc(100vh-80px)] flex-col items-center justify-center bg-black text-white" data-theme={config.theme}>
        <div className="flex flex-col items-center justify-between w-full max-w-xs md:max-w-md xl:max-w-md mx-auto h-full py-4">
          {/* Flexible spacer at top */}
          <div className="flex-grow"></div>

          {/* Tip content - all elements kept together as a single unit */}
          <div className="flex flex-col items-center justify-center w-full px-2">
            <h2 className="text-xl md:text-2xl xl:text-2xl font-bold text-center mb-6 md:mb-8 xl:mb-8">Would you like to add a tip?</h2>

            <div className="text-center mb-6 md:mb-8 xl:mb-8">
              <div className="flex items-center justify-center">
                <span className="text-gray-400 text-sm md:text-base xl:text-base mr-1 md:mr-2">Base amount:</span>
                <span className="text-white text-lg md:text-xl xl:text-xl font-medium">
                  {currency === "SATS" ? `${baseAmount} ${baseAmount === 1 ? "sat" : "sats"}` : formatCurrency(baseAmountInFiat)}
                </span>
              </div>
              {currency !== "SATS" && fiatRate && (
                <p className="text-gray-400 text-xs md:text-sm xl:text-sm">
                  {baseAmount} {baseAmount === 1 ? "sat" : "sats"}
                </p>
              )}
            </div>

            {/* Tip options - grid for percentage buttons */}
            <div className="grid grid-cols-2 gap-1.5 md:gap-2 lg:gap-2 lg:landscape:gap-1.5 wide:gap-3 w-full mb-6 md:mb-8">
              {tipSettings.defaultPercentages.map(tip => (
                <button
                  key={tip}
                  className={`btn ${getButtonClass(selectedTip === tip)} text-sm sm:text-base md:text-lg lg:text-lg lg:landscape:text-base wide:text-xl h-12 md:h-14 lg:h-14 lg:landscape:h-10 wide:h-16 font-bold`}
                  onClick={() => handleTipSelection(tip)}
                >
                  {tip}%
                </button>
              ))}

              {tipSettings.allowCustom && (
                <button
                  className={`btn col-span-2 ${getButtonClass(selectedTip === CUSTOM_TIP)} text-sm sm:text-base md:text-lg lg:text-lg lg:landscape:text-base wide:text-xl h-12 md:h-14 lg:h-14 lg:landscape:h-10 wide:h-16 font-bold mt-1`}
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
                  <label className="label-text text-white text-xs md:text-sm xl:text-sm">
                    Enter custom tip amount
                  </label>
                  {currency !== "SATS" && fiatRate && (
                    <div className="join border border-gray-600 rounded-md">
                      <button
                        type="button"
                        className={`join-item px-3 py-1 text-xs md:text-sm xl:text-sm font-medium ${customTipCurrency === "FIAT"
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
                        className={`join-item px-3 py-1 text-xs md:text-sm xl:text-sm font-medium ${customTipCurrency === "SATS"
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
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs md:text-sm xl:text-sm">
                      {currency === "USD" ? "$" : currency}
                    </span>
                  )}
                  <input
                    ref={customInputRef}
                    type="text"
                    className={`input input-bordered w-full bg-gray-900 text-white h-10 md:h-12 xl:h-12 text-sm md:text-base xl:text-base ${customTipCurrency === "FIAT" && currency !== "SATS" ? "pl-6 md:pl-8 xl:pl-8" : ""}`}
                    value={customTipValue}
                    onChange={handleCustomTipChange}
                    placeholder={
                      currency !== "SATS" && customTipCurrency === "FIAT" 
                        ? ((baseAmount * 0.15) / (fiatRate || 1)).toFixed(2)
                        : Math.round(baseAmount * 0.15).toString()
                    }
                  />
                </div>
              </div>
            )}

            {/* Tip amount display */}
            {tipAmount > 0 && (
              <div className="text-center mb-6 md:mb-8">
                <div className="flex items-center justify-center">
                  <span className="text-gray-400 text-sm md:text-base xl:text-base mr-1 md:mr-2">Tip amount:</span>
                  <span className="text-white text-lg md:text-xl xl:text-xl font-medium">
                    {currency === "SATS" && selectedTip === CUSTOM_TIP && customTipValue
                      ? `${parseInt(customTipValue) || 0} ${parseInt(customTipValue) === 1 ? "sat" : "sats"}`
                      : currency === "SATS" 
                        ? `${tipAmount} ${tipAmount === 1 ? "sat" : "sats"}`
                        : displayFiatTipAmount || "Calculating..."}
                  </span>
                </div>
                {currency !== "SATS" && fiatRate && (
                  <p className="text-xs md:text-sm xl:text-sm text-gray-400">
                    {tipAmount} {tipAmount === 1 ? "sat" : "sats"}
                  </p>
                )}

                <p className="text-xs md:text-sm xl:text-sm text-gray-400 mt-3">
                  Total with tip: {
                    currency === "SATS" && selectedTip === CUSTOM_TIP && customTipValue
                      ? baseAmount + (parseInt(customTipValue) || 0)
                      : baseAmount + tipAmount
                  } {(
                    currency === "SATS" && selectedTip === CUSTOM_TIP && customTipValue
                      ? (baseAmount + (parseInt(customTipValue) || 0)) === 1
                      : (baseAmount + tipAmount) === 1
                  ) ? "sat" : "sats"}
                </p>
              </div>
            )}

            {/* Action button */}
            <div className="w-full">
              {tipAmount > 0 ? (
                <button
                  className={`${actionButtonClass} h-12 md:h-14 xl:h-14 text-base md:text-lg xl:text-lg font-bold`}
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  Add Tip
                  {isLoading && <span className="loading loading-spinner ml-2"></span>}
                </button>
              ) : (
                <button
                  className="btn bg-white text-black hover:bg-gray-200 w-full h-12 md:h-14 xl:h-14 text-base md:text-lg xl:text-lg font-bold"
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
      
      {/* Alert Modal for errors */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
      />
    </>
  );
}