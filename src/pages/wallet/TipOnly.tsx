import React, { FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import useStore from "../../state/store";
import { fiat } from "@getalby/lightning-tools";
import { localStorageKeys, getMerchantConfig } from "../../config";

export function TipOnly() {
  const [amount, setAmount] = React.useState(0); // Current input
  const [total, setTotal] = React.useState(0); // Total amount
  const [totalInSats, setTotalInSats] = React.useState(0); // Total amount in sats
  const [isLoading, setLoading] = React.useState(false);
  const [currency, setCurrency] = React.useState("USD"); // Default to USD instead of SATS
  const navigate = useNavigate();
  const provider = useStore((store) => store.provider);
  const location = useLocation(); // Get the current location
  const [currencies, setCurrencies] = React.useState<string[]>(["USD", "SATS"]); // Default list with USD first
  const config = getMerchantConfig();

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const response = await fetch(`https://getalby.com/api/rates`);
        const data = (await response.json()) as Record<string, { priority: number }>;

        const mappedCurrencies = Object.entries(data);

        mappedCurrencies.sort((a, b) => a[1].priority - b[1].priority);

        // Make sure USD and SATS are included, with USD first
        const allCurrencies = ["USD", "SATS", ...mappedCurrencies
          .map((currency) => currency[0].toUpperCase())
          .filter(curr => curr !== "USD" && curr !== "SATS")];
        
        setCurrencies(allCurrencies);
      } catch (error) {
        console.error(error);
      }
    }

    fetchCurrencies();
  }, []);

  useEffect(() => {
    // Load currency and label from local storage on component mount
    const savedCurrency = localStorage.getItem(localStorageKeys.currency);
    if (savedCurrency) {
      setCurrency(savedCurrency);
    } else {
      // Set USD as default if no saved currency
      localStorage.setItem(localStorageKeys.currency, "USD");
    }
  }, []); // Run once on mount

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
      
      const invoice = await provider.makeInvoice({
        amount: totalInSats.toString(),
        defaultMemo: memo,
      });
      
      // Navigate with isTipPayment flag to prevent follow-up tip prompt
      navigate(`../pay/${invoice.paymentRequest}`, { 
        state: { 
          isTipPayment: true 
        }
      });
    } catch (error) {
      console.error(error);
      alert("Failed to create invoice: " + error);
      setLoading(false);
    }
  }

  const handleNumberClick = (num: string) => {
    const newAmount = parseInt(amount.toString() + num); // Concatenate the new number without leading zero
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
    setTotal(newAmount); // Total is now the same as amount
  };

  const handleClear = () => {
    setAmount(0);
    setTotal(0);
  };

  const formatNumber = (num: number, numberOnly = false) => {
    if (currency === "SATS") {
      return num.toString();
    }
    let result = new Intl.NumberFormat("en-US", { style: "currency", currency: currency }).format(
      num / 100
    );
    if (numberOnly) {
      // For fiat currencies in the main display, remove the currency symbol but add it after the number
      const numericPart = result.replace(/[^0-9\\.,]/g, "");
      return numericPart;
    }
    return result;
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
              : config.theme === "safari"
                ? "btn bg-safari-gradient text-black hover:bg-safari-hover w-full h-10 text-base font-bold flex-grow-0"
                : config.theme === "blocktron"
                  ? "btn bg-blocktron-gradient text-white hover:bg-blocktron-hover w-full h-10 text-base font-bold flex-grow-0"
                  : "btn btn-industrial-gradient w-full h-10 text-base font-bold flex-grow-0";

  return (
    <>
      <Navbar />
      <div className="flex w-full h-[calc(100vh-40px)] md:h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] flex-col items-center justify-between bg-black text-white" data-theme={config.theme}>
        <form
          onSubmit={onSubmit}
          className="flex flex-col items-center justify-center w-full flex-1 pb-0"
        >
          {/* Main content layout with proper vertical distribution */}
          <div className="flex flex-col items-center w-full flex-1">
            {/* Logo to price spacing - increased */}
            <div className="flex-1 max-h-24"></div>
            
            {/* Amount display section - centered between logo and store name */}
            <div className="flex flex-col mb-3 md:mb-6 items-center justify-center h-[84px] md:h-[120px] lg:h-[140px]">
              <p className="text-5xl md:text-6xl lg:text-7xl whitespace-nowrap text-center mx-auto text-white">
                {formatNumber(amount, true)}
              </p>
              
              {/* Secondary display showing the sats value when using fiat - fixed height container with placeholder */}
              <div className="h-5 md:h-7 lg:h-9">
                {currency !== "SATS" ? (
                  <p className="text-sm md:text-lg lg:text-xl whitespace-nowrap text-center mx-auto text-gray-400">
                    {totalInSats > 0 
                      ? new Intl.NumberFormat().format(totalInSats) + (totalInSats === 1 ? " sat" : " sats") 
                      : "0 sats"}
                  </p>
                ) : null}
              </div>
              
              <div className="flex items-center justify-center mt-2 md:mt-4">
                <div className="relative flex items-center hover:bg-gray-800 bg-gray-900 rounded-md px-2 py-1 md:px-4 md:py-2 lg:px-5 lg:py-3 border border-gray-800">
                  <select
                    className="pr-6 md:pr-8 lg:pr-10 whitespace-nowrap mx-auto bg-transparent text-gray-300 cursor-pointer appearance-none z-10 text-sm md:text-base lg:text-lg"
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
                    className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 pointer-events-none text-gray-500 absolute right-2 md:right-3 lg:right-4" 
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
            
            {/* Price to store name spacing - increased */}
            <div className="flex-1 max-h-24"></div>
            
            {/* Merchant name/label - moved down */}
            <div className="flex items-center justify-center mb-4 md:mb-8">
              <p className="text-gray-400 text-sm md:text-xl lg:text-2xl">{config.name}</p>
            </div>
            
            {/* Keypad section - moved down */}
            <div className="w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto">
              {/* Keypad with slightly reduced vertical spacing */}
              <div className="grid grid-cols-3 gap-1 md:gap-3 lg:gap-4 w-full mb-4 md:mb-6 lg:mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button" // Prevent form submission
                    className="btn bg-white text-black hover:bg-gray-200 w-full h-8 md:h-14 lg:h-20 flex-grow-0 text-lg md:text-2xl lg:text-3xl flex items-center justify-center p-0"
                    onClick={() => handleNumberClick(`${num}`)}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button" // Prevent form submission
                  className="btn bg-white text-black hover:bg-gray-200 w-full h-8 md:h-14 lg:h-20 flex-grow-0 text-lg md:text-2xl lg:text-3xl flex items-center justify-center p-0"
                  onClick={() => handleNumberClick(`00`)}
                  disabled={currency === "SATS"}
                >
                  00
                </button>

                <button
                  type="button" // Prevent form submission
                  className="btn bg-white text-black hover:bg-gray-200 w-full h-8 md:h-14 lg:h-20 flex-grow-0 text-lg md:text-2xl lg:text-3xl flex items-center justify-center p-0"
                  onClick={() => handleNumberClick(`0`)}
                >
                  0
                </button>

                <button
                  type="button" // Prevent form submission
                  className="btn bg-red-500 text-white hover:bg-red-600 active:bg-red-700 w-full h-8 md:h-14 lg:h-20 flex-grow-0 text-lg md:text-2xl lg:text-3xl flex items-center justify-center p-0"
                  onClick={handleDelete}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="md:w-8 md:h-8 lg:w-10 lg:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                    <line x1="18" y1="9" x2="12" y2="15"></line>
                    <line x1="12" y1="9" x2="18" y2="15"></line>
                  </svg>
                </button>
              </div>
              
              {/* Tip button and action buttons - more compact */}
              <div className="flex flex-col gap-1 md:gap-3 mb-1 md:mb-4">
                <button
                  className={chargeButtonClass.replace('h-10', 'h-8 md:h-14 lg:h-20')}
                  type="submit"
                  disabled={isLoading || total <= 0 || totalInSats <= 0}
                >
                  <span className="text-base md:text-xl lg:text-2xl">
                    Tip {new Intl.NumberFormat().format(totalInSats)} {totalInSats === 1 ? "sat" : "sats"}
                  </span>
                  {isLoading && <span className="loading loading-spinner loading-xs md:loading-md"></span>}
                </button>
                
                <div className="flex gap-2">
                  <button
                    type="button" // Prevent form submission
                    className="btn btn-ghost text-gray-400 hover:bg-gray-800 hover:text-white flex-1 h-7 md:h-10 lg:h-12 text-sm md:text-lg lg:text-xl"
                    onClick={handleClear}
                  >
                    Clear
                  </button>
                  <button
                    type="button" // Prevent form submission
                    className="btn bg-red-500 text-white hover:bg-red-600 flex-1 h-7 md:h-10 lg:h-12 text-sm md:text-lg lg:text-xl"
                    onClick={() => navigate("../new")}
                  >
                    Cancel Tip
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}