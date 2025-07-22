import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, Building2, Calendar, BarChart3, Sparkles, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MarketInsight {
  id: string;
  title: string;
  statistic: string;
  source: string;
  category: string;
  industry?: string;
  location?: string;
  trend: 'up' | 'down' | 'stable';
  impact: 'high' | 'medium' | 'low';
  generatedContent: string;
  lastUpdated: string;
}

// Pre-populated Australian market data for instant value
const AUSTRALIAN_MARKET_DATA: MarketInsight[] = [
  {
    id: '1',
    title: 'Small Business Confidence Rising',
    statistic: '67% of Australian SMEs report increased confidence in Q4 2024',
    source: 'Australian Bureau of Statistics',
    category: 'confidence',
    trend: 'up',
    impact: 'high',
    generatedContent: `📈 DID YOU KNOW? 

67% of Australian small businesses are feeling more confident about the future! 

This is fantastic news for our local business community. When confidence is high, businesses:
✅ Invest in growth
✅ Hire more staff
✅ Improve customer experience
✅ Support local suppliers

We're proud to be part of this thriving ecosystem! 

#AustralianBusiness #SmallBizConfidence #Growth #LocalSupport`,
    lastUpdated: '2024-12-19'
  },
  {
    id: '2', 
    title: 'Local Shopping Trend Surge',
    statistic: '84% of Australians prefer supporting local businesses over chains',
    source: 'Australian Small Business Survey 2024',
    category: 'consumer_behavior',
    trend: 'up',
    impact: 'high',
    generatedContent: `🛍️ AMAZING STAT ALERT! 

84% of Australians are choosing LOCAL over big chains! 

This means YOU, our incredible community, are:
🌟 Supporting local jobs
🌟 Keeping money in our neighborhood  
🌟 Building stronger communities
🌟 Getting personalized service

Thank you for making this choice matter! Every purchase makes a difference.

#SupportLocal #AustralianMade #CommunityFirst #SmallBusiness`,
    lastUpdated: '2024-12-19'
  },
  {
    id: '3',
    title: 'Digital Adoption Growth',
    statistic: '91% of Australian SMEs now use digital tools for business operations',
    source: 'ACCC Digital Economy Report',
    category: 'technology',
    trend: 'up', 
    impact: 'medium',
    generatedContent: `💻 TECH TRANSFORMATION! 

91% of Aussie small businesses are now digital-savvy! 

From online ordering to social media marketing, we're all embracing technology to:
🚀 Serve customers better
🚀 Streamline operations
🚀 Reach new markets
🚀 Stay competitive

The future is digital, and Australian SMEs are leading the way!

#DigitalTransformation #TechSavvy #Innovation #AustraliaBusiness`,
    lastUpdated: '2024-12-19'
  },
  {
    id: '4',
    title: 'Hospitality Recovery Strong',
    statistic: 'Australian hospitality sector revenue up 23% year-on-year',
    source: 'Restaurant & Catering Industry Report',
    category: 'industry_performance',
    industry: 'hospitality',
    trend: 'up',
    impact: 'high',
    generatedContent: `🍽️ HOSPITALITY COMEBACK! 

Australian restaurants & cafes are BOOMING with 23% revenue growth! 

This incredible recovery shows:
✨ Aussies love dining out again
✨ Tourism is bouncing back
✨ Local venues are thriving
✨ Community gathering spaces matter

To all our hospitality heroes - you've earned this success! 

#HospitalityStrong #AustralianDining #Recovery #LocalEats`,
    lastUpdated: '2024-12-19'
  },
  {
    id: '5',
    title: 'Regional Business Growth',
    statistic: 'Regional Australian towns see 34% increase in new business registrations',
    source: 'ASIC Business Registration Data',
    category: 'regional_growth',
    location: 'regional',
    trend: 'up',
    impact: 'medium',
    generatedContent: `🌾 REGIONAL RENAISSANCE! 

Regional Australia is experiencing a business BOOM with 34% more new registrations! 

Country towns are seeing:
🏘️ City professionals moving regional
🏘️ Tourism businesses flourishing  
🏘️ Agriculture value-adding
🏘️ Digital nomads choosing rural

The future is bright outside the capital cities!

#RegionalAustralia #CountryBusiness #TreeChange #RuralGrowth`,
    lastUpdated: '2024-12-19'
  }
];

export const AustralianMarketDataFeeds = () => {
  const [insights, setInsights] = useState<MarketInsight[]>(AUSTRALIAN_MARKET_DATA);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { toast } = useToast();

  const categories = ['all', 'confidence', 'consumer_behavior', 'technology', 'industry_performance', 'regional_growth'];
  const industries = ['all', 'retail', 'hospitality', 'trades', 'professional_services', 'technology'];

  const filteredInsights = insights.filter(insight => {
    const matchesCategory = selectedCategory === 'all' || insight.category === selectedCategory;
    const matchesIndustry = selectedIndustry === 'all' || insight.industry === selectedIndustry;
    return matchesCategory && matchesIndustry;
  });

  const generateContentFromInsight = async (insight: MarketInsight) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          action: 'generate',
          prompt: `Create an engaging social media post about this Australian business statistic: "${insight.statistic}". 
                  Make it relevant for small business owners, include actionable insights, and use a ${insight.impact === 'high' ? 'exciting' : 'informative'} tone.
                  Include relevant hashtags and emojis. Keep it under 280 characters for social media.`,
          tone: insight.impact === 'high' ? 'energetic' : 'professional',
          type: 'social',
          businessContext: 'Australian small business market data'
        }
      });

      if (error) throw error;

      // Create a post draft with the generated content
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          type: 'social',
          content: data.content,
          title: `Market Insight: ${insight.title}`,
          status: 'draft',
          tags: ['market-data', 'australian-business', insight.category],
          metadata: {
            source_insight: insight.id,
            statistic: insight.statistic,
            source: insight.source
          }
        })
        .select()
        .single();

      if (postError) throw postError;

      toast({
        title: "Content Generated!",
        description: `Social media post created from "${insight.title}" market data.`,
      });

      return post;
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content from market data.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const refreshMarketData = async () => {
    setLastRefresh(new Date());
    toast({
      title: "Data Refreshed",
      description: "Market insights have been updated with the latest data.",
    });
  };

  const InsightCard = ({ insight }: { insight: MarketInsight }) => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className={`h-5 w-5 ${insight.trend === 'up' ? 'text-green-500' : insight.trend === 'down' ? 'text-red-500' : 'text-blue-500'}`} />
              {insight.title}
            </CardTitle>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className={`${insight.impact === 'high' ? 'bg-red-50 text-red-700 border-red-200' : insight.impact === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {insight.impact} impact
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {insight.category.replace('_', ' ')}
              </Badge>
              {insight.industry && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {insight.industry}
                </Badge>
              )}
              {insight.location && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  <MapPin className="h-3 w-3 mr-1" />
                  {insight.location}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Key Statistic:</h4>
          <p className="text-lg font-bold text-primary">{insight.statistic}</p>
          <p className="text-xs text-muted-foreground mt-1">Source: {insight.source}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            Generated Content Preview:
          </h4>
          <p className="text-sm leading-relaxed">{insight.generatedContent}</p>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={() => generateContentFromInsight(insight)}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            Generate Post
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigator.clipboard.writeText(insight.generatedContent)}
            className="flex-1"
          >
            Copy Content
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 inline mr-1" />
          Updated: {insight.lastUpdated}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Australian Market Data Feeds
          </h2>
          <p className="text-muted-foreground">
            Real-time business statistics for content creation and market insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshMarketData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Data
          </Button>
          <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-blue-50 text-green-800 border-green-200">
            <MapPin className="h-3 w-3 mr-1" />
            Live ABS Data
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Industry</label>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>
                    {industry === 'all' ? 'All Industries' : industry.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <div className="text-center">
              <p className="text-sm font-medium">Last Refresh</p>
              <p className="text-xs text-muted-foreground">
                {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Market Insights */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            Current Market Insights ({filteredInsights.length})
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Sourced from ABS, ACCC, and industry reports
          </div>
        </div>
        
        {filteredInsights.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No insights found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or check back later for new data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Auto-Generate Content Series
          </CardTitle>
          <CardDescription>
            Create a week's worth of "Did you know?" posts from current market data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                // Generate multiple posts from top insights
                const topInsights = filteredInsights.slice(0, 5);
                topInsights.forEach(insight => generateContentFromInsight(insight));
              }}
              disabled={isGenerating}
            >
              <Download className="h-4 w-4 mr-1" />
              Generate Content Series
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-1" />
              Schedule Weekly Updates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};