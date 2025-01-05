import React from 'react';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassContainer = ({ children, className = '' }: GlassContainerProps) => {
  return (
    <div className={`relative overflow-hidden animate-fadeIn ${className}`}>
    <div className="absolute inset-0 w-full h-full blur-[4px]">
      </div>
      
      {/* Content container */}
      <div className="relative p-6">
        {children}
      </div>
    </div>
  );
};
