import React, { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

interface QRScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onResult, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Initialize QR scanner when component mounts
  useEffect(() => {
    const initializeScanner = async () => {
      try {
        // Reset error state
        setError(null);

        // Check for cameras
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          setError("Camera access not supported in this browser");
          return;
        }

        // Get permission for camera
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err) {
          console.error("Camera permission error:", err);
          setError("Camera permission denied. Please allow camera access and try again.");
          return;
        }

        // Create a QR code reader
        const reader = new BrowserQRCodeReader();
        codeReaderRef.current = reader;

        if (!videoRef.current) {
          setError("Video element not available");
          return;
        }

        // Start scanning with environment-facing camera (rear camera)
        await reader.decodeFromConstraints(
          {
            video: {
              facingMode: 'environment', // Use rear camera
              width: { ideal: 720 },
              height: { ideal: 480 }
            }
          },
          videoRef.current,
          (result, error) => {
            if (result) {
              const text = result.getText();
              // console.log("QR code detected:", text);

              try {
                // Validate URL
                new URL(text);
                // Directly use the code without confirmation
                onResult(text);
              } catch (e) {
                console.warn("Scanned non-URL QR code:", text);
              }
            }

            if (error && !(error instanceof TypeError)) {
              console.error("Scanning error:", error);
            }
          }
        );

        setIsScanning(true);
      } catch (err) {
        console.error("Error initializing scanner:", err);
        setError(`Error initializing scanner: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    initializeScanner();

    // Cleanup function
    return () => {
      if (codeReaderRef.current) {
        try {
          // Store the current video ref in a variable to ensure it doesn't change by cleanup time
          const currentVideoRef = videoRef.current;
          if (currentVideoRef && currentVideoRef.srcObject) {
            const stream = currentVideoRef.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            currentVideoRef.srcObject = null;
          }
        } catch (err) {
          console.error("Error cleaning up scanner:", err);
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

        {/* Video element with scanner overlay */}
        <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden"
             style={{ aspectRatio: '1/1' }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            autoPlay
          />

          {/* Scanning Frame Overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white opacity-70 rounded-md" />
            </div>
          )}

          {/* Scanning animation */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 border-t-2 border-white opacity-80 animate-[scanline_2s_ease-in-out_infinite]"
                   style={{ animationName: 'scanline' }}/>
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

      {/* Add scanline animation to CSS */}
      <style>{`
        @keyframes scanline {
          0% {
            transform: translateY(-32px);
          }
          50% {
            transform: translateY(32px);
          }
          100% {
            transform: translateY(-32px);
          }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;