import React, { useEffect, useState } from 'react';
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

  // Start or restart scanner with selected camera
  const startScanner = async (cameraId: string, html5QrCode: Html5Qrcode) => {
    try {
      // Stop scanner if it's already running
      if (scannerInitialized) {
        await html5QrCode.stop();
      }
      
      // Start scanning with the selected camera
      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // On successful scan
          onResult(decodedText);
          html5QrCode.stop();
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
    let html5QrCode: Html5Qrcode;

    const initializeScanner = async () => {
      try {
        // Check if we're in a secure context (https or localhost)
        if (!window.isSecureContext) {
          setError("Camera access requires HTTPS. Please use a secure connection.");
          return;
        }
        
        // Create instance of scanner
        html5QrCode = new Html5Qrcode("qr-reader");
        
        // Check if camera permissions are available
        const devices = await Html5Qrcode.getCameras();
        
        if (devices && devices.length > 0) {
          // Store available cameras
          setCameras(devices);
          
          // Try to find a back camera (environment-facing camera)
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          
          // If we found a back camera, use it; otherwise use the last camera (likely to be back camera)
          // Note: On many mobile devices, the back camera is often the last in the list
          const cameraToUse = backCamera || devices[devices.length - 1];
          
          // Start scanner with selected camera
          await startScanner(cameraToUse.id, html5QrCode);
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
      if (html5QrCode && scannerInitialized) {
        try {
          html5QrCode.stop().catch(error => console.error("Error stopping QR scanner:", error));
        } catch (error) {
          console.error("Error stopping QR scanner:", error);
        }
      }
    };
  }, [onResult]);

  // Handler for camera switching
  const handleCameraSwitch = async () => {
    // If no cameras or only one camera, do nothing
    if (cameras.length <= 1 || !selectedCamera) return;
    
    // Find the index of the current camera
    const currentIndex = cameras.findIndex(camera => camera.id === selectedCamera);
    
    // Calculate the index of the next camera (cycle through available cameras)
    const nextIndex = (currentIndex + 1) % cameras.length;
    
    // Create a new scanner instance
    const html5QrCode = new Html5Qrcode("qr-reader");
    
    // Start scanning with the next camera
    await startScanner(cameras[nextIndex].id, html5QrCode);
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
            Use the camera button in the top-left to switch cameras
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;