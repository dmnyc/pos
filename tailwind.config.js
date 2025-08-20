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
        'charge-orange': '#FF9900', // Define orange color for Orange Pill theme
        'beehive-yellow': '#fce169', // Define yellow color for Beehive theme
        'beehive-hover': '#e5cb5e', // Define darker yellow for hover state
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
        'orange-pill-gradient': 'linear-gradient(to bottom, #ff9900, #ff5a20)',
        'orange-pill-hover': 'linear-gradient(to bottom, #ff8800, #ff4800)',
        'nostrich-gradient': 'linear-gradient(to bottom, #d463c4, #b9287a)',
        'nostrich-hover': 'linear-gradient(to bottom, #c253b4, #a9186a)',
        'safari-gradient': 'linear-gradient(to bottom, #4d8c2f, #94b639, #f5b735, #ea8829, #d6492b)',
        'safari-hover': 'linear-gradient(to bottom, #3d7c1f, #84a629, #e5a725, #da7819, #c6391b)',
        'liquidity-gradient': 'linear-gradient(to bottom, #4dd0f9, #0682b0)',
        'liquidity-hover': 'linear-gradient(to bottom, #3cc0e9, #0572a0)',
        'acidity-gradient': 'linear-gradient(100deg, #D6E030, #C5DA3D, #B3D44D, #A7D056, #A4CF5A, #69C184, #0ABFDB, #24BDC2)',
        'acidity-hover': 'linear-gradient(100deg, #C6D020, #B5CA2D, #A3C43D, #97C046, #94BF4A, #59B174, #00AFCB, #14ADB2)',
        'nutjob-gradient': 'linear-gradient(to bottom, #e3d3b5, #dcc099, #c6a980, #b08c5b)',
        'nutjob-hover': 'linear-gradient(to bottom, #d3c3a5, #ccb089, #b69970, #a07c4b)',
        'solid-state-gradient': 'linear-gradient(to bottom, #e8cd72, #e2a15c, #d7763e, #8f2713, #892333)',
        'solid-state-hover': 'linear-gradient(to bottom, #d8bd62, #d2914c, #c7662e, #7f1703, #791323)',
        'blocktron-gradient': 'linear-gradient(to right, #ff9900, #ff7a30, #ff00aa, #7b00ff, #00FFFF)',
        'blocktron-hover': 'linear-gradient(to right, #ff9900, #ef6a20, #ef009a, #6b00ef, #00FFFF)',
      },
    },
    screens: {
      sm: "400px", // For small phones
      md: "768px", // For larger phones and small tablets
      lg: "1024px", // For tablets like iPad mini
      xl: "1280px", // For larger tablets and desktops
      '2xl': "1536px", // For large desktop displays
      'landscape': {'raw': '(orientation: landscape)'},
      'wide': {'raw': 'screen and (min-width: 1024px) and (orientation: landscape)'}, // For wide landscape viewports
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
      {
        orangepill: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
          ...require("daisyui/src/theming/themes")["dark"], // Use dark as base theme
          primary: "#FFFFFF", // White buttons
          "primary-content": "#000000", // Black text on primary buttons
          secondary: "#FFFFFF", // White for secondary elements
          "secondary-content": "#000000", // Black text on secondary elements
          accent: "#FF9900", // Orange for accent elements (charge button)
          "accent-content": "#000000", // Black text on orange buttons for better contrast
          neutral: "#333333", // Dark grey for neutral elements
          "base-100": "#000000", // Black background
          "base-content": "#FFFFFF", // White text on base elements
        },
      },
      {
        nostrich: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
          ...require("daisyui/src/theming/themes")["dark"], // Use dark as base theme
          primary: "#FFFFFF", // White buttons
          "primary-content": "#000000", // Black text on primary buttons
          secondary: "#FFFFFF", // White for secondary elements
          "secondary-content": "#000000", // Black text on secondary elements
          accent: "#d463c4", // Purple for accent elements (charge button)
          "accent-content": "#FFFFFF", // White text on purple buttons for better contrast
          neutral: "#333333", // Dark grey for neutral elements
          "base-100": "#000000", // Black background
          "base-content": "#FFFFFF", // White text on base elements
        },
      },
      {
        beehive: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
          ...require("daisyui/src/theming/themes")["dark"], // Use dark as base theme
          primary: "#FFFFFF", // White buttons
          "primary-content": "#000000", // Black text on primary buttons
          secondary: "#FFFFFF", // White for secondary elements
          "secondary-content": "#000000", // Black text on secondary elements
          accent: "#fce169", // Yellow for accent elements (charge button)
          "accent-content": "#000000", // Black text on yellow buttons for better contrast
          neutral: "#333333", // Dark grey for neutral elements
          "base-100": "#000000", // Black background
          "base-content": "#FFFFFF", // White text on base elements
        },
      },
      {
        liquidity: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
          ...require("daisyui/src/theming/themes")["dark"], // Use dark as base theme
          primary: "#FFFFFF", // White buttons
          "primary-content": "#000000", // Black text on primary buttons
          secondary: "#FFFFFF", // White for secondary elements
          "secondary-content": "#000000", // Black text on secondary elements
          accent: "#4dd0f9", // Blue for accent elements (charge button)
          "accent-content": "#000000", // Black text on blue buttons for better contrast
          neutral: "#333333", // Dark grey for neutral elements
          "base-100": "#000000", // Black background
          "base-content": "#FFFFFF", // White text on base elements
        },
      },
      {
        acidity: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
          ...require("daisyui/src/theming/themes")["dark"], // Use dark as base theme
          primary: "#FFFFFF", // White buttons
          "primary-content": "#000000", // Black text on primary buttons
          secondary: "#FFFFFF", // White for secondary elements
          "secondary-content": "#000000", // Black text on secondary elements
          accent: "#D6E030", // Yellow-green for accent elements
          "accent-content": "#000000", // Black text on accent elements for better contrast
          neutral: "#333333", // Dark grey for neutral elements
          "base-100": "#000000", // Black background
          "base-content": "#FFFFFF", // White text on base elements
        },
      },
      {
        nutjob: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
          ...require("daisyui/src/theming/themes")["dark"], // Use dark as base theme
          primary: "#FFFFFF", // White buttons
          "primary-content": "#000000", // Black text on primary buttons
          secondary: "#FFFFFF", // White for secondary elements
          "secondary-content": "#000000", // Black text on secondary elements
          accent: "#b08c5b", // Brown for accent elements
          "accent-content": "#000000", // Black text on accent elements for better contrast
          neutral: "#333333", // Dark grey for neutral elements
          "base-100": "#000000", // Black background
          "base-content": "#FFFFFF", // White text on base elements
        },
      },
      {
        safari: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
          ...require("daisyui/src/theming/themes")["dark"], // Use dark as base theme
          primary: "#FFFFFF", // White buttons
          "primary-content": "#000000", // Black text on primary buttons
          secondary: "#FFFFFF", // White for secondary elements
          "secondary-content": "#000000", // Black text on secondary elements
          accent: "#4d8c2f", // Green for accent elements (charge button)
          "accent-content": "#000000", // Black text on buttons for better contrast
          neutral: "#333333", // Dark grey for neutral elements
          "base-100": "#000000", // Black background
          "base-content": "#FFFFFF", // White text on base elements
        },
      },
      {
        solid-state: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
          ...require("daisyui/src/theming/themes")["dark"], // Use dark as base theme
          primary: "#FFFFFF", // White buttons
          "primary-content": "#000000", // Black text on primary buttons
          secondary: "#FFFFFF", // White for secondary elements
          "secondary-content": "#000000", // Black text on secondary elements
          accent: "#e8cd72", // Golden for accent elements
          "accent-content": "#000000", // Black text on accent elements for better contrast
          neutral: "#333333", // Dark grey for neutral elements
          "base-100": "#000000", // Black background
          "base-content": "#FFFFFF", // White text on base elements
        },
      },
      {
        blocktron: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
          ...require("daisyui/src/theming/themes")["dark"], // Use dark as base theme
          primary: "#FFFFFF", // White buttons
          "primary-content": "#000000", // Black text on primary buttons
          secondary: "#FFFFFF", // White for secondary elements
          "secondary-content": "#000000", // Black text on secondary elements
          accent: "#ff00aa", // Neon pink for accent elements (charge button)
          "accent-content": "#FFFFFF", // White text on buttons for better contrast
          neutral: "#333333", // Dark grey for neutral elements
          "base-100": "#000000", // Black background
          "base-content": "#FFFFFF", // White text on base elements
        },
      },
    ],
  },
};