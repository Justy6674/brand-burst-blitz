import React from 'react';
import { AlertTriangle, Construction } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const SystemLockdownBanner = () => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-3 text-sm">
          <Construction className="h-5 w-5 text-amber-600 animate-pulse" />
          <span className="font-medium text-amber-800">
            JB-SaaS is currently in active development
          </span>
          <Badge variant="outline" className="border-amber-600 text-amber-700 bg-amber-50">
            Alpha Version
          </Badge>
          <span className="text-amber-700 hidden sm:inline">
            Many features are incomplete or unavailable
          </span>
        </div>
      </div>
    </div>
  );
};