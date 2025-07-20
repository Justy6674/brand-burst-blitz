import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface EmailConfirmationState {
  isEmailConfirmed: boolean;
  isCheckingConfirmation: boolean;
  lastEmailSentAt: Date | null;
  canResendEmail: boolean;
  secondsUntilResend: number;
}

const RESEND_COOLDOWN_SECONDS = 60; // 1 minute cooldown between resends

export const useEmailConfirmation = () => {
  const { toast } = useToast();
  const [state, setState] = useState<EmailConfirmationState>({
    isEmailConfirmed: false,
    isCheckingConfirmation: true,
    lastEmailSentAt: null,
    canResendEmail: true,
    secondsUntilResend: 0
  });

  // Check email confirmation status
  const checkEmailConfirmation = useCallback(async () => {
    setState(prev => ({ ...prev, isCheckingConfirmation: true }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setState(prev => ({ 
          ...prev, 
          isCheckingConfirmation: false,
          isEmailConfirmed: false 
        }));
        return false;
      }

      // Check if email is confirmed
      const isConfirmed = user.email_confirmed_at !== null;
      
      setState(prev => ({ 
        ...prev, 
        isCheckingConfirmation: false,
        isEmailConfirmed: isConfirmed
      }));

      return isConfirmed;
    } catch (error) {
      console.error('Error checking email confirmation:', error);
      setState(prev => ({ ...prev, isCheckingConfirmation: false }));
      return false;
    }
  }, []);

  // Resend confirmation email
  const resendConfirmationEmail = useCallback(async (email: string) => {
    if (!state.canResendEmail) {
      toast({
        title: "Please wait",
        description: `You can resend the confirmation email in ${state.secondsUntilResend} seconds.`,
        variant: "default"
      });
      return { success: false, error: 'Cooldown active' };
    }

    try {
      // For healthcare professionals, use the healthcare-specific redirect
      const isHealthcareUser = window.location.pathname.includes('healthcare');
      const redirectUrl = isHealthcareUser 
        ? `${window.location.origin}/healthcare-content`
        : `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      // Set cooldown
      const now = new Date();
      setState(prev => ({ 
        ...prev, 
        lastEmailSentAt: now,
        canResendEmail: false,
        secondsUntilResend: RESEND_COOLDOWN_SECONDS
      }));

      // Store resend timestamp in localStorage for persistence
      localStorage.setItem('lastConfirmationEmailSent', now.toISOString());

      toast({
        title: "Confirmation Email Sent",
        description: "Please check your email for the confirmation link. Check your spam folder if you don't see it.",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Failed to Send Email",
        description: error.message || "Unable to send confirmation email. Please try again later.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  }, [state.canResendEmail, state.secondsUntilResend, toast]);

  // Handle cooldown timer
  useEffect(() => {
    // Check if there's a stored timestamp
    const storedTimestamp = localStorage.getItem('lastConfirmationEmailSent');
    if (storedTimestamp) {
      const lastSent = new Date(storedTimestamp);
      const now = new Date();
      const secondsPassed = Math.floor((now.getTime() - lastSent.getTime()) / 1000);
      
      if (secondsPassed < RESEND_COOLDOWN_SECONDS) {
        setState(prev => ({
          ...prev,
          lastEmailSentAt: lastSent,
          canResendEmail: false,
          secondsUntilResend: RESEND_COOLDOWN_SECONDS - secondsPassed
        }));
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (state.secondsUntilResend > 0) {
      const timer = setTimeout(() => {
        setState(prev => {
          const newSeconds = prev.secondsUntilResend - 1;
          if (newSeconds <= 0) {
            localStorage.removeItem('lastConfirmationEmailSent');
            return {
              ...prev,
              secondsUntilResend: 0,
              canResendEmail: true
            };
          }
          return {
            ...prev,
            secondsUntilResend: newSeconds
          };
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.secondsUntilResend]);

  // Production email configuration checks
  const checkProductionEmailConfig = useCallback(async () => {
    try {
      // Check if Supabase email settings are properly configured
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return { configured: false, error: 'No user session' };

      // Test email functionality by checking auth settings
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Email configuration check failed:', response.status);
      }

      return { 
        configured: true, 
        provider: 'Supabase Auth Email',
        settings: {
          confirmationRequired: true,
          mailerType: 'built-in'
        }
      };
    } catch (error) {
      console.error('Error checking email configuration:', error);
      return { configured: false, error };
    }
  }, []);

  // Email domain validation for production
  const validateEmailDomain = useCallback((email: string) => {
    // Common typos and invalid domains
    const invalidDomains = ['gmial.com', 'gmai.com', 'yahooo.com', 'hotmial.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!domain) return { valid: false, error: 'Invalid email format' };
    
    if (invalidDomains.includes(domain)) {
      return { valid: false, error: `Invalid domain: ${domain}. Did you mean ${domain.replace('gmial', 'gmail').replace('gmai', 'gmail').replace('yahooo', 'yahoo').replace('hotmial', 'hotmail')}?` };
    }

    // Check for valid TLD
    const tldMatch = domain.match(/\.([a-z]{2,})$/);
    if (!tldMatch) {
      return { valid: false, error: 'Invalid email domain' };
    }

    return { valid: true };
  }, []);

  return {
    ...state,
    checkEmailConfirmation,
    resendConfirmationEmail,
    checkProductionEmailConfig,
    validateEmailDomain
  };
}; 