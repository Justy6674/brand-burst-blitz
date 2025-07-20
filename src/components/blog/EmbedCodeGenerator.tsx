import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmbedCodeGeneratorProps {
  businessId: string;
  blogConfig?: {
    width?: string;
    height?: string;
    theme?: 'light' | 'dark' | 'auto';
    showHeader?: boolean;
    showFooter?: boolean;
  };
}

export const EmbedCodeGenerator: React.FC<EmbedCodeGeneratorProps> = ({ 
  businessId, 
  blogConfig = {} 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Embed Code Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Generate embed code for business: {businessId}
        </p>
        <Button className="mt-4">
          Generate Code
        </Button>
      </CardContent>
    </Card>
  );
};