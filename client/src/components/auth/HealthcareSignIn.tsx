import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHealthcareAuth } from '@/hooks/useHealthcareAuth';
import { Shield, LogIn, CheckCircle, Eye, EyeOff, Loader2, AlertTriangle, Users, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HealthcareSignInProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export const HealthcareSignIn: React.FC<HealthcareSignInProps> = ({ onSuccess, onSwitchToSignUp }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const { signInHealthcareProfessional, isLoading } = useHealthcareAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';

    if (!formData.password) errors.password = 'Password is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await signInHealthcareProfessional(formData.email, formData.password);

    if (result.success) {
      onSuccess?.();
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) {
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for instructions to reset your password.",
      });

      setShowResetForm(false);
      setResetEmail('');
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (showResetForm) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Reset Password
          </CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your.email@practice.com.au"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResetForm(false);
                  setResetEmail('');
                }}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Email'
                )}
              </Button>
            </div>
          </form>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              For security reasons, password reset links are only valid for 1 hour. 
              Healthcare professionals must verify their identity when resetting passwords.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl">Healthcare Professional Sign In</CardTitle>
          </div>
          <CardDescription>
            Access Australia's first AHPRA-compliant content platform
          </CardDescription>
          
          {/* Compliance Badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="outline" className="border-green-500 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              AHPRA Verified
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-700">
              <Shield className="w-3 h-3 mr-1" />
              TGA Compliant
            </Badge>
            <Badge variant="outline" className="border-purple-500 text-purple-700">
              <Users className="w-3 h-3 mr-1" />
              Healthcare Only
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@practice.com.au"
                  className={validationErrors.email ? 'border-red-500' : ''}
                />
                {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowResetForm(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    className={validationErrors.password ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors.password && <p className="text-sm text-red-500">{validationErrors.password}</p>}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In to Healthcare Platform
                </>
              )}
            </Button>

            {/* Sign Up Link */}
            {onSwitchToSignUp && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  New healthcare professional?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToSignUp}
                    className="text-blue-600 hover:underline"
                  >
                    Register here
                  </button>
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Compliance Reminder */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>AHPRA Compliance Reminder:</strong> All content created through this platform is designed to comply with 
          AHPRA advertising guidelines and TGA therapeutic advertising requirements. You are responsible for reviewing 
          all content before publication to ensure it meets your professional standards.
        </AlertDescription>
      </Alert>

      {/* Platform Features */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">What You Get Access To:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✅ AHPRA Compliant Features</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Patient education content generation</li>
                <li>• Practice marketing materials</li>
                <li>• Professional communication templates</li>
                <li>• Real-time compliance checking</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">🛡️ TGA Validated Content</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Therapeutic claim validation</li>
                <li>• Medical device compliance</li>
                <li>• Evidence-based language</li>
                <li>• Professional boundary respect</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Information */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Having trouble? Contact our healthcare support team at{' '}
          <a href="mailto:healthcare@jbsaas.com.au" className="text-blue-600 hover:underline">
            healthcare@jbsaas.com.au
          </a>
        </p>
      </div>
    </div>
  );
}; 