// src/components/Navbar.tsx
import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-8"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          <h1 className="text-2xl font-bold tracking-tight">Dobbe AI Dental X-ray</h1>
        </div>
        <div className="hidden md:flex items-center space-x-1">
          <span className="px-3 py-1 rounded-full bg-white bg-opacity-20 text-sm font-medium">
            AI-Powered Diagnostics
          </span>
        </div>
      </div>
    </header>
  );
};