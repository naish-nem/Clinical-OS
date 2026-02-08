import React from 'react';

export const StethoscopeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h-1.5m1.5 0h1.5m12.75 0h1.5m-1.5 0h-1.5m-6 0h1.5m-1.5 0h-1.5m-6 0a1.125 1.125 0 01-1.125-1.125v-1.5a1.125 1.125 0 011.125-1.125h1.5l.375-.375m14.25 0l.375.375h1.5a1.125 1.125 0 011.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h.008v.015M12 3.75v.015m0 3.375v.015m0 3.375v.015m0 3.375v.015M6 6.375h12M6 10.125h12M6 13.875h12" />
    </svg>
);
