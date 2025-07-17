import { 
  TrendingUp, 
  Users, 
  FileText, 
  BarChart3, 
  Target, 
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBusinessIntelligence } from '@/hooks/useBusinessIntelligence';

export const BusinessDashboard = () => {
  const { 
    performance, 
    competitors, 
    recommendations, 
    growthScore, 
    isLoading, 
    error,
    refreshIntelligence 
  } = useBusinessIntelligence();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Business Intelligence</h1>
            <p className="text-muted-foreground">Comprehensive analytics and insights</p>
          </div>
          <Button onClick={refreshIntelligence} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load analytics</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={refreshIntelligence}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Intelligence</h1>
          <p className="text-muted-foreground">Comprehensive analytics and insights</p>
        </div>
        <Button onClick={refreshIntelligence} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Growth Score Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Overall Growth Score</CardTitle>
              <CardDescription>Your business performance indicator</CardDescription>
            </div>
            {getScoreBadge(growthScore)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Progress value={growthScore} className="h-3" />
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(growthScore)}`}>
              {growthScore}/100
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="recommendations">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.totalPosts}</div>
                <p className="text-xs text-muted-foreground">
                  {performance.publishedPosts} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance.avgEngagementRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {performance.totalEngagement} total engagements
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Competitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{competitors.activeCompetitors}</div>
                <p className="text-xs text-muted-foreground">
                  of {competitors.totalCompetitors} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Priority Insights</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{competitors.highPriorityInsights}</div>
                <p className="text-xs text-muted-foreground">
                  require attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump to key areas of your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Create Content</div>
                      <div className="text-sm text-muted-foreground">Start a new post</div>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Add Competitor</div>
                      <div className="text-sm text-muted-foreground">Monitor competition</div>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">View Templates</div>
                      <div className="text-sm text-muted-foreground">Manage templates</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Content Status</CardTitle>
                <CardDescription>Distribution of your content by status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Published
                  </span>
                  <span className="font-medium">{performance.publishedPosts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 text-yellow-500 mr-2" />
                    Drafts
                  </span>
                  <span className="font-medium">{performance.draftPosts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                    Scheduled
                  </span>
                  <span className="font-medium">{performance.scheduledPosts}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Types</CardTitle>
                <CardDescription>Breakdown by content type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(performance.contentByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="capitalize">{type}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
                {Object.keys(performance.contentByType).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No content created yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {performance.topPerformingPost && (
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Post</CardTitle>
                <CardDescription>Your best performing content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{performance.topPerformingPost.title || 'Untitled'}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {performance.topPerformingPost.type} • {performance.topPerformingPost.status}
                    </p>
                    {performance.topPerformingPost.excerpt && (
                      <p className="text-sm mt-2 line-clamp-2">{performance.topPerformingPost.excerpt}</p>
                    )}
                  </div>
                  <Badge variant="secondary">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Top
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Competitor Overview</CardTitle>
                <CardDescription>Your competitive monitoring status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Competitors</span>
                  <span className="font-medium">{competitors.totalCompetitors}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Monitoring</span>
                  <span className="font-medium">{competitors.activeCompetitors}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Recent Analyses</span>
                  <span className="font-medium">{competitors.recentAnalyses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>High Priority Insights</span>
                  <span className="font-medium text-red-600">{competitors.highPriorityInsights}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Industry Distribution</CardTitle>
                <CardDescription>Competitors by industry</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(competitors.competitorsByIndustry).map(([industry, count]) => (
                  <div key={industry} className="flex justify-between items-center">
                    <span>{industry}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
                {Object.keys(competitors.competitorsByIndustry).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No competitors added yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
              <CardDescription>Personalized insights to improve your strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
                {recommendations.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All Good!</h3>
                    <p className="text-muted-foreground">
                      No specific recommendations at this time. Keep up the great work!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};