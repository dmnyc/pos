import { defineConfig } from "vite";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react-swc";
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Read package.json to get version
const packageJson = JSON.parse(
  readFileSync('./package.json', 'utf-8')
);

// Update version.json with the current version and build date
const versionInfo = {
  version: packageJson.version,
  buildDate: new Date().toISOString().split('T')[0]
};

// Write to public/version.json
writeFileSync(
  './public/version.json',
  JSON.stringify(versionInfo, null, 2)
);

const pwaConfig: Partial<VitePWAOptions> = {
  includeAssets: ["shortcut-icon.png", "icon.png", "version.json"],
  registerType: 'autoUpdate',
  workbox: {
    navigateFallback: 'index.html',
    globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
    // Add runtime caching for version.json to check for updates
    runtimeCaching: [{
      urlPattern: /^.*\/version\.json/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'version-cache',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 5 // Cache for 5 minutes
        }
      }
    }]
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
    version: packageJson.version,
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(pwaConfig)],
  base: "/",
  server: {
    host: "0.0.0.0",
  },
  define: {
    // Make version available in the app
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  }
});
