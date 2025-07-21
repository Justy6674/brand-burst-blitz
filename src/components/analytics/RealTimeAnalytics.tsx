import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Users, MessageCircle, Heart, Share, RefreshCw } from 'lucide-react';

interface AnalyticsData {
  platform: string;
  metrics: {
    reach: number;
    engagement: number;
    clicks: number;
    shares: number;
    comments: number;
    likes: number;
  };
  posts: number;
  followers: number;
  lastUpdated: string;
}

interface PostPerformance {
  id: string;
  title: string;
  platform: string;
  publishedAt: string;
  metrics: {
    reach: number;
    engagement: number;
    clicks: number;
    likes: number;
    shares: number;
    comments: number;
  };
  hasRealData: boolean;
  dataSource: string;
}

export function RealTimeAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [topPosts, setTopPosts] = useState<PostPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch real analytics data
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('collected_at', { ascending: false });

      if (analyticsError) throw analyticsError;

      // Fetch social accounts for platform data
      const { data: accounts, error: accountsError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (accountsError) throw accountsError;

      // Process analytics data by platform
      const platformData: { [key: string]: AnalyticsData } = {};
      
      accounts?.forEach(account => {
        platformData[account.platform] = {
          platform: account.platform,
          metrics: {
            reach: 0,
            engagement: 0,
            clicks: 0,
            shares: 0,
            comments: 0,
            likes: 0
          },
          posts: 0,
          followers: 0,
          lastUpdated: new Date().toISOString()
        };
      });

      // Aggregate analytics data
      analytics?.forEach(item => {
        if (platformData[item.platform]) {
          const metrics = item.metrics as any;
          platformData[item.platform].metrics.reach += metrics.reach || 0;
          platformData[item.platform].metrics.engagement += metrics.engagement || 0;
          platformData[item.platform].metrics.clicks += metrics.clicks || 0;
          platformData[item.platform].metrics.shares += metrics.shares || 0;
          platformData[item.platform].metrics.comments += metrics.comments || 0;
          platformData[item.platform].metrics.likes += metrics.likes || 0;
          platformData[item.platform].posts += 1;
        }
      });

      setAnalyticsData(Object.values(platformData));

      // Fetch top performing posts with REAL metrics
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          analytics!inner(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(10);

      if (postsError) throw postsError;

      const topPerformingPosts: PostPerformance[] = posts?.map(post => {
        // Calculate REAL engagement from analytics data
        const postAnalytics = post.analytics || [];
        const totalMetrics = postAnalytics.reduce((acc: any, analytics: any) => {
          const metrics = analytics.metrics as any;
          return {
            reach: acc.reach + (metrics.reach || 0),
            engagement: acc.engagement + (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0),
            clicks: acc.clicks + (metrics.clicks || 0),
            likes: acc.likes + (metrics.likes || 0),
            shares: acc.shares + (metrics.shares || 0),
            comments: acc.comments + (metrics.comments || 0)
          };
        }, { reach: 0, engagement: 0, clicks: 0, likes: 0, shares: 0, comments: 0 });

        return {
          id: post.id,
          title: post.title || 'Untitled Post',
          platform: post.target_platforms?.[0] || 'Unknown',
          publishedAt: post.published_at || post.created_at,
          metrics: {
            reach: totalMetrics.reach,
            engagement: totalMetrics.engagement,
            clicks: totalMetrics.clicks,
            likes: totalMetrics.likes,
            shares: totalMetrics.shares,
            comments: totalMetrics.comments
          },
          hasRealData: postAnalytics.length > 0,
          dataSource: postAnalytics.length > 0 ? 'real_analytics' : 'no_data'
        };
      }).filter(post => post.hasRealData) // Only show posts with real data
      .sort((a, b) => b.metrics.engagement - a.metrics.engagement) // Sort by real engagement
      .slice(0, 5) || []; // Top 5 real performers

      setTopPosts(topPerformingPosts);

    } catch (error: any) {
      console.error('Analytics fetch error:', error);
      toast({
        title: "Analytics Error",
        description: "Failed to fetch analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Trigger analytics collection
      const { error } = await supabase.functions.invoke('collect-social-analytics', {
        body: { userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "Analytics Updated",
        description: "Fresh analytics data has been collected"
      });

      // Wait a moment then fetch fresh data
      setTimeout(() => {
        fetchAnalytics();
      }, 2000);

    } catch (error: any) {
      console.error('Refresh error:', error);
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh analytics",
        variant: "destructive"
      });
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getTotalMetrics = () => {
    return analyticsData.reduce((total, platform) => ({
      reach: total.reach + platform.metrics.reach,
      engagement: total.engagement + platform.metrics.engagement,
      clicks: total.clicks + platform.metrics.clicks,
      followers: total.followers + platform.followers
    }), { reach: 0, engagement: 0, clicks: 0, followers: 0 });
  };

  const totalMetrics = getTotalMetrics();

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Real-Time Analytics</h2>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Updating...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                <p className="text-2xl font-bold">{totalMetrics.reach.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">{totalMetrics.engagement.toLocaleString()}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clicks</p>
                <p className="text-2xl font-bold">{totalMetrics.clicks.toLocaleString()}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Followers</p>
                <p className="text-2xl font-bold">{totalMetrics.followers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No connected social accounts found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Connect your social media accounts to see analytics data.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyticsData.map((platform) => (
                <div key={platform.platform} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium capitalize">{platform.platform}</h3>
                      <Badge variant="secondary">{platform.posts} posts</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Updated: {new Date(platform.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Reach</p>
                      <p className="text-lg font-semibold">{platform.metrics.reach.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Engagement</p>
                      <p className="text-lg font-semibold">{platform.metrics.engagement.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="text-lg font-semibold">{platform.metrics.clicks.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {topPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No published posts found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create and publish posts to see performance data.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {topPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{post.title}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize">{post.platform}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>{post.metrics.reach}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>{post.metrics.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span>{post.metrics.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share className="h-4 w-4 text-green-500" />
                      <span>{post.metrics.shares}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}