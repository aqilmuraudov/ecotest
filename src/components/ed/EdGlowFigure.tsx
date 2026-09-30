import React from 'react';

interface EdGlowFigureProps {
  src: string;
  alt: string;
  /** Tallest size for hero; smaller for showcase sections */
  size?: 'hero' | 'large' | 'medium';
  className?: string;
  /** Slight parallax offset in px applied via inline transform */
  offset?: number;
}

/**
 * Isolated lighting product as a light source: soft atmospheric halo,
 * warm floor glow and a calm breathing emission.
 */
export const EdGlowFigure: React.FC<EdGlowFigureProps> = ({
  src,
  alt,
  size = 'large',
  className = '',
  offset = 0
}) => {
  const heights = {
    hero: 'h-[340px] sm:h-[440px] lg:h-[560px]',
    large: 'h-[280px] sm:h-[360px] lg:h-[460px]',
    medium: 'h-[200px] sm:h-[260px] lg:h-[320px]'
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Atmospheric halo */}
      <div className="absolute inset-0 ed-glow-warm scale-[1.6] pointer-events-none" />

      <div className={`relative ${heights[size]} aspect-[4/5] flex items-end justify-center`}>
        {/* Floor glow beneath the product */}
        <div className="absolute bottom-[-6%] left-1/2 -translate-x-1/2 w-[85%] h-[22%] ed-glow-floor blur-md pointer-events-none" />

        {/* Product image */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="relative z-10 max-h-full w-auto object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)] transition-transform duration-[1200ms] ease-out"
          style={offset ? { transform: `translateY(${offset}px)` } : undefined}
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = '0';
          }}
        />

        {/* Warm emission breathing over the product */}
        <div className="absolute inset-0 z-20 ed-light-breathe pointer-events-none">
          <div className="absolute inset-x-[15%] top-[8%] bottom-[12%] ed-glow-warm opacity-70" />
        </div>
      </div>
    </div>
  );
};
