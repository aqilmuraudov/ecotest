import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export const LedAmbientGlow: React.FC = () => {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springX = useSpring(mouseX, { stiffness: 60, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed pointer-events-none z-30 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px] transition-opacity duration-300 hidden md:block"
      style={{
        left: springX,
        top: springY,
        background: 'radial-gradient(circle, rgba(255, 210, 26, 0.35) 0%, rgba(255, 170, 0, 0.1) 40%, transparent 70%)'
      }}
    />
  );
};
