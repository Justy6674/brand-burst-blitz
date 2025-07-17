import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Tables } from '@/integrations/supabase/types';

type BusinessProfile = Tables<'business_profiles'>;

interface UseBusinessProfileReturn {
  profile: BusinessProfile | null;
  isLoading: boolean;
  error: string | null;
  hasCompletedQuestionnaire: boolean;
  refetch: () => Promise<void>;
}

export const useBusinessProfile = (): UseBusinessProfileReturn => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      const { data, error: fetchError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching business profile:', fetchError);
        setError(fetchError.message);
        return;
      }

      setProfile(data);
    } catch (err: any) {
      console.error('Unexpected error fetching business profile:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Check if the user has completed the questionnaire
  const hasCompletedQuestionnaire = Boolean(
    profile && 
    profile.business_name && 
    profile.industry &&
    profile.compliance_settings &&
    (() => {
      try {
        const settings = JSON.parse(profile.compliance_settings as string);
        return settings.questionnaire_data?.goals?.primary?.length > 0;
      } catch {
        return false;
      }
    })()
  );

  return {
    profile,
    isLoading,
    error,
    hasCompletedQuestionnaire,
    refetch: fetchProfile,
  };
};