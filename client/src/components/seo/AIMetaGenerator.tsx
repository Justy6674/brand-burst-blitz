import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Target, 
  Copy, 
  CheckCircle, 
  TrendingUp,
  Globe,
  FileText,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIMetaGeneratorProps {
  businessId: string;
  onMetaGenerated?: (meta: any) => void;
}

interface MetaData {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  schema: any;
}

interface SEOInsight {
  type: 'opportunity' | 'warning' | 'success';
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  actionable: boolean;
}

interface KeywordAnalysis {
  keyword: string;
  difficulty: number;
  volume: number;
  competition: 'Low' | 'Medium' | 'High';
  relevance: number;
  recommendation: string;
}

export const AIMetaGenerator: React.FC<AIMetaGeneratorProps> = ({
  businessId,
  onMetaGenerated
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedMeta, setGeneratedMeta] = useState<MetaData[]>([]);
  const [seoInsights, setSeoInsights] = useState<SEOInsight[]>([]);
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordAnalysis[]>([]);
  
  const [metaInputs, setMetaInputs] = useState({
    content: '',
    primaryKeyword: '',
    secondaryKeywords: '',
    targetAudience: '',
    contentType: 'blog',
    industry: '',
    competitorUrls: '',
    includeSchema: true,
    optimizeForVoice: false,
    localSEO: false
  });

  const contentTypes = [
    { value: 'blog', label: 'Blog Post' },
    { value: 'product', label: 'Product Page' },
    { value: 'service', label: 'Service Page' },
    { value: 'landing', label: 'Landing Page' },
    { value: 'category', label: 'Category Page' },
    { value: 'about', label: 'About Page' }
  ];

  const handleGenerateMeta = async () => {
    if (!metaInputs.content || !metaInputs.primaryKeyword) {
      toast({
        title: "Missing Information",
        description: "Please provide content and a primary keyword.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setActiveTab('generating');

    try {
      // Simulate SEO analysis with progress updates
      const steps = [
        'Analyzing content structure...',
        'Researching keyword difficulty...',
        'Analyzing competitor meta tags...',
        'Optimizing for search intent...',
        'Generating schema markup...',
        'Creating social meta tags...',
        'Finalizing SEO recommendations...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProgress(((i + 1) / steps.length) * 100);
      }

      // Mock generated meta data - in real implementation, this would call your SEO AI service
      const mockMetaData: MetaData[] = [
        {
          title: `${metaInputs.primaryKeyword} Guide | Your Business Name`,
          description: `Discover the ultimate guide to ${metaInputs.primaryKeyword}. Expert insights, practical tips, and proven strategies for ${metaInputs.targetAudience}. Read more now.`,
          keywords: [metaInputs.primaryKeyword, ...metaInputs.secondaryKeywords.split(',').map(k => k.trim())],
          ogTitle: `Master ${metaInputs.primaryKeyword}: Complete Guide`,
          ogDescription: `Everything you need to know about ${metaInputs.primaryKeyword}. Comprehensive guide with actionable insights for better results.`,
          twitterTitle: `🚀 ${metaInputs.primaryKeyword} Mastery Guide`,
          twitterDescription: `Unlock the secrets of ${metaInputs.primaryKeyword}. Expert tips inside! 💡`,
          schema: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": `${metaInputs.primaryKeyword} Guide`,
            "description": `Comprehensive guide about ${metaInputs.primaryKeyword}`
          }
        },
        {
          title: `Best ${metaInputs.primaryKeyword} Strategies | Expert Tips`,
          description: `Learn the best ${metaInputs.primaryKeyword} strategies from industry experts. Proven methods that drive real results for ${metaInputs.targetAudience}.`,
          keywords: [metaInputs.primaryKeyword, ...metaInputs.secondaryKeywords.split(',').map(k => k.trim())],
          ogTitle: `Proven ${metaInputs.primaryKeyword} Strategies That Work`,
          ogDescription: `Stop guessing. Start succeeding with these proven ${metaInputs.primaryKeyword} strategies from industry leaders.`,
          twitterTitle: `💪 Proven ${metaInputs.primaryKeyword} Strategies`,
          twitterDescription: `Industry-tested strategies for ${metaInputs.primaryKeyword} success. Results guaranteed! ✅`,
          schema: {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": `How to succeed with ${metaInputs.primaryKeyword}`,
            "description": `Step-by-step guide for ${metaInputs.primaryKeyword} success`
          }
        }
      ];

      const mockSEOInsights: SEOInsight[] = [
        {
          type: 'opportunity',
          title: 'Featured Snippet Opportunity',
          description: `Your content could rank for featured snippets with the keyword "${metaInputs.primaryKeyword}". Structure content with clear headings and bullet points.`,
          impact: 'High',
          actionable: true
        },
        {
          type: 'warning',
          title: 'Title Length Optimization',
          description: 'Consider keeping titles under 60 characters for better mobile display and click-through rates.',
          impact: 'Medium',
          actionable: true
        },
        {
          type: 'success',
          title: 'Keyword Relevance',
          description: `Primary keyword "${metaInputs.primaryKeyword}" has strong relevance to your content and target audience.`,
          impact: 'High',
          actionable: false
        }
      ];

      const mockKeywordAnalysis: KeywordAnalysis[] = [
        {
          keyword: metaInputs.primaryKeyword,
          difficulty: 65,
          volume: 2400,
          competition: 'Medium',
          relevance: 95,
          recommendation: 'Primary focus keyword - optimize heavily for this term'
        },
        ...metaInputs.secondaryKeywords.split(',').map((keyword, index) => ({
          keyword: keyword.trim(),
          difficulty: 45 + (index * 10),
          volume: 800 - (index * 100),
          competition: index % 2 === 0 ? 'Low' : 'Medium' as 'Low' | 'Medium',
          relevance: 80 - (index * 5),
          recommendation: 'Supporting keyword - include naturally in content'
        }))
      ];

      setGeneratedMeta(mockMetaData);
      setSeoInsights(mockSEOInsights);
      setKeywordAnalysis(mockKeywordAnalysis);
      setActiveTab('results');

      toast({
        title: "Meta Tags Generated!",
        description: `Created ${mockMetaData.length} optimized meta tag variations.`
      });

    } catch (error) {
      console.error('Meta generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate meta tags. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="h-4 w-4 text-green-600" />;
      case 'warning': return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Search className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI SEO Meta Generator</h2>
          <p className="text-muted-foreground">
            Generate optimized meta tags and schema markup with AI
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="input">
            <FileText className="h-4 w-4 mr-2" />
            Content Input
          </TabsTrigger>
          <TabsTrigger value="generating" disabled={!isGenerating}>
            <Search className="h-4 w-4 mr-2" />
            Analyzing
          </TabsTrigger>
          <TabsTrigger value="results" disabled={generatedMeta.length === 0}>
            <Globe className="h-4 w-4 mr-2" />
            Meta Tags
          </TabsTrigger>
          <TabsTrigger value="insights" disabled={seoInsights.length === 0}>
            <BarChart3 className="h-4 w-4 mr-2" />
            SEO Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content & SEO Requirements</CardTitle>
              <CardDescription>
                Provide content details for AI-powered meta tag generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Content/Page Description *</Label>
                <Textarea
                  id="content"
                  value={metaInputs.content}
                  onChange={(e) => setMetaInputs(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Describe your content, its main points, and value proposition..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryKeyword">Primary Keyword *</Label>
                  <Input
                    id="primaryKeyword"
                    value={metaInputs.primaryKeyword}
                    onChange={(e) => setMetaInputs(prev => ({ ...prev, primaryKeyword: e.target.value }))}
                    placeholder="e.g., digital marketing strategies"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={metaInputs.contentType}
                    onChange={(e) => setMetaInputs(prev => ({ ...prev, contentType: e.target.value }))}
                  >
                    {contentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryKeywords">Secondary Keywords</Label>
                  <Input
                    id="secondaryKeywords"
                    value={metaInputs.secondaryKeywords}
                    onChange={(e) => setMetaInputs(prev => ({ ...prev, secondaryKeywords: e.target.value }))}
                    placeholder="e.g., SEO, content marketing, social media"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={metaInputs.targetAudience}
                    onChange={(e) => setMetaInputs(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="e.g., small business owners, marketers"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={metaInputs.industry}
                    onChange={(e) => setMetaInputs(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., SaaS, E-commerce, Consulting"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competitorUrls">Competitor URLs (optional)</Label>
                  <Input
                    id="competitorUrls"
                    value={metaInputs.competitorUrls}
                    onChange={(e) => setMetaInputs(prev => ({ ...prev, competitorUrls: e.target.value }))}
                    placeholder="competitor1.com, competitor2.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced SEO Options</CardTitle>
              <CardDescription>
                Configure additional optimization features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Schema Markup Generation</p>
                  <p className="text-sm text-muted-foreground">
                    Generate structured data for rich snippets
                  </p>
                </div>
                <Button
                  variant={metaInputs.includeSchema ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMetaInputs(prev => ({ 
                    ...prev, 
                    includeSchema: !prev.includeSchema 
                  }))}
                >
                  {metaInputs.includeSchema ? 'Enabled' : 'Enable'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Voice Search Optimization</p>
                  <p className="text-sm text-muted-foreground">
                    Optimize for voice search queries
                  </p>
                </div>
                <Button
                  variant={metaInputs.optimizeForVoice ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMetaInputs(prev => ({ 
                    ...prev, 
                    optimizeForVoice: !prev.optimizeForVoice 
                  }))}
                >
                  {metaInputs.optimizeForVoice ? 'Enabled' : 'Enable'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Local SEO Optimization</p>
                  <p className="text-sm text-muted-foreground">
                    Include location-based optimization
                  </p>
                </div>
                <Button
                  variant={metaInputs.localSEO ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMetaInputs(prev => ({ 
                    ...prev, 
                    localSEO: !prev.localSEO 
                  }))}
                >
                  {metaInputs.localSEO ? 'Enabled' : 'Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleGenerateMeta} 
            className="w-full" 
            size="lg"
            disabled={!metaInputs.content || !metaInputs.primaryKeyword}
          >
            <Search className="mr-2 h-5 w-5" />
            Generate SEO Meta Tags
          </Button>
        </TabsContent>

        <TabsContent value="generating" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="animate-pulse">
                  <Search className="h-16 w-16 text-primary mx-auto" />
                </div>
                <h3 className="text-xl font-semibold">Analyzing & Optimizing</h3>
                <p className="text-muted-foreground">
                  AI is analyzing your content and generating optimized meta tags...
                </p>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  {progress < 100 ? 'Processing SEO optimization...' : 'Finalizing meta tags...'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {generatedMeta.map((meta, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Meta Tag Variation {index + 1}
                  <Badge variant="secondary">SEO Optimized</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Page Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Page Title ({meta.title.length} chars)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(meta.title, 'Page Title')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-md font-mono text-sm">
                    {meta.title}
                  </div>
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Meta Description ({meta.description.length} chars)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(meta.description, 'Meta Description')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {meta.description}
                  </div>
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                  <Label>Target Keywords</Label>
                  <div className="flex flex-wrap gap-1">
                    {meta.keywords.map((keyword, i) => (
                      <Badge key={i} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Social Media Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Open Graph (Facebook)</Label>
                    <div className="p-3 bg-muted rounded-md text-sm space-y-1">
                      <div><strong>Title:</strong> {meta.ogTitle}</div>
                      <div><strong>Description:</strong> {meta.ogDescription}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter Cards</Label>
                    <div className="p-3 bg-muted rounded-md text-sm space-y-1">
                      <div><strong>Title:</strong> {meta.twitterTitle}</div>
                      <div><strong>Description:</strong> {meta.twitterDescription}</div>
                    </div>
                  </div>
                </div>

                {/* Schema Markup */}
                {metaInputs.includeSchema && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Schema Markup (JSON-LD)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(meta.schema, null, 2), 'Schema Markup')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-3 bg-muted rounded-md font-mono text-xs overflow-x-auto">
                      <pre>{JSON.stringify(meta.schema, null, 2)}</pre>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => onMetaGenerated?.(meta)}
                  className="w-full"
                >
                  Use This Meta Data
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* SEO Insights */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Analysis & Recommendations</CardTitle>
              <CardDescription>
                AI-powered insights to improve your SEO performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seoInsights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{insight.title}</h4>
                          <Badge variant="outline">{insight.impact} Impact</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Keyword Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Keyword Analysis</CardTitle>
              <CardDescription>
                Difficulty and opportunity analysis for your target keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keywordAnalysis.map((keyword, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{keyword.keyword}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getCompetitionColor(keyword.competition)}>
                          {keyword.competition}
                        </Badge>
                        <Badge variant="secondary">
                          {keyword.volume} searches/mo
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Difficulty</p>
                        <Progress value={keyword.difficulty} className="h-2" />
                        <p className="text-xs">{keyword.difficulty}/100</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Relevance</p>
                        <Progress value={keyword.relevance} className="h-2" />
                        <p className="text-xs">{keyword.relevance}/100</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Volume</p>
                        <p className="text-sm font-medium">{keyword.volume.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {keyword.recommendation}
                    </p>
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