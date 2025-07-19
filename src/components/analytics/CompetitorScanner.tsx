import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  TrendingUp, 
  Users, 
  Globe, 
  MessageSquare,
  Calendar,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CompetitorScannerProps {
  businessId: string;
  onInsightGenerated?: (insight: any) => void;
}

interface CompetitorData {
  id: string;
  name: string;
  website: string;
  industry: string;
  socialPresence: {
    platform: string;
    handle: string;
    followers: number;
    engagementRate: number;
    postFrequency: string;
  }[];
  contentThemes: string[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  lastUpdated: Date;
}

interface ContentGap {
  topic: string;
  opportunity: string;
  difficulty: 'Low' | 'Medium' | 'High';
  potentialImpact: number;
  suggestedAction: string;
}

interface TrendInsight {
  trend: string;
  momentum: 'Rising' | 'Stable' | 'Declining';
  relevance: number;
  competitorAdoption: string[];
  recommendation: string;
}

export const CompetitorScanner: React.FC<CompetitorScannerProps> = ({
  businessId,
  onInsightGenerated
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [contentGaps, setContentGaps] = useState<ContentGap[]>([]);
  const [trends, setTrends] = useState<TrendInsight[]>([]);
  
  const [scanInputs, setScanInputs] = useState({
    competitorUrls: '',
    industry: '',
    targetMarkets: '',
    analyzeSocial: true,
    analyzeContent: true,
    analyzeSEO: true
  });

  const handleStartScan = async () => {
    if (!scanInputs.competitorUrls.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide at least one competitor URL or company name.",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setActiveTab('scanning');

    try {
      // Simulate scanning process with progress updates
      const scanSteps = [
        'Identifying competitors...',
        'Analyzing website content...',
        'Scanning social media presence...',
        'Evaluating SEO strategies...',
        'Identifying content gaps...',
        'Analyzing industry trends...',
        'Generating insights...'
      ];

      for (let i = 0; i < scanSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setScanProgress(((i + 1) / scanSteps.length) * 100);
      }

      // Mock competitor data - in real implementation, this would call your analysis service
      const mockCompetitors: CompetitorData[] = [
        {
          id: '1',
          name: 'Competitor A',
          website: 'competitor-a.com',
          industry: scanInputs.industry || 'Technology',
          socialPresence: [
            {
              platform: 'LinkedIn',
              handle: '@competitora',
              followers: 15000,
              engagementRate: 3.2,
              postFrequency: 'Daily'
            },
            {
              platform: 'Twitter',
              handle: '@competitora',
              followers: 8500,
              engagementRate: 2.1,
              postFrequency: '3x/week'
            }
          ],
          contentThemes: ['Industry Insights', 'Product Updates', 'Customer Success'],
          strengths: ['Strong thought leadership', 'Consistent posting', 'High engagement'],
          weaknesses: ['Limited video content', 'Weak mobile presence'],
          opportunities: ['Emerging on TikTok', 'Podcast partnerships'],
          lastUpdated: new Date()
        },
        {
          id: '2',
          name: 'Competitor B',
          website: 'competitor-b.com',
          industry: scanInputs.industry || 'Technology',
          socialPresence: [
            {
              platform: 'Instagram',
              handle: '@competitorb',
              followers: 25000,
              engagementRate: 4.8,
              postFrequency: '2x/day'
            },
            {
              platform: 'LinkedIn',
              handle: '@competitorb',
              followers: 12000,
              engagementRate: 2.9,
              postFrequency: '4x/week'
            }
          ],
          contentThemes: ['Behind the Scenes', 'Employee Stories', 'Industry News'],
          strengths: ['Visual storytelling', 'Employee advocacy', 'Video content'],
          weaknesses: ['Inconsistent messaging', 'Limited LinkedIn presence'],
          opportunities: ['B2B content expansion', 'Webinar series'],
          lastUpdated: new Date()
        }
      ];

      const mockContentGaps: ContentGap[] = [
        {
          topic: 'AI Implementation Guides',
          opportunity: 'No competitor is creating detailed implementation guides',
          difficulty: 'Medium',
          potentialImpact: 85,
          suggestedAction: 'Create a comprehensive AI implementation series'
        },
        {
          topic: 'Customer ROI Case Studies',
          opportunity: 'Limited quantitative success stories in the market',
          difficulty: 'Low',
          potentialImpact: 92,
          suggestedAction: 'Develop detailed ROI-focused case studies'
        },
        {
          topic: 'Interactive Product Demos',
          opportunity: 'Most competitors use static presentations',
          difficulty: 'High',
          potentialImpact: 78,
          suggestedAction: 'Create interactive demo experiences'
        }
      ];

      const mockTrends: TrendInsight[] = [
        {
          trend: 'AI-Powered Personalization',
          momentum: 'Rising',
          relevance: 94,
          competitorAdoption: ['Competitor A'],
          recommendation: 'Immediate adoption recommended - early mover advantage available'
        },
        {
          trend: 'Sustainability Messaging',
          momentum: 'Stable',
          relevance: 67,
          competitorAdoption: ['Competitor B'],
          recommendation: 'Consider integration into brand messaging'
        },
        {
          trend: 'Video-First Content',
          momentum: 'Rising',
          relevance: 89,
          competitorAdoption: ['Competitor B'],
          recommendation: 'Increase video content production to stay competitive'
        }
      ];

      setCompetitors(mockCompetitors);
      setContentGaps(mockContentGaps);
      setTrends(mockTrends);
      setActiveTab('results');

      toast({
        title: "Scan Complete!",
        description: `Analyzed ${mockCompetitors.length} competitors and identified ${mockContentGaps.length} opportunities.`
      });

    } catch (error) {
      console.error('Competitor scan error:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to complete competitor analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'Rising': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Stable': return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case 'Declining': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Search className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Competitor Intelligence Scanner</h2>
          <p className="text-muted-foreground">
            Analyze competitors and discover content opportunities
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scan">
            <Target className="h-4 w-4 mr-2" />
            Setup Scan
          </TabsTrigger>
          <TabsTrigger value="scanning" disabled={!isScanning}>
            <Search className="h-4 w-4 mr-2" />
            Scanning
          </TabsTrigger>
          <TabsTrigger value="results" disabled={competitors.length === 0}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="opportunities" disabled={contentGaps.length === 0}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Opportunities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Analysis Setup</CardTitle>
              <CardDescription>
                Provide competitor information to begin intelligence gathering
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Competitor URLs or Company Names *
                </label>
                <textarea
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                  value={scanInputs.competitorUrls}
                  onChange={(e) => setScanInputs(prev => ({ ...prev, competitorUrls: e.target.value }))}
                  placeholder="Enter competitor websites or company names (one per line):&#10;competitor1.com&#10;Competitor Company 2&#10;https://competitor3.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry</label>
                  <Input
                    value={scanInputs.industry}
                    onChange={(e) => setScanInputs(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., SaaS, E-commerce, Consulting"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Markets</label>
                  <Input
                    value={scanInputs.targetMarkets}
                    onChange={(e) => setScanInputs(prev => ({ ...prev, targetMarkets: e.target.value }))}
                    placeholder="e.g., SMB, Enterprise, B2C"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Analysis Options</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Social Media Analysis</span>
                    <Button
                      variant={scanInputs.analyzeSocial ? "default" : "outline"}
                      size="sm"
                      onClick={() => setScanInputs(prev => ({ 
                        ...prev, 
                        analyzeSocial: !prev.analyzeSocial 
                      }))}
                    >
                      {scanInputs.analyzeSocial ? 'Enabled' : 'Enable'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Content Strategy Analysis</span>
                    <Button
                      variant={scanInputs.analyzeContent ? "default" : "outline"}
                      size="sm"
                      onClick={() => setScanInputs(prev => ({ 
                        ...prev, 
                        analyzeContent: !prev.analyzeContent 
                      }))}
                    >
                      {scanInputs.analyzeContent ? 'Enabled' : 'Enable'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SEO & Keywords Analysis</span>
                    <Button
                      variant={scanInputs.analyzeSEO ? "default" : "outline"}
                      size="sm"
                      onClick={() => setScanInputs(prev => ({ 
                        ...prev, 
                        analyzeSEO: !prev.analyzeSEO 
                      }))}
                    >
                      {scanInputs.analyzeSEO ? 'Enabled' : 'Enable'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleStartScan} 
            className="w-full" 
            size="lg"
            disabled={!scanInputs.competitorUrls.trim()}
          >
            <Search className="mr-2 h-5 w-5" />
            Start Competitor Scan
          </Button>
        </TabsContent>

        <TabsContent value="scanning" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="animate-pulse">
                  <Search className="h-16 w-16 text-primary mx-auto" />
                </div>
                <h3 className="text-xl font-semibold">Scanning Competitors</h3>
                <p className="text-muted-foreground">
                  Analyzing competitor strategies across multiple channels...
                </p>
                <Progress value={scanProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  {scanProgress < 100 ? 'Analysis in progress...' : 'Finalizing results...'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {competitors.map((competitor) => (
              <Card key={competitor.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        {competitor.name}
                      </CardTitle>
                      <CardDescription>{competitor.website}</CardDescription>
                    </div>
                    <Badge variant="outline">{competitor.industry}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Social Presence */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Social Presence
                    </h4>
                    <div className="space-y-2">
                      {competitor.socialPresence.map((social, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{social.platform}: {social.followers.toLocaleString()}</span>
                          <Badge variant="secondary">{social.engagementRate}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Themes */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Content Themes
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {competitor.contentThemes.map((theme, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-1">Strengths</h5>
                      <ul className="text-xs space-y-1">
                        {competitor.strengths.map((strength, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-red-700 mb-1">Weaknesses</h5>
                      <ul className="text-xs space-y-1">
                        {competitor.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Industry Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Industry Trend Analysis
              </CardTitle>
              <CardDescription>
                Current trends and their adoption by competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.map((trend, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getMomentumIcon(trend.momentum)}
                        <h4 className="font-medium">{trend.trend}</h4>
                      </div>
                      <Badge variant="secondary">{trend.relevance}% relevant</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {trend.recommendation}
                    </p>
                    {trend.competitorAdoption.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <span>Adopted by:</span>
                        {trend.competitorAdoption.map((comp, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Content Gap Analysis
              </CardTitle>
              <CardDescription>
                Opportunities where you can outperform competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentGaps.map((gap, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium">{gap.topic}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(gap.difficulty)}>
                          {gap.difficulty}
                        </Badge>
                        <Badge variant="secondary">
                          {gap.potentialImpact}% impact
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {gap.opportunity}
                    </p>
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Suggested Action:</strong> {gap.suggestedAction}
                      </AlertDescription>
                    </Alert>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};