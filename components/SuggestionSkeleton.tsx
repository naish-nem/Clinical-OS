import React from 'react';

export const SuggestionSkeleton: React.FC = () => (
  <div className="p-3 border-b border-slate-100 last:border-b-0 space-y-3 skeleton-pulse">
    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
  </div>
);
