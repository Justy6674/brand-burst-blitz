import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface CompetitorAnalysisResult {
  id: string;
  analysisType: string;
  results: any;
  competitorId: string;
  competitorName: string;
  createdAt: string;
  confidenceScore: number;
  status: string;
}

interface UseCompetitorAnalysisReturn {
  isAnalyzing: boolean;
  analysisResults: CompetitorAnalysisResult[];
  startAnalysis: (competitorId: string, analysisType: string, businessProfileId?: string) => Promise<void>;
  getAnalysisHistory: (competitorId?: string) => Promise<void>;
  refreshResults: () => Promise<void>;
  error: string | null;
}

export const useCompetitorAnalysis = (): UseCompetitorAnalysisReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<CompetitorAnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const startAnalysis = useCallback(async (
    competitorId: string, 
    analysisType: string,
    businessProfileId?: string
  ) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: analysisError } = await supabase.functions.invoke('analyze-competitor', {
        body: {
          competitorId,
          analysisType,
          businessProfileId
        }
      });

      if (analysisError) {
        throw new Error(analysisError.message);
      }

      if (data.success) {
        toast({
          title: 'Analysis completed',
          description: `${analysisType} analysis finished successfully`,
        });

        // Refresh the results to show the new analysis
        await getAnalysisHistory();
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err: any) {
      console.error('Error starting competitor analysis:', err);
      setError(err.message);
      toast({
        title: 'Analysis failed',
        description: err.message || 'Failed to start competitor analysis',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, toast]);

  const getAnalysisHistory = useCallback(async (competitorId?: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      let query = supabase
        .from('competitive_analysis_results')
        .select(`
          *,
          competitor_data!inner(competitor_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (competitorId) {
        query = query.eq('competitor_id', competitorId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const formattedResults: CompetitorAnalysisResult[] = (data || []).map((result: any) => ({
        id: result.id,
        analysisType: result.analysis_type,
        results: result.analysis_results,
        competitorId: result.competitor_id,
        competitorName: result.competitor_data.competitor_name,
        createdAt: result.created_at,
        confidenceScore: result.confidence_score,
        status: result.status
      }));

      setAnalysisResults(formattedResults);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching analysis history:', err);
      setError(err.message);
      toast({
        title: 'Failed to load analysis history',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const refreshResults = useCallback(async () => {
    await getAnalysisHistory();
  }, [getAnalysisHistory]);

  return {
    isAnalyzing,
    analysisResults,
    startAnalysis,
    getAnalysisHistory,
    refreshResults,
    error
  };
};