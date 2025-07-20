import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PlatformInstructionsProps {
  platform: 'wordpress' | 'shopify' | 'squarespace' | 'wix' | 'custom';
  integrationMethod: 'embed' | 'api' | 'manual';
}

export const PlatformInstructions: React.FC<PlatformInstructionsProps> = ({ 
  platform, 
  integrationMethod 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructions for {platform}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Integration method: {integrationMethod}
        </p>
      </CardContent>
    </Card>
  );
};