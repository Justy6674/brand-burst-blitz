import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from './use-toast';

export interface LoadingOperation {
  id: string;
  label: string;
  progress?: number;
  estimatedTime?: string;
  context?: string;
  category?: 'healthcare' | 'compliance' | 'auth' | 'data' | 'network' | 'general';
  sensitive?: boolean;
  complianceLevel?: 'low' | 'medium' | 'high' | 'critical';
  startTime: number;
  timeout?: number;
}

export interface LoadingState {
  isLoading: boolean;
  operations: Map<string, LoadingOperation>;
  globalProgress: number;
  totalOperations: number;
  completedOperations: number;
}

export interface LoadingOptions {
  label?: string;
  estimatedTime?: string;
  context?: string;
  category?: LoadingOperation['category'];
  sensitive?: boolean;
  complianceLevel?: LoadingOperation['complianceLevel'];
  timeout?: number;
  showToast?: boolean;
  trackProgress?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onTimeout?: () => void;
}

export const useLoadingStates = () => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    operations: new Map(),
    globalProgress: 0,
    totalOperations: 0,
    completedOperations: 0
  });

  const { toast } = useToast();
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const progressTrackers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Update global state calculations
  const updateGlobalState = useCallback((operations: Map<string, LoadingOperation>) => {
    const totalOps = operations.size;
    const completedOps = Array.from(operations.values()).filter(op => op.progress === 100).length;
    const totalProgress = Array.from(operations.values()).reduce((sum, op) => sum + (op.progress || 0), 0);
    const avgProgress = totalOps > 0 ? totalProgress / totalOps : 0;

    setState(prev => ({
      ...prev,
      isLoading: totalOps > 0,
      operations,
      globalProgress: avgProgress,
      totalOperations: totalOps,
      completedOperations: completedOps
    }));
  }, []);

  // Start a loading operation
  const startLoading = useCallback((
    operationId: string,
    options: LoadingOptions = {}
  ) => {
    const {
      label = 'Loading...',
      estimatedTime,
      context,
      category = 'general',
      sensitive = false,
      complianceLevel = 'medium',
      timeout,
      showToast = false,
      trackProgress = false,
      onProgress,
      onComplete,
      onTimeout
    } = options;

    const operation: LoadingOperation = {
      id: operationId,
      label,
      progress: trackProgress ? 0 : undefined,
      estimatedTime,
      context,
      category,
      sensitive,
      complianceLevel,
      startTime: Date.now(),
      timeout
    };

    setState(prev => {
      const newOperations = new Map(prev.operations);
      newOperations.set(operationId, operation);
      updateGlobalState(newOperations);
      return prev;
    });

    // Set up timeout if specified
    if (timeout) {
      const timeoutId = setTimeout(() => {
        if (onTimeout) {
          onTimeout();
        } else {
          toast({
            title: 'Operation Timeout',
            description: `${label} is taking longer than expected.`,
            variant: 'destructive',
            duration: 5000
          });
        }
        stopLoading(operationId);
      }, timeout);

      timeoutRefs.current.set(operationId, timeoutId);
    }

    // Set up progress tracking for simulated progress
    if (trackProgress && !onProgress) {
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 15; // Random progress increment
        if (currentProgress >= 95) {
          currentProgress = 95; // Don't complete automatically
          clearInterval(progressInterval);
        }
        updateProgress(operationId, Math.min(currentProgress, 100));
      }, 500);

      progressTrackers.current.set(operationId, progressInterval);
    }

    // Show toast notification for healthcare operations
    if (showToast && (category === 'healthcare' || category === 'compliance')) {
      toast({
        title: `${label} Started`,
        description: sensitive ? 'Processing sensitive healthcare data securely' : 'Healthcare operation in progress',
        duration: 3000
      });
    }

    return operationId;
  }, [toast, updateGlobalState]);

  // Update progress for an operation
  const updateProgress = useCallback((operationId: string, progress: number) => {
    setState(prev => {
      const newOperations = new Map(prev.operations);
      const operation = newOperations.get(operationId);
      
      if (operation) {
        const updatedOperation = { ...operation, progress: Math.min(Math.max(progress, 0), 100) };
        newOperations.set(operationId, updatedOperation);
        updateGlobalState(newOperations);
      }
      
      return prev;
    });
  }, [updateGlobalState]);

  // Stop a loading operation
  const stopLoading = useCallback((operationId: string) => {
    setState(prev => {
      const newOperations = new Map(prev.operations);
      const operation = newOperations.get(operationId);
      
      if (operation) {
        newOperations.delete(operationId);
        updateGlobalState(newOperations);

        // Clean up timeouts and intervals
        const timeoutId = timeoutRefs.current.get(operationId);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutRefs.current.delete(operationId);
        }

        const progressId = progressTrackers.current.get(operationId);
        if (progressId) {
          clearInterval(progressId);
          progressTrackers.current.delete(operationId);
        }

        // Calculate operation duration
        const duration = Date.now() - operation.startTime;
        const durationText = duration > 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`;

        // Show completion toast for healthcare operations
        if (operation.category === 'healthcare' || operation.category === 'compliance') {
          toast({
            title: `${operation.label} Complete`,
            description: `Completed in ${durationText}`,
            duration: 2000
          });
        }
      }
      
      return prev;
    });
  }, [toast, updateGlobalState]);

  // Stop all loading operations
  const stopAllLoading = useCallback(() => {
    // Clear all timeouts and intervals
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    progressTrackers.current.forEach(intervalId => clearInterval(intervalId));
    timeoutRefs.current.clear();
    progressTrackers.current.clear();

    setState({
      isLoading: false,
      operations: new Map(),
      globalProgress: 0,
      totalOperations: 0,
      completedOperations: 0
    });
  }, []);

  // Get specific operation state
  const getOperation = useCallback((operationId: string): LoadingOperation | undefined => {
    return state.operations.get(operationId);
  }, [state.operations]);

  // Check if specific operation is loading
  const isOperationLoading = useCallback((operationId: string): boolean => {
    return state.operations.has(operationId);
  }, [state.operations]);

  // Get operations by category
  const getOperationsByCategory = useCallback((category: LoadingOperation['category']): LoadingOperation[] => {
    return Array.from(state.operations.values()).filter(op => op.category === category);
  }, [state.operations]);

  // Convenience methods for common operations
  const startHealthcareOperation = useCallback((
    operationId: string,
    label: string,
    options: Omit<LoadingOptions, 'category'> = {}
  ) => {
    return startLoading(operationId, {
      ...options,
      category: 'healthcare',
      showToast: true,
      trackProgress: true
    });
  }, [startLoading]);

  const startComplianceCheck = useCallback((
    operationId: string,
    label: string,
    complianceLevel: LoadingOperation['complianceLevel'] = 'high'
  ) => {
    return startLoading(operationId, {
      label,
      category: 'compliance',
      complianceLevel,
      sensitive: true,
      showToast: true,
      trackProgress: true,
      timeout: 30000, // 30 second timeout for compliance checks
      estimatedTime: '10-30 seconds'
    });
  }, [startLoading]);

  const startDataOperation = useCallback((
    operationId: string,
    label: string,
    sensitive: boolean = false
  ) => {
    return startLoading(operationId, {
      label,
      category: 'data',
      sensitive,
      trackProgress: true,
      timeout: 60000, // 1 minute timeout for data operations
      estimatedTime: '30-60 seconds'
    });
  }, [startLoading]);

  const startAuthOperation = useCallback((
    operationId: string,
    label: string
  ) => {
    return startLoading(operationId, {
      label,
      category: 'auth',
      timeout: 15000, // 15 second timeout for auth operations
      estimatedTime: '5-15 seconds'
    });
  }, [startLoading]);

  const startNetworkOperation = useCallback((
    operationId: string,
    label: string
  ) => {
    return startLoading(operationId, {
      label,
      category: 'network',
      timeout: 30000, // 30 second timeout for network operations
      estimatedTime: '5-30 seconds'
    });
  }, [startLoading]);

  // Async wrapper for operations
  const withLoading = useCallback(async <T>(
    operationId: string,
    operation: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T> => {
    try {
      startLoading(operationId, options);
      const result = await operation();
      stopLoading(operationId);
      return result;
    } catch (error) {
      stopLoading(operationId);
      throw error;
    }
  }, [startLoading, stopLoading]);

  // Healthcare-specific async wrapper
  const withHealthcareLoading = useCallback(async <T>(
    operationId: string,
    operation: () => Promise<T>,
    label: string,
    options: Omit<LoadingOptions, 'category' | 'label'> = {}
  ): Promise<T> => {
    return withLoading(operationId, operation, {
      ...options,
      label,
      category: 'healthcare',
      showToast: true,
      trackProgress: true
    });
  }, [withLoading]);

  // Compliance-specific async wrapper
  const withComplianceLoading = useCallback(async <T>(
    operationId: string,
    operation: () => Promise<T>,
    label: string,
    complianceLevel: LoadingOperation['complianceLevel'] = 'high'
  ): Promise<T> => {
    return withLoading(operationId, operation, {
      label,
      category: 'compliance',
      complianceLevel,
      sensitive: true,
      showToast: true,
      trackProgress: true,
      timeout: 30000,
      estimatedTime: '10-30 seconds'
    });
  }, [withLoading]);

  // Progress simulation for operations without real progress tracking
  const simulateProgress = useCallback((
    operationId: string,
    duration: number = 3000,
    onComplete?: () => void
  ) => {
    let progress = 0;
    const increment = 100 / (duration / 100); // Update every 100ms
    
    const interval = setInterval(() => {
      progress += increment + (Math.random() * 5); // Add some randomness
      progress = Math.min(progress, 100);
      
      updateProgress(operationId, progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        if (onComplete) {
          onComplete();
        }
      }
    }, 100);

    return interval;
  }, [updateProgress]);

  // Get loading statistics
  const getStats = useCallback(() => {
    const operations = Array.from(state.operations.values());
    const categories = operations.reduce((acc, op) => {
      acc[op.category] = (acc[op.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgDuration = operations.length > 0 
      ? operations.reduce((sum, op) => sum + (Date.now() - op.startTime), 0) / operations.length
      : 0;

    return {
      totalOperations: state.totalOperations,
      completedOperations: state.completedOperations,
      activeOperations: state.operations.size,
      globalProgress: state.globalProgress,
      categoryCounts: categories,
      averageDuration: avgDuration
    };
  }, [state]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
      progressTrackers.current.forEach(intervalId => clearInterval(intervalId));
    };
  }, []);

  return {
    // State
    ...state,
    
    // Basic operations
    startLoading,
    stopLoading,
    stopAllLoading,
    updateProgress,
    
    // Query operations
    getOperation,
    isOperationLoading,
    getOperationsByCategory,
    
    // Convenience methods
    startHealthcareOperation,
    startComplianceCheck,
    startDataOperation,
    startAuthOperation,
    startNetworkOperation,
    
    // Async wrappers
    withLoading,
    withHealthcareLoading,
    withComplianceLoading,
    
    // Utilities
    simulateProgress,
    getStats
  };
}; 