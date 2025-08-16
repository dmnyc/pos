# Payment UI Consistency - Visual Comparison Guide

This document visually highlights the key consistency improvements made to the payment pages.

## Container Structure Consistency

All payment pages now follow the same container hierarchy:

```html
<PageContainer>
  <div className="flex flex-col items-center justify-center w-full max-w-* mx-auto py-*">
    <form className="flex flex-col items-center w-full">
      <!-- Content sections -->
    </form>
  </div>
</PageContainer>
```

## Consistent Breakpoint Patterns

All responsive styles follow the same pattern:

| Breakpoint | Screen Size | Example Classes |
|------------|-------------|-----------------|
| Default (mobile) | < 768px | `h-8 text-lg mb-4` |
| md (tablet) | ≥ 768px | `md:h-14 md:text-2xl md:mb-6` |
| lg (desktop) | ≥ 1024px | `lg:h-14 lg:text-2xl lg:mb-8` |
| lg:landscape | ≥ 1024px and landscape | `lg:landscape:h-10 lg:landscape:text-lg lg:landscape:mb-6` |
| wide (large screens) | ≥ 1536px | `wide:h-24 wide:text-4xl wide:mb-10` |

## Element Spacing Consistency

### Keypad Buttons
- Default gap: `gap-1.5`
- Medium screens: `md:gap-2`
- Large screens: `lg:gap-2`
- Landscape mode: `lg:landscape:gap-1.5`
- Wide screens: `wide:gap-3`

### Section Margins
- Default margin: `mb-4`
- Medium screens: `md:mb-6`
- Large screens: `lg:mb-8`
- Landscape mode: `lg:landscape:mb-6`
- Wide screens: `wide:mb-10`

## Button Styling Consistency

### Keypad Number Buttons
```html
<button
  className="btn bg-white text-black hover:bg-gray-200 w-full h-8 md:h-14 lg:h-14 
  lg:landscape:h-10 wide:h-24 flex-grow-0 text-lg md:text-2xl lg:text-2xl 
  lg:landscape:text-lg wide:text-4xl flex items-center justify-center p-0"
>
  {num}
</button>
```

### Primary Action Buttons
```html
<button
  className="{themeSpecificClass} w-full h-8 md:h-14 lg:h-14 
  lg:landscape:h-10 wide:h-24 text-base md:text-xl lg:text-xl 
  lg:landscape:text-base wide:text-3xl"
>
  {actionText}
</button>
```

### Secondary Action Buttons
```html
<button
  className="btn btn-ghost text-gray-400 hover:bg-gray-800 hover:text-white 
  w-full h-7 md:h-10 lg:h-10 lg:landscape:h-8 wide:h-16 
  text-sm md:text-lg lg:text-lg lg:landscape:text-sm wide:text-2xl"
>
  {actionText}
</button>
```

## Currency Selector Consistency

All currency selectors now use the same structure and styling:

```html
<div className="relative flex items-center hover:bg-gray-800 bg-gray-900 rounded-md 
px-2 py-1 md:px-4 md:py-2 lg:px-4 lg:py-2 wide:px-6 wide:py-3 
lg:landscape:px-3 lg:landscape:py-1.5 border border-gray-800">
  <select
    className="pr-6 md:pr-8 lg:pr-8 wide:pr-10 lg:landscape:pr-6 
    whitespace-nowrap mx-auto bg-transparent text-gray-300 cursor-pointer 
    appearance-none z-10 text-sm md:text-base lg:text-base 
    wide:text-2xl lg:landscape:text-sm"
  >
    {/* Options */}
  </select>
  <svg 
    className="h-3 w-3 md:h-4 md:w-4 lg:h-4 lg:w-4 wide:h-6 wide:w-6 
    lg:landscape:h-3 lg:landscape:w-3 pointer-events-none text-gray-500 
    absolute right-2 md:right-3 lg:right-3 wide:right-4 lg:landscape:right-2"
  >
    {/* SVG path */}
  </svg>
</div>
```

## Amount Display Consistency

All amount displays follow the same pattern:

```html
<div className="flex flex-col mb-4 md:mb-6 lg:mb-8 wide:mb-10 items-center justify-center">
  <p className="text-5xl md:text-6xl lg:text-6xl wide:text-8xl lg:landscape:text-5xl 
  whitespace-nowrap text-center mx-auto text-white">
    {formattedAmount}
  </p>
  
  <div className="h-5 md:h-7 lg:h-7 wide:h-10 lg:landscape:h-6 mt-1 md:mt-2 wide:mt-4">
    {secondaryDisplay}
  </div>
</div>
```

## Theme-Aware Styling

All pages now consistently apply theme-specific styling for primary buttons:

```typescript
const actionButtonClass = 
  isDisabled
    ? "btn bg-gray-600 text-white w-full" // Inactive state for all themes
    : config.theme === "standard" 
      ? "btn bg-charge-green text-white hover:bg-green-500 w-full"
      : config.theme === "orangepill"
        ? "btn bg-orange-pill-gradient text-black hover:bg-orange-pill-hover w-full"
        : // Additional theme options...
```

## Landscape Mode Optimization

All pages now include specific landscape mode optimizations:

- Reduced element heights: `lg:landscape:h-10`
- Smaller text sizes: `lg:landscape:text-base`
- Adjusted spacing: `lg:landscape:mb-6`
- Width constraints: `lg:landscape:max-w-md`

These improvements ensure that all payment pages maintain a consistent look and feel, making the application more professional and user-friendly.