
import React from 'react';

export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"}>
    <defs>
      <linearGradient id="clinicalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
    </defs>
    <path d="M22 19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V9C2 7.9 2.9 7 4 7H8L9.5 4.5C9.8 4.2 10.1 4 10.5 4H13.5C13.9 4 14.2 4.2 14.5 4.5L16 7H20C21.1 7 22 7.9 22 9V19Z" stroke="url(#clinicalGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="14" r="3.5" stroke="url(#clinicalGradient)" strokeWidth="1.5" />
    <circle cx="18.5" cy="10.5" r="0.5" fill="url(#clinicalGradient)" />
  </svg>
);
