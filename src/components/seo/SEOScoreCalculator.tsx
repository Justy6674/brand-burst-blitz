import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  TrendingUp,
  Eye,
  Hash,
  FileText,
  Link,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SEOScore {
  overall: number;
  components: {
    title: { score: number; issues: string[]; suggestions: string[] };
    metaDescription: { score: number; issues: string[]; suggestions: string[] };
    headings: { score: number; issues: string[]; suggestions: string[] };
    content: { score: number; issues: string[]; suggestions: string[] };
    keywords: { score: number; issues: string[]; suggestions: string[] };
    readability: { score: number; issues: string[]; suggestions: string[] };
    technical: { score: number; issues: string[]; suggestions: string[] };
  };
}

interface ContentAnalysis {
  title: string;
  metaDescription: string;
  content: string;
  targetKeywords: string[];
  focusKeyword: string;
}

export const SEOScoreCalculator: React.FC = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<ContentAnalysis>({
    title: '',
    metaDescription: '',
    content: '',
    targetKeywords: [],
    focusKeyword: ''
  });
  
  const [seoScore, setSeoScore] = useState<SEOScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  const analyzeSEO = async () => {
    if (!content.title || !content.content) {
      toast({
        title: "Missing Content",
        description: "Please provide at least a title and content to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate SEO analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock SEO analysis - in real implementation, this would use actual SEO analysis algorithms
      const mockScore: SEOScore = {
        overall: calculateOverallScore(),
        components: {
          title: analyzeTitleSEO(),
          metaDescription: analyzeMetaDescriptionSEO(),
          headings: analyzeHeadingsSEO(),
          content: analyzeContentSEO(),
          keywords: analyzeKeywordsSEO(),
          readability: analyzeReadabilitySEO(),
          technical: analyzeTechnicalSEO()
        }
      };

      setSeoScore(mockScore);
      toast({
        title: "SEO Analysis Complete",
        description: `Overall SEO score: ${mockScore.overall}/100`
      });

    } catch (error) {
      console.error('SEO analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze SEO. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateOverallScore = (): number => {
    let score = 0;
    let factors = 0;

    // Title analysis (weight: 20%)
    if (content.title) {
      if (content.title.length >= 30 && content.title.length <= 60) score += 20;
      else if (content.title.length >= 20 && content.title.length <= 70) score += 15;
      else score += 10;
      factors += 20;
    }

    // Meta description analysis (weight: 15%)
    if (content.metaDescription) {
      if (content.metaDescription.length >= 140 && content.metaDescription.length <= 160) score += 15;
      else if (content.metaDescription.length >= 120 && content.metaDescription.length <= 170) score += 12;
      else score += 8;
      factors += 15;
    }

    // Content analysis (weight: 25%)
    if (content.content) {
      const wordCount = content.content.split(' ').length;
      if (wordCount >= 300) score += 25;
      else if (wordCount >= 150) score += 20;
      else score += 15;
      factors += 25;
    }

    // Keywords analysis (weight: 20%)
    if (content.focusKeyword && content.title.toLowerCase().includes(content.focusKeyword.toLowerCase())) {
      score += 20;
    } else if (content.focusKeyword) {
      score += 10;
    }
    factors += 20;

    // Readability (weight: 10%)
    if (content.content) {
      const sentences = content.content.split(/[.!?]+/).length;
      const words = content.content.split(' ').length;
      const avgWordsPerSentence = words / sentences;
      if (avgWordsPerSentence <= 20) score += 10;
      else if (avgWordsPerSentence <= 25) score += 8;
      else score += 5;
      factors += 10;
    }

    // Technical SEO (weight: 10%)
    score += 8; // Assuming good technical setup
    factors += 10;

    return Math.round((score / factors) * 100);
  };

  const analyzeTitleSEO = () => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (!content.title) {
      issues.push('Title is missing');
      suggestions.push('Add a descriptive title for your content');
      score = 0;
    } else {
      if (content.title.length < 30) {
        issues.push('Title is too short');
        suggestions.push('Expand your title to 30-60 characters for better SEO');
        score -= 20;
      }
      if (content.title.length > 60) {
        issues.push('Title is too long');
        suggestions.push('Shorten your title to under 60 characters to prevent truncation');
        score -= 20;
      }
      if (content.focusKeyword && !content.title.toLowerCase().includes(content.focusKeyword.toLowerCase())) {
        issues.push('Focus keyword not in title');
        suggestions.push('Include your focus keyword in the title for better ranking');
        score -= 30;
      }
    }

    return { score: Math.max(0, score), issues, suggestions };
  };

  const analyzeMetaDescriptionSEO = () => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (!content.metaDescription) {
      issues.push('Meta description is missing');
      suggestions.push('Add a compelling meta description to improve click-through rates');
      score = 0;
    } else {
      if (content.metaDescription.length < 140) {
        issues.push('Meta description is too short');
        suggestions.push('Expand your meta description to 140-160 characters');
        score -= 25;
      }
      if (content.metaDescription.length > 160) {
        issues.push('Meta description is too long');
        suggestions.push('Shorten your meta description to under 160 characters');
        score -= 25;
      }
      if (content.focusKeyword && !content.metaDescription.toLowerCase().includes(content.focusKeyword.toLowerCase())) {
        issues.push('Focus keyword not in meta description');
        suggestions.push('Include your focus keyword in the meta description');
        score -= 30;
      }
    }

    return { score: Math.max(0, score), issues, suggestions };
  };

  const analyzeHeadingsSEO = () => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 80;

    const headingMatches = content.content.match(/#{1,6}\s+.+/g);
    if (!headingMatches || headingMatches.length === 0) {
      issues.push('No headings found in content');
      suggestions.push('Add H1, H2, and H3 headings to structure your content');
      score -= 40;
    } else {
      if (headingMatches.length < 2) {
        issues.push('Limited heading structure');
        suggestions.push('Add more headings to improve content structure');
        score -= 20;
      }
    }

    return { score: Math.max(0, score), issues, suggestions };
  };

  const analyzeContentSEO = () => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (!content.content) {
      issues.push('No content provided');
      suggestions.push('Add comprehensive content to your post');
      score = 0;
    } else {
      const wordCount = content.content.split(' ').length;
      if (wordCount < 300) {
        issues.push('Content is too short');
        suggestions.push('Expand your content to at least 300 words for better SEO');
        score -= 30;
      }
      if (wordCount > 2000) {
        suggestions.push('Consider breaking long content into multiple posts or sections');
      }

      // Check keyword density
      if (content.focusKeyword) {
        const keywordOccurrences = (content.content.toLowerCase().match(new RegExp(content.focusKeyword.toLowerCase(), 'g')) || []).length;
        const density = (keywordOccurrences / wordCount) * 100;
        
        if (density < 0.5) {
          issues.push('Keyword density too low');
          suggestions.push('Include your focus keyword more naturally throughout the content');
          score -= 20;
        } else if (density > 3) {
          issues.push('Keyword density too high');
          suggestions.push('Reduce keyword usage to avoid over-optimization');
          score -= 25;
        }
      }
    }

    return { score: Math.max(0, score), issues, suggestions };
  };

  const analyzeKeywordsSEO = () => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (!content.focusKeyword) {
      issues.push('No focus keyword defined');
      suggestions.push('Define a primary focus keyword for your content');
      score -= 50;
    }

    if (content.targetKeywords.length === 0) {
      issues.push('No target keywords defined');
      suggestions.push('Add related keywords to expand your content reach');
      score -= 30;
    }

    return { score: Math.max(0, score), issues, suggestions };
  };

  const analyzeReadabilitySEO = () => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (content.content) {
      const sentences = content.content.split(/[.!?]+/).length;
      const words = content.content.split(' ').length;
      const avgWordsPerSentence = words / sentences;

      if (avgWordsPerSentence > 25) {
        issues.push('Sentences are too long');
        suggestions.push('Break down long sentences for better readability');
        score -= 25;
      }

      // Check for transition words
      const transitionWords = ['however', 'therefore', 'moreover', 'furthermore', 'additionally', 'consequently'];
      const hasTransitions = transitionWords.some(word => content.content.toLowerCase().includes(word));
      
      if (!hasTransitions) {
        suggestions.push('Add transition words to improve content flow');
        score -= 15;
      }
    }

    return { score: Math.max(0, score), issues, suggestions };
  };

  const analyzeTechnicalSEO = () => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 90;

    // Mock technical analysis
    suggestions.push('Ensure your images have alt text');
    suggestions.push('Use clean, descriptive URLs');
    suggestions.push('Implement proper internal linking');

    return { score, issues, suggestions };
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !content.targetKeywords.includes(keywordInput.trim())) {
      setContent(prev => ({
        ...prev,
        targetKeywords: [...prev.targetKeywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setContent(prev => ({
      ...prev,
      targetKeywords: prev.targetKeywords.filter(k => k !== keyword)
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Search className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">SEO Score Calculator</h2>
          <p className="text-muted-foreground">
            Analyze and optimize your content for search engines
          </p>
        </div>
      </div>

      <Tabs defaultValue="input" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">
            <FileText className="h-4 w-4 mr-2" />
            Content Input
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!seoScore}>
            <TrendingUp className="h-4 w-4 mr-2" />
            SEO Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Information</CardTitle>
              <CardDescription>
                Enter your content details for SEO analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={content.title}
                  onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your page/post title"
                />
                <div className="text-xs text-muted-foreground">
                  {content.title.length}/60 characters (optimal: 30-60)
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Description</label>
                <Textarea
                  value={content.metaDescription}
                  onChange={(e) => setContent(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Enter your meta description"
                  rows={3}
                />
                <div className="text-xs text-muted-foreground">
                  {content.metaDescription.length}/160 characters (optimal: 140-160)
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Focus Keyword</label>
                <Input
                  value={content.focusKeyword}
                  onChange={(e) => setContent(prev => ({ ...prev, focusKeyword: e.target.value }))}
                  placeholder="Enter your primary keyword"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Keywords</label>
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Add related keywords"
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button onClick={addKeyword} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {content.targetKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer"
                           onClick={() => removeKeyword(keyword)}>
                      {keyword} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content *</label>
                <Textarea
                  value={content.content}
                  onChange={(e) => setContent(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your content (use # for headings)"
                  rows={10}
                />
                <div className="text-xs text-muted-foreground">
                  {content.content.split(' ').length} words (minimum: 300 recommended)
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={analyzeSEO} 
            className="w-full" 
            size="lg"
            disabled={isAnalyzing || !content.title || !content.content}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing SEO...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Analyze SEO Score
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {seoScore && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Overall SEO Score
                    <div className={`text-3xl font-bold ${getScoreColor(seoScore.overall)}`}>
                      {seoScore.overall}/100
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={seoScore.overall} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {seoScore.overall >= 80 ? 'Excellent! Your content is well-optimized.' :
                     seoScore.overall >= 60 ? 'Good, but there\'s room for improvement.' :
                     'Needs improvement for better search visibility.'}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(seoScore.components).map(([key, component]) => (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center gap-2">
                          {getScoreIcon(component.score)}
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </div>
                        <span className={`font-bold ${getScoreColor(component.score)}`}>
                          {component.score}/100
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Progress value={component.score} />
                      
                      {component.issues.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-red-600 mb-2">Issues</h4>
                          <ul className="space-y-1">
                            {component.issues.map((issue, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <XCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {component.suggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-blue-600 mb-2">Suggestions</h4>
                          <ul className="space-y-1">
                            {component.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <Target className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};