import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { Mail, RefreshCw, CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface EmailConfirmationRequiredProps {
  isHealthcareProfessional?: boolean;
}

export const EmailConfirmationRequired: React.FC<EmailConfirmationRequiredProps> = ({ 
  isHealthcareProfessional = false 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    isEmailConfirmed,
    isCheckingConfirmation,
    canResendEmail,
    secondsUntilResend,
    checkEmailConfirmation,
    resendConfirmationEmail,
    checkProductionEmailConfig
  } = useEmailConfirmation();

  const [isResending, setIsResending] = useState(false);
  const [emailConfigStatus, setEmailConfigStatus] = useState<any>(null);

  // Check email confirmation status periodically
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      const confirmed = await checkEmailConfirmation();
      if (confirmed) {
        navigate(isHealthcareProfessional ? '/healthcare-content' : '/dashboard');
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(checkInterval);
  }, [checkEmailConfirmation, navigate, isHealthcareProfessional]);

  // Check production email configuration on mount
  useEffect(() => {
    checkProductionEmailConfig().then(setEmailConfigStatus);
  }, [checkProductionEmailConfig]);

  const handleResendEmail = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    await resendConfirmationEmail(user.email);
    setIsResending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Confirm Your Email</CardTitle>
          <CardDescription>
            We've sent a confirmation link to <strong>{user?.email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Healthcare Professional Badge */}
          {isHealthcareProfessional && (
            <div className="flex justify-center">
              <Badge variant="outline" className="px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Healthcare Professional Account
              </Badge>
            </div>
          )}

          {/* Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Please check your email inbox</strong> and click the confirmation link to activate your account.
              The email should arrive within 1-2 minutes.
            </AlertDescription>
          </Alert>

          {/* Email not received section */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">
              Didn't receive the email? Check your spam folder or request a new one.
            </p>

            <Button
              onClick={handleResendEmail}
              disabled={!canResendEmail || isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : !canResendEmail ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Resend in {secondsUntilResend}s
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Confirmation Email
                </>
              )}
            </Button>
          </div>

          {/* Production Email Status (only in development) */}
          {process.env.NODE_ENV === 'development' && emailConfigStatus && (
            <Alert className={emailConfigStatus.configured ? 'border-green-200' : 'border-yellow-200'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Email Service:</strong> {emailConfigStatus.configured ? 'Configured' : 'Not Configured'}
                {emailConfigStatus.provider && <span> ({emailConfigStatus.provider})</span>}
              </AlertDescription>
            </Alert>
          )}

          {/* Tips */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2">Email not arriving?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Add noreply@supabase.io to your contacts</li>
              <li>• Wait a few minutes - emails can sometimes be delayed</li>
            </ul>
          </div>

          {/* Support Contact */}
          <div className="text-center text-sm text-gray-500">
            Still having issues? Contact support at{' '}
            <a href="mailto:support@jbsaas.com" className="text-blue-600 hover:underline">
              support@jbsaas.com
            </a>
          </div>

          {/* Sign Out Option */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-gray-500 hover:text-gray-700"
            >
              Sign in with a different account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 