import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlatformInfo } from '@/lib/platformCapabilities';

interface ManualExportToolsProps {
  platform: PlatformInfo;
  businessId: string;
}

export const ManualExportTools: React.FC<ManualExportToolsProps> = ({
  platform,
  businessId
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Export Tools for {platform.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button>Copy HTML Content</Button>
          <Button>Download Images</Button>
          <Button>Export Metadata</Button>
        </div>
      </CardContent>
    </Card>
  );
};