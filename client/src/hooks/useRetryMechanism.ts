import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from './use-toast';
import { useErrorHandler } from './useErrorHandler';
import { useLoadingStates } from './useLoadingStates';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: any, attempt: number) => boolean;
  onRetry?: (attempt: number, error: any) => void;
  onMaxAttemptsReached?: (error: any) => void;
  jitter?: boolean;
  exponentialBackoff?: boolean;
}

export interface RetryOperation {
  id: string;
  label: string;
  operation: () => Promise<any>;
  config: RetryConfig;
  attempts: number;
  lastError?: any;
  nextRetryAt?: number;
  category?: 'healthcare' | 'compliance' | 'auth' | 'data' | 'network' | 'general';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  context?: string;
}

interface RetryState {
  operations: Map<string, RetryOperation>;
  activeRetries: number;
  totalRetries: number;
  successfulRetries: number;
  failedRetries: number;
}

// Default retry configurations for different operation types
const DEFAULT_CONFIGS: Record<string, RetryConfig> = {
  healthcare: {
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    exponentialBackoff: true,
    jitter: true,
    retryCondition: (error, attempt) => {
      // Don't retry compliance violations or authentication errors
      if (error.code === 'AHPRA_COMPLIANCE_VIOLATION' || 
          error.code === 'TGA_DEVICE_COMPLIANCE' ||
          error.code === 'AUTH_INVALID_CREDENTIALS') {
        return false;
      }
      // Retry network and system errors
      return error.code?.includes('NETWORK') || 
             error.code?.includes('SYSTEM') || 
             error.status >= 500;
    }
  },
  compliance: {
    maxAttempts: 3,
    baseDelay: 5000,
    maxDelay: 60000,
    backoffMultiplier: 3,
    exponentialBackoff: true,
    jitter: true,
    retryCondition: (error, attempt) => {
      // Only retry system errors for compliance operations
      return error.status >= 500 || error.code?.includes('SYSTEM');
    }
  },
  auth: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    exponentialBackoff: true,
    jitter: false,
    retryCondition: (error, attempt) => {
      // Don't retry invalid credentials, retry only network/system errors
      return error.code !== 'AUTH_INVALID_CREDENTIALS' && 
             (error.code?.includes('NETWORK') || error.status >= 500);
    }
  },
  data: {
    maxAttempts: 4,
    baseDelay: 1500,
    maxDelay: 20000,
    backoffMultiplier: 2.5,
    exponentialBackoff: true,
    jitter: true,
    retryCondition: (error, attempt) => {
      // Retry network, timeout, and server errors
      return error.code?.includes('NETWORK') || 
             error.code?.includes('TIMEOUT') || 
             error.status >= 500;
    }
  },
  network: {
    maxAttempts: 6,
    baseDelay: 1000,
    maxDelay: 15000,
    backoffMultiplier: 1.8,
    exponentialBackoff: true,
    jitter: true,
    retryCondition: (error, attempt) => {
      // Always retry network errors except for client errors (4xx)
      return error.status >= 500 || 
             error.code?.includes('NETWORK') || 
             error.code?.includes('TIMEOUT');
    }
  },
  general: {
    maxAttempts: 3,
    baseDelay: 2000,
    maxDelay: 16000,
    backoffMultiplier: 2,
    exponentialBackoff: true,
    jitter: true,
    retryCondition: (error, attempt) => {
      // General retry strategy for unknown errors
      return error.status >= 500 || error.code?.includes('NETWORK');
    }
  }
};

export const useRetryMechanism = () => {
  const [state, setState] = useState<RetryState>({
    operations: new Map(),
    activeRetries: 0,
    totalRetries: 0,
    successfulRetries: 0,
    failedRetries: 0
  });

  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const { startLoading, stopLoading, updateProgress } = useLoadingStates();
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Calculate retry delay with exponential backoff and jitter
  const calculateDelay = useCallback((config: RetryConfig, attempt: number): number => {
    let delay = config.baseDelay;
    
    if (config.exponentialBackoff) {
      delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    }
    
    // Apply jitter to prevent thundering herd
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.min(delay, config.maxDelay);
  }, []);

  // Execute retry operation
  const executeRetry = useCallback(async (
    operationId: string,
    operation: RetryOperation
  ): Promise<any> => {
    const { config, attempts, label } = operation;
    
    try {
      // Update loading state
      startLoading(`retry-${operationId}`, {
        label: `${label} (Attempt ${attempts + 1}/${config.maxAttempts})`,
        category: operation.category,
        context: operation.context,
        estimatedTime: attempts > 0 ? 'Retrying...' : undefined
      });

      // Execute the operation
      const result = await operation.operation();
      
      // Success - clean up and update stats
      setState(prev => {
        const newOperations = new Map(prev.operations);
        newOperations.delete(operationId);
        
        return {
          ...prev,
          operations: newOperations,
          activeRetries: prev.activeRetries - 1,
          successfulRetries: prev.successfulRetries + 1
        };
      });

      // Clear timeout
      const timeoutId = timeoutRefs.current.get(operationId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutRefs.current.delete(operationId);
      }

      stopLoading(`retry-${operationId}`);

      // Show success toast for retried operations
      if (attempts > 0) {
        toast({
          title: 'Operation Successful',
          description: `${label} succeeded after ${attempts + 1} attempt${attempts > 0 ? 's' : ''}`,
          duration: 3000
        });
      }

      return result;

    } catch (error) {
      const newAttempts = attempts + 1;
      const shouldRetry = config.retryCondition ? 
        config.retryCondition(error, newAttempts) : 
        newAttempts < config.maxAttempts;

      stopLoading(`retry-${operationId}`);

      if (shouldRetry && newAttempts < config.maxAttempts) {
        // Schedule next retry
        const delay = calculateDelay(config, newAttempts);
        const nextRetryAt = Date.now() + delay;

        setState(prev => {
          const newOperations = new Map(prev.operations);
          const updatedOperation = {
            ...operation,
            attempts: newAttempts,
            lastError: error,
            nextRetryAt
          };
          newOperations.set(operationId, updatedOperation);
          
          return {
            ...prev,
            operations: newOperations,
            totalRetries: prev.totalRetries + 1
          };
        });

        // Call onRetry callback
        if (config.onRetry) {
          config.onRetry(newAttempts, error);
        }

        // Show retry toast
        toast({
          title: 'Retrying Operation',
          description: `${label} failed. Retrying in ${Math.round(delay / 1000)} seconds (${newAttempts}/${config.maxAttempts})`,
          duration: Math.min(delay, 5000)
        });

        // Schedule the retry
        const timeoutId = setTimeout(() => {
          executeRetry(operationId, updatedOperation);
        }, delay);

        timeoutRefs.current.set(operationId, timeoutId);

        return Promise.reject(error); // Return error but continue retrying

      } else {
        // Max attempts reached or shouldn't retry
        setState(prev => {
          const newOperations = new Map(prev.operations);
          newOperations.delete(operationId);
          
          return {
            ...prev,
            operations: newOperations,
            activeRetries: prev.activeRetries - 1,
            failedRetries: prev.failedRetries + 1
          };
        });

        // Clear timeout
        const timeoutId = timeoutRefs.current.get(operationId);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutRefs.current.delete(operationId);
        }

        // Call onMaxAttemptsReached callback
        if (config.onMaxAttemptsReached) {
          config.onMaxAttemptsReached(error);
        }

        // Handle the final error
        await handleError(error, {
          context: `${label} - Max retry attempts reached`,
          userAction: 'Retry operation',
          showToast: true
        });

        throw error;
      }
    }
  }, [calculateDelay, startLoading, stopLoading, toast, handleError]);

  // Start retry operation
  const withRetry = useCallback(async <T>(
    operationId: string,
    operation: () => Promise<T>,
    label: string,
    category: RetryOperation['category'] = 'general',
    customConfig?: Partial<RetryConfig>
  ): Promise<T> => {
    const config = {
      ...DEFAULT_CONFIGS[category],
      ...customConfig
    };

    const retryOperation: RetryOperation = {
      id: operationId,
      label,
      operation,
      config,
      attempts: 0,
      category,
      context: `Retry operation: ${label}`
    };

    setState(prev => {
      const newOperations = new Map(prev.operations);
      newOperations.set(operationId, retryOperation);
      
      return {
        ...prev,
        operations: newOperations,
        activeRetries: prev.activeRetries + 1
      };
    });

    return executeRetry(operationId, retryOperation);
  }, [executeRetry]);

  // Healthcare-specific retry wrapper
  const withHealthcareRetry = useCallback(async <T>(
    operationId: string,
    operation: () => Promise<T>,
    label: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<T> => {
    const customConfig: Partial<RetryConfig> = priority === 'critical' ? {
      maxAttempts: 6,
      baseDelay: 1000,
      maxDelay: 45000
    } : {};

    return withRetry(operationId, operation, label, 'healthcare', customConfig);
  }, [withRetry]);

  // Compliance-specific retry wrapper
  const withComplianceRetry = useCallback(async <T>(
    operationId: string,
    operation: () => Promise<T>,
    label: string
  ): Promise<T> => {
    return withRetry(operationId, operation, label, 'compliance');
  }, [withRetry]);

  // Network-specific retry wrapper with aggressive retry
  const withNetworkRetry = useCallback(async <T>(
    operationId: string,
    operation: () => Promise<T>,
    label: string
  ): Promise<T> => {
    return withRetry(operationId, operation, label, 'network');
  }, [withRetry]);

  // Data operation retry wrapper
  const withDataRetry = useCallback(async <T>(
    operationId: string,
    operation: () => Promise<T>,
    label: string,
    sensitive: boolean = false
  ): Promise<T> => {
    const customConfig: Partial<RetryConfig> = sensitive ? {
      maxAttempts: 3, // Fewer retries for sensitive data
      onRetry: (attempt, error) => {
        console.log(`Sensitive data operation retry ${attempt}:`, error);
      }
    } : {};

    return withRetry(operationId, operation, label, 'data', customConfig);
  }, [withRetry]);

  // Auth operation retry wrapper
  const withAuthRetry = useCallback(async <T>(
    operationId: string,
    operation: () => Promise<T>,
    label: string
  ): Promise<T> => {
    return withRetry(operationId, operation, label, 'auth');
  }, [withRetry]);

  // Cancel retry operation
  const cancelRetry = useCallback((operationId: string) => {
    const timeoutId = timeoutRefs.current.get(operationId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(operationId);
    }

    setState(prev => {
      const newOperations = new Map(prev.operations);
      const operation = newOperations.get(operationId);
      
      if (operation) {
        newOperations.delete(operationId);
        
        toast({
          title: 'Operation Cancelled',
          description: `${operation.label} retry cancelled`,
          duration: 3000
        });
        
        return {
          ...prev,
          operations: newOperations,
          activeRetries: prev.activeRetries - 1
        };
      }
      
      return prev;
    });
  }, [toast]);

  // Cancel all retry operations
  const cancelAllRetries = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefs.current.clear();

    const operationCount = state.operations.size;
    
    setState({
      operations: new Map(),
      activeRetries: 0,
      totalRetries: state.totalRetries,
      successfulRetries: state.successfulRetries,
      failedRetries: state.failedRetries + operationCount
    });

    if (operationCount > 0) {
      toast({
        title: 'All Retries Cancelled',
        description: `${operationCount} retry operation${operationCount !== 1 ? 's' : ''} cancelled`,
        duration: 3000
      });
    }
  }, [state, toast]);

  // Get retry statistics
  const getRetryStats = useCallback(() => {
    const operations = Array.from(state.operations.values());
    const averageAttempts = operations.length > 0 
      ? operations.reduce((sum, op) => sum + op.attempts, 0) / operations.length 
      : 0;

    const categoryStats = operations.reduce((acc, op) => {
      const category = op.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      activeRetries: state.activeRetries,
      totalRetries: state.totalRetries,
      successfulRetries: state.successfulRetries,
      failedRetries: state.failedRetries,
      successRate: state.totalRetries > 0 
        ? (state.successfulRetries / state.totalRetries) * 100 
        : 0,
      averageAttempts,
      categoryStats
    };
  }, [state]);

  // Get pending retry operations
  const getPendingRetries = useCallback(() => {
    return Array.from(state.operations.values())
      .map(op => ({
        id: op.id,
        label: op.label,
        attempts: op.attempts,
        maxAttempts: op.config.maxAttempts,
        nextRetryAt: op.nextRetryAt,
        category: op.category,
        lastError: op.lastError
      }));
  }, [state.operations]);

  // Check if operation is being retried
  const isRetrying = useCallback((operationId: string): boolean => {
    return state.operations.has(operationId);
  }, [state.operations]);

  // Get time until next retry
  const getTimeUntilRetry = useCallback((operationId: string): number => {
    const operation = state.operations.get(operationId);
    if (!operation || !operation.nextRetryAt) return 0;
    
    return Math.max(0, operation.nextRetryAt - Date.now());
  }, [state.operations]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, []);

  return {
    // State
    ...state,
    
    // Main retry functions
    withRetry,
    withHealthcareRetry,
    withComplianceRetry,
    withNetworkRetry,
    withDataRetry,
    withAuthRetry,
    
    // Management functions
    cancelRetry,
    cancelAllRetries,
    
    // Query functions
    getRetryStats,
    getPendingRetries,
    isRetrying,
    getTimeUntilRetry,
    
    // Default configurations
    DEFAULT_CONFIGS
  };
}; 