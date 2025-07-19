import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRetry } from '@/hooks/useRetry';

interface GenerateContentParams {
  prompt: string;
  templateId?: string;
  tone: string;
  type: 'blog' | 'social' | 'ad';
  businessContext?: string;
  businessProfileId?: string;
  targetAudience?: string;
  keywords?: string[];
}

interface GeneratedContent {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  seo_data: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };
  postId: string;
}

export const useAIGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { retry } = useRetry({ maxAttempts: 3, delay: 1000 });

  const generateContent = useCallback(async (params: GenerateContentParams): Promise<GeneratedContent> => {
    return retry(async () => {
      setIsGenerating(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-content', {
          body: {
            prompt: params.prompt,
            templateId: params.templateId,
            tone: params.tone,
            type: params.type,
            businessContext: params.businessContext,
            businessProfileId: params.businessProfileId,
            target_audience: params.targetAudience,
            keywords: params.keywords || [],
          },
        });

        if (error) {
          throw new Error(error.message || 'Failed to generate content');
        }

        if (!data) {
          throw new Error('No content was generated');
        }

        toast({
          title: "Content Generated!",
          description: "Your content has been successfully created and saved as a draft.",
        });

        return data as GeneratedContent;
      } catch (error) {
        // Log error for debugging
        console.error('Content generation error:', error);
        
        // Provide helpful error messages
        if (error.message?.includes('OpenAI API')) {
          throw new Error('AI service is temporarily unavailable. Please try again.');
        } else if (error.message?.includes('Unauthorized')) {
          throw new Error('Please sign in to generate content.');
        } else if (error.message?.includes('quota')) {
          throw new Error('Daily content generation limit reached. Please try again tomorrow.');
        } else {
          throw new Error(error.message || 'Failed to generate content. Please try again.');
        }
      }
    }, 'Content Generation').finally(() => {
      setIsGenerating(false);
    });
  }, [retry, toast]);

  const enhanceContent = useCallback(async (content: string, options: {
    improveReadability?: boolean;
    addSeoKeywords?: string[];
    adjustTone?: string;
    targetPlatform?: string;
  } = {}) => {
    return retry(async () => {
      setIsGenerating(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-content', {
          body: {
            action: 'enhance',
            content,
            enhancement_options: {
              improve_readability: options.improveReadability,
              add_seo_keywords: options.addSeoKeywords,
              adjust_tone: options.adjustTone,
              target_platform: options.targetPlatform,
            },
          },
        });

        if (error) {
          throw new Error(error.message || 'Failed to enhance content');
        }

        toast({
          title: "Content Enhanced!",
          description: "Your content has been successfully improved.",
        });

        return data.content;
      } catch (error) {
        console.error('Content enhancement error:', error);
        throw new Error(error.message || 'Failed to enhance content. Please try again.');
      }
    }, 'Content Enhancement').finally(() => {
      setIsGenerating(false);
    });
  }, [retry, toast]);

  const optimizeForSEO = useCallback(async (content: string, targetKeywords: string[]) => {
    return retry(async () => {
      setIsGenerating(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-content', {
          body: {
            action: 'seo_optimize',
            content,
            target_keywords: targetKeywords,
          },
        });

        if (error) {
          throw new Error(error.message || 'Failed to optimize content for SEO');
        }

        toast({
          title: "SEO Optimization Complete!",
          description: `Content optimized with SEO score: ${data.seo_score}/100`,
        });

        return data;
      } catch (error) {
        console.error('SEO optimization error:', error);
        throw new Error(error.message || 'Failed to optimize content for SEO. Please try again.');
      }
    }, 'SEO Optimization').finally(() => {
      setIsGenerating(false);
    });
  }, [retry, toast]);

  const generatePlatformVariations = useCallback(async (baseContent: string, platforms: string[]) => {
    return retry(async () => {
      setIsGenerating(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-content', {
          body: {
            action: 'platform_variations',
            base_content: baseContent,
            target_platforms: platforms,
          },
        });

        if (error) {
          throw new Error(error.message || 'Failed to generate platform variations');
        }

        toast({
          title: "Platform Variations Generated!",
          description: `Created optimized content for ${platforms.length} platforms`,
        });

        return data;
      } catch (error) {
        console.error('Platform variations error:', error);
        throw new Error(error.message || 'Failed to generate platform variations. Please try again.');
      }
    }, 'Platform Variations').finally(() => {
      setIsGenerating(false);
    });
  }, [retry, toast]);

  return {
    generateContent,
    enhanceContent,
    optimizeForSEO,
    generatePlatformVariations,
    isGenerating,
  };
};