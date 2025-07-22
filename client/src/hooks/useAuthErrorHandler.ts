import { useCallback } from 'react';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthErrorOptions {
  showToast?: boolean;
  logError?: boolean;
  redirectTo?: string;
  customMessage?: string;
}

// Common Supabase auth error codes and their user-friendly messages
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Sign up errors
  'User already registered': 'An account with this email already exists. Please sign in instead.',
  'Invalid email': 'Please enter a valid email address.',
  'Signup requires a valid password': 'Please enter a valid password.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
  'Password should be at least 8 characters': 'Password must be at least 8 characters long for healthcare accounts.',
  
  // Sign in errors
  'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
  'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
  'Invalid user credentials': 'Invalid email or password. Please try again.',
  'User not found': 'No account found with this email address.',
  
  // Password reset errors
  'Password reset email rate limit exceeded': 'Too many password reset attempts. Please wait a few minutes and try again.',
  
  // Email confirmation errors
  'Email link is invalid or has expired': 'This confirmation link has expired. Please request a new one.',
  'Token has expired or is invalid': 'This link has expired. Please request a new confirmation email.',
  
  // OAuth errors
  'OAuth error': 'Failed to connect with social media provider. Please try again.',
  'OAuth state mismatch': 'Authentication state mismatch. Please try signing in again.',
  
  // Network errors
  'Failed to fetch': 'Network error. Please check your internet connection and try again.',
  'NetworkError': 'Unable to connect. Please check your internet connection.',
  
  // Session errors
  'Invalid refresh token': 'Your session has expired. Please sign in again.',
  'Refresh token not found': 'Session expired. Please sign in again.',
  'User session not found': 'No active session. Please sign in.',
  
  // Healthcare-specific errors
  'AHPRA registration required': 'Valid AHPRA registration is required for healthcare professionals.',
  'Healthcare profile not found': 'Healthcare professional profile not found. Please contact support.',
  'Compliance training required': 'Please complete AHPRA compliance training to access this feature.',
  
  // Rate limiting
  'Email rate limit exceeded': 'Too many attempts. Please wait a few minutes before trying again.',
  'Too many requests': 'Too many attempts. Please try again later.',
  
  // Generic fallback
  'An unexpected error occurred': 'Something went wrong. Please try again or contact support if the problem persists.'
};

export const useAuthErrorHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuthError = useCallback((
    error: any,
    operation: 'signin' | 'signup' | 'reset' | 'confirm' | 'oauth' | 'general' = 'general',
    options: AuthErrorOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      redirectTo,
      customMessage
    } = options;

    // Log error for debugging
    if (logError) {
      console.error(`Auth error during ${operation}:`, error);
    }

    // Extract error message
    let errorMessage = customMessage || 'An unexpected error occurred.';
    
    if (error?.message) {
      // Check for known error patterns
      const knownError = Object.entries(AUTH_ERROR_MESSAGES).find(([pattern]) => 
        error.message.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (knownError) {
        errorMessage = knownError[1];
      } else {
        // Use the original error message if it's informative
        errorMessage = error.message;
      }
    }

    // Special handling for specific error types
    if (error?.status === 400) {
      if (operation === 'signin') {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      }
    } else if (error?.status === 422) {
      errorMessage = 'Invalid input. Please check your information and try again.';
    } else if (error?.status === 429) {
      errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
    } else if (error?.status === 500) {
      errorMessage = 'Server error. Please try again later or contact support.';
    }

    // Handle network errors
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
      errorMessage = 'Connection error. Please check your internet and try again.';
    }

    // Show toast notification
    if (showToast) {
      toast({
        title: getErrorTitle(operation),
        description: errorMessage,
        variant: "destructive",
      });
    }

    // Handle redirects
    if (redirectTo) {
      navigate(redirectTo);
    }

    // Return structured error for component handling
    return {
      message: errorMessage,
      code: error?.code || 'UNKNOWN_ERROR',
      status: error?.status,
      originalError: error
    };
  }, [toast, navigate]);

  // Helper function to get appropriate error title
  const getErrorTitle = (operation: string): string => {
    switch (operation) {
      case 'signin':
        return 'Sign In Failed';
      case 'signup':
        return 'Registration Failed';
      case 'reset':
        return 'Password Reset Failed';
      case 'confirm':
        return 'Email Confirmation Failed';
      case 'oauth':
        return 'Social Login Failed';
      default:
        return 'Authentication Error';
    }
  };

  // Specific error handlers for common scenarios
  const handleSignInError = useCallback((error: any, options?: AuthErrorOptions) => {
    return handleAuthError(error, 'signin', options);
  }, [handleAuthError]);

  const handleSignUpError = useCallback((error: any, options?: AuthErrorOptions) => {
    return handleAuthError(error, 'signup', options);
  }, [handleAuthError]);

  const handlePasswordResetError = useCallback((error: any, options?: AuthErrorOptions) => {
    return handleAuthError(error, 'reset', options);
  }, [handleAuthError]);

  const handleEmailConfirmationError = useCallback((error: any, options?: AuthErrorOptions) => {
    return handleAuthError(error, 'confirm', options);
  }, [handleAuthError]);

  const handleOAuthError = useCallback((error: any, options?: AuthErrorOptions) => {
    return handleAuthError(error, 'oauth', options);
  }, [handleAuthError]);

  // Session error handler with auto-redirect
  const handleSessionError = useCallback((error: any) => {
    handleAuthError(error, 'general', {
      showToast: true,
      redirectTo: '/auth',
      customMessage: 'Your session has expired. Please sign in again.'
    });
  }, [handleAuthError]);

  return {
    handleAuthError,
    handleSignInError,
    handleSignUpError,
    handlePasswordResetError,
    handleEmailConfirmationError,
    handleOAuthError,
    handleSessionError
  };
}; 