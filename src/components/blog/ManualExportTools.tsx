import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ManualExportToolsProps {
  blogData: {
    posts: Array<{
      id: string;
      title: string;
      content: string;
      excerpt?: string;
      published_at?: string;
      tags?: string[];
    }>;
    customization?: any;
  };
}

export const ManualExportTools: React.FC<ManualExportToolsProps> = ({
  blogData
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Export Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Export {blogData.posts.length} blog posts
        </p>
        <Button className="mt-4">
          Export Data
        </Button>
      </CardContent>
    </Card>
  );
};