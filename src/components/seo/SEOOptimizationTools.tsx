import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  TrendingUp, 
  Target, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Globe,
  Hash,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SEOAnalysis {
  score: number;
  keywords: string[];
  suggestions: string[];
  readability: number;
  contentLength: number;
  metaDescription: string;
  titleOptimization: string;
}

export const SEOOptimizationTools: React.FC = () => {
  const [content, setContent] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [title, setTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordResearch, setKeywordResearch] = useState<any[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const { toast } = useToast();

  const analyzeSEO = async () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-seo-content', {
        body: {
          content,
          title,
          metaDescription,
          targetKeywords: targetKeywords.split(',').map(k => k.trim()).filter(k => k)
        }
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: "SEO Analysis Complete",
        description: "Your content has been analyzed for SEO optimization"
      });
    } catch (error) {
      console.error('SEO analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const researchKeywords = async () => {
    if (!targetKeywords.trim()) {
      toast({
        title: "Keywords Required",
        description: "Please enter keywords to research",
        variant: "destructive"
      });
      return;
    }

    setIsResearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('keyword-research', {
        body: {
          seedKeywords: targetKeywords.split(',').map(k => k.trim()).filter(k => k)
        }
      });

      if (error) throw error;

      setKeywordResearch(data.keywords || []);
      toast({
        title: "Keyword Research Complete",
        description: `Found ${data.keywords?.length || 0} keyword opportunities`
      });
    } catch (error) {
      console.error('Keyword research error:', error);
      toast({
        title: "Research Failed",
        description: "Failed to research keywords. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResearching(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">SEO Optimization Tools</h1>
        <p className="text-muted-foreground">
          Optimize your content for search engines and improve your rankings
        </p>
      </div>

      <Tabs defaultValue="analyzer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyzer" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Content Analyzer
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Keyword Research
          </TabsTrigger>
          <TabsTrigger value="competitor" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Competitor Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Content Input
                </CardTitle>
                <CardDescription>
                  Enter your content and SEO details for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    placeholder="Enter your page/post title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Meta Description</label>
                  <Textarea
                    placeholder="Enter your meta description"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Target Keywords</label>
                  <Input
                    placeholder="keyword1, keyword2, keyword3"
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    placeholder="Paste your content here for SEO analysis..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                  />
                </div>

                <Button 
                  onClick={analyzeSEO} 
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>Analyzing...</>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze SEO
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    SEO Analysis Results
                  </CardTitle>
                  <CardDescription>
                    Your content SEO score and optimization suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score}/100
                    </div>
                    <p className="text-sm text-muted-foreground">SEO Score</p>
                    <Progress value={analysis.score} className="mt-2" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        Content Metrics
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Word Count: {analysis.contentLength}</div>
                        <div>Readability: {analysis.readability}%</div>
                      </div>
                    </div>

                    {analysis.keywords.length > 0 && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <Hash className="w-4 h-4" />
                          Detected Keywords
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {analysis.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4" />
                          Optimization Suggestions
                        </h4>
                        <div className="space-y-2">
                          {analysis.suggestions.map((suggestion, index) => (
                            <Alert key={index}>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                {suggestion}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Keyword Research
              </CardTitle>
              <CardDescription>
                Discover high-performing keywords for your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter seed keywords (e.g., social media, marketing)"
                  value={targetKeywords}
                  onChange={(e) => setTargetKeywords(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={researchKeywords} 
                  disabled={isResearching}
                >
                  {isResearching ? 'Researching...' : 'Research'}
                </Button>
              </div>

              {keywordResearch.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-4">Keyword Opportunities</h3>
                  <div className="grid gap-3">
                    {keywordResearch.map((keyword, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">{keyword.keyword}</div>
                          <Badge variant={getScoreVariant(keyword.difficulty)}>
                            Difficulty: {keyword.difficulty}/100
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground grid grid-cols-3 gap-2">
                          <div>Volume: {keyword.volume?.toLocaleString() || 'N/A'}</div>
                          <div>CPC: {keyword.cpc || 'N/A'}</div>
                          <div>Competition: {keyword.competition || 'N/A'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Competitor SEO Analysis
              </CardTitle>
              <CardDescription>
                Analyze competitor content and SEO strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Enter competitor URLs to analyze their SEO strategies, keyword usage, and content performance.
                  This feature helps you identify gaps and opportunities in your own SEO approach.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4">
                <Input placeholder="https://competitor-website.com" />
                <Button className="mt-2 w-full" disabled>
                  <Target className="w-4 h-4 mr-2" />
                  Analyze Competitor (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};