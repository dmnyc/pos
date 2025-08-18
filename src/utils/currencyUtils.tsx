/**
 * Utility functions for currency formatting and display
 */

// Define interface for currency symbol properties
interface CurrencySymbolProps {
  symbol: string;   // The actual symbol or text to display
  isSymbol: boolean; // Whether it's a standalone symbol (true) or text/letters (false)
}

// Map of currency codes to their symbol properties
export const currencySymbols: Record<string, CurrencySymbolProps> = {
  // Single-character symbols
  USD: { symbol: '$', isSymbol: true },
  EUR: { symbol: '€', isSymbol: true },
  GBP: { symbol: '£', isSymbol: true },
  JPY: { symbol: '¥', isSymbol: true },
  CNY: { symbol: '¥', isSymbol: true },
  KRW: { symbol: '₩', isSymbol: true },
  INR: { symbol: '₹', isSymbol: true },
  TRY: { symbol: '₺', isSymbol: true },
  PHP: { symbol: '₱', isSymbol: true },
  ILS: { symbol: '₪', isSymbol: true },
  VND: { symbol: '₫', isSymbol: true },
  
  // Dollar-based symbols - treat the $ consistently
  AUD: { symbol: '$', isSymbol: true }, // Australian Dollar
  CAD: { symbol: '$', isSymbol: true }, // Canadian Dollar
  SGD: { symbol: '$', isSymbol: true }, // Singapore Dollar
  NZD: { symbol: '$', isSymbol: true }, // New Zealand Dollar
  HKD: { symbol: '$', isSymbol: true }, // Hong Kong Dollar
  MXN: { symbol: '$', isSymbol: true }, // Mexican Peso
  TWD: { symbol: '$', isSymbol: true }, // Taiwan Dollar
  CLP: { symbol: '$', isSymbol: true }, // Chilean Peso
  
  // Special case with prefix letter
  BRL: { symbol: 'R$', isSymbol: true }, // Brazilian Real
  
  // Text-based representations (using small caps styling in component)
  CHF: { symbol: 'FR', isSymbol: false }, // Swiss Franc
  ZAR: { symbol: 'R', isSymbol: false }, // South African Rand
  PLN: { symbol: 'ZŁ', isSymbol: false }, // Polish Złoty
  RUB: { symbol: '₽', isSymbol: false }, // Russian Ruble
  THB: { symbol: '฿', isSymbol: false }, // Thai Baht
  NOK: { symbol: 'KR', isSymbol: false }, // Norwegian Krone
  SEK: { symbol: 'KR', isSymbol: false }, // Swedish Krona
  DKK: { symbol: 'KR', isSymbol: false }, // Danish Krone
  IDR: { symbol: 'RP', isSymbol: false }, // Indonesian Rupiah
  AED: { symbol: 'AED', isSymbol: false }, // UAE Dirham
  SAR: { symbol: 'SAR', isSymbol: false }, // Saudi Riyal
  CZK: { symbol: 'KČ', isSymbol: false }, // Czech Koruna
  MYR: { symbol: 'RM', isSymbol: false }, // Malaysian Ringgit
  SATS: { symbol: 'SATS', isSymbol: false }, // Satoshis
};

// Default to currency code if no symbol is available
export const getCurrencySymbol = (currencyCode: string): CurrencySymbolProps => {
  return currencySymbols[currencyCode] || { symbol: currencyCode, isSymbol: false };
};

interface FormatAmountOptions {
  amount: number;
  currency: string;
  showSymbol?: boolean;
  symbolClass?: string;
  valueClass?: string;
  showCurrencyCode?: boolean;
}

/**
 * Format an amount with appropriate currency symbol
 * For SATS, displays the amount with "SATS" suffix in a smaller font with small caps
 * For fiat currencies, displays with appropriate symbol prefix
 */
export const formatAmount = ({
  amount,
  currency,
  showSymbol = true,
  symbolClass = "text-gray-500",
  valueClass = "text-white",
  showCurrencyCode = false,
}: FormatAmountOptions): JSX.Element => {
  const currencySymbol = getCurrencySymbol(currency);
  
  // Special case: for dollar currencies that aren't USD, show the currency code
  const shouldShowCurrencyCode = showCurrencyCode || 
    (currencySymbol.isSymbol && currencySymbol.symbol === '$' && currency !== 'USD');
    
  // Special case: for BRL (Brazilian Real), we don't want to add the currency code since it's already in the symbol
  const isBRL = currency === 'BRL';

  // Format amount according to the currency's conventions
  const formattedValue = currency === "SATS" 
    ? amount.toLocaleString()
    : new Intl.NumberFormat('en-US', { 
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);

  // For SATS, we want the symbol to follow the amount rather than precede it
  if (currency === "SATS") {
    return (
      <span className="inline-flex items-center">
        <span className={`${valueClass} inline-block`}>
          {formattedValue}
        </span>
        {showSymbol && (
          <span className={`${symbolClass} ml-2 md:ml-3 lg:ml-3 wide:ml-4 lg:landscape:ml-2 text-xl md:text-2xl lg:text-2xl wide:text-3xl lg:landscape:text-xl font-semibold uppercase tracking-wider inline-block align-baseline`} style={{ position: 'relative', top: '0' }}>
            {currencySymbol.symbol}
          </span>
        )}
      </span>
    );
  }

  // For all other currencies, symbol precedes the amount
  return (
    <span className="inline-flex items-center">
      {showSymbol && (
        <span className={`inline-block align-baseline ${
          currencySymbol.isSymbol 
            ? `${symbolClass} text-4xl md:text-5xl lg:text-5xl wide:text-7xl lg:landscape:text-4xl mr-2 md:mr-3 lg:mr-3 wide:mr-4 lg:landscape:mr-2` 
            : `${symbolClass} text-xl md:text-2xl lg:text-2xl wide:text-3xl lg:landscape:text-xl font-semibold uppercase tracking-wider mr-2 md:mr-3 lg:mr-3 wide:mr-4 lg:landscape:mr-2`
        }`} style={{ position: 'relative', top: currencySymbol.isSymbol ? '0.1em' : '0' }}>
          {currencySymbol.symbol}
        </span>
      )}
      <span className={`${valueClass} inline-block`}>
        {formattedValue}
      </span>
      {shouldShowCurrencyCode && !isBRL && (
        <span className={`${symbolClass} ml-2 md:ml-3 lg:ml-3 wide:ml-4 lg:landscape:ml-2 text-xl md:text-2xl lg:text-2xl wide:text-3xl lg:landscape:text-xl font-semibold uppercase tracking-wider inline-block align-baseline`} style={{ position: 'relative', top: '0' }}>
          {currency !== 'SATS' && currency}
        </span>
      )}
    </span>
  );
};

/**
 * Format an amount as a string with currency symbol
 */
export const formatAmountString = (amount: number, currency: string): string => {
  if (currency === "SATS") {
    return `${amount.toLocaleString()} SATS`;
  }

  const symbolProps = getCurrencySymbol(currency);
  
  // Use Intl.NumberFormat to handle the decimal formatting consistently
  const formattedNumber = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  // Special case for BRL (Brazilian Real)
  if (currency === 'BRL') {
    return `${symbolProps.symbol} ${formattedNumber}`;
  }
  
  // For dollar-based currencies that aren't USD, include the currency code
  if (symbolProps.symbol === '$' && currency !== 'USD') {
    return `${symbolProps.symbol} ${formattedNumber} ${currency}`;
  }
  
  return `${symbolProps.symbol} ${formattedNumber}`;
};