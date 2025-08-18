// This file includes basic tests for the bitcoin-connect components
// Run these checks manually after updating bitcoin-connect dependencies

import { init, disconnect, closeModal, WebLNProviders } from "@getalby/bitcoin-connect-react";

// Test initialization function
export function testBitcoinConnectInit() {
  try {
    init({
      appName: "POS Test",
      appIcon: "https://example.com/icon.png",
      filters: ["nwc"],
      showBalance: false,
      providerConfig: {
        nwc: {
          authorizationUrlOptions: {
            requestMethods: ["get_info", "make_invoice", "lookup_invoice"],
            isolated: true,
          },
        },
      },
    });
    console.log("✅ bitcoin-connect init successful");
    return true;
  } catch (error) {
    console.error("❌ bitcoin-connect init failed:", error);
    return false;
  }
}

// Test disconnect function
export function testBitcoinConnectDisconnect() {
  try {
    disconnect();
    console.log("✅ bitcoin-connect disconnect successful");
    return true;
  } catch (error) {
    console.error("❌ bitcoin-connect disconnect failed:", error);
    return false;
  }
}

// Test closeModal function
export function testBitcoinConnectCloseModal() {
  try {
    closeModal();
    console.log("✅ bitcoin-connect closeModal successful");
    return true;
  } catch (error) {
    console.error("❌ bitcoin-connect closeModal failed:", error);
    return false;
  }
}

// Test WebLNProviders existence
export function testWebLNProviders() {
  try {
    if (WebLNProviders && WebLNProviders.NostrWebLNProvider) {
      console.log("✅ WebLNProviders.NostrWebLNProvider exists");
      return true;
    } else {
      console.error("❌ WebLNProviders.NostrWebLNProvider missing");
      return false;
    }
  } catch (error) {
    console.error("❌ WebLNProviders test failed:", error);
    return false;
  }
}

// Run all tests
export function runAllBitcoinConnectTests() {
  console.log("Running bitcoin-connect tests...");
  const results = [
    testBitcoinConnectInit(),
    testBitcoinConnectDisconnect(),
    testBitcoinConnectCloseModal(),
    testWebLNProviders()
  ];
  
  const allPassed = results.every(result => result === true);
  console.log(`Bitcoin-connect tests: ${allPassed ? "✅ ALL PASSED" : "❌ SOME FAILED"}`);
  return allPassed;
}

// Instructions for running tests:
/*
To run these tests, add the following code to a component that loads early in your app
(but remove before production):

import { runAllBitcoinConnectTests } from './tests/bitcoin-connect-tests';

useEffect(() => {
  // Only run in development
  if (process.env.NODE_ENV === 'development') {
    runAllBitcoinConnectTests();
  }
}, []);
*/