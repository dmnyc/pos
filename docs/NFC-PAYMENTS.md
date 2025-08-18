# NFC Payment Implementation for POS System

## Overview

This document outlines the implementation of Near Field Communication (NFC) payment capabilities for the POS system, allowing customers to tap their NFC-enabled devices or cards to complete Bitcoin Lightning payments.

## Technical Architecture

### 1. NFC Reader Integration

The POS system will integrate with standard handheld POS terminals that support NFC. There are two primary approaches:

#### Option A: Direct Terminal Integration
- Connect to NFC-enabled payment terminals via Bluetooth, USB, or local network
- Terminal-specific SDK integration for devices like Sunmi, PAX, or Verifone
- Implement device discovery and connection management

#### Option B: Web NFC API Integration
- Use the Web NFC API (limited browser support, mainly Chrome on Android)
- Create a responsive interface for mobile devices acting as the POS
- Support for smartphones/tablets with built-in NFC capabilities

### 2. Implementation Plan

#### Phase 1: NFC Configuration and Setup
1. Add NFC configuration options to the settings menu
2. Implement device discovery and pairing interface
3. Create test mode for verifying NFC connectivity

#### Phase 2: Payment Flow Integration
1. Add NFC payment option to the payment methods
2. Modify payment flow to support NFC tap interaction
3. Implement payment data exchange protocol

#### Phase 3: Security and Verification
1. Implement secure communication between POS and NFC terminal
2. Add payment verification and confirmation mechanisms
3. Develop error handling and retry mechanisms

## Technical Requirements

### Dependencies to Add
```json
{
  "dependencies": {
    "@nfc-pcsc/react": "^0.1.0",     // For USB-connected NFC readers
    "bluetooth-serial-port": "^2.2.8", // For Bluetooth-connected terminals
    "nfc-react-web": "^1.1.0"         // For Web NFC API integration
  }
}
```

### Hardware Compatibility
- Sunmi P2 Pro/P2 Lite/V2 Pro
- PAX A920/A80
- Verifone Carbon Mobile 5
- Square Terminal (with API integration)
- Any Android device with NFC capabilities (for Web NFC implementation)

## Implementation Details

### 1. NFC Feature Detection

```typescript
// src/utils/nfcUtils.ts

export const isNfcSupported = (): boolean => {
  // Check for Web NFC API support
  const hasWebNfc = 'NDEFReader' in window;
  
  // Check for connected NFC devices via USB/Bluetooth
  // This would require a more complex check with device enumeration
  const hasExternalNfcReader = false; // To be implemented with device detection
  
  return hasWebNfc || hasExternalNfcReader;
};

export const getNfcSupportType = (): 'web' | 'external' | 'none' => {
  if ('NDEFReader' in window) return 'web';
  
  // Check for connected external readers
  // Implementation depends on the specific hardware/SDK
  
  return 'none';
};
```

### 2. NFC Payment Component

```typescript
// src/components/NfcPayment.tsx

import React, { useEffect, useState } from 'react';
import { isNfcSupported, getNfcSupportType } from '../utils/nfcUtils';

interface NfcPaymentProps {
  amount: number;
  onPaymentComplete: () => void;
  onError: (error: Error) => void;
}

export const NfcPayment: React.FC<NfcPaymentProps> = ({ 
  amount, 
  onPaymentComplete, 
  onError 
}) => {
  const [isReading, setIsReading] = useState(false);
  const [supportType, setSupportType] = useState<'web' | 'external' | 'none'>('none');
  
  useEffect(() => {
    // Check for NFC support on component mount
    const supported = isNfcSupported();
    if (!supported) {
      onError(new Error('NFC is not supported on this device'));
      return;
    }
    
    setSupportType(getNfcSupportType());
  }, [onError]);
  
  const startNfcReading = async () => {
    setIsReading(true);
    
    try {
      if (supportType === 'web') {
        // Use Web NFC API
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        
        ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
          // Process the NFC payment data
          console.log(`> Serial Number: ${serialNumber}`);
          console.log(`> Records: (${message.records.length})`);
          
          // This is where we would process the payment
          // For demonstration, we'll simulate a successful payment
          setTimeout(() => {
            onPaymentComplete();
          }, 1500);
        });
      } else if (supportType === 'external') {
        // Implement external NFC reader logic based on connected hardware
        // This would involve hardware-specific SDK calls
      }
    } catch (error) {
      setIsReading(false);
      onError(error instanceof Error ? error : new Error('Unknown NFC error'));
    }
  };
  
  const stopNfcReading = () => {
    // Cancel any ongoing NFC operations
    setIsReading(false);
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h3 className="text-xl font-bold mb-4">Tap to Pay</h3>
      
      {!isReading ? (
        <button
          className="btn bg-charge-green text-white hover:bg-green-500 w-full h-10 text-base font-bold"
          onClick={startNfcReading}
        >
          Start NFC Payment
        </button>
      ) : (
        <div className="flex flex-col items-center">
          <div className="animate-pulse mb-4">
            <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.5 14.5C9.5 16.5 11 18 13 18C15 18 16.5 16.5 16.5 14.5C16.5 12.5 15 11 13 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16.5 9.5C16.5 7.5 15 6 13 6C11 6 9.5 7.5 9.5 9.5C9.5 11.5 11 13 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-base mb-4">Ready to tap. Hold device near NFC reader.</p>
          <button
            className="btn bg-red-500 text-white hover:bg-red-600 w-full h-10 text-base font-bold"
            onClick={stopNfcReading}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
```

### 3. Integration with Payment Flow

```typescript
// Updated Pay.tsx to include NFC payment option

import { NfcPayment } from '../../components/NfcPayment';

// ... existing imports and code

export function Pay() {
  // ... existing state and code
  
  const [paymentMethod, setPaymentMethod] = useState<'qr'|'nfc'>('qr');
  const [nfcError, setNfcError] = useState<string | null>(null);
  
  // ... existing useEffects and functions
  
  // Handle NFC payment completion
  const handleNfcPaymentComplete = () => {
    // Similar logic to what happens when an invoice is paid
    navigate("../paid", { state: { isTipPayment } });
  };
  
  // Handle NFC error
  const handleNfcError = (error: Error) => {
    setNfcError(error.message);
    // Optionally switch back to QR code payment
    setPaymentMethod('qr');
  };
  
  return (
    <>
      <Navbar />
      <PageContainer>
        {/* Payment method selection tabs */}
        <div className="flex justify-center mb-4">
          <div className="tabs tabs-boxed bg-gray-800">
            <button 
              className={`tab ${paymentMethod === 'qr' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}
              onClick={() => setPaymentMethod('qr')}
            >
              QR Code
            </button>
            <button 
              className={`tab ${paymentMethod === 'nfc' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}
              onClick={() => setPaymentMethod('nfc')}
            >
              Tap to Pay
            </button>
          </div>
        </div>
        
        {/* Main content based on selected payment method */}
        {paymentMethod === 'qr' ? (
          /* Existing QR code payment UI */
          /* ... */
        ) : (
          <NfcPayment 
            amount={amount} 
            onPaymentComplete={handleNfcPaymentComplete}
            onError={handleNfcError}
          />
        )}
        
        {/* Show NFC error if any */}
        {nfcError && (
          <div className="text-red-500 text-sm mt-2 text-center">
            {nfcError}
          </div>
        )}
        
        {/* ... rest of the component */}
      </PageContainer>
    </>
  );
}
```

## Hardware Integration

### Sunmi POS Terminals

For Sunmi devices, integration would use their native Android SDK. This would require a mobile app wrapper or WebView integration:

```java
// Pseudocode for Sunmi integration
import com.sunmi.pay.hardware.nfc.NfcManager;

public class SunmiNfcPayment {
    private NfcManager nfcManager;
    
    public void initNfc() {
        nfcManager = NfcManager.getInstance();
        nfcManager.initNfcReader();
    }
    
    public void startNfcPayment(int amountInSats) {
        // Configure payment parameters
        PaymentParams params = new PaymentParams();
        params.setAmount(amountInSats);
        params.setCurrency("BTC");
        
        // Start the NFC reading process
        nfcManager.startNfcReader(params, new NfcCallback() {
            @Override
            public void onSuccess(PaymentResult result) {
                // Process successful payment
                sendResultToWebView(result);
            }
            
            @Override
            public void onError(Error error) {
                // Handle error
                sendErrorToWebView(error);
            }
        });
    }
}
```

### Web-based POS with External NFC Reader

For web-based implementation with external USB NFC readers:

```typescript
// Using @nfc-pcsc/react for USB NFC readers
import { NFC } from '@nfc-pcsc/react';

const NfcTerminalReader = () => {
  return (
    <NFC
      onConnect={(reader) => {
        console.log(`${reader.name} connected`);
        
        reader.on('card', async (card) => {
          console.log(`Card detected`, card);
          
          try {
            // Read payment data from card
            const data = await reader.read(4, 16); // blockNumber, length
            console.log(`Data read from card`, data);
            
            // Process payment data
            // ...
            
          } catch (error) {
            console.error(`Error reading card`, error);
          }
        });
        
        reader.on('error', (error) => {
          console.error(`Reader error`, error);
        });
        
        reader.on('end', () => {
          console.log(`Reader disconnected`);
        });
      }}
      
      onDisconnect={(reader) => {
        console.log(`${reader.name} disconnected`);
      }}
      
      onError={(error) => {
        console.error(`NFC error`, error);
      }}
    />
  );
};
```

## Testing Strategy

1. **Unit Tests**: Test NFC utilities and components in isolation
2. **Integration Tests**: Test the integration with the payment flow
3. **Hardware Tests**: Test with actual NFC hardware devices
4. **End-to-End Tests**: Complete payment flow tests with simulated NFC interactions

## Fallback Mechanisms

1. **QR Code Fallback**: Always have QR code payment as a fallback option
2. **Manual Entry**: Allow manual entry of payment information
3. **Browser Compatibility**: Detect browser support and show appropriate UI

## Security Considerations

1. **Secure Communication**: Ensure all NFC communication is properly encrypted
2. **Data Validation**: Validate all data received via NFC before processing
3. **Timeout Handling**: Implement proper timeout handling for NFC operations
4. **Privacy**: Minimize storage of sensitive payment information

## Future Enhancements

1. **Multi-Terminal Support**: Support for multiple NFC terminal types
2. **Card Emulation**: Support for card emulation mode for P2P payments
3. **Offline Transactions**: Support for offline NFC transactions
4. **Integration with Lightning Network**: Direct integration with Lightning Network nodes