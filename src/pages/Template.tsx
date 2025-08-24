import React from "react";
import { useNavigate } from "react-router-dom";
import { TemplateNavbar } from "../components/TemplateNavbar";
import { PageContainer } from "../components/PageContainer";

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
    <>
      <TemplateNavbar onBack={handleBack} />
      <PageContainer justify="start" align="start">
        <div className="flex flex-col items-center justify-start w-full max-w-xs md:max-w-md lg:max-w-lg wide:max-w-screen-md mx-auto py-2 md:py-4">
          <div className="text-center max-w-xs md:max-w-md lg:max-w-lg px-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
              {title}
            </h1>
            <div className="text-left max-w-2xl mx-auto space-y-4 text-gray-300 py-4">
              {children}
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}

export default Template;