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
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="text-yellow-600">⚠️</div>
          <div>
            <h3 className="font-medium text-yellow-800">AI Configuration Required</h3>
            <p className="text-yellow-700 text-sm mt-1">
              To use the AI content generator, please configure your OpenAI or Gemini API keys in the edge function settings.
            </p>
          </div>
        </div>
      </div>
      
      <AIContentGenerator onContentGenerated={handleContentGenerated} />
    </div>
  );
};