import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type BusinessProfile = Tables<'business_profiles'>;

interface UseBusinessProfileReturn {
  profile: BusinessProfile | null;
  currentProfile: BusinessProfile | null;
  businessProfiles: BusinessProfile[] | undefined;
  isLoading: boolean;
  error: string | null;
  hasCompletedQuestionnaire: boolean;
  refetch: () => Promise<void>;
  createBusinessProfile: (data: TablesInsert<'business_profiles'>) => Promise<BusinessProfile>;
  updateBusinessProfile: (id: string, data: Partial<TablesUpdate<'business_profiles'>>) => Promise<BusinessProfile>;
  deleteBusinessProfile: (id: string) => Promise<void>;
  refreshBusinessProfiles: () => void;
  switchBusiness: (businessId: string) => void;
}

export const useBusinessProfile = (): UseBusinessProfileReturn => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query for all business profiles
  const { data: businessProfiles, refetch: refetchProfiles } = useQuery({
    queryKey: ['business-profiles', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BusinessProfile[];
    },
    enabled: !!user,
  });

  // Create business profile mutation
  const createMutation = useMutation({
    mutationFn: async (data: TablesInsert<'business_profiles'>) => {
      if (!user) throw new Error('No user');

      const { data: newProfile, error } = await supabase
        .from('business_profiles')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return newProfile as BusinessProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profiles'] });
    },
  });

  // Update business profile mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TablesUpdate<'business_profiles'>> }) => {
      const { data: updatedProfile, error } = await supabase
        .from('business_profiles')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedProfile as BusinessProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profiles'] });
    },
  });

  // Delete business profile mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profiles'] });
    },
  });

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

  const switchBusiness = (businessId: string) => {
    const selectedBusiness = businessProfiles?.find(b => b.id === businessId);
    if (selectedBusiness) {
      setProfile(selectedBusiness);
      setCurrentBusinessId(businessId);
      // Store in localStorage for persistence
      localStorage.setItem('currentBusinessId', businessId);
    }
  };

  useEffect(() => {
    // Check for stored business preference
    const storedBusinessId = localStorage.getItem('currentBusinessId');
    if (storedBusinessId && businessProfiles) {
      const storedBusiness = businessProfiles.find(b => b.id === storedBusinessId);
      if (storedBusiness) {
        setProfile(storedBusiness);
        setCurrentBusinessId(storedBusinessId);
        return;
      }
    }
    
    // Fallback to fetching primary profile
    fetchProfile();
  }, [user, businessProfiles]);

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
    currentProfile: profile, // Alias for better clarity
    businessProfiles,
    isLoading,
    error,
    hasCompletedQuestionnaire,
    refetch: fetchProfile,
    createBusinessProfile: createMutation.mutateAsync,
    updateBusinessProfile: (id: string, data: Partial<TablesUpdate<'business_profiles'>>) => 
      updateMutation.mutateAsync({ id, data }),
    deleteBusinessProfile: deleteMutation.mutateAsync,
    refreshBusinessProfiles: () => refetchProfiles(),
    switchBusiness,
  };
};