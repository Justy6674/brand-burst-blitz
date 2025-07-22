import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Globe,
  Target,
  Eye,
  MousePointer,
  Clock,
  Award,
  Zap,
  Activity
} from 'lucide-react';

interface AnalyticsMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

interface CustomerInsight {
  customer: string;
  blogUrl: string;
  visitors: number;
  posts: number;
  engagement: number;
  revenue: number;
}

const BusinessIntelligenceDashboard = () => {
  const { toast } = useToast();
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const overallMetrics: AnalyticsMetric[] = [
    {
      label: 'Total Revenue',
      value: '$47,250',
      change: 23.1,
      trend: 'up',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: 'Active Customers',
      value: 127,
      change: 12.4,
      trend: 'up',
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Blog Deployments',
      value: 89,
      change: 8.7,
      trend: 'up',
      icon: <Globe className="w-5 h-5" />
    },
    {
      label: 'Avg. Customer Value',
      value: '$372',
      change: 15.2,
      trend: 'up',
      icon: <Target className="w-5 h-5" />
    }
  ];

  const contentMetrics: AnalyticsMetric[] = [
    {
      label: 'Total Page Views',
      value: '2.4M',
      change: 18.5,
      trend: 'up',
      icon: <Eye className="w-5 h-5" />
    },
    {
      label: 'Avg. Engagement Rate',
      value: '4.2%',
      change: 5.7,
      trend: 'up',
      icon: <MousePointer className="w-5 h-5" />
    },
    {
      label: 'Avg. Session Duration',
      value: '3m 24s',
      change: 12.3,
      trend: 'up',
      icon: <Clock className="w-5 h-5" />
    },
    {
      label: 'Content Quality Score',
      value: 8.7,
      change: 3.2,
      trend: 'up',
      icon: <Award className="w-5 h-5" />
    }
  ];

  const topCustomers: CustomerInsight[] = [
    {
      customer: 'TechCorp Solutions',
      blogUrl: 'blog.techcorp.com',
      visitors: 45000,
      posts: 24,
      engagement: 6.8,
      revenue: 899
    },
    {
      customer: 'HealthWell Clinic',
      blogUrl: 'insights.healthwell.com',
      visitors: 32000,
      posts: 18,
      engagement: 7.2,
      revenue: 699
    },
    {
      customer: 'FinanceFirst Advisory',
      blogUrl: 'knowledge.financefirst.com',
      visitors: 28000,
      posts: 16,
      engagement: 5.9,
      revenue: 799
    },
    {
      customer: 'LegalEagle Law Firm',
      blogUrl: 'blog.legaleagle.com',
      visitors: 22000,
      posts: 20,
      engagement: 8.1,
      revenue: 999
    },
    {
      customer: 'FitLife Gym Chain',
      blogUrl: 'tips.fitlife.com',
      visitors: 19000,
      posts: 22,
      engagement: 9.3,
      revenue: 499
    }
  ];

  const industryTrends = [
    {
      industry: 'Healthcare',
      growth: 34.2,
      avgRevenue: 756,
      topTopics: ['Mental Health', 'Preventive Care', 'Telehealth']
    },
    {
      industry: 'Technology',
      growth: 28.7,
      avgRevenue: 892,
      topTopics: ['AI & Automation', 'Cybersecurity', 'Remote Work']
    },
    {
      industry: 'Finance',
      growth: 21.4,
      avgRevenue: 834,
      topTopics: ['Digital Banking', 'Investment Strategies', 'Compliance']
    },
    {
      industry: 'Legal',
      growth: 18.9,
      avgRevenue: 945,
      topTopics: ['Data Privacy', 'Corporate Law', 'Litigation Trends']
    }
  ];

  const handleExportReport = () => {
    toast({
      title: "Report Generated",
      description: "Business intelligence report has been exported to your downloads folder."
    });
  };

  const handleScheduleReport = () => {
    toast({
      title: "Report Scheduled",
      description: "You'll receive automated monthly business intelligence reports via email."
    });
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Business Intelligence</h1>
            <p className="text-muted-foreground">Cross-customer insights and revenue analytics</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <Button onClick={handleExportReport} variant="outline">
              Export Report
            </Button>
            <Button onClick={handleScheduleReport}>
              Schedule Reports
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customers">Top Customers</TabsTrigger>
            <TabsTrigger value="content">Content Analytics</TabsTrigger>
            <TabsTrigger value="trends">Industry Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overallMetrics.map((metric, index) => (
                <Card key={index} className="transition-all duration-300 hover:shadow-elegant">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {metric.icon}
                        <span className="text-sm font-medium">{metric.label}</span>
                      </div>
                      {getTrendIcon(metric.trend)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                      <div className={`text-sm flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                        <span>{metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}
                        {Math.abs(metric.change)}%</span>
                        <span className="text-muted-foreground">vs last period</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Revenue Tracking Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Revenue by Blog Deployment
                </CardTitle>
                <CardDescription>Monthly recurring revenue per customer blog</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.slice(0, 5).map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{customer.customer}</div>
                        <div className="text-sm text-muted-foreground">{customer.blogUrl}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground">${customer.revenue}</div>
                          <div className="text-xs text-muted-foreground">Monthly</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{customer.visitors.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Visitors</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{customer.engagement}%</div>
                          <div className="text-xs text-muted-foreground">Engagement</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Customer Performance Ranking
                </CardTitle>
                <CardDescription>Detailed analytics for all customer blog deployments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <Card key={index} className="border border-muted">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{customer.customer}</h3>
                            <p className="text-sm text-muted-foreground">{customer.blogUrl}</p>
                          </div>
                          <Badge variant={index < 2 ? "default" : "secondary"} className="px-3 py-1">
                            #{index + 1} Customer
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-xl font-bold text-primary">{customer.visitors.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Monthly Visitors</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-xl font-bold text-primary">{customer.posts}</div>
                            <div className="text-sm text-muted-foreground">Posts Published</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-xl font-bold text-primary">{customer.engagement}%</div>
                            <div className="text-sm text-muted-foreground">Engagement Rate</div>
                          </div>
                          <div className="text-center p-3 bg-primary/10 rounded-lg">
                            <div className="text-xl font-bold text-primary">${customer.revenue}</div>
                            <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Analytics Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contentMetrics.map((metric, index) => (
                <Card key={index} className="transition-all duration-300 hover:shadow-elegant">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {metric.icon}
                        <span className="text-sm font-medium">{metric.label}</span>
                      </div>
                      {getTrendIcon(metric.trend)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                      <div className={`text-sm flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                        <span>{metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}
                        {Math.abs(metric.change)}%</span>
                        <span className="text-muted-foreground">vs last period</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Content Types</CardTitle>
                  <CardDescription>Content categories driving the most engagement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { type: 'How-to Guides', performance: 94, engagement: '8.2%' },
                    { type: 'Case Studies', performance: 87, engagement: '7.1%' },
                    { type: 'Industry News', performance: 82, engagement: '6.4%' },
                    { type: 'Thought Leadership', performance: 76, engagement: '5.8%' },
                    { type: 'Product Updates', performance: 71, engagement: '5.2%' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.type}</span>
                        <span className="text-muted-foreground">{item.engagement} avg engagement</span>
                      </div>
                      <Progress value={item.performance} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cross-Customer Content Insights</CardTitle>
                  <CardDescription>Popular topics across all customer blogs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { topic: 'AI & Automation', mentions: 156, growth: '+28%' },
                    { topic: 'Digital Transformation', mentions: 142, growth: '+22%' },
                    { topic: 'Customer Experience', mentions: 134, growth: '+19%' },
                    { topic: 'Data Security', mentions: 128, growth: '+31%' },
                    { topic: 'Remote Work Solutions', mentions: 118, growth: '+15%' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium text-foreground">{item.topic}</div>
                        <div className="text-sm text-muted-foreground">{item.mentions} mentions</div>
                      </div>
                      <div className="text-sm font-medium text-green-600">{item.growth}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Industry Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Industry Growth Analysis
                </CardTitle>
                <CardDescription>Performance trends across different industry verticals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {industryTrends.map((industry, index) => (
                    <Card key={index} className="border border-muted">
                      <CardHeader>
                        <CardTitle className="text-lg">{industry.industry}</CardTitle>
                        <CardDescription>Average customer performance in this sector</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-2xl font-bold text-green-600">+{industry.growth}%</div>
                            <div className="text-sm text-green-700">Growth Rate</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">${industry.avgRevenue}</div>
                            <div className="text-sm text-blue-700">Avg Revenue</div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Top Topics</h4>
                          <div className="flex flex-wrap gap-2">
                            {industry.topTopics.map((topic, topicIndex) => (
                              <Badge key={topicIndex} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aggregated Data Insights</CardTitle>
                <CardDescription>Key findings from cross-customer analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                    <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Content Velocity</h3>
                    <p className="text-sm text-muted-foreground">
                      Customers posting 2+ times per week see 34% higher engagement rates
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-green-100 to-green-50 rounded-lg">
                    <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Revenue Correlation</h3>
                    <p className="text-sm text-muted-foreground">
                      Blog engagement directly correlates with 23% increase in customer revenue
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                    <Award className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">Success Pattern</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-generated content with human editing performs 41% better than manual content
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessIntelligenceDashboard;