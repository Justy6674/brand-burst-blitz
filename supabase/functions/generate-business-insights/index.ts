import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BusinessInsightsRequest {
  questionnaireResponses: any;
  businessProfileId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionnaireResponses, businessProfileId }: BusinessInsightsRequest = await req.json();

    // Initialize Supabase clients
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    console.log('Generating business insights for user:', user.id);

    // Calculate completion score
    const completionScore = calculateQuestionnaireCompletionScore(questionnaireResponses);
    
    // Generate AI insights
    const aiInsights = await generateAdvancedInsights(questionnaireResponses, user.id, supabaseClient);
    
    // Store questionnaire response
    const { data: questionnaireRecord, error: questionnaireError } = await supabaseService
      .from('business_questionnaire_responses')
      .insert({
        user_id: user.id,
        business_profile_id: businessProfileId,
        responses: questionnaireResponses,
        completion_score: completionScore,
        ai_insights: aiInsights,
        completion_status: completionScore >= 80 ? 'completed' : 'partial'
      })
      .select()
      .single();

    if (questionnaireError) {
      console.error("Error storing questionnaire response:", questionnaireError);
      throw questionnaireError;
    }

    // Generate strategic recommendations
    const recommendations = await generateStrategicRecommendations(
      aiInsights,
      questionnaireResponses,
      user.id,
      businessProfileId
    );

    // Store recommendations
    if (recommendations.length > 0) {
      const { error: recError } = await supabaseService
        .from('strategic_content_recommendations')
        .insert(
          recommendations.map(rec => ({
            user_id: user.id,
            business_profile_id: businessProfileId,
            ...rec,
            data_sources: [questionnaireRecord.id],
          }))
        );

      if (recError) {
        console.error("Error storing recommendations:", recError);
      }
    }

    // Update business profile with enhanced data if provided
    if (businessProfileId) {
      const profileUpdates = extractBusinessProfileUpdates(questionnaireResponses, aiInsights);
      
      const { error: updateError } = await supabaseService
        .from('business_profiles')
        .update(profileUpdates)
        .eq('id', businessProfileId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error("Error updating business profile:", updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        questionnaireId: questionnaireRecord.id,
        completionScore,
        insights: aiInsights,
        recommendations,
        nextSteps: generateNextSteps(aiInsights, completionScore)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in business insights generation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function calculateQuestionnaireCompletionScore(responses: any): number {
  const requiredFields = [
    'business_name', 'industry', 'business_size', 'business_stage',
    'target_audience_demographics', 'primary_goals', 'brand_voice',
    'target_platforms', 'monthly_budget'
  ];

  const optionalFields = [
    'website_url', 'target_audience_psychographics', 'secondary_goals',
    'success_metrics', 'brand_personality', 'content_topics', 'content_formats',
    'posting_frequency', 'platform_priorities', 'content_creation_time',
    'main_competitors', 'competitive_advantages', 'content_challenges',
    'automation_preferences'
  ];

  let score = 0;
  let totalPossible = 0;

  // Required fields are worth more points
  requiredFields.forEach(field => {
    totalPossible += 10;
    if (responses[field] && responses[field] !== '' && 
        !(Array.isArray(responses[field]) && responses[field].length === 0)) {
      score += 10;
    }
  });

  // Optional fields add bonus points
  optionalFields.forEach(field => {
    totalPossible += 5;
    if (responses[field] && responses[field] !== '' && 
        !(Array.isArray(responses[field]) && responses[field].length === 0)) {
      score += 5;
    }
  });

  return Math.round((score / totalPossible) * 100);
}

async function generateAdvancedInsights(
  responses: any, 
  userId: string, 
  supabaseClient: any
): Promise<any> {
  console.log('Generating advanced insights...');
  
  // Analyze business maturity
  const businessMaturity = analyzeBusinessMaturity(responses);
  
  // Analyze market positioning
  const marketPositioning = analyzeMarketPositioning(responses);
  
  // Analyze content strategy readiness
  const contentStrategy = analyzeContentStrategyReadiness(responses);
  
  // Analyze competitive awareness
  const competitiveAwareness = analyzeCompetitiveAwareness(responses);
  
  // Generate SWOT analysis
  const swotAnalysis = generateSWOTAnalysis(responses);
  
  // Calculate readiness scores
  const readinessScores = calculateReadinessScores(
    businessMaturity,
    marketPositioning,
    contentStrategy,
    competitiveAwareness
  );

  // Fetch additional context data
  const contextData = await fetchAdditionalContext(userId, supabaseClient);
  
  // Generate industry-specific insights
  const industryInsights = generateIndustrySpecificInsights(responses.industry, responses);
  
  return {
    business_maturity: businessMaturity,
    market_positioning: marketPositioning,
    content_strategy: contentStrategy,
    competitive_awareness: competitiveAwareness,
    swot_analysis: swotAnalysis,
    readiness_scores: readinessScores,
    industry_insights: industryInsights,
    context_data: contextData,
    overall_assessment: generateOverallAssessment(readinessScores, swotAnalysis),
    priority_areas: identifyPriorityAreas(readinessScores, swotAnalysis),
    generated_at: new Date().toISOString()
  };
}

function analyzeBusinessMaturity(responses: any): any {
  const stage = responses.business_stage || 'startup';
  const size = responses.business_size || 'solo';
  const hasWebsite = !!responses.website_url;
  const budgetRange = responses.monthly_budget || 'under-500';
  
  let maturityScore = 0;
  
  // Stage scoring
  const stageScores = { startup: 1, growth: 2, established: 3, enterprise: 4 };
  maturityScore += (stageScores[stage as keyof typeof stageScores] || 1) * 20;
  
  // Size scoring
  const sizeScores = { solo: 1, small: 2, medium: 3, large: 4 };
  maturityScore += (sizeScores[size as keyof typeof sizeScores] || 1) * 15;
  
  // Digital presence
  if (hasWebsite) maturityScore += 15;
  
  // Budget capacity
  const budgetScores = { 
    'under-500': 1, '500-1000': 2, '1000-2500': 3, 
    '2500-5000': 4, 'over-5000': 5 
  };
  maturityScore += (budgetScores[budgetRange as keyof typeof budgetScores] || 1) * 10;
  
  return {
    overall_score: Math.min(maturityScore, 100),
    stage_assessment: stage,
    size_category: size,
    digital_readiness: hasWebsite ? 'established' : 'developing',
    investment_capacity: budgetRange,
    maturity_level: maturityScore >= 80 ? 'high' : maturityScore >= 50 ? 'medium' : 'developing',
    growth_indicators: identifyGrowthIndicators(responses)
  };
}

function analyzeMarketPositioning(responses: any): any {
  const targetAudienceClarity = responses.target_audience_demographics?.length || 0;
  const competitorAwareness = responses.main_competitors?.length || 0;
  const competitiveAdvantages = responses.competitive_advantages?.length || 0;
  const industryFocus = responses.industry !== 'general';
  
  const positioningStrength = (
    (targetAudienceClarity > 50 ? 25 : targetAudienceClarity > 20 ? 15 : 5) +
    (competitorAwareness > 30 ? 25 : competitorAwareness > 10 ? 15 : 5) +
    (competitiveAdvantages > 20 ? 25 : competitiveAdvantages > 10 ? 15 : 5) +
    (industryFocus ? 25 : 10)
  );
  
  return {
    positioning_score: positioningStrength,
    audience_clarity: targetAudienceClarity > 50 ? 'high' : targetAudienceClarity > 20 ? 'medium' : 'low',
    competitive_landscape_understanding: competitorAwareness > 30 ? 'high' : competitorAwareness > 10 ? 'medium' : 'low',
    differentiation_clarity: competitiveAdvantages > 20 ? 'strong' : competitiveAdvantages > 10 ? 'moderate' : 'weak',
    industry_specialization: industryFocus,
    positioning_gaps: identifyPositioningGaps(responses),
    market_opportunity_assessment: assessMarketOpportunity(responses)
  };
}

function analyzeContentStrategyReadiness(responses: any): any {
  const brandVoice = responses.brand_voice;
  const contentTopics = responses.content_topics?.length || 0;
  const contentFormats = responses.content_formats?.length || 0;
  const platforms = responses.target_platforms?.length || 0;
  const timeCommitment = responses.content_creation_time;
  const postingFrequency = responses.posting_frequency;
  
  let readinessScore = 0;
  
  // Brand voice clarity
  if (brandVoice) readinessScore += 20;
  
  // Content diversity
  readinessScore += Math.min(contentTopics * 5, 20);
  readinessScore += Math.min(contentFormats * 5, 20);
  
  // Platform strategy
  readinessScore += Math.min(platforms * 7, 20);
  
  // Resource commitment
  const timeScores = { 'under-5': 5, '5-10': 10, '10-20': 15, '20-40': 20, 'over-40': 20 };
  readinessScore += timeScores[timeCommitment as keyof typeof timeScores] || 5;
  
  // Frequency planning
  if (postingFrequency) readinessScore += 15;
  
  return {
    strategy_readiness_score: Math.min(readinessScore, 100),
    brand_voice_clarity: brandVoice ? 'defined' : 'undefined',
    content_diversity: contentTopics + contentFormats,
    platform_strategy: platforms > 2 ? 'multi-platform' : platforms === 1 ? 'focused' : 'undefined',
    resource_allocation: assessResourceAllocation(timeCommitment, postingFrequency),
    content_pillars: extractContentPillars(responses),
    strategic_gaps: identifyContentStrategyGaps(responses)
  };
}

function analyzeCompetitiveAwareness(responses: any): any {
  const competitors = responses.main_competitors || '';
  const advantages = responses.competitive_advantages || '';
  const challenges = responses.content_challenges || [];
  
  const awarenessLevel = (
    (competitors.length > 50 ? 40 : competitors.length > 20 ? 25 : competitors.length > 5 ? 15 : 5) +
    (advantages.length > 50 ? 40 : advantages.length > 20 ? 25 : advantages.length > 10 ? 15 : 5) +
    (challenges.length > 3 ? 20 : challenges.length > 1 ? 15 : challenges.length > 0 ? 10 : 0)
  );
  
  return {
    competitive_awareness_score: awarenessLevel,
    competitor_knowledge: competitors.length > 30 ? 'comprehensive' : competitors.length > 10 ? 'moderate' : 'limited',
    differentiation_understanding: advantages.length > 30 ? 'strong' : advantages.length > 10 ? 'moderate' : 'weak',
    challenge_identification: challenges.length > 2 ? 'thorough' : challenges.length > 0 ? 'basic' : 'minimal',
    competitive_strategy: deriveCompetitiveStrategy(responses),
    recommended_analysis: generateCompetitiveAnalysisRecommendations(awarenessLevel)
  };
}

function generateSWOTAnalysis(responses: any): any {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];
  
  // Analyze strengths
  if (responses.competitive_advantages && responses.competitive_advantages.length > 20) {
    strengths.push('Clear competitive differentiation');
  }
  if (responses.business_stage === 'established' || responses.business_stage === 'enterprise') {
    strengths.push('Business maturity and stability');
  }
  if (responses.monthly_budget === 'over-5000' || responses.monthly_budget === '2500-5000') {
    strengths.push('Strong budget allocation for marketing');
  }
  if (responses.target_platforms && responses.target_platforms.length > 2) {
    strengths.push('Multi-platform marketing approach');
  }
  
  // Analyze weaknesses
  if (!responses.website_url) {
    weaknesses.push('Limited digital presence');
  }
  if (responses.content_creation_time === 'under-5') {
    weaknesses.push('Limited time allocation for content creation');
  }
  if (!responses.main_competitors || responses.main_competitors.length < 10) {
    weaknesses.push('Limited competitive intelligence');
  }
  if (responses.target_audience_demographics && responses.target_audience_demographics.length < 30) {
    weaknesses.push('Unclear target audience definition');
  }
  
  // Analyze opportunities
  if (responses.industry !== 'general') {
    opportunities.push(`Specialized ${responses.industry} industry expertise`);
  }
  if (responses.business_stage === 'startup' || responses.business_stage === 'growth') {
    opportunities.push('High growth potential and agility');
  }
  if (responses.automation_preferences && responses.automation_preferences.length > 0) {
    opportunities.push('Content automation and efficiency gains');
  }
  
  // Analyze threats
  if (responses.monthly_budget === 'under-500') {
    threats.push('Limited budget compared to competitors');
  }
  if (responses.content_challenges && responses.content_challenges.includes('time_constraints')) {
    threats.push('Resource constraints affecting content consistency');
  }
  if (responses.main_competitors && responses.main_competitors.length > 50) {
    threats.push('Highly competitive market landscape');
  }
  
  return {
    strengths,
    weaknesses,
    opportunities,
    threats,
    strategic_focus: determineStrategicFocus(strengths, weaknesses, opportunities, threats),
    priority_actions: generateSWOTPriorityActions(strengths, weaknesses, opportunities, threats)
  };
}

function calculateReadinessScores(
  businessMaturity: any,
  marketPositioning: any,
  contentStrategy: any,
  competitiveAwareness: any
): any {
  return {
    business_maturity: businessMaturity.overall_score,
    market_positioning: marketPositioning.positioning_score,
    content_strategy: contentStrategy.strategy_readiness_score,
    competitive_intelligence: competitiveAwareness.competitive_awareness_score,
    overall_readiness: Math.round(
      (businessMaturity.overall_score + 
       marketPositioning.positioning_score + 
       contentStrategy.strategy_readiness_score + 
       competitiveAwareness.competitive_awareness_score) / 4
    )
  };
}

async function fetchAdditionalContext(userId: string, supabaseClient: any): Promise<any> {
  try {
    // Fetch existing content
    const { data: posts } = await supabaseClient
      .from('posts')
      .select('type, status, created_at')
      .eq('user_id', userId)
      .limit(50);
    
    // Fetch competitor data
    const { data: competitors } = await supabaseClient
      .from('competitor_data')
      .select('competitor_name, industry, is_active')
      .eq('user_id', userId);
    
    // Fetch business profiles
    const { data: profiles } = await supabaseClient
      .from('business_profiles')
      .select('business_name, industry, created_at')
      .eq('user_id', userId);
    
    return {
      existing_content: {
        total_posts: posts?.length || 0,
        published_posts: posts?.filter(p => p.status === 'published').length || 0,
        content_history_months: posts?.length > 0 ? 
          Math.ceil((Date.now() - new Date(posts[0].created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0
      },
      competitive_landscape: {
        tracked_competitors: competitors?.length || 0,
        active_monitoring: competitors?.filter(c => c.is_active).length || 0
      },
      business_setup: {
        multiple_profiles: (profiles?.length || 0) > 1,
        profile_age_days: profiles?.length > 0 ? 
          Math.ceil((Date.now() - new Date(profiles[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
      }
    };
  } catch (error) {
    console.error('Error fetching additional context:', error);
    return { error: 'Could not fetch additional context' };
  }
}

function generateIndustrySpecificInsights(industry: string, responses: any): any {
  const industryInsights: { [key: string]: any } = {
    health: {
      regulatory_considerations: ['HIPAA compliance', 'Medical disclaimers', 'Evidence-based content'],
      content_opportunities: ['Patient education', 'Wellness tips', 'Treatment explanations'],
      compliance_requirements: 'high',
      content_tone_recommendations: ['professional', 'empathetic', 'authoritative']
    },
    finance: {
      regulatory_considerations: ['SEC compliance', 'Financial disclaimers', 'Risk disclosures'],
      content_opportunities: ['Financial education', 'Market insights', 'Planning guides'],
      compliance_requirements: 'high',
      content_tone_recommendations: ['professional', 'authoritative', 'friendly']
    },
    legal: {
      regulatory_considerations: ['Bar association rules', 'Client confidentiality', 'Advertising restrictions'],
      content_opportunities: ['Legal education', 'Process explanations', 'Rights information'],
      compliance_requirements: 'high',
      content_tone_recommendations: ['professional', 'authoritative', 'empathetic']
    },
    tech: {
      regulatory_considerations: ['Data privacy', 'Security standards', 'Accessibility compliance'],
      content_opportunities: ['Innovation showcases', 'Technical tutorials', 'Industry trends'],
      compliance_requirements: 'medium',
      content_tone_recommendations: ['professional', 'exciting', 'friendly']
    },
    fitness: {
      regulatory_considerations: ['Health claims', 'Safety disclaimers', 'Professional certifications'],
      content_opportunities: ['Workout guides', 'Nutrition tips', 'Success stories'],
      compliance_requirements: 'medium',
      content_tone_recommendations: ['exciting', 'empathetic', 'friendly']
    },
    beauty: {
      regulatory_considerations: ['FDA cosmetic rules', 'Ingredient disclosures', 'Before/after claims'],
      content_opportunities: ['Beauty tutorials', 'Product education', 'Trend analysis'],
      compliance_requirements: 'medium',
      content_tone_recommendations: ['exciting', 'friendly', 'professional']
    },
    general: {
      regulatory_considerations: ['General advertising standards', 'Truth in advertising'],
      content_opportunities: ['Business insights', 'Industry trends', 'Educational content'],
      compliance_requirements: 'low',
      content_tone_recommendations: ['professional', 'friendly', 'casual']
    }
  };
  
  const insights = industryInsights[industry] || industryInsights.general;
  
  return {
    ...insights,
    industry_specific_recommendations: generateIndustryRecommendations(industry, responses),
    compliance_checklist: generateComplianceChecklist(industry),
    content_calendar_suggestions: generateIndustryContentSuggestions(industry)
  };
}

function generateOverallAssessment(readinessScores: any, swotAnalysis: any): any {
  const overallScore = readinessScores.overall_readiness;
  
  let assessment = '';
  let readinessLevel = '';
  let recommendations: string[] = [];
  
  if (overallScore >= 80) {
    readinessLevel = 'high';
    assessment = 'Your business shows strong readiness for strategic content marketing. You have clear positioning, defined strategies, and good competitive awareness.';
    recommendations = [
      'Focus on execution and optimization',
      'Implement advanced analytics tracking',
      'Consider expanding to new platforms or markets'
    ];
  } else if (overallScore >= 60) {
    readinessLevel = 'medium';
    assessment = 'Your business has a solid foundation but there are key areas that need strengthening before scaling content efforts.';
    recommendations = [
      'Address identified gaps in strategy or positioning',
      'Improve competitive intelligence gathering',
      'Strengthen brand voice and messaging consistency'
    ];
  } else {
    readinessLevel = 'developing';
    assessment = 'Your business needs foundational work in several areas before implementing a comprehensive content strategy.';
    recommendations = [
      'Complete business positioning and audience definition',
      'Develop clear competitive differentiation',
      'Establish basic content strategy framework'
    ];
  }
  
  return {
    overall_score: overallScore,
    readiness_level: readinessLevel,
    assessment,
    primary_recommendations: recommendations,
    critical_success_factors: identifyCriticalSuccessFactors(readinessScores, swotAnalysis),
    timeline_recommendations: generateTimelineRecommendations(readinessLevel)
  };
}

function identifyPriorityAreas(readinessScores: any, swotAnalysis: any): string[] {
  const priorities: string[] = [];
  
  // Identify lowest scoring areas
  const scores = [
    { area: 'Business Maturity', score: readinessScores.business_maturity },
    { area: 'Market Positioning', score: readinessScores.market_positioning },
    { area: 'Content Strategy', score: readinessScores.content_strategy },
    { area: 'Competitive Intelligence', score: readinessScores.competitive_intelligence }
  ];
  
  scores.sort((a, b) => a.score - b.score);
  
  // Add top 2 lowest scoring areas
  priorities.push(scores[0].area, scores[1].area);
  
  // Add SWOT-based priorities
  if (swotAnalysis.weaknesses.length > swotAnalysis.strengths.length) {
    priorities.push('Address Core Weaknesses');
  }
  
  if (swotAnalysis.opportunities.length > 2) {
    priorities.push('Capitalize on Market Opportunities');
  }
  
  return priorities.slice(0, 4);
}

async function generateStrategicRecommendations(
  insights: any,
  responses: any,
  userId: string,
  businessProfileId?: string
): Promise<any[]> {
  const recommendations: any[] = [];
  
  // Content topic recommendations based on industry
  if (insights.industry_insights.content_opportunities) {
    insights.industry_insights.content_opportunities.slice(0, 2).forEach((topic: string, index: number) => {
      recommendations.push({
        recommendation_type: 'content_topic',
        title: `Develop ${topic} Content Strategy`,
        description: `Based on your ${responses.industry} industry focus, ${topic.toLowerCase()} content can help establish authority and engage your target audience.`,
        priority_score: 9 - index,
        implementation_effort: 'medium',
        expected_impact: 'high',
        metadata: { 
          industry: responses.industry,
          topic: topic,
          source: 'industry_analysis'
        }
      });
    });
  }
  
  // Platform strategy recommendations
  if (insights.content_strategy.platform_strategy === 'undefined') {
    recommendations.push({
      recommendation_type: 'platform_strategy',
      title: 'Define Platform Strategy',
      description: 'You need to clearly define which platforms align with your target audience and business goals. Start with 1-2 platforms for focused efforts.',
      priority_score: 8,
      implementation_effort: 'low',
      expected_impact: 'high',
      metadata: {
        current_platforms: responses.target_platforms?.length || 0,
        suggested_platforms: suggestPlatformsForIndustry(responses.industry)
      }
    });
  }
  
  // Posting frequency recommendations
  if (!responses.posting_frequency) {
    recommendations.push({
      recommendation_type: 'posting_time',
      title: 'Establish Consistent Posting Schedule',
      description: 'Consistency is key to building audience engagement. Based on your time availability and platform strategy, establish a realistic posting schedule.',
      priority_score: 7,
      implementation_effort: 'low',
      expected_impact: 'medium',
      metadata: {
        available_time: responses.content_creation_time,
        recommended_frequency: recommendPostingFrequency(responses.content_creation_time, responses.target_platforms?.length || 1)
      }
    });
  }
  
  // Competitive analysis recommendations
  if (insights.competitive_awareness.competitive_awareness_score < 50) {
    recommendations.push({
      recommendation_type: 'platform_strategy',
      title: 'Enhance Competitive Intelligence',
      description: 'Understanding your competitive landscape is crucial for effective positioning. Invest time in analyzing competitor content strategies and performance.',
      priority_score: 6,
      implementation_effort: 'medium',
      expected_impact: 'high',
      metadata: {
        current_awareness_level: insights.competitive_awareness.competitor_knowledge,
        recommended_competitors_to_track: Math.max(3, Math.min(8, (responses.target_platforms?.length || 1) * 2))
      }
    });
  }
  
  // Content format recommendations
  if (insights.content_strategy.content_diversity < 4) {
    recommendations.push({
      recommendation_type: 'content_format',
      title: 'Diversify Content Formats',
      description: 'Expand your content mix to include different formats that resonate with your audience. This increases engagement and reaches different learning preferences.',
      priority_score: 5,
      implementation_effort: 'medium',
      expected_impact: 'medium',
      metadata: {
        current_formats: responses.content_formats?.length || 0,
        suggested_formats: suggestContentFormats(responses.industry, responses.target_platforms)
      }
    });
  }
  
  return recommendations;
}

// Helper functions
function identifyGrowthIndicators(responses: any): string[] {
  const indicators: string[] = [];
  
  if (responses.business_stage === 'growth' || responses.business_stage === 'startup') {
    indicators.push('High growth potential');
  }
  
  if (responses.monthly_budget !== 'under-500') {
    indicators.push('Investment capacity available');
  }
  
  if (responses.automation_preferences && responses.automation_preferences.length > 0) {
    indicators.push('Technology adoption readiness');
  }
  
  if (responses.target_platforms && responses.target_platforms.length > 1) {
    indicators.push('Multi-channel marketing approach');
  }
  
  return indicators;
}

function identifyPositioningGaps(responses: any): string[] {
  const gaps: string[] = [];
  
  if (!responses.target_audience_demographics || responses.target_audience_demographics.length < 30) {
    gaps.push('Unclear target audience definition');
  }
  
  if (!responses.competitive_advantages || responses.competitive_advantages.length < 20) {
    gaps.push('Weak competitive differentiation');
  }
  
  if (!responses.main_competitors || responses.main_competitors.length < 10) {
    gaps.push('Limited competitive landscape knowledge');
  }
  
  if (responses.industry === 'general') {
    gaps.push('Lack of industry specialization');
  }
  
  return gaps;
}

function assessMarketOpportunity(responses: any): string {
  const factors = [
    responses.business_stage === 'startup' || responses.business_stage === 'growth',
    responses.industry !== 'general',
    responses.target_platforms && responses.target_platforms.length > 1,
    responses.monthly_budget !== 'under-500'
  ];
  
  const score = factors.filter(Boolean).length;
  
  if (score >= 3) return 'high';
  if (score >= 2) return 'medium';
  return 'limited';
}

function assessResourceAllocation(timeCommitment: string, postingFrequency: string): any {
  const timeScores = { 'under-5': 1, '5-10': 2, '10-20': 3, '20-40': 4, 'over-40': 5 };
  const timeScore = timeScores[timeCommitment as keyof typeof timeScores] || 1;
  
  const frequencyDemand = {
    'daily': 5, 'few-times-week': 4, 'weekly': 3, 'bi-weekly': 2, 'monthly': 1
  };
  const demandScore = frequencyDemand[postingFrequency as keyof typeof frequencyDemand] || 2;
  
  const balance = timeScore - demandScore;
  
  return {
    time_availability: timeCommitment,
    frequency_ambition: postingFrequency,
    resource_balance: balance > 0 ? 'adequate' : balance === 0 ? 'tight' : 'insufficient',
    sustainability_risk: balance < -1 ? 'high' : balance < 0 ? 'medium' : 'low'
  };
}

function extractContentPillars(responses: any): string[] {
  const pillars: string[] = [];
  
  if (responses.content_topics) {
    pillars.push(...responses.content_topics.slice(0, 4));
  }
  
  // Add industry-specific pillars
  const industryPillars: { [key: string]: string[] } = {
    health: ['Education', 'Wellness', 'Prevention', 'Treatment'],
    finance: ['Planning', 'Investment', 'Savings', 'Market Analysis'],
    legal: ['Rights', 'Process', 'Prevention', 'Education'],
    tech: ['Innovation', 'Tutorials', 'Trends', 'Solutions'],
    fitness: ['Workouts', 'Nutrition', 'Motivation', 'Results'],
    beauty: ['Tutorials', 'Trends', 'Products', 'Self-Care']
  };
  
  if (responses.industry && industryPillars[responses.industry]) {
    pillars.push(...industryPillars[responses.industry].filter(p => !pillars.includes(p)).slice(0, 4 - pillars.length));
  }
  
  return pillars.slice(0, 4);
}

function identifyContentStrategyGaps(responses: any): string[] {
  const gaps: string[] = [];
  
  if (!responses.brand_voice) {
    gaps.push('Brand voice not defined');
  }
  
  if (!responses.content_topics || responses.content_topics.length < 3) {
    gaps.push('Limited content topic diversity');
  }
  
  if (!responses.content_formats || responses.content_formats.length < 2) {
    gaps.push('Narrow content format range');
  }
  
  if (!responses.posting_frequency) {
    gaps.push('Publishing schedule undefined');
  }
  
  if (responses.content_creation_time === 'under-5') {
    gaps.push('Insufficient time allocation');
  }
  
  return gaps;
}

function deriveCompetitiveStrategy(responses: any): string {
  const hasCompetitors = responses.main_competitors && responses.main_competitors.length > 20;
  const hasAdvantages = responses.competitive_advantages && responses.competitive_advantages.length > 20;
  
  if (hasCompetitors && hasAdvantages) return 'differentiation';
  if (hasCompetitors) return 'competitive_response';
  if (hasAdvantages) return 'advantage_amplification';
  return 'market_exploration';
}

function generateCompetitiveAnalysisRecommendations(awarenessLevel: number): string[] {
  if (awarenessLevel >= 70) {
    return ['Monitor competitor content performance', 'Identify content gap opportunities'];
  } else if (awarenessLevel >= 40) {
    return ['Expand competitor research', 'Analyze competitor content strategies'];
  } else {
    return ['Identify 3-5 key competitors', 'Conduct basic competitive analysis'];
  }
}

function determineStrategicFocus(strengths: string[], weaknesses: string[], opportunities: string[], threats: string[]): string {
  if (strengths.length > weaknesses.length && opportunities.length > threats.length) {
    return 'growth_acceleration';
  } else if (strengths.length > weaknesses.length) {
    return 'market_expansion';
  } else if (opportunities.length > threats.length) {
    return 'capability_building';
  } else {
    return 'defensive_positioning';
  }
}

function generateSWOTPriorityActions(strengths: string[], weaknesses: string[], opportunities: string[], threats: string[]): string[] {
  const actions: string[] = [];
  
  if (strengths.length > 0) {
    actions.push(`Leverage ${strengths[0].toLowerCase()} for competitive advantage`);
  }
  
  if (weaknesses.length > 0) {
    actions.push(`Address ${weaknesses[0].toLowerCase()} as priority`);
  }
  
  if (opportunities.length > 0) {
    actions.push(`Capitalize on ${opportunities[0].toLowerCase()}`);
  }
  
  if (threats.length > 0) {
    actions.push(`Mitigate risk from ${threats[0].toLowerCase()}`);
  }
  
  return actions.slice(0, 3);
}

function generateIndustryRecommendations(industry: string, responses: any): string[] {
  const recommendations: { [key: string]: string[] } = {
    health: [
      'Focus on educational content to build trust',
      'Include proper medical disclaimers',
      'Share patient success stories (with permission)',
      'Provide evidence-based information'
    ],
    finance: [
      'Create educational content about financial planning',
      'Share market insights and analysis',
      'Include appropriate risk disclaimers',
      'Focus on long-term value creation'
    ],
    legal: [
      'Provide general legal education',
      'Explain legal processes clearly',
      'Include attorney-client disclaimers',
      'Share relevant case studies'
    ],
    tech: [
      'Showcase innovation and thought leadership',
      'Create technical tutorials and guides',
      'Share industry trends and predictions',
      'Demonstrate product capabilities'
    ],
    fitness: [
      'Share workout routines and tips',
      'Provide nutrition guidance',
      'Showcase client transformations',
      'Focus on motivation and inspiration'
    ],
    beauty: [
      'Create tutorial and how-to content',
      'Share before/after transformations',
      'Review and recommend products',
      'Follow beauty trends and seasons'
    ]
  };
  
  return recommendations[industry] || [
    'Focus on educational and valuable content',
    'Establish thought leadership in your field',
    'Share customer success stories',
    'Provide industry insights and trends'
  ];
}

function generateComplianceChecklist(industry: string): string[] {
  const checklists: { [key: string]: string[] } = {
    health: [
      'Include medical disclaimers on health advice',
      'Verify all medical claims with evidence',
      'Respect patient privacy (HIPAA)',
      'Avoid diagnosing or prescribing'
    ],
    finance: [
      'Include investment risk disclaimers',
      'Comply with SEC advertising rules',
      'Avoid guaranteeing returns',
      'Disclose any conflicts of interest'
    ],
    legal: [
      'Include attorney-client disclaimers',
      'Comply with bar association advertising rules',
      'Avoid creating attorney-client relationships',
      'Respect client confidentiality'
    ],
    tech: [
      'Respect data privacy regulations',
      'Include accessibility considerations',
      'Protect intellectual property',
      'Follow platform-specific guidelines'
    ],
    fitness: [
      'Include exercise safety disclaimers',
      'Avoid making unrealistic promises',
      'Respect client privacy and consent',
      'Include proper form demonstrations'
    ],
    beauty: [
      'Follow FDA cosmetic regulations',
      'Include ingredient disclosures',
      'Avoid exaggerated claims',
      'Respect model/client consent'
    ]
  };
  
  return checklists[industry] || [
    'Follow general advertising standards',
    'Respect customer privacy',
    'Avoid misleading claims',
    'Include appropriate disclaimers'
  ];
}

function generateIndustryContentSuggestions(industry: string): string[] {
  const suggestions: { [key: string]: string[] } = {
    health: ['Wellness Wednesday tips', 'Patient education series', 'Myth-busting posts', 'Seasonal health advice'],
    finance: ['Market Monday analysis', 'Financial planning tips', 'Investment education', 'Economic updates'],
    legal: ['Legal tip Tuesday', 'Know your rights series', 'Legal process explanations', 'FAQ posts'],
    tech: ['Tech Tuesday tutorials', 'Innovation spotlights', 'Industry trend analysis', 'Product demos'],
    fitness: ['Workout Wednesday', 'Motivation Monday', 'Nutrition tips', 'Transformation stories'],
    beauty: ['Tutorial Tuesday', 'Trend Thursday', 'Product reviews', 'Seasonal looks']
  };
  
  return suggestions[industry] || [
    'Educational content series',
    'Industry insight posts',
    'Customer success stories',
    'Trend analysis content'
  ];
}

function identifyCriticalSuccessFactors(readinessScores: any, swotAnalysis: any): string[] {
  const factors: string[] = [];
  
  if (readinessScores.market_positioning < 60) {
    factors.push('Clear market positioning and differentiation');
  }
  
  if (readinessScores.content_strategy < 60) {
    factors.push('Consistent content strategy execution');
  }
  
  if (readinessScores.competitive_intelligence < 50) {
    factors.push('Strong competitive intelligence and market awareness');
  }
  
  if (swotAnalysis.weaknesses.length > swotAnalysis.strengths.length) {
    factors.push('Address core operational weaknesses');
  }
  
  factors.push('Consistent brand voice and messaging');
  factors.push('Regular performance measurement and optimization');
  
  return factors.slice(0, 4);
}

function generateTimelineRecommendations(readinessLevel: string): any {
  const timelines: { [key: string]: any } = {
    high: {
      immediate: '0-30 days: Launch content strategy execution',
      short_term: '1-3 months: Optimize and scale successful content',
      medium_term: '3-6 months: Expand to new platforms or markets',
      long_term: '6+ months: Advanced automation and analytics'
    },
    medium: {
      immediate: '0-30 days: Complete strategy foundation gaps',
      short_term: '1-3 months: Build and test core content pillars',
      medium_term: '3-6 months: Scale proven content approaches',
      long_term: '6+ months: Optimize and expand strategy'
    },
    developing: {
      immediate: '0-30 days: Define basic positioning and audience',
      short_term: '1-3 months: Develop content strategy framework',
      medium_term: '3-6 months: Test and refine content approach',
      long_term: '6+ months: Scale successful strategies'
    }
  };
  
  return timelines[readinessLevel] || timelines.developing;
}

function generateNextSteps(insights: any, completionScore: number): string[] {
  const nextSteps: string[] = [];
  
  if (completionScore < 80) {
    nextSteps.push('Complete remaining questionnaire sections for more detailed insights');
  }
  
  if (insights.readiness_scores.market_positioning < 60) {
    nextSteps.push('Define clear target audience and competitive positioning');
  }
  
  if (insights.readiness_scores.content_strategy < 60) {
    nextSteps.push('Develop comprehensive content strategy and calendar');
  }
  
  if (insights.readiness_scores.competitive_intelligence < 50) {
    nextSteps.push('Conduct competitor analysis and set up monitoring');
  }
  
  nextSteps.push('Set up analytics tracking for content performance');
  nextSteps.push('Begin content creation based on identified pillars');
  
  return nextSteps.slice(0, 4);
}

function extractBusinessProfileUpdates(responses: any, insights: any): any {
  return {
    compliance_settings: JSON.stringify({
      industry_regulations: true,
      content_guidelines: true,
      approval_workflow: responses.business_size !== 'solo',
      questionnaire_insights: insights,
      last_updated: new Date().toISOString()
    }),
    brand_colors: JSON.stringify({
      primary: '#8B5CF6',
      secondary: '#06B6D4', 
      accent: '#10B981',
      industry: responses.industry,
      tone: responses.brand_voice
    })
  };
}

function suggestPlatformsForIndustry(industry: string): string[] {
  const suggestions: { [key: string]: string[] } = {
    health: ['linkedin', 'facebook', 'instagram'],
    finance: ['linkedin', 'twitter', 'facebook'],
    legal: ['linkedin', 'facebook', 'twitter'],
    tech: ['linkedin', 'twitter', 'instagram'],
    fitness: ['instagram', 'facebook', 'twitter'],
    beauty: ['instagram', 'facebook', 'twitter']
  };
  
  return suggestions[industry] || ['linkedin', 'facebook', 'instagram'];
}

function recommendPostingFrequency(timeCommitment: string, platformCount: number): string {
  const timeScores = { 'under-5': 1, '5-10': 2, '10-20': 3, '20-40': 4, 'over-40': 5 };
  const timeScore = timeScores[timeCommitment as keyof typeof timeScores] || 2;
  
  const capacity = Math.floor(timeScore / platformCount);
  
  if (capacity >= 4) return 'daily';
  if (capacity >= 3) return 'few-times-week';
  if (capacity >= 2) return 'weekly';
  return 'bi-weekly';
}

function suggestContentFormats(industry: string, platforms: string[]): string[] {
  const baseFormats = ['image', 'short_form', 'long_form'];
  
  if (platforms?.includes('instagram')) {
    baseFormats.push('stories', 'reels');
  }
  
  if (platforms?.includes('linkedin')) {
    baseFormats.push('articles', 'infographics');
  }
  
  if (industry === 'fitness' || industry === 'beauty') {
    baseFormats.push('video_tutorials', 'before_after');
  }
  
  if (industry === 'tech') {
    baseFormats.push('demos', 'tutorials');
  }
  
  return baseFormats.slice(0, 6);
}