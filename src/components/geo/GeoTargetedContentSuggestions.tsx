import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Hash, Target, Sparkles, RefreshCw, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';

interface LocationData {
  state: string;
  city: string;
  postcode: string;
  region: string;
  timezone: string;
  population: number;
  economic_indicators: {
    unemployment_rate: number;
    median_income: number;
    business_growth: number;
  };
}

interface LocalEvent {
  id: string;
  name: string;
  date: string;
  category: string;
  description: string;
  venue: string;
  hashtags: string[];
  business_opportunities: string[];
}

interface ContentSuggestion {
  id: string;
  title: string;
  content: string;
  hashtags: string[];
  best_posting_time: string;
  target_audience: string;
  content_type: 'post' | 'story' | 'reel' | 'article';
  relevance_score: number;
}

const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales', cities: ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast'] },
  { value: 'VIC', label: 'Victoria', cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo'] },
  { value: 'QLD', label: 'Queensland', cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Cairns'] },
  { value: 'WA', label: 'Western Australia', cities: ['Perth', 'Fremantle', 'Bunbury', 'Geraldton'] },
  { value: 'SA', label: 'South Australia', cities: ['Adelaide', 'Mount Gambier', 'Whyalla'] },
  { value: 'TAS', label: 'Tasmania', cities: ['Hobart', 'Launceston', 'Devonport'] },
  { value: 'ACT', label: 'Australian Capital Territory', cities: ['Canberra'] },
  { value: 'NT', label: 'Northern Territory', cities: ['Darwin', 'Alice Springs'] },
];

const INDUSTRY_TYPES = [
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'hospitality', label: 'Hospitality & Food' },
  { value: 'trades', label: 'Trades & Construction' },
  { value: 'professional', label: 'Professional Services' },
  { value: 'wellness', label: 'Health & Wellness' },
  { value: 'education', label: 'Education & Training' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance & Insurance' },
];

export const GeoTargetedContentSuggestions = () => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [localEvents, setLocalEvents] = useState<LocalEvent[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  const { toast } = useToast();
  const { currentProfile } = useBusinessProfile();

  const detectUserLocation = async () => {
    try {
      // Try to get user's location via browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocode to get Australian location data
            // In a real implementation, this would call a geocoding service
            const mockLocation = {
              state: 'NSW',
              city: 'Sydney',
              postcode: '2000',
              region: 'Greater Sydney',
              timezone: 'Australia/Sydney',
              population: 5312000,
              economic_indicators: {
                unemployment_rate: 3.8,
                median_income: 87000,
                business_growth: 2.3
              }
            };
            
            setLocationData(mockLocation);
            setSelectedState('NSW');
            setSelectedCity('Sydney');
            setAutoDetected(true);
            
            toast({
              title: "Location detected",
              description: "Found your location: Sydney, NSW",
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
            toast({
              title: "Location detection failed",
              description: "Please select your location manually",
              variant: "destructive",
            });
          }
        );
      }
    } catch (error) {
      console.error('Location detection error:', error);
    }
  };

  const fetchLocalEvents = async (state: string, city: string) => {
    // Mock local events data - in production this would fetch from a real events API
    const mockEvents: LocalEvent[] = [
      {
        id: '1',
        name: 'Sydney Food & Wine Festival',
        date: '2025-02-15',
        category: 'Food & Drink',
        description: 'Annual celebration of Sydney\'s culinary scene',
        venue: 'Circular Quay',
        hashtags: ['#SydneyFood', '#FoodFestival', '#SydneyEvents', '#Local'],
        business_opportunities: [
          'Catering partnerships',
          'Pop-up restaurant opportunities',
          'Social media content creation',
          'Food photography services'
        ]
      },
      {
        id: '2',
        name: 'Australia Day Celebrations',
        date: '2025-01-26',
        category: 'National Holiday',
        description: 'Australia Day festivities across Sydney',
        venue: 'Sydney Harbour',
        hashtags: ['#AustraliaDay', '#SydneyHarbour', '#Aussie', '#Patriotic'],
        business_opportunities: [
          'Australian-themed promotions',
          'Flag and merchandise sales',
          'Community event sponsorship',
          'Patriotic social content'
        ]
      },
      {
        id: '3',
        name: 'Royal Easter Show',
        date: '2025-04-10',
        category: 'Agricultural',
        description: 'Sydney\'s premier agricultural and entertainment event',
        venue: 'Olympic Park',
        hashtags: ['#EasterShow', '#Sydney', '#Agriculture', '#Family'],
        business_opportunities: [
          'Agricultural equipment sales',
          'Family entertainment services',
          'Food vendor opportunities',
          'Educational workshops'
        ]
      }
    ];

    setLocalEvents(mockEvents);
  };

  const generateLocationContent = async () => {
    if (!selectedState || !selectedCity || !selectedIndustry) {
      toast({
        title: "Missing information",
        description: "Please select state, city, and industry",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock content suggestions based on location and industry
      const suggestions: ContentSuggestion[] = [
        {
          id: '1',
          title: `${selectedCity} ${selectedIndustry} Spotlight`,
          content: `🌟 Proud to serve the amazing ${selectedCity} community! Did you know ${selectedCity} has over ${locationData?.population?.toLocaleString()} residents who value quality ${selectedIndustry} services? \n\nWe're here to support local businesses and families with [your service]. \n\n#${selectedCity}Business #Local${selectedIndustry} #${selectedState}Pride #CommunityFirst`,
          hashtags: [`#${selectedCity}Business`, `#Local${selectedIndustry}`, `#${selectedState}Pride`, '#CommunityFirst'],
          best_posting_time: '6:00 PM',
          target_audience: `Local ${selectedCity} residents`,
          content_type: 'post',
          relevance_score: 9.2
        },
        {
          id: '2',
          title: 'Local Economic Update',
          content: `📈 Great news for ${selectedCity}! With unemployment at just ${locationData?.economic_indicators.unemployment_rate}% and business growth at ${locationData?.economic_indicators.business_growth}%, our local economy is thriving! \n\nPerfect time to invest in [your ${selectedIndustry} service]. Let's grow together! \n\n#${selectedCity}Economy #BusinessGrowth #Local${selectedIndustry}`,
          hashtags: [`#${selectedCity}Economy`, '#BusinessGrowth', `#Local${selectedIndustry}`],
          best_posting_time: '8:00 AM',
          target_audience: 'Local business owners',
          content_type: 'post',
          relevance_score: 8.7
        },
        {
          id: '3',
          title: 'Weekend Local Feature',
          content: `🌆 This weekend in ${selectedCity}! \n\nLooking for quality ${selectedIndustry} services? We're your local experts with [X years] serving the ${selectedCity} community. \n\nBook your consultation today and experience the difference local expertise makes! \n\n#Weekend${selectedCity} #Local${selectedIndustry} #BookNow #Community`,
          hashtags: [`#Weekend${selectedCity}`, `#Local${selectedIndustry}`, '#BookNow', '#Community'],
          best_posting_time: '10:00 AM',
          target_audience: 'Weekend browsers',
          content_type: 'post',
          relevance_score: 7.8
        }
      ];

      setContentSuggestions(suggestions);
      
      toast({
        title: "Content generated",
        description: `Generated ${suggestions.length} location-specific suggestions`,
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedState && selectedCity) {
      fetchLocalEvents(selectedState, selectedCity);
    }
  }, [selectedState, selectedCity]);

  const selectedStateData = AUSTRALIAN_STATES.find(state => state.value === selectedState);
  const availableCities = selectedStateData?.cities || [];

  const copyContent = async (content: string, hashtags: string[]) => {
    const fullContent = `${content}\n\n${hashtags.join(' ')}`;
    await navigator.clipboard.writeText(fullContent);
    
    toast({
      title: "Content copied",
      description: "Post content copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Geo-Targeted Content Suggestions</h2>
          <p className="text-muted-foreground">
            Location-specific content ideas for Australian businesses
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={detectUserLocation}
          disabled={autoDetected}
        >
          <MapPin className="h-4 w-4 mr-2" />
          {autoDetected ? 'Location Detected' : 'Detect Location'}
        </Button>
      </div>

      {/* Location Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Target Location & Industry
          </CardTitle>
          <CardDescription>
            Select your target location and industry for personalized content suggestions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">State/Territory</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state..." />
                </SelectTrigger>
                <SelectContent>
                  {AUSTRALIAN_STATES.map(state => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <Select 
                value={selectedCity} 
                onValueChange={setSelectedCity}
                disabled={!selectedState}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map(city => (
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
                  <SelectValue placeholder="Select industry..." />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_TYPES.map(industry => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateLocationContent}
            disabled={!selectedState || !selectedCity || !selectedIndustry || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Location Content...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Location-Targeted Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Location Data Overview */}
      {locationData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {selectedCity}, {selectedState} Overview
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {locationData.population.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Population</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {locationData.economic_indicators.unemployment_rate}%
                </div>
                <div className="text-sm text-muted-foreground">Unemployment Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${locationData.economic_indicators.median_income.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Median Income</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="suggestions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suggestions">Content Suggestions</TabsTrigger>
          <TabsTrigger value="events">Local Events</TabsTrigger>
          <TabsTrigger value="hashtags">Location Hashtags</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          {contentSuggestions.length > 0 ? (
            <div className="grid gap-4">
              {contentSuggestions.map(suggestion => (
                <Card key={suggestion.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{suggestion.title}</h3>
                          <Badge variant="secondary">
                            Score: {suggestion.relevance_score}/10
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>📍 {suggestion.target_audience}</span>
                          <span>⏰ Best time: {suggestion.best_posting_time}</span>
                          <span>📝 {suggestion.content_type}</span>
                        </div>
                        
                        <div className="bg-muted/50 rounded-lg p-4 mb-3">
                          <pre className="whitespace-pre-wrap text-sm">{suggestion.content}</pre>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {suggestion.hashtags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyContent(suggestion.content, suggestion.hashtags)}
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No content suggestions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Select your location and industry to generate targeted content ideas
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {localEvents.length > 0 ? (
            <div className="grid gap-4">
              {localEvents.map(event => (
                <Card key={event.id}>
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
                      {event.description} • {event.venue}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Business Opportunities:</h4>
                      <ul className="space-y-1">
                        {event.business_opportunities.map((opportunity, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Suggested Hashtags:</h4>
                      <div className="flex flex-wrap gap-1">
                        {event.hashtags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No local events found</h3>
                <p className="text-muted-foreground">
                  Select a location to see upcoming local events and opportunities
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="hashtags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Location-Specific Hashtags
              </CardTitle>
              <CardDescription>
                Trending and recommended hashtags for {selectedCity}, {selectedState}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {selectedCity && selectedState && (
                <>
                  <div>
                    <h4 className="font-medium mb-3">Local Business Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        `#${selectedCity}Business`,
                        `#Local${selectedCity}`,
                        `#${selectedState}Pride`,
                        `#Support${selectedCity}`,
                        `#${selectedCity}Community`,
                        `#${selectedCity}Local`
                      ].map((tag, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Industry + Location Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        `#${selectedCity}${selectedIndustry}`,
                        `#Local${selectedIndustry}`,
                        `#${selectedIndustry}${selectedState}`,
                        `#Best${selectedCity}${selectedIndustry}`,
                        `#${selectedCity}Services`
                      ].map((tag, index) => (
                        <Badge key={index} variant="outline" className="cursor-pointer">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Trending Local Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        `#${selectedCity}Life`,
                        `#Visit${selectedCity}`,
                        `#${selectedCity}Made`,
                        `#Proud${selectedCity}`,
                        `#${selectedCity}Love`,
                        `#${selectedState}Business`
                      ].map((tag, index) => (
                        <Badge key={index} variant="default" className="cursor-pointer">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {!selectedCity || !selectedState && (
                <div className="text-center py-8 text-muted-foreground">
                  <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select your location to see recommended hashtags</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};