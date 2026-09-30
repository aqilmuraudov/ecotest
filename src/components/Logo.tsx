import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  theme?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  theme 
}) => {
  // Height mappings for natural aspect ratio logo image (1000x340)
  const imgHeights = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9 md:h-10',
    lg: 'h-10 sm:h-11 md:h-12'
  };

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center select-none ${className}`} id="ecolife-brand-logo">
      {/* Dark mode logo (default dark theme: yellow logo) */}
      <img 
        src="/logo-dark.png" 
        alt="Ecolife" 
        className={`${imgHeights[size]} w-auto object-contain max-w-[180px] sm:max-w-[220px] transition-transform duration-200 group-hover:scale-105 ${
          isLight ? 'hidden' : isDark ? 'block' : 'block dark:block [.light_&]:hidden'
        }`}
        loading="eager"
      />
      {/* Light mode logo (light theme: black text logo) */}
      <img 
        src="/logo-light.png" 
        alt="Ecolife" 
        className={`${imgHeights[size]} w-auto object-contain max-w-[180px] sm:max-w-[220px] transition-transform duration-200 group-hover:scale-105 ${
          isLight ? 'block' : isDark ? 'hidden' : 'hidden dark:hidden [.light_&]:block'
        }`}
        loading="eager"
      />
    </div>
  );
};
