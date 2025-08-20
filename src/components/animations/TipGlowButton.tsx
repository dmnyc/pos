import React, { useEffect, useState, useRef } from 'react';

interface TipGlowButtonProps {
  onClick: () => void;
  theme: string;
  className?: string;
}

const TipGlowButton: React.FC<TipGlowButtonProps> = ({
  onClick,
  theme,
  className = ''
}) => {
  const [glowing, setGlowing] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start glowing after a delay to allow lightning animation to complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setGlowing(true);

      // Start the manual pulse effec
      let increasing = true;
      let currentIntensity = 0;

      pulseIntervalRef.current = setInterval(() => {
        if (increasing) {
          currentIntensity += 0.05;
          if (currentIntensity >= 1) {
            currentIntensity = 1;
            increasing = false;
          }
        } else {
          currentIntensity -= 0.05;
          if (currentIntensity <= 0) {
            currentIntensity = 0;
            increasing = true;
          }
        }

        setPulseIntensity(currentIntensity);
      }, 100); // Update every 100ms for smooth animation

    }, 1500);

    return () => {
      clearTimeout(timer);
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
      }
    };
  }, []);

  // Determine the base button class based on theme
  const getButtonClass = () => {
    switch (theme) {
      case 'standard':
        return 'btn bg-charge-green text-white hover:bg-green-500';
      case 'orangepill':
        return 'btn bg-orange-pill-gradient text-black hover:bg-orange-pill-hover';
      case 'nostrich':
        return 'btn bg-nostrich-gradient text-white hover:bg-nostrich-hover';
      case 'beehive':
        return 'btn bg-beehive-yellow text-black hover:bg-beehive-hover';
      case 'liquidity':
        return 'btn bg-liquidity-gradient text-black hover:bg-liquidity-hover';
      case 'acidity':
        return 'btn bg-acidity-gradient text-black hover:bg-acidity-hover';
      case 'nutjob':
        return 'btn bg-nutjob-gradient text-black hover:bg-nutjob-hover';
      case 'safari':
        return 'btn bg-safari-gradient text-black hover:bg-safari-hover';
      case 'solid-state':
        return 'btn bg-solid-state-gradient text-white hover:bg-solid-state-hover';
      case 'blocktron':
        return 'btn bg-blocktron-gradient text-white hover:bg-blocktron-hover';
      default:
        return 'btn btn-industrial-gradient';
    }
  };

  // Calculate the dynamic glow style based on pulse intensity
  const calculateGlowStyle = () => {
    if (!glowing) return {};

    // Map the intensity (0-1) to opacity values
    const innerOpacity = 0.3 + (pulseIntensity * 0.4); // 0.3 to 0.7
    const outerOpacity = 0.1 + (pulseIntensity * 0.4); // 0.1 to 0.5

    return {
      boxShadow: `0 0 15px rgba(255, 225, 125, ${innerOpacity}), 0 0 25px rgba(255, 225, 125, ${outerOpacity})`
    };
  };

  return (
    <button
      onClick={onClick}
      className={`${getButtonClass()} ${className}`}
      style={calculateGlowStyle()}
    >
      Add a tip
    </button>
  );
};

export default TipGlowButton;