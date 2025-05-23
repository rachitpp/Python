// src/components/Navbar.tsx
import React from "react";

export const Navbar: React.FC = () => {
  return (
    <header
      className="shadow-lg overflow-hidden animate-fade-in"
      style={{
        background: "linear-gradient(135deg, #0CABB3 0%, #087178 100%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="p-2 rounded-lg shadow-inner flex-shrink-0 transform hover:rotate-3 transition-all duration-300"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(8px)",
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="size-7"
            >
              <path d="M9.5 3a10 10 0 00-8 12c.1.6.3 1.2.6 1.8L5 14V8.3L8.6 7 12 9.8 15.4 7 19 8.3V14l2.9 2.8c.3-.6.5-1.2.6-1.8a10 10 0 00-8-12h-5zM12 12.5l-4-3V16c2 1.8 6 1.8 8 0v-6.5l-4 3z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1
              className="text-xl sm:text-2xl font-bold tracking-tight truncate text-white"
              style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.15)" }}
            >
              DentalVision AI
            </h1>
            <p className="text-xs hidden sm:block text-white text-opacity-90">
              Advanced X-ray Analysis & Pathology Detection
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 flex-shrink-0">
          <button className="whitespace-nowrap transition-all hover:bg-white/30 text-white px-3 py-1.5 rounded-md text-sm font-medium border border-white/30 hover:scale-105 active:scale-95">
            AI Diagnostics
          </button>
          <button
            className="whitespace-nowrap transition-all hover:bg-secondary-600 bg-secondary-500 text-white px-3 py-1.5 rounded-md text-sm font-medium border border-secondary-400 hover:scale-105 active:scale-95"
            style={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}
          >
            Clinical Analysis
          </button>
        </div>
      </div>
    </header>
  );
};
