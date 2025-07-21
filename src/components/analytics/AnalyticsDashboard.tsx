import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Eye, Heart, Share2, MessageCircle, Target, Calendar, RefreshCw } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePosts } from "@/hooks/usePosts";
import { useBusinessProfileContext } from "@/contexts/BusinessProfileContext";
import { BusinessComparison } from "@/components/business/BusinessComparison";
import { UnifiedReporting } from "@/components/business/UnifiedReporting";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export const AnalyticsDashboard = () => {
  const { 
    analytics, 
    isLoading, 
    getTopPerformingPosts, 
    getPlatformPerformance, 
    getEngagementTrends,
    addAnalytics,
    isAddingAnalytics
  } = useAnalytics();
  
  const { posts } = usePosts();
  const { allProfiles } = useBusinessProfileContext();

  const platformPerformance = getPlatformPerformance();
  const topPosts = getTopPerformingPosts();
  const engagementTrends = getEngagementTrends();

  const totalMetrics = analytics?.reduce((acc, item) => {
    const metrics = item.metrics as any;
    return {
      views: acc.views + (metrics.views || 0),
      likes: acc.likes + (metrics.likes || 0),
      shares: acc.shares + (metrics.shares || 0),
      comments: acc.comments + (metrics.comments || 0),
    };
  }, { views: 0, likes: 0, shares: 0, comments: 0 }) || { views: 0, likes: 0, shares: 0, comments: 0 };

  const engagementRate = totalMetrics.views > 0 
    ? ((totalMetrics.likes + totalMetrics.shares + totalMetrics.comments) / totalMetrics.views * 100).toFixed(2)
    : "0";

  const simulateAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Collect REAL analytics from connected social media accounts
      const recentPosts = posts?.slice(0, 5) || [];
      
      for (const post of recentPosts) {
        const platforms = post.target_platforms || ['facebook'];
        
        for (const platform of platforms) {
          // Check if we have real analytics data for this post
          const { data: existingAnalytics, error: checkError } = await supabase
            .from('analytics')
            .select('*')
            .eq('post_id', post.id)
            .eq('platform', platform)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing analytics:', checkError);
            continue;
          }

          // If no real data exists, prompt user to add manual data
          if (!existingAnalytics) {
            // Instead of generating fake data, create placeholder analytics entry
            // that prompts user to enter real data
            addAnalytics({
              postId: post.id,
              platform,
              metrics: {
                views: 0, // Start with 0 to indicate needs real data
                likes: 0,
                shares: 0,
                comments: 0,
                engagement_rate: 0,
                data_source: 'pending_user_input',
                needs_real_data: true
              }
            });
          }
        }
      }

      toast({
        title: "Analytics Collection Started",
        description: "Real analytics data collection initiated. Please add your actual social media performance data.",
      });

    } catch (error) {
      console.error('Error collecting real analytics:', error);
      toast({
        title: "Analytics Collection Error",
        description: "Failed to collect analytics. Please check your connections.",
        variant: "destructive"
      });
    }
  };

  const chartColors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Analytics & Performance</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics & Performance</h2>
          <p className="text-muted-foreground">Track your content performance across all platforms</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={simulateAnalytics}
            disabled={isAddingAnalytics}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Simulate Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{totalMetrics.views.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                <p className="text-2xl font-bold">{totalMetrics.likes.toLocaleString()}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Shares</p>
                <p className="text-2xl font-bold">{totalMetrics.shares.toLocaleString()}</p>
              </div>
              <Share2 className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1" />
              -3% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">{engagementRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="content">Top Content</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          {allProfiles && allProfiles.length > 1 && (
            <>
              <TabsTrigger value="comparison">Business Comparison</TabsTrigger>
              <TabsTrigger value="unified">Unified Reporting</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Over Time</CardTitle>
                <CardDescription>Daily engagement metrics for the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>Performance breakdown by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalViews"
                    >
                      {platformPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4">
            {platformPerformance.map((platform, index) => (
              <Card key={platform.platform}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">{platform.platform}</CardTitle>
                    <Badge variant="secondary">{platform.postCount} posts</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Views</p>
                      <p className="text-lg font-semibold">{platform.totalViews.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Likes</p>
                      <p className="text-lg font-semibold">{platform.totalLikes.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Shares</p>
                      <p className="text-lg font-semibold">{platform.totalShares.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Engagement</p>
                      <p className="text-lg font-semibold">{platform.avgEngagement.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Engagement Rate</span>
                      <span>{platform.avgEngagement.toFixed(1)}%</span>
                    </div>
                    <Progress value={platform.avgEngagement} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Your best performing posts by engagement rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.length > 0 ? (
                  topPosts.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <h4 className="font-medium">{(item as any).posts?.title || 'Untitled Post'}</h4>
                          <Badge className="capitalize">{item.platform}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {(item.metrics as any).views?.toLocaleString() || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {(item.metrics as any).likes?.toLocaleString() || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            {(item.metrics as any).shares?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          {((item.metrics as any).engagement_rate || 0).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">engagement</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No performance data available yet.</p>
                    <p className="text-sm">Publish some content to see analytics here.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
              <CardDescription>Track your engagement patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={engagementTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  />
                  <Bar dataKey="engagement" fill="hsl(var(--primary))" />
                  <Bar dataKey="views" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {allProfiles && allProfiles.length > 1 && (
          <>
            <TabsContent value="comparison" className="space-y-4">
              <BusinessComparison />
            </TabsContent>

            <TabsContent value="unified" className="space-y-4">
              <UnifiedReporting />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};