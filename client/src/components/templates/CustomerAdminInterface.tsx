import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Brain, 
  Search,
  BarChart3,
  Users,
  Globe,
  Settings
} from 'lucide-react';

interface IndustryInsight {
  category: string;
  trend: string;
  keywords: string[];
  contentIdeas: string[];
}

const CustomerAdminInterface = () => {
  const { toast } = useToast();
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [businessData, setBusinessData] = useState({
    name: '',
    description: '',
    targetAudience: '',
    goals: ''
  });
  const [contentGeneration, setContentGeneration] = useState({
    topic: '',
    tone: 'professional',
    length: 'medium'
  });

  const industryInsights: Record<string, IndustryInsight> = {
    health: {
      category: 'Healthcare & Wellness',
      trend: 'Personalized wellness and mental health awareness',
      keywords: ['wellness', 'mental health', 'prevention', 'holistic care'],
      contentIdeas: [
        'Mental Health Awareness Week content',
        'Seasonal wellness tips',
        'Patient success stories',
        'Preventive care guidelines'
      ]
    },
    tech: {
      category: 'Technology',
      trend: 'AI integration and automation solutions',
      keywords: ['automation', 'AI', 'digital transformation', 'productivity'],
      contentIdeas: [
        'AI in business workflows',
        'Productivity tool comparisons',
        'Tech trend predictions',
        'Case studies and ROI'
      ]
    },
    finance: {
      category: 'Finance & Banking',
      trend: 'Digital banking and financial literacy',
      keywords: ['fintech', 'digital banking', 'financial planning', 'investment'],
      contentIdeas: [
        'Financial planning guides',
        'Investment strategy basics',
        'Market analysis updates',
        'Regulatory compliance tips'
      ]
    }
  };

  const handleGenerateContent = () => {
    toast({
      title: "Content Generated",
      description: `AI-generated ${contentGeneration.tone} content for "${contentGeneration.topic}" is ready for review.`
    });
  };

  const handleSEOOptimization = () => {
    toast({
      title: "SEO Analysis Complete",
      description: "Your content has been optimized for industry-specific keywords and search trends."
    });
  };

  const currentInsight = selectedIndustry ? industryInsights[selectedIndustry] : null;

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog Management Hub</h1>
            <p className="text-muted-foreground">Industry-optimized content creation and management</p>
          </div>
          <Badge variant="secondary" className="px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered
          </Badge>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content Creation</TabsTrigger>
            <TabsTrigger value="insights">Industry Insights</TabsTrigger>
            <TabsTrigger value="seo">SEO Tools</TabsTrigger>
            <TabsTrigger value="analytics">Performance</TabsTrigger>
          </TabsList>

          {/* Content Creation Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Content Generator
                  </CardTitle>
                  <CardDescription>
                    Generate industry-specific content tailored to your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Content Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Mental Health Awareness, AI in Finance..."
                      value={contentGeneration.topic}
                      onChange={(e) => setContentGeneration(prev => ({ ...prev, topic: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tone">Content Tone</Label>
                      <Select value={contentGeneration.tone} onValueChange={(value) => setContentGeneration(prev => ({ ...prev, tone: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="authoritative">Authoritative</SelectItem>
                          <SelectItem value="empathetic">Empathetic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="length">Content Length</Label>
                      <Select value={contentGeneration.length} onValueChange={(value) => setContentGeneration(prev => ({ ...prev, length: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short (300-500 words)</SelectItem>
                          <SelectItem value="medium">Medium (500-1000 words)</SelectItem>
                          <SelectItem value="long">Long (1000+ words)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button onClick={handleGenerateContent} className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Business Profile
                  </CardTitle>
                  <CardDescription>
                    Configure your business details for personalized content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input
                      id="business-name"
                      placeholder="Your Business Name"
                      value={businessData.name}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health">Healthcare & Wellness</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="finance">Finance & Banking</SelectItem>
                        <SelectItem value="legal">Legal Services</SelectItem>
                        <SelectItem value="fitness">Fitness & Sports</SelectItem>
                        <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="target-audience">Target Audience</Label>
                    <Textarea
                      id="target-audience"
                      placeholder="Describe your ideal customers..."
                      value={businessData.targetAudience}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Industry Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {currentInsight ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Industry Trends
                    </CardTitle>
                    <CardDescription>{currentInsight.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Current Trend</h4>
                        <p className="text-muted-foreground">{currentInsight.trend}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Hot Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentInsight.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Content Suggestions
                    </CardTitle>
                    <CardDescription>AI-curated ideas for your industry</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentInsight.contentIdeas.map((idea, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{idea}</span>
                          <Button size="sm" variant="outline">
                            Create
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select Your Industry</h3>
                    <p className="text-muted-foreground">Choose your industry in the Content Creation tab to see personalized insights</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* SEO Tools Tab */}
          <TabsContent value="seo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    SEO Optimization
                  </CardTitle>
                  <CardDescription>
                    Industry-specific SEO analysis and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Keyword Density</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Readability Score</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Industry Relevance</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <Button onClick={handleSEOOptimization} className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Optimize Content
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Real-time SEO and engagement data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">1.2k</div>
                      <div className="text-sm text-muted-foreground">Monthly Visitors</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">4.2</div>
                      <div className="text-sm text-muted-foreground">Avg. Session Duration</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">12</div>
                      <div className="text-sm text-muted-foreground">Top Keywords</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">89%</div>
                      <div className="text-sm text-muted-foreground">Bounce Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Content Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">24</div>
                      <div className="text-sm text-muted-foreground">Posts This Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">89%</div>
                      <div className="text-sm text-muted-foreground">Engagement Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Audience Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">2.1k</div>
                      <div className="text-sm text-muted-foreground">Total Subscribers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">+15%</div>
                      <div className="text-sm text-muted-foreground">Growth This Month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Industry Benchmark
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">Top 25%</div>
                      <div className="text-sm text-muted-foreground">Industry Ranking</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">4.8/5</div>
                      <div className="text-sm text-muted-foreground">Content Quality Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerAdminInterface;