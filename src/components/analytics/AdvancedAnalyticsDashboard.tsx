import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Target,
  Calendar,
  Clock,
  Award,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  overview: {
    totalReach: number;
    totalEngagement: number;
    avgEngagementRate: number;
    topPerformingPost: string;
    growthRate: number;
  };
  platformData: Array<{
    platform: string;
    followers: number;
    posts: number;
    engagementRate: number;
    reach: number;
  }>;
  engagementTrends: Array<{
    date: string;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  }>;
  contentPerformance: Array<{
    type: string;
    count: number;
    avgEngagement: number;
    performance: string;
  }>;
  audienceInsights: {
    demographics: Array<{
      category: string;
      value: number;
      percentage: number;
    }>;
    devices: Array<{
      device: string;
      percentage: number;
      color: string;
    }>;
    locations: Array<{
      location: string;
      percentage: number;
      growth: number;
    }>;
  };
}

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedPlatform]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Generate mock analytics data for demonstration
      const mockData: AnalyticsData = {
        overview: {
          totalReach: 125000 + Math.floor(Math.random() * 50000),
          totalEngagement: 8500 + Math.floor(Math.random() * 2000),
          avgEngagementRate: 3.2 + Math.random() * 2,
          topPerformingPost: "Summer Marketing Strategy Tips",
          growthRate: 12.5 + Math.random() * 10
        },
        platformData: [
          {
            platform: 'Instagram',
            followers: 25000 + Math.floor(Math.random() * 10000),
            posts: 45,
            engagementRate: 4.2 + Math.random(),
            reach: 45000 + Math.floor(Math.random() * 15000)
          },
          {
            platform: 'Facebook',
            followers: 18000 + Math.floor(Math.random() * 8000),
            posts: 38,
            engagementRate: 2.8 + Math.random(),
            reach: 32000 + Math.floor(Math.random() * 12000)
          },
          {
            platform: 'LinkedIn',
            followers: 12000 + Math.floor(Math.random() * 5000),
            posts: 28,
            engagementRate: 5.1 + Math.random(),
            reach: 28000 + Math.floor(Math.random() * 10000)
          },
          {
            platform: 'Twitter',
            followers: 15000 + Math.floor(Math.random() * 7000),
            posts: 65,
            engagementRate: 1.9 + Math.random(),
            reach: 22000 + Math.floor(Math.random() * 8000)
          }
        ],
        engagementTrends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          likes: 100 + Math.floor(Math.random() * 200),
          comments: 20 + Math.floor(Math.random() * 40),
          shares: 10 + Math.floor(Math.random() * 30),
          reach: 1000 + Math.floor(Math.random() * 2000)
        })),
        contentPerformance: [
          { type: 'Video', count: 15, avgEngagement: 420, performance: 'Excellent' },
          { type: 'Image', count: 35, avgEngagement: 285, performance: 'Good' },
          { type: 'Carousel', count: 12, avgEngagement: 380, performance: 'Excellent' },
          { type: 'Story', count: 48, avgEngagement: 165, performance: 'Average' },
          { type: 'Reel', count: 22, avgEngagement: 520, performance: 'Excellent' }
        ],
        audienceInsights: {
          demographics: [
            { category: '18-24', value: 2500, percentage: 25 },
            { category: '25-34', value: 3500, percentage: 35 },
            { category: '35-44', value: 2000, percentage: 20 },
            { category: '45-54', value: 1500, percentage: 15 },
            { category: '55+', value: 500, percentage: 5 }
          ],
          devices: [
            { device: 'Mobile', percentage: 75, color: '#8884d8' },
            { device: 'Desktop', percentage: 20, color: '#82ca9d' },
            { device: 'Tablet', percentage: 5, color: '#ffc658' }
          ],
          locations: [
            { location: 'Australia', percentage: 45, growth: 8.2 },
            { location: 'United States', percentage: 25, growth: 5.1 },
            { location: 'United Kingdom', percentage: 15, growth: 12.5 },
            { location: 'Canada', percentage: 10, growth: -2.1 },
            { location: 'Others', percentage: 5, growth: 15.8 }
          ]
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error Loading Analytics",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Average': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceBadgeVariant = (performance: string) => {
    switch (performance) {
      case 'Excellent': return 'default';
      case 'Good': return 'secondary';
      case 'Average': return 'outline';
      default: return 'destructive';
    }
  };

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your social media performance
          </p>
        </div>
        
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalReach)}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{analyticsData.overview.growthRate.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Engagement</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalEngagement)}</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+8.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">{analyticsData.overview.avgEngagementRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+2.1%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Content</p>
                <p className="text-lg font-bold truncate">{analyticsData.overview.topPerformingPost}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="flex items-center mt-2">
              <Zap className="h-4 w-4 text-yellow-600 mr-1" />
              <span className="text-sm text-yellow-600">High performer</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                <p className="text-2xl font-bold">+{analyticsData.overview.growthRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <Clock className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-sm text-muted-foreground">This month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement">Engagement Trends</TabsTrigger>
          <TabsTrigger value="platforms">Platform Performance</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
          <TabsTrigger value="audience">Audience Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends Over Time</CardTitle>
              <CardDescription>
                Track your engagement metrics across all platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData.engagementTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="reach" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="likes" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="comments" stackId="3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="shares" stackId="4" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyticsData.platformData.map((platform, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {platform.platform}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Followers</p>
                      <p className="text-2xl font-bold">{formatNumber(platform.followers)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Posts</p>
                      <p className="text-2xl font-bold">{platform.posts}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Engagement Rate</span>
                      <span className="text-sm font-medium">{platform.engagementRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={platform.engagementRate * 10} />
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reach</p>
                    <p className="text-lg font-semibold">{formatNumber(platform.reach)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance by Type</CardTitle>
              <CardDescription>
                See which content types perform best for your audience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.contentPerformance.map((content, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold">{content.count}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{content.type}</h3>
                        <p className="text-sm text-muted-foreground">
                          Avg. Engagement: {content.avgEngagement}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getPerformanceBadgeVariant(content.performance)}>
                      {content.performance}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.audienceInsights.demographics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.audienceInsights.devices}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percentage }) => `${device}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {analyticsData.audienceInsights.devices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.audienceInsights.locations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Globe className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{location.location}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{location.percentage}%</span>
                        <div className={`flex items-center gap-1 ${location.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {location.growth >= 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          <span className="text-sm">{Math.abs(location.growth).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};