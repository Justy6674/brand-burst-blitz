import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlatformInfo } from '@/lib/platformCapabilities';

interface EmbedCodeGeneratorProps {
  platform: PlatformInfo;
  businessId: string;
}

export const EmbedCodeGenerator: React.FC<EmbedCodeGeneratorProps> = ({
  platform,
  businessId
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Embed Code for {platform.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Embed code will be generated here for {platform.name}</p>
          <Button>Generate Embed Code</Button>
        </div>
      </CardContent>
    </Card>
  );
};