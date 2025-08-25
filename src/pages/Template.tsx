import React from "react";
import { useNavigate } from "react-router-dom";
import { TemplateNavbar } from "../components/TemplateNavbar";

interface TemplateProps {
  title?: string;
  children: React.ReactNode;
}

export function Template({ title = "Page Title", children }: TemplateProps) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    const hasWallet = window.localStorage.getItem("pos:nwcUrl");
    if (hasWallet) {
      navigate("/wallet/new");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-y-auto" data-theme="dark">
      {/* Fixed/Sticky Navigation */}
      <div className="fixed top-0 left-0 w-full z-50">
        <TemplateNavbar onBack={handleBack} />
      </div>
      
      {/* Content Area */}
      <div className="pt-20 px-4 pb-8">
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