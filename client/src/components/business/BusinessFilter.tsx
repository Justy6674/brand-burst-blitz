import React from 'react';
import { useBusinessProfileContext } from '@/contexts/BusinessProfileContext';

interface BusinessFilterProps {
  children: (activeProfileId: string | null) => React.ReactNode;
}

export const BusinessFilter: React.FC<BusinessFilterProps> = ({ children }) => {
  const { activeProfile } = useBusinessProfileContext();
  
  return (
    <>
      {children(activeProfile?.id || null)}
    </>
  );
};

// Higher-order component for business-specific data filtering
export function withBusinessFilter<T extends { business_profile_id?: string | null }>(
  data: T[] | undefined,
  activeProfileId: string | null
): T[] {
  if (!data || !activeProfileId) return [];
  
  return data.filter(item => 
    item.business_profile_id === activeProfileId || 
    item.business_profile_id === null // Include global/shared items
  );
}

// Hook for filtering data by active business profile
export const useBusinessFilter = () => {
  const { activeProfile } = useBusinessProfileContext();
  
  const filterByBusiness = <T extends { business_profile_id?: string | null }>(
    data: T[] | undefined
  ): T[] => {
    return withBusinessFilter(data, activeProfile?.id || null);
  };

  return {
    activeProfileId: activeProfile?.id || null,
    filterByBusiness,
  };
};