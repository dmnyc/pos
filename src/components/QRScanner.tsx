import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onResult, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        // Check if we're in a secure context (https or localhost)
        if (!window.isSecureContext) {
          setError("Camera access requires HTTPS. Please use a secure connection.");
          return;
        }
        
        // Create instance of scanner
        scannerRef.current = new Html5Qrcode("qr-reader");
        
        try {
          // Use environment-facing camera (rear camera) directly with facingMode constraint
          await scannerRef.current.start(
            { facingMode: "environment" }, // This forces the rear camera on mobile devices
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
              // On successful scan
              onResult(decodedText);
              if (scannerRef.current) {
                scannerRef.current.stop().catch(e => console.error("Error stopping after scan:", e));
              }
            },
            (_errorMessage) => {
              // Errors during ongoing scan are ignored
            }
          );
          
          setScannerInitialized(true);
        } catch (err) {
          setError(`Error starting camera: ${err instanceof Error ? err.message : String(err)}`);
        }
      } catch (err) {
        setError(`Error initializing camera: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    initializeScanner();

    // Cleanup function to stop scanner when component unmounts
    return () => {
      if (scannerRef.current && scannerInitialized) {
        try {
          scannerRef.current.stop().catch(error => console.error("Error stopping QR scanner:", error));
        } catch (error) {
          console.error("Error stopping QR scanner:", error);
        }
      }
    };
  }, [onResult]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full">
        {/* Close button in top-right corner */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 rounded-full p-1 text-white"
          aria-label="Close scanner"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* QR Scanner container */}
        <div 
          id="qr-reader" 
          className="w-full aspect-square bg-gray-900 rounded-lg overflow-hidden"
          style={{ maxHeight: '80vh' }}
        ></div>
      </div>
      
      {error && (
        <div className="mt-4 text-red-500 text-center">
          {error}
        </div>
      )}
      
      <div className="mt-4 text-center text-gray-300 text-sm">
        Point your camera at a QR code containing a wallet URL
      </div>
    </div>
  );
};

export default QRScanner;