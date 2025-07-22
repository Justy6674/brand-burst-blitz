import React from 'react';
import { PublishingPipeline } from '@/components/publishing/PublishingPipeline';

export default function PublishingPipelinePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Publishing Pipeline</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage your social media publishing queue
        </p>
      </div>
      <PublishingPipeline />
    </div>
  );
}