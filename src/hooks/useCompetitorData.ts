import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type CompetitorData = Tables<'competitor_data'>;
type CompetitorContent = Tables<'competitor_content'>;
type CompetitiveInsight = Tables<'competitive_insights'>;

interface UseCompetitorDataReturn {
  competitors: CompetitorData[];
  insights: CompetitiveInsight[];
  isLoading: boolean;
  error: string | null;
  addCompetitor: (competitor: Partial<CompetitorData>) => Promise<CompetitorData | null>;
  updateCompetitor: (id: string, updates: Partial<CompetitorData>) => Promise<boolean>;
  deleteCompetitor: (id: string) => Promise<boolean>;
  analyzeCompetitor: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const useCompetitorData = (): UseCompetitorDataReturn => {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [insights, setInsights] = useState<CompetitiveInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

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
        .order('created_at', { ascending: false });

      if (competitorError) {
        console.error('Error fetching competitors:', competitorError);
        setError(competitorError.message);
        return;
      }

      // Fetch insights
      const { data: insightData, error: insightError } = await supabase
        .from('competitive_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('priority_score', { ascending: false });

      if (insightError) {
        console.error('Error fetching insights:', insightError);
        setError(insightError.message);
        return;
      }

      setCompetitors(competitorData || []);
      setInsights(insightData || []);
    } catch (err: any) {
      console.error('Unexpected error fetching competitor data:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addCompetitor = async (competitorData: Partial<CompetitorData>): Promise<CompetitorData | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('competitor_data')
        .insert({
          competitor_name: competitorData.competitor_name!,
          competitor_url: competitorData.competitor_url,
          industry: competitorData.industry,
          competitor_description: competitorData.competitor_description,
          analysis_frequency: competitorData.analysis_frequency || 'weekly',
          is_active: competitorData.is_active ?? true,
          social_platforms: competitorData.social_platforms || {},
          business_profile_id: competitorData.business_profile_id,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding competitor:', error);
        toast({
          title: 'Failed to add competitor',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }

      setCompetitors(prev => [data, ...prev]);
      toast({
        title: 'Competitor added',
        description: 'Competitor has been added successfully.',
      });

      return data;
    } catch (err: any) {
      console.error('Unexpected error adding competitor:', err);
      toast({
        title: 'Failed to add competitor',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateCompetitor = async (id: string, updates: Partial<CompetitorData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('competitor_data')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error updating competitor:', error);
        toast({
          title: 'Failed to update competitor',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      setCompetitors(prev => prev.map(competitor => 
        competitor.id === id ? { ...competitor, ...updates } : competitor
      ));

      toast({
        title: 'Competitor updated',
        description: 'Competitor has been updated successfully.',
      });

      return true;
    } catch (err: any) {
      console.error('Unexpected error updating competitor:', err);
      toast({
        title: 'Failed to update competitor',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteCompetitor = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('competitor_data')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting competitor:', error);
        toast({
          title: 'Failed to delete competitor',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      setCompetitors(prev => prev.filter(competitor => competitor.id !== id));
      toast({
        title: 'Competitor deleted',
        description: 'Competitor has been deleted successfully.',
      });

      return true;
    } catch (err: any) {
      console.error('Unexpected error deleting competitor:', err);
      toast({
        title: 'Failed to delete competitor',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const analyzeCompetitor = async (id: string): Promise<boolean> => {
    try {
      // Update last analyzed timestamp
      const updateResult = await updateCompetitor(id, {
        last_analyzed_at: new Date().toISOString()
      });

      if (updateResult) {
        toast({
          title: 'Analysis started',
          description: 'Competitor analysis has been initiated.',
        });
      }

      return updateResult;
    } catch (err: any) {
      console.error('Unexpected error analyzing competitor:', err);
      toast({
        title: 'Failed to analyze competitor',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
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
    updateCompetitor,
    deleteCompetitor,
    analyzeCompetitor,
    refetch: fetchData,
  };
};