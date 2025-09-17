
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-850 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h1 className="text-2xl font-bold text-white ml-3">XSS Payload Generator</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
