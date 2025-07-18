import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  sizes = '100vw'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Convert image extensions to WebP when possible
  const getOptimizedSrc = (originalSrc: string): string => {
    // For now, return original src
    // In production, you'd implement WebP conversion here
    return originalSrc;
  };

  // Generate srcset for responsive images
  const generateSrcSet = (originalSrc: string): string => {
    const baseSrc = originalSrc.replace(/\.[^/.]+$/, '');
    const ext = originalSrc.split('.').pop();
    
    // For now, return single source
    // In production, you'd generate multiple sizes
    return `${originalSrc} 1x`;
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div 
        className={`bg-muted flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-muted-foreground text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ width, height }}
        />
      )}
      <img
        src={getOptimizedSrc(src)}
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
      />
    </div>
  );
};

export default OptimizedImage;