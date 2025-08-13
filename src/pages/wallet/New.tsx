import React, { FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import useStore from "../../state/store";
import { fiat } from "@getalby/lightning-tools";
import { localStorageKeys, getMerchantConfig } from "../../config";
import { PopiconsChevronBottomDuotone } from "@popicons/react";

export function New() {
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
    if (!total) {
      return;
    }
    try {
      if (!provider) {
        throw new Error("wallet not loaded");
      }
      setLoading(true);
      
      // Create memo with store name and include fiat price if not using SATS
      let memo = config.name;
      if (currency !== "SATS") {
        const formattedAmount = formatNumber(total);
        memo += ` - ${formattedAmount}`;
      }
      
      const invoice = await provider.makeInvoice({
        amount: totalInSats.toString(), // Use total for the invoice
        defaultMemo: memo,
      });
      navigate(`../pay/${invoice.paymentRequest}`);
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
  const chargeButtonClass = config.theme === "standard" 
    ? "btn bg-charge-green text-white hover:bg-green-500 w-full h-16 text-xl font-bold flex-grow-0"
    : "btn btn-industrial-gradient w-full h-16 text-xl font-bold flex-grow-0";

  return (
    <>
      <Navbar />
      <div className="flex w-full h-full flex-col items-center justify-between bg-black text-white" data-theme={config.theme}>
        <form
          onSubmit={onSubmit}
          className="flex flex-col items-center justify-center w-full flex-1 pb-1"
        >
          <div className="flex flex-col items-center justify-center w-full flex-1 mb-2">
            {/* Amount display section */}
            <div className="flex flex-1 flex-col mb-2 items-center justify-center">
              <p className="text-6xl whitespace-nowrap text-center mx-auto text-white">
                {formatNumber(amount, true)}
              </p>
              
              {/* Secondary display showing the sats value when using fiat */}
              {currency !== "SATS" && totalInSats > 0 && (
                <p className="text-sm whitespace-nowrap text-center mx-auto text-gray-400 mb-2">
                  {new Intl.NumberFormat().format(totalInSats)} sats
                </p>
              )}
              
              <div className="flex items-center justify-center mt-1 mb-2">
                <div className="relative flex items-center hover:bg-gray-800 bg-gray-900 rounded-md px-3 py-1.5 border border-gray-800">
                  <select
                    className="pr-6 whitespace-nowrap mx-auto bg-transparent text-gray-300 cursor-pointer appearance-none z-10"
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
                    className="h-4 w-4 pointer-events-none text-gray-500 absolute right-2" 
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
            
            {/* Merchant name/label - non-editable, displays store name from settings */}
            <div className="flex items-center gap-2 mb-4">
              <p className="text-gray-400 text-xs">{config.name}</p>
            </div>
            
            {/* Keypad - with constrained width similar to screenshot */}
            <div className="grid grid-cols-3 gap-1 sm:gap-2 w-full max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button" // Prevent form submission
                  className="btn bg-white text-black hover:bg-gray-200 w-full h-10 sm:h-14 flex-grow text-xl flex items-center justify-center"
                  onClick={() => handleNumberClick(`${num}`)}
                >
                  {num}
                </button>
              ))}

              <button
                type="button" // Prevent form submission
                className="btn bg-white text-black hover:bg-gray-200 w-full h-10 sm:h-14 flex-grow text-xl flex items-center justify-center"
                onClick={() => handleNumberClick(`00`)}
                disabled={currency === "SATS"}
              >
                00
              </button>

              <button
                type="button" // Prevent form submission
                className="btn bg-white text-black hover:bg-gray-200 w-full h-10 sm:h-14 flex-grow text-xl flex items-center justify-center"
                onClick={() => handleNumberClick(`0`)}
              >
                0
              </button>

              <button
                type="button" // Prevent form submission
                className="btn bg-red-500 text-white hover:bg-red-600 active:bg-red-700 w-full h-10 sm:h-14 flex-grow text-xl flex items-center justify-center"
                onClick={handleDelete}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                  <line x1="18" y1="9" x2="12" y2="15"></line>
                  <line x1="12" y1="9" x2="18" y2="15"></line>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Charge button - keeping max width same as keypad */}
          <div className="w-full max-w-xs mx-auto flex flex-col gap-4 mt-4 mb-2">
            <button
              className={`${chargeButtonClass} h-14`}
              type="submit"
              disabled={isLoading || total <= 0} // Disable if total is 0
            >
              Charge {new Intl.NumberFormat().format(totalInSats)} sats
              {isLoading && <span className="loading loading-spinner"></span>}
            </button>
            
            <button
              type="button" // Prevent form submission
              className="btn btn-ghost text-gray-400 hover:bg-gray-800 hover:text-white w-full h-10 text-sm"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </>
  );
}