import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Analytics = Tables<'analytics'>;
type Post = Tables<'posts'>;

interface PerformanceMetrics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPerformingPost: Post | null;
  contentByType: { [key: string]: number };
  engagementTrend: { date: string; engagement: number }[];
}

interface CompetitorMetrics {
  totalCompetitors: number;
  activeCompetitors: number;
  highPriorityInsights: number;
  recentAnalyses: number;
  competitorsByIndustry: { [key: string]: number };
}

interface BusinessIntelligence {
  performance: PerformanceMetrics;
  competitors: CompetitorMetrics;
  recommendations: string[];
  growthScore: number;
  isLoading: boolean;
  error: string | null;
}

export const useBusinessIntelligence = () => {
  const [intelligence, setIntelligence] = useState<BusinessIntelligence>({
    performance: {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      scheduledPosts: 0,
      totalEngagement: 0,
      avgEngagementRate: 0,
      topPerformingPost: null,
      contentByType: {},
      engagementTrend: [],
    },
    competitors: {
      totalCompetitors: 0,
      activeCompetitors: 0,
      highPriorityInsights: 0,
      recentAnalyses: 0,
      competitorsByIndustry: {},
    },
    recommendations: [],
    growthScore: 0,
    isLoading: true,
    error: null,
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBusinessIntelligence = async () => {
    if (!user) {
      setIntelligence(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setIntelligence(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch posts data
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id);

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      // Fetch analytics data
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('collected_at', { ascending: false })
        .limit(30);

      if (analyticsError) {
        console.error('Error fetching analytics:', analyticsError);
        // Don't throw - analytics might be empty
      }

      // Fetch competitor data
      const { data: competitors, error: competitorsError } = await supabase
        .from('competitor_data')
        .select('*')
        .eq('user_id', user.id);

      if (competitorsError) {
        console.error('Error fetching competitors:', competitorsError);
        throw competitorsError;
      }

      // Fetch competitive insights
      const { data: insights, error: insightsError } = await supabase
        .from('competitive_insights')
        .select('*')
        .eq('user_id', user.id);

      if (insightsError) {
        console.error('Error fetching insights:', insightsError);
        // Don't throw - insights might be empty
      }

      // Fetch strategic recommendations
      const { data: strategicRecs, error: strategicError } = await supabase
        .from('strategic_content_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('priority_score', { ascending: false })
        .limit(10);

      if (strategicError) {
        console.error('Error fetching strategic recommendations:', strategicError);
        // Don't throw - recommendations might be empty
      }

      // Fetch questionnaire responses for enhanced insights
      const { data: questionnaireData, error: questionnaireError } = await supabase
        .from('business_questionnaire_responses')
        .select('ai_insights, completion_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (questionnaireError) {
        console.error('Error fetching questionnaire data:', questionnaireError);
      }

      // Calculate performance metrics
      const performance = calculatePerformanceMetrics(posts || [], analytics || []);
      const competitorMetrics = calculateCompetitorMetrics(competitors || [], insights || []);
      const recommendations = generateEnhancedRecommendations(
        performance, 
        competitorMetrics, 
        strategicRecs || [],
        questionnaireData?.ai_insights
      );
      const growthScore = calculateEnhancedGrowthScore(
        performance, 
        competitorMetrics, 
        questionnaireData?.completion_score || 0
      );

      setIntelligence({
        performance,
        competitors: competitorMetrics,
        recommendations,
        growthScore,
        isLoading: false,
        error: null,
      });

    } catch (err: any) {
      console.error('Unexpected error fetching business intelligence:', err);
      setIntelligence(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'An unexpected error occurred',
      }));
      toast({
        title: 'Failed to load analytics',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const calculatePerformanceMetrics = (posts: Post[], analytics: Analytics[]): PerformanceMetrics => {
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(p => p.status === 'published').length;
    const draftPosts = posts.filter(p => p.status === 'draft').length;
    const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;

    // Calculate engagement from analytics
    const totalEngagement = analytics.reduce((total, analytic) => {
      const metrics = analytic.metrics as any;
      return total + (metrics?.engagement || 0);
    }, 0);

    const avgEngagementRate = analytics.length > 0 ? totalEngagement / analytics.length : 0;

    // Find top performing post
    const postEngagement: { [key: string]: number } = {};
    analytics.forEach(analytic => {
      if (analytic.post_id) {
        const metrics = analytic.metrics as any;
        postEngagement[analytic.post_id] = (postEngagement[analytic.post_id] || 0) + (metrics?.engagement || 0);
      }
    });

    const topPostId = Object.keys(postEngagement).reduce((a, b) => 
      postEngagement[a] > postEngagement[b] ? a : b, Object.keys(postEngagement)[0]
    );

    const topPerformingPost = posts.find(p => p.id === topPostId) || null;

    // Content by type
    const contentByType: { [key: string]: number } = {};
    posts.forEach(post => {
      contentByType[post.type] = (contentByType[post.type] || 0) + 1;
    });

    // Engagement trend (last 7 days)
    const engagementTrend: { date: string; engagement: number }[] = [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(date => {
      const dayAnalytics = analytics.filter(a => 
        a.collected_at && a.collected_at.startsWith(date)
      );
      const dayEngagement = dayAnalytics.reduce((total, a) => {
        const metrics = a.metrics as any;
        return total + (metrics?.engagement || 0);
      }, 0);
      engagementTrend.push({ date, engagement: dayEngagement });
    });

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      totalEngagement,
      avgEngagementRate,
      topPerformingPost,
      contentByType,
      engagementTrend,
    };
  };

  const calculateCompetitorMetrics = (competitors: any[], insights: any[]): CompetitorMetrics => {
    const totalCompetitors = competitors.length;
    const activeCompetitors = competitors.filter(c => c.is_active).length;
    const highPriorityInsights = insights.filter(i => (i.priority_score || 0) >= 8).length;
    
    // Recent analyses (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentAnalyses = competitors.filter(c => 
      c.last_analyzed_at && new Date(c.last_analyzed_at) > weekAgo
    ).length;

    // Competitors by industry
    const competitorsByIndustry: { [key: string]: number } = {};
    competitors.forEach(competitor => {
      const industry = competitor.industry || 'Other';
      competitorsByIndustry[industry] = (competitorsByIndustry[industry] || 0) + 1;
    });

    return {
      totalCompetitors,
      activeCompetitors,
      highPriorityInsights,
      recentAnalyses,
      competitorsByIndustry,
    };
  };

  const generateEnhancedRecommendations = (
    performance: PerformanceMetrics, 
    competitors: CompetitorMetrics,
    strategicRecs: any[],
    aiInsights?: any
  ): string[] => {
    const recommendations: string[] = [];

    // Include strategic recommendations first
    strategicRecs.forEach(rec => {
      if (rec.status === 'active') {
        recommendations.push(rec.title + ': ' + rec.description);
      }
    });

    // AI-driven insights from questionnaire
    if (aiInsights?.strategic_recommendations) {
      aiInsights.strategic_recommendations.forEach((rec: string) => {
        if (recommendations.length < 8) {
          recommendations.push(rec);
        }
      });
    }

    // Content recommendations
    if (performance.publishedPosts < 5) {
      recommendations.push("Increase content publishing frequency to improve engagement");
    }

    if (performance.avgEngagementRate < 10) {
      recommendations.push("Focus on creating more engaging content to boost interaction rates");
    }

    if (performance.draftPosts > performance.publishedPosts) {
      recommendations.push("Consider publishing more of your draft content to increase visibility");
    }

    // Competitor recommendations
    if (competitors.totalCompetitors < 3) {
      recommendations.push("Add more competitors to gain better market insights");
    }

    if (competitors.activeCompetitors < competitors.totalCompetitors / 2) {
      recommendations.push("Activate monitoring for more competitors to stay updated on market trends");
    }

    if (competitors.highPriorityInsights > 0) {
      recommendations.push("Review and act on high-priority competitive insights");
    }

    // Industry-specific recommendations from AI insights
    if (aiInsights?.industry_insights?.industry_specific_recommendations) {
      aiInsights.industry_insights.industry_specific_recommendations.forEach((rec: string) => {
        if (recommendations.length < 10) {
          recommendations.push(rec);
        }
      });
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push("Great work! Continue maintaining your content strategy and competitive monitoring");
    }

    return recommendations.slice(0, 8); // Limit to 8 recommendations
  };

  const calculateEnhancedGrowthScore = (
    performance: PerformanceMetrics, 
    competitors: CompetitorMetrics,
    questionnaireScore: number
  ): number => {
    let score = 0;

    // Content score (30 points max)
    score += Math.min(performance.publishedPosts * 2, 15); // 2 points per published post, max 15
    score += Math.min(performance.avgEngagementRate / 2, 15); // Engagement rate contribution, max 15

    // Competitor intelligence score (25 points max)
    score += Math.min(competitors.activeCompetitors * 3, 15); // 3 points per active competitor, max 15
    score += Math.min(competitors.recentAnalyses * 2, 10); // 2 points per recent analysis, max 10

    // Activity score (20 points max)
    const activityScore = performance.engagementTrend.reduce((total, day) => total + day.engagement, 0) / 100;
    score += Math.min(activityScore, 20);

    // Business intelligence foundation score (25 points max)
    score += Math.min(questionnaireScore / 4, 25); // Questionnaire completion contributes up to 25 points

    return Math.min(Math.round(score), 100); // Cap at 100
  };

  const refreshIntelligence = () => {
    fetchBusinessIntelligence();
  };

  useEffect(() => {
    fetchBusinessIntelligence();
  }, [user]);

  return {
    ...intelligence,
    refreshIntelligence,
  };
};