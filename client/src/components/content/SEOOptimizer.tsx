import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  TrendingUp, 
  Search, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Hash,
  FileText,
  Clock
} from 'lucide-react';

interface SEOAnalysis {
  score: number;
  title: string;
  description: string;
  keywords: string[];
  readingTime: number;
  wordCount: number;
  headings: {
    h1: number;
    h2: number;
    h3: number;
  };
  suggestions: {
    type: 'success' | 'warning' | 'error';
    message: string;
  }[];
}

interface SEOOptimizerProps {
  content: string;
  title: string;
  metaDescription?: string;
  tags?: string[];
  onOptimizationChange?: (analysis: SEOAnalysis) => void;
}

const SEOOptimizer: React.FC<SEOOptimizerProps> = ({
  content,
  title,
  metaDescription = '',
  tags = [],
  onOptimizationChange
}) => {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [businessKeywords] = useState([
    'AI content creation', 'social media automation', 'business marketing',
    'content strategy', 'digital marketing', 'brand consistency',
    'social media management', 'AI automation', 'business growth',
    'content marketing', 'competitor analysis', 'ROI optimization'
  ]);

  useEffect(() => {
    if (content && title) {
      analyzeContent();
    }
  }, [content, title, metaDescription, tags]);

  const analyzeContent = () => {
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    // Extract headings
    const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi) || content.match(/^# .+$/gm) || [];
    const h2Matches = content.match(/<h2[^>]*>.*?<\/h2>/gi) || content.match(/^## .+$/gm) || [];
    const h3Matches = content.match(/<h3[^>]*>.*?<\/h3>/gi) || content.match(/^### .+$/gm) || [];
    
    const headings = {
      h1: h1Matches.length,
      h2: h2Matches.length,
      h3: h3Matches.length
    };

    // Extract keywords from content
    const contentText = content.toLowerCase().replace(/<[^>]*>/g, ' ');
    const extractedKeywords = businessKeywords.filter(keyword => 
      contentText.includes(keyword.toLowerCase()) || 
      title.toLowerCase().includes(keyword.toLowerCase())
    );

    // Generate suggestions
    const suggestions = generateSuggestions(wordCount, title, metaDescription, headings, extractedKeywords);
    
    // Calculate SEO score
    const score = calculateSEOScore(wordCount, title, metaDescription, headings, extractedKeywords, suggestions);

    const newAnalysis: SEOAnalysis = {
      score,
      title,
      description: metaDescription,
      keywords: [...extractedKeywords, ...tags],
      readingTime,
      wordCount,
      headings,
      suggestions
    };

    setAnalysis(newAnalysis);
    onOptimizationChange?.(newAnalysis);
  };

  const generateSuggestions = (
    wordCount: number,
    title: string,
    description: string,
    headings: { h1: number; h2: number; h3: number },
    keywords: string[]
  ) => {
    const suggestions = [];

    // Title optimization
    if (title.length < 30) {
      suggestions.push({
        type: 'warning' as const,
        message: 'Title is too short. Aim for 30-60 characters for better SEO.'
      });
    } else if (title.length > 60) {
      suggestions.push({
        type: 'warning' as const,
        message: 'Title is too long. Keep it under 60 characters to avoid truncation.'
      });
    } else {
      suggestions.push({
        type: 'success' as const,
        message: 'Title length is optimal for SEO.'
      });
    }

    // Meta description
    if (!description) {
      suggestions.push({
        type: 'error' as const,
        message: 'Missing meta description. Add a 150-160 character description.'
      });
    } else if (description.length < 120) {
      suggestions.push({
        type: 'warning' as const,
        message: 'Meta description is too short. Aim for 150-160 characters.'
      });
    } else if (description.length > 160) {
      suggestions.push({
        type: 'warning' as const,
        message: 'Meta description is too long. Keep it under 160 characters.'
      });
    } else {
      suggestions.push({
        type: 'success' as const,
        message: 'Meta description length is optimal.'
      });
    }

    // Content length
    if (wordCount < 300) {
      suggestions.push({
        type: 'warning' as const,
        message: 'Content is quite short. Consider expanding to 500+ words for better SEO.'
      });
    } else if (wordCount > 2000) {
      suggestions.push({
        type: 'warning' as const,
        message: 'Content is very long. Consider breaking into multiple posts or adding a table of contents.'
      });
    } else {
      suggestions.push({
        type: 'success' as const,
        message: 'Content length is good for SEO and readability.'
      });
    }

    // Headings structure
    if (headings.h1 === 0) {
      suggestions.push({
        type: 'error' as const,
        message: 'Missing H1 heading. Add a main heading for better structure.'
      });
    } else if (headings.h1 > 1) {
      suggestions.push({
        type: 'warning' as const,
        message: 'Multiple H1 headings found. Use only one H1 per page.'
      });
    }

    if (headings.h2 === 0 && wordCount > 300) {
      suggestions.push({
        type: 'warning' as const,
        message: 'Add H2 headings to improve content structure and readability.'
      });
    }

    // Keywords
    if (keywords.length === 0) {
      suggestions.push({
        type: 'warning' as const,
        message: 'No business-relevant keywords detected. Consider adding industry terms.'
      });
    } else if (keywords.length > 5) {
      suggestions.push({
        type: 'success' as const,
        message: `Great keyword coverage! Found ${keywords.length} relevant business terms.`
      });
    }

    return suggestions;
  };

  const calculateSEOScore = (
    wordCount: number,
    title: string,
    description: string,
    headings: { h1: number; h2: number; h3: number },
    keywords: string[],
    suggestions: any[]
  ) => {
    let score = 0;

    // Title scoring (25 points max)
    if (title.length >= 30 && title.length <= 60) score += 25;
    else if (title.length >= 20) score += 15;
    else score += 5;

    // Meta description scoring (20 points max)
    if (description.length >= 120 && description.length <= 160) score += 20;
    else if (description.length > 0) score += 10;

    // Content length scoring (20 points max)
    if (wordCount >= 500 && wordCount <= 2000) score += 20;
    else if (wordCount >= 300) score += 15;
    else if (wordCount >= 100) score += 10;

    // Headings structure scoring (15 points max)
    if (headings.h1 === 1) score += 8;
    if (headings.h2 > 0) score += 7;

    // Keywords scoring (20 points max)
    if (keywords.length > 5) score += 20;
    else if (keywords.length > 3) score += 15;
    else if (keywords.length > 0) score += 10;

    return Math.min(100, score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Add content to see SEO analysis...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEO Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            SEO Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold">
              <span className={getScoreColor(analysis.score)}>{analysis.score}</span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            <Badge variant={analysis.score >= 80 ? 'default' : analysis.score >= 60 ? 'secondary' : 'destructive'}>
              {getScoreLabel(analysis.score)}
            </Badge>
          </div>
          <Progress value={analysis.score} className="h-2" />
        </CardContent>
      </Card>

      {/* Content Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{analysis.wordCount}</div>
            <div className="text-sm text-muted-foreground">Words</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{analysis.readingTime}</div>
            <div className="text-sm text-muted-foreground">Min Read</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Hash className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{analysis.headings.h1 + analysis.headings.h2}</div>
            <div className="text-sm text-muted-foreground">Headings</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Search className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{analysis.keywords.length}</div>
            <div className="text-sm text-muted-foreground">Keywords</div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Optimization Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                {suggestion.type === 'success' && <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />}
                {suggestion.type === 'warning' && <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />}
                {suggestion.type === 'error' && <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />}
                <span className="text-sm">{suggestion.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keywords Found */}
      {analysis.keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Business Keywords Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SEOOptimizer;