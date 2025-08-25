import { useState } from 'react';
import { Template } from './Template';

export function TemplateTest() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Template title="Template Test Page">
      <p>This page tests the Template component's scrollbar behavior on mobile Safari.</p>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-3">Scrollbar Test</h3>
        <p className="mb-4">
          With minimal content, no scrollbars should appear on mobile Safari.
        </p>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors mb-4"
        >
          {isExpanded ? 'Hide Extra Content' : 'Show Extra Content'}
        </button>
        
        {isExpanded && (
          <div className="space-y-4 border-l-2 border-gray-600 pl-4">
            <h4 className="text-md font-semibold text-white">Expanded Content</h4>
            <p>
              This expanded section contains much more content to test scrollbar behavior 
              when content actually overflows the viewport. Lorem ipsum dolor sit amet, 
              consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et 
              dolore magna aliqua.
            </p>
            
            <h4 className="text-md font-semibold text-white mt-6">Section 2</h4>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut 
              aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in 
              voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
            
            <h4 className="text-md font-semibold text-white mt-6">Section 3</h4>
            <p>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
              deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste 
              natus error sit voluptatem accusantium doloremque laudantium.
            </p>
            
            <h4 className="text-md font-semibold text-white mt-6">Section 4</h4>
            <p>
              Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi 
              architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem 
              quia voluptas sit aspernatur aut odit aut fugit.
            </p>
            
            <h4 className="text-md font-semibold text-white mt-6">Section 5</h4>
            <p>
              Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi 
              nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit 
              amet, consectetur, adipisci velit.
            </p>
            
            <h4 className="text-md font-semibold text-white mt-6">Section 6</h4>
            <p>
              Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam 
              aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum 
              exercitationem ullam corporis suscipit laboriosam.
            </p>
            
            <h4 className="text-md font-semibold text-white mt-6">Final Section</h4>
            <p>
              Nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure 
              reprehenderit qui in ea voluptate velit esse quam nihil molestiae 
              consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.
            </p>
            
            <div className="mt-8 p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong>Testing Note:</strong> When this content is expanded on mobile Safari, 
                scrollbars should only appear during active scrolling, not permanently visible.
              </p>
            </div>
          </div>
        )}
      </div>
    </Template>
  );
}