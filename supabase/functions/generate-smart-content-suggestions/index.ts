import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentSuggestionRequest {
  businessId: string;
  businessName: string;
  industry: string;
  competitorInsights: Array<{
    competitor: string;
    contentType: string;
    topic: string;
    engagement: number;
    insight: string;
    opportunity: string;
  }>;
  contentGoals: string[];
  targetPlatforms: string[];
  targetAudience: string;
  contentFrequency: string;
}

interface ContentSuggestion {
  id: string;
  title: string;
  topic: string;
  contentType: 'post' | 'story' | 'reel' | 'carousel';
  platforms: string[];
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  estimatedReach: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ahpraGuidelines?: string;
  hashtags: string[];
  contentPillars: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      businessId,
      businessName,
      industry,
      competitorInsights,
      contentGoals,
      targetPlatforms,
      targetAudience,
      contentFrequency
    }: ContentSuggestionRequest = await req.json();

    // Get business profile for additional context
    const { data: businessProfile, error: profileError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('id', businessId)
      .single();

    if (profileError || !businessProfile) {
      throw new Error('Business profile not found');
    }

    // Analyze competitor insights to identify content gaps
    const contentGaps = analyzeContentGaps(competitorInsights, contentGoals);
    
    // Generate suggestions based on industry and goals
    const suggestions = await generateContentSuggestions({
      businessName,
      industry,
      contentGoals,
      targetPlatforms,
      targetAudience,
      contentFrequency,
      contentGaps,
      isHealthcare: industry.toLowerCase().includes('health') || 
                   industry.toLowerCase().includes('medical') ||
                   industry.toLowerCase().includes('dental')
    });

    // Prioritize suggestions based on business goals and competitor analysis
    const prioritizedSuggestions = prioritizeSuggestions(suggestions, competitorInsights, contentGoals);

    // Store suggestions for future reference
    await supabase
      .from('smart_content_suggestions')
      .insert({
        user_id: businessProfile.user_id,
        business_id: businessId,
        suggestion_type: 'content_ideas',
        title: 'Smart Content Suggestions',
        description: `Generated ${prioritizedSuggestions.length} content ideas based on competitor analysis`,
        implementation_data: { suggestions: prioritizedSuggestions },
        ai_confidence: 0.85,
        priority: 7
      });

    return new Response(JSON.stringify({
      success: true,
      suggestions: prioritizedSuggestions,
      totalSuggestions: prioritizedSuggestions.length,
      contentGaps: contentGaps,
      generatedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Content suggestion generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate content suggestions',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function analyzeContentGaps(competitorInsights: any[], contentGoals: string[]): string[] {
  const gaps = [];
  
  // Identify underrepresented content types
  const contentTypes = competitorInsights.map(insight => insight.contentType);
  const typeFrequency = contentTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Look for content goals not well represented by competitors
  for (const goal of contentGoals) {
    const relevantContent = competitorInsights.filter(insight => 
      insight.topic.toLowerCase().includes(goal.toLowerCase()) ||
      insight.insight.toLowerCase().includes(goal.toLowerCase())
    );
    
    if (relevantContent.length < 2) {
      gaps.push(`Underrepresented: ${goal} content`);
    }
  }

  // Identify high-engagement topics competitors are using
  const highEngagementTopics = competitorInsights
    .filter(insight => insight.engagement > 500)
    .map(insight => insight.topic);

  gaps.push(...highEngagementTopics.map(topic => `High engagement opportunity: ${topic}`));

  return gaps;
}

async function generateContentSuggestions(context: {
  businessName: string;
  industry: string;
  contentGoals: string[];
  targetPlatforms: string[];
  targetAudience: string;
  contentFrequency: string;
  contentGaps: string[];
  isHealthcare: boolean;
}): Promise<ContentSuggestion[]> {
  
  const suggestions: ContentSuggestion[] = [];
  let suggestionId = 1;

  // Healthcare-specific content pillars
  const healthcarePillars = [
    'Patient Education', 'Behind the Scenes', 'Team Expertise', 
    'Health Tips', 'Community Involvement', 'Technology Updates',
    'Wellness Wednesday', 'Myth Busting', 'Success Stories (Compliant)'
  ];

  // General business content pillars
  const generalPillars = [
    'Behind the Scenes', 'Customer Stories', 'Industry Insights',
    'Team Spotlights', 'Tips & Advice', 'Company Culture',
    'Product Features', 'Educational Content', 'Community Impact'
  ];

  const contentPillars = context.isHealthcare ? healthcarePillars : generalPillars;

  // Generate suggestions for each content goal
  for (const goal of context.contentGoals) {
    const goalSuggestions = generateGoalSpecificSuggestions(goal, context, contentPillars, suggestionId);
    suggestions.push(...goalSuggestions);
    suggestionId += goalSuggestions.length;
  }

  // Generate platform-specific suggestions
  for (const platform of context.targetPlatforms) {
    const platformSuggestions = generatePlatformSpecificSuggestions(platform, context, contentPillars, suggestionId);
    suggestions.push(...platformSuggestions);
    suggestionId += platformSuggestions.length;
  }

  // Generate evergreen content suggestions
  const evergreenSuggestions = generateEvergreenSuggestions(context, contentPillars, suggestionId);
  suggestions.push(...evergreenSuggestions);

  return suggestions.slice(0, 12); // Return top 12 suggestions
}

function generateGoalSpecificSuggestions(
  goal: string, 
  context: any, 
  contentPillars: string[], 
  startId: number
): ContentSuggestion[] {
  const suggestions: ContentSuggestion[] = [];

  switch (goal.toLowerCase()) {
    case 'brand awareness':
      suggestions.push({
        id: `suggestion_${startId}`,
        title: `Meet the Team: ${context.businessName} Experts`,
        topic: 'Team Introduction',
        contentType: 'carousel',
        platforms: ['facebook', 'instagram'],
        priority: 'high',
        reasoning: 'Personal connections build trust and brand recognition',
        estimatedReach: 800,
        difficulty: 'easy',
        ahpraGuidelines: context.isHealthcare ? 'Focus on qualifications and expertise, avoid patient testimonials' : undefined,
        hashtags: generateHashtags(context.industry, 'team', 'expertise'),
        contentPillars: ['Team Spotlights', 'Behind the Scenes']
      });
      break;

    case 'patient education':
    case 'lead generation':
      suggestions.push({
        id: `suggestion_${startId}`,
        title: context.isHealthcare ? 
          'Common Health Myths Debunked' : 
          `${context.industry} Myths vs Reality`,
        topic: 'Educational Content',
        contentType: 'post',
        platforms: ['facebook', 'linkedin'],
        priority: 'high',
        reasoning: 'Educational content establishes authority and generates qualified leads',
        estimatedReach: 1200,
        difficulty: 'medium',
        ahpraGuidelines: context.isHealthcare ? 'Use evidence-based information only, include medical disclaimers' : undefined,
        hashtags: generateHashtags(context.industry, 'education', 'myths'),
        contentPillars: ['Educational Content', 'Myth Busting']
      });
      break;

    case 'community building':
      suggestions.push({
        id: `suggestion_${startId}`,
        title: 'Behind the Scenes: A Day in Our Practice',
        topic: 'Workplace Culture',
        contentType: 'story',
        platforms: ['instagram', 'facebook'],
        priority: 'medium',
        reasoning: 'Authentic behind-the-scenes content creates emotional connections',
        estimatedReach: 600,
        difficulty: 'easy',
        ahpraGuidelines: context.isHealthcare ? 'Ensure patient privacy, focus on staff and processes' : undefined,
        hashtags: generateHashtags(context.industry, 'behindthescenes', 'team'),
        contentPillars: ['Behind the Scenes', 'Company Culture']
      });
      break;

    case 'trust building':
      suggestions.push({
        id: `suggestion_${startId}`,
        title: context.isHealthcare ? 
          'Our Commitment to Patient Safety' : 
          'Quality Standards We Follow',
        topic: 'Quality Assurance',
        contentType: 'post',
        platforms: ['linkedin', 'facebook'],
        priority: 'high',
        reasoning: 'Transparency about standards builds trust and credibility',
        estimatedReach: 900,
        difficulty: 'medium',
        ahpraGuidelines: context.isHealthcare ? 'Reference specific guidelines and certifications' : undefined,
        hashtags: generateHashtags(context.industry, 'quality', 'standards'),
        contentPillars: ['Industry Insights', 'Team Expertise']
      });
      break;

    default:
      suggestions.push({
        id: `suggestion_${startId}`,
        title: `Tips for Better ${context.industry} Outcomes`,
        topic: 'Industry Tips',
        contentType: 'carousel',
        platforms: context.targetPlatforms,
        priority: 'medium',
        reasoning: `Helpful tips related to ${goal} will engage your target audience`,
        estimatedReach: 700,
        difficulty: 'easy',
        hashtags: generateHashtags(context.industry, 'tips', goal.toLowerCase()),
        contentPillars: ['Tips & Advice', 'Educational Content']
      });
  }

  return suggestions;
}

function generatePlatformSpecificSuggestions(
  platform: string, 
  context: any, 
  contentPillars: string[], 
  startId: number
): ContentSuggestion[] {
  const suggestions: ContentSuggestion[] = [];

  switch (platform) {
    case 'instagram':
      suggestions.push({
        id: `suggestion_${startId}`,
        title: 'Instagram Story Series: Daily Operations',
        topic: 'Daily Workflow',
        contentType: 'story',
        platforms: ['instagram'],
        priority: 'medium',
        reasoning: 'Instagram Stories are perfect for showing real-time operations and building authentic connections',
        estimatedReach: 400,
        difficulty: 'easy',
        ahpraGuidelines: context.isHealthcare ? 'Focus on processes, not patients. Use appropriate medical terminology' : undefined,
        hashtags: generateHashtags(context.industry, 'daily', 'workflow'),
        contentPillars: ['Behind the Scenes', 'Company Culture']
      });
      break;

    case 'linkedin':
      suggestions.push({
        id: `suggestion_${startId}`,
        title: `Industry Trends in ${context.industry} 2024`,
        topic: 'Industry Analysis',
        contentType: 'post',
        platforms: ['linkedin'],
        priority: 'high',
        reasoning: 'LinkedIn users engage heavily with industry-specific thought leadership content',
        estimatedReach: 1500,
        difficulty: 'medium',
        hashtags: generateHashtags(context.industry, 'trends', '2024'),
        contentPillars: ['Industry Insights', 'Team Expertise']
      });
      break;

    case 'facebook':
      suggestions.push({
        id: `suggestion_${startId}`,
        title: 'Community Spotlight: Local Partnership',
        topic: 'Community Involvement',
        contentType: 'post',
        platforms: ['facebook'],
        priority: 'medium',
        reasoning: 'Facebook users respond well to local community content and partnerships',
        estimatedReach: 800,
        difficulty: 'easy',
        hashtags: generateHashtags(context.industry, 'community', 'local'),
        contentPillars: ['Community Impact', 'Industry Insights']
      });
      break;
  }

  return suggestions;
}

function generateEvergreenSuggestions(
  context: any, 
  contentPillars: string[], 
  startId: number
): ContentSuggestion[] {
  return [
    {
      id: `suggestion_${startId}`,
      title: context.isHealthcare ? 
        'Wellness Wednesday: Simple Health Tips' : 
        'Wisdom Wednesday: Industry Insights',
      topic: 'Weekly Series',
      contentType: 'post',
      platforms: context.targetPlatforms,
      priority: 'high',
      reasoning: 'Consistent weekly content series builds audience expectations and engagement',
      estimatedReach: 1000,
      difficulty: 'easy',
      ahpraGuidelines: context.isHealthcare ? 'Provide general wellness advice, avoid specific medical recommendations' : undefined,
      hashtags: generateHashtags(context.industry, 'wednesday', 'tips'),
      contentPillars: ['Educational Content', 'Tips & Advice']
    },
    {
      id: `suggestion_${startId + 1}`,
      title: 'Frequently Asked Questions',
      topic: 'Customer Service',
      contentType: 'carousel',
      platforms: ['facebook', 'instagram'],
      priority: 'high',
      reasoning: 'FAQ content addresses common concerns and reduces customer service burden',
      estimatedReach: 900,
      difficulty: 'medium',
      ahpraGuidelines: context.isHealthcare ? 'Provide general information only, direct specific concerns to consultation' : undefined,
      hashtags: generateHashtags(context.industry, 'faq', 'questions'),
      contentPillars: ['Educational Content', 'Customer Service']
    }
  ];
}

function generateHashtags(industry: string, ...keywords: string[]): string[] {
  const baseHashtags = [
    industry.replace(/\s+/g, ''),
    'Professional',
    'Quality',
    'Australia',
    'Local'
  ];

  const keywordHashtags = keywords.map(keyword => 
    keyword.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
  );

  return [...baseHashtags, ...keywordHashtags].slice(0, 8);
}

function prioritizeSuggestions(
  suggestions: ContentSuggestion[], 
  competitorInsights: any[], 
  contentGoals: string[]
): ContentSuggestion[] {
  return suggestions
    .map(suggestion => {
      let score = 0;
      
      // Priority scoring
      if (suggestion.priority === 'high') score += 3;
      else if (suggestion.priority === 'medium') score += 2;
      else score += 1;
      
      // Goal alignment scoring
      const alignedGoals = contentGoals.filter(goal => 
        suggestion.topic.toLowerCase().includes(goal.toLowerCase()) ||
        suggestion.reasoning.toLowerCase().includes(goal.toLowerCase())
      );
      score += alignedGoals.length * 2;
      
      // Platform coverage scoring
      score += suggestion.platforms.length;
      
      // Competitor gap scoring
      const similarCompetitorContent = competitorInsights.filter(insight =>
        insight.topic.toLowerCase().includes(suggestion.topic.toLowerCase())
      );
      if (similarCompetitorContent.length === 0) score += 3; // Unique opportunity
      
      return { ...suggestion, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ score, ...suggestion }) => suggestion);
} 