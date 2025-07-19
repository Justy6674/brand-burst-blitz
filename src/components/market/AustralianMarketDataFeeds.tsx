import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  MapPin, 
  Calendar, 
  BarChart3, 
  Lightbulb,
  Copy,
  RefreshCw,
  Globe,
  Target,
  Star,
  Sparkles
} from 'lucide-react';

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  metadata: any;
  created_at: string;
}

export function AustralianMarketDataFeeds() {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Sydney');
  const [selectedIndustry, setSelectedIndustry] = useState('retail');
  const { toast } = useToast();

  const australianCities = [
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra'
  ];

  const industries = [
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'hospitality', label: 'Hospitality & Food Service' },
    { value: 'trades', label: 'Trades & Construction' },
    { value: 'professional', label: 'Professional Services' },
    { value: 'wellness', label: 'Health & Wellness' },
    { value: 'education', label: 'Education & Training' }
  ];

  const fetchInsights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('strategic_content_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('recommendation_type', 'market_data')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInsights((data || []) as MarketInsight[]);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: "Fetch Error",
        description: "Failed to load market insights",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMarketInsights = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-market-insights', {
        body: {
          userId: user.id,
          industry: selectedIndustry,
          location: selectedLocation
        }
      });

      if (error) throw error;

      toast({
        title: "Insights Generated",
        description: `Generated ${data.insights.posts.length} content suggestions based on latest market data`,
      });

      await fetchInsights();
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate market insights",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyContent = async (content: string, hashtags: string[]) => {
    const fullContent = `${content}\n\n${hashtags.join(' ')}`;
    await navigator.clipboard.writeText(fullContent);
    
    toast({
      title: "Content Copied",
      description: "Post content copied to clipboard"
    });
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const latestInsight = insights[0];
  const economicData = latestInsight?.metadata?.economic_indicators;
  const industryData = latestInsight?.metadata?.industry_data;
  const locationData = latestInsight?.metadata?.location_insights;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Australian Market Data Feeds</h2>
          <p className="text-muted-foreground">Real-time insights and content based on Australian economic data</p>
        </div>
        <Button onClick={fetchInsights} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Generator Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate Market-Based Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Australian city" />
                </SelectTrigger>
                <SelectContent>
                  {australianCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateMarketInsights} 
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Market Insights...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Content from Latest Market Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Market Overview */}
      {economicData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">GDP Growth</p>
                  <p className="text-2xl font-bold text-green-600">+{economicData.gdp_growth}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Consumer Confidence</p>
                  <p className="text-2xl font-bold text-blue-600">{economicData.consumer_confidence}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{economicData.interest_rate}%</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Retail Sales Growth</p>
                  <p className="text-2xl font-bold text-purple-600">+{economicData.retail_sales_growth}%</p>
                </div>
                <Globe className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Tabs */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Generated Content</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="insights">Business Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Market-Based Content Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              {!latestInsight ? (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No market insights generated yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Generate content based on the latest Australian economic data.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {latestInsight.metadata.generated_content.posts.map((post, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="capitalize">
                                {post.post_type}
                              </Badge>
                              <Badge variant="outline">
                                <MapPin className="h-3 w-3 mr-1" />
                                {latestInsight.metadata.location}
                              </Badge>
                            </div>
                            <p className="text-sm mb-3">{post.content}</p>
                            <div className="flex flex-wrap gap-1">
                              {post.hashtags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            onClick={() => copyContent(post.content, post.hashtags)}
                            variant="outline"
                            size="sm"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {economicData && (
              <Card>
                <CardHeader>
                  <CardTitle>Economic Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {economicData.key_trends?.map((trend: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{trend}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {industryData && (
              <Card>
                <CardHeader>
                  <CardTitle>Industry Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">Opportunities</h4>
                      <ul className="space-y-1 text-sm">
                        {industryData.opportunities?.map((opp: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                            {opp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-blue-600 mb-2">Key Trends</h4>
                      <ul className="space-y-1 text-sm">
                        {industryData.key_trends?.map((trend: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                            {trend}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locationData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {latestInsight?.metadata.location} Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Economic Highlights</h4>
                      <ul className="space-y-1 text-sm">
                        {locationData.economic_highlights?.map((highlight: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Upcoming Events</h4>
                      <ul className="space-y-1 text-sm">
                        {locationData.local_events?.map((event: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {event}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Action Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-1">Content Strategy</h4>
                    <p className="text-sm text-green-700">
                      Leverage current economic confidence in your messaging. Highlight growth opportunities.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-1">Timing</h4>
                    <p className="text-sm text-blue-700">
                      Current market conditions are favorable. Consider increasing content frequency.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-1">Local Focus</h4>
                    <p className="text-sm text-purple-700">
                      Emphasize local community connections and regional economic stories.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}