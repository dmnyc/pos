type ExactBackButtonProps = {
  onBack: () => void;
  theme?: string;
};

export function ExactBackButton({ onBack, theme = "dark" }: ExactBackButtonProps) {
  return (
    <div
      className="fixed top-0 left-0 bg-black w-full h-14 md:h-16 lg:h-20 z-10 border-b border-gray-900"
      data-theme={theme}
    >
      <button
        className="absolute text-gray-400 flex items-center justify-center h-6 md:h-8 lg:h-10 w-6 md:w-8 lg:w-10"
        onClick={onBack}
        style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="square" strokeLinejoin="miter" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
}