import { useCallback } from 'react';
import { useToast } from './use-toast';
import { useUserFriendlyErrors, ErrorContext } from '@/components/error/UserFriendlyErrorMessages';
import { supabase } from '@/integrations/supabase/client';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  context?: string;
  userAction?: string;
  fallbackMessage?: string;
  onError?: (error: ErrorContext) => void;
}

interface ErrorToastConfig {
  title: string;
  description: string;
  variant: 'default' | 'destructive';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useErrorHandler = () => {
  const { toast } = useToast();
  const { getErrorFromResponse, createError } = useUserFriendlyErrors();

  const handleError = useCallback(async (
    error: any,
    options: ErrorHandlerOptions = {}
  ): Promise<ErrorContext> => {
    const {
      showToast = true,
      logError = true,
      context,
      userAction,
      fallbackMessage = 'An unexpected error occurred',
      onError
    } = options;

    // Convert error to user-friendly format
    const errorContext = getErrorFromResponse(error);
    
    // Add additional context if provided
    if (context) errorContext.context = context;
    if (userAction) errorContext.userAction = userAction;

    // Log error for debugging and monitoring
    if (logError) {
      console.error('Error handled:', {
        errorContext,
        originalError: error,
        timestamp: new Date().toISOString()
      });

      // Log critical errors (in real app this would go to error tracking service)
      if (errorContext.severity === 'critical' || errorContext.category === 'compliance') {
        console.warn('Critical Error Logged:', {
          error_id: `HANDLED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          error_message: errorContext.message,
          error_category: errorContext.category,
          user_impact: errorContext.severity,
          compliance_impact: errorContext.category === 'compliance'
        });
      }
    }

    // Show toast notification
    if (showToast) {
      const toastConfig = getToastConfig(errorContext);
      toast({
        title: toastConfig.title,
        description: toastConfig.description,
        variant: toastConfig.variant,
        duration: toastConfig.duration,
        // action: toastConfig.action
      });
    }

    // Call custom error handler if provided
    if (onError) {
      onError(errorContext);
    }

    return errorContext;
  }, [toast, getErrorFromResponse]);

  const getToastConfig = (error: ErrorContext): ErrorToastConfig => {
    switch (error.code) {
      case 'NETWORK_TIMEOUT':
        return {
          title: 'Connection Timeout',
          description: 'Please check your internet connection and try again.',
          variant: 'destructive',
          duration: 5000,
          action: {
            label: 'Retry',
            onClick: () => window.location.reload()
          }
        };

      case 'NETWORK_OFFLINE':
        return {
          title: 'No Internet Connection',
          description: 'You appear to be offline. Please check your connection.',
          variant: 'destructive',
          duration: 8000
        };

      case 'AUTH_SESSION_EXPIRED':
        return {
          title: 'Session Expired',
          description: 'Please log in again to continue.',
          variant: 'destructive',
          duration: 6000,
          action: {
            label: 'Log In',
            onClick: () => window.location.href = '/auth'
          }
        };

      case 'AUTH_INVALID_CREDENTIALS':
        return {
          title: 'Login Failed',
          description: 'Please check your email and password.',
          variant: 'destructive',
          duration: 5000
        };

      case 'AHPRA_COMPLIANCE_VIOLATION':
        return {
          title: 'AHPRA Compliance Issue',
          description: 'Content blocked to protect your professional registration.',
          variant: 'destructive',
          duration: 10000,
          action: {
            label: 'Review',
            onClick: () => window.open('https://help.jbsaas.com.au/ahpra-compliance', '_blank')
          }
        };

      case 'TGA_DEVICE_COMPLIANCE':
        return {
          title: 'TGA Compliance Required',
          description: 'Medical device content requires review.',
          variant: 'destructive',
          duration: 8000,
          action: {
            label: 'Learn More',
            onClick: () => window.open('https://help.jbsaas.com.au/tga-compliance', '_blank')
          }
        };

      case 'CULTURAL_SAFETY_CONCERN':
        return {
          title: 'Cultural Consultation Required',
          description: 'Indigenous health content needs cultural review.',
          variant: 'destructive',
          duration: 8000,
          action: {
            label: 'Request Review',
            onClick: () => window.location.href = '/dashboard/cultural-consultation'
          }
        };

      case 'PERMISSION_DENIED':
        return {
          title: 'Access Denied',
          description: 'You don\'t have permission for this action.',
          variant: 'destructive',
          duration: 5000
        };

      case 'SUBSCRIPTION_REQUIRED':
        return {
          title: 'Subscription Required',
          description: 'This feature requires an active subscription.',
          variant: 'default',
          duration: 6000,
          action: {
            label: 'Upgrade',
            onClick: () => window.location.href = '/pricing'
          }
        };

      case 'VALIDATION_REQUIRED_FIELD':
        return {
          title: 'Required Fields Missing',
          description: 'Please fill in all required information.',
          variant: 'destructive',
          duration: 4000
        };

      case 'DATA_SAVE_FAILED':
        return {
          title: 'Save Failed',
          description: 'Could not save your changes. Please try again.',
          variant: 'destructive',
          duration: 6000,
          action: {
            label: 'Retry',
            onClick: () => window.location.reload()
          }
        };

      case 'RATE_LIMIT_EXCEEDED':
        return {
          title: 'Too Many Requests',
          description: 'Please wait a moment before trying again.',
          variant: 'default',
          duration: 4000
        };

      case 'SYSTEM_MAINTENANCE':
        return {
          title: 'System Maintenance',
          description: 'Service temporarily unavailable.',
          variant: 'default',
          duration: 8000,
          action: {
            label: 'Status',
            onClick: () => window.open('https://status.jbsaas.com.au', '_blank')
          }
        };

      default:
        return {
          title: 'Error',
          description: error.message || 'An unexpected error occurred.',
          variant: error.severity === 'critical' ? 'destructive' : 'default',
          duration: 5000
        };
    }
  };

  // Specific error handlers for common scenarios
  const handleNetworkError = useCallback((error: any, context?: string) => {
    return handleError(error, {
      context: context || 'Network operation',
      userAction: 'Network request'
    });
  }, [handleError]);

  const handleAuthError = useCallback((error: any, context?: string) => {
    return handleError(error, {
      context: context || 'Authentication',
      userAction: 'Login/authentication attempt'
    });
  }, [handleError]);

  const handleComplianceError = useCallback((error: any, context?: string) => {
    return handleError(error, {
      context: context || 'Compliance validation',
      userAction: 'Content compliance check',
      showToast: true,
      logError: true
    });
  }, [handleError]);

  const handleValidationError = useCallback((error: any, context?: string) => {
    return handleError(error, {
      context: context || 'Form validation',
      userAction: 'Form submission',
      logError: true
    });
  }, [handleError]);

  const handleDataError = useCallback((error: any, context?: string) => {
    return handleError(error, {
      context: context || 'Data operation',
      userAction: 'Data save/load',
      logError: true
    });
  }, [handleError]);

  // Quick error creators for common scenarios
  const createNetworkError = useCallback((message: string) => {
    return createError('NETWORK_TIMEOUT', message, 'network', 'medium');
  }, [createError]);

  const createAuthError = useCallback((message: string) => {
    return createError('AUTH_SESSION_EXPIRED', message, 'auth', 'high');
  }, [createError]);

  const createComplianceError = useCallback((message: string) => {
    return createError('AHPRA_COMPLIANCE_VIOLATION', message, 'compliance', 'critical');
  }, [createError]);

  const createValidationError = useCallback((message: string) => {
    return createError('VALIDATION_REQUIRED_FIELD', message, 'validation', 'low');
  }, [createError]);

  // Error reporting for manual error reporting (simplified)
  const reportError = useCallback(async (
    error: ErrorContext,
    additionalContext?: Record<string, any>
  ) => {
    try {
      // For now, just log the error locally
      console.warn('Manual Error Report:', {
        error_id: `MANUAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        error_message: error.message,
        error_category: error.category,
        user_impact: error.severity,
        compliance_impact: error.category === 'compliance',
        additional_context: additionalContext
      });

      toast({
        title: 'Error Reported',
        description: 'Thank you for helping us improve our system.',
        variant: 'default',
        duration: 3000
      });

    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
      toast({
        title: 'Report Failed',
        description: 'Could not submit error report.',
        variant: 'destructive',
        duration: 3000
      });
    }
  }, [toast]);

  return {
    // Main error handler
    handleError,
    
    // Specific handlers
    handleNetworkError,
    handleAuthError,
    handleComplianceError,
    handleValidationError,
    handleDataError,
    
    // Error creators
    createNetworkError,
    createAuthError,
    createComplianceError,
    createValidationError,
    
    // Utilities
    reportError,
    getToastConfig
  };
};