import { Navbar } from '../../components/Navbar';
import { PageContainer } from '../../components/PageContainer';

/**
 * Example page demonstrating the use of the PageContainer component
 * This shows how to implement the container in new pages for consistent layout
 */
export function ExamplePage() {
  return (
    <>
      <Navbar />
      <PageContainer>
        {/* Your page content goes here */}
        <div className="flex flex-col items-center justify-center w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto py-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl mb-4">Example Page</h1>
          <p className="text-gray-400 text-center mb-6">
            This page demonstrates using the PageContainer component for consistent layout.
          </p>
          <button className="btn bg-white text-black hover:bg-gray-200 w-full">
            Example Button
          </button>
        </div>
      </PageContainer>
    </>
  );
}