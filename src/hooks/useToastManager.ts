import { useCallback, useRef, useEffect } from 'react';
import { useToast } from './use-toast';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: ToastAction;
  persistent?: boolean;
  showProgress?: boolean;
  category?: 'healthcare' | 'compliance' | 'auth' | 'data' | 'general' | 'success' | 'warning' | 'error';
  context?: string;
  metadata?: Record<string, any>;
}

interface ToastTemplate {
  title: string;
  description: string;
  variant: 'default' | 'destructive';
  duration: number;
  category: string;
}

// Pre-defined toast templates for common user actions
const TOAST_TEMPLATES: Record<string, ToastTemplate> = {
  // Authentication & User Management
  'auth.login.success': {
    title: 'Welcome Back',
    description: 'Successfully logged into your healthcare dashboard',
    variant: 'default',
    duration: 3000,
    category: 'auth'
  },
  'auth.login.failed': {
    title: 'Login Failed',
    description: 'Please check your credentials and try again',
    variant: 'destructive',
    duration: 5000,
    category: 'auth'
  },
  'auth.logout.success': {
    title: 'Logged Out',
    description: 'You have been securely logged out',
    variant: 'default',
    duration: 2000,
    category: 'auth'
  },
  'auth.session.expired': {
    title: 'Session Expired',
    description: 'Please log in again to continue',
    variant: 'destructive',
    duration: 6000,
    category: 'auth'
  },
  'auth.mfa.enabled': {
    title: 'Multi-Factor Authentication Enabled',
    description: 'Your account security has been enhanced',
    variant: 'default',
    duration: 4000,
    category: 'auth'
  },

  // Healthcare Operations
  'healthcare.patient.created': {
    title: 'Patient Record Created',
    description: 'New patient information has been securely stored',
    variant: 'default',
    duration: 3000,
    category: 'healthcare'
  },
  'healthcare.patient.updated': {
    title: 'Patient Record Updated',
    description: 'Patient information has been successfully updated',
    variant: 'default',
    duration: 3000,
    category: 'healthcare'
  },
  'healthcare.appointment.scheduled': {
    title: 'Appointment Scheduled',
    description: 'New appointment has been added to your calendar',
    variant: 'default',
    duration: 4000,
    category: 'healthcare'
  },
  'healthcare.appointment.cancelled': {
    title: 'Appointment Cancelled',
    description: 'Patient notification has been sent automatically',
    variant: 'default',
    duration: 3000,
    category: 'healthcare'
  },
  'healthcare.data.backup': {
    title: 'Data Backup Complete',
    description: 'Healthcare records have been securely backed up',
    variant: 'default',
    duration: 3000,
    category: 'healthcare'
  },

  // Compliance & Regulatory
  'compliance.ahpra.validated': {
    title: 'AHPRA Compliance Verified',
    description: 'Content meets professional advertising standards',
    variant: 'default',
    duration: 4000,
    category: 'compliance'
  },
  'compliance.ahpra.violation': {
    title: 'AHPRA Compliance Issue',
    description: 'Content requires review before publication',
    variant: 'destructive',
    duration: 8000,
    category: 'compliance'
  },
  'compliance.tga.approved': {
    title: 'TGA Compliance Approved',
    description: 'Medical device content approved for publication',
    variant: 'default',
    duration: 4000,
    category: 'compliance'
  },
  'compliance.cultural.submitted': {
    title: 'Cultural Review Requested',
    description: 'Indigenous health content submitted for consultation',
    variant: 'default',
    duration: 5000,
    category: 'compliance'
  },
  'compliance.audit.complete': {
    title: 'Compliance Audit Complete',
    description: 'All regulatory requirements have been verified',
    variant: 'default',
    duration: 4000,
    category: 'compliance'
  },

  // Content & Media Management
  'content.created': {
    title: 'Content Created',
    description: 'New healthcare content has been generated',
    variant: 'default',
    duration: 3000,
    category: 'general'
  },
  'content.published': {
    title: 'Content Published',
    description: 'Your content is now live and compliant',
    variant: 'default',
    duration: 4000,
    category: 'general'
  },
  'content.scheduled': {
    title: 'Content Scheduled',
    description: 'Post will be published at the scheduled time',
    variant: 'default',
    duration: 3000,
    category: 'general'
  },
  'content.saved': {
    title: 'Content Saved',
    description: 'Your changes have been saved as a draft',
    variant: 'default',
    duration: 2000,
    category: 'general'
  },
  'media.uploaded': {
    title: 'Media Uploaded',
    description: 'Files have been processed and are ready to use',
    variant: 'default',
    duration: 3000,
    category: 'general'
  },

  // Data Operations
  'data.saved': {
    title: 'Data Saved',
    description: 'Information has been securely stored',
    variant: 'default',
    duration: 2000,
    category: 'data'
  },
  'data.export.complete': {
    title: 'Export Complete',
    description: 'Data has been exported and is ready for download',
    variant: 'default',
    duration: 4000,
    category: 'data'
  },
  'data.import.success': {
    title: 'Import Successful',
    description: 'Data has been imported and validated',
    variant: 'default',
    duration: 3000,
    category: 'data'
  },
  'data.sync.complete': {
    title: 'Synchronisation Complete',
    description: 'All systems are now up to date',
    variant: 'default',
    duration: 3000,
    category: 'data'
  },

  // Error & Warning States
  'error.network': {
    title: 'Connection Error',
    description: 'Please check your internet connection and try again',
    variant: 'destructive',
    duration: 5000,
    category: 'error'
  },
  'error.validation': {
    title: 'Validation Error',
    description: 'Please check the required fields and try again',
    variant: 'destructive',
    duration: 4000,
    category: 'error'
  },
  'error.permission': {
    title: 'Access Denied',
    description: 'You do not have permission to perform this action',
    variant: 'destructive',
    duration: 5000,
    category: 'error'
  },
  'warning.unsaved': {
    title: 'Unsaved Changes',
    description: 'You have unsaved changes that will be lost',
    variant: 'destructive',
    duration: 6000,
    category: 'warning'
  },

  // Success States
  'success.operation': {
    title: 'Operation Successful',
    description: 'Your action has been completed successfully',
    variant: 'default',
    duration: 3000,
    category: 'success'
  },
  'success.email.sent': {
    title: 'Email Sent',
    description: 'Message has been delivered successfully',
    variant: 'default',
    duration: 3000,
    category: 'success'
  },
  'success.settings.updated': {
    title: 'Settings Updated',
    description: 'Your preferences have been saved',
    variant: 'default',
    duration: 2000,
    category: 'success'
  }
};

// Healthcare-specific toast actions
const HEALTHCARE_ACTIONS: Record<string, ToastAction> = {
  viewCompliance: {
    label: 'View Guidelines',
    onClick: () => window.open('https://help.jbsaas.com.au/compliance', '_blank'),
    variant: 'outline'
  },
  contactSupport: {
    label: 'Contact Support',
    onClick: () => window.location.href = 'mailto:support@jbsaas.com.au',
    variant: 'default'
  },
  reviewContent: {
    label: 'Review Content',
    onClick: () => window.location.href = '/dashboard/content-review',
    variant: 'default'
  },
  scheduleConsult: {
    label: 'Schedule Consultation',
    onClick: () => window.location.href = '/dashboard/cultural-consultation',
    variant: 'default'
  },
  viewAuditLog: {
    label: 'View Audit Log',
    onClick: () => window.location.href = '/dashboard/audit-log',
    variant: 'outline'
  }
};

export const useToastManager = () => {
  const { toast } = useToast();
  const toastHistory = useRef<Array<{ id: string; template: string; timestamp: number; metadata?: any }>>([]);
  const activeToasts = useRef<Set<string>>(new Set());

  // Show toast using pre-defined template
  const showToast = useCallback((
    templateKey: string,
    customOptions: Partial<ToastOptions> = {},
    metadata?: Record<string, any>
  ) => {
    const template = TOAST_TEMPLATES[templateKey];
    
    if (!template) {
      console.warn(`Toast template "${templateKey}" not found`);
      return;
    }

    // Create unique toast ID to prevent duplicates
    const toastId = `${templateKey}-${Date.now()}`;
    
    // Prevent duplicate toasts of the same type within 2 seconds
    const recentSimilar = toastHistory.current.find(
      t => t.template === templateKey && (Date.now() - t.timestamp) < 2000
    );
    
    if (recentSimilar && !customOptions.persistent) {
      return;
    }

    // Merge template with custom options
    const options: ToastOptions = {
      title: customOptions.title || template.title,
      description: customOptions.description || template.description,
      variant: customOptions.variant || template.variant,
      duration: customOptions.duration || template.duration,
      category: customOptions.category || template.category,
      ...customOptions
    };

    // Add healthcare-specific actions for compliance toasts
    if (template.category === 'compliance' && !options.action) {
      if (templateKey.includes('ahpra')) {
        options.action = HEALTHCARE_ACTIONS.viewCompliance;
      } else if (templateKey.includes('cultural')) {
        options.action = HEALTHCARE_ACTIONS.scheduleConsult;
      }
    }

    // Add support action for error toasts
    if (template.category === 'error' && !options.action) {
      options.action = HEALTHCARE_ACTIONS.contactSupport;
    }

    // Show the toast
    toast({
      title: options.title,
      description: options.description,
      variant: options.variant,
      duration: options.duration,
      action: options.action
    });

    // Track in history
    toastHistory.current.push({
      id: toastId,
      template: templateKey,
      timestamp: Date.now(),
      metadata
    });

    activeToasts.current.add(toastId);

    // Auto-remove from tracking after duration
    if (options.duration && options.duration > 0) {
      setTimeout(() => {
        activeToasts.current.delete(toastId);
      }, options.duration);
    }

    return toastId;
  }, [toast]);

  // Convenience methods for common actions
  const showSuccess = useCallback((title: string, description?: string, action?: ToastAction) => {
    return toast({
      title,
      description,
      variant: 'default',
      duration: 3000,
      action
    });
  }, [toast]);

  const showError = useCallback((title: string, description?: string, action?: ToastAction) => {
    return toast({
      title,
      description: description || 'Please try again or contact support if the issue persists',
      variant: 'destructive',
      duration: 5000,
      action: action || HEALTHCARE_ACTIONS.contactSupport
    });
  }, [toast]);

  const showWarning = useCallback((title: string, description?: string, action?: ToastAction) => {
    return toast({
      title,
      description,
      variant: 'destructive',
      duration: 4000,
      action
    });
  }, [toast]);

  // Healthcare-specific methods
  const showHealthcareSuccess = useCallback((action: string, details?: string) => {
    const templates = {
      'patient-created': 'healthcare.patient.created',
      'patient-updated': 'healthcare.patient.updated',
      'appointment-scheduled': 'healthcare.appointment.scheduled',
      'appointment-cancelled': 'healthcare.appointment.cancelled',
      'data-backup': 'healthcare.data.backup'
    };

    const templateKey = templates[action as keyof typeof templates] || 'success.operation';
    return showToast(templateKey, { description: details });
  }, [showToast]);

  const showComplianceResult = useCallback((type: 'ahpra' | 'tga' | 'cultural', status: 'approved' | 'violation' | 'submitted', details?: string) => {
    const templateKey = `compliance.${type}.${status}`;
    return showToast(templateKey, { description: details });
  }, [showToast]);

  const showAuthUpdate = useCallback((action: 'login' | 'logout' | 'mfa-enabled' | 'session-expired', details?: string) => {
    const templateKey = `auth.${action}.${action === 'session-expired' ? action : 'success'}`;
    return showToast(templateKey, { description: details });
  }, [showToast]);

  // Content management methods
  const showContentUpdate = useCallback((action: 'created' | 'published' | 'scheduled' | 'saved', details?: string) => {
    const templateKey = `content.${action}`;
    return showToast(templateKey, { description: details });
  }, [showToast]);

  const showDataOperation = useCallback((action: 'saved' | 'exported' | 'imported' | 'synced', details?: string) => {
    const templateMap = {
      'saved': 'data.saved',
      'exported': 'data.export.complete',
      'imported': 'data.import.success',
      'synced': 'data.sync.complete'
    };
    
    const templateKey = templateMap[action];
    return showToast(templateKey, { description: details });
  }, [showToast]);

  // Batch operations
  const showBatchResult = useCallback((
    successCount: number,
    failureCount: number,
    operation: string
  ) => {
    if (failureCount === 0) {
      showSuccess(
        'Batch Operation Complete',
        `All ${successCount} ${operation} operations completed successfully`
      );
    } else if (successCount === 0) {
      showError(
        'Batch Operation Failed',
        `All ${failureCount} ${operation} operations failed`
      );
    } else {
      showWarning(
        'Batch Operation Partial Success',
        `${successCount} succeeded, ${failureCount} failed during ${operation}`
      );
    }
  }, [showSuccess, showError, showWarning]);

  // Progress notifications
  const showProgress = useCallback((operation: string, progress: number) => {
    if (progress >= 100) {
      showSuccess('Operation Complete', `${operation} finished successfully`);
    } else if (progress === 0) {
      showToast('success.operation', {
        title: 'Operation Started',
        description: `${operation} is now in progress`,
        duration: 2000
      });
    }
  }, [showSuccess, showToast]);

  // Get toast statistics
  const getToastStats = useCallback(() => {
    const now = Date.now();
    const last24h = toastHistory.current.filter(t => (now - t.timestamp) < 24 * 60 * 60 * 1000);
    
    const categoryStats = last24h.reduce((acc, toast) => {
      const template = TOAST_TEMPLATES[toast.template];
      const category = template?.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: toastHistory.current.length,
      last24h: last24h.length,
      active: activeToasts.current.size,
      categoryStats
    };
  }, []);

  // Clean up old toast history
  useEffect(() => {
    const cleanup = setInterval(() => {
      const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
      toastHistory.current = toastHistory.current.filter(t => t.timestamp > cutoff);
    }, 60 * 60 * 1000); // Clean up every hour

    return () => clearInterval(cleanup);
  }, []);

  return {
    // Template-based methods
    showToast,
    
    // Generic methods
    showSuccess,
    showError,
    showWarning,
    
    // Healthcare-specific methods
    showHealthcareSuccess,
    showComplianceResult,
    showAuthUpdate,
    showContentUpdate,
    showDataOperation,
    
    // Batch and progress methods
    showBatchResult,
    showProgress,
    
    // Utilities
    getToastStats,
    
    // Available templates and actions
    TOAST_TEMPLATES,
    HEALTHCARE_ACTIONS
  };
}; 