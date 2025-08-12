/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        'charge-green': '#00cc66', // Define a custom green color for the charge button
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
        light: {
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
        dark: {
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
    ],
  },
};