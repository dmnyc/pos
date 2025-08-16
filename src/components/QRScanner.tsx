import React, { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';

interface QRScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onResult, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Check if we're in a secure context
    if (!window.isSecureContext) {
      setError("Camera access requires HTTPS. Please use a secure connection.");
      return;
    }

    const startScanner = async () => {
      try {
        // Create a new QR code reader
        const codeReader = new BrowserQRCodeReader();
        
        // Reset error state
        setError(null);
        
        // Try to get video element
        if (!videoRef.current) {
          setError("Video element not available");
          return;
        }
        
        // Start scanning with environment-facing camera (rear camera)
        const controls = await codeReader.decodeFromConstraints(
          {
            video: { 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          },
          videoRef.current,
          (result, error, controls) => {
            if (result) {
              // On successful scan
              onResult(result.getText());
              // Stop scanning
              controls.stop();
            }
            
            if (error && !(error instanceof TypeError)) {
              // Ignore TypeError which is thrown when scanning is stopped
              console.error("Scanning error:", error);
            }
          }
        );
        
        // Save controls reference for cleanup
        controlsRef.current = controls;
        setIsScanning(true);
        
      } catch (err) {
        setError(`Error accessing camera: ${err instanceof Error ? err.message : String(err)}`);
        console.error("Scanner error:", err);
      }
    };

    startScanner();

    // Cleanup: stop scanner when component unmounts
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
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
        
        {/* Video element with scanner overlay */}
        <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden">
          <video 
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          
          {/* Scanning Frame Overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white opacity-70 rounded-lg" />
            </div>
          )}
        </div>
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