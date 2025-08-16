import React, { useEffect, useRef } from 'react';
import './CodepenLightning.css';

interface CodepenLightningProps {
  duration?: number; // in milliseconds
  active?: boolean;
}

export const CodepenLightning: React.FC<CodepenLightningProps> = ({
  duration = 1000,
  active = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a lightning bolt based on the codepen example
  const generateLightning = () => {
    if (!svgRef.current || !containerRef.current) return;
    
    const svg = svgRef.current;
    const ancho = containerRef.current.clientWidth;
    const altura = containerRef.current.clientHeight;
    
    const xInicio = Math.random() * ancho;
    let yActual = 0;
    let zigzag = `M${xInicio},${yActual}`;
    
    // Slightly thicker stroke for a single bolt
    let grosor = Math.random() * 3 + 2; // 2-5px instead of 1-4px
    
    // Only white or yellow colors - no black
    let color = Math.random() > 0.5 ? 'white' : 'yellow';
    
    // Create the zigzag pattern
    const segments = Math.floor(Math.random() * 3 + 5); // 5-7 segments
    
    for (let i = 0; i < segments; i++) {
      let xOffset = (Math.random() - 0.5) * 100;
      
      // Calculate y position to ensure bolts extend across the whole screen
      // Last segment should always reach the bottom
      let yOffset;
      if (i === segments - 1) {
        yOffset = altura - yActual; // Ensure the last segment reaches the bottom
      } else {
        // Distribute remaining segments across the screen
        yOffset = (altura / segments) * (1 + Math.random() * 0.5);
      }
      
      yActual += yOffset;
      zigzag += ` L${xInicio + xOffset},${yActual}`;
      
      // Add random branches
      if (Math.random() > 0.7) {
        let branchX = xInicio + xOffset + (Math.random() - 0.5) * 50;
        let branchY = yActual + Math.random() * 30;
        zigzag += ` M${xInicio + xOffset},${yActual} L${branchX},${branchY} M${xInicio + xOffset},${yActual}`;
      }
    }
    
    // Create the SVG path element
    const linea = document.createElementNS("http://www.w3.org/2000/svg", "path");
    linea.setAttribute("d", zigzag);
    linea.setAttribute("class", "rayo");
    linea.setAttribute("stroke", color);
    linea.setAttribute("stroke-width", grosor.toString());
    linea.setAttribute("fill", "none"); // Explicitly set no fill
    svg.appendChild(linea);
    
    // Add flash effect to the container
    if (containerRef.current) {
      containerRef.current.classList.add('flash');
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.classList.remove('flash');
        }
      }, 200);
    }
    
    // Clean up the lightning after animation
    setTimeout(() => {
      if (svg.contains(linea)) {
        svg.removeChild(linea);
      }
    }, 800); // Slightly longer to match the longer fade-out
  };

  useEffect(() => {
    if (!active) return;
    
    // Generate a single lightning bolt
    const createLightnings = () => {
      // Just one bolt that appears immediately
      setTimeout(generateLightning, 0);
    };
    
    // Initial set of lightning
    createLightnings();
    
    // Cleanup
    timerRef.current = setTimeout(() => {
      // Cleanup will happen naturally as each bolt removes itself
    }, duration);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [active, duration]);

  return (
    <div ref={containerRef} className="lightning-container">
      <svg ref={svgRef} className="lightning-svg"></svg>
    </div>
  );
};

export default CodepenLightning;