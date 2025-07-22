import React from 'react';
import { AIContentGenerator } from '@/components/content/AIContentGenerator';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const CreateContent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleContentGenerated = (content: string, postId: string) => {
    toast({
      title: 'Content created successfully',
      description: 'Your content has been saved as a draft.',
    });
    
    // Navigate to dashboard or post editor
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Content</h1>
        <p className="text-muted-foreground">
          Generate engaging content using AI-powered tools
        </p>
      </div>
      
      <AIContentGenerator onContentGenerated={handleContentGenerated} />
    </div>
  );
};