import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { useToastManager } from '@/hooks/useToastManager';
import { useRouter } from 'next/router';

interface UserAction {
  type: string;
  timestamp: number;
  data?: any;
  element?: string;
  route?: string;
}

interface AutoToastContextType {
  trackAction: (action: UserAction) => void;
  enableAutoNotifications: boolean;
  setEnableAutoNotifications: (enabled: boolean) => void;
}

const AutoToastContext = createContext<AutoToastContextType | undefined>(undefined);

interface AutoToastProviderProps {
  children: React.ReactNode;
  enableByDefault?: boolean;
  healthcareMode?: boolean;
}

// Action patterns that should trigger notifications
const ACTION_PATTERNS = {
  // Form submissions
  formSubmit: {
    pattern: /submit|save|create|update|delete/i,
    category: 'data',
    templates: {
      submit: 'data.saved',
      save: 'data.saved',
      create: 'content.created',
      update: 'data.saved',
      delete: 'success.operation'
    }
  },

  // Authentication actions
  auth: {
    pattern: /login|logout|signin|signout|register/i,
    category: 'auth',
    templates: {
      login: 'auth.login.success',
      signin: 'auth.login.success',
      logout: 'auth.logout.success',
      signout: 'auth.logout.success',
      register: 'auth.login.success'
    }
  },

  // Healthcare specific actions
  healthcare: {
    pattern: /patient|appointment|medical|health|treatment|diagnosis/i,
    category: 'healthcare',
    templates: {
      patient: 'healthcare.patient.created',
      appointment: 'healthcare.appointment.scheduled',
      medical: 'healthcare.data.backup',
      health: 'healthcare.data.backup',
      treatment: 'healthcare.patient.updated',
      diagnosis: 'healthcare.patient.updated'
    }
  },

  // Compliance actions
  compliance: {
    pattern: /compliance|audit|ahpra|tga|regulation|review/i,
    category: 'compliance',
    templates: {
      compliance: 'compliance.audit.complete',
      audit: 'compliance.audit.complete',
      ahpra: 'compliance.ahpra.validated',
      tga: 'compliance.tga.approved',
      regulation: 'compliance.audit.complete',
      review: 'compliance.audit.complete'
    }
  },

  // Content management
  content: {
    pattern: /publish|schedule|draft|content|post|media/i,
    category: 'general',
    templates: {
      publish: 'content.published',
      schedule: 'content.scheduled',
      draft: 'content.saved',
      content: 'content.created',
      post: 'content.published',
      media: 'media.uploaded'
    }
  },

  // Data operations
  data: {
    pattern: /export|import|sync|backup|restore/i,
    category: 'data',
    templates: {
      export: 'data.export.complete',
      import: 'data.import.success',
      sync: 'data.sync.complete',
      backup: 'healthcare.data.backup',
      restore: 'data.sync.complete'
    }
  }
};

// Route-based action detection
const ROUTE_ACTIONS = {
  '/dashboard': { action: 'navigation', message: 'Dashboard loaded', show: false },
  '/auth': { action: 'auth.navigation', message: 'Authentication page', show: false },
  '/patients': { action: 'healthcare.navigation', message: 'Patient records accessed', show: true },
  '/appointments': { action: 'healthcare.navigation', message: 'Appointment system accessed', show: true },
  '/compliance': { action: 'compliance.navigation', message: 'Compliance dashboard accessed', show: true },
  '/content': { action: 'content.navigation', message: 'Content management accessed', show: false },
  '/settings': { action: 'settings.navigation', message: 'Settings updated', show: false }
};

export const AutoToastProvider: React.FC<AutoToastProviderProps> = ({
  children,
  enableByDefault = true,
  healthcareMode = true
}) => {
  const {
    showToast,
    showSuccess,
    showHealthcareSuccess,
    showComplianceResult,
    showContentUpdate,
    showDataOperation
  } = useToastManager();

  const [enableAutoNotifications, setEnableAutoNotifications] = React.useState(enableByDefault);
  const actionHistory = useRef<UserAction[]>([]);
  const lastActionTime = useRef<number>(0);
  const router = useRouter();

  // Track user action and potentially show toast
  const trackAction = useCallback((action: UserAction) => {
    if (!enableAutoNotifications) return;

    // Prevent spam - ignore actions within 500ms of each other
    const now = Date.now();
    if (now - lastActionTime.current < 500) return;
    lastActionTime.current = now;

    // Add to history
    actionHistory.current.push(action);
    
    // Keep only last 100 actions
    if (actionHistory.current.length > 100) {
      actionHistory.current = actionHistory.current.slice(-100);
    }

    // Analyze action and show appropriate toast
    analyzeAndNotify(action);
  }, [enableAutoNotifications]);

  const analyzeAndNotify = useCallback((action: UserAction) => {
    const { type, data, element } = action;
    
    // Check against action patterns
    for (const [patternName, config] of Object.entries(ACTION_PATTERNS)) {
      if (config.pattern.test(type) || config.pattern.test(element || '')) {
        const matchedAction = extractActionFromText(type, config.pattern);
        const templateKey = config.templates[matchedAction as keyof typeof config.templates];
        
        if (templateKey) {
          // Healthcare-specific handling
          if (healthcareMode && config.category === 'healthcare') {
            showHealthcareSuccess(matchedAction, data?.message);
          } else if (healthcareMode && config.category === 'compliance') {
            showComplianceResult('ahpra', 'approved', data?.message);
          } else if (config.category === 'general' && templateKey.startsWith('content')) {
            showContentUpdate(matchedAction as any, data?.message);
          } else if (config.category === 'data') {
            showDataOperation(matchedAction as any, data?.message);
          } else {
            showToast(templateKey, {
              description: data?.message || generateContextualMessage(action)
            });
          }
          return;
        }
      }
    }

    // Fallback for unrecognized actions
    if (shouldShowFallbackNotification(action)) {
      showSuccess(
        formatActionTitle(type),
        generateContextualMessage(action)
      );
    }
  }, [healthcareMode, showToast, showSuccess, showHealthcareSuccess, showComplianceResult, showContentUpdate, showDataOperation]);

  const extractActionFromText = (text: string, pattern: RegExp): string => {
    const match = text.toLowerCase().match(pattern);
    return match ? match[0] : 'operation';
  };

  const formatActionTitle = (actionType: string): string => {
    return actionType
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const generateContextualMessage = (action: UserAction): string => {
    const { type, data, route } = action;
    
    if (data?.message) return data.message;
    
    if (route?.includes('patient')) return 'Patient information updated successfully';
    if (route?.includes('appointment')) return 'Appointment changes saved';
    if (route?.includes('compliance')) return 'Compliance check completed';
    if (route?.includes('content')) return 'Content operation completed';
    
    if (type.includes('save')) return 'Changes saved successfully';
    if (type.includes('create')) return 'Item created successfully';
    if (type.includes('update')) return 'Information updated successfully';
    if (type.includes('delete')) return 'Item removed successfully';
    
    return 'Operation completed successfully';
  };

  const shouldShowFallbackNotification = (action: UserAction): boolean => {
    const { type, element } = action;
    
    // Show for buttons with action-like text
    if (element?.includes('button') && /save|submit|create|update|delete|send/i.test(type)) {
      return true;
    }
    
    // Show for form submissions
    if (type.includes('submit') || type.includes('form')) {
      return true;
    }
    
    // Don't show for navigation or minor actions
    if (/click|hover|focus|blur|scroll/i.test(type)) {
      return false;
    }
    
    return false;
  };

  // Auto-detect route changes
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const routeConfig = ROUTE_ACTIONS[url as keyof typeof ROUTE_ACTIONS];
      
      if (routeConfig && routeConfig.show && enableAutoNotifications) {
        trackAction({
          type: routeConfig.action,
          timestamp: Date.now(),
          route: url,
          data: { message: routeConfig.message }
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events, trackAction, enableAutoNotifications]);

  // Auto-detect form submissions
  useEffect(() => {
    if (!enableAutoNotifications) return;

    const handleFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      const action = form.action || 'form-submit';
      
      trackAction({
        type: 'form-submit',
        timestamp: Date.now(),
        element: 'form',
        data: {
          action,
          fields: formData.keys ? Array.from(formData.keys()).length : 0
        }
      });
    };

    const handleButtonClick = (event: Event) => {
      const button = event.target as HTMLButtonElement;
      const buttonText = button.textContent?.toLowerCase() || '';
      const buttonType = button.type || 'button';
      
      // Only track action buttons, not navigation
      if (/save|submit|create|update|delete|send|publish|schedule/i.test(buttonText)) {
        trackAction({
          type: buttonText,
          timestamp: Date.now(),
          element: 'button',
          data: {
            buttonType,
            buttonText
          }
        });
      }
    };

    // Add event listeners
    document.addEventListener('submit', handleFormSubmit);
    document.addEventListener('click', handleButtonClick);

    return () => {
      document.removeEventListener('submit', handleFormSubmit);
      document.removeEventListener('click', handleButtonClick);
    };
  }, [enableAutoNotifications, trackAction]);

  const contextValue: AutoToastContextType = {
    trackAction,
    enableAutoNotifications,
    setEnableAutoNotifications
  };

  return (
    <AutoToastContext.Provider value={contextValue}>
      {children}
    </AutoToastContext.Provider>
  );
};

export const useAutoToast = () => {
  const context = useContext(AutoToastContext);
  if (!context) {
    throw new Error('useAutoToast must be used within an AutoToastProvider');
  }
  return context;
};

// Manual action tracking hook for custom implementations
export const useActionTracker = () => {
  const { trackAction } = useAutoToast();

  const trackHealthcareAction = useCallback((action: string, details?: any) => {
    trackAction({
      type: `healthcare-${action}`,
      timestamp: Date.now(),
      data: details
    });
  }, [trackAction]);

  const trackComplianceAction = useCallback((action: string, details?: any) => {
    trackAction({
      type: `compliance-${action}`,
      timestamp: Date.now(),
      data: details
    });
  }, [trackAction]);

  const trackContentAction = useCallback((action: string, details?: any) => {
    trackAction({
      type: `content-${action}`,
      timestamp: Date.now(),
      data: details
    });
  }, [trackAction]);

  const trackDataAction = useCallback((action: string, details?: any) => {
    trackAction({
      type: `data-${action}`,
      timestamp: Date.now(),
      data: details
    });
  }, [trackAction]);

  return {
    trackAction,
    trackHealthcareAction,
    trackComplianceAction,
    trackContentAction,
    trackDataAction
  };
}; 