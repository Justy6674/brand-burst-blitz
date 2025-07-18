import React from 'react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  backgroundImage: string;
  children: React.ReactNode;
  className?: string;
  overlayIntensity?: 'light' | 'medium' | 'heavy';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  backgroundImage,
  children,
  className,
  overlayIntensity = 'medium'
}) => {
  const overlayClasses = {
    light: 'from-background/20 via-background/10 to-background/20',
    medium: 'from-background/40 via-background/20 to-background/40',
    heavy: 'from-background/60 via-background/40 to-background/60'
  };

  const verticalOverlayClasses = {
    light: 'from-background/15 via-transparent to-background/25',
    medium: 'from-background/30 via-transparent to-background/50',
    heavy: 'from-background/45 via-transparent to-background/70'
  };

  return (
    <section className={cn("relative min-h-screen flex items-center justify-center overflow-hidden pt-16", className)}>
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay for better text readability */}
        <div className={cn("absolute inset-0 bg-gradient-to-r", overlayClasses[overlayIntensity])}></div>
        <div className={cn("absolute inset-0 bg-gradient-to-b", verticalOverlayClasses[overlayIntensity])}></div>
      </div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {children}
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};