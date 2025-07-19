import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { seedKeywords } = await req.json();

    if (!seedKeywords || !Array.isArray(seedKeywords) || seedKeywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Seed keywords are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Researching keywords for:', seedKeywords);

    // Generate related keywords and variations
    const generateKeywordVariations = (keyword: string) => {
      const variations = [];
      const words = keyword.split(' ');
      
      // Long-tail variations
      const modifiers = ['best', 'top', 'how to', 'guide', 'tips', 'strategy', 'free', 'online', 'digital', 'professional', 'small business'];
      const suffixes = ['tips', 'guide', 'strategy', 'tools', 'services', 'solutions', 'software', 'platform', 'agency'];
      
      modifiers.forEach(modifier => {
        variations.push(`${modifier} ${keyword}`);
      });
      
      suffixes.forEach(suffix => {
        variations.push(`${keyword} ${suffix}`);
      });

      // Question-based keywords
      const questionWords = ['what is', 'how to', 'why', 'when', 'where'];
      questionWords.forEach(q => {
        variations.push(`${q} ${keyword}`);
      });

      return variations;
    };

    // Simulate keyword research data
    const generateKeywordData = (keyword: string) => {
      // Generate realistic but random data for demo purposes
      const baseVolume = Math.floor(Math.random() * 10000) + 100;
      const difficulty = Math.floor(Math.random() * 100) + 1;
      const cpc = (Math.random() * 5 + 0.5).toFixed(2);
      const competition = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];

      return {
        keyword,
        volume: baseVolume,
        difficulty,
        cpc: `$${cpc}`,
        competition,
        trend: Math.random() > 0.5 ? 'rising' : 'stable',
        intent: ['informational', 'commercial', 'transactional'][Math.floor(Math.random() * 3)]
      };
    };

    // Generate comprehensive keyword list
    const allKeywords = [];
    
    // Add original seed keywords
    seedKeywords.forEach((keyword: string) => {
      allKeywords.push(generateKeywordData(keyword));
      
      // Add variations
      const variations = generateKeywordVariations(keyword);
      variations.slice(0, 8).forEach(variation => {
        allKeywords.push(generateKeywordData(variation));
      });
    });

    // Sort by a combination of volume and low difficulty for best opportunities
    const sortedKeywords = allKeywords.sort((a, b) => {
      const scoreA = a.volume / Math.max(a.difficulty, 1);
      const scoreB = b.volume / Math.max(b.difficulty, 1);
      return scoreB - scoreA;
    });

    // Take top 20 keywords
    const topKeywords = sortedKeywords.slice(0, 20);

    // Add some trending industry keywords
    const industryKeywords = [
      'social media marketing',
      'content marketing strategy',
      'digital marketing trends',
      'social media automation',
      'content creation tools',
      'social media analytics',
      'influencer marketing',
      'social media management',
      'content calendar planning',
      'social media ROI'
    ];

    // Add a few industry keywords if they're not already included
    industryKeywords.forEach(industryKeyword => {
      if (!topKeywords.some(k => k.keyword.includes(industryKeyword)) && topKeywords.length < 25) {
        topKeywords.push(generateKeywordData(industryKeyword));
      }
    });

    const result = {
      keywords: topKeywords,
      totalFound: allKeywords.length,
      searchDate: new Date().toISOString(),
      seedKeywords,
      summary: {
        avgVolume: Math.round(topKeywords.reduce((sum, k) => sum + k.volume, 0) / topKeywords.length),
        avgDifficulty: Math.round(topKeywords.reduce((sum, k) => sum + k.difficulty, 0) / topKeywords.length),
        opportunities: topKeywords.filter(k => k.difficulty < 30).length
      }
    };

    console.log('Keyword research completed:', result.summary);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in keyword-research function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});