export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-black text-white" data-theme="dark">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 lg:mb-8">404</h1>
      <p className="text-base md:text-lg lg:text-xl">
        <a href="/" className="text-charge-green hover:underline">Return Home</a>
      </p>
    </div>
  );
}