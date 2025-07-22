import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Eye, Heart, Share2, MessageCircle, Target, Building2, Calendar, Download, Filter } from "lucide-react";
import { useBusinessProfileContext } from '@/contexts/BusinessProfileContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePosts } from '@/hooks/usePosts';
import { format, subDays } from 'date-fns';

export const UnifiedReporting = () => {
  const { allProfiles } = useBusinessProfileContext();
  const { analytics } = useAnalytics();
  const { posts } = usePosts();
  const [selectedPeriod, setSelectedPeriod] = React.useState('30');
  const [selectedBusinesses, setSelectedBusinesses] = React.useState<string[]>([]);

  // Get data for all businesses or selected ones
  const getUnifiedData = () => {
    const businessesToAnalyze = selectedBusinesses.length > 0 
      ? selectedBusinesses 
      : allProfiles?.map(p => p.id) || [];

    const periodStart = subDays(new Date(), parseInt(selectedPeriod));
    
    const unifiedData = businessesToAnalyze.map(businessId => {
      const business = allProfiles?.find(p => p.id === businessId);
      const businessPosts = posts?.filter(post => 
        post.business_profile_id === businessId &&
        post.created_at && new Date(post.created_at) >= periodStart
      ) || [];
      
      const businessAnalytics = analytics?.filter(analytic => {
        if (!analytic.collected_at) return false;
        if (new Date(analytic.collected_at) < periodStart) return false;
        const post = businessPosts.find(p => p.id === analytic.post_id);
        return post?.business_profile_id === businessId;
      }) || [];

      const metrics = businessAnalytics.reduce((acc, item) => {
        const metrics = item.metrics as any;
        return {
          views: acc.views + (metrics.views || 0),
          likes: acc.likes + (metrics.likes || 0),
          shares: acc.shares + (metrics.shares || 0),
          comments: acc.comments + (metrics.comments || 0),
        };
      }, { views: 0, likes: 0, shares: 0, comments: 0 });

      const engagementRate = metrics.views > 0 
        ? ((metrics.likes + metrics.shares + metrics.comments) / metrics.views * 100)
        : 0;

      return {
        id: businessId,
        name: business?.business_name || 'Unknown Business',
        industry: business?.industry || 'general',
        postsCount: businessPosts.length,
        ...metrics,
        engagementRate,
        totalEngagement: metrics.likes + metrics.shares + metrics.comments,
      };
    });

    return unifiedData;
  };

  const unifiedData = getUnifiedData();
  
  // Calculate totals across all businesses
  const totals = unifiedData.reduce((acc, business) => ({
    views: acc.views + business.views,
    likes: acc.likes + business.likes,
    shares: acc.shares + business.shares,
    comments: acc.comments + business.comments,
    posts: acc.posts + business.postsCount,
    businesses: acc.businesses + 1,
  }), { views: 0, likes: 0, shares: 0, comments: 0, posts: 0, businesses: 0 });

  const overallEngagementRate = totals.views > 0 
    ? ((totals.likes + totals.shares + totals.comments) / totals.views * 100)
    : 0;

  // Performance ranking
  const rankedBusinesses = [...unifiedData].sort((a, b) => b.engagementRate - a.engagementRate);

  // Industry breakdown
  const industryData = unifiedData.reduce((acc, business) => {
    const industry = business.industry;
    if (!acc[industry]) {
      acc[industry] = { industry, businesses: 0, totalViews: 0, avgEngagement: 0 };
    }
    acc[industry].businesses += 1;
    acc[industry].totalViews += business.views;
    return acc;
  }, {} as Record<string, any>);

  const industryChartData = Object.values(industryData);

  const chartColors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const toggleBusiness = (businessId: string) => {
    setSelectedBusinesses(prev => 
      prev.includes(businessId) 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Unified Reporting Dashboard</h3>
          <p className="text-muted-foreground">Comprehensive analytics across all your businesses</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Business Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Business Filter
              </CardTitle>
              <CardDescription>Select specific businesses to analyze</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedBusinesses([])}
            >
              Clear Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allProfiles?.map(business => (
              <Badge
                key={business.id}
                variant={selectedBusinesses.includes(business.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleBusiness(business.id)}
              >
                {business.business_name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Businesses</p>
                <p className="text-2xl font-bold">{totals.businesses}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {selectedPeriod} day period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{totals.views.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              Across all businesses
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{totals.posts}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              Content created
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Engagement</p>
                <p className="text-2xl font-bold">{overallEngagementRate.toFixed(1)}%</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              Combined rate
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="industry">Industry Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Business Performance Comparison</CardTitle>
                <CardDescription>Views and engagement across businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={unifiedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="hsl(var(--primary))" name="Views" />
                    <Bar dataKey="totalEngagement" fill="hsl(var(--secondary))" name="Engagement" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Rate Distribution</CardTitle>
                <CardDescription>How well each business engages its audience</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={rankedBusinesses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="engagementRate" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Engagement Rate (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Performance Ranking</CardTitle>
              <CardDescription>Ranked by engagement rate performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankedBusinesses.map((business, index) => (
                  <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{business.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {business.industry} • {business.postsCount} posts
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Views</p>
                          <p className="font-medium">{business.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Engagement</p>
                          <p className="font-medium">{business.totalEngagement.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-primary">
                            {business.engagementRate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">engagement</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="industry" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Industry Distribution</CardTitle>
                <CardDescription>Business count by industry</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={industryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ industry, businesses }) => `${industry} (${businesses})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="businesses"
                    >
                      {industryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Industry Performance</CardTitle>
                <CardDescription>Total views by industry sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={industryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="industry" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalViews" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Summary</CardTitle>
              <CardDescription>Key insights across your business portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Top Performers</h4>
                  {rankedBusinesses.slice(0, 3).map((business, index) => (
                    <div key={business.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="text-sm">{business.name}</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {business.engagementRate.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Growth Opportunities</h4>
                  {rankedBusinesses.slice(-3).reverse().map((business, index) => (
                    <div key={business.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Focus</Badge>
                        <span className="text-sm">{business.name}</span>
                      </div>
                      <span className="text-sm font-medium text-orange-600">
                        {business.engagementRate.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};