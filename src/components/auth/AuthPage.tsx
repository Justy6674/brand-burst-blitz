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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isAustralianBusiness, setIsAustralianBusiness] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('Sign up is temporarily disabled. JB-SaaS is launching soon - please join our waitlist for early access notifications.');
    return;

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
        if (error.message.includes('User already registered')) {
          setError('An account with this email already exists. Please try logging in instead.');
        } else {
          setError(error.message);
        }
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

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('/lovable-uploads/263fa670-c783-4f19-b63f-1ce967135c7a.png')`,
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
                width="48"
                height="48"
                loading="eager"
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
                  className="font-medium text-white/50 data-[state=active]:bg-red-900/20 data-[state=active]:text-red-200 cursor-not-allowed"
                  disabled
                >
                  Sign Up (Coming Soon)
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
                    <Label htmlFor="password" className="text-white font-medium">Password</Label>
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
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="text-center p-8 bg-red-900/10 rounded-lg border border-red-400/30">
                  <div className="text-4xl mb-4">🚧</div>
                  <h3 className="text-xl font-bold text-white mb-2">Sign Up Temporarily Disabled</h3>
                  <p className="text-white/80 mb-4">
                    JB-SaaS is launching soon! We're putting the finishing touches on our platform.
                  </p>
                  <Button 
                    onClick={() => window.open('mailto:hello@jb-saas.com?subject=Early Access Waitlist&body=Hi JB-SaaS Team,%0A%0AI would like to join the early access waitlist for JB-SaaS.%0A%0ABusiness Name: [Your Business]%0AIndustry: [Your Industry]%0A%0AThanks!')}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-sm border border-white/20"
                  >
                    Join Early Access Waitlist
                  </Button>
                </div>
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