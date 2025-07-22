import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface SessionTimeoutConfig {
  warningTime: number; // minutes before showing warning
  timeoutTime: number; // minutes until automatic logout
  checkInterval: number; // seconds between activity checks
  enableForHealthcare: boolean;
  enableForSensitiveData: boolean;
}

interface SessionState {
  isActive: boolean;
  showWarning: boolean;
  timeRemaining: number; // seconds
  lastActivity: Date;
  isTimedOut: boolean;
}

const DEFAULT_HEALTHCARE_CONFIG: SessionTimeoutConfig = {
  warningTime: 10, // 10 minutes warning
  timeoutTime: 15, // 15 minutes total
  checkInterval: 30, // check every 30 seconds
  enableForHealthcare: true,
  enableForSensitiveData: true
};

const DEFAULT_STANDARD_CONFIG: SessionTimeoutConfig = {
  warningTime: 25, // 25 minutes warning
  timeoutTime: 30, // 30 minutes total
  checkInterval: 60, // check every minute
  enableForHealthcare: false,
  enableForSensitiveData: false
};

export const useSessionTimeout = (customConfig?: Partial<SessionTimeoutConfig>) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Determine if user is healthcare professional
  const [isHealthcareProfessional, setIsHealthcareProfessional] = useState(false);
  
  // Merge configuration based on user type
  const getConfig = useCallback((): SessionTimeoutConfig => {
    const baseConfig = isHealthcareProfessional ? DEFAULT_HEALTHCARE_CONFIG : DEFAULT_STANDARD_CONFIG;
    return { ...baseConfig, ...customConfig };
  }, [isHealthcareProfessional, customConfig]);

  const config = getConfig();
  
  const [state, setState] = useState<SessionState>({
    isActive: true,
    showWarning: false,
    timeRemaining: config.timeoutTime * 60,
    lastActivity: new Date(),
    isTimedOut: false
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const checkIntervalRef = useRef<NodeJS.Timeout>();
  const extendSessionRef = useRef<NodeJS.Timeout>();

  // Check if current user is healthcare professional
  useEffect(() => {
    const checkUserType = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if user exists in healthcare_professionals table
          const { data } = await supabase
            .from('healthcare_professionals')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          setIsHealthcareProfessional(!!data);
        }
      } catch (error) {
        console.error('Error checking user type:', error);
      }
    };

    checkUserType();
  }, []);

  // Activity tracking
  const updateActivity = useCallback(() => {
    const now = new Date();
    setState(prev => ({
      ...prev,
      lastActivity: now,
      showWarning: false,
      isTimedOut: false,
      timeRemaining: config.timeoutTime * 60
    }));

    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, showWarning: true }));
      
      if (isHealthcareProfessional) {
        toast({
          title: "Session Timeout Warning",
          description: `Your session will expire in ${config.timeoutTime - config.warningTime} minutes due to healthcare data protection requirements.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Session Timeout Warning",
          description: `Your session will expire in ${config.timeoutTime - config.warningTime} minutes. Click anywhere to stay logged in.`,
          variant: "default",
        });
      }
    }, config.warningTime * 60 * 1000);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, config.timeoutTime * 60 * 1000);

  }, [config, isHealthcareProfessional, toast]);

  // Handle session timeout
  const handleTimeout = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isTimedOut: true,
      isActive: false,
      showWarning: false
    }));

    try {
      // Log session timeout for audit trail
      if (isHealthcareProfessional) {
        await supabase
          .from('healthcare_team_audit_log')
          .insert({
            team_id: null, // Will be null for session timeouts
            performed_by: null,
            action: 'Session timeout - automatic logout for healthcare data protection',
            action_type: 'compliance',
            details: {
              timeout_duration_minutes: config.timeoutTime,
              last_activity: state.lastActivity.toISOString(),
              user_agent: navigator.userAgent
            },
            compliance_impact: true
          });
      }

      // Sign out user
      await supabase.auth.signOut();

      toast({
        title: "Session Expired",
        description: isHealthcareProfessional 
          ? "Your session has expired for patient data protection. Please sign in again."
          : "Your session has expired due to inactivity. Please sign in again.",
        variant: "destructive",
      });

      // Redirect to login
      navigate('/auth');
      
    } catch (error) {
      console.error('Error during session timeout:', error);
      // Force redirect even if logout fails
      navigate('/auth');
    }
  }, [config, isHealthcareProfessional, navigate, state.lastActivity, toast]);

  // Extend session manually
  const extendSession = useCallback(() => {
    updateActivity();
    
    if (isHealthcareProfessional) {
      toast({
        title: "Session Extended",
        description: "Your healthcare session has been extended for continued patient data access.",
      });
    } else {
      toast({
        title: "Session Extended",
        description: "Your session has been extended.",
      });
    }
  }, [updateActivity, isHealthcareProfessional, toast]);

  // Activity listeners
  useEffect(() => {
    if (!config.enableForHealthcare && !isHealthcareProfessional) return;
    if (!config.enableForSensitiveData && isHealthcareProfessional) return;

    const activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const throttledUpdateActivity = (() => {
      let lastCall = 0;
      return () => {
        const now = Date.now();
        if (now - lastCall >= 5000) { // Throttle to every 5 seconds
          lastCall = now;
          updateActivity();
        }
      };
    })();

    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledUpdateActivity, true);
    });

    // Start activity monitoring
    updateActivity();

    // Cleanup function
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledUpdateActivity, true);
      });
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (checkIntervalRef.current) clearTimeout(checkIntervalRef.current);
    };
  }, [config, updateActivity, isHealthcareProfessional]);

  // Countdown timer for warning display
  useEffect(() => {
    if (!state.showWarning) return;

    const startTime = Date.now();
    const warningDuration = (config.timeoutTime - config.warningTime) * 60 * 1000;

    checkIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.floor((warningDuration - elapsed) / 1000));
      
      setState(prev => ({
        ...prev,
        timeRemaining: remaining
      }));

      if (remaining <= 0) {
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      }
    }, 1000);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [state.showWarning, config]);

  // Get session status for display
  const getSessionStatus = useCallback(() => {
    if (state.isTimedOut) return 'expired';
    if (state.showWarning) return 'warning';
    if (state.isActive) return 'active';
    return 'inactive';
  }, [state]);

  // Get time until timeout in human readable format
  const getTimeUntilTimeout = useCallback(() => {
    const now = new Date();
    const timeSinceActivity = (now.getTime() - state.lastActivity.getTime()) / 1000;
    const timeRemaining = Math.max(0, (config.timeoutTime * 60) - timeSinceActivity);
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = Math.floor(timeRemaining % 60);
    
    return { minutes, seconds, totalSeconds: timeRemaining };
  }, [state.lastActivity, config.timeoutTime]);

  // Force logout (for manual logout)
  const forceLogout = useCallback(async () => {
    await handleTimeout();
  }, [handleTimeout]);

  return {
    // State
    isActive: state.isActive,
    showWarning: state.showWarning,
    isTimedOut: state.isTimedOut,
    timeRemaining: state.timeRemaining,
    lastActivity: state.lastActivity,
    
    // Configuration
    config,
    isHealthcareProfessional,
    
    // Actions
    extendSession,
    forceLogout,
    updateActivity,
    
    // Utils
    getSessionStatus,
    getTimeUntilTimeout
  };
}; 