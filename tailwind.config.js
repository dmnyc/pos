/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Mono", "monospace"],
      },
      colors: {
        'charge-green': '#00cc66', // Define a custom green color for the charge button
      },
      fontSize: {
        'xs': '0.65rem',    // Further reduced
        'sm': '0.75rem',    // Further reduced
        'base': '0.85rem',  // Further reduced
        'lg': '0.95rem',    // Further reduced
        'xl': '1.05rem',    // Further reduced
        '2xl': '1.25rem',   // Further reduced
        '3xl': '1.5rem',    // Further reduced
        '4xl': '1.75rem',   // Further reduced
        '5xl': '2.5rem',    // Reduced
        '6xl': '3.25rem',   // Reduced
        '7xl': '4rem',      // Reduced but still large enough for keypad numbers
      },
      spacing: {
        // Additional custom spacing values for tablet optimization
        '1/10': '10%',
        '1/8': '12.5%',
      },
      height: {
        'tablet-content': 'calc(100vh - 120px)', // Useful for main content areas
      },
      backgroundImage: {
        'industrial-gradient': 'linear-gradient(to right, #81726d, #e7b7a0, #ffffff, #e9be93, #cccccc, #858585)',
      },
    },
    screens: {
      sm: "400px", // decrease small breakpoint from 640px to support small phones (e.g. iPhone SE)
    },
  },
  // eslint-disable-next-line no-undef
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        standard: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
          ...require("daisyui/src/theming/themes")["dark"], // Use dark as base theme
          primary: "#FFFFFF", // White buttons
          "primary-content": "#000000", // Black text on primary buttons
          secondary: "#FFFFFF", // White for secondary elements
          "secondary-content": "#000000", // Black text on secondary elements
          accent: "#00cc66", // Green for accent elements (charge button)
          "accent-content": "#FFFFFF", // White text on accent elements
          neutral: "#333333", // Dark grey for neutral elements
          "base-100": "#000000", // Black background
          "base-content": "#FFFFFF", // White text on base elements
        },
      },
      {
        industrial: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
          ...require("daisyui/src/theming/themes")["dark"], // Use dark as base theme
          primary: "#FFFFFF", // White buttons
          "primary-content": "#000000", // Black text on primary buttons
          secondary: "#FFFFFF", // White for secondary elements
          "secondary-content": "#000000", // Black text on secondary elements
          accent: "#81726d", // Just a base color for the accent (will use gradient in components)
          "accent-content": "#000000", // Black text on accent elements
          neutral: "#333333", // Dark grey for neutral elements
          "base-100": "#000000", // Black background
          "base-content": "#FFFFFF", // White text on base elements
        },
      },
    ],
  },
};