import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAIGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateContent = async ({
    prompt,
    templateId,
    tone = 'professional',
    type = 'blog',
    businessContext
  }: {
    prompt: string;
    templateId?: string;
    tone?: string;
    type?: 'blog' | 'social' | 'ad';
    businessContext?: string;
  }) => {
    setIsGenerating(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt,
          templateId,
          tone,
          type,
          businessContext
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Content generated successfully',
        description: 'Your AI-generated content is ready.',
      });

      return {
        content: data.content,
        postId: data.postId
      };

    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Failed to generate content',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateContent,
    isGenerating
  };
};