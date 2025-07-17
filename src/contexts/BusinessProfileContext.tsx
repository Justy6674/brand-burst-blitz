import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useToast } from '@/hooks/use-toast';

interface BusinessProfile {
  id: string;
  business_name: string;
  user_id: string | null;
  industry: string | null;
  website_url: string | null;
  logo_url: string | null;
  is_primary: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  default_ai_tone: string | null;
  brand_colors: any | null;
  compliance_settings: any | null;
}

interface BusinessProfileContextType {
  activeProfile: BusinessProfile | null;
  allProfiles: BusinessProfile[];
  isLoading: boolean;
  switchProfile: (profileId: string) => void;
  createProfile: (data: Partial<BusinessProfile>) => Promise<void>;
  updateProfile: (id: string, data: Partial<BusinessProfile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  refreshProfiles: () => void;
}

const BusinessProfileContext = createContext<BusinessProfileContextType | undefined>(undefined);

export const useBusinessProfileContext = () => {
  const context = useContext(BusinessProfileContext);
  if (context === undefined) {
    throw new Error('useBusinessProfileContext must be used within a BusinessProfileProvider');
  }
  return context;
};

interface BusinessProfileProviderProps {
  children: ReactNode;
}

export const BusinessProfileProvider: React.FC<BusinessProfileProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const { 
    businessProfiles, 
    isLoading, 
    createBusinessProfile, 
    updateBusinessProfile, 
    deleteBusinessProfile,
    refreshBusinessProfiles 
  } = useBusinessProfile();
  
  const [activeProfile, setActiveProfile] = useState<BusinessProfile | null>(null);

  // Set initial active profile when profiles load
  useEffect(() => {
    if (businessProfiles && businessProfiles.length > 0 && !activeProfile) {
      // First try to find primary profile, otherwise use first profile
      const primaryProfile = businessProfiles.find(profile => profile.is_primary);
      const profileToSet = primaryProfile || businessProfiles[0];
      setActiveProfile(profileToSet);
      
      // Store in localStorage for persistence
      localStorage.setItem('activeBusinessProfileId', profileToSet.id);
    }
  }, [businessProfiles, activeProfile]);

  // Restore active profile from localStorage on mount
  useEffect(() => {
    const savedProfileId = localStorage.getItem('activeBusinessProfileId');
    if (savedProfileId && businessProfiles) {
      const savedProfile = businessProfiles.find(profile => profile.id === savedProfileId);
      if (savedProfile) {
        setActiveProfile(savedProfile);
      }
    }
  }, [businessProfiles]);

  const switchProfile = (profileId: string) => {
    const profile = businessProfiles?.find(p => p.id === profileId);
    if (profile) {
      setActiveProfile(profile);
      localStorage.setItem('activeBusinessProfileId', profileId);
      toast({
        title: "Business Profile Switched",
        description: `Now managing ${profile.business_name}`,
      });
    }
  };

  const createProfile = async (data: any) => {
    try {
      const newProfile = await createBusinessProfile(data as any);
      // If this is the first profile, make it active
      if (businessProfiles && businessProfiles.length === 0) {
        setActiveProfile(newProfile);
        localStorage.setItem('activeBusinessProfileId', newProfile.id);
      }
      toast({
        title: "Business Profile Created",
        description: `${data.business_name} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create business profile.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (id: string, data: any) => {
    try {
      const updatedProfile = await updateBusinessProfile(id, data as any);
      // Update active profile if it's the one being updated
      if (activeProfile?.id === id) {
        setActiveProfile(updatedProfile);
      }
      toast({
        title: "Business Profile Updated",
        description: `${data.business_name || 'Profile'} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business profile.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      await deleteBusinessProfile(id);
      
      // If the deleted profile was active, switch to another one
      if (activeProfile?.id === id) {
        const remainingProfiles = businessProfiles?.filter(p => p.id !== id) || [];
        if (remainingProfiles.length > 0) {
          const newActiveProfile = remainingProfiles[0];
          setActiveProfile(newActiveProfile);
          localStorage.setItem('activeBusinessProfileId', newActiveProfile.id);
        } else {
          setActiveProfile(null);
          localStorage.removeItem('activeBusinessProfileId');
        }
      }
      
      toast({
        title: "Business Profile Deleted",
        description: "The business profile has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete business profile.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshProfiles = () => {
    refreshBusinessProfiles();
  };

  const contextValue: BusinessProfileContextType = {
    activeProfile,
    allProfiles: businessProfiles || [],
    isLoading,
    switchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    refreshProfiles,
  };

  return (
    <BusinessProfileContext.Provider value={contextValue}>
      {children}
    </BusinessProfileContext.Provider>
  );
};