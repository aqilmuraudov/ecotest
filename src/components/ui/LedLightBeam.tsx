import React from 'react';
import { motion } from 'motion/react';

interface LedLightBeamProps {
  color?: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  glowIntensity?: 'subtle' | 'medium' | 'high';
}

export const LedLightBeam: React.FC<LedLightBeamProps> = ({
  color = '#FFD21A',
  className = '',
  orientation = 'horizontal',
  glowIntensity = 'medium'
}) => {
  const intensityMap = {
    subtle: 'opacity-40 blur-[4px]',
    medium: 'opacity-70 blur-[8px]',
    high: 'opacity-90 blur-[14px]'
  };

  if (orientation === 'vertical') {
    return (
      <div className={`relative w-[2px] h-full overflow-hidden bg-white/5 ${className}`}>
        {/* Core LED profile line */}
        <div className="absolute inset-0 bg-white/10" />
        
        {/* Flowing LED Light Pulse */}
        <motion.div
          animate={{
            y: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: `linear-gradient(to bottom, transparent, ${color}, #FFFFFF, ${color}, transparent)`
          }}
          className="absolute inset-x-0 h-32"
        />

        {/* Ambient Light Diffusion */}
        <motion.div
          animate={{
            y: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: `linear-gradient(to bottom, transparent, ${color}, transparent)`
          }}
          className={`absolute -inset-x-2 h-32 ${intensityMap[glowIntensity]}`}
        />
      </div>
    );
  }

  return (
    <div className={`relative h-[2px] w-full overflow-hidden bg-white/5 ${className}`}>
      {/* Core LED profile base */}
      <div className="absolute inset-0 bg-white/10" />
      
      {/* Flowing LED Light Pulse */}
      <motion.div
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: `linear-gradient(to right, transparent, ${color}, #FFFFFF, ${color}, transparent)`
        }}
        className="absolute inset-y-0 w-48"
      />

      {/* Ambient Light Diffusion */}
      <motion.div
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: `linear-gradient(to right, transparent, ${color}, transparent)`
        }}
        className={`absolute -inset-y-2 w-48 ${intensityMap[glowIntensity]}`}
      />
    </div>
  );
};
