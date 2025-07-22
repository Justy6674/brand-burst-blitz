import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Eye, Heart, Share2, MessageCircle, Target, Building2, Award } from "lucide-react";
import { useBusinessProfileContext } from '@/contexts/BusinessProfileContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePosts } from '@/hooks/usePosts';

export const BusinessComparison = () => {
  const { allProfiles, activeProfile } = useBusinessProfileContext();
  const { analytics } = useAnalytics();
  const { posts } = usePosts();
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>('');

  const getBusinessMetrics = (businessId: string | null) => {
    const businessPosts = posts?.filter(post => post.business_profile_id === businessId) || [];
    const businessAnalytics = analytics?.filter(analytic => {
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
        posts: businessPosts.length,
      };
    }, { views: 0, likes: 0, shares: 0, comments: 0, posts: 0 });

    const engagementRate = metrics.views > 0 
      ? ((metrics.likes + metrics.shares + metrics.comments) / metrics.views * 100)
      : 0;

    return { ...metrics, engagementRate };
  };

  const currentMetrics = getBusinessMetrics(activeProfile?.id || null);
  const selectedMetrics = selectedBusinessId ? getBusinessMetrics(selectedBusinessId) : null;

  const comparisonData = [
    {
      metric: 'Views',
      current: currentMetrics.views,
      selected: selectedMetrics?.views || 0,
      icon: Eye,
      color: 'text-blue-500'
    },
    {
      metric: 'Likes',
      current: currentMetrics.likes,
      selected: selectedMetrics?.likes || 0,
      icon: Heart,
      color: 'text-red-500'
    },
    {
      metric: 'Shares',
      current: currentMetrics.shares,
      selected: selectedMetrics?.shares || 0,
      icon: Share2,
      color: 'text-green-500'
    },
    {
      metric: 'Comments',
      current: currentMetrics.comments,
      selected: selectedMetrics?.comments || 0,
      icon: MessageCircle,
      color: 'text-purple-500'
    },
    {
      metric: 'Posts',
      current: currentMetrics.posts,
      selected: selectedMetrics?.posts || 0,
      icon: Target,
      color: 'text-orange-500'
    },
    {
      metric: 'Engagement Rate',
      current: currentMetrics.engagementRate,
      selected: selectedMetrics?.engagementRate || 0,
      icon: Award,
      color: 'text-yellow-500',
      isPercentage: true
    }
  ];

  const chartData = comparisonData.slice(0, 4).map(item => ({
    metric: item.metric,
    current: item.current,
    selected: item.selected,
  }));

  const selectedBusiness = allProfiles?.find(p => p.id === selectedBusinessId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Business Performance Comparison</h3>
          <p className="text-muted-foreground">Compare performance across your business profiles</p>
        </div>
        <div className="w-64">
          <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
            <SelectTrigger>
              <SelectValue placeholder="Select business to compare" />
            </SelectTrigger>
            <SelectContent>
              {allProfiles?.filter(p => p.id !== activeProfile?.id).map(profile => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.business_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedBusinessId ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Business to Compare</h3>
              <p className="text-muted-foreground">
                Choose another business profile from the dropdown above to see performance comparisons.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Metrics Comparison Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comparisonData.map((item) => {
              const Icon = item.icon;
              const improvement = item.selected > 0 
                ? ((item.current - item.selected) / item.selected * 100) 
                : 0;
              const isImprovement = improvement > 0;

              return (
                <Card key={item.metric}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{item.metric}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div>
                            <p className="text-lg font-bold">
                              {item.isPercentage 
                                ? `${item.current.toFixed(1)}%` 
                                : item.current.toLocaleString()
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">{activeProfile?.business_name}</p>
                          </div>
                          <div className="text-muted-foreground">vs</div>
                          <div>
                            <p className="text-lg font-bold">
                              {item.isPercentage 
                                ? `${item.selected.toFixed(1)}%` 
                                : item.selected.toLocaleString()
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">{selectedBusiness?.business_name}</p>
                          </div>
                        </div>
                      </div>
                      <Icon className={`h-8 w-8 ${item.color}`} />
                    </div>
                    {item.selected > 0 && (
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center text-xs ${
                          isImprovement ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isImprovement ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(improvement).toFixed(1)}% {isImprovement ? 'higher' : 'lower'}
                        </div>
                        <Progress 
                          value={Math.min((item.current / Math.max(item.current, item.selected)) * 100, 100)} 
                          className="w-16" 
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Chart Comparison */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
                <CardDescription>Side-by-side metric comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="current" 
                      fill="hsl(var(--primary))" 
                      name={activeProfile?.business_name || 'Current'} 
                    />
                    <Bar 
                      dataKey="selected" 
                      fill="hsl(var(--secondary))" 
                      name={selectedBusiness?.business_name || 'Selected'} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Rate Comparison</CardTitle>
                <CardDescription>How well each business engages its audience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{activeProfile?.business_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {currentMetrics.engagementRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={currentMetrics.engagementRate} className="h-3" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{selectedBusiness?.business_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {(selectedMetrics?.engagementRate || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={selectedMetrics?.engagementRate || 0} className="h-3" />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Better performing business:</span>
                      <Badge variant={currentMetrics.engagementRate > (selectedMetrics?.engagementRate || 0) ? "default" : "secondary"}>
                        {currentMetrics.engagementRate > (selectedMetrics?.engagementRate || 0) 
                          ? activeProfile?.business_name 
                          : selectedBusiness?.business_name
                        }
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Key takeaways from the comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Strengths of {activeProfile?.business_name}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {comparisonData.map(item => {
                      if (item.current > item.selected) {
                        const improvement = item.selected > 0 
                          ? ((item.current - item.selected) / item.selected * 100) 
                          : 0;
                        return (
                          <li key={item.metric} className="flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            {improvement.toFixed(0)}% higher {item.metric.toLowerCase()}
                          </li>
                        );
                      }
                      return null;
                    }).filter(Boolean)}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Areas for Improvement</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {comparisonData.map(item => {
                      if (item.current < item.selected && item.selected > 0) {
                        const gap = ((item.selected - item.current) / item.selected * 100);
                        return (
                          <li key={item.metric} className="flex items-center gap-2">
                            <TrendingDown className="h-3 w-3 text-red-600" />
                            {gap.toFixed(0)}% behind in {item.metric.toLowerCase()}
                          </li>
                        );
                      }
                      return null;
                    }).filter(Boolean)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};