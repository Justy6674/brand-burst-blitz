import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Globe, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Hash
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TrendData {
  keyword: string;
  momentum: 'rising' | 'stable' | 'declining';
  volume: number;
  competition: 'low' | 'medium' | 'high';
  relevance: number;
  industry: string;
  location: string;
  lastUpdated: Date;
  opportunities: string[];
  relatedKeywords: string[];
}

interface TrendAnalyzerProps {
  businessId?: string;
  industry?: string;
  onTrendSelected?: (trend: TrendData) => void;
}

export const TrendAnalyzer: React.FC<TrendAnalyzerProps> = ({
  businessId,
  industry,
  onTrendSelected
}) => {
  const { toast } = useToast();
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const analyzeTrends = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate trend analysis process
      const steps = [
        'Scanning global trends...',
        'Analyzing Australian market...',
        'Processing industry data...',
        'Calculating relevance scores...',
        'Identifying opportunities...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAnalysisProgress(((i + 1) / steps.length) * 100);
      }

      // Mock trend data - in real implementation, this would call trend analysis API
      const mockTrends: TrendData[] = [
        {
          keyword: 'AI automation tools',
          momentum: 'rising',
          volume: 25000,
          competition: 'medium',
          relevance: 92,
          industry: 'Technology',
          location: 'Australia',
          lastUpdated: new Date(),
          opportunities: [
            'High search volume with moderate competition',
            'Growing 35% month-over-month',
            'Strong Australian market interest'
          ],
          relatedKeywords: ['AI tools', 'automation software', 'business automation', 'AI solutions']
        },
        {
          keyword: 'sustainable business practices',
          momentum: 'rising',
          volume: 18000,
          competition: 'low',
          relevance: 88,
          industry: 'Business',
          location: 'Australia',
          lastUpdated: new Date(),
          opportunities: [
            'Low competition, high opportunity',
            'Aligns with Australian sustainability initiatives',
            'Growing corporate responsibility trend'
          ],
          relatedKeywords: ['green business', 'eco-friendly practices', 'carbon neutral', 'sustainability']
        },
        {
          keyword: 'remote work solutions',
          momentum: 'stable',
          volume: 45000,
          competition: 'high',
          relevance: 75,
          industry: 'Technology',
          location: 'Global',
          lastUpdated: new Date(),
          opportunities: [
            'Stable high-volume trend',
            'Opportunity in niche sub-topics',
            'Long-term content strategy potential'
          ],
          relatedKeywords: ['WFH tools', 'virtual collaboration', 'remote productivity', 'hybrid work']
        },
        {
          keyword: 'mental health workplace',
          momentum: 'rising',
          volume: 22000,
          competition: 'low',
          relevance: 94,
          industry: 'Health & Wellness',
          location: 'Australia',
          lastUpdated: new Date(),
          opportunities: [
            'Critical trend with social impact',
            'Government support for workplace wellness',
            'High engagement potential'
          ],
          relatedKeywords: ['workplace wellness', 'employee mental health', 'stress management', 'wellbeing']
        },
        {
          keyword: 'cryptocurrency regulations',
          momentum: 'declining',
          volume: 15000,
          competition: 'high',
          relevance: 45,
          industry: 'Finance',
          location: 'Australia',
          lastUpdated: new Date(),
          opportunities: [
            'Declining trend - avoid for new content',
            'Consider alternative fintech topics',
            'Monitor for recovery signals'
          ],
          relatedKeywords: ['crypto laws', 'blockchain regulation', 'digital currency', 'fintech compliance']
        }
      ];

      setTrends(mockTrends);
      toast({
        title: "Trend Analysis Complete",
        description: `Identified ${mockTrends.length} relevant trends for your industry.`
      });

    } catch (error) {
      console.error('Trend analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze trends. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (businessId || industry) {
      analyzeTrends();
    }
  }, [businessId, industry]);

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'stable':
        return <div className="h-4 w-4 bg-blue-600 rounded-full" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'rising': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredTrends = selectedCategory === 'all' 
    ? trends 
    : trends.filter(trend => trend.industry.toLowerCase().includes(selectedCategory.toLowerCase()));

  const categories = ['all', ...Array.from(new Set(trends.map(t => t.industry)))];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Trend Analyzer</h2>
          <p className="text-muted-foreground">
            Discover trending topics and content opportunities
          </p>
        </div>
      </div>

      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <Zap className="h-16 w-16 text-primary mx-auto" />
              </div>
              <h3 className="text-xl font-semibold">Analyzing Trends</h3>
              <p className="text-muted-foreground">
                Scanning current trends and opportunities...
              </p>
              <Progress value={analysisProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {!isAnalyzing && trends.length > 0 && (
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">
              <TrendingUp className="h-4 w-4 mr-2" />
              Current Trends
            </TabsTrigger>
            <TabsTrigger value="opportunities">
              <Target className="h-4 w-4 mr-2" />
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="keywords">
              <Hash className="h-4 w-4 mr-2" />
              Related Keywords
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All Industries' : category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTrends.map((trend, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => onTrendSelected?.(trend)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {getMomentumIcon(trend.momentum)}
                          {trend.keyword}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Globe className="h-3 w-3" />
                          {trend.location} • {trend.industry}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{trend.volume.toLocaleString()} searches</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Relevance</span>
                          <span className="text-sm font-medium">{trend.relevance}%</span>
                        </div>
                        <Progress value={trend.relevance} />
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Competition</div>
                        <Badge className={getCompetitionColor(trend.competition)}>
                          {trend.competition}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Key Opportunities</div>
                      <div className="space-y-1">
                        {trend.opportunities.slice(0, 2).map((opportunity, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{opportunity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Updated {trend.lastUpdated.toLocaleDateString()}
                      </div>
                      <div className={`text-sm font-medium ${getMomentumColor(trend.momentum)}`}>
                        {trend.momentum.charAt(0).toUpperCase() + trend.momentum.slice(1)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <div className="space-y-4">
              {filteredTrends
                .filter(t => t.momentum === 'rising' && t.competition !== 'high')
                .map((trend, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Target className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{trend.keyword}</h3>
                        <div className="space-y-2">
                          {trend.opportunities.map((opportunity, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{opportunity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <Badge variant="secondary">{trend.volume.toLocaleString()} searches</Badge>
                          <Badge className={getCompetitionColor(trend.competition)}>
                            {trend.competition} competition
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {trend.relevance}% relevant
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTrends.map((trend, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{trend.keyword}</CardTitle>
                    <CardDescription>Related keywords and variations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {trend.relatedKeywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Use these keywords to expand your content strategy and improve SEO
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!isAnalyzing && trends.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">No Trends Available</h3>
                <p className="text-muted-foreground">
                  Click analyze trends to discover current opportunities
                </p>
              </div>
              <Button onClick={analyzeTrends}>
                <Zap className="h-4 w-4 mr-2" />
                Analyze Trends
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};