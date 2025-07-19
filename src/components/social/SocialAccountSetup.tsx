import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { SocialCredentialsManager } from './SocialCredentialsManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Linkedin, Twitter } from 'lucide-react';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  connected: boolean;
  accountData?: any;
}

export function SocialAccountSetup() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      connected: false
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700',
      connected: false
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      icon: Twitter,
      color: 'bg-gray-900',
      connected: false
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const { toast } = useToast();

  // Listen for OAuth callback messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'OAUTH_SUCCESS') {
        const { platform, account } = event.data;
        setPlatforms(prev => prev.map(p => 
          p.id === platform 
            ? { ...p, connected: true, accountData: account }
            : p
        ));
        toast({
          title: "Account Connected",
          description: `Successfully connected ${account.name} to ${platform}`,
        });
        checkUserCredentials();
      } else if (event.data.type === 'OAUTH_ERROR') {
        toast({
          title: "Connection Failed",
          description: event.data.error,
          variant: "destructive"
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast]);

  const checkUserCredentials = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_social_credentials')
        .select('platform')
        .eq('user_id', user.id);

      if (error) throw error;
      setHasCredentials(data && data.length > 0);
    } catch (error) {
      console.error('Error checking credentials:', error);
    }
  };

  const handleConnect = async (platformId: string) => {
    if (!hasCredentials) {
      toast({
        title: "API Credentials Required",
        description: "Please add your API credentials in the API Credentials tab first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const redirectUri = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.functions.invoke('social-oauth-init', {
        body: {
          platform: platformId,
          redirectUri
        }
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Open popup window for OAuth
        const popup = window.open(
          data.authUrl,
          'oauth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Monitor popup window
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setLoading(false);
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error('OAuth error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to initiate OAuth flow",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserCredentials();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Media Account Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="connect" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connect">Connect Accounts</TabsTrigger>
              <TabsTrigger value="credentials">API Credentials</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connect" className="space-y-4">
              {!hasCredentials && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-amber-800 text-sm">
                    ⚠️ You need to add your API credentials in the "API Credentials" tab before you can connect social media accounts.
                  </p>
                </div>
              )}
              
              <div className="grid gap-4">
                {platforms.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <Card key={platform.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{platform.name}</h3>
                            {platform.connected && platform.accountData && (
                              <p className="text-sm text-muted-foreground">
                                Connected as {platform.accountData.name}
                              </p>
                            )}
                          </div>
                          {platform.connected && (
                            <Badge variant="secondary" className="ml-2">
                              Connected
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {platform.connected ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Handle disconnect
                                setPlatforms(prev => prev.map(p => 
                                  p.id === platform.id 
                                    ? { ...p, connected: false, accountData: undefined }
                                    : p
                                ));
                              }}
                            >
                              Disconnect
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleConnect(platform.id)}
                              disabled={loading || !hasCredentials}
                              size="sm"
                            >
                              {loading ? 'Connecting...' : 'Connect'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="credentials">
              <SocialCredentialsManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}