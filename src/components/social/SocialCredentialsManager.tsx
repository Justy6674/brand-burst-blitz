import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Save, Trash2, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';

interface SocialCredentials {
  platform: string;
  app_id: string;
  app_secret: string;
}

export const SocialCredentialsManager = () => {
  const { toast } = useToast();
  const { profile } = useBusinessProfile();
  const [credentials, setCredentials] = useState<Record<string, SocialCredentials>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      appIdLabel: 'App ID',
      appSecretLabel: 'App Secret',
      docsUrl: 'https://developers.facebook.com/docs/development/create-an-app/',
      description: 'Required for posting to Facebook Pages. You need to create a Facebook app and get it reviewed for pages_manage_posts permission.'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      appIdLabel: 'Client ID',
      appSecretLabel: 'Client Secret',
      docsUrl: 'https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow',
      description: 'Required for posting to LinkedIn. You need to create a LinkedIn app with w_member_social permission.'
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      appIdLabel: 'Client ID',
      appSecretLabel: 'Client Secret',
      docsUrl: 'https://developer.twitter.com/en/portal/dashboard',
      description: 'Required for posting to Twitter/X. Create an app in the Twitter Developer Portal with read and write permissions.'
    }
  ];

  useEffect(() => {
    if (profile?.user_id) {
      fetchCredentials();
    }
  }, [profile?.user_id]);

  const fetchCredentials = async () => {
    if (!profile?.user_id) return;

    try {
      const { data, error } = await supabase
        .from('user_social_credentials')
        .select('platform, app_id, app_secret')
        .eq('user_id', profile.user_id);

      if (error) throw error;

      const credentialsMap: Record<string, SocialCredentials> = {};
      data?.forEach(cred => {
        credentialsMap[cred.platform] = {
          platform: cred.platform,
          app_id: cred.app_id,
          app_secret: cred.app_secret
        };
      });

      setCredentials(credentialsMap);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast({
        title: "Error",
        description: "Failed to load your social media credentials",
        variant: "destructive"
      });
    }
  };

  const saveCredentials = async (platform: string, appId: string, appSecret: string) => {
    if (!profile?.user_id) return;

    setSaving(platform);
    try {
      const { error } = await supabase
        .from('user_social_credentials')
        .upsert({
          user_id: profile.user_id,
          platform,
          app_id: appId,
          app_secret: appSecret
        });

      if (error) throw error;

      setCredentials(prev => ({
        ...prev,
        [platform]: { platform, app_id: appId, app_secret: appSecret }
      }));

      toast({
        title: "Success",
        description: `${platforms.find(p => p.id === platform)?.name} credentials saved successfully`
      });
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({
        title: "Error",
        description: "Failed to save credentials",
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const deleteCredentials = async (platform: string) => {
    if (!profile?.user_id) return;

    try {
      const { error } = await supabase
        .from('user_social_credentials')
        .delete()
        .eq('user_id', profile.user_id)
        .eq('platform', platform);

      if (error) throw error;

      setCredentials(prev => {
        const updated = { ...prev };
        delete updated[platform];
        return updated;
      });

      toast({
        title: "Success",
        description: `${platforms.find(p => p.id === platform)?.name} credentials removed`
      });
    } catch (error) {
      console.error('Error deleting credentials:', error);
      toast({
        title: "Error",
        description: "Failed to delete credentials",
        variant: "destructive"
      });
    }
  };

  const PlatformCredentialsForm = ({ platform }: { platform: typeof platforms[0] }) => {
    const [appId, setAppId] = useState(credentials[platform.id]?.app_id || '');
    const [appSecret, setAppSecret] = useState(credentials[platform.id]?.app_secret || '');
    const hasCredentials = !!credentials[platform.id];

    const handleSave = () => {
      if (!appId.trim() || !appSecret.trim()) {
        toast({
          title: "Error",
          description: "Please fill in both fields",
          variant: "destructive"
        });
        return;
      }
      saveCredentials(platform.id, appId.trim(), appSecret.trim());
    };

    const handleDelete = () => {
      deleteCredentials(platform.id);
      setAppId('');
      setAppSecret('');
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {platform.name} API Credentials
          </CardTitle>
          <CardDescription>
            {platform.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${platform.id}-app-id`}>Your {platform.appIdLabel}</Label>
            <Input
              id={`${platform.id}-app-id`}
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder={`Enter your ${platform.appIdLabel}`}
              type="password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${platform.id}-app-secret`}>Your {platform.appSecretLabel}</Label>
            <Input
              id={`${platform.id}-app-secret`}
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
              placeholder={`Enter your ${platform.appSecretLabel}`}
              type="password"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving === platform.id}>
              <Save className="h-4 w-4 mr-2" />
              {saving === platform.id ? 'Saving...' : 'Save Credentials'}
            </Button>
            
            {hasCredentials && (
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
            
            <Button variant="outline" asChild>
              <a href={platform.docsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Developer Docs
              </a>
            </Button>
          </div>

          {hasCredentials && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
              ✓ Credentials configured for {platform.name}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Social Media API Credentials</h2>
        <p className="text-muted-foreground">
          Enter your own social media app credentials. Each platform requires you to create your own developer app
          and get the necessary permissions approved. This ensures your publishing works reliably and isn't affected
          by rate limits or issues with shared credentials.
        </p>
      </div>

      <Tabs defaultValue="facebook" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {platforms.map(platform => (
            <TabsTrigger key={platform.id} value={platform.id}>
              {platform.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {platforms.map(platform => (
          <TabsContent key={platform.id} value={platform.id}>
            <PlatformCredentialsForm platform={platform} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};