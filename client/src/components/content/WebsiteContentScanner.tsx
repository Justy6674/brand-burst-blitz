import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader2, Globe, TrendingUp, Target, Lightbulb, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";

interface CompetitorAnalysis {
  url: string;
  contentGaps: string[];
  topicOpportunities: string[];
  contentStrategy: string;
  strongPoints: string[];
  weaknesses: string[];
  recommendedActions: string[];
}

interface ContentSuggestion {
  title: string;
  type: string;
  reasoning: string;
  keywords: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  impact: "Low" | "Medium" | "High";
}

export function WebsiteContentScanner() {
  const { toast } = useToast();
  const { currentProfile } = useBusinessProfile();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [targetUrl, setTargetUrl] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState("");
  const [industry, setIndustry] = useState(currentProfile?.industry || "");
  const [analysis, setAnalysis] = useState<CompetitorAnalysis[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>([]);
  const [marketInsights, setMarketInsights] = useState("");

  const scanWebsites = async () => {
    if (!targetUrl) {
      toast({
        title: "Missing URL",
        description: "Please enter your website URL",
        variant: "destructive"
      });
      return;
    }

    if (!currentProfile) {
      toast({
        title: "Authentication Required",
        description: "Please log in and select a business profile",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    setProgress(0);
    
    try {
      const urls = [targetUrl, ...competitorUrls.split('\n').filter(url => url.trim())];
      const totalUrls = urls.length;
      
      // Simulate scanning progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Use real website scanning edge function
      const { data: scanData, error: scanError } = await supabase.functions.invoke('website-content-scanner', {
        body: {
          targetUrl,
          competitorUrls: competitorUrls.split('\n').filter(url => url.trim()),
          industry,
          businessName: currentProfile.business_name
        }
      });

      if (scanError) {
        console.error('Website scanning error:', scanError);
        throw new Error('Website scanning failed: ' + scanError.message);
      }

      const analysisResults = scanData.analysis;

      // Use AI-generated content suggestions from edge function
      const contentSuggestions = scanData.contentSuggestions;
      const insights = scanData.marketInsights;

      setAnalysis(analysisResults);
      setContentSuggestions(contentSuggestions);
      setMarketInsights(insights);
      setProgress(100);

      // CRITICAL FIX: Save competitor analysis to database
      try {
        // Save competitor data
        for (const competitorUrl of competitorUrls.split('\n').filter(url => url.trim())) {
          await supabase.from('competitor_data').upsert({
            user_id: currentProfile.user_id,
            business_profile_id: currentProfile.id,
            competitor_url: competitorUrl,
            competitor_name: competitorUrl.replace(/^https?:\/\//, '').split('/')[0],
            industry: industry || currentProfile.industry,
            is_active: true,
            last_analyzed_at: new Date().toISOString()
          });
        }

        // Save competitive insights
        for (const insight of contentSuggestions) {
          await supabase.from('competitive_insights').insert({
            user_id: currentProfile.user_id,
            business_profile_id: currentProfile.id,
            title: insight.title,
            description: insight.reasoning,
            insight_type: insight.type,
            recommendations: {
              difficulty: insight.difficulty,
              impact: insight.impact,
              keywords: insight.keywords,
              outline: insight.contentOutline || [],
              readTime: insight.estimatedReadTime || "5 minutes",
              seoScore: insight.seoScore || 70
            },
            priority_score: insight.impact === "High" ? 8 : insight.impact === "Medium" ? 5 : 3
          });
        }

        console.log('Competitor analysis saved to database');
      } catch (saveError) {
        console.error('Error saving competitor analysis:', saveError);
        // Don't show error to user as the main functionality worked
      }

      setAnalysis(analysisResults);
      setContentSuggestions(contentSuggestions);
      setMarketInsights(insights);
      setProgress(100);

      toast({
        title: "Scan Complete!",
        description: `Analyzed ${totalUrls} websites and generated ${contentSuggestions.length} content opportunities`,
      });

    } catch (error) {
      console.error('Error scanning websites:', error);
      toast({
        title: "Scan Failed",
        description: "Please check the URLs and try again",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const generateContentFromSuggestion = async (suggestion: ContentSuggestion) => {
    if (!currentProfile) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate content",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate content using the suggestion
      const { data: contentData, error: contentError } = await supabase.functions.invoke('generate-complete-content', {
        body: {
          businessName: currentProfile.business_name,
          industry: currentProfile.industry,
          location: "Australia",
          contentType: suggestion.type,
          topicIdea: suggestion.title,
          targetAudience: "potential customers",
          generateImages: true,
          generateSocial: true,
          generateSEO: true
        }
      });

      if (contentError) throw contentError;

      // Save the generated content
      await supabase.from('posts').insert({
        user_id: currentProfile.user_id,
        business_profile_id: currentProfile.id,
        type: 'blog',
        title: contentData.blogPost.title,
        content: contentData.blogPost.content,
        excerpt: contentData.blogPost.excerpt,
        metadata: {
          generatedFrom: 'competitor-analysis',
          suggestionTitle: suggestion.title,
          suggestionType: suggestion.type,
          suggestionReasoning: suggestion.reasoning,
          keywords: suggestion.keywords,
          difficulty: suggestion.difficulty,
          impact: suggestion.impact,
          seoData: contentData.seoData,
          socialPosts: contentData.socialPosts
        },
        image_urls: contentData.images ? [
          contentData.images.heroImage,
          contentData.images.socialImage,
          contentData.images.quoteCard
        ] : [],
        status: 'draft',
        ai_tone: 'professional'
      });

      toast({
        title: "Content Generated & Saved!",
        description: `Created: ${suggestion.title}`,
      });
    } catch (error) {
      console.error('Error generating content from suggestion:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate content. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Website Content Scanner</h1>
        <p className="text-muted-foreground">
          Analyze your website and competitors to discover content opportunities
        </p>
      </div>

      {/* Scanner Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website Analysis Setup
          </CardTitle>
          <CardDescription>
            Enter your website and competitor URLs to discover content gaps and opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="targetUrl">Your Website URL *</Label>
            <Input
              id="targetUrl"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://yourbusiness.com.au"
              type="url"
            />
          </div>

          <div>
            <Label htmlFor="competitorUrls">Competitor URLs (one per line)</Label>
            <Textarea
              id="competitorUrls"
              value={competitorUrls}
              onChange={(e) => setCompetitorUrls(e.target.value)}
              placeholder="https://competitor1.com.au&#10;https://competitor2.com.au&#10;https://competitor3.com.au"
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="industry">Industry (Optional)</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Plumbing, Retail, Professional Services"
            />
          </div>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Scanning websites...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <Button 
            onClick={scanWebsites} 
            disabled={isScanning}
            className="w-full"
            size="lg"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning & Analyzing...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Scan Websites for Content Opportunities
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {analysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Content Analysis Results</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{analysis.length} Sites Analyzed</Badge>
              <Badge variant="secondary">{contentSuggestions.length} Opportunities Found</Badge>
              <Badge variant="secondary">Australian Market Focused</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Market Insights
                </TabsTrigger>
                <TabsTrigger value="opportunities" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Content Ideas
                </TabsTrigger>
                <TabsTrigger value="gaps" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Content Gaps
                </TabsTrigger>
                <TabsTrigger value="competitor" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Competitor Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Australian Market Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm">
                      {marketInsights}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opportunities" className="mt-6">
                <div className="space-y-4">
                  {contentSuggestions.map((suggestion, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{suggestion.title}</h3>
                            <p className="text-muted-foreground mb-3">{suggestion.reasoning}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline">{suggestion.type}</Badge>
                              <Badge variant={suggestion.difficulty === "Easy" ? "secondary" : suggestion.difficulty === "Medium" ? "default" : "destructive"}>
                                {suggestion.difficulty}
                              </Badge>
                              <Badge variant={suggestion.impact === "High" ? "default" : "secondary"}>
                                {suggestion.impact} Impact
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {suggestion.keywords.map((keyword, kidx) => (
                                <Badge key={kidx} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <Button 
                            onClick={() => generateContentFromSuggestion(suggestion)}
                            size="sm"
                          >
                            Generate Content
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="gaps" className="mt-6">
                <div className="space-y-4">
                  {analysis.map((site, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {site.url === targetUrl ? "Your Website" : "Competitor"}
                        </CardTitle>
                        <CardDescription>{site.url}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2 text-red-600">Content Gaps</h4>
                            <ul className="text-sm space-y-1">
                              {site.contentGaps.map((gap, gidx) => (
                                <li key={gidx} className="flex items-start gap-2">
                                  <span className="text-red-500">•</span>
                                  {gap}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2 text-green-600">Opportunities</h4>
                            <ul className="text-sm space-y-1">
                              {site.topicOpportunities.map((opp, oidx) => (
                                <li key={oidx} className="flex items-start gap-2">
                                  <span className="text-green-500">•</span>
                                  {opp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4 p-4 bg-muted rounded">
                          <h4 className="font-medium mb-2">Strategy Assessment</h4>
                          <p className="text-sm">{site.contentStrategy}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="competitor" className="mt-6">
                <div className="space-y-4">
                  {analysis.filter(site => site.url !== targetUrl).map((site, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle>Competitor Analysis</CardTitle>
                        <CardDescription>{site.url}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium mb-2 text-green-600">Strong Points</h4>
                            <ul className="text-sm space-y-1">
                              {site.strongPoints.map((point, pidx) => (
                                <li key={pidx} className="flex items-start gap-2">
                                  <span className="text-green-500">✓</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2 text-red-600">Weaknesses</h4>
                            <ul className="text-sm space-y-1">
                              {site.weaknesses.map((weakness, widx) => (
                                <li key={widx} className="flex items-start gap-2">
                                  <span className="text-red-500">✗</span>
                                  {weakness}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2 text-blue-600">How to Beat Them</h4>
                            <ul className="text-sm space-y-1">
                              {site.recommendedActions.map((action, aidx) => (
                                <li key={aidx} className="flex items-start gap-2">
                                  <span className="text-blue-500">→</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Quick Action Alert */}
      {analysis.length > 0 && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>Quick Win:</strong> Start with the "Easy" content suggestions above. 
            These can be created quickly and will have immediate impact on your Australian market presence.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}