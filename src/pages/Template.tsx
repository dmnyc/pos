import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TemplateNavbar } from "../components/TemplateNavbar";

interface TemplateProps {
  title?: string;
  children: React.ReactNode;
}

export function Template({ title = "Page Title", children }: TemplateProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleBack = () => {
    const hasWallet = window.localStorage.getItem("pos:nwcUrl");
    if (hasWallet) {
      navigate("/wallet/new");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    // Check if content actually needs scrolling
    const checkScrollbar = () => {
      if (containerRef.current) {
        // Check if the main container has overflow (simpler approach)
        const hasOverflow = containerRef.current.scrollHeight > containerRef.current.clientHeight;
        
        if (!hasOverflow) {
          // No overflow - hide scrolling
          containerRef.current.style.overflow = 'hidden';
          containerRef.current.style.overscrollBehavior = 'none';
          containerRef.current.style.touchAction = 'manipulation';
          (containerRef.current.style as any).WebkitOverflowScrolling = 'auto';
        } else {
          // Has overflow - enable scrolling
          containerRef.current.style.overflow = 'auto';
          containerRef.current.style.overscrollBehavior = 'none';
          containerRef.current.style.touchAction = 'pan-y';
          (containerRef.current.style as any).WebkitOverflowScrolling = 'touch';
        }
      }
    };

    // Check after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(checkScrollbar, 200);
    
    // Recheck on window resize
    window.addEventListener('resize', checkScrollbar);
    
    // Monitor content changes
    const observer = new MutationObserver(() => {
      setTimeout(checkScrollbar, 100);
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkScrollbar);
      observer.disconnect();
    };
  }, [children]);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black text-white template-scroll" data-theme="dark">
      {/* Fixed/Sticky Navigation */}
      <div className="fixed top-0 left-0 w-full z-50">
        <TemplateNavbar onBack={handleBack} />
      </div>
      
      {/* Content Area */}
      <div className="template-content pt-20 px-4 pb-8">
        <div className="text-center max-w-xs md:max-w-md lg:max-w-lg mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
            {title}
          </h1>
          <div className="text-left w-full max-w-2xl mx-auto space-y-4 text-gray-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Template;