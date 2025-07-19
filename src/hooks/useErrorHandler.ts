import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AsyncErrorOptions {
  function_name?: string;
  user_message?: string;
  retry_enabled?: boolean;
}

export const useErrorHandler = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAsyncError = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    options: AsyncErrorOptions = {}
  ): Promise<T | null> => {
    const {
      function_name = 'operation',
      user_message = 'An unexpected error occurred. Please try again.',
      retry_enabled = true
    } = options;

    try {
      setIsLoading(true);
      return await asyncFunction();
    } catch (error) {
      console.error(`Error in ${function_name}:`, error);
      
      // Extract meaningful error message
      let errorMessage = user_message;
      if (error instanceof Error) {
        // Use the error message if it's more helpful than the default
        if (error.message && !error.message.includes('Failed to fetch')) {
          errorMessage = error.message;
        }
      }

      // Show error toast
      toast({
        title: "Something went wrong",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleSyncError = useCallback((
    error: Error,
    options: AsyncErrorOptions = {}
  ) => {
    const {
      function_name = 'operation',
      user_message = 'An unexpected error occurred.'
    } = options;

    console.error(`Error in ${function_name}:`, error);
    
    toast({
      title: "Error",
      description: user_message,
      variant: "destructive",
    });
  }, [toast]);

  return {
    handleAsyncError,
    handleSyncError,
    isLoading,
  };
};