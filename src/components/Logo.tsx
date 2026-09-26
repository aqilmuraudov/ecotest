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
  // Height mappings for natural aspect ratio logo image
  const imgHeights = {
    sm: 'h-7 sm:h-8',
    md: 'h-9 sm:h-10 md:h-11',
    lg: 'h-12 sm:h-14'
  };

  return (
    <div className={`flex items-center select-none ${className}`} id="ecolife-brand-logo">
      {/* Dark mode logo (White text on dark bg) */}
      <img 
        src="/storage/products/reframe-ani-white.gif" 
        alt="Ecolife" 
        className={`${imgHeights[size]} w-auto object-contain max-w-[180px] sm:max-w-[220px] transition-transform duration-200 group-hover:scale-105 ${
          theme === 'light' ? 'hidden' : theme === 'dark' ? 'block' : 'block dark-logo'
        }`}
        referrerPolicy="no-referrer"
        loading="eager"
      />
      {/* Light mode logo (Dark text on light bg) */}
      <img 
        src="/storage/products/reframe-ani-black.gif" 
        alt="Ecolife" 
        className={`${imgHeights[size]} w-auto object-contain max-w-[180px] sm:max-w-[220px] transition-transform duration-200 group-hover:scale-105 ${
          theme === 'light' ? 'block' : theme === 'dark' ? 'hidden' : 'hidden light-logo'
        }`}
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );
};
