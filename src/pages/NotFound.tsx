export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-black text-white" data-theme="dark">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p>
        <a href="/" className="text-charge-green hover:underline">Return Home</a>
      </p>
    </div>
  );
}