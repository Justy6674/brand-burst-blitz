import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type SocialAccount = Tables<'social_accounts'>;
type PublishingQueue = Tables<'publishing_queue'>;

interface SocialMediaPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  isConnected: boolean;
  account?: SocialAccount;
}

interface UseSocialMediaReturn {
  platforms: SocialMediaPlatform[];
  publishingQueue: PublishingQueue[];
  isLoading: boolean;
  error: string | null;
  connectPlatform: (platform: string, accountData: Partial<SocialAccount>) => Promise<boolean>;
  disconnectPlatform: (accountId: string) => Promise<boolean>;
  schedulePost: (postId: string, platformId: string, scheduledFor: string) => Promise<boolean>;
  publishNow: (postId: string, platformId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const useSocialMedia = (): UseSocialMediaReturn => {
  const [platforms, setPlatforms] = useState<SocialMediaPlatform[]>([
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'blue', isConnected: false },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'pink', isConnected: false },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'blue', isConnected: false },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: 'blue', isConnected: false },
  ]);
  const [publishingQueue, setPublishingQueue] = useState<PublishingQueue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSocialAccounts = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Fetch connected social accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (accountsError) {
        console.error('Error fetching social accounts:', accountsError);
        setError(accountsError.message);
        return;
      }

      // Fetch publishing queue
      const { data: queue, error: queueError } = await supabase
        .from('publishing_queue')
        .select(`
          *,
          posts (*)
        `)
        .order('scheduled_for', { ascending: true });

      if (queueError) {
        console.error('Error fetching publishing queue:', queueError);
        // Don't fail completely if queue fetch fails
      }

      // Update platforms with connection status
      setPlatforms(prevPlatforms => 
        prevPlatforms.map(platform => {
          const account = accounts?.find(acc => acc.platform === platform.id);
          return {
            ...platform,
            isConnected: !!account,
            account: account || undefined,
          };
        })
      );

      setPublishingQueue(queue || []);
    } catch (err: any) {
      console.error('Unexpected error fetching social media data:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const connectPlatform = async (platform: string, accountData: Partial<SocialAccount>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .insert({
          platform: platform as any,
          user_id: user.id,
          account_id: accountData.account_id!,
          account_name: accountData.account_name,
          access_token: accountData.access_token!,
          refresh_token: accountData.refresh_token,
          expires_at: accountData.expires_at,
          page_id: accountData.page_id,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error connecting platform:', error);
        toast({
          title: 'Failed to connect platform',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      // Update platforms state
      setPlatforms(prev => prev.map(p => 
        p.id === platform 
          ? { ...p, isConnected: true, account: data }
          : p
      ));

      toast({
        title: 'Platform connected',
        description: `${platform} has been connected successfully.`,
      });

      return true;
    } catch (err: any) {
      console.error('Unexpected error connecting platform:', err);
      toast({
        title: 'Failed to connect platform',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const disconnectPlatform = async (accountId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ is_active: false })
        .eq('id', accountId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error disconnecting platform:', error);
        toast({
          title: 'Failed to disconnect platform',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      // Update platforms state
      setPlatforms(prev => prev.map(p => 
        p.account?.id === accountId 
          ? { ...p, isConnected: false, account: undefined }
          : p
      ));

      toast({
        title: 'Platform disconnected',
        description: 'Platform has been disconnected successfully.',
      });

      return true;
    } catch (err: any) {
      console.error('Unexpected error disconnecting platform:', err);
      toast({
        title: 'Failed to disconnect platform',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const schedulePost = async (postId: string, platformId: string, scheduledFor: string): Promise<boolean> => {
    try {
      const platform = platforms.find(p => p.id === platformId);
      if (!platform?.account) {
        toast({
          title: 'Platform not connected',
          description: `Please connect ${platform?.name || platformId} first.`,
          variant: 'destructive',
        });
        return false;
      }

      const { data, error } = await supabase
        .from('publishing_queue')
        .insert({
          post_id: postId,
          social_account_id: platform.account.id,
          scheduled_for: scheduledFor,
          status: 'scheduled',
          attempt_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error scheduling post:', error);
        toast({
          title: 'Failed to schedule post',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      setPublishingQueue(prev => [...prev, data]);
      toast({
        title: 'Post scheduled',
        description: `Post scheduled for ${new Date(scheduledFor).toLocaleString()}.`,
      });

      return true;
    } catch (err: any) {
      console.error('Unexpected error scheduling post:', err);
      toast({
        title: 'Failed to schedule post',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const publishNow = async (postId: string, platformId: string): Promise<boolean> => {
    try {
      const platform = platforms.find(p => p.id === platformId);
      if (!platform?.account) {
        toast({
          title: 'Platform not connected',
          description: `Please connect ${platform?.name || platformId} first.`,
          variant: 'destructive',
        });
        return false;
      }

      // For now, we'll simulate publishing by adding to queue with immediate schedule
      const scheduledFor = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('publishing_queue')
        .insert({
          post_id: postId,
          social_account_id: platform.account.id,
          scheduled_for: scheduledFor,
          status: 'published',
          attempt_count: 1,
          published_post_id: `sim_${Date.now()}`, // Simulated published ID
        })
        .select()
        .single();

      if (error) {
        console.error('Error publishing post:', error);
        toast({
          title: 'Failed to publish post',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      setPublishingQueue(prev => [...prev, data]);
      toast({
        title: 'Post published',
        description: `Post published to ${platform.name} successfully.`,
      });

      return true;
    } catch (err: any) {
      console.error('Unexpected error publishing post:', err);
      toast({
        title: 'Failed to publish post',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSocialAccounts();
  }, [user]);

  return {
    platforms,
    publishingQueue,
    isLoading,
    error,
    connectPlatform,
    disconnectPlatform,
    schedulePost,
    publishNow,
    refetch: fetchSocialAccounts,
  };
};