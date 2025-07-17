import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Tables } from '@/integrations/supabase/types';

type CompetitorData = Tables<'competitor_data'>;
type CompetitorContent = Tables<'competitor_content'>;
type CompetitiveInsight = Tables<'competitive_insights'>;

interface UseCompetitorDataReturn {
  competitors: CompetitorData[];
  insights: CompetitiveInsight[];
  isLoading: boolean;
  error: string | null;
  addCompetitor: (competitor: Omit<Partial<CompetitorData>, 'user_id'> & { competitor_name: string }) => Promise<CompetitorData | null>;
  analyzeCompetitor: (competitorId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useCompetitorData = (): UseCompetitorDataReturn => {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [insights, setInsights] = useState<CompetitiveInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Fetch competitors
      const { data: competitorData, error: competitorError } = await supabase
        .from('competitor_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (competitorError) throw competitorError;

      // Fetch insights
      const { data: insightData, error: insightError } = await supabase
        .from('competitive_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (insightError) throw insightError;

      setCompetitors(competitorData || []);
      setInsights(insightData || []);
    } catch (err: any) {
      console.error('Error fetching competitor data:', err);
      setError(err.message || 'Failed to fetch competitor data');
    } finally {
      setIsLoading(false);
    }
  };

  const addCompetitor = async (competitorData: Omit<Partial<CompetitorData>, 'user_id'> & { competitor_name: string }): Promise<CompetitorData | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('competitor_data')
        .insert({
          competitor_name: competitorData.competitor_name,
          competitor_url: competitorData.competitor_url || null,
          industry: competitorData.industry || null,
          competitor_description: competitorData.competitor_description || null,
          business_profile_id: competitorData.business_profile_id || null,
          analysis_frequency: competitorData.analysis_frequency || 'weekly',
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setCompetitors(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error adding competitor:', err);
      setError(err.message || 'Failed to add competitor');
      return null;
    }
  };

  const analyzeCompetitor = async (competitorId: string): Promise<void> => {
    // This would integrate with external APIs or AI services
    // For now, we'll create a placeholder insight
    if (!user) return;

    try {
      const competitor = competitors.find(c => c.id === competitorId);
      if (!competitor) return;

      const { data, error } = await supabase
        .from('competitive_insights')
        .insert({
          user_id: user.id,
          business_profile_id: competitor.business_profile_id,
          insight_type: 'content_analysis',
          title: `Analysis for ${competitor.competitor_name}`,
          description: 'Automated competitor analysis completed',
          data_points: {
            analyzed_at: new Date().toISOString(),
            competitor_name: competitor.competitor_name,
            analysis_type: 'basic_profile'
          },
          recommendations: {
            actions: ['Monitor content strategy', 'Analyze posting frequency']
          },
          priority_score: 7
        })
        .select()
        .single();

      if (error) throw error;

      setInsights(prev => [data, ...prev]);
    } catch (err: any) {
      console.error('Error analyzing competitor:', err);
      setError(err.message || 'Failed to analyze competitor');
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    competitors,
    insights,
    isLoading,
    error,
    addCompetitor,
    analyzeCompetitor,
    refetch: fetchData,
  };
};