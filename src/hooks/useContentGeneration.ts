import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from './useErrorHandler';

interface GenerateContentRequest {
  prompt: string;
  tone?: string;
  platform?: string;
  content_type?: string;
  business_context?: any;
  target_audience?: string;
  keywords?: string[];
}

interface GeneratedContent {
  title?: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  seo_data?: {
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
  };
  platform_optimizations?: {
    [key: string]: {
      content: string;
      hashtags?: string[];
      character_count?: number;
    };
  };
}

export const useContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  const generateContent = useCallback(async (request: GenerateContentRequest): Promise<GeneratedContent | null> => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate content');
      }

      toast({
        title: "Content Generated",
        description: "Your content has been successfully generated!",
      });

      return data as GeneratedContent;
    } catch (error) {
      await handleError(error, {
        fallbackMessage: 'Failed to generate content. Please try again.'
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [handleError, toast]);

  const enhanceContent = useCallback(async (content: string, enhancements: {
    improve_readability?: boolean;
    add_seo_keywords?: string[];
    adjust_tone?: string;
    target_platform?: string;
  }): Promise<string | null> => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: `Enhance this content: ${content}`,
          enhancement_options: enhancements,
          action: 'enhance',
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to enhance content');
      }

      toast({
        title: "Content Enhanced",
        description: "Your content has been successfully enhanced!",
      });

      return data.content;
    } catch (error) {
      await handleError(error, {
        fallbackMessage: 'Failed to enhance content. Please try again.'
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [handleError, toast]);

  const optimizeForSEO = useCallback(async (content: string, targetKeywords: string[]): Promise<{
    optimized_content: string;
    seo_score: number;
    suggestions: string[];
  } | null> => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          content,
          target_keywords: targetKeywords,
          action: 'seo_optimize',
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to optimize content for SEO');
      }

      toast({
        title: "SEO Optimization Complete",
        description: `Content optimized with SEO score: ${data.seo_score}/100`,
      });

      return data;
    } catch (error) {
      await handleError(error, {
        fallbackMessage: 'Failed to optimize content for SEO. Please try again.'
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [handleError, toast]);

  const generateVariations = useCallback(async (baseContent: string, platforms: string[]): Promise<{
    [platform: string]: GeneratedContent;
  } | null> => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          base_content: baseContent,
          target_platforms: platforms,
          action: 'platform_variations',
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate platform variations');
      }

      toast({
        title: "Platform Variations Generated",
        description: `Created variations for ${platforms.length} platforms`,
      });

      return data;
    } catch (error) {
      await handleError(error, {
        fallbackMessage: 'Failed to generate platform variations. Please try again.'
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [handleError, toast]);

  return {
    generateContent,
    enhanceContent,
    optimizeForSEO,
    generateVariations,
    isGenerating,
  };
};