import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ErrorLogData {
  error_type: string;
  error_message: string;
  function_name?: string;
  stack_trace?: string;
  user_id?: string;
  request_data?: any;
  error_details?: any;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const logError = useCallback(async (errorData: ErrorLogData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('error_logs').insert({
        ...errorData,
        user_id: user?.id,
        error_details: errorData.error_details || {},
        request_data: errorData.request_data || {},
      });
    } catch (logError) {
      console.error('Failed to log error to database:', logError);
    }
  }, []);

  const handleError = useCallback((error: Error | string, context?: {
    function_name?: string;
    user_message?: string;
    show_toast?: boolean;
    log_to_db?: boolean;
    request_data?: any;
  }) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;
    
    console.error('Error handled:', errorMessage, error);

    // Show toast notification
    if (context?.show_toast !== false) {
      toast({
        title: "Error",
        description: context?.user_message || "An unexpected error occurred",
        variant: "destructive",
      });
    }

    // Log to database
    if (context?.log_to_db !== false) {
      logError({
        error_type: typeof error === 'string' ? 'manual' : error.constructor.name,
        error_message: errorMessage,
        function_name: context?.function_name,
        stack_trace: errorStack,
        request_data: context?.request_data,
        error_details: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        },
      });
    }
  }, [toast, logError]);

  const handleAsyncError = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    context?: {
      function_name?: string;
      user_message?: string;
      on_error?: (error: Error) => void;
    }
  ): Promise<T | null> => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error as Error, {
        function_name: context?.function_name,
        user_message: context?.user_message,
      });
      
      if (context?.on_error) {
        context.on_error(error as Error);
      }
      
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    logError,
  };
};