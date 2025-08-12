import React, { FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import useStore from "../../state/store";
import { fiat } from "@getalby/lightning-tools";
import { localStorageKeys, getMerchantConfig } from "../../config";
import { PopiconsChevronBottomDuotone, PopiconsEditPencilDuotone } from "@popicons/react";

export const DEFAULT_LABEL = "Lightning POS";

export function New() {
  const [amount, setAmount] = React.useState(0); // Current input
  const [total, setTotal] = React.useState(0); // Total amount
  const [totalInSats, setTotalInSats] = React.useState(0); // Total amount in sats
  const [isLoading, setLoading] = React.useState(false);
  const [currency, setCurrency] = React.useState("USD"); // Default to USD instead of SATS
  const navigate = useNavigate();
  const provider = useStore((store) => store.provider);
  const location = useLocation(); // Get the current location
  const [label, setLabel] = React.useState(
    localStorage.getItem(localStorageKeys.label) || DEFAULT_LABEL
  );
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
    // Load label from query parameter and save it to local storage
    const labelFromQuery = queryParams.get("label") || queryParams.get("name");
    if (labelFromQuery) {
      localStorage.setItem(localStorageKeys.label, labelFromQuery); // Save the label to local storage
      setLabel(labelFromQuery);
    }
    // Load currency from query parameter and save it to local storage
    const currencyFromQuery = queryParams.get("currency");
    if (currencyFromQuery) {
      localStorage.setItem(localStorageKeys.currency, currencyFromQuery); // Save the label to local storage
      setLabel(currencyFromQuery);
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
      let memo = label;
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
      result = result.replace(/[^0-9\\.,]/g, ""); // e.g. remove "THB " prefix as it takes too much space
    }
    return result;
  };

  const handleSetLabel = () => {
    const newLabel = prompt(
      "Enter a label (the label will be added to the payment request and is visible to the customer):",
      localStorage.getItem(localStorageKeys.label) || DEFAULT_LABEL
    );
    if (newLabel) {
      // Save currency to local storage
      localStorage.setItem(localStorageKeys.label, newLabel);
      setLabel(newLabel);
    }
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
          className="flex flex-col items-center justify-center w-full flex-1 pb-2"
        >
          <div className="flex flex-col items-center justify-center w-full flex-1 mb-4">
            {/* Amount display section */}
            <div className="flex flex-1 flex-col mb-4 items-center justify-center">
              <p className="text-7xl pb-2 whitespace-nowrap text-center mx-auto text-white">
                {formatNumber(amount, true)}
              </p>
              <div className="flex items-center justify-center">
                <select
                  className="m-2 w-16 whitespace-nowrap mx-auto bg-transparent text-gray-400 cursor-pointer appearance-none"
                  value={currency}
                  onChange={handleCurrencyChange}
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
                <PopiconsChevronBottomDuotone className="h-4 w-4 -ml-4 pointer-events-none text-gray-400" />
              </div>
            </div>
            
            {/* Merchant name/label */}
            <button type="button" className="flex items-center gap-2 mb-8" onClick={handleSetLabel}>
              <p className="text-gray-400 text-sm">{label}</p>
              <PopiconsEditPencilDuotone className="h-4 w-4 text-gray-400" />
            </button>
            
            {/* Keypad - with constrained width similar to screenshot */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button" // Prevent form submission
                  className="btn bg-white text-black hover:bg-gray-200 w-full h-12 sm:h-16 flex-grow text-2xl flex items-center justify-center"
                  onClick={() => handleNumberClick(`${num}`)}
                >
                  {num}
                </button>
              ))}

              <span className="w-full h-12 sm:h-16 flex-grow text-2xl flex items-center justify-center"></span>

              <button
                type="button" // Prevent form submission
                className="btn bg-white text-black hover:bg-gray-200 w-full h-12 sm:h-16 flex-grow text-2xl flex items-center justify-center"
                onClick={() => handleNumberClick(`0`)}
              >
                0
              </button>

              <button
                type="button" // Prevent form submission
                className="btn bg-white text-black hover:bg-gray-200 w-full h-12 sm:h-16 flex-grow text-2xl flex items-center justify-center"
                onClick={() => handleNumberClick(`00`)}
                disabled={currency === "SATS"}
              >
                .00
              </button>

              <button
                type="button" // Prevent form submission
                className="btn btn-ghost w-full h-6 sm:h-8 flex-grow text-l flex items-center justify-center text-gray-400"
                onClick={handleClear}
              >
                Clear
              </button>

              <button
                type="button" // Prevent form submission
                className="btn btn-ghost w-full h-6 sm:h-8 flex-grow text-l flex items-center justify-center text-gray-400"
                onClick={handleDelete}
              >
                Del
              </button>

              {/* Removed the + button as requested */}
              <span className="w-full h-6 sm:h-8"></span>
            </div>
          </div>
          
          {/* Charge button - keeping max width same as keypad */}
          <div className="w-full max-w-xs mx-auto">
            <button
              className={chargeButtonClass}
              type="submit"
              disabled={isLoading || total <= 0} // Disable if total is 0
            >
              Charge {new Intl.NumberFormat().format(totalInSats)} sats
              {currency !== "SATS" && ` (${formatNumber(total)})`}
              {isLoading && <span className="loading loading-spinner"></span>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}