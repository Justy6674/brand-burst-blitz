import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface StrategicRecommendation {
  id: string;
  recommendationType: string;
  title: string;
  description: string;
  priorityScore: number;
  implementationEffort: 'low' | 'medium' | 'high';
  expectedImpact: 'low' | 'medium' | 'high';
  status: 'active' | 'implemented' | 'dismissed' | 'archived';
  createdAt: string;
  dataSources: string[];
  metadata: any;
}

interface UseStrategicRecommendationsReturn {
  recommendations: StrategicRecommendation[];
  isLoading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
  updateRecommendationStatus: (id: string, status: string) => Promise<void>;
  dismissRecommendation: (id: string) => Promise<void>;
  implementRecommendation: (id: string) => Promise<void>;
  getRecommendationsByType: (type: string) => StrategicRecommendation[];
  getHighPriorityRecommendations: () => StrategicRecommendation[];
}

export const useStrategicRecommendations = (): UseStrategicRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<StrategicRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRecommendations = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('strategic_content_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('priority_score', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const formattedRecommendations: StrategicRecommendation[] = (data || []).map((rec: any) => ({
        id: rec.id,
        recommendationType: rec.recommendation_type,
        title: rec.title,
        description: rec.description,
        priorityScore: rec.priority_score,
        implementationEffort: rec.implementation_effort,
        expectedImpact: rec.expected_impact,
        status: rec.status,
        createdAt: rec.created_at,
        dataSources: rec.data_sources || [],
        metadata: rec.metadata || {}
      }));

      setRecommendations(formattedRecommendations);
    } catch (err: any) {
      console.error('Error fetching strategic recommendations:', err);
      setError(err.message);
      toast({
        title: 'Failed to load recommendations',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const updateRecommendationStatus = useCallback(async (id: string, status: string) => {
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('strategic_content_recommendations')
        .update({ 
          status,
          implemented_at: status === 'implemented' ? new Date().toISOString() : null
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update local state
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id ? { ...rec, status: status as any } : rec
        )
      );

      toast({
        title: 'Recommendation updated',
        description: `Status changed to ${status}`,
      });
    } catch (err: any) {
      console.error('Error updating recommendation status:', err);
      toast({
        title: 'Failed to update recommendation',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const dismissRecommendation = useCallback(async (id: string) => {
    await updateRecommendationStatus(id, 'dismissed');
  }, [updateRecommendationStatus]);

  const implementRecommendation = useCallback(async (id: string) => {
    await updateRecommendationStatus(id, 'implemented');
  }, [updateRecommendationStatus]);

  const refreshRecommendations = useCallback(async () => {
    setIsLoading(true);
    await fetchRecommendations();
  }, [fetchRecommendations]);

  const getRecommendationsByType = useCallback((type: string): StrategicRecommendation[] => {
    return recommendations.filter(rec => rec.recommendationType === type);
  }, [recommendations]);

  const getHighPriorityRecommendations = useCallback((): StrategicRecommendation[] => {
    return recommendations
      .filter(rec => rec.priorityScore >= 8 && rec.status === 'active')
      .slice(0, 5);
  }, [recommendations]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    refreshRecommendations,
    updateRecommendationStatus,
    dismissRecommendation,
    implementRecommendation,
    getRecommendationsByType,
    getHighPriorityRecommendations
  };
};