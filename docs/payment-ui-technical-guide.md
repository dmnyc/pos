# Payment UI Consistency - Technical Implementation Guide

## Overview

This document provides technical guidelines for maintaining UI consistency across payment pages. Follow these standards when developing or modifying payment-related pages to ensure a cohesive user experience.

## Container Structure

### Standard Page Layout

Always use the following container structure for payment pages:

```tsx
import { Navbar } from "../../components/Navbar";
import { PageContainer } from "../../components/PageContainer";

export function PaymentPage() {
  return (
    <>
      <Navbar />
      <PageContainer>
        <div className="flex flex-col items-center justify-center w-full max-w-xs md:max-w-md lg:max-w-lg wide:max-w-screen-md mx-auto py-2 md:py-4">
          <form
            onSubmit={onSubmit}
            className="flex flex-col items-center w-full"
          >
            {/* Content sections */}
          </form>
        </div>
      </PageContainer>
    </>
  );
}
```

### PageContainer Usage

The `PageContainer` component handles:
- Correct height calculations based on navbar size
- Theme application
- Flex layout with configurable justification and alignment

```tsx
<PageContainer
  justify="center" // Options: 'center', 'start', 'end', 'between', 'around', 'evenly'
  align="center"   // Options: 'center', 'start', 'end', 'stretch', 'baseline'
>
  {/* Content */}
</PageContainer>
```

## Responsive Design

### Breakpoint System

Use these consistent breakpoint patterns:

```tsx
// Mobile-first (default)
className="h-8 text-lg mb-4 
  
  // Tablet (md)
  md:h-14 md:text-2xl md:mb-6 
  
  // Desktop (lg)
  lg:h-14 lg:text-2xl lg:mb-8 
  
  // Landscape mode optimization
  lg:landscape:h-10 lg:landscape:text-lg lg:landscape:mb-6 
  
  // Extra wide screens (wide)
  wide:h-24 wide:text-4xl wide:mb-10"
```

### Container Width Constraints

Use these max-width constraints for consistent container sizing:

```tsx
// Main container
className="w-full max-w-xs md:max-w-md lg:max-w-lg wide:max-w-screen-md"

// Keypad container
className="w-full max-w-xs md:max-w-md lg:max-w-lg wide:max-w-xl lg:landscape:max-w-md"
```

## Component Standards

### Keypad Layout

Always use this grid layout for keypads:

```tsx
<div className="grid grid-cols-3 gap-1.5 md:gap-2 lg:gap-2 lg:landscape:gap-1.5 wide:gap-3 w-full mb-4 md:mb-6 lg:mb-6 wide:mb-10 lg:landscape:mb-5">
  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
    <button
      key={num}
      type="button"
      className="btn bg-white text-black hover:bg-gray-200 w-full h-8 md:h-14 lg:h-14 lg:landscape:h-10 wide:h-24 flex-grow-0 text-lg md:text-2xl lg:text-2xl lg:landscape:text-lg wide:text-4xl flex items-center justify-center p-0"
      onClick={() => handleNumberClick(`${num}`)}
    >
      {num}
    </button>
  ))}

  {/* 00, 0, and backspace buttons */}
</div>
```

### Currency Selector

Always use this structure for currency selectors:

```tsx
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
```

### Primary Action Button

Use this pattern for main action buttons (with theme-aware styling):

```tsx
// Define the theme-specific button class
const actionButtonClass = 
  isDisabled
    ? "btn bg-gray-600 text-white w-full" // Inactive state for all themes
    : config.theme === "standard" 
      ? "btn bg-charge-green text-white hover:bg-green-500 w-full"
      : config.theme === "orangepill"
        ? "btn bg-orange-pill-gradient text-black hover:bg-orange-pill-hover w-full"
        : // Additional theme options...

// Use the button in the component
<button
  className={actionButtonClass + " h-8 md:h-14 lg:h-14 lg:landscape:h-10 wide:h-24 text-base md:text-xl lg:text-xl lg:landscape:text-base wide:text-3xl"}
  type="submit"
  disabled={isDisabled}
>
  {actionText}
  {isLoading && <span className="loading loading-spinner loading-xs md:loading-md lg:loading-md lg:landscape:loading-xs wide:loading-lg ml-2"></span>}
</button>
```

### Secondary Action Button

Use this pattern for secondary actions:

```tsx
<button
  type="button"
  className="btn btn-ghost text-gray-400 hover:bg-gray-800 hover:text-white w-full h-7 md:h-10 lg:h-10 lg:landscape:h-8 wide:h-16 text-sm md:text-lg lg:text-lg lg:landscape:text-sm wide:text-xl"
  onClick={handleAction}
>
  {actionText}
</button>
```

## Text Styling

### Amount Display

Always use this pattern for primary amount displays:

```tsx
<p className="text-5xl md:text-6xl lg:text-6xl wide:text-8xl lg:landscape:text-5xl whitespace-nowrap text-center mx-auto text-white">
  {formatNumber(amount, true)}
</p>
```

### Secondary Amount Display

Always use this pattern for secondary amount information:

```tsx
<div className="h-5 md:h-7 lg:h-7 wide:h-10 lg:landscape:h-6 mt-1 md:mt-2 wide:mt-4">
  <p className="text-sm md:text-lg lg:text-lg wide:text-3xl lg:landscape:text-base whitespace-nowrap text-center mx-auto text-gray-400">
    {secondaryText}
  </p>
</div>
```

### Merchant Name Display

Always use this pattern for merchant name display:

```tsx
<div className="flex items-center justify-center mb-5 md:mb-8 lg:mb-8 wide:mb-10 lg:landscape:mb-6">
  <p className="text-gray-400 text-sm md:text-xl lg:text-xl wide:text-3xl lg:landscape:text-base">{config.name}</p>
</div>
```

## Spacing Standards

### Section Spacing

Use these standard margin values between major sections:

```tsx
className="mb-4 md:mb-6 lg:mb-8 wide:mb-10 lg:landscape:mb-6"
```

### Button Spacing

Use these standard gap values for button groups:

```tsx
className="gap-1.5 md:gap-2 lg:gap-2 lg:landscape:gap-1.5 wide:gap-3"
```

## Utilities

### Number Formatting

Use a consistent approach for formatting currency and sats:

```tsx
const formatNumber = (num: number, numberOnly = false) => {
  if (currency === "SATS") {
    return num.toString();
  }
  let result = new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: currency 
  }).format(num / 100);
  
  if (numberOnly) {
    // For fiat currencies in the main display, remove the currency symbol
    const numericPart = result.replace(/[^0-9\\.,]/g, "");
    return numericPart;
  }
  return result;
};
```

### Secondary Display Formatting

Use this pattern for formatting secondary sats displays:

```tsx
{totalInSats > 0 
  ? new Intl.NumberFormat().format(totalInSats) + 
    (totalInSats === 1 ? " sat" : " sats") 
  : "0 sats"}
```

## Implementation Checklist

When developing or modifying payment pages, ensure:

1. ✓ The page uses the standard container hierarchy
2. ✓ All responsive breakpoints (md, lg, lg:landscape, wide) are implemented
3. ✓ Button styles match the established patterns
4. ✓ Text sizes and colors follow the standards
5. ✓ Theme-specific styling is implemented for primary actions
6. ✓ Spacing between elements follows the established patterns
7. ✓ Currency selectors use the standard implementation
8. ✓ Number formatting is consistent with other pages
9. ✓ Landscape mode is properly optimized
10. ✓ Loading indicators are consistently implemented

By following these guidelines, we can maintain a consistent, professional UI across all payment pages.