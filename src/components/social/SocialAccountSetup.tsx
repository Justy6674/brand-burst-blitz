import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, AlertCircle, CheckCircle2, Loader2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSocialMedia } from '@/hooks/useSocialMedia';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { SocialCredentialsManager } from './SocialCredentialsManager';
import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter
} from 'lucide-react';

export const SocialAccountSetup = () => {
  const { toast } = useToast();
  const { platforms, connectPlatform, refetch } = useSocialMedia();
  const { profile } = useBusinessProfile();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [userCredentials, setUserCredentials] = useState<Record<string, boolean>>({});

  const socialPlatforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: '#1877F2',
      description: 'Connect your Facebook Page to publish posts and stories',
      setupGuide: 'https://developers.facebook.com/docs/facebook-login'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: '#0A66C2',
      description: 'Connect your LinkedIn profile or company page',
      setupGuide: 'https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow'
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: Twitter,
      color: '#000000',
      description: 'Connect your Twitter/X account for real-time updates',
      setupGuide: 'https://developer.twitter.com/en/docs/authentication/oauth-2-0'
    }
  ];

  useEffect(() => {
    // Check which platforms have user credentials
    if (profile?.user_id) {
      checkUserCredentials();
    }
  }, [profile?.user_id]);

  useEffect(() => {
    // Listen for OAuth callback messages
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'OAUTH_SUCCESS') {
        setConnecting(null);
        refetch();
        toast({
          title: "Success!",
          description: `${event.data.platform} account connected successfully`
        });
      } else if (event.data.type === 'OAUTH_ERROR') {
        setConnecting(null);
        toast({
          title: "Connection Failed",
          description: event.data.error || "Failed to connect account",
          variant: "destructive"
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refetch, toast]);

  const checkUserCredentials = async () => {
    if (!profile?.user_id) return;

    try {
      const { data, error } = await supabase
        .from('user_social_credentials')
        .select('platform')
        .eq('user_id', profile.user_id);

      if (error) throw error;

      const credentialsMap: Record<string, boolean> = {};
      data?.forEach(cred => {
        credentialsMap[cred.platform] = true;
      });

      setUserCredentials(credentialsMap);
    } catch (error) {
      console.error('Error checking credentials:', error);
    }
  };

  const handleConnect = async (platformId: string) => {
    if (!profile?.user_id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to connect social media accounts",
        variant: "destructive"
      });
      return;
    }

    // Check if user has credentials for this platform
    if (!userCredentials[platformId]) {
      toast({
        title: "API Credentials Required",
        description: `Please add your ${platformId} API credentials first in the API Credentials tab`,
        variant: "destructive"
      });
      return;
    }

    setConnecting(platformId);

    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.functions.invoke('social-oauth-init', {
        body: {
          platform: platformId,
          redirectUri
        }
      });

      if (error) throw error;

      // Open OAuth window
      const popup = window.open(
        data.authUrl,
        'oauth',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );

      // Poll for window close
      const pollTimer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(pollTimer);
          setConnecting(null);
        }
      }, 1000);

    } catch (error) {
      console.error('Error initiating OAuth:', error);
      setConnecting(null);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to start connection process",
        variant: "destructive"
      });
    }
  };

  return (
    <Tabs defaultValue="connect" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="connect">Connect Accounts</TabsTrigger>
        <TabsTrigger value="credentials">
          <Settings className="h-4 w-4 mr-2" />
          API Credentials
        </TabsTrigger>
      </TabsList>

      <TabsContent value="connect" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Connect Social Media Platforms</h2>
          <p className="text-muted-foreground">
            Connect your social media accounts to enable automated publishing and analytics.
            Make sure you've added your API credentials first.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialPlatforms.map((platform) => {
            const connectedPlatform = platforms.find(p => p.id === platform.id);
            const isConnected = connectedPlatform?.isConnected || false;
            const isConnecting = connecting === platform.id;
            const hasCredentials = userCredentials[platform.id];

            return (
              <Card key={platform.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <platform.icon className="h-5 w-5" style={{ color: platform.color }} />
                      {platform.name}
                    </CardTitle>
                    {isConnected ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : hasCredentials ? (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Ready to Connect
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Needs API Keys
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{platform.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {!hasCredentials ? (
                      <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        Add your {platform.name} API credentials first in the API Credentials tab
                      </div>
                    ) : isConnected ? (
                      <div className="space-y-2">
                        {connectedPlatform?.account && (
                          <div className="text-sm text-muted-foreground">
                            Connected as: <span className="font-medium">{connectedPlatform.account.account_name}</span>
                          </div>
                        )}
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleConnect(platform.id)}
                          disabled={isConnecting}
                        >
                          {isConnecting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Reconnecting...
                            </>
                          ) : (
                            'Reconnect Account'
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleConnect(platform.id)}
                        disabled={isConnecting || !hasCredentials}
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            Connect {platform.name}
                          </>
                        )}
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={platform.setupGuide} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Setup Guide
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="credentials">
        <SocialCredentialsManager />
      </TabsContent>
    </Tabs>
  );
};