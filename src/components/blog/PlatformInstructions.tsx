import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformInfo } from '@/lib/platformCapabilities';

interface PlatformInstructionsProps {
  platform: PlatformInfo;
  businessId: string;
  onComplete?: () => void;
}

export const PlatformInstructions: React.FC<PlatformInstructionsProps> = ({
  platform,
  businessId,
  onComplete
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup Instructions for {platform.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Step-by-step instructions for {platform.name} integration will appear here.</p>
      </CardContent>
    </Card>
  );
};