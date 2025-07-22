import { useEffect, useCallback, useRef, useState } from 'react';
import { useToast } from './use-toast';

interface TouchPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp: number;
}

interface MobileCanvasOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  brushSize: number;
  brushColor: string;
  onDrawStart?: (point: TouchPoint) => void;
  onDrawMove?: (point: TouchPoint) => void;
  onDrawEnd?: () => void;
  enablePressureSensitivity?: boolean;
  enableGestureDetection?: boolean;
}

export function useMobileCanvasOptimization({
  canvasRef,
  brushSize,
  brushColor,
  onDrawStart,
  onDrawMove,
  onDrawEnd,
  enablePressureSensitivity = true,
  enableGestureDetection = true
}: MobileCanvasOptions) {
  const { toast } = useToast();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const [gestureState, setGestureState] = useState<'none' | 'pan' | 'zoom' | 'drawing'>('none');
  const pathRef = useRef<Path2D | null>(null);
  const smoothedPathRef = useRef<TouchPoint[]>([]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth <= 768 
        || ('ontouchstart' in window);
      
      setIsMobile(isMobileDevice);
      
      if (isMobileDevice) {
        console.log('Mobile device detected, enabling touch optimizations');
        initializeMobileOptimizations();
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize mobile-specific optimizations
  const initializeMobileOptimizations = useCallback(() => {
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Prevent context menu on long press
    document.addEventListener('contextmenu', (event) => {
      if (event.target === canvasRef.current) {
        event.preventDefault();
      }
    });

    // Add mobile-specific CSS
    const style = document.createElement('style');
    style.textContent = `
      .mobile-canvas {
        touch-action: none;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
    `;
    document.head.appendChild(style);
  }, [canvasRef]);

  // Touch event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isMobile) return;

    canvas.classList.add('mobile-canvas');

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      
      const touches = Array.from(event.touches);
      const now = Date.now();
      
      if (touches.length === 1) {
        // Single touch - drawing
        const touch = touches[0];
        const point = getTouchPoint(touch, canvas);
        
        setGestureState('drawing');
        setIsDrawing(true);
        setLastTouchTime(now);
        
        smoothedPathRef.current = [point];
        pathRef.current = new Path2D();
        pathRef.current.moveTo(point.x, point.y);
        
        startDrawing(point);
        onDrawStart?.(point);
        
      } else if (touches.length === 2 && enableGestureDetection) {
        // Two touches - gestures
        setGestureState('pan');
        setIsDrawing(false);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      
      const touches = Array.from(event.touches);
      
      if (touches.length === 1 && gestureState === 'drawing' && isDrawing) {
        const touch = touches[0];
        const point = getTouchPoint(touch, canvas);
        
        // Smooth the path using interpolation
        const smoothedPoint = smoothPath(point);
        smoothedPathRef.current.push(smoothedPoint);
        
        drawToCanvas(smoothedPoint);
        onDrawMove?.(smoothedPoint);
        
      } else if (touches.length === 2 && enableGestureDetection) {
        handleGestures(touches, canvas);
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      
      if (isDrawing) {
        setIsDrawing(false);
        setGestureState('none');
        
        // Finalize the path
        if (smoothedPathRef.current.length > 1) {
          finalizeDrawing();
        }
        
        onDrawEnd?.();
      }
      
      // Reset gesture state when no touches
      if (event.touches.length === 0) {
        setGestureState('none');
        setTouchPoints([]);
      }
    };

    // Add event listeners with passive: false for preventDefault
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
      canvas.classList.remove('mobile-canvas');
    };
  }, [canvasRef, isMobile, isDrawing, gestureState, brushSize, brushColor, enableGestureDetection]);

  // Get touch point with pressure sensitivity
  const getTouchPoint = useCallback((touch: Touch, canvas: HTMLCanvasElement): TouchPoint => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    // Try to get pressure from touch (if supported)
    let pressure = 0.5; // Default pressure
    if (enablePressureSensitivity && 'force' in touch) {
      pressure = Math.max(0.1, Math.min(1.0, (touch as any).force || 0.5));
    }
    
    return {
      x,
      y,
      pressure,
      timestamp: Date.now()
    };
  }, [enablePressureSensitivity]);

  // Smooth drawing path using quadratic curves
  const smoothPath = useCallback((newPoint: TouchPoint): TouchPoint => {
    const points = smoothedPathRef.current;
    
    if (points.length < 2) {
      return newPoint;
    }
    
    const prevPoint = points[points.length - 1];
    const prevPrevPoint = points[points.length - 2];
    
    // Calculate smoothed position using quadratic interpolation
    const smoothedX = (prevPrevPoint.x + 2 * prevPoint.x + newPoint.x) / 4;
    const smoothedY = (prevPrevPoint.y + 2 * prevPoint.y + newPoint.y) / 4;
    
    return {
      x: smoothedX,
      y: smoothedY,
      pressure: newPoint.pressure,
      timestamp: newPoint.timestamp
    };
  }, []);

  // Start drawing on canvas
  const startDrawing = useCallback((point: TouchPoint) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    
    // Apply pressure-sensitive brush size
    const adjustedBrushSize = enablePressureSensitivity 
      ? brushSize * (point.pressure || 0.5)
      : brushSize;
    
    ctx.lineWidth = adjustedBrushSize;
    ctx.strokeStyle = brushColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Optimize for mobile performance
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }, [canvasRef, brushSize, brushColor, enablePressureSensitivity]);

  // Draw to canvas with optimization
  const drawToCanvas = useCallback((point: TouchPoint) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || smoothedPathRef.current.length < 2) return;
    
    const prevPoint = smoothedPathRef.current[smoothedPathRef.current.length - 2];
    
    // Use quadratic curve for smooth lines
    const cpx = (prevPoint.x + point.x) / 2;
    const cpy = (prevPoint.y + point.y) / 2;
    
    ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpx, cpy);
    
    // Apply pressure-sensitive width
    if (enablePressureSensitivity && point.pressure) {
      const adjustedBrushSize = brushSize * point.pressure;
      ctx.lineWidth = adjustedBrushSize;
    }
    
    ctx.stroke();
  }, [canvasRef, brushSize, enablePressureSensitivity]);

  // Finalize drawing with optimization
  const finalizeDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    // Final stroke
    ctx.stroke();
    
    // Clear path reference
    pathRef.current = null;
    smoothedPathRef.current = [];
    
    // Trigger canvas optimization
    requestIdleCallback(() => {
      optimizeCanvas();
    });
  }, [canvasRef]);

  // Handle multi-touch gestures
  const handleGestures = useCallback((touches: Touch[], canvas: HTMLCanvasElement) => {
    if (!enableGestureDetection || touches.length !== 2) return;
    
    const touch1 = getTouchPoint(touches[0], canvas);
    const touch2 = getTouchPoint(touches[1], canvas);
    
    // Calculate distance for zoom detection
    const distance = Math.sqrt(
      Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2)
    );
    
    setTouchPoints([touch1, touch2]);
    
    // Simple gesture detection (could be expanded)
    const now = Date.now();
    if (now - lastTouchTime > 100) { // Throttle gesture detection
      setLastTouchTime(now);
      
      // You could implement zoom/pan here
      console.log('Multi-touch gesture detected', { distance, touch1, touch2 });
    }
  }, [enableGestureDetection, lastTouchTime, getTouchPoint]);

  // Optimize canvas for mobile performance
  const optimizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Enable hardware acceleration hints
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Force GPU compositing
      ctx.translate(0.5, 0.5);
      ctx.translate(-0.5, -0.5);
    }
  }, [canvasRef]);

  // Vibration feedback for mobile
  const triggerHapticFeedback = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!isMobile || !navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    
    navigator.vibrate(patterns[intensity]);
  }, [isMobile]);

  // Clear canvas optimized for mobile
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    // Clear with fillRect for better performance on mobile
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Reset path references
    pathRef.current = null;
    smoothedPathRef.current = [];
    
    triggerHapticFeedback('light');
  }, [canvasRef, triggerHapticFeedback]);

  // Download canvas as image (mobile-optimized)
  const downloadCanvasImage = useCallback((filename: string = 'healthcare-sketch') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      // Create high-quality image
      const link = document.createElement('a');
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      if (isMobile) {
        // Mobile: Open in new tab for better UX
        window.open(link.href, '_blank');
      } else {
        // Desktop: Direct download
        link.click();
      }
      
      toast({
        title: "🎨 Sketch Saved",
        description: "Healthcare sketch saved successfully",
      });
      
      triggerHapticFeedback('medium');
    } catch (error) {
      console.error('Error saving canvas:', error);
      toast({
        title: "Save Failed",
        description: "Could not save sketch",
        variant: "destructive"
      });
    }
  }, [canvasRef, isMobile, toast, triggerHapticFeedback]);

  return {
    isMobile,
    isDrawing,
    gestureState,
    touchPoints,
    clearCanvas,
    downloadCanvasImage,
    triggerHapticFeedback,
    optimizeCanvas
  };
} 