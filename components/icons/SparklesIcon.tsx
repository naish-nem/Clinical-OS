
import React from 'react';

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"}>
    <defs>
      <linearGradient id="clinicalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
    </defs>
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="url(#clinicalGradient)" />
    <path d="M19 15L19.5 17.5L22 18L19.5 18.5L19 21L18.5 18.5L16 18L18.5 17.5L19 15Z" fill="url(#clinicalGradient)" opacity="0.8" />
    <path d="M6 4L6.4 6L8.4 6.4L6.4 6.8L6 8.8L5.6 6.8L3.6 6.4L5.6 6L6 4Z" fill="url(#clinicalGradient)" opacity="0.5" />
  </svg>
);
