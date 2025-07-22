import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

interface RetryState {
  isLoading: boolean;
  attempts: number;
  lastError?: Error;
}

export const useRetry = <T = any>(options: RetryOptions = {}) => {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options;
  const { toast } = useToast();
  
  const [state, setState] = useState<RetryState>({
    isLoading: false,
    attempts: 0,
  });

  const executeWithRetry = useCallback(async (
    operation: () => Promise<T>,
    operationName?: string
  ): Promise<T> => {
    setState(prev => ({ ...prev, isLoading: true, attempts: 0 }));

    let currentAttempt = 0;
    let lastError: Error;

    while (currentAttempt < maxAttempts) {
      try {
        setState(prev => ({ ...prev, attempts: currentAttempt + 1 }));
        const result = await operation();
        
        setState(prev => ({ ...prev, isLoading: false, lastError: undefined }));
        
        if (currentAttempt > 0) {
          toast({
            title: "Success!",
            description: `${operationName || 'Operation'} completed successfully after ${currentAttempt + 1} attempts.`,
          });
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        currentAttempt++;

        if (currentAttempt < maxAttempts) {
          const waitTime = backoff ? delay * Math.pow(2, currentAttempt - 1) : delay;
          
          toast({
            title: "Retrying...",
            description: `${operationName || 'Operation'} failed. Retrying in ${waitTime/1000} seconds... (Attempt ${currentAttempt}/${maxAttempts})`,
            variant: "default",
          });
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    setState(prev => ({ ...prev, isLoading: false, lastError }));
    
    toast({
      title: "Operation Failed",
      description: `${operationName || 'Operation'} failed after ${maxAttempts} attempts. ${lastError.message}`,
      variant: "destructive",
    });
    
    throw lastError;
  }, [maxAttempts, delay, backoff, toast]);

  const retry = useCallback((operation: () => Promise<T>, operationName?: string) => {
    return executeWithRetry(operation, operationName);
  }, [executeWithRetry]);

  return {
    ...state,
    retry,
    executeWithRetry,
  };
};