import { useState, useEffect, useCallback } from 'react';

interface ImageOptimizationOptions {
  src: string;
  width?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
}

interface OptimizedImageData {
  src: string;
  srcSet: string;
  isLoading: boolean;
  error: string | null;
}

export const useImageOptimization = (options: ImageOptimizationOptions): OptimizedImageData => {
  const [optimizedData, setOptimizedData] = useState<OptimizedImageData>({
    src: options.src,
    srcSet: '',
    isLoading: false,
    error: null
  });

  const generateResponsiveSizes = useCallback((baseSrc: string, baseWidth?: number) => {
    // Generate different sizes for responsive images
    const sizes = [320, 640, 768, 1024, 1280, 1536];
    const targetWidth = baseWidth || 1024;
    
    const validSizes = sizes.filter(size => size <= targetWidth * 1.5);
    
    return validSizes.map(size => {
      // In a real implementation, you'd generate optimized URLs here
      // For now, we'll use the original image
      return `${baseSrc} ${size}w`;
    }).join(', ');
  }, []);

  const optimizeImage = useCallback(async () => {
    setOptimizedData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // In a real implementation, you would:
      // 1. Check if WebP is supported
      // 2. Generate optimized URLs with different sizes
      // 3. Convert formats if needed
      
      const srcSet = generateResponsiveSizes(options.src, options.width);
      
      setOptimizedData({
        src: options.src,
        srcSet,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setOptimizedData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Image optimization failed'
      }));
    }
  }, [options.src, options.width, generateResponsiveSizes]);

  useEffect(() => {
    optimizeImage();
  }, [optimizeImage]);

  return optimizedData;
};

// Utility function to check WebP support
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Performance monitoring for images
export const trackImagePerformance = (src: string, loadTime: number) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Track Core Web Vitals related to images
    console.log(`Image ${src} loaded in ${loadTime}ms`);
    
    // In production, you'd send this to your analytics service
    // analytics.track('image_load_time', { src, loadTime });
  }
};