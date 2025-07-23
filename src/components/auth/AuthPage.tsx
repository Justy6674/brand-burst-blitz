import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Sparkles, Shield, Zap } from 'lucide-react';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

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
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before logging in.');
        } else {
          setError(error.message);
        }
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

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([
          {
            email,
            business_name: businessName,
          }
        ]);

      if (error) {
        if (error.message.includes('duplicate key')) {
          setError('This email is already on our waitlist!');
        } else {
          setError(error.message);
        }
        return;
      }

      setWaitlistSuccess(true);
      toast({
        title: "Welcome to the waitlist!",
        description: "We'll notify you when JB-SaaS is ready for your business.",
      });

      // Clear form
      setEmail('');
      setBusinessName('');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
      
      <div className="relative w-full max-w-md">
        {/* Back to Home Link */}
        <Link 
          to="/" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="glass-strong border-white/10">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gradient-primary">
              Welcome to JB-SaaS
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              AI-powered content automation for your business
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="font-medium">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="waitlist" className="font-medium">
                  Join Waitlist
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mb-4 border-destructive/50 bg-destructive/10">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:scale-105 transition-all"
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
              </TabsContent>

              <TabsContent value="waitlist" className="space-y-4">
                {waitlistSuccess ? (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">You're on the list!</h3>
                      <p className="text-muted-foreground">
                        We'll notify you as soon as JB-SaaS is ready for your business.
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        setWaitlistSuccess(false);
                        setActiveTab('login');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleWaitlist} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="waitlist-business-name">Business Name</Label>
                      <Input
                        id="waitlist-business-name"
                        type="text"
                        placeholder="Your business name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        className="bg-background/50 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waitlist-email">Email</Label>
                      <Input
                        id="waitlist-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background/50 border-white/10"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:scale-105 transition-all"
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
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('login')}
                          className="text-primary hover:underline"
                        >
                          Sign in here
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="glass p-4 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">AI Content</p>
          </div>
          <div className="glass p-4 rounded-lg">
            <Zap className="h-6 w-6 text-secondary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Auto Posting</p>
          </div>
          <div className="glass p-4 rounded-lg">
            <Shield className="h-6 w-6 text-success mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Compliance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;