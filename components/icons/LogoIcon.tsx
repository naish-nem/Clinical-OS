
import React from 'react';

export const LogoIcon: React.FC = () => (
  <div className="relative w-10 h-10 flex items-center justify-center">
    <div className="absolute inset-0 bg-blue-500 rounded-xl rotate-45 opacity-20 animate-pulse"></div>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
      <path d="M12 4V20M4 12H20" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M7 7L17 17M17 7L7 17" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
      <circle cx="12" cy="12" r="3" fill="#2563eb"/>
    </svg>
  </div>
);
