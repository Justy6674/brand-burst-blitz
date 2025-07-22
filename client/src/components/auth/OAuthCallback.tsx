import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/common/LoadingState';

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const platform = searchParams.get('platform') || 'facebook'; // Default platform

      if (error) {
        toast({
          title: 'Authentication failed',
          description: `Error: ${error}`,
          variant: 'destructive',
        });
        navigate('/social-media');
        return;
      }

      if (!code || !state) {
        toast({
          title: 'Authentication failed',
          description: 'Missing authorization code or state',
          variant: 'destructive',
        });
        navigate('/social-media');
        return;
      }

      try {
        // Call the OAuth callback edge function
        const { data, error: callbackError } = await supabase.functions.invoke('social-oauth-callback', {
          body: {
            code,
            state,
            platform
          }
        });

        if (callbackError) {
          throw new Error(callbackError.message);
        }

        if (data.success) {
          toast({
            title: 'Account connected',
            description: `${platform} account connected successfully!`,
          });
        } else {
          throw new Error(data.error || 'Failed to connect account');
        }
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        toast({
          title: 'Connection failed',
          description: error.message || 'Failed to connect your account',
          variant: 'destructive',
        });
      } finally {
        navigate('/social-media');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingState />
        <p className="text-muted-foreground">
          Connecting your social media account...
        </p>
      </div>
    </div>
  );
};