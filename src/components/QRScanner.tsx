import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

interface CameraDevice {
  id: string;
  label: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onResult, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [usingFrontCamera, setUsingFrontCamera] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to check if a camera is a front camera
  const isFrontCamera = (label: string): boolean => {
    const frontIdentifiers = ['front', 'user', 'selfie', 'face'];
    return frontIdentifiers.some(id => label.toLowerCase().includes(id));
  };

  // Group cameras into front and back categories
  const groupCameras = (devices: CameraDevice[]): { front: CameraDevice[], back: CameraDevice[] } => {
    const front: CameraDevice[] = [];
    const back: CameraDevice[] = [];
    
    devices.forEach(device => {
      if (isFrontCamera(device.label)) {
        front.push(device);
      } else {
        back.push(device);
      }
    });
    
    return { front, back };
  };

  // Start or restart scanner with selected camera
  const startScanner = async (cameraId: string) => {
    try {
      setError(null);
      
      // Stop scanner if it's already running
      if (scannerRef.current && scannerInitialized) {
        try {
          await scannerRef.current.stop();
          // Small delay to ensure camera is fully stopped before restarting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (stopErr) {
          console.error("Error stopping camera:", stopErr);
          // Continue anyway, as we're trying to start a new camera
        }
      }
      
      // Create a new instance if needed
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }
      
      // Calculate the size for the QR box based on container width
      let qrboxSize = 250;
      if (containerRef.current) {
        // Use 70% of the container width for the QR box, but keep it square
        qrboxSize = Math.min(containerRef.current.offsetWidth * 0.7, 250);
      }
      
      // Check if this is a front camera to update the state
      if (cameras.length > 0) {
        const camera = cameras.find(c => c.id === cameraId);
        if (camera) {
          setUsingFrontCamera(isFrontCamera(camera.label));
        }
      }
      
      // Start scanning with the selected camera
      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: {
            width: qrboxSize,
            height: qrboxSize
          },
          aspectRatio: 1.0, // Force a square aspect ratio
          // Explicitly define the formats to support
          formatsToSupport: [0x1], // QR Code format
          // Use the proper facingMode based on camera type
          videoConstraints: {
            deviceId: cameraId,
            facingMode: usingFrontCamera ? "user" : "environment"
          }
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
      setSelectedCamera(cameraId);
    } catch (err) {
      setError(`Error starting camera: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        // Check if we're in a secure context (https or localhost)
        if (!window.isSecureContext) {
          setError("Camera access requires HTTPS. Please use a secure connection.");
          return;
        }
        
        // Check if camera permissions are available
        const devices = await Html5Qrcode.getCameras();
        
        if (devices && devices.length > 0) {
          // Store available cameras
          setCameras(devices);
          
          // Group cameras into front and back
          const { front, back } = groupCameras(devices);
          
          // Select the first back camera if available, otherwise use the first camera
          const cameraToUse = back.length > 0 ? back[0] : devices[0];
          
          // Start scanner with selected camera
          await startScanner(cameraToUse.id);
        } else {
          setError("No camera found or permission denied");
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

  // Handler for camera switching - toggle between front and back only
  const handleCameraSwitch = async () => {
    if (cameras.length <= 1) return;
    
    // Group cameras
    const { front, back } = groupCameras(cameras);
    
    if (front.length === 0 || back.length === 0) {
      // If there are no front or back cameras, just use regular cycling
      const currentIndex = cameras.findIndex(camera => camera.id === selectedCamera);
      const nextIndex = (currentIndex + 1) % cameras.length;
      await startScanner(cameras[nextIndex].id);
      return;
    }
    
    // Toggle between front and back camera groups
    if (usingFrontCamera) {
      // Switch to the first back camera
      await startScanner(back[0].id);
    } else {
      // Switch to the first front camera
      await startScanner(front[0].id);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div ref={containerRef} className="relative w-full">
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
        
        {/* Camera switch button - only show if multiple cameras available */}
        {cameras.length > 1 && (
          <button
            onClick={handleCameraSwitch}
            className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 rounded-full p-1 text-white"
            aria-label="Switch camera"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
        
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
        {cameras.length > 1 && (
          <div className="mt-1 text-xs text-gray-400">
            {usingFrontCamera ? 'Using front camera' : 'Using back camera'} • 
            Tap camera button to switch
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;