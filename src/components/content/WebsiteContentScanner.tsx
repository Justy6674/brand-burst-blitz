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
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [targetUrl, setTargetUrl] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState("");
  const [industry, setIndustry] = useState("");
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

      // Scan each website using Firecrawl (simulated for now)
      const analysisResults: CompetitorAnalysis[] = [];
      
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        setProgress((i / totalUrls) * 80);
        
        // In real implementation, this would use Firecrawl
        const mockAnalysis: CompetitorAnalysis = {
          url,
          contentGaps: [
            "No recent blog posts about Australian market trends",
            "Missing customer testimonials and case studies",
            "Limited local SEO optimization",
            "No seasonal content for EOFY or Christmas"
          ],
          topicOpportunities: [
            "Australian business compliance guides",
            "Local market insights and statistics",
            "Industry-specific tips and tutorials",
            "Customer success stories"
          ],
          contentStrategy: url === targetUrl 
            ? "Your website has good technical structure but lacks regular content updates and local market focus"
            : "Competitor focuses heavily on generic content without Australian market customization",
          strongPoints: [
            "Professional website design",
            "Clear service descriptions",
            "Contact information visible"
          ],
          weaknesses: [
            "Infrequent blog updates",
            "Generic content not tailored to Australian market",
            "Limited social proof and testimonials"
          ],
          recommendedActions: [
            "Create weekly blog content about Australian industry trends",
            "Add customer testimonials with local references",
            "Optimize for local Australian keywords",
            "Create seasonal content calendar"
          ]
        };
        
        analysisResults.push(mockAnalysis);
      }

      // Generate AI-powered content suggestions
      const suggestions: ContentSuggestion[] = [
        {
          title: "5 Australian Business Compliance Changes in 2024",
          type: "Educational Guide",
          reasoning: "High search volume, low competition, establishes authority",
          keywords: ["Australian business compliance", "2024 regulations", "SME compliance"],
          difficulty: "Medium",
          impact: "High"
        },
        {
          title: "How [Your Industry] Businesses Saved Money During EOFY",
          type: "Case Study",
          reasoning: "Seasonal relevance, builds trust, showcases expertise",
          keywords: ["EOFY savings", industry, "tax benefits"],
          difficulty: "Easy",
          impact: "High"
        },
        {
          title: "Local Business Spotlight: Success Stories from [Your City]",
          type: "Community Content",
          reasoning: "Local SEO boost, community engagement, networking",
          keywords: ["local business", "success stories", "community"],
          difficulty: "Easy",
          impact: "Medium"
        },
        {
          title: "The Future of [Your Industry] in Australia: 2024 Trends",
          type: "Industry Insight",
          reasoning: "Thought leadership, shareability, long-term value",
          keywords: ["industry trends", "Australian market", "2024 predictions"],
          difficulty: "Hard",
          impact: "High"
        },
        {
          title: "Behind the Scenes: A Day in the Life at [Your Business]",
          type: "Brand Story",
          reasoning: "Humanizes brand, builds connection, easy to create",
          keywords: ["behind the scenes", "company culture", "team"],
          difficulty: "Easy",
          impact: "Medium"
        }
      ];

      // Generate market insights
      const insights = `Based on the analysis of ${totalUrls} websites in the ${industry || "your"} industry:

📊 Market Opportunity: There's a significant content gap in Australian-focused industry content. Most competitors are using generic international content.

🎯 Content Strategy: Focus on local market insights, Australian compliance, and seasonal business cycles (EOFY, Christmas, etc.).

💡 Quick Wins: Start with customer testimonials and local success stories - these are easy to create and highly effective for Australian audiences.

🚀 Competitive Advantage: Regular, Australian-focused content will differentiate you from competitors who post sporadically or use generic content.

📈 SEO Opportunity: Local keywords combined with industry expertise have low competition but high conversion potential.`;

      setAnalysis(analysisResults);
      setContentSuggestions(suggestions);
      setMarketInsights(insights);
      setProgress(100);

      toast({
        title: "Scan Complete!",
        description: `Analyzed ${totalUrls} websites and generated ${suggestions.length} content opportunities`,
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

  const generateContentFromSuggestion = (suggestion: ContentSuggestion) => {
    // This would integrate with the complete content generator
    toast({
      title: "Generating Content",
      description: `Creating: ${suggestion.title}`,
    });
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