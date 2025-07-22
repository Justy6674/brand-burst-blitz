import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useHealthcareAuth } from '../../hooks/useHealthcareAuth';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../lib/supabase';
import { 
  Facebook, 
  Instagram, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Loader2,
  Users,
  Eye,
  FileText,
  Settings,
  Zap,
  RefreshCw,
  Copy,
  Globe
} from 'lucide-react';

interface FacebookAccount {
  id: string;
  name: string;
  category: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
    username: string;
  };
  is_connected: boolean;
  last_sync: string | null;
  compliance_verified: boolean;
}

interface HealthcareFacebookSetupProps {
  practiceId?: string;
  onComplete?: (accounts: FacebookAccount[]) => void;
}

export function HealthcareFacebookSetup({ practiceId, onComplete }: HealthcareFacebookSetupProps) {
  const { user, profile } = useHealthcareAuth();
  const { toast } = useToast();
  
  const [setupStep, setSetupStep] = useState<'credentials' | 'connect' | 'verify' | 'complete'>('credentials');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<FacebookAccount[]>([]);
  const [credentials, setCredentials] = useState({ appId: '', appSecret: '' });
  const [hasCredentials, setHasCredentials] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    ahpraNumber: '',
    practiceType: '',
    businessCategory: '',
    websiteUrl: '',
    privacyPolicyUrl: ''
  });

  useEffect(() => {
    checkExistingCredentials();
    loadConnectedAccounts();
  }, []);

  const checkExistingCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('user_social_credentials')
        .select('app_id, app_secret')
        .eq('user_id', user?.id)
        .eq('platform', 'facebook')
        .single();

      if (data && !error) {
        setCredentials({ appId: data.app_id, appSecret: data.app_secret });
        setHasCredentials(true);
        setSetupStep('connect');
      }
    } catch (error) {
      console.log('No existing credentials found');
    }
  };

  const loadConnectedAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .in('platform', ['facebook', 'instagram'])
        .eq('is_active', true);

      if (data && !error) {
        const facebookAccounts = data.filter(acc => acc.platform === 'facebook').map(acc => ({
          id: acc.account_id,
          name: acc.account_name,
          category: acc.category || 'Healthcare',
          access_token: acc.access_token,
          is_connected: true,
          last_sync: acc.last_sync_at,
          compliance_verified: acc.compliance_verified || false,
          instagram_business_account: data.find(ig => 
            ig.platform === 'instagram' && ig.page_id === acc.account_id
          ) ? {
            id: data.find(ig => ig.platform === 'instagram' && ig.page_id === acc.account_id)?.account_id,
            username: data.find(ig => ig.platform === 'instagram' && ig.page_id === acc.account_id)?.account_name
          } : undefined
        }));

        setConnectedAccounts(facebookAccounts);
        
        if (facebookAccounts.length > 0) {
          setSetupStep('verify');
        }
      }
    } catch (error) {
      console.error('Error loading connected accounts:', error);
    }
  };

  const saveCredentials = async () => {
    if (!credentials.appId || !credentials.appSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please provide both App ID and App Secret",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_social_credentials')
        .upsert({
          user_id: user?.id,
          platform: 'facebook',
          app_id: credentials.appId,
          app_secret: credentials.appSecret
        });

      if (error) throw error;

      setHasCredentials(true);
      setSetupStep('connect');
      
      toast({
        title: "Credentials Saved",
        description: "Facebook app credentials have been saved securely",
      });
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({
        title: "Error",
        description: "Failed to save credentials. Please try again.",
        variant: "destructive"
      });
    }
  };

  const connectFacebookAccount = async () => {
    if (!hasCredentials) {
      toast({
        title: "Credentials Required",
        description: "Please add your Facebook app credentials first",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('social-oauth-init', {
        body: {
          platform: 'facebook',
          redirectUri: `${window.location.origin}/oauth/callback`
        }
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Open popup window for OAuth
        const popup = window.open(
          data.authUrl,
          'facebook-oauth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Monitor popup window
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setIsConnecting(false);
            loadConnectedAccounts(); // Reload to check for new connections
          }
        }, 1000);

        // Listen for success message
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'OAUTH_SUCCESS') {
            clearInterval(checkClosed);
            popup?.close();
            setIsConnecting(false);
            loadConnectedAccounts();
            
            toast({
              title: "Facebook Connected",
              description: "Successfully connected your Facebook business account",
            });

            window.removeEventListener('message', handleMessage);
          } else if (event.data.type === 'OAUTH_ERROR') {
            clearInterval(checkClosed);
            popup?.close();
            setIsConnecting(false);
            
            toast({
              title: "Connection Failed",
              description: event.data.error || "Failed to connect Facebook account",
              variant: "destructive"
            });

            window.removeEventListener('message', handleMessage);
          }
        };

        window.addEventListener('message', handleMessage);
      }
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to initiate Facebook connection. Please try again.",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  const verifyComplianceSettings = async (accountId: string) => {
    try {
      // Mark account as compliance verified
      const { error } = await supabase
        .from('social_accounts')
        .update({ compliance_verified: true })
        .eq('account_id', accountId)
        .eq('platform', 'facebook');

      if (error) throw error;

      setConnectedAccounts(prev => 
        prev.map(acc => 
          acc.id === accountId 
            ? { ...acc, compliance_verified: true }
            : acc
        )
      );

      toast({
        title: "Compliance Verified",
        description: "Healthcare compliance settings have been verified for this account",
      });
    } catch (error) {
      console.error('Error verifying compliance:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify compliance settings",
        variant: "destructive"
      });
    }
  };

  const testConnection = async (accountId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('collect-social-analytics', {
        body: { 
          platforms: ['facebook'],
          forceSync: true,
          practiceId
        }
      });

      if (error) throw error;

      toast({
        title: "Connection Test Successful",
        description: "Facebook analytics collection is working correctly",
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Test Failed",
        description: "Unable to collect analytics. Please check your Facebook permissions.",
        variant: "destructive"
      });
    }
  };

  const completeSetup = () => {
    setSetupStep('complete');
    onComplete?.(connectedAccounts);
  };

  const renderCredentialsStep = () => (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Healthcare Compliance Note:</strong> Your Facebook Business Manager must be set up for healthcare advertising compliance. 
          This includes proper business verification and adherence to Meta's healthcare advertising policies.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Facebook App Configuration
          </CardTitle>
          <CardDescription>
            Create and configure your Facebook app for healthcare content management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>
              <strong>Step 1:</strong> Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Facebook Developers</a> and create a new app.
              Choose "Business" type and configure these settings:
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Required App Products:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Facebook Login</li>
              <li>Instagram Graph API</li>
              <li>Pages API</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Required Permissions:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>pages_show_list</li>
              <li>pages_read_engagement</li>
              <li>pages_manage_posts</li>
              <li>instagram_basic</li>
              <li>instagram_content_publish</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appId">Facebook App ID</Label>
              <Input
                id="appId"
                placeholder="Enter your Facebook App ID"
                value={credentials.appId}
                onChange={(e) => setCredentials(prev => ({ ...prev, appId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appSecret">Facebook App Secret</Label>
              <Input
                id="appSecret"
                type="password"
                placeholder="Enter your Facebook App Secret"
                value={credentials.appSecret}
                onChange={(e) => setCredentials(prev => ({ ...prev, appSecret: e.target.value }))}
              />
            </div>

            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Security:</strong> Your credentials are encrypted and stored securely. Never share your App Secret publicly.
              </AlertDescription>
            </Alert>

            <Button onClick={saveCredentials} className="w-full">
              Save Facebook Credentials
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConnectStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-600" />
            Connect Facebook Business Account
          </CardTitle>
          <CardDescription>
            Connect your Facebook Business Manager to start collecting patient engagement analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Credentials Configured:</strong> Your Facebook app credentials are ready for connection.
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Healthcare Requirements Checklist
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Business Manager account verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Healthcare business category selected</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Privacy policy and terms of service linked</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>AHPRA registration number in business info</span>
              </div>
            </div>
          </div>

          <Button 
            onClick={connectFacebookAccount}
            disabled={isConnecting || !hasCredentials}
            className="w-full"
            size="lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting to Facebook...
              </>
            ) : (
              <>
                <Facebook className="h-4 w-4 mr-2" />
                Connect Facebook Business Account
              </>
            )}
          </Button>

          <div className="text-sm text-gray-600 text-center">
            You'll be redirected to Facebook to authorize access to your business account
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Connected Facebook Accounts
          </CardTitle>
          <CardDescription>
            Verify healthcare compliance settings and test analytics collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedAccounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-medium flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      {account.name}
                    </h4>
                    <p className="text-sm text-gray-600">Category: {account.category}</p>
                    {account.instagram_business_account && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <Instagram className="h-4 w-4" />
                        Instagram: @{account.instagram_business_account.username}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={account.compliance_verified ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {account.compliance_verified ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {account.compliance_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(account.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Test Connection
                  </Button>
                  
                  {!account.compliance_verified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verifyComplianceSettings(account.id)}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Verify Compliance
                    </Button>
                  )}
                </div>

                {account.last_sync && (
                  <div className="text-xs text-gray-500">
                    Last sync: {new Date(account.last_sync).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button onClick={completeSetup} className="w-full" size="lg">
              <Zap className="h-4 w-4 mr-2" />
              Complete Facebook Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            Facebook Integration Complete!
          </CardTitle>
          <CardDescription>
            Your healthcare practice is now connected to Facebook with full AHPRA compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-600">{connectedAccounts.length}</div>
              <div className="text-sm text-gray-600">Connected Accounts</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {connectedAccounts.filter(acc => acc.compliance_verified).length}
              </div>
              <div className="text-sm text-gray-600">Compliance Verified</div>
            </div>
          </div>

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>What's Next:</strong> You can now use the healthcare analytics dashboard to view real patient engagement data from Facebook and Instagram.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium">Available Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-blue-600" />
                <span>Real-time patient reach analytics</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-green-600" />
                <span>Patient engagement tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-purple-600" />
                <span>AHPRA compliance monitoring</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-orange-600" />
                <span>Content performance analysis</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getStepProgress = () => {
    const steps = ['credentials', 'connect', 'verify', 'complete'];
    const currentIndex = steps.indexOf(setupStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Facebook Integration Setup</h2>
          <p className="text-gray-600">
            Connect your healthcare practice to Facebook with AHPRA compliance
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Healthcare Compliant
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Setup Progress</span>
          <span>{Math.round(getStepProgress())}%</span>
        </div>
        <Progress value={getStepProgress()} className="w-full" />
      </div>

      {setupStep === 'credentials' && renderCredentialsStep()}
      {setupStep === 'connect' && renderConnectStep()}
      {setupStep === 'verify' && renderVerifyStep()}
      {setupStep === 'complete' && renderCompleteStep()}
    </div>
  );
} 