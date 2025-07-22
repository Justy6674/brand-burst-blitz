import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  industry: 'general' | 'tech' | 'health' | 'finance' | 'legal' | 'fitness' | 'beauty';
  website_url: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  is_primary: boolean;
  default_ai_tone: 'professional' | 'friendly' | 'casual' | 'authoritative' | 'empathetic' | 'exciting';
  brand_colors: any;
  compliance_settings: any;
  created_at: string;
  updated_at: string;
}

interface UseBusinessProfilesReturn {
  businessProfiles: BusinessProfile[];
  activeProfile: BusinessProfile | null;
  isLoading: boolean;
  error: string | null;
  createBusinessProfile: (data: Partial<BusinessProfile>) => Promise<boolean>;
  updateBusinessProfile: (id: string, data: Partial<BusinessProfile>) => Promise<boolean>;
  deleteBusinessProfile: (id: string) => Promise<boolean>;
  setActiveProfile: (profile: BusinessProfile) => void;
  refreshProfiles: () => Promise<void>;
}

export const useBusinessProfiles = (): UseBusinessProfilesReturn => {
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfiles = useCallback(async () => {
    if (!user) {
      setBusinessProfiles([]);
      setActiveProfileState(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setBusinessProfiles(data || []);
      
      // Set active profile to primary or first profile
      const primaryProfile = data?.find(p => p.is_primary);
      const profileToSet = primaryProfile || data?.[0] || null;
      setActiveProfileState(profileToSet);

    } catch (err: any) {
      console.error('Error fetching business profiles:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load business profiles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const createBusinessProfile = useCallback(async (data: Partial<BusinessProfile>): Promise<boolean> => {
    if (!user) return false;

    try {
      // If this is the first profile, make it primary
      const isFirstProfile = businessProfiles.length === 0;

      const { data: newProfile, error } = await supabase
        .from('business_profiles')
        .insert({
          business_name: data.business_name || 'New Business',
          industry: data.industry || 'general',
          website_url: data.website_url || null,
          logo_url: data.logo_url || null,
          favicon_url: data.favicon_url || null,
          is_primary: isFirstProfile || data.is_primary || false,
          default_ai_tone: data.default_ai_tone || 'professional',
          brand_colors: data.brand_colors || null,
          compliance_settings: data.compliance_settings || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // If this is set as primary, update other profiles
      if (newProfile.is_primary && businessProfiles.length > 0) {
        await supabase
          .from('business_profiles')
          .update({ is_primary: false })
          .eq('user_id', user.id)
          .neq('id', newProfile.id);
      }

      toast({
        title: 'Success',
        description: 'Business profile created successfully',
      });

      await refreshProfiles();
      return true;

    } catch (err: any) {
      console.error('Error creating business profile:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to create business profile',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, businessProfiles.length, toast]);

  const updateBusinessProfile = useCallback(async (id: string, data: Partial<BusinessProfile>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('business_profiles')
        .update({
          business_name: data.business_name,
          industry: data.industry,
          website_url: data.website_url,
          logo_url: data.logo_url,
          favicon_url: data.favicon_url,
          is_primary: data.is_primary,
          default_ai_tone: data.default_ai_tone,
          brand_colors: data.brand_colors,
          compliance_settings: data.compliance_settings,
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // If this is set as primary, update other profiles
      if (data.is_primary) {
        await supabase
          .from('business_profiles')
          .update({ is_primary: false })
          .eq('user_id', user.id)
          .neq('id', id);
      }

      toast({
        title: 'Success',
        description: 'Business profile updated successfully',
      });

      await refreshProfiles();
      return true;

    } catch (err: any) {
      console.error('Error updating business profile:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update business profile',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  const deleteBusinessProfile = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('business_profiles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Business profile deleted successfully',
      });

      await refreshProfiles();
      return true;

    } catch (err: any) {
      console.error('Error deleting business profile:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete business profile',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  const setActiveProfile = useCallback((profile: BusinessProfile) => {
    setActiveProfileState(profile);
  }, []);

  const refreshProfiles = useCallback(async () => {
    await fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    businessProfiles,
    activeProfile,
    isLoading,
    error,
    createBusinessProfile,
    updateBusinessProfile,
    deleteBusinessProfile,
    setActiveProfile,
    refreshProfiles,
  };
};