
import React from 'react';

export const MicIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"}>
    <defs>
      <linearGradient id="clinicalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
    </defs>
    <path d="M12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5C15 3.34315 13.6569 2 12 2Z" fill="url(#clinicalGradient)" />
    <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke="url(#clinicalGradient)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 19V22M8 22H16" stroke="url(#clinicalGradient)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
