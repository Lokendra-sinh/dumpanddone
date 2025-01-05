import React, { useState } from 'react';
import { Button } from "@dumpanddone/ui"

interface CustomButtonProps {
  baseColor: string;
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  [key: string]: any;
}

export const CustomButton = ({ 
  baseColor, 
  children, 
  className = '',
  size = 'lg',
  ...rest 
}: CustomButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Convert hex to RGB for overlay
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb = hexToRgb(baseColor);
  
  const buttonStyles = {
    backgroundColor: baseColor,
    boxShadow: `
      inset 0 4px 1px rgba(${rgb!.r + 30}, ${rgb!.g + 30}, ${rgb!.b + 30}, 1),
      inset 0 -4px 2px rgba(${rgb!.r - 30}, ${rgb!.g - 30}, ${rgb!.b - 30}, 1),
      0 0 4px rgba(0, 0, 0, 0.1)
    `,
    position: 'relative' as const,
    overflow: 'hidden' as const
  };

  return (
    <Button
      size={size}
      className={`rounded-lg text-base font-bold text-white h-fit px-4 py-2 ${className}`}
      style={buttonStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      {children}
      <div 
        className={`absolute inset-0 transition-opacity duration-200 bg-black/20
          ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      />
    </Button>
  );
};
