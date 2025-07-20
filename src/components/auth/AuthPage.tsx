import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuthErrorHandler } from '@/hooks/useAuthErrorHandler';
import { Loader2, ArrowLeft, Sparkles, Shield, Zap } from 'lucide-react';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleSignInError, handleSignUpError, handlePasswordResetError } = useAuthErrorHandler();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for recovery mode from URL params
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setIsRecoveryMode(true);
    }

    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !isRecoveryMode) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate, searchParams, isRecoveryMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const handledError = handleSignInError(error, { showToast: false });
        setError(handledError.message);
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });

      navigate('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            business_name: businessName,
          }
        }
      });

      if (error) {
        const handledError = handleSignUpError(error, { showToast: false });
        setError(handledError.message);
        return;
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email for a confirmation link.",
      });

      // Switch to login tab after successful signup
      setActiveTab('login');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) {
        const handledError = handlePasswordResetError(error, { showToast: false });
        setError(handledError.message);
        return;
      }

      toast({
        title: "Password reset email sent!",
        description: "Please check your email for instructions to reset your password.",
      });

      setShowResetForm(false);
      setResetEmail('');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        const handledError = handlePasswordResetError(error, { showToast: false });
        setError(handledError.message);
        return;
      }

      toast({
        title: "Password updated successfully!",
        description: "You can now sign in with your new password.",
      });

      setIsRecoveryMode(false);
      navigate('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If in recovery mode, show password update form
  if (isRecoveryMode) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative"
        style={{
          backgroundImage: `url('/lovable-uploads/56e52299-52d9-44f0-ad9f-2f53d33d5c45.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative w-full max-w-md">
          <Card className="backdrop-blur-md bg-white/5 border-white/10 shadow-2xl">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-white">
                Set New Password
              </CardTitle>
              <CardDescription className="text-white/80">
                Please enter your new password below
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-400/30 bg-red-900/10 backdrop-blur-sm">
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-white font-medium">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/15 focus:border-white/30 focus:ring-white/10 text-white placeholder:text-white/60 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password" className="text-white font-medium">Confirm New Password</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/15 focus:border-white/30 focus:ring-white/10 text-white placeholder:text-white/60 backdrop-blur-sm"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-sm border border-white/20 hover:border-white/40"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('/lovable-uploads/56e52299-52d9-44f0-ad9f-2f53d33d5c45.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Smart overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative w-full max-w-md">
        {/* Back to Home Link */}
        <Link 
          to="/" 
          className="inline-flex items-center text-white hover:text-white/80 mb-6 transition-colors backdrop-blur-sm bg-white/10 px-3 py-2 rounded-lg border border-white/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="backdrop-blur-md bg-white/5 border-white/10 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
              <img 
                src="/lovable-uploads/a1f513c9-7ef7-4648-a7fc-8dd53f19335c.png" 
                alt="JB-SaaS Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Welcome to JB-SaaS
            </CardTitle>
            <CardDescription className="text-white/80">
              AI-powered content automation for your business
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 backdrop-blur-sm border border-white/10">
                <TabsTrigger 
                  value="login" 
                  className="font-medium text-white data-[state=active]:bg-white/15 data-[state=active]:text-white"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="font-medium text-white data-[state=active]:bg-white/15 data-[state=active]:text-white"
                >
                  Join Waitlist
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mb-4 border-red-400/30 bg-red-900/10 backdrop-blur-sm">
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="login" className="space-y-4">
                {!showResetForm ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/5 border-white/15 focus:border-white/30 focus:ring-white/10 text-white placeholder:text-white/60 backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password" className="text-white font-medium">Password</Label>
                        <button
                          type="button"
                          onClick={() => setShowResetForm(true)}
                          className="text-sm text-white/60 hover:text-white transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white/5 border-white/15 focus:border-white/30 focus:ring-white/10 text-white placeholder:text-white/60 backdrop-blur-sm"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-sm border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold text-white">Reset Password</h3>
                      <p className="text-sm text-white/70">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email" className="text-white font-medium">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="Enter your email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                          className="bg-white/5 border-white/15 focus:border-white/30 focus:ring-white/10 text-white placeholder:text-white/60 backdrop-blur-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button"
                          onClick={() => {
                            setShowResetForm(false);
                            setResetEmail('');
                            setError('');
                          }}
                          variant="outline"
                          className="flex-1 bg-white/5 border-white/15 text-white hover:bg-white/10 hover:border-white/30"
                        >
                          Back to Login
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-sm border border-white/20 hover:border-white/40"
                          disabled={isLoading}
                        >
                          {isLoading ? (
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
                  </div>
                )}
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name" className="text-white font-medium">Business Name</Label>
                    <Input
                      id="business-name"
                      type="text"
                      placeholder="Your business name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      className="bg-white/5 border-white/15 focus:border-white/30 focus:ring-white/10 text-white placeholder:text-white/60 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white font-medium">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/5 border-white/15 focus:border-white/30 focus:ring-white/10 text-white placeholder:text-white/60 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white font-medium">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/15 focus:border-white/30 focus:ring-white/10 text-white placeholder:text-white/60 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white font-medium">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/15 focus:border-white/30 focus:ring-white/10 text-white placeholder:text-white/60 backdrop-blur-sm"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-sm border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining waitlist...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Join Waitlist
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-sm text-white/80">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="backdrop-blur-sm bg-white/5 p-4 rounded-lg border border-white/10">
            <Sparkles className="h-6 w-6 text-white mx-auto mb-2" />
            <p className="text-xs text-white/90">AI Content</p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 p-4 rounded-lg border border-white/10">
            <Zap className="h-6 w-6 text-white mx-auto mb-2" />
            <p className="text-xs text-white/90">Auto Posting</p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 p-4 rounded-lg border border-white/10">
            <Shield className="h-6 w-6 text-white mx-auto mb-2" />
            <p className="text-xs text-white/90">Compliance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;