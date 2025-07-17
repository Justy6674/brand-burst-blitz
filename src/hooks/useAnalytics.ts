import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export interface AnalyticsMetrics {
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  clicks?: number;
  impressions?: number;
  reach?: number;
  engagement_rate?: number;
}

export interface AnalyticsData {
  id: string;
  post_id: string | null;
  platform: string | null;
  metrics: AnalyticsMetrics;
  collected_at: string | null;
  user_id: string | null;
}

export const useAnalytics = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .order('collected_at', { ascending: false });

      if (error) throw error;
      return data as AnalyticsData[];
    },
  });

  const { data: performanceData, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['analytics-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics')
        .select(`
          *,
          posts!inner(title, type, published_at)
        `)
        .order('collected_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const addAnalyticsMutation = useMutation({
    mutationFn: async ({
      postId,
      platform,
      metrics,
    }: {
      postId?: string;
      platform?: string;
      metrics: AnalyticsMetrics;
    }) => {
      const { data, error } = await supabase
        .from('analytics')
        .insert({
          post_id: postId || null,
          platform: platform as Database['public']['Enums']['social_platform'] || null,
          metrics: metrics as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-performance'] });
      toast({
        title: "Analytics Updated",
        description: "Performance metrics have been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record analytics data.",
        variant: "destructive",
      });
      console.error('Analytics error:', error);
    },
  });

  const getTopPerformingPosts = () => {
    if (!performanceData) return [];
    
    return performanceData
      .filter(item => item.posts && (item.metrics as AnalyticsMetrics).engagement_rate)
      .sort((a, b) => {
        const aRate = (a.metrics as AnalyticsMetrics).engagement_rate || 0;
        const bRate = (b.metrics as AnalyticsMetrics).engagement_rate || 0;
        return bRate - aRate;
      })
      .slice(0, 10);
  };

  const getPlatformPerformance = () => {
    if (!analytics) return [];

    const platformStats = analytics.reduce((acc, item) => {
      if (!item.platform) return acc;
      
      if (!acc[item.platform]) {
        acc[item.platform] = {
          platform: item.platform,
          totalViews: 0,
          totalLikes: 0,
          totalShares: 0,
          totalComments: 0,
          avgEngagement: 0,
          postCount: 0,
        };
      }

      const metrics = item.metrics as AnalyticsMetrics;
      acc[item.platform].totalViews += metrics.views || 0;
      acc[item.platform].totalLikes += metrics.likes || 0;
      acc[item.platform].totalShares += metrics.shares || 0;
      acc[item.platform].totalComments += metrics.comments || 0;
      acc[item.platform].postCount += 1;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(platformStats).map((platform: any) => ({
      ...platform,
      avgEngagement: platform.postCount > 0 
        ? ((platform.totalLikes + platform.totalShares + platform.totalComments) / platform.totalViews) * 100 
        : 0,
    }));
  };

  const getEngagementTrends = () => {
    if (!analytics) return [];

    const last30Days = analytics
      .filter(item => {
        if (!item.collected_at) return false;
        const date = new Date(item.collected_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return date >= thirtyDaysAgo;
      })
      .sort((a, b) => new Date(a.collected_at!).getTime() - new Date(b.collected_at!).getTime());

    const dailyStats = last30Days.reduce((acc, item) => {
      const date = new Date(item.collected_at!).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          engagement: 0,
          views: 0,
          posts: 0,
        };
      }

      const metrics = item.metrics as AnalyticsMetrics;
      acc[date].engagement += (metrics.likes || 0) + (metrics.shares || 0) + (metrics.comments || 0);
      acc[date].views += metrics.views || 0;
      acc[date].posts += 1;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(dailyStats);
  };

  return {
    analytics,
    performanceData,
    isLoading,
    isLoadingPerformance,
    error,
    addAnalytics: addAnalyticsMutation.mutate,
    isAddingAnalytics: addAnalyticsMutation.isPending,
    getTopPerformingPosts,
    getPlatformPerformance,
    getEngagementTrends,
  };
};