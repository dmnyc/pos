# Paper Receipt Generation for POS System

## Overview

This document outlines the implementation of paper receipt generation for the POS system, allowing merchants to print physical receipts for Bitcoin Lightning transactions using standard handheld POS terminals.

## Technical Architecture

### 1. Printer Integration

The POS system will integrate with thermal printers in standard POS terminals through the following methods:

#### Option A: Direct Hardware Integration
- Connect to built-in printers in POS terminals via manufacturer SDKs
- Support for popular POS devices like Sunmi, PAX, Verifone, and Square
- Handle device-specific printer commands and formatting

#### Option B: ESC/POS Protocol Integration
- Use the industry-standard ESC/POS protocol for thermal printers
- Support for USB, Bluetooth, and network-connected printers
- Vendor-agnostic implementation for maximum compatibility

#### Option C: Web Printing API
- Use the WebUSB API to connect directly to USB printers
- Implement browser-based printing for supported devices
- Fallback to system print dialog for traditional printers

### 2. Implementation Plan

#### Phase 1: Receipt Design and Templating
1. Create receipt template system with configurable elements
2. Implement receipt data model with transaction details
3. Design receipt preview component for the UI

#### Phase 2: Printer Connection and Management
1. Add printer configuration to settings menu
2. Implement printer discovery and connection
3. Create test print functionality

#### Phase 3: Integration with Payment Flow
1. Modify payment completion flow to include receipt printing option
2. Implement receipt data generation from transaction details
3. Add receipt printing preferences (auto-print vs. on-demand)

## Technical Requirements

### Dependencies to Add
```json
{
  "dependencies": {
    "escpos": "^3.0.0-alpha.6",     // For ESC/POS protocol support
    "escpos-usb": "^3.0.0-alpha.4", // For USB printer support
    "escpos-bluetooth": "^3.0.0-alpha.1", // For Bluetooth printer support
    "escpos-network": "^3.0.0-alpha.1", // For network printer support
    "react-to-print": "^2.14.15",   // For browser-based printing
    "qrcode": "^1.5.3"              // For generating QR codes on receipts
  }
}
```

### Hardware Compatibility
- Sunmi built-in printers (V2 Pro, P2 series)
- PAX integrated printers (A920, A80)
- Star Micronics TSP series
- Epson TM series
- Generic ESC/POS compatible thermal printers
- Bluetooth thermal printers
- USB thermal printers

## Implementation Details

### 1. Receipt Data Model

```typescript
// src/types/receipt.ts

export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ReceiptData {
  // Merchant Information
  merchantName: string;
  merchantAddress?: string;
  merchantPhone?: string;
  merchantWebsite?: string;
  
  // Transaction Information
  transactionId: string;
  transactionDate: Date;
  paymentMethod: string;
  
  // Amount Information
  amountSats: number;
  amountFiat?: number;
  fiatCurrency?: string;
  exchangeRate?: number;
  
  // Optional line items (for itemized receipts)
  items?: ReceiptItem[];
  
  // Tip Information
  tipAmountSats?: number;
  tipAmountFiat?: number;
  
  // Total Information
  totalSats: number;
  totalFiat?: number;
  
  // Lightning Invoice Information
  lightningInvoice?: string;
  
  // Footer Information
  receiptFooter?: string;
  
  // QR code data for transaction reference
  qrCodeData?: string;
}
```

### 2. Receipt Template System

```typescript
// src/utils/receiptTemplates.ts

import { ReceiptData } from '../types/receipt';

export type ReceiptTemplateId = 'standard' | 'compact' | 'detailed';

interface ReceiptTemplate {
  id: ReceiptTemplateId;
  name: string;
  description: string;
  width: number; // Characters per line
  format: (data: ReceiptData) => string; // Returns ESC/POS formatted string
}

export const receiptTemplates: Record<ReceiptTemplateId, ReceiptTemplate> = {
  standard: {
    id: 'standard',
    name: 'Standard Receipt',
    description: 'Standard receipt with all transaction details',
    width: 32,
    format: (data: ReceiptData): string => {
      // Generate ESC/POS formatted receipt
      let receipt = '';
      
      // Header
      receipt += '\x1B\x61\x01'; // Center align
      receipt += data.merchantName + '\n\n';
      
      if (data.merchantAddress) {
        receipt += data.merchantAddress + '\n';
      }
      
      receipt += '\x1B\x61\x00'; // Left align
      receipt += '--------------------------------\n';
      
      // Transaction details
      receipt += `Date: ${data.transactionDate.toLocaleString()}\n`;
      receipt += `ID: ${data.transactionId}\n`;
      receipt += '--------------------------------\n';
      
      // Payment details
      receipt += 'Payment: Bitcoin Lightning Network\n';
      receipt += `Amount: ${data.amountSats} sats\n`;
      
      if (data.amountFiat && data.fiatCurrency) {
        receipt += `Fiat: ${data.fiatCurrency} ${data.amountFiat.toFixed(2)}\n`;
      }
      
      if (data.tipAmountSats) {
        receipt += `Tip: ${data.tipAmountSats} sats\n`;
        
        if (data.tipAmountFiat && data.fiatCurrency) {
          receipt += `Tip Fiat: ${data.fiatCurrency} ${data.tipAmountFiat.toFixed(2)}\n`;
        }
      }
      
      receipt += '--------------------------------\n';
      receipt += `Total: ${data.totalSats} sats\n`;
      
      if (data.totalFiat && data.fiatCurrency) {
        receipt += `Total Fiat: ${data.fiatCurrency} ${data.totalFiat.toFixed(2)}\n`;
      }
      
      if (data.exchangeRate) {
        receipt += `Rate: 1 ${data.fiatCurrency} = ${Math.round(data.exchangeRate)} sats\n`;
      }
      
      // Footer
      receipt += '--------------------------------\n';
      receipt += '\x1B\x61\x01'; // Center align
      receipt += 'Thank you for your business!\n';
      
      if (data.receiptFooter) {
        receipt += data.receiptFooter + '\n';
      }
      
      // Add QR code if available (depends on printer capabilities)
      if (data.qrCodeData) {
        // QR code commands vary by printer
        // This is a generic example
        receipt += '\x1D\x28\x6B\x03\x00\x31\x43\x05'; // Set QR code size
        receipt += '\x1D\x28\x6B\x03\x00\x31\x45\x31'; // Set error correction
        receipt += `\x1D\x28\x6B${String.fromCharCode(data.qrCodeData.length + 3)}\x00\x31\x50\x30${data.qrCodeData}`; // Set QR data
        receipt += '\x1D\x28\x6B\x03\x00\x31\x51\x30'; // Print QR code
      }
      
      // Cut paper
      receipt += '\n\n\n\n\x1D\x56\x41'; // Full cut with feed
      
      return receipt;
    }
  },
  
  compact: {
    id: 'compact',
    name: 'Compact Receipt',
    description: 'Minimal receipt with essential transaction details',
    width: 32,
    format: (data: ReceiptData): string => {
      // Generate compact ESC/POS formatted receipt
      let receipt = '';
      
      // Header
      receipt += '\x1B\x61\x01'; // Center align
      receipt += data.merchantName + '\n';
      receipt += '\x1B\x61\x00'; // Left align
      receipt += '--------------------------------\n';
      
      // Transaction details
      receipt += `Date: ${data.transactionDate.toLocaleDateString()}\n`;
      
      // Payment details
      receipt += `Amount: ${data.amountSats} sats\n`;
      
      if (data.amountFiat && data.fiatCurrency) {
        receipt += `Fiat: ${data.fiatCurrency} ${data.amountFiat.toFixed(2)}\n`;
      }
      
      if (data.tipAmountSats) {
        receipt += `Tip: ${data.tipAmountSats} sats\n`;
      }
      
      receipt += '--------------------------------\n';
      receipt += `Total: ${data.totalSats} sats\n`;
      
      // Footer
      receipt += '--------------------------------\n';
      receipt += '\x1B\x61\x01'; // Center align
      receipt += 'Thank you!\n';
      
      // Cut paper
      receipt += '\n\n\n\n\x1D\x56\x41'; // Full cut with feed
      
      return receipt;
    }
  },
  
  detailed: {
    id: 'detailed',
    name: 'Detailed Receipt',
    description: 'Comprehensive receipt with transaction and invoice details',
    width: 42,
    format: (data: ReceiptData): string => {
      // Generate detailed ESC/POS formatted receipt
      // Implementation similar to standard but with more details
      // ...
      return 'Detailed receipt template'; // Placeholder
    }
  }
};

export const getReceiptTemplate = (templateId: ReceiptTemplateId): ReceiptTemplate => {
  return receiptTemplates[templateId] || receiptTemplates.standard;
};
```

### 3. Printer Service

```typescript
// src/services/printerService.ts

import { ReceiptData } from '../types/receipt';
import { getReceiptTemplate, ReceiptTemplateId } from '../utils/receiptTemplates';

export type PrinterConnectionType = 'usb' | 'bluetooth' | 'network' | 'builtin';

export interface PrinterConfig {
  name: string;
  connectionType: PrinterConnectionType;
  address?: string; // IP address for network printers
  port?: number; // Port for network printers
  vendorId?: number; // Vendor ID for USB printers
  productId?: number; // Product ID for USB printers
  templateId: ReceiptTemplateId;
  autoPrint: boolean;
}

class PrinterService {
  private printerConfig: PrinterConfig | null = null;
  
  constructor() {
    this.loadConfig();
  }
  
  private loadConfig(): void {
    const configStr = localStorage.getItem('pos:printerConfig');
    if (configStr) {
      try {
        this.printerConfig = JSON.parse(configStr);
      } catch (error) {
        console.error('Error loading printer config:', error);
      }
    }
  }
  
  public saveConfig(config: PrinterConfig): void {
    this.printerConfig = config;
    localStorage.setItem('pos:printerConfig', JSON.stringify(config));
  }
  
  public getConfig(): PrinterConfig | null {
    return this.printerConfig;
  }
  
  public isPrinterConfigured(): boolean {
    return !!this.printerConfig;
  }
  
  public async printReceipt(receiptData: ReceiptData): Promise<boolean> {
    if (!this.printerConfig) {
      console.error('Printer not configured');
      return false;
    }
    
    try {
      // Get the receipt template
      const template = getReceiptTemplate(this.printerConfig.templateId);
      
      // Format the receipt data using the template
      const formattedReceipt = template.format(receiptData);
      
      // Print the receipt based on connection type
      switch (this.printerConfig.connectionType) {
        case 'usb':
          return await this.printViaUsb(formattedReceipt);
        case 'bluetooth':
          return await this.printViaBluetooth(formattedReceipt);
        case 'network':
          return await this.printViaNetwork(formattedReceipt);
        case 'builtin':
          return await this.printViaBuiltin(formattedReceipt);
        default:
          console.error('Unsupported printer connection type');
          return false;
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      return false;
    }
  }
  
  private async printViaUsb(formattedReceipt: string): Promise<boolean> {
    // Implementation depends on the USB printer library used
    // This is a placeholder for the actual implementation
    console.log('Printing via USB', formattedReceipt);
    return true;
  }
  
  private async printViaBluetooth(formattedReceipt: string): Promise<boolean> {
    // Implementation depends on the Bluetooth printer library used
    // This is a placeholder for the actual implementation
    console.log('Printing via Bluetooth', formattedReceipt);
    return true;
  }
  
  private async printViaNetwork(formattedReceipt: string): Promise<boolean> {
    // Implementation depends on the network printer library used
    // This is a placeholder for the actual implementation
    console.log('Printing via Network', formattedReceipt);
    return true;
  }
  
  private async printViaBuiltin(formattedReceipt: string): Promise<boolean> {
    // Implementation depends on the built-in printer SDK
    // This is a placeholder for the actual implementation
    console.log('Printing via Built-in printer', formattedReceipt);
    return true;
  }
  
  public async testPrint(): Promise<boolean> {
    // Create a test receipt
    const testReceiptData: ReceiptData = {
      merchantName: 'Test Merchant',
      merchantAddress: '123 Test Street',
      transactionId: 'TEST123456',
      transactionDate: new Date(),
      paymentMethod: 'Bitcoin Lightning',
      amountSats: 1000,
      amountFiat: 0.50,
      fiatCurrency: 'USD',
      exchangeRate: 2000, // 2000 sats per USD
      totalSats: 1000,
      totalFiat: 0.50,
      receiptFooter: 'This is a test receipt'
    };
    
    return await this.printReceipt(testReceiptData);
  }
}

export const printerService = new PrinterService();
```

### 4. Receipt Configuration Component

```tsx
// src/components/settings/PrinterSettings.tsx

import React, { useState, useEffect } from 'react';
import { printerService, PrinterConfig, PrinterConnectionType } from '../../services/printerService';
import { receiptTemplates, ReceiptTemplateId } from '../../utils/receiptTemplates';

export const PrinterSettings: React.FC = () => {
  const [config, setConfig] = useState<PrinterConfig>({
    name: '',
    connectionType: 'usb',
    templateId: 'standard',
    autoPrint: false
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  useEffect(() => {
    // Load existing configuration
    const savedConfig = printerService.getConfig();
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, []);
  
  const handleConnectionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const connectionType = e.target.value as PrinterConnectionType;
    setConfig({ ...config, connectionType });
  };
  
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value as ReceiptTemplateId;
    setConfig({ ...config, templateId });
  };
  
  const handleAutoPrintChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const autoPrint = e.target.checked;
    setConfig({ ...config, autoPrint });
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setConfig({ ...config, name });
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setConfig({ ...config, address });
  };
  
  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const port = parseInt(e.target.value);
    setConfig({ ...config, port: isNaN(port) ? undefined : port });
  };
  
  const handleVendorIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vendorId = parseInt(e.target.value, 16);
    setConfig({ ...config, vendorId: isNaN(vendorId) ? undefined : vendorId });
  };
  
  const handleProductIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const productId = parseInt(e.target.value, 16);
    setConfig({ ...config, productId: isNaN(productId) ? undefined : productId });
  };
  
  const handleSave = () => {
    printerService.saveConfig(config);
    alert('Printer configuration saved');
  };
  
  const handleTestPrint = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const success = await printerService.testPrint();
      setTestResult({
        success,
        message: success ? 'Test print successful' : 'Test print failed'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Test print error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <div className="w-full">
      <h2 className="text-xl md:text-2xl mb-4 text-white">Receipt Printer Settings</h2>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Printer Name</label>
        <input
          type="text"
          className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
          value={config.name}
          onChange={handleNameChange}
          placeholder="Enter printer name"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Connection Type</label>
        <select
          className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
          value={config.connectionType}
          onChange={handleConnectionTypeChange}
        >
          <option value="usb">USB</option>
          <option value="bluetooth">Bluetooth</option>
          <option value="network">Network</option>
          <option value="builtin">Built-in</option>
        </select>
      </div>
      
      {/* Conditional fields based on connection type */}
      {config.connectionType === 'network' && (
        <>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">IP Address</label>
            <input
              type="text"
              className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
              value={config.address || ''}
              onChange={handleAddressChange}
              placeholder="192.168.1.100"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Port</label>
            <input
              type="number"
              className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
              value={config.port || ''}
              onChange={handlePortChange}
              placeholder="9100"
            />
          </div>
        </>
      )}
      
      {config.connectionType === 'usb' && (
        <>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Vendor ID (hex)</label>
            <input
              type="text"
              className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
              value={config.vendorId ? config.vendorId.toString(16) : ''}
              onChange={handleVendorIdChange}
              placeholder="04b8"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Product ID (hex)</label>
            <input
              type="text"
              className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
              value={config.productId ? config.productId.toString(16) : ''}
              onChange={handleProductIdChange}
              placeholder="0e15"
            />
          </div>
        </>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Receipt Template</label>
        <select
          className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
          value={config.templateId}
          onChange={handleTemplateChange}
        >
          {Object.values(receiptTemplates).map(template => (
            <option key={template.id} value={template.id}>
              {template.name} - {template.description}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="flex items-center text-gray-300">
          <input
            type="checkbox"
            className="mr-2"
            checked={config.autoPrint}
            onChange={handleAutoPrintChange}
          />
          Automatically print receipt after payment
        </label>
      </div>
      
      <div className="flex gap-2 mt-6">
        <button
          type="button"
          className="btn bg-green-600 text-white hover:bg-green-700 px-4 py-2"
          onClick={handleSave}
        >
          Save Configuration
        </button>
        
        <button
          type="button"
          className="btn bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
          onClick={handleTestPrint}
          disabled={isTesting}
        >
          {isTesting ? 'Testing...' : 'Test Print'}
        </button>
      </div>
      
      {testResult && (
        <div className={`mt-4 p-3 rounded ${testResult.success ? 'bg-green-900' : 'bg-red-900'}`}>
          {testResult.message}
        </div>
      )}
    </div>
  );
};
```

### 5. Receipt Generation and Integration

```tsx
// src/utils/receiptUtils.ts

import { ReceiptData } from '../types/receipt';
import { printerService } from '../services/printerService';

export const generateReceiptData = (
  invoice: any, // Replace with proper invoice type
  paymentAmount: number,
  tipAmount: number = 0,
  fiatCurrency: string = 'USD',
  fiatAmount?: number,
  tipFiatAmount?: number
): ReceiptData => {
  const config = JSON.parse(localStorage.getItem('pos:merchantConfig') || '{}');
  
  // Calculate total amounts
  const totalSats = paymentAmount + tipAmount;
  const totalFiat = fiatAmount && tipFiatAmount ? fiatAmount + tipFiatAmount : 
                    fiatAmount ? fiatAmount : undefined;
  
  // Calculate exchange rate if we have both sats and fiat
  const exchangeRate = fiatAmount ? paymentAmount / fiatAmount : undefined;
  
  // Generate receipt data
  const receiptData: ReceiptData = {
    merchantName: config.name || 'Bitcoin POS',
    merchantAddress: config.address,
    merchantPhone: config.phone,
    merchantWebsite: config.website,
    
    transactionId: invoice.id || `INV-${Date.now().toString(36)}`,
    transactionDate: new Date(),
    paymentMethod: 'Bitcoin Lightning',
    
    amountSats: paymentAmount,
    amountFiat: fiatAmount,
    fiatCurrency: fiatCurrency,
    exchangeRate,
    
    tipAmountSats: tipAmount > 0 ? tipAmount : undefined,
    tipAmountFiat: tipFiatAmount,
    
    totalSats,
    totalFiat,
    
    lightningInvoice: invoice.paymentRequest,
    
    receiptFooter: config.receiptFooter || 'Thank you for your payment!',
    
    // QR code with transaction reference
    qrCodeData: `bitcoin:lightning:${invoice.paymentRequest}`,
  };
  
  return receiptData;
};

export const printPaymentReceipt = async (
  invoice: any, // Replace with proper invoice type
  paymentAmount: number,
  tipAmount: number = 0,
  fiatCurrency: string = 'USD',
  fiatAmount?: number,
  tipFiatAmount?: number
): Promise<boolean> => {
  try {
    // Check if printer is configured
    if (!printerService.isPrinterConfigured()) {
      console.warn('Printer not configured, skipping receipt printing');
      return false;
    }
    
    // Check auto-print setting
    const config = printerService.getConfig();
    if (!config?.autoPrint) {
      console.log('Auto-print disabled, skipping receipt printing');
      return false;
    }
    
    // Generate receipt data
    const receiptData = generateReceiptData(
      invoice,
      paymentAmount,
      tipAmount,
      fiatCurrency,
      fiatAmount,
      tipFiatAmount
    );
    
    // Print receipt
    return await printerService.printReceipt(receiptData);
  } catch (error) {
    console.error('Error printing receipt:', error);
    return false;
  }
};
```

### 6. Integration with Paid.tsx

```tsx
// Updated Paid.tsx to include receipt printing

import { printPaymentReceipt } from '../../utils/receiptUtils';
import { printerService } from '../../services/printerService';

// ... existing imports and component code

export function Paid() {
  // ... existing state and effects
  
  const [isPrinting, setIsPrinting] = useState(false);
  const [printResult, setPrintResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Auto-print receipt if configured
  useEffect(() => {
    const autoPrintReceipt = async () => {
      if (!lastInvoiceData) return;
      
      try {
        // Get the payment amount from lastInvoiceData
        const paymentAmount = lastInvoiceData.amount;
        
        // Extract fiat amount from the description if available
        let fiatAmount: number | undefined;
        let fiatCurrency = 'USD';
        
        const fiatMatch = lastInvoiceData.description?.match(/\((\w+)\s+\$?([\d,.]+)\)/);
        if (fiatMatch && fiatMatch.length >= 3) {
          fiatCurrency = fiatMatch[1];
          fiatAmount = parseFloat(fiatMatch[2].replace(/,/g, ''));
        }
        
        // Print receipt
        await printPaymentReceipt(
          { paymentRequest: lastInvoiceData.invoice, id: lastInvoiceData.id },
          paymentAmount,
          0, // No tip for initial payment
          fiatCurrency,
          fiatAmount
        );
      } catch (error) {
        console.error('Error auto-printing receipt:', error);
      }
    };
    
    autoPrintReceipt();
  }, [lastInvoiceData]);
  
  const handlePrintReceipt = async () => {
    if (!lastInvoiceData) return;
    
    setIsPrinting(true);
    setPrintResult(null);
    
    try {
      // Similar logic to auto-print but triggered manually
      const paymentAmount = lastInvoiceData.amount;
      
      let fiatAmount: number | undefined;
      let fiatCurrency = 'USD';
      
      const fiatMatch = lastInvoiceData.description?.match(/\((\w+)\s+\$?([\d,.]+)\)/);
      if (fiatMatch && fiatMatch.length >= 3) {
        fiatCurrency = fiatMatch[1];
        fiatAmount = parseFloat(fiatMatch[2].replace(/,/g, ''));
      }
      
      const success = await printPaymentReceipt(
        { paymentRequest: lastInvoiceData.invoice, id: lastInvoiceData.id },
        paymentAmount,
        0, // No tip for initial payment
        fiatCurrency,
        fiatAmount
      );
      
      setPrintResult({
        success,
        message: success ? 'Receipt printed successfully' : 'Failed to print receipt'
      });
    } catch (error) {
      setPrintResult({
        success: false,
        message: `Error printing receipt: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsPrinting(false);
    }
  };
  
  return (
    <>
      <Navbar />
      {showLightning && <CodepenLightning duration={1000} />}
      <PageContainer>
        {/* ... existing UI elements */}
        
        {/* Buttons Container - With added Print Receipt button */}
        <div className="w-full flex flex-col items-center gap-8 md:gap-10 lg:gap-10 lg:landscape:gap-6 wide:gap-12 wide:landscape:gap-8">
          {/* Add a tip button */}
          {showTipButton && (
            <div className="w-full max-w-xs md:max-w-md lg:max-w-md lg:landscape:max-w-sm wide:max-w-xl wide:landscape:max-w-md">
              <TipGlowButton
                onClick={handleTip}
                theme={config.theme}
                className="w-full h-10 md:h-12 lg:h-12 lg:landscape:h-10 wide:h-16 wide:landscape:h-12 text-sm md:text-base lg:text-base lg:landscape:text-base wide:text-2xl wide:landscape:text-xl"
              />
            </div>
          )}
          
          {/* Print receipt button - only show if printer is configured */}
          {printerService.isPrinterConfigured() && (
            <div className="w-full max-w-xs md:max-w-md lg:max-w-md lg:landscape:max-w-sm wide:max-w-xl wide:landscape:max-w-md">
              <button
                onClick={handlePrintReceipt}
                disabled={isPrinting}
                className="btn bg-blue-600 hover:bg-blue-700 text-white w-full h-10 md:h-12 lg:h-12 lg:landscape:h-10 wide:h-16 wide:landscape:h-12 text-sm md:text-base lg:text-base lg:landscape:text-base wide:text-2xl wide:landscape:text-xl"
              >
                {isPrinting ? (
                  <>
                    <span className="loading loading-spinner loading-xs md:loading-sm mr-2"></span>
                    Printing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Receipt
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Show print result message if any */}
          {printResult && (
            <div className={`w-full max-w-xs md:max-w-md text-center p-2 rounded ${printResult.success ? 'bg-green-900' : 'bg-red-900'}`}>
              {printResult.message}
            </div>
          )}
          
          {/* New payment button */}
          <div className="w-full max-w-xs md:max-w-md lg:max-w-md lg:landscape:max-w-sm wide:max-w-xl wide:landscape:max-w-md">
            <Link to="../new" className="block w-full">
              <button className="btn bg-white text-black hover:bg-gray-200 w-full h-10 md:h-12 lg:h-12 lg:landscape:h-10 wide:h-16 wide:landscape:h-12 text-sm md:text-base lg:text-base lg:landscape:text-base wide:text-2xl wide:landscape:text-xl">
                New payment
              </button>
            </Link>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
```

## Hardware Integration

### Sunmi POS Terminals

For Sunmi devices, integration would use their native Android SDK. This would require a mobile app wrapper or WebView integration:

```java
// Pseudocode for Sunmi printer integration
import com.sunmi.peripheral.printer.InnerPrinterManager;
import com.sunmi.peripheral.printer.InnerPrinterCallback;
import com.sunmi.peripheral.printer.SunmiPrinterService;

public class SunmiPrinterManager {
    private SunmiPrinterService printerService;
    
    public void initPrinter() {
        InnerPrinterManager.getInstance().bindService(context,
            new InnerPrinterCallback() {
                @Override
                public void onConnected(SunmiPrinterService service) {
                    printerService = service;
                }
                
                @Override
                public void onDisconnected() {
                    printerService = null;
                }
            });
    }
    
    public void printReceipt(String receiptText) {
        if (printerService == null) {
            return;
        }
        
        try {
            printerService.setPrinterStyle(WoyouConsts.ALIGN_CENTER, 24, 24, 0);
            printerService.printText("BITCOIN RECEIPT\n\n");
            
            printerService.setPrinterStyle(WoyouConsts.ALIGN_LEFT, 24, 24, 0);
            printerService.printText(receiptText);
            
            printerService.printQRCode(qrCodeData, 8, 3);
            printerService.lineWrap(4);
            printerService.cutPaper();
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }
}
```

### USB Thermal Printers with ESC/POS

For USB thermal printers using the ESC/POS protocol:

```typescript
import * as escpos from 'escpos';
import * as USB from 'escpos-usb';

// Configure USB printer
const device = new USB(vendorId, productId);
const printer = new escpos.Printer(device);

// Print receipt
device.open(function() {
  printer
    .font('a')
    .align('ct')
    .style('b')
    .size(1, 1)
    .text('BITCOIN RECEIPT')
    .text('')
    .align('lt')
    .size(0, 0)
    .text('--------------------------------')
    .text(`Date: ${new Date().toLocaleString()}`)
    .text(`Amount: 1000 sats (USD $0.50)`)
    .text('--------------------------------')
    .text('Thank you for your payment!')
    .cut()
    .close();
});
```

## Testing Strategy

1. **Unit Tests**: Test receipt templates and formatting functions
2. **Integration Tests**: Test printer service with mock printer devices
3. **Hardware Tests**: Test with actual printer hardware
4. **End-to-End Tests**: Complete payment flow tests with receipt printing

## Fallback Mechanisms

1. **Digital Receipt**: Offer digital receipt via email or QR code if printing fails
2. **Browser Printing**: Fallback to browser print dialog if direct printing fails
3. **Manual Reprinting**: Allow manual reprinting of receipts from transaction history

## Security Considerations

1. **Private Data**: Avoid printing sensitive payment information on receipts
2. **Receipt Storage**: Secure storage of receipt data for reprint purposes
3. **Audit Trail**: Maintain a secure audit trail of printed receipts

## Future Enhancements

1. **Receipt Customization**: Allow merchants to customize receipt templates
2. **Logo Support**: Add support for merchant logos on receipts
3. **Multi-Language Support**: Support for multiple languages on receipts
4. **Digital Receipt Options**: Email or SMS receipt delivery options