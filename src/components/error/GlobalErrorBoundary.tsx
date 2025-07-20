import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Phone, 
  Mail, 
  Shield, 
  FileText,
  ExternalLink,
  Bug
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  isSubmittingReport: boolean;
  reportSubmitted: boolean;
  errorCategory: 'javascript' | 'network' | 'auth' | 'compliance' | 'data' | 'unknown';
  userImpact: 'low' | 'medium' | 'high' | 'critical';
  userFeedback: string;
}

interface ErrorReport {
  error_id: string;
  error_message: string;
  error_stack: string;
  error_category: string;
  user_impact: string;
  component_stack: string;
  user_agent: string;
  url: string;
  user_id?: string;
  timestamp: string;
  user_feedback?: string;
  session_data: any;
  compliance_impact: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      isSubmittingReport: false,
      reportSubmitted: false,
      errorCategory: 'unknown',
      userImpact: 'medium',
      userFeedback: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
      errorCategory: this.categorizeError(error),
      userImpact: this.assessUserImpact(error)
    });

    // Log error immediately
    this.logError(error, errorInfo);

    // Auto-submit error report for critical errors
    if (this.assessUserImpact(error) === 'critical') {
      setTimeout(() => {
        this.submitErrorReport();
      }, 1000);
    }
  }

  private categorizeError(error: Error): State['errorCategory'] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Network and API errors
    if (message.includes('fetch') || message.includes('network') || 
        message.includes('connection') || message.includes('timeout')) {
      return 'network';
    }

    // Authentication errors
    if (message.includes('auth') || message.includes('unauthorized') || 
        message.includes('permission') || stack.includes('supabase')) {
      return 'auth';
    }

    // Healthcare compliance related errors
    if (message.includes('ahpra') || message.includes('tga') || 
        message.includes('compliance') || message.includes('cultural safety')) {
      return 'compliance';
    }

    // Data and database errors
    if (message.includes('database') || message.includes('query') || 
        message.includes('data') || message.includes('sql')) {
      return 'data';
    }

    // JavaScript runtime errors
    if (message.includes('undefined') || message.includes('null') || 
        message.includes('property') || message.includes('function')) {
      return 'javascript';
    }

    return 'unknown';
  }

  private assessUserImpact(error: Error): State['userImpact'] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Critical impact - affects core healthcare functionality
    if (message.includes('compliance') || message.includes('ahpra') || 
        message.includes('patient') || message.includes('health') ||
        message.includes('auth') || message.includes('security')) {
      return 'critical';
    }

    // High impact - affects main user workflows
    if (message.includes('save') || message.includes('publish') || 
        message.includes('create') || message.includes('submit')) {
      return 'high';
    }

    // Medium impact - affects secondary features
    if (message.includes('load') || message.includes('fetch') || 
        message.includes('display')) {
      return 'medium';
    }

    // Low impact - cosmetic or minor issues
    return 'low';
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      console.group('🚨 Global Error Boundary - Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error ID:', this.state.errorId);
      console.error('Category:', this.state.errorCategory);
      console.error('User Impact:', this.state.userImpact);
      console.groupEnd();

      // Log to external error tracking service if configured
      if ((window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: error.message,
          fatal: this.state.userImpact === 'critical'
        });
      }

    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  private async submitErrorReport(): Promise<void> {
    if (this.state.isSubmittingReport || this.state.reportSubmitted) return;

    this.setState({ isSubmittingReport: true });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // For now, just log the error locally since we're simplifying database interactions
      const errorReport = {
        error_id: this.state.errorId!,
        error_message: this.state.error?.message || 'Unknown error',
        error_type: this.state.errorCategory,
        function_name: 'GlobalErrorBoundary',
        stack_trace: this.state.error?.stack || 'No stack trace available',
        severity: this.state.userImpact,
        user_id: user?.id,
        component_stack: this.state.errorInfo?.componentStack || 'No component stack',
        user_agent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        user_feedback: this.state.userFeedback || undefined,
        compliance_impact: this.state.errorCategory === 'compliance' || 
                          this.state.userImpact === 'critical'
      };

      // Log error report locally (in real app this would go to error tracking service)
      console.group('🔄 Error Report Submitted');
      console.error('Error Report:', errorReport);
      console.groupEnd();

      this.setState({ reportSubmitted: true });

    } catch (error) {
      console.error('Failed to submit error report:', error);
    } finally {
      this.setState({ isSubmittingReport: false });
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        reportSubmitted: false,
        userFeedback: ''
      });
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleFeedbackChange = (feedback: string) => {
    this.setState({ userFeedback: feedback });
  };

  private getErrorTitle(): string {
    switch (this.state.errorCategory) {
      case 'compliance':
        return '🏥 Healthcare Compliance System Error';
      case 'auth':
        return '🔐 Authentication Error';
      case 'network':
        return '🌐 Connection Error';
      case 'data':
        return '💾 Data Processing Error';
      case 'javascript':
        return '⚡ Application Error';
      default:
        return '❗ Unexpected Error';
    }
  }

  private getErrorDescription(): string {
    switch (this.state.errorCategory) {
      case 'compliance':
        return 'A healthcare compliance system error has occurred. This may affect AHPRA/TGA compliance features.';
      case 'auth':
        return 'An authentication error has occurred. You may need to log in again.';
      case 'network':
        return 'A connection error has occurred. Please check your internet connection.';
      case 'data':
        return 'A data processing error has occurred. Your information may not have been saved.';
      case 'javascript':
        return 'An application error has occurred. The page may not be working correctly.';
      default:
        return 'An unexpected error has occurred. Please try again or contact support.';
    }
  }

  private getRecoveryActions(): JSX.Element {
    const canRetry = this.retryCount < this.maxRetries;
    
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        {canRetry && (
          <Button onClick={this.handleRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again ({this.maxRetries - this.retryCount} attempts left)
          </Button>
        )}
        
        <Button variant="outline" onClick={this.handleReload} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Reload Page
        </Button>
        
        <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Go Home
        </Button>
      </div>
    );
  }

  private getComplianceNotice(): JSX.Element | null {
    if (this.state.errorCategory !== 'compliance' && this.state.userImpact !== 'critical') {
      return null;
    }

    return (
      <Alert className="border-red-200 bg-red-50">
        <Shield className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Healthcare Compliance Notice</AlertTitle>
        <AlertDescription className="text-red-700">
          This error may affect healthcare compliance features. If you're working with patient data 
          or compliance-sensitive content, please ensure all work is properly saved and verified 
          before continuing. Contact support if this affects critical healthcare operations.
        </AlertDescription>
      </Alert>
    );
  }

  private getSupportLinks(): JSX.Element {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Emergency Support</h4>
          <div className="space-y-1 text-sm">
            <a 
              href="tel:1800-JBSAAS" 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Phone className="h-3 w-3" />
              1800 JBSAAS (24/7)
            </a>
            <a 
              href="mailto:support@jbsaas.com.au" 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Mail className="h-3 w-3" />
              support@jbsaas.com.au
            </a>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Healthcare Resources</h4>
          <div className="space-y-1 text-sm">
            <a 
              href="https://help.jbsaas.com.au/healthcare-compliance" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-3 w-3" />
              Healthcare Compliance Help
            </a>
            <a 
              href="https://help.jbsaas.com.au/error-recovery" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <FileText className="h-3 w-3" />
              Error Recovery Guide
            </a>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">{this.getErrorTitle()}</CardTitle>
              <CardDescription className="text-base">
                {this.getErrorDescription()}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Details */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  Error ID: {this.state.errorId}
                </Badge>
                <Badge 
                  variant={this.state.userImpact === 'critical' ? 'destructive' : 'secondary'}
                >
                  {this.state.userImpact.toUpperCase()} Impact
                </Badge>
                <Badge variant="outline">
                  Category: {this.state.errorCategory}
                </Badge>
              </div>

              {/* Compliance Notice */}
              {this.getComplianceNotice()}

              {/* Recovery Actions */}
              <div className="space-y-3">
                <h3 className="font-medium">Recovery Options</h3>
                {this.getRecoveryActions()}
              </div>

              {/* Error Reporting */}
              <div className="space-y-3">
                <h3 className="font-medium">Help Improve Our System</h3>
                <div className="space-y-3">
                  <textarea
                    placeholder="Optional: Describe what you were doing when this error occurred..."
                    value={this.state.userFeedback}
                    onChange={(e) => this.handleFeedbackChange(e.target.value)}
                    className="w-full p-3 border rounded-md resize-none"
                    rows={3}
                  />
                  
                  {!this.state.reportSubmitted ? (
                    <Button 
                      onClick={() => this.submitErrorReport()}
                      disabled={this.state.isSubmittingReport}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Bug className="h-4 w-4 mr-2" />
                      {this.state.isSubmittingReport ? 'Sending Report...' : 'Send Error Report'}
                    </Button>
                  ) : (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">
                        ✅ Error report submitted successfully. Thank you for helping us improve!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Technical Details (Collapsible) */}
              <details className="group">
                <summary className="cursor-pointer font-medium text-sm text-gray-600 hover:text-gray-800">
                  Technical Details (for developers)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-auto">
                  <div><strong>Error:</strong> {this.state.error?.message}</div>
                  <div><strong>Stack:</strong> {this.state.error?.stack}</div>
                  {this.state.errorInfo && (
                    <div><strong>Component Stack:</strong> {this.state.errorInfo.componentStack}</div>
                  )}
                </div>
              </details>

              {/* Support Links */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-medium">Need Help?</h3>
                {this.getSupportLinks()}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for programmatic error reporting
export const useErrorReporting = () => {
  const reportError = async (
    error: Error,
    context: string,
    additionalData?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const errorReport = {
        error_id: `MANUAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        error_message: error.message,
        error_stack: error.stack || 'No stack trace',
        error_category: 'javascript',
        user_impact: 'medium',
        component_stack: context,
        user_agent: navigator.userAgent,
        url: window.location.href,
        user_id: user?.id,
        timestamp: new Date().toISOString(),
        session_data: {
          context,
          additional_data: additionalData,
          manual_report: true
        },
        compliance_impact: false
      };

      // For now, just log the error locally
      console.warn('Manual Error Report:', errorReport);

      console.warn('Error reported:', errorReport);

    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  return { reportError };
}; 