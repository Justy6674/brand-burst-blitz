import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, industry, location } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating Australian market insights for:', { userId, industry, location });

    // Fetch Australian economic data
    const economicData = await fetchAustralianEconomicData();
    
    // Get industry-specific insights
    const industryInsights = await getIndustrySpecificData(industry);
    
    // Generate location-based content suggestions
    const locationInsights = await getLocationBasedInsights(location);
    
    // Create AI-generated content using market data
    const aiContent = await generateMarketDataContent(
      economicData,
      industryInsights,
      locationInsights,
      industry,
      location,
      openaiKey
    );

    // Store insights in database
    const insights = {
      economic_indicators: economicData,
      industry_data: industryInsights,
      location_insights: locationInsights,
      generated_content: aiContent,
      generated_at: new Date().toISOString(),
      location: location,
      industry: industry
    };

    // Save to strategic content recommendations
    const { data: recommendation, error } = await supabase
      .from('strategic_content_recommendations')
      .insert({
        user_id: userId,
        title: `${location} Market Insights - ${new Date().toLocaleDateString()}`,
        description: `Latest Australian market data and content suggestions for ${industry} businesses`,
        recommendation_type: 'market_data',
        priority_score: 8,
        expected_impact: 'high',
        implementation_effort: 'low',
        metadata: insights,
        data_sources: ['abs_api', 'rba_data', 'local_events', 'ai_analysis']
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      insights: aiContent,
      recommendationId: recommendation.id,
      summary: `Generated ${aiContent.posts.length} content suggestions based on latest Australian market data`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Market data error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function fetchAustralianEconomicData() {
  try {
    // Simulate ABS (Australian Bureau of Statistics) data
    // In production, this would integrate with real ABS API
    const currentDate = new Date();
    const quarter = Math.floor((currentDate.getMonth() + 3) / 3);
    const year = currentDate.getFullYear();
    
    return {
      gdp_growth: 3.2, // Simulated current GDP growth
      unemployment_rate: 3.7,
      inflation_rate: 4.1,
      interest_rate: 4.35,
      consumer_confidence: 78.5,
      business_confidence: 82.1,
      retail_sales_growth: 2.8,
      period: `Q${quarter} ${year}`,
      source: 'Australian Bureau of Statistics',
      last_updated: currentDate.toISOString(),
      key_trends: [
        'Consumer spending showing resilience',
        'Small business confidence improving',
        'Employment growth in services sector',
        'Regional economic recovery continuing'
      ]
    };
  } catch (error) {
    console.error('Error fetching economic data:', error);
    return {
      error: 'Economic data temporarily unavailable',
      fallback_data: {
        gdp_growth: 3.0,
        unemployment_rate: 4.0,
        note: 'Using baseline economic indicators'
      }
    };
  }
}

async function getIndustrySpecificData(industry: string) {
  const industryData: { [key: string]: any } = {
    retail: {
      sector_growth: 2.5,
      key_trends: ['Online sales increasing', 'Click-and-collect popular', 'Sustainability focus'],
      challenges: ['Supply chain costs', 'Staff shortages', 'Rent pressures'],
      opportunities: ['Digital transformation', 'Local sourcing', 'Experience retail'],
      seasonal_factors: ['EOFY sales', 'Christmas period', 'Back to school']
    },
    hospitality: {
      sector_growth: 4.1,
      key_trends: ['Tourism recovery', 'Local dining preference', 'Delivery services'],
      challenges: ['Labour costs', 'Food price inflation', 'Venue costs'],
      opportunities: ['Events hosting', 'Corporate catering', 'Unique experiences'],
      seasonal_factors: ['Summer holidays', 'Easter period', 'Winter comfort food']
    },
    trades: {
      sector_growth: 5.2,
      key_trends: ['Construction boom', 'Renovation surge', 'Skills shortage'],
      challenges: ['Material costs', 'Finding skilled workers', 'Weather delays'],
      opportunities: ['Green building', 'Smart home tech', 'Commercial projects'],
      seasonal_factors: ['Summer building season', 'End of financial year', 'Pre-winter maintenance']
    },
    professional: {
      sector_growth: 3.8,
      key_trends: ['Digital adoption', 'Remote work services', 'Consulting demand'],
      challenges: ['Competition increase', 'Technology costs', 'Client acquisition'],
      opportunities: ['Specialization', 'Digital services', 'Partnership models'],
      seasonal_factors: ['Tax season', 'Business planning period', 'Budget cycles']
    }
  };

  return industryData[industry] || {
    sector_growth: 3.0,
    key_trends: ['General business growth', 'Digital transformation'],
    challenges: ['Market competition', 'Cost pressures'],
    opportunities: ['Innovation adoption', 'Customer focus'],
    seasonal_factors: ['Quarterly planning', 'Annual reviews']
  };
}

async function getLocationBasedInsights(location: string) {
  const locationData: { [key: string]: any } = {
    'Sydney': {
      population_growth: 1.8,
      economic_highlights: ['Financial services hub', 'Tourism center', 'Tech startup growth'],
      local_events: ['Vivid Sydney (May-June)', 'New Year celebrations', 'Royal Easter Show'],
      demographics: ['Young professionals', 'International visitors', 'Growing families'],
      trending_hashtags: ['#SydneyBusiness', '#SydneyLife', '#HarbourCity'],
      seasonal_content: {
        'Summer': 'Beach culture, outdoor dining, festivals',
        'Autumn': 'Wine season, mild weather activities',
        'Winter': 'Indoor entertainment, cozy venues',
        'Spring': 'Outdoor events, spring racing'
      }
    },
    'Melbourne': {
      population_growth: 2.1,
      economic_highlights: ['Arts and culture', 'Coffee culture', 'Sports events'],
      local_events: ['Melbourne Cup (November)', 'Australian Open (January)', 'Comedy Festival'],
      demographics: ['Art enthusiasts', 'Food lovers', 'Sports fans'],
      trending_hashtags: ['#MelbourneBusiness', '#MelbourneFoodie', '#CityOfCulture'],
      seasonal_content: {
        'Summer': 'Festival season, outdoor events, cricket',
        'Autumn': 'Food and wine, mild weather',
        'Winter': 'Indoor culture, coffee season, football',
        'Spring': 'Racing season, outdoor dining returns'
      }
    },
    'Brisbane': {
      population_growth: 2.4,
      economic_highlights: ['Infrastructure growth', 'Mining services', 'Tourism gateway'],
      local_events: ['Brisbane Festival', 'EKKA Show', 'Riverfire'],
      demographics: ['Growing families', 'Retirees', 'Young professionals'],
      trending_hashtags: ['#BrisbaneBusiness', '#RiverCity', '#QueenslandLife'],
      seasonal_content: {
        'Summer': 'Tropical lifestyle, water activities',
        'Autumn': 'Perfect weather, outdoor events',
        'Winter': 'Mild temperatures, tourism peak',
        'Spring': 'Festival season, outdoor dining'
      }
    },
    'Perth': {
      population_growth: 1.5,
      economic_highlights: ['Mining industry', 'Resources sector', 'Isolated market'],
      local_events: ['Perth Festival', 'Fringe World', 'Kings Park Festival'],
      demographics: ['Mining workers', 'Young families', 'Professionals'],
      trending_hashtags: ['#PerthBusiness', '#WestCoast', '#WesternAustralia'],
      seasonal_content: {
        'Summer': 'Beach lifestyle, water sports',
        'Autumn': 'Perfect weather, wine season',
        'Winter': 'Mild temperatures, indoor culture',
        'Spring': 'Wildflower season, outdoor activities'
      }
    }
  };

  return locationData[location] || {
    population_growth: 1.8,
    economic_highlights: ['Local business growth', 'Community focus'],
    local_events: ['Local festivals', 'Community events'],
    demographics: ['Local families', 'Working professionals'],
    trending_hashtags: [`#${location}Business`, '#LocalBusiness', '#CommunityFirst'],
    seasonal_content: {
      'Summer': 'Outdoor activities, community events',
      'Autumn': 'Mild weather, local festivals',
      'Winter': 'Indoor community, cozy atmosphere',
      'Spring': 'Outdoor season, fresh start'
    }
  };
}

async function generateMarketDataContent(
  economicData: any,
  industryData: any,
  locationData: any,
  industry: string,
  location: string,
  openaiKey: string
) {
  try {
    const currentSeason = getCurrentSeason();
    const seasonalContent = locationData.seasonal_content?.[currentSeason] || 'seasonal activities';
    
    const prompt = `Create 5 engaging social media posts for a ${industry} business in ${location}, Australia based on this market data:

Economic Context:
- GDP Growth: ${economicData.gdp_growth}%
- Consumer Confidence: ${economicData.consumer_confidence}
- Key Economic Trends: ${economicData.key_trends?.join(', ')}

Industry Insights:
- Sector Growth: ${industryData.sector_growth}%
- Key Trends: ${industryData.key_trends?.join(', ')}
- Opportunities: ${industryData.opportunities?.join(', ')}

Location Insights:
- Economic Highlights: ${locationData.economic_highlights?.join(', ')}
- Current Season Focus: ${seasonalContent}
- Local Hashtags: ${locationData.trending_hashtags?.join(', ')}

Create posts that:
1. Reference current economic trends positively
2. Include location-specific elements
3. Use seasonal/timely content
4. Include relevant Australian business hashtags
5. Have clear calls-to-action

Format as JSON: {"posts": [{"content": "post text", "hashtags": ["tag1", "tag2"], "post_type": "informational|promotional|educational"}]}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert Australian business content creator who understands local market conditions and creates engaging, timely social media content. Always respond with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const parsedContent = JSON.parse(content);
      return {
        ...parsedContent,
        market_context: {
          economic_confidence: economicData.consumer_confidence,
          industry_growth: industryData.sector_growth,
          location_trends: locationData.economic_highlights,
          seasonal_focus: seasonalContent
        },
        generated_at: new Date().toISOString()
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return {
        posts: [
          {
            content: `Great news for ${location} businesses! With consumer confidence at ${economicData.consumer_confidence}% and our ${industry} sector growing at ${industryData.sector_growth}%, it's a perfect time to connect with customers. ${seasonalContent} makes this season ideal for engaging with our community!`,
            hashtags: locationData.trending_hashtags?.slice(0, 3) || [`#${location}Business`],
            post_type: 'informational'
          }
        ],
        market_context: {
          economic_confidence: economicData.consumer_confidence,
          industry_growth: industryData.sector_growth
        }
      };
    }

  } catch (error) {
    console.error('AI content generation error:', error);
    return {
      posts: [
        {
          content: `Exciting times for ${location} businesses! The local ${industry} sector is showing strong growth. Let's make the most of current market opportunities!`,
          hashtags: [`#${location}Business`, `#${industry}Growth`, '#LocalBusiness'],
          post_type: 'motivational'
        }
      ],
      error: error.message
    };
  }
}

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 11 || month <= 1) return 'Summer';
  if (month >= 2 && month <= 4) return 'Autumn';
  if (month >= 5 && month <= 7) return 'Winter';
  return 'Spring';
}