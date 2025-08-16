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
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  // Get available cameras on component mount
  useEffect(() => {
    const getCameras = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          setError("Camera access not supported in this browser");
          return;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        
        // Try to find a back camera first
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        
        if (backCamera) {
          setSelectedCamera(backCamera.deviceId);
        } else if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
        setError("Unable to detect cameras");
      }
    };

    getCameras();
  }, []);

  // Start scanner when selectedCamera changes
  useEffect(() => {
    // Check if we're in a secure context
    if (!window.isSecureContext) {
      setError("Camera access requires HTTPS. Please use a secure connection.");
      return;
    }

    // Don't proceed if no camera selected
    if (!selectedCamera) return;

    const startScanner = async () => {
      try {
        // Stop any existing scanner
        if (controlsRef.current) {
          controlsRef.current.stop();
          controlsRef.current = null;
        }

        // Create a new QR code reader with more hints for better detection
        const hints = new Map();
        const formats = ['QR_CODE']; // Focus only on QR codes for better performance
        hints.set(2, formats); // 2 is DecodeHintType.POSSIBLE_FORMATS
        
        const codeReader = new BrowserQRCodeReader(hints, {
          delayBetweenScanAttempts: 100, // More frequent scanning attempts
          tryHarder: true // More aggressive scanning
        });
        
        // Reset error state
        setError(null);
        
        // Try to get video element
        if (!videoRef.current) {
          setError("Video element not available");
          return;
        }
        
        // Use lower resolution initially for better performance
        const constraints: MediaTrackConstraints = {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 720 }, // Lower than before
          height: { ideal: 480 },
          // Fall back to environment (rear) camera if deviceId isn't working
          ...(selectedCamera ? {} : { facingMode: 'environment' })
        };
        
        setIsScanning(true);
        
        // Start scanning
        const controls = await codeReader.decodeFromConstraints(
          { video: constraints },
          videoRef.current,
          (result, error, controls) => {
            if (result) {
              // On successful scan, extract the text
              const text = result.getText();
              console.log("QR Code detected:", text);
              
              // Validate the URL format before passing it
              try {
                // Check if it's a valid URL
                new URL(text);
                // Stop scanning and return result
                controls.stop();
                onResult(text);
              } catch (e) {
                // Not a valid URL - just log and continue scanning
                console.warn("Scanned non-URL QR code:", text);
              }
            }
            
            if (error && !(error instanceof TypeError)) {
              // Ignore TypeError which is thrown when scanning is stopped
              console.error("Scanning error:", error);
            }
          }
        );
        
        // Save controls reference for cleanup
        controlsRef.current = controls;
        
      } catch (err) {
        setError(`Error accessing camera: ${err instanceof Error ? err.message : String(err)}`);
        console.error("Scanner error:", err);
        setIsScanning(false);
      }
    };

    startScanner();

    // Cleanup: stop scanner when component unmounts or selectedCamera changes
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, [onResult, selectedCamera]);

  // Function to switch camera
  const switchCamera = () => {
    if (cameras.length <= 1) return;
    
    const currentIndex = cameras.findIndex(camera => camera.deviceId === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCamera(cameras[nextIndex].deviceId);
  };

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
             style={{ aspectRatio: '1/1' }}> {/* Using 1:1 square aspect ratio for QR code scanning */}
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
        
        {/* Camera switch button */}
        {cameras.length > 1 && (
          <button
            onClick={switchCamera}
            className="absolute bottom-2 right-2 z-10 bg-black bg-opacity-50 rounded-full p-2 text-white"
            aria-label="Switch camera"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>
      
      {error && (
        <div className="mt-4 text-red-500 text-center">
          {error}
          {error.includes("Camera access") && (
            <div className="mt-2 text-sm">
              Please ensure you've granted camera permissions to this site.
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 text-center text-gray-300 text-sm">
        Point your camera at a QR code containing a wallet URL
      </div>
      
      {/* Add scanline animation to CSS */}
      <style jsx>{`
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