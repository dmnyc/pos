import { defineConfig } from "vite";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react-swc";

const pwaConfig: Partial<VitePWAOptions> = {
  includeAssets: ["shortcut-icon.png", "icon.png"],
  registerType: 'autoUpdate',
  workbox: {
    navigateFallback: 'index.html',
    globPatterns: ['**/*.{js,css,html,png,svg,ico}']
  },
  manifest: {
    name: "Sats Factory POS",
    short_name: "Sats Factory",
    description: "Sats Factory's super simple self-custodial PoS",
    scope: "/",
    background_color: "#000000",
    theme_color: "#000000",
    display: "standalone",
    orientation: "portrait",
    start_url: "/",
    icons: [
      {
        src: "shortcut-icon.png",
        type: "image/png",
        sizes: "256x256", // TODO: replace with 512x512 image
        purpose: "any maskable"
      },
    ],
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(pwaConfig)],
  base: "/",
  server: {
    host: "0.0.0.0",
  },
});
