
import React from 'react';

interface PatientAvatarProps {
  name: string;
  url?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PatientAvatar: React.FC<PatientAvatarProps> = ({ name, url, size = 'md', className }) => {
  const getInitials = (n: string) => n.split(' ').map(i => i[0]).join('').toUpperCase().slice(0, 2);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl'
  };

  if (url && url.trim() !== '') {
    return (
      <img 
        src={url} 
        alt={name} 
        className={`${sizeClasses[size]} rounded-xl object-cover border border-slate-200 ${className}`} 
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-xl flex items-center justify-center font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-tighter ${className}`}>
      {getInitials(name)}
    </div>
  );
};
