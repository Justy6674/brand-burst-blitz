import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ABSDataPoint {
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
  data_points: ABSDataPoint[];
  content_suggestions: string[];
  industry_relevance: string[];
}

// Mock ABS data structure (in production, this would fetch from real ABS API)
const MOCK_ABS_DATA: MarketInsight[] = [
  {
    category: 'business_confidence',
    title: 'Australian Small Business Confidence Index',
    description: 'Current sentiment and confidence levels among Australian small businesses',
    data_points: [
      {
        measure: 'Business Confidence Index',
        value: 52.3,
        period: '2024-12',
        change: 2.1,
        unit: 'index points',
        description: 'Above 50 indicates optimism'
      },
      {
        measure: 'Employment Intentions',
        value: 48.7,
        period: '2024-12',
        change: -1.3,
        unit: 'index points',
        description: 'Plans to hire in next 3 months'
      }
    ],
    content_suggestions: [
      "Small business confidence is rising! Now's a great time to expand your reach.",
      "With business confidence at 52.3, Australian entrepreneurs are feeling optimistic about growth.",
      "Employment intentions remain steady - perfect time to showcase your team culture."
    ],
    industry_relevance: ['all', 'professional', 'retail', 'hospitality']
  },
  {
    category: 'economic_indicators',
    title: 'Key Economic Indicators',
    description: 'Latest Australian economic performance metrics',
    data_points: [
      {
        measure: 'GDP Growth',
        value: 2.1,
        period: 'Q3 2024',
        change: 0.3,
        unit: 'percent',
        description: 'Quarterly growth rate'
      },
      {
        measure: 'Unemployment Rate',
        value: 3.9,
        period: 'Dec 2024',
        change: -0.1,
        unit: 'percent',
        description: 'National unemployment rate'
      },
      {
        measure: 'Inflation Rate',
        value: 3.2,
        period: 'Dec 2024',
        change: -0.4,
        unit: 'percent',
        description: 'Consumer Price Index annual change'
      }
    ],
    content_suggestions: [
      "With unemployment at just 3.9%, now's the perfect time to attract top talent!",
      "Australia's economy is growing at 2.1% - join the expansion with our services.",
      "Inflation cooling to 3.2% means more purchasing power for your customers."
    ],
    industry_relevance: ['professional', 'finance', 'retail']
  },
  {
    category: 'consumer_spending',
    title: 'Consumer Spending Patterns',
    description: 'How Australians are spending their money across categories',
    data_points: [
      {
        measure: 'Retail Trade Growth',
        value: 1.8,
        period: 'Dec 2024',
        change: 0.5,
        unit: 'percent',
        description: 'Monthly retail turnover growth'
      },
      {
        measure: 'Online Retail Share',
        value: 12.3,
        period: 'Dec 2024',
        change: 0.8,
        unit: 'percent',
        description: 'Percentage of total retail sales'
      },
      {
        measure: 'Hospitality Spending',
        value: 4.2,
        period: 'Dec 2024',
        change: 1.1,
        unit: 'percent growth',
        description: 'Cafes, restaurants and takeaway'
      }
    ],
    content_suggestions: [
      "Retail trade is up 1.8%! Perfect time to launch that new product line.",
      "Online retail growing at 12.3% - time to boost your digital presence.",
      "Hospitality spending surging 4.2% - Australians are dining out more!"
    ],
    industry_relevance: ['retail', 'hospitality', 'ecommerce']
  }
];

const SEASONAL_EVENTS = [
  {
    name: 'Australia Day',
    date: '2025-01-26',
    category: 'national_holiday',
    business_opportunities: [
      'Patriotic-themed promotions',
      'Community event sponsorship',
      'Local pride messaging'
    ]
  },
  {
    name: 'EOFY',
    date: '2025-06-30',
    category: 'financial_year_end',
    business_opportunities: [
      'Tax deduction offers',
      'Year-end clearance sales',
      'Business planning services'
    ]
  },
  {
    name: 'Melbourne Cup',
    date: '2025-11-04',
    category: 'cultural_event',
    business_opportunities: [
      'Race day events',
      'Fashion promotions',
      'Hospitality packages'
    ]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'overview';
    const category = url.searchParams.get('category');
    const industry = url.searchParams.get('industry');

    console.log(`Fetching Australian market data - Action: ${action}, Category: ${category}, Industry: ${industry}`);

    switch (action) {
      case 'overview':
        return new Response(JSON.stringify({
          data: MOCK_ABS_DATA,
          last_updated: new Date().toISOString(),
          source: 'Australian Bureau of Statistics (simulated)',
          next_update: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'category':
        if (!category) {
          return new Response(JSON.stringify({ 
            error: 'Category parameter required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const categoryData = MOCK_ABS_DATA.filter(item => item.category === category);
        return new Response(JSON.stringify({
          data: categoryData,
          category,
          last_updated: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'content_suggestions':
        const industryFilter = industry || 'all';
        const suggestions = MOCK_ABS_DATA
          .filter(item => 
            item.industry_relevance.includes('all') || 
            item.industry_relevance.includes(industryFilter)
          )
          .flatMap(item => item.content_suggestions)
          .slice(0, 10);

        return new Response(JSON.stringify({
          suggestions,
          industry: industryFilter,
          generated_at: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'seasonal_events':
        const upcomingEvents = SEASONAL_EVENTS.filter(event => 
          new Date(event.date) > new Date()
        ).slice(0, 5);

        return new Response(JSON.stringify({
          events: upcomingEvents,
          current_date: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'generate_post':
        const requestBody = await req.json();
        const { industry: targetIndustry = 'all', dataCategory = 'business_confidence' } = requestBody;
        
        const relevantData = MOCK_ABS_DATA.find(item => item.category === dataCategory);
        if (!relevantData) {
          return new Response(JSON.stringify({ 
            error: 'Invalid data category' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const postContent = generatePostContent(relevantData, targetIndustry);
        
        return new Response(JSON.stringify({
          content: postContent,
          data_source: relevantData.title,
          industry: targetIndustry,
          generated_at: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ 
          error: 'Invalid action parameter' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Error in australian-market-data function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generatePostContent(data: MarketInsight, industry: string): string {
  const relevantSuggestion = data.content_suggestions.find(suggestion => 
    industry === 'all' || data.industry_relevance.includes(industry)
  ) || data.content_suggestions[0];

  const keyMetric = data.data_points[0];
  const changeDirection = keyMetric.change > 0 ? 'up' : 'down';
  const changeEmoji = keyMetric.change > 0 ? '📈' : '📉';

  return `${changeEmoji} Australian Market Update ${changeEmoji}

${relevantSuggestion}

Key Insight:
📊 ${keyMetric.measure}: ${keyMetric.value}${keyMetric.unit === 'percent' ? '%' : ''}
${changeDirection === 'up' ? '⬆️' : '⬇️'} ${Math.abs(keyMetric.change)}${keyMetric.unit === 'percent' ? 'pp' : ''} from last period

${keyMetric.description}

What does this mean for your business? Let's discuss how these trends could impact your growth strategy.

#AustralianBusiness #MarketTrends #BusinessGrowth #DataDriven`;
}