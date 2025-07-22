import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  RefreshCw, 
  Phone, 
  Mail, 
  ExternalLink,
  Shield,
  Wifi,
  Lock,
  Database,
  HelpCircle,
  ArrowRight,
  Clock,
  Users,
  FileText,
  Settings
} from 'lucide-react';

export interface ErrorContext {
  code: string;
  message: string;
  category: 'network' | 'auth' | 'compliance' | 'validation' | 'permission' | 'data' | 'system' | 'user';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: string;
  userAction?: string;
  technicalDetails?: string;
}

interface ErrorSolution {
  title: string;
  description: string;
  steps: string[];
  actionButton?: {
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  };
  helpLinks?: Array<{
    label: string;
    url: string;
    external?: boolean;
  }>;
  estimatedTime?: string;
  difficulty: 'easy' | 'medium' | 'advanced';
}

interface UserFriendlyErrorProps {
  error: ErrorContext;
  onRetry?: () => void;
  onContactSupport?: () => void;
  className?: string;
}

// Healthcare-specific error message database
const ERROR_SOLUTIONS: Record<string, ErrorSolution> = {
  // Network Errors
  'NETWORK_TIMEOUT': {
    title: 'Connection Timeout',
    description: 'Your request took too long to complete. This usually happens due to slow internet or server issues.',
    steps: [
      'Check your internet connection',
      'Try refreshing the page',
      'Wait a moment and try again',
      'If problem persists, contact support'
    ],
    actionButton: {
      label: 'Try Again',
      action: () => window.location.reload(),
      variant: 'default'
    },
    helpLinks: [
      { label: 'Connection Troubleshooting', url: 'https://help.jbsaas.com.au/connection-issues' }
    ],
    estimatedTime: '1-2 minutes',
    difficulty: 'easy'
  },

  'NETWORK_OFFLINE': {
    title: 'No Internet Connection',
    description: 'You appear to be offline. Please check your internet connection and try again.',
    steps: [
      'Check your WiFi or mobile data connection',
      'Try visiting another website to test connectivity',
      'Restart your router if using WiFi',
      'Contact your internet provider if issues persist'
    ],
    estimatedTime: '2-5 minutes',
    difficulty: 'easy'
  },

  'API_ERROR': {
    title: 'Service Temporarily Unavailable',
    description: 'Our services are experiencing temporary issues. Your data is safe, and we\'re working to restore full functionality.',
    steps: [
      'Wait a few minutes and try again',
      'Check our status page for updates',
      'Save any important work locally',
      'Contact support if urgent'
    ],
    helpLinks: [
      { label: 'System Status', url: 'https://status.jbsaas.com.au', external: true }
    ],
    estimatedTime: '5-15 minutes',
    difficulty: 'easy'
  },

  // Authentication Errors
  'AUTH_SESSION_EXPIRED': {
    title: 'Session Expired for Security',
    description: 'For your security, we\'ve logged you out after a period of inactivity. This protects your healthcare data.',
    steps: [
      'Click "Log In Again" below',
      'Enter your credentials',
      'Enable "Remember Me" for longer sessions',
      'Consider enabling multi-factor authentication for extra security'
    ],
    actionButton: {
      label: 'Log In Again',
      action: () => window.location.href = '/auth',
      variant: 'default'
    },
    helpLinks: [
      { label: 'Account Security Guide', url: 'https://help.jbsaas.com.au/account-security' }
    ],
    estimatedTime: '1-2 minutes',
    difficulty: 'easy'
  },

  'AUTH_INVALID_CREDENTIALS': {
    title: 'Login Information Incorrect',
    description: 'The email or password you entered doesn\'t match our records. Please double-check and try again.',
    steps: [
      'Check your email address for typos',
      'Ensure Caps Lock is off when typing your password',
      'Try copying and pasting your password',
      'Use "Forgot Password" if you can\'t remember it'
    ],
    actionButton: {
      label: 'Reset Password',
      action: () => window.location.href = '/auth?tab=reset',
      variant: 'outline'
    },
    estimatedTime: '2-5 minutes',
    difficulty: 'easy'
  },

  'AUTH_ACCOUNT_LOCKED': {
    title: 'Account Temporarily Locked',
    description: 'Your account has been temporarily locked due to multiple failed login attempts. This is a security measure.',
    steps: [
      'Wait 15 minutes before trying again',
      'Use the "Reset Password" option',
      'Contact support if you suspect unauthorized access',
      'Consider enabling two-factor authentication'
    ],
    helpLinks: [
      { label: 'Account Security Help', url: 'https://help.jbsaas.com.au/account-locked' }
    ],
    estimatedTime: '15-20 minutes',
    difficulty: 'easy'
  },

  // Healthcare Compliance Errors
  'AHPRA_COMPLIANCE_VIOLATION': {
    title: 'AHPRA Compliance Check Failed',
    description: 'Your content doesn\'t meet AHPRA advertising guidelines. We\'ve blocked publication to protect your professional registration.',
    steps: [
      'Review the specific compliance issues highlighted',
      'Remove any prohibited claims or terminology',
      'Add required disclaimers and warnings',
      'Consider consulting with a compliance advisor'
    ],
    actionButton: {
      label: 'View Compliance Guide',
      action: () => window.open('https://help.jbsaas.com.au/ahpra-compliance', '_blank'),
      variant: 'default'
    },
    helpLinks: [
      { label: 'AHPRA Guidelines', url: 'https://www.ahpra.gov.au/News/2014-03-24-advertising-guidelines.aspx', external: true },
      { label: 'Compliance Checklist', url: 'https://help.jbsaas.com.au/compliance-checklist' }
    ],
    estimatedTime: '10-30 minutes',
    difficulty: 'medium'
  },

  'TGA_DEVICE_COMPLIANCE': {
    title: 'TGA Medical Device Compliance Issue',
    description: 'Your content about medical devices doesn\'t meet TGA advertising requirements. Review is needed before publication.',
    steps: [
      'Check that the device is TGA registered',
      'Ensure claims match approved indications',
      'Add required sponsor identification',
      'Include appropriate risk warnings'
    ],
    helpLinks: [
      { label: 'TGA Device Guidelines', url: 'https://www.tga.gov.au/advertising-therapeutic-goods', external: true },
      { label: 'Device Compliance Help', url: 'https://help.jbsaas.com.au/tga-device-compliance' }
    ],
    estimatedTime: '15-45 minutes',
    difficulty: 'advanced'
  },

  'CULTURAL_SAFETY_CONCERN': {
    title: 'Cultural Safety Review Required',
    description: 'Your Indigenous health content requires cultural consultation before publication to ensure cultural safety.',
    steps: [
      'Request cultural consultation through the platform',
      'Review cultural safety guidelines',
      'Await feedback from cultural advisor',
      'Make recommended changes before publication'
    ],
    helpLinks: [
      { label: 'Cultural Safety Guidelines', url: 'https://help.jbsaas.com.au/cultural-safety' },
      { label: 'Request Consultation', url: '/dashboard/cultural-consultation' }
    ],
    estimatedTime: '1-5 business days',
    difficulty: 'medium'
  },

  // Data and Validation Errors
  'VALIDATION_REQUIRED_FIELD': {
    title: 'Required Information Missing',
    description: 'Some required fields are empty or incomplete. Please fill in all required information.',
    steps: [
      'Look for fields marked with a red asterisk (*)',
      'Fill in all required information',
      'Check that email addresses are correctly formatted',
      'Ensure phone numbers include area codes'
    ],
    estimatedTime: '2-5 minutes',
    difficulty: 'easy'
  },

  'VALIDATION_INVALID_FORMAT': {
    title: 'Information Format Incorrect',
    description: 'Some of the information you entered isn\'t in the correct format. Please check and correct it.',
    steps: [
      'Check email addresses for correct format (name@domain.com)',
      'Ensure dates are in the correct format',
      'Check that phone numbers contain only numbers',
      'Verify website URLs start with http:// or https://'
    ],
    estimatedTime: '2-5 minutes',
    difficulty: 'easy'
  },

  'DATA_SAVE_FAILED': {
    title: 'Unable to Save Your Work',
    description: 'We couldn\'t save your changes due to a technical issue. Your work may be lost if you navigate away.',
    steps: [
      'Copy your content to a safe place (like a document)',
      'Try saving again in a few moments',
      'Check your internet connection',
      'Contact support if the problem continues'
    ],
    actionButton: {
      label: 'Try Saving Again',
      action: () => window.location.reload(),
      variant: 'default'
    },
    estimatedTime: '2-5 minutes',
    difficulty: 'easy'
  },

  // Permission Errors
  'PERMISSION_DENIED': {
    title: 'Access Not Permitted',
    description: 'You don\'t have permission to access this feature. This might be due to your account type or team role.',
    steps: [
      'Check if you\'re logged into the correct account',
      'Contact your team administrator for access',
      'Upgrade your plan if this is a premium feature',
      'Ensure your email is verified'
    ],
    helpLinks: [
      { label: 'Account Permissions Guide', url: 'https://help.jbsaas.com.au/permissions' },
      { label: 'Upgrade Plans', url: '/pricing' }
    ],
    estimatedTime: '5-15 minutes',
    difficulty: 'medium'
  },

  'SUBSCRIPTION_REQUIRED': {
    title: 'Subscription Required',
    description: 'This feature requires an active subscription. Upgrade your plan to access premium healthcare tools.',
    steps: [
      'Review available subscription plans',
      'Choose a plan that includes this feature',
      'Complete the upgrade process',
      'Contact sales for custom enterprise solutions'
    ],
    actionButton: {
      label: 'View Plans',
      action: () => window.location.href = '/pricing',
      variant: 'default'
    },
    helpLinks: [
      { label: 'Plan Comparison', url: '/pricing' },
      { label: 'Contact Sales', url: 'mailto:sales@jbsaas.com.au' }
    ],
    estimatedTime: '5-10 minutes',
    difficulty: 'easy'
  },

  // System Errors
  'SYSTEM_MAINTENANCE': {
    title: 'Scheduled Maintenance',
    description: 'We\'re performing scheduled maintenance to improve our healthcare platform. Service will resume shortly.',
    steps: [
      'Check our status page for maintenance duration',
      'Save any important work locally',
      'Try again after the maintenance window',
      'Subscribe to status updates for notifications'
    ],
    helpLinks: [
      { label: 'System Status', url: 'https://status.jbsaas.com.au', external: true }
    ],
    estimatedTime: '15-60 minutes',
    difficulty: 'easy'
  },

  'RATE_LIMIT_EXCEEDED': {
    title: 'Too Many Requests',
    description: 'You\'ve made too many requests in a short time. Please wait a moment before trying again.',
    steps: [
      'Wait 1-2 minutes before trying again',
      'Avoid clicking buttons multiple times',
      'Check if you have multiple tabs open',
      'Contact support if you think this is an error'
    ],
    estimatedTime: '1-2 minutes',
    difficulty: 'easy'
  }
};

const getErrorIcon = (category: ErrorContext['category'], severity: ErrorContext['severity']) => {
  if (severity === 'critical') return <XCircle className="h-5 w-5 text-red-600" />;
  if (severity === 'high') return <AlertTriangle className="h-5 w-5 text-orange-600" />;
  if (severity === 'medium') return <Info className="h-5 w-5 text-blue-600" />;
  
  switch (category) {
    case 'network': return <Wifi className="h-5 w-5 text-blue-600" />;
    case 'auth': return <Lock className="h-5 w-5 text-purple-600" />;
    case 'compliance': return <Shield className="h-5 w-5 text-red-600" />;
    case 'data': return <Database className="h-5 w-5 text-green-600" />;
    case 'permission': return <Users className="h-5 w-5 text-orange-600" />;
    default: return <HelpCircle className="h-5 w-5 text-gray-600" />;
  }
};

const getSeverityColor = (severity: ErrorContext['severity']) => {
  switch (severity) {
    case 'critical': return 'border-red-200 bg-red-50';
    case 'high': return 'border-orange-200 bg-orange-50';
    case 'medium': return 'border-blue-200 bg-blue-50';
    case 'low': return 'border-gray-200 bg-gray-50';
    default: return 'border-gray-200 bg-gray-50';
  }
};

const getDifficultyBadge = (difficulty: ErrorSolution['difficulty']) => {
  switch (difficulty) {
    case 'easy': return <Badge variant="secondary" className="bg-green-100 text-green-800">Easy Fix</Badge>;
    case 'medium': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Moderate</Badge>;
    case 'advanced': return <Badge variant="secondary" className="bg-red-100 text-red-800">Advanced</Badge>;
  }
};

export const UserFriendlyErrorMessage: React.FC<UserFriendlyErrorProps> = ({
  error,
  onRetry,
  onContactSupport,
  className = ''
}) => {
  const solution = ERROR_SOLUTIONS[error.code] || ERROR_SOLUTIONS['SYSTEM_MAINTENANCE'];
  
  const handleContactSupport = () => {
    if (onContactSupport) {
      onContactSupport();
    } else {
      // Default support action
      window.location.href = 'mailto:support@jbsaas.com.au?subject=Error%20Report%20-%20' + error.code;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Error Alert */}
      <Alert className={getSeverityColor(error.severity)}>
        {getErrorIcon(error.category, error.severity)}
        <AlertTitle className="flex items-center gap-2">
          {solution.title}
          {getDifficultyBadge(solution.difficulty)}
          {solution.estimatedTime && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {solution.estimatedTime}
            </Badge>
          )}
        </AlertTitle>
        <AlertDescription className="mt-2">
          {solution.description}
        </AlertDescription>
      </Alert>

      {/* Solution Steps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            How to Fix This
          </CardTitle>
          <CardDescription>
            Follow these steps to resolve the issue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {solution.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-sm">{step}</p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            {solution.actionButton && (
              <Button
                onClick={solution.actionButton.action}
                variant={solution.actionButton.variant || 'default'}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                {solution.actionButton.label}
              </Button>
            )}
            
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help Links */}
      {solution.helpLinks && solution.helpLinks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Additional Help
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {solution.helpLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target={link.external ? '_blank' : '_self'}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Support */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            Still Need Help?
          </CardTitle>
          <CardDescription>
            Our healthcare specialists are here to help
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Emergency Support</h4>
              <a 
                href="tel:1800-JBSAAS" 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <Phone className="h-4 w-4" />
                1800 JBSAAS (24/7)
              </a>
              <Button
                onClick={handleContactSupport}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email Support
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Healthcare Help</h4>
              <a 
                href="https://help.jbsaas.com.au/healthcare"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <FileText className="h-4 w-4" />
                Healthcare Documentation
              </a>
              <a 
                href="https://help.jbsaas.com.au/compliance"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <Shield className="h-4 w-4" />
                Compliance Guide
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details (if provided) */}
      {error.technicalDetails && (
        <details className="group">
          <summary className="cursor-pointer font-medium text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Technical Details (for IT support)
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap">
            <div><strong>Error Code:</strong> {error.code}</div>
            <div><strong>Category:</strong> {error.category}</div>
            <div><strong>Severity:</strong> {error.severity}</div>
            {error.context && <div><strong>Context:</strong> {error.context}</div>}
            {error.userAction && <div><strong>User Action:</strong> {error.userAction}</div>}
            <div><strong>Technical Details:</strong> {error.technicalDetails}</div>
            <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
          </div>
        </details>
      )}
    </div>
  );
};

// Hook for generating user-friendly error messages
export const useUserFriendlyErrors = () => {
  const createError = (
    code: string,
    message: string,
    category: ErrorContext['category'],
    severity: ErrorContext['severity'] = 'medium',
    context?: string,
    userAction?: string,
    technicalDetails?: string
  ): ErrorContext => ({
    code,
    message,
    category,
    severity,
    context,
    userAction,
    technicalDetails
  });

  const getErrorFromResponse = (error: any): ErrorContext => {
    // Network errors
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERR') {
      return createError('NETWORK_OFFLINE', error.message, 'network', 'high');
    }
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return createError('NETWORK_TIMEOUT', error.message, 'network', 'medium');
    }

    // Auth errors
    if (error.status === 401 || error.message?.includes('unauthorized')) {
      return createError('AUTH_SESSION_EXPIRED', error.message, 'auth', 'high');
    }

    if (error.status === 403) {
      return createError('PERMISSION_DENIED', error.message, 'permission', 'medium');
    }

    // Validation errors
    if (error.status === 422 || error.message?.includes('validation')) {
      return createError('VALIDATION_REQUIRED_FIELD', error.message, 'validation', 'low');
    }

    // Compliance errors
    if (error.message?.includes('AHPRA') || error.message?.includes('compliance')) {
      return createError('AHPRA_COMPLIANCE_VIOLATION', error.message, 'compliance', 'critical');
    }

    // Rate limiting
    if (error.status === 429) {
      return createError('RATE_LIMIT_EXCEEDED', error.message, 'system', 'medium');
    }

    // Default system error
    return createError('SYSTEM_MAINTENANCE', error.message, 'system', 'medium', undefined, undefined, JSON.stringify(error));
  };

  return {
    createError,
    getErrorFromResponse,
    ERROR_SOLUTIONS
  };
}; 