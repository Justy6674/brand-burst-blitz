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
    <section className="relative py-16 md:py-24 overflow-hidden mx-4 md:mx-8 my-8 rounded-2xl border border-gray-300/20 bg-black/5 backdrop-blur-sm">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
        <img 
          src={backgroundImage}
          alt="Hero Background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-blue-900/50 to-purple-900/60"></div>
      </div>
      
      {/* Hero Content */}
      <div className="relative z-20 container mx-auto px-6">
        {children}
      </div>
    </section>
  );
};