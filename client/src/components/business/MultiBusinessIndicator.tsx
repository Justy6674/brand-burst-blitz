import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2, Users } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';

export const MultiBusinessIndicator = () => {
  const { businessProfiles, isLoading } = useBusinessProfile();

  if (isLoading || !businessProfiles || businessProfiles.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
      <div className="flex items-center gap-1.5">
        <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <Users className="h-3 w-3 text-purple-600 dark:text-purple-400" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Multi-Business Mode
        </span>
        <Badge 
          variant="secondary" 
          className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-800 dark:text-blue-200 border-0 text-xs px-2 py-0.5 w-fit"
        >
          {businessProfiles.length} businesses
        </Badge>
      </div>
    </div>
  );
};