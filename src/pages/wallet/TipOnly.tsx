import React, { FormEvent, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { PageContainer } from "../../components/PageContainer";
import useStore from "../../state/store";
import { fiat } from "@getalby/lightning-tools";
import { getMerchantConfig } from "../../config";
import { localStorageKeys } from "../../constants";
import { formatAmount, formatAmountString } from '../../utils/currencyUtils';
import { AlertModal } from "../../components/Modals";

export function TipOnly() {
  const [amount, setAmount] = React.useState(0); // Current input
  const [total, setTotal] = React.useState(0); // Total amoun
  const [totalInSats, setTotalInSats] = React.useState(0); // Total amount in sats
  const [isLoading, setLoading] = React.useState(false);
  const [currency, setCurrency] = React.useState("USD"); // Default to USD instead of SATS
  const navigate = useNavigate();
  const provider = useStore((store) => store.provider);
  const location = useLocation(); // Get the current location
  const [currencies, setCurrencies] = React.useState<string[]>(["USD", "SATS"]); // Default list with USD firs
  const config = getMerchantConfig();
  
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

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const response = await fetch(`https://getalby.com/api/rates`);
        const data = (await response.json()) as Record<string, { priority: number }>;

        const mappedCurrencies = Object.entries(data);

        mappedCurrencies.sort((a, b) => a[1].priority - b[1].priority);

        // Make sure USD and SATS are included, with USD first, and filter out BTC
        const allCurrencies = ["USD", "SATS", ...mappedCurrencies
          .map((currency) => currency[0].toUpperCase())
          .filter(curr => curr !== "USD" && curr !== "SATS" && curr !== "BTC")];

        setCurrencies(allCurrencies);
      } catch (error) {
        console.error(error);
      }
    }

    fetchCurrencies();
  }, []);

  useEffect(() => {
    // Load currency and label from local storage on component moun
    const savedCurrency = localStorage.getItem(localStorageKeys.currency);
    if (savedCurrency) {
      setCurrency(savedCurrency);
    } else {
      // Set USD as default if no saved currency
      localStorage.setItem(localStorageKeys.currency, "USD");
    }
  }, []); // Run once on moun

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    // Load currency from query parameter and save it to local storage
    const currencyFromQuery = queryParams.get("currency");
    if (currencyFromQuery) {
      localStorage.setItem(localStorageKeys.currency, currencyFromQuery);
      setCurrency(currencyFromQuery);
    }
  }, [location]); // Run once on mount and when location changes

  useEffect(() => {
    const updateTotalInSats = async () => {
      if (currency !== "SATS") {
        const newTotalInSats = await fiat.getSatoshiValue({ amount: total / 100, currency });
        setTotalInSats(newTotalInSats);
      } else {
        setTotalInSats(total); // Set totalInSats directly if currency is SATS
      }
    };

    updateTotalInSats();
  }, [total, currency]); // Re-run when total or currency changes

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!total || totalInSats <= 0) {
      return;
    }
    try {
      if (!provider) {
        throw new Error("wallet not loaded");
      }
      setLoading(true);

      // Create memo with consistent format for tip-only payments
      let memo = `${config.name} - Tip`;
      if (currency !== "SATS") {
        const formattedAmount = formatNumber(total);
        memo += ` (${currency} ${formattedAmount})`;
      }

      // Choose the correct amount value based on currency
      let invoiceAmount = "";
      if (currency === "SATS") {
        // For SATS, use the direct amount value
        invoiceAmount = amount.toString();
        // Log the value for debugging
        console.log(`Creating SATS tip invoice with amount: ${invoiceAmount}`);
      } else {
        // For other currencies, use the calculated totalInSats
        invoiceAmount = totalInSats.toString();
      }

      const invoice = await provider.makeInvoice({
        amount: invoiceAmount,
        defaultMemo: memo,
      });

      // Navigate with isTipPayment flag to prevent follow-up tip promp
      navigate(`../pay/${invoice.paymentRequest}`, {
        state: {
          isTipPayment: true
        }
      });
    } catch (error) {
      console.error(error);
      setAlertState({
        isOpen: true,
        title: 'Tip Creation Failed',
        message: `Failed to create invoice: ${error}`
      });
      setLoading(false);
    }
  }

  const handleNumberClick = (num: string) => {
    // For SATS currency, directly use the number as is
    const newAmount = parseInt(amount.toString() + num); // Concatenate the new number without leading zero
    
    // Check if the new amount exceeds the limit (100,000,000 sats = 1 BTC)
    if (currency === "SATS" && newAmount > 100000000) {
      // Show an alert for exceeding the limit
      setAlertState({
        isOpen: true,
        title: 'Amount Limit Exceeded',
        message: 'The maximum tip amount is 100,000,000 sats (1 BTC)'
      });
      return; // Don't update the amount
    } else if (currency !== "SATS") {
      // For other currencies, check if the equivalent in sats would exceed the limit
      // This is a rough estimate since we don't have the exact conversion yet
      const estimatedSats = newAmount * (totalInSats / total || 0);
      if (estimatedSats > 100000000) {
        setAlertState({
          isOpen: true,
          title: 'Amount Limit Exceeded',
          message: 'The maximum tip amount is equivalent to 100,000,000 sats (1 BTC)'
        });
        return; // Don't update the amount
      }
    }
    
    // Log the value to help with debugging
    console.log(`Input: ${amount.toString() + num} -> ${newAmount}`);
    
    setAmount(newAmount);
    setTotal(newAmount); // Total is now the same as amount since we removed the "+" feature
  };

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);
    localStorage.setItem(localStorageKeys.currency, newCurrency); // Save currency to local storage

    // Update totalInSats based on the new currency
    if (newCurrency !== "SATS") {
      const newTotalInSats = await fiat.getSatoshiValue({ amount: total / 100, currency: newCurrency });
      setTotalInSats(newTotalInSats);
    } else {
      setTotalInSats(total); // If currency is SATS, totalInSats is just total
    }
  };

  const handleDelete = () => {
    const newAmount = parseInt(amount.toString().slice(0, -1)) || 0; // Remove the last character
    setAmount(newAmount);
    setTotal(newAmount); // Total is now the same as amoun
  };

  const handleClear = () => {
    setAmount(0);
    setTotal(0);
  };

  const formatNumber = (num: number, numberOnly = false) => {
    if (currency === "SATS") {
      return num.toString();
    }

    // Convert cents to dollars (or equivalent for other currencies)
    const decimalAmount = num / 100;

    if (numberOnly) {
      // For the main display, return just the number part
      return new Intl.NumberFormat("en-US", { 
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(decimalAmount);
    }

    // Otherwise return the full currency string
    return formatAmountString(decimalAmount, currency);
  };

  // Choose the charge button class based on the theme
  const chargeButtonClass =
    isLoading || total <= 0 || totalInSats <= 0
      ? "btn bg-gray-600 text-white w-full h-10 text-base font-bold flex-grow-0" // Inactive state for all themes
      : config.theme === "standard"
        ? "btn bg-charge-green text-white hover:bg-green-500 w-full h-10 text-base font-bold flex-grow-0"
        : config.theme === "orangepill"
          ? "btn bg-orange-pill-gradient text-black hover:bg-orange-pill-hover w-full h-10 text-base font-bold flex-grow-0"
          : config.theme === "nostrich"
            ? "btn bg-nostrich-gradient text-white hover:bg-nostrich-hover w-full h-10 text-base font-bold flex-grow-0"
            : config.theme === "beehive"
              ? "btn bg-beehive-yellow text-black hover:bg-beehive-hover w-full h-10 text-base font-bold flex-grow-0"
              : config.theme === "liquidity"
                ? "btn bg-liquidity-gradient text-black hover:bg-liquidity-hover w-full h-10 text-base font-bold flex-grow-0"
                : config.theme === "acidity"
                  ? "btn bg-acidity-gradient text-black hover:bg-acidity-hover w-full h-10 text-base font-bold flex-grow-0"
                  : config.theme === "nutjob"
                    ? "btn bg-nutjob-gradient text-black hover:bg-nutjob-hover w-full h-10 text-base font-bold flex-grow-0"
                    : config.theme === "safari"
                      ? "btn bg-safari-gradient text-black hover:bg-safari-hover w-full h-10 text-base font-bold flex-grow-0"
                      : config.theme === "solidstate"
                        ? "btn bg-solidstate-gradient text-white hover:bg-solidstate-hover w-full h-10 text-base font-bold flex-grow-0"
                        : config.theme === "blocktron"
                    ? "btn bg-blocktron-gradient text-white hover:bg-blocktron-hover w-full h-10 text-base font-bold flex-grow-0"
                    : "btn btn-industrial-gradient w-full h-10 text-base font-bold flex-grow-0";

  return (
    <>
      <Navbar />
      <PageContainer>
        <div className="flex flex-col items-center justify-center w-full max-w-xs md:max-w-md lg:max-w-lg wide:max-w-screen-md mx-auto py-2 md:py-4">
          <form
            onSubmit={onSubmit}
            className="flex flex-col items-center w-full"
          >
            {/* Amount display section - centered */}
            <div className="flex flex-col mb-4 md:mb-6 lg:mb-8 wide:mb-10 items-center justify-center">
              <div className="flex items-baseline">
                <span>
                  {currency === "SATS" 
                    ? <span className="inline-flex items-baseline">
                        <span className="text-5xl md:text-6xl lg:text-6xl wide:text-8xl lg:landscape:text-5xl whitespace-nowrap text-center mx-auto text-white">
                          {amount || 0}
                        </span>
                        <span className="text-gray-500 ml-2 md:ml-3 lg:ml-3 wide:ml-4 lg:landscape:ml-2 text-xl md:text-2xl lg:text-2xl wide:text-3xl lg:landscape:text-xl font-semibold uppercase tracking-wider" style={{ position: 'relative', top: '-0.3em' }}>
                          SATS
                        </span>
                      </span>
                    : formatAmount({
                        amount: amount / 100,
                        currency: currency,
                        symbolClass: "text-gray-500",
                        valueClass: "text-5xl md:text-6xl lg:text-6xl wide:text-8xl lg:landscape:text-5xl whitespace-nowrap text-center mx-auto text-white"
                      })
                  }
                </span>
              </div>

              {/* Secondary display showing the sats value when using fiat */}
              <div className="h-5 md:h-7 lg:h-7 wide:h-10 lg:landscape:h-6 mt-1 md:mt-2 wide:mt-4">
                {currency !== "SATS" ? (
                  <p className="text-sm md:text-lg lg:text-lg wide:text-3xl lg:landscape:text-base whitespace-nowrap text-center mx-auto text-gray-400">
                    {totalInSats > 0
                      ? new Intl.NumberFormat().format(totalInSats) + (totalInSats === 1 ? " sat" : " sats")
                      : "0 sats"}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-4 wide:mt-6 lg:landscape:mt-3">
                <div className="relative flex items-center hover:bg-gray-800 bg-gray-900 rounded-md px-2 py-1 md:px-4 md:py-2 lg:px-4 lg:py-2 wide:px-6 wide:py-3 lg:landscape:px-3 lg:landscape:py-1.5 border border-gray-800">
                  <select
                    className="pr-6 md:pr-8 lg:pr-8 wide:pr-10 lg:landscape:pr-6 whitespace-nowrap mx-auto bg-transparent text-gray-300 cursor-pointer appearance-none z-10 text-sm md:text-base lg:text-base wide:text-2xl lg:landscape:text-sm"
                    value={currency}
                    onChange={handleCurrencyChange}
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 md:h-4 md:w-4 lg:h-4 lg:w-4 wide:h-6 wide:w-6 lg:landscape:h-3 lg:landscape:w-3 pointer-events-none text-gray-500 absolute right-2 md:right-3 lg:right-3 wide:right-4 lg:landscape:right-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Merchant name/label */}
            <div className="flex items-center justify-center mb-5 md:mb-8 lg:mb-8 wide:mb-10 lg:landscape:mb-6">
              <p className="text-gray-400 text-sm md:text-xl lg:text-xl wide:text-3xl lg:landscape:text-base">{config.name}</p>
            </div>

            {/* Keypad section */}
            <div className="w-full max-w-xs md:max-w-md lg:max-w-lg wide:max-w-xl lg:landscape:max-w-md mx-auto">
              {/* Keypad with consistent sizing */}
              <div className="grid grid-cols-3 gap-1.5 md:gap-2 lg:gap-2 lg:landscape:gap-1.5 wide:gap-3 w-full mb-4 md:mb-6 lg:mb-6 wide:mb-10 lg:landscape:mb-5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button" // Prevent form submission
                    className="btn bg-white text-black hover:bg-gray-200 w-full h-8 md:h-14 lg:h-14 lg:landscape:h-10 wide:h-24 flex-grow-0 text-lg md:text-2xl lg:text-2xl lg:landscape:text-lg wide:text-4xl flex items-center justify-center p-0"
                    onClick={() => handleNumberClick(`${num}`)}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button" // Prevent form submission
                  className="btn bg-white text-black hover:bg-gray-200 w-full h-8 md:h-14 lg:h-14 lg:landscape:h-10 wide:h-24 flex-grow-0 text-lg md:text-2xl lg:text-2xl lg:landscape:text-lg wide:text-4xl flex items-center justify-center p-0"
                  onClick={() => handleNumberClick(`00`)}
                  disabled={currency === "SATS"}
                >
                  00
                </button>

                <button
                  type="button" // Prevent form submission
                  className="btn bg-white text-black hover:bg-gray-200 w-full h-8 md:h-14 lg:h-14 lg:landscape:h-10 wide:h-24 flex-grow-0 text-lg md:text-2xl lg:text-2xl lg:landscape:text-lg wide:text-4xl flex items-center justify-center p-0"
                  onClick={() => handleNumberClick(`0`)}
                >
                  0
                </button>

                <button
                  type="button" // Prevent form submission
                  className="btn bg-red-500 text-white hover:bg-red-600 active:bg-red-700 w-full h-8 md:h-14 lg:h-14 lg:landscape:h-10 wide:h-24 flex-grow-0 text-lg md:text-2xl lg:text-2xl lg:landscape:text-lg wide:text-4xl flex items-center justify-center p-0"
                  onClick={handleDelete}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="md:w-8 md:h-8 lg:w-8 lg:h-8 lg:landscape:w-6 lg:landscape:h-6 wide:w-12 wide:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                    <line x1="18" y1="9" x2="12" y2="15"></line>
                    <line x1="12" y1="9" x2="18" y2="15"></line>
                  </svg>
                </button>
              </div>

              {/* Tip button and action buttons */}
              <div className="flex flex-col gap-1.5 md:gap-2 lg:gap-2 lg:landscape:gap-1.5 wide:gap-3 mb-4 md:mb-8 lg:mb-8 wide:mb-8 lg:landscape:mb-5">
                <button
                  className={chargeButtonClass.replace('h-10', 'h-8 md:h-14 lg:h-14 lg:landscape:h-10 wide:h-24')}
                  type="submit"
                  disabled={isLoading || total <= 0 || totalInSats <= 0}
                >
                  <span className="text-base md:text-xl lg:text-xl lg:landscape:text-base wide:text-3xl">
                    Tip {currency === "SATS" ? amount : new Intl.NumberFormat().format(totalInSats)} {totalInSats === 1 ? "sat" : "sats"}
                  </span>
                  {isLoading && <span className="loading loading-spinner loading-xs md:loading-md lg:loading-md lg:landscape:loading-xs wide:loading-lg ml-2"></span>}
                </button>

                <div className="flex gap-1.5 md:gap-2 lg:gap-2 lg:landscape:gap-1.5 wide:gap-3">
                  <button
                    type="button" // Prevent form submission
                    className="btn btn-ghost text-gray-400 hover:bg-gray-800 hover:text-white flex-1 h-7 md:h-10 lg:h-10 lg:landscape:h-8 wide:h-16 text-sm md:text-lg lg:text-lg lg:landscape:text-sm wide:text-xl"
                    onClick={handleClear}
                  >
                    Clear
                  </button>
                  <button
                    type="button" // Prevent form submission
                    className="btn bg-red-500 text-white hover:bg-red-600 flex-1 h-7 md:h-10 lg:h-10 lg:landscape:h-8 wide:h-16 text-sm md:text-lg lg:text-lg lg:landscape:text-sm wide:text-xl"
                    onClick={() => navigate("../new")}
                  >
                    Cancel Tip
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </PageContainer>
      
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