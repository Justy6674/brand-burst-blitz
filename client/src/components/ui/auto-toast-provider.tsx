import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { useToastManager } from '@/hooks/useToastManager';
import { useLocation } from 'react-router-dom';

interface UserAction {
  type: string;
  timestamp: number;
  data?: any;
  element?: string;
  route?: string;
}

interface ToastConfig {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  persistent?: boolean;
  showCloseButton?: boolean;
  actionable?: boolean;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  priority?: 'low' | 'medium' | 'high';
}

interface AutoToastContextType {
  trackAction: (action: UserAction) => void;
  showToast: (config: ToastConfig) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  getActiveToasts: () => ToastConfig[];
  updateToastSettings: (settings: Partial<AutoToastSettings>) => void;
}

interface AutoToastSettings {
  enableAutoNotifications: boolean;
  enableSuccessNotifications: boolean;
  enableErrorNotifications: boolean;
  enableWarningNotifications: boolean;
  enableInfoNotifications: boolean;
  defaultDuration: number;
  defaultPosition: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  enableSounds: boolean;
  enableAnimation: boolean;
  stackToasts: boolean;
  maxToasts: number;
  enableDarkMode: boolean;
  enablePersistentToasts: boolean;
}

const DEFAULT_SETTINGS: AutoToastSettings = {
  enableAutoNotifications: true,
  enableSuccessNotifications: true,
  enableErrorNotifications: true,
  enableWarningNotifications: true,
  enableInfoNotifications: true,
  defaultDuration: 5000,
  defaultPosition: 'top-right',
  enableSounds: false,
  enableAnimation: true,
  stackToasts: true,
  maxToasts: 5,
  enableDarkMode: false,
  enablePersistentToasts: false
};

const AutoToastContext = createContext<AutoToastContextType | undefined>(undefined);

export const useAutoToast = () => {
  const context = useContext(AutoToastContext);
  if (context === undefined) {
    throw new Error('useAutoToast must be used within an AutoToastProvider');
  }
  return context;
};

interface AutoToastProviderProps {
  children: React.ReactNode;
  settings?: Partial<AutoToastSettings>;
}

export const AutoToastProvider: React.FC<AutoToastProviderProps> = ({ 
  children, 
  settings: initialSettings = {} 
}) => {
  const [settings, setSettings] = React.useState<AutoToastSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings
  });
  
  const [isEnabled, setIsEnabled] = React.useState(settings.enableAutoNotifications);
  const [activeToasts, setActiveToasts] = React.useState<ToastConfig[]>([]);
  
  const actionQueue = useRef<UserAction[]>([]);
  const toastTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const { addToast, removeToast } = useToastManager();
  
  const location = useLocation();

  const generateToastId = useCallback(() => {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const trackAction = useCallback((action: UserAction) => {
    if (!isEnabled) return;

    const enhancedAction = {
      ...action,
      timestamp: Date.now(),
      route: location.pathname
    };

    actionQueue.current.push(enhancedAction);

    // Keep only last 100 actions
    if (actionQueue.current.length > 100) {
      actionQueue.current = actionQueue.current.slice(-100);
    }

    // Auto-trigger contextual toasts based on actions
    handleContextualToasts(enhancedAction);
  }, [isEnabled, location.pathname]);

  const handleContextualToasts = useCallback((action: UserAction) => {
    if (!settings.enableAutoNotifications) return;

    // Form submission success
    if (action.type === 'form_submit' && action.data?.success) {
      showToast({
        id: generateToastId(),
        message: action.data.message || 'Form submitted successfully!',
        type: 'success',
        duration: settings.defaultDuration
      });
    }

    // API errors
    if (action.type === 'api_error') {
      showToast({
        id: generateToastId(),
        message: action.data?.message || 'Something went wrong. Please try again.',
        type: 'error',
        duration: settings.defaultDuration * 1.5
      });
    }

    // File upload progress
    if (action.type === 'file_upload_complete') {
      showToast({
        id: generateToastId(),
        message: `File "${action.data?.filename}" uploaded successfully!`,
        type: 'success',
        duration: settings.defaultDuration
      });
    }

    // Authentication events
    if (action.type === 'auth_success') {
      showToast({
        id: generateToastId(),
        message: 'Welcome back! You\'re now signed in.',
        type: 'success',
        duration: settings.defaultDuration
      });
    }

    // Data save events
    if (action.type === 'data_saved') {
      showToast({
        id: generateToastId(),
        message: action.data?.message || 'Changes saved successfully!',
        type: 'success',
        duration: 3000
      });
    }

    // Warning events
    if (action.type === 'validation_warning') {
      showToast({
        id: generateToastId(),
        message: action.data?.message || 'Please check your input.',
        type: 'warning',
        duration: settings.defaultDuration
      });
    }

    // Network connectivity
    if (action.type === 'network_offline') {
      showToast({
        id: 'network_offline',
        message: 'You\'re offline. Some features may not work.',
        type: 'warning',
        persistent: true,
        showCloseButton: true
      });
    }

    if (action.type === 'network_online') {
      hideToast('network_offline');
      showToast({
        id: generateToastId(),
        message: 'Connection restored!',
        type: 'success',
        duration: 3000
      });
    }
  }, [settings, generateToastId]);

  const showToast = useCallback((config: ToastConfig) => {
    if (!isEnabled) return;

    // Check if we should show this type of toast
    const shouldShow = (
      (config.type === 'success' && settings.enableSuccessNotifications) ||
      (config.type === 'error' && settings.enableErrorNotifications) ||
      (config.type === 'warning' && settings.enableWarningNotifications) ||
      (config.type === 'info' && settings.enableInfoNotifications)
    );

    if (!shouldShow) return;

    // Remove oldest toast if we've hit the max
    if (settings.stackToasts && activeToasts.length >= settings.maxToasts) {
      const oldestToast = activeToasts[0];
      hideToast(oldestToast.id);
    }

    const toastWithDefaults = {
      ...config,
      duration: config.duration || settings.defaultDuration,
      position: config.position || settings.defaultPosition
    };

    setActiveToasts(prev => [...prev, toastWithDefaults]);

    // Use the toast manager hook
    addToast({
      id: config.id,
      title: config.message,
      variant: config.type === 'error' ? 'destructive' : 'default',
      duration: toastWithDefaults.duration
    });

    // Auto-hide non-persistent toasts
    if (!config.persistent && toastWithDefaults.duration) {
      const timeout = setTimeout(() => {
        hideToast(config.id);
      }, toastWithDefaults.duration);
      
      toastTimeouts.current.set(config.id, timeout);
    }
  }, [isEnabled, settings, activeToasts, addToast]);

  const hideToast = useCallback((id: string) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== id));
    
    // Clear timeout if exists
    const timeout = toastTimeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      toastTimeouts.current.delete(id);
    }

    // Remove from toast manager
    removeToast(id);
  }, [removeToast]);

  const clearAllToasts = useCallback(() => {
    // Clear all timeouts
    toastTimeouts.current.forEach(timeout => clearTimeout(timeout));
    toastTimeouts.current.clear();
    
    // Clear state
    setActiveToasts([]);
  }, []);

  const getActiveToasts = useCallback(() => {
    return [...activeToasts];
  }, [activeToasts]);

  const updateToastSettings = useCallback((newSettings: Partial<AutoToastSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Handle route changes
  const handleRouteChange = useCallback(() => {
    trackAction({
      type: 'route_change',
      timestamp: Date.now(),
      route: location.pathname,
      data: { pathname: location.pathname }
    });
  }, [trackAction, location.pathname]);

  // Track route changes using React Router's useLocation
  useEffect(() => {
    if (isEnabled && settings.enableAutoNotifications) {
      handleRouteChange();
    }
  }, [location.pathname, handleRouteChange, isEnabled, settings.enableAutoNotifications]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      toastTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      trackAction({ type: 'network_online', timestamp: Date.now() });
    };

    const handleOffline = () => {
      trackAction({ type: 'network_offline', timestamp: Date.now() });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [trackAction]);

  const contextValue: AutoToastContextType = {
    trackAction,
    showToast,
    hideToast,
    clearAllToasts,
    isEnabled,
    setEnabled: setIsEnabled,
    getActiveToasts,
    updateToastSettings
  };

  return (
    <AutoToastContext.Provider value={contextValue}>
      {children}
    </AutoToastContext.Provider>
  );
};

// Hook for easy action tracking
export const useActionTracker = () => {
  const { trackAction } = useAutoToast();

  const trackFormSubmit = useCallback((success: boolean, message?: string, data?: any) => {
    trackAction({
      type: 'form_submit',
      timestamp: Date.now(),
      data: { success, message, ...data }
    });
  }, [trackAction]);

  const trackApiError = useCallback((error: Error, endpoint?: string) => {
    trackAction({
      type: 'api_error',
      timestamp: Date.now(),
      data: { 
        message: error.message,
        endpoint,
        stack: error.stack
      }
    });
  }, [trackAction]);

  const trackFileUpload = useCallback((filename: string, size: number) => {
    trackAction({
      type: 'file_upload_complete',
      timestamp: Date.now(),
      data: { filename, size }
    });
  }, [trackAction]);

  const trackAuthSuccess = useCallback((userId?: string) => {
    trackAction({
      type: 'auth_success',
      timestamp: Date.now(),
      data: { userId }
    });
  }, [trackAction]);

  const trackDataSaved = useCallback((entity: string, id?: string) => {
    trackAction({
      type: 'data_saved',
      timestamp: Date.now(),
      data: { entity, id, message: `${entity} saved successfully!` }
    });
  }, [trackAction]);

  const trackValidationWarning = useCallback((field: string, message: string) => {
    trackAction({
      type: 'validation_warning',
      timestamp: Date.now(),
      data: { field, message }
    });
  }, [trackAction]);

  return {
    trackFormSubmit,
    trackApiError,
    trackFileUpload,
    trackAuthSuccess,
    trackDataSaved,
    trackValidationWarning,
    trackAction
  };
};

export default AutoToastProvider; 