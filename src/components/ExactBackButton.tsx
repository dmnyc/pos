type ExactBackButtonProps = {
  onBack: () => void;
  theme?: string;
};

export function ExactBackButton({ onBack, theme = "dark" }: ExactBackButtonProps) {
  return (
    <div 
      className="fixed top-0 left-0 bg-black w-full h-14 z-10 border-b border-gray-900" 
      data-theme={theme}
      style={{ paddingLeft: '12px' }}
    >
      <button
        className="absolute text-gray-400 flex items-center justify-center h-6 w-6"
        onClick={onBack}
        style={{ position: 'absolute', left: '16px', top: '14px' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="square" strokeLinejoin="miter" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
}