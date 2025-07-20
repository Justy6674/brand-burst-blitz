import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, Lightbulb, RefreshCw, Download, Share2, BarChart3, Sparkles, MapPin, Star, Target, Globe, Copy, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';

interface DataPoint {
  measure: string;
  value: number;
  period: string;
  change: number;
  unit: string;
  description: string;
}

interface MarketInsight {
  category: string;
  title: string;
  description: string;
  data_points: DataPoint[];
  content_suggestions: string[];
  industry_relevance: string[];
}

interface SeasonalEvent {
  name: string;
  date: string;
  category: string;
  business_opportunities: string[];
}

const INDUSTRY_OPTIONS = [
  { value: 'all', label: 'All Industries' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'trades', label: 'Trades & Construction' },
  { value: 'hospitality', label: 'Hospitality & Food' },
  { value: 'professional', label: 'Professional Services' },
  { value: 'finance', label: 'Finance & Insurance' },
  { value: 'technology', label: 'Technology' },
  { value: 'education', label: 'Education & Training' },
];

export const AustralianMarketDataFeeds = () => {
  const [marketData, setMarketData] = useState<MarketInsight[]>([]);
  const [seasonalEvents, setSeasonalEvents] = useState<SeasonalEvent[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [generatedPost, setGeneratedPost] = useState<string>('');
  
  const { toast } = useToast();
  const { currentProfile } = useBusinessProfile();

  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('australian-market-data', {
        body: { action: 'overview' }
      });

      if (error) throw error;

      setMarketData(data.data);
      setLastUpdated(data.last_updated);
      
      toast({
        title: "Market data updated",
        description: "Latest Australian market insights loaded successfully",
      });
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: "Error loading market data",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContentSuggestions = async (industry: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('australian-market-data', {
        body: { action: 'content_suggestions', industry }
      });

      if (error) throw error;
      setContentSuggestions(data.suggestions);
    } catch (error) {
      console.error('Error fetching content suggestions:', error);
    }
  };

  const fetchSeasonalEvents = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('australian-market-data', {
        body: { action: 'seasonal_events' }
      });

      if (error) throw error;
      setSeasonalEvents(data.events);
    } catch (error) {
      console.error('Error fetching seasonal events:', error);
    }
  };

  const generateMarketPost = async (category: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('australian-market-data', {
        body: { 
          action: 'generate_post',
          industry: selectedIndustry,
          dataCategory: category
        }
      });

      if (error) throw error;
      
      setGeneratedPost(data.content);
      toast({
        title: "Market post generated",
        description: "Ready to use in your content strategy",
      });
    } catch (error) {
      console.error('Error generating post:', error);
      toast({
        title: "Error generating post",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    fetchSeasonalEvents();
  }, []);

  useEffect(() => {
    if (selectedIndustry) {
      fetchContentSuggestions(selectedIndustry);
    }
  }, [selectedIndustry]);

  const formatValue = (value: number, unit: string) => {
    if (unit === 'percent') return `${value}%`;
    if (unit === 'AUD') return `$${value.toLocaleString()}`;
    return `${value.toLocaleString()}${unit === 'index points' ? '' : ` ${unit}`}`;
  };

  const getChangeIcon = (change: number) => {
    return change > 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getChangeColor = (change: number) => {
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Australian Market Data Feeds</h2>
          <p className="text-muted-foreground">Real-time insights and content based on Australian economic data</p>
        </div>
        <Button onClick={fetchMarketData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {lastUpdated && (
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(lastUpdated).toLocaleString('en-AU')}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="insights">Content Insights</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Events</TabsTrigger>
          <TabsTrigger value="generator">Post Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketData.map((insight, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                  <CardDescription>{insight.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {insight.data_points.slice(0, 2).map((dataPoint, dpIndex) => (
                    <div key={dpIndex} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{dataPoint.measure}</span>
                        {getChangeIcon(dataPoint.change)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {formatValue(dataPoint.value, dataPoint.unit)}
                        </span>
                        <span className={`text-sm ${getChangeColor(dataPoint.change)}`}>
                          {dataPoint.change > 0 ? '+' : ''}{dataPoint.change}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {dataPoint.description} • {dataPoint.period}
                      </p>
                    </div>
                  ))}

                  <div className="pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => generateMarketPost(insight.category)}
                      disabled={isLoading}
                    >
                      <BarChart3 className="h-3 w-3 mr-2" />
                      Generate Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry-Specific Content Suggestions</CardTitle>
              <CardDescription>
                AI-generated content ideas based on current market data
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="mb-4">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-3">
                {contentSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{suggestion}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-3 w-3 mr-2" />
                      Use
                    </Button>
                  </div>
                ))}
              </div>
              
              {contentSuggestions.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select an industry to see targeted content suggestions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          <div className="grid gap-4">
            {seasonalEvents.map((event, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {event.name}
                    </CardTitle>
                    <Badge variant="outline">
                      {new Date(event.date).toLocaleDateString('en-AU')}
                    </Badge>
                  </div>
                  <CardDescription>
                    {event.category.replace('_', ' ').toUpperCase()}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">Business Opportunities:</h4>
                    <ul className="space-y-1">
                      {event.business_opportunities.map((opportunity, opIndex) => (
                        <li key={opIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full"></span>
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Data Post Generator</CardTitle>
              <CardDescription>
                Generate engaging social media posts using live Australian market data
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {marketData.map((insight, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start text-left"
                    onClick={() => generateMarketPost(insight.category)}
                    disabled={isLoading}
                  >
                    <span className="font-medium">{insight.title}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Generate post using this data
                    </span>
                  </Button>
                ))}
              </div>

              {generatedPost && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Generated Post:</h4>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm">{generatedPost}</pre>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Share2 className="h-3 w-3 mr-2" />
                      Use in Content
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-2" />
                      Copy Text
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}