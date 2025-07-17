import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CompetitorAnalysisRequest {
  competitorId: string;
  analysisType: 'content_gap' | 'sentiment' | 'strategy' | 'performance' | 'comprehensive';
  businessProfileId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { competitorId, analysisType, businessProfileId }: CompetitorAnalysisRequest = await req.json();

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

    console.log(`Starting ${analysisType} analysis for competitor ${competitorId}`);

    // Fetch competitor data
    const { data: competitor, error: competitorError } = await supabaseClient
      .from('competitor_data')
      .select('*')
      .eq('id', competitorId)
      .eq('user_id', user.id)
      .single();

    if (competitorError || !competitor) {
      throw new Error("Competitor not found or unauthorized");
    }

    // Fetch competitor content for analysis
    const { data: competitorContent, error: contentError } = await supabaseClient
      .from('competitor_content')
      .select('*')
      .eq('competitor_id', competitorId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (contentError) {
      console.error("Error fetching competitor content:", contentError);
    }

    // Fetch user's own content for comparison
    const { data: userContent, error: userContentError } = await supabaseClient
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);

    if (userContentError) {
      console.error("Error fetching user content:", userContentError);
    }

    const startTime = Date.now();
    let analysisResults: any = {};

    // Perform analysis based on type
    switch (analysisType) {
      case 'content_gap':
        analysisResults = await performContentGapAnalysis(
          competitor,
          competitorContent || [],
          userContent || []
        );
        break;
      
      case 'sentiment':
        analysisResults = await performSentimentAnalysis(
          competitor,
          competitorContent || []
        );
        break;
      
      case 'strategy':
        analysisResults = await performStrategyAnalysis(
          competitor,
          competitorContent || []
        );
        break;
      
      case 'performance':
        analysisResults = await performPerformanceAnalysis(
          competitor,
          competitorContent || []
        );
        break;
      
      case 'comprehensive':
        analysisResults = await performComprehensiveAnalysis(
          competitor,
          competitorContent || [],
          userContent || []
        );
        break;
      
      default:
        throw new Error(`Unsupported analysis type: ${analysisType}`);
    }

    const processingTime = Date.now() - startTime;

    // Store analysis results
    const { data: analysisRecord, error: insertError } = await supabaseService
      .from('competitive_analysis_results')
      .insert({
        user_id: user.id,
        business_profile_id: businessProfileId,
        competitor_id: competitorId,
        analysis_type: analysisType,
        analysis_results: analysisResults,
        confidence_score: analysisResults.confidence_score || 0.85,
        status: 'completed',
        processing_time_ms: processingTime,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing analysis results:", insertError);
      throw insertError;
    }

    // Generate strategic recommendations based on analysis
    const recommendations = generateStrategicRecommendations(
      analysisType,
      analysisResults,
      competitor
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
            data_sources: [analysisRecord.id],
          }))
        );

      if (recError) {
        console.error("Error storing recommendations:", recError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysisId: analysisRecord.id,
        results: analysisResults,
        recommendations: recommendations,
        processingTime: processingTime,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in competitor analysis:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function performContentGapAnalysis(competitor: any, competitorContent: any[], userContent: any[]) {
  // Analyze content topics and formats
  const competitorTopics = extractTopics(competitorContent);
  const userTopics = extractTopics(userContent);
  
  const gaps = competitorTopics.filter(topic => !userTopics.includes(topic));
  const overlaps = competitorTopics.filter(topic => userTopics.includes(topic));
  
  const competitorFormats = extractContentFormats(competitorContent);
  const userFormats = extractContentFormats(userContent);
  
  const formatGaps = competitorFormats.filter(format => !userFormats.includes(format));

  return {
    content_gaps: {
      topics: gaps,
      formats: formatGaps,
      opportunities: gaps.slice(0, 5).map(topic => ({
        topic,
        priority: 'high',
        reasoning: `${competitor.competitor_name} is actively creating content about ${topic}, which you're not covering`
      }))
    },
    content_overlaps: {
      topics: overlaps,
      competitive_intensity: overlaps.length / competitorTopics.length,
    },
    recommendations: [
      ...gaps.slice(0, 3).map(topic => `Create content about ${topic} to compete with ${competitor.competitor_name}`),
      ...formatGaps.slice(0, 2).map(format => `Experiment with ${format} content format`)
    ],
    confidence_score: 0.88
  };
}

async function performSentimentAnalysis(competitor: any, competitorContent: any[]) {
  // Analyze sentiment patterns in competitor content
  const sentiments = competitorContent.map(content => {
    const text = content.content_text || '';
    return {
      date: content.post_date,
      sentiment: calculateSentiment(text),
      engagement: content.engagement_metrics || {}
    };
  });

  const avgSentiment = sentiments.reduce((sum, s) => sum + s.sentiment, 0) / sentiments.length || 0;
  const sentimentTrend = calculateSentimentTrend(sentiments);

  return {
    overall_sentiment: {
      score: avgSentiment,
      label: avgSentiment > 0.1 ? 'positive' : avgSentiment < -0.1 ? 'negative' : 'neutral'
    },
    sentiment_distribution: {
      positive: sentiments.filter(s => s.sentiment > 0.1).length,
      neutral: sentiments.filter(s => s.sentiment >= -0.1 && s.sentiment <= 0.1).length,
      negative: sentiments.filter(s => s.sentiment < -0.1).length
    },
    engagement_correlation: calculateEngagementSentimentCorrelation(sentiments),
    trends: sentimentTrend,
    insights: [
      `${competitor.competitor_name} maintains a ${avgSentiment > 0 ? 'positive' : 'neutral'} tone in their content`,
      sentimentTrend.direction === 'increasing' ? 'Their sentiment is becoming more positive over time' : 'Their sentiment remains stable'
    ],
    confidence_score: 0.82
  };
}

async function performStrategyAnalysis(competitor: any, competitorContent: any[]) {
  // Analyze posting patterns and content strategy
  const postingFrequency = calculatePostingFrequency(competitorContent);
  const bestPerformingTimes = analyzeBestTimes(competitorContent);
  const contentMix = analyzeContentMix(competitorContent);
  const platformStrategy = analyzePlatformStrategy(competitorContent);

  return {
    posting_strategy: {
      frequency: postingFrequency,
      best_times: bestPerformingTimes,
      consistency_score: calculateConsistencyScore(competitorContent)
    },
    content_strategy: {
      content_mix: contentMix,
      average_length: calculateAverageContentLength(competitorContent),
      hashtag_strategy: analyzeHashtagStrategy(competitorContent)
    },
    platform_strategy: platformStrategy,
    competitive_advantages: [
      postingFrequency.posts_per_week > 5 ? 'High posting frequency' : 'Moderate posting frequency',
      contentMix.educational > 0.3 ? 'Strong educational content focus' : 'Entertainment-focused content',
      platformStrategy.primary_platform ? `Strong presence on ${platformStrategy.primary_platform}` : 'Multi-platform approach'
    ],
    recommendations: [
      `Consider posting ${postingFrequency.posts_per_week > 3 ? 'more frequently' : 'at similar frequency'} to match their cadence`,
      `Focus on ${contentMix.top_category} content which performs well for them`,
      `Target posting times around ${bestPerformingTimes.peak_hour}:00 for better engagement`
    ],
    confidence_score: 0.86
  };
}

async function performPerformanceAnalysis(competitor: any, competitorContent: any[]) {
  // Analyze engagement and performance metrics
  const engagementMetrics = calculateEngagementMetrics(competitorContent);
  const topPerformingContent = identifyTopContent(competitorContent);
  const performanceTrends = calculatePerformanceTrends(competitorContent);

  return {
    engagement_metrics: engagementMetrics,
    top_performing_content: topPerformingContent,
    performance_trends: performanceTrends,
    benchmarks: {
      avg_engagement_rate: engagementMetrics.avg_engagement_rate,
      best_content_type: topPerformingContent[0]?.content_type || 'unknown',
      peak_performance_period: performanceTrends.best_period
    },
    competitive_position: {
      strength_areas: identifyStrengthAreas(engagementMetrics, topPerformingContent),
      improvement_opportunities: identifyImprovementAreas(performanceTrends)
    },
    confidence_score: 0.84
  };
}

async function performComprehensiveAnalysis(competitor: any, competitorContent: any[], userContent: any[]) {
  // Combine all analysis types for comprehensive insights
  const contentGap = await performContentGapAnalysis(competitor, competitorContent, userContent);
  const sentiment = await performSentimentAnalysis(competitor, competitorContent);
  const strategy = await performStrategyAnalysis(competitor, competitorContent);
  const performance = await performPerformanceAnalysis(competitor, competitorContent);

  return {
    executive_summary: {
      key_findings: [
        `${competitor.competitor_name} has ${contentGap.content_gaps.topics.length} content gap opportunities`,
        `Their content maintains a ${sentiment.overall_sentiment.label} sentiment`,
        `They post ${strategy.posting_strategy.frequency.posts_per_week} times per week on average`,
        `Their average engagement rate is ${performance.engagement_metrics.avg_engagement_rate.toFixed(2)}%`
      ],
      threat_level: calculateThreatLevel(strategy, performance),
      opportunity_score: calculateOpportunityScore(contentGap, performance)
    },
    detailed_analysis: {
      content_gaps: contentGap,
      sentiment_analysis: sentiment,
      strategy_analysis: strategy,
      performance_analysis: performance
    },
    strategic_recommendations: generateComprehensiveRecommendations(contentGap, sentiment, strategy, performance),
    confidence_score: 0.87
  };
}

// Helper functions for analysis
function extractTopics(content: any[]): string[] {
  // Extract topics from content using simple keyword analysis
  const topics = new Set<string>();
  content.forEach(item => {
    const text = (item.content_text || '').toLowerCase();
    const tags = item.topics || [];
    
    // Add existing tags
    tags.forEach((tag: string) => topics.add(tag));
    
    // Extract common business topics
    const businessTopics = [
      'marketing', 'sales', 'productivity', 'leadership', 'strategy',
      'innovation', 'technology', 'customer service', 'growth', 'branding'
    ];
    
    businessTopics.forEach(topic => {
      if (text.includes(topic)) topics.add(topic);
    });
  });
  
  return Array.from(topics);
}

function extractContentFormats(content: any[]): string[] {
  const formats = new Set<string>();
  content.forEach(item => {
    if (item.image_urls && item.image_urls.length > 0) formats.add('image');
    if (item.content_text && item.content_text.length > 500) formats.add('long_form');
    if (item.content_text && item.content_text.length <= 280) formats.add('short_form');
    if (item.content_type) formats.add(item.content_type);
  });
  return Array.from(formats);
}

function calculateSentiment(text: string): number {
  // Simple sentiment calculation based on positive/negative words
  const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'perfect'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  return Math.max(-1, Math.min(1, score / Math.max(words.length / 10, 1)));
}

function calculateSentimentTrend(sentiments: any[]): any {
  if (sentiments.length < 2) return { direction: 'stable', change: 0 };
  
  const recent = sentiments.slice(0, Math.ceil(sentiments.length / 3));
  const older = sentiments.slice(Math.floor(sentiments.length * 2 / 3));
  
  const recentAvg = recent.reduce((sum, s) => sum + s.sentiment, 0) / recent.length;
  const olderAvg = older.reduce((sum, s) => sum + s.sentiment, 0) / older.length;
  
  const change = recentAvg - olderAvg;
  
  return {
    direction: change > 0.1 ? 'increasing' : change < -0.1 ? 'decreasing' : 'stable',
    change: change
  };
}

function calculateEngagementSentimentCorrelation(sentiments: any[]): number {
  // Calculate correlation between sentiment and engagement
  const validSentiments = sentiments.filter(s => s.engagement && typeof s.engagement === 'object');
  if (validSentiments.length < 3) return 0;
  
  const engagements = validSentiments.map(s => {
    const metrics = s.engagement;
    return (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
  });
  
  const sentimentValues = validSentiments.map(s => s.sentiment);
  
  // Simple correlation calculation
  const avgEngagement = engagements.reduce((sum, e) => sum + e, 0) / engagements.length;
  const avgSentiment = sentimentValues.reduce((sum, s) => sum + s, 0) / sentimentValues.length;
  
  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;
  
  for (let i = 0; i < engagements.length; i++) {
    const engagementDiff = engagements[i] - avgEngagement;
    const sentimentDiff = sentimentValues[i] - avgSentiment;
    
    numerator += engagementDiff * sentimentDiff;
    denominator1 += engagementDiff * engagementDiff;
    denominator2 += sentimentDiff * sentimentDiff;
  }
  
  const denominator = Math.sqrt(denominator1 * denominator2);
  return denominator === 0 ? 0 : numerator / denominator;
}

function calculatePostingFrequency(content: any[]): any {
  if (content.length === 0) return { posts_per_week: 0, posts_per_day: 0 };
  
  const dates = content
    .filter(item => item.post_date)
    .map(item => new Date(item.post_date))
    .sort((a, b) => b.getTime() - a.getTime());
  
  if (dates.length < 2) return { posts_per_week: content.length, posts_per_day: content.length };
  
  const daysBetween = (dates[0].getTime() - dates[dates.length - 1].getTime()) / (1000 * 60 * 60 * 24);
  const postsPerDay = content.length / Math.max(daysBetween, 1);
  
  return {
    posts_per_week: Math.round(postsPerDay * 7 * 10) / 10,
    posts_per_day: Math.round(postsPerDay * 10) / 10,
    total_posts: content.length,
    date_range_days: Math.round(daysBetween)
  };
}

function analyzeBestTimes(content: any[]): any {
  const hourCounts: { [hour: number]: number } = {};
  
  content.forEach(item => {
    if (item.post_date) {
      const hour = new Date(item.post_date).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });
  
  const peakHour = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];
  
  return {
    peak_hour: peakHour ? parseInt(peakHour) : 12,
    hour_distribution: hourCounts,
    most_active_period: peakHour ? 
      (parseInt(peakHour) < 12 ? 'morning' : parseInt(peakHour) < 17 ? 'afternoon' : 'evening') : 
      'unknown'
  };
}

function analyzeContentMix(content: any[]): any {
  const categories: { [key: string]: number } = {};
  let totalLength = 0;
  
  content.forEach(item => {
    const text = item.content_text || '';
    totalLength += text.length;
    
    // Categorize content based on keywords and length
    if (text.length > 500) {
      categories['long_form'] = (categories['long_form'] || 0) + 1;
    } else {
      categories['short_form'] = (categories['short_form'] || 0) + 1;
    }
    
    // Content type categorization
    const lowerText = text.toLowerCase();
    if (lowerText.includes('how to') || lowerText.includes('tutorial') || lowerText.includes('guide')) {
      categories['educational'] = (categories['educational'] || 0) + 1;
    } else if (lowerText.includes('sale') || lowerText.includes('offer') || lowerText.includes('discount')) {
      categories['promotional'] = (categories['promotional'] || 0) + 1;
    } else {
      categories['general'] = (categories['general'] || 0) + 1;
    }
  });
  
  const total = content.length;
  const percentages: { [key: string]: number } = {};
  
  Object.entries(categories).forEach(([category, count]) => {
    percentages[category] = total > 0 ? count / total : 0;
  });
  
  const topCategory = Object.entries(percentages)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general';
  
  return {
    ...percentages,
    top_category: topCategory,
    average_length: total > 0 ? Math.round(totalLength / total) : 0
  };
}

function analyzePlatformStrategy(content: any[]): any {
  const platforms: { [platform: string]: number } = {};
  
  content.forEach(item => {
    const platform = item.platform || 'unknown';
    platforms[platform] = (platforms[platform] || 0) + 1;
  });
  
  const primaryPlatform = Object.entries(platforms)
    .sort(([,a], [,b]) => b - a)[0]?.[0];
  
  return {
    platform_distribution: platforms,
    primary_platform: primaryPlatform,
    multi_platform: Object.keys(platforms).length > 1,
    platform_focus: Object.keys(platforms).length === 1 ? 'single' : 'multi'
  };
}

function calculateConsistencyScore(content: any[]): number {
  if (content.length < 7) return 0.5; // Not enough data
  
  const dates = content
    .filter(item => item.post_date)
    .map(item => new Date(item.post_date))
    .sort((a, b) => a.getTime() - b.getTime());
  
  if (dates.length < 2) return 0.5;
  
  const intervals: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const days = (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24);
    intervals.push(days);
  }
  
  const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
  const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Lower standard deviation means higher consistency
  const consistencyScore = Math.max(0, Math.min(1, 1 - (standardDeviation / avgInterval)));
  return Math.round(consistencyScore * 100) / 100;
}

function calculateAverageContentLength(content: any[]): number {
  const lengths = content
    .filter(item => item.content_text)
    .map(item => item.content_text.length);
  
  return lengths.length > 0 ? 
    Math.round(lengths.reduce((sum, len) => sum + len, 0) / lengths.length) : 0;
}

function analyzeHashtagStrategy(content: any[]): any {
  const hashtags: { [tag: string]: number } = {};
  let totalHashtags = 0;
  
  content.forEach(item => {
    const text = item.content_text || '';
    const matches = text.match(/#\w+/g) || [];
    totalHashtags += matches.length;
    
    matches.forEach(tag => {
      const cleanTag = tag.toLowerCase();
      hashtags[cleanTag] = (hashtags[cleanTag] || 0) + 1;
    });
  });
  
  const topHashtags = Object.entries(hashtags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
  
  return {
    average_hashtags_per_post: content.length > 0 ? Math.round((totalHashtags / content.length) * 10) / 10 : 0,
    top_hashtags: topHashtags,
    total_unique_hashtags: Object.keys(hashtags).length,
    hashtag_diversity: Object.keys(hashtags).length / Math.max(totalHashtags, 1)
  };
}

function calculateEngagementMetrics(content: any[]): any {
  const engagements = content
    .filter(item => item.engagement_metrics)
    .map(item => {
      const metrics = item.engagement_metrics;
      return {
        likes: metrics.likes || 0,
        comments: metrics.comments || 0,
        shares: metrics.shares || 0,
        total: (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)
      };
    });
  
  if (engagements.length === 0) {
    return {
      avg_engagement_rate: 0,
      avg_likes: 0,
      avg_comments: 0,
      avg_shares: 0,
      total_engagement: 0
    };
  }
  
  const totals = engagements.reduce((acc, eng) => ({
    likes: acc.likes + eng.likes,
    comments: acc.comments + eng.comments,
    shares: acc.shares + eng.shares,
    total: acc.total + eng.total
  }), { likes: 0, comments: 0, shares: 0, total: 0 });
  
  return {
    avg_engagement_rate: Math.round((totals.total / engagements.length) * 100) / 100,
    avg_likes: Math.round(totals.likes / engagements.length),
    avg_comments: Math.round(totals.comments / engagements.length),
    avg_shares: Math.round(totals.shares / engagements.length),
    total_engagement: totals.total,
    engagement_distribution: {
      likes_ratio: totals.total > 0 ? totals.likes / totals.total : 0,
      comments_ratio: totals.total > 0 ? totals.comments / totals.total : 0,
      shares_ratio: totals.total > 0 ? totals.shares / totals.total : 0
    }
  };
}

function identifyTopContent(content: any[]): any[] {
  return content
    .filter(item => item.engagement_metrics)
    .map(item => {
      const metrics = item.engagement_metrics;
      const totalEngagement = (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
      return {
        ...item,
        total_engagement: totalEngagement
      };
    })
    .sort((a, b) => b.total_engagement - a.total_engagement)
    .slice(0, 5)
    .map(item => ({
      content_text: item.content_text?.substring(0, 100) + '...',
      content_type: item.content_type,
      platform: item.platform,
      total_engagement: item.total_engagement,
      post_date: item.post_date
    }));
}

function calculatePerformanceTrends(content: any[]): any {
  const monthlyData: { [month: string]: { engagement: number, posts: number } } = {};
  
  content.forEach(item => {
    if (item.post_date && item.engagement_metrics) {
      const date = new Date(item.post_date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { engagement: 0, posts: 0 };
      }
      
      const metrics = item.engagement_metrics;
      const totalEngagement = (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
      
      monthlyData[monthKey].engagement += totalEngagement;
      monthlyData[monthKey].posts += 1;
    }
  });
  
  const months = Object.keys(monthlyData).sort();
  const trend = months.map(month => ({
    month,
    avg_engagement: monthlyData[month].posts > 0 ? 
      Math.round(monthlyData[month].engagement / monthlyData[month].posts) : 0,
    posts: monthlyData[month].posts
  }));
  
  const bestMonth = trend.reduce((best, current) => 
    current.avg_engagement > best.avg_engagement ? current : best, 
    trend[0] || { month: 'unknown', avg_engagement: 0 }
  );
  
  return {
    monthly_trends: trend,
    best_period: bestMonth.month,
    best_avg_engagement: bestMonth.avg_engagement,
    trend_direction: calculateTrendDirection(trend)
  };
}

function calculateTrendDirection(trend: any[]): string {
  if (trend.length < 2) return 'stable';
  
  const recent = trend.slice(-3);
  const older = trend.slice(0, 3);
  
  const recentAvg = recent.reduce((sum, t) => sum + t.avg_engagement, 0) / recent.length;
  const olderAvg = older.reduce((sum, t) => sum + t.avg_engagement, 0) / older.length;
  
  const change = recentAvg - olderAvg;
  
  if (change > olderAvg * 0.1) return 'increasing';
  if (change < -olderAvg * 0.1) return 'decreasing';
  return 'stable';
}

function identifyStrengthAreas(metrics: any, topContent: any[]): string[] {
  const strengths: string[] = [];
  
  if (metrics.avg_engagement_rate > 50) {
    strengths.push('High engagement rates');
  }
  
  if (metrics.engagement_distribution.comments_ratio > 0.3) {
    strengths.push('Strong conversation generation');
  }
  
  if (metrics.engagement_distribution.shares_ratio > 0.1) {
    strengths.push('Highly shareable content');
  }
  
  if (topContent.length > 0) {
    const platforms = [...new Set(topContent.map(c => c.platform))];
    if (platforms.length === 1) {
      strengths.push(`Strong ${platforms[0]} performance`);
    }
  }
  
  return strengths.length > 0 ? strengths : ['Consistent content creation'];
}

function identifyImprovementAreas(trends: any): string[] {
  const improvements: string[] = [];
  
  if (trends.trend_direction === 'decreasing') {
    improvements.push('Engagement declining over time');
  }
  
  if (trends.best_avg_engagement < 20) {
    improvements.push('Low overall engagement rates');
  }
  
  if (trends.monthly_trends.length > 3) {
    const consistency = trends.monthly_trends.reduce((acc: number, trend: any, index: number) => {
      if (index === 0) return acc;
      const prevTrend = trends.monthly_trends[index - 1];
      return acc + Math.abs(trend.avg_engagement - prevTrend.avg_engagement);
    }, 0) / (trends.monthly_trends.length - 1);
    
    if (consistency > trends.best_avg_engagement * 0.5) {
      improvements.push('Inconsistent performance across months');
    }
  }
  
  return improvements.length > 0 ? improvements : ['Focus on scaling successful content'];
}

function calculateThreatLevel(strategy: any, performance: any): 'low' | 'medium' | 'high' {
  let score = 0;
  
  // High posting frequency increases threat
  if (strategy.posting_strategy.frequency.posts_per_week > 7) score += 2;
  else if (strategy.posting_strategy.frequency.posts_per_week > 3) score += 1;
  
  // High engagement rates increase threat
  if (performance.engagement_metrics.avg_engagement_rate > 100) score += 2;
  else if (performance.engagement_metrics.avg_engagement_rate > 50) score += 1;
  
  // Consistent posting increases threat
  if (strategy.posting_strategy.consistency_score > 0.8) score += 1;
  
  // Growing performance increases threat
  if (performance.performance_trends.trend_direction === 'increasing') score += 1;
  
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

function calculateOpportunityScore(contentGap: any, performance: any): number {
  let score = 0;
  
  // More content gaps = more opportunities
  score += Math.min(contentGap.content_gaps.topics.length * 2, 20);
  
  // Lower competitor engagement = more opportunity
  if (performance.engagement_metrics.avg_engagement_rate < 30) score += 15;
  else if (performance.engagement_metrics.avg_engagement_rate < 60) score += 10;
  else score += 5;
  
  // Declining performance = opportunity
  if (performance.performance_trends.trend_direction === 'decreasing') score += 10;
  
  return Math.min(score, 100);
}

function generateComprehensiveRecommendations(contentGap: any, sentiment: any, strategy: any, performance: any): string[] {
  const recommendations: string[] = [];
  
  // Content gap recommendations
  if (contentGap.content_gaps.topics.length > 0) {
    recommendations.push(`Target these untapped topics: ${contentGap.content_gaps.topics.slice(0, 3).join(', ')}`);
  }
  
  // Strategy recommendations
  if (strategy.posting_strategy.frequency.posts_per_week > 5) {
    recommendations.push('Increase posting frequency to match competitive pace');
  }
  
  if (strategy.posting_strategy.consistency_score < 0.7) {
    recommendations.push('Improve posting consistency for better audience retention');
  }
  
  // Performance recommendations
  if (performance.engagement_metrics.avg_engagement_rate < 30) {
    recommendations.push('Focus on increasing engagement through more interactive content');
  }
  
  // Sentiment recommendations
  if (sentiment.overall_sentiment.score > 0.2) {
    recommendations.push('Competitor uses positive messaging - consider similar tone');
  }
  
  return recommendations.slice(0, 5);
}

function generateStrategicRecommendations(analysisType: string, results: any, competitor: any): any[] {
  const recommendations: any[] = [];
  
  switch (analysisType) {
    case 'content_gap':
      if (results.content_gaps.topics.length > 0) {
        recommendations.push({
          recommendation_type: 'content_topic',
          title: `Explore ${results.content_gaps.topics[0]} Content`,
          description: `${competitor.competitor_name} is actively creating content about ${results.content_gaps.topics[0]}. This represents a content gap opportunity.`,
          priority_score: 8,
          implementation_effort: 'medium',
          expected_impact: 'high',
          metadata: { competitor_name: competitor.competitor_name, topic: results.content_gaps.topics[0] }
        });
      }
      break;
      
    case 'strategy':
      if (results.posting_strategy.best_times.peak_hour) {
        recommendations.push({
          recommendation_type: 'posting_time',
          title: `Optimize Posting Schedule`,
          description: `${competitor.competitor_name} gets best engagement posting around ${results.posting_strategy.best_times.peak_hour}:00. Consider adjusting your schedule.`,
          priority_score: 6,
          implementation_effort: 'low',
          expected_impact: 'medium',
          metadata: { optimal_hour: results.posting_strategy.best_times.peak_hour }
        });
      }
      break;
      
    case 'performance':
      if (results.top_performing_content.length > 0) {
        const topContent = results.top_performing_content[0];
        recommendations.push({
          recommendation_type: 'content_format',
          title: `Create More ${topContent.content_type} Content`,
          description: `${competitor.competitor_name}'s best performing content is ${topContent.content_type}. Consider creating similar content formats.`,
          priority_score: 7,
          implementation_effort: 'medium',
          expected_impact: 'high',
          metadata: { content_type: topContent.content_type, engagement: topContent.total_engagement }
        });
      }
      break;
  }
  
  return recommendations;
}