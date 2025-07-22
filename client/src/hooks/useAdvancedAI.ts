import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AIModel {
  id: "gpt4" | "o3" | "gemini";
  name: string;
  description: string;
  strengths: string[];
  pricing: string;
}

export interface ContentGenerationRequest {
  topic: string;
  contentType: "blog" | "article" | "guide" | "listicle";
  tone: "professional" | "casual" | "authoritative" | "friendly";
  targetAudience?: string;
  targetLength: "short" | "medium" | "long";
  keywords: string[];
  aiModel: "gpt4" | "o3" | "gemini";
  businessId?: string;
  industryContext?: string;
}

export interface GeneratedContent {
  title: string;
  content: string;
  outline: {
    sections: Array<{
      heading: string;
      keyPoints: string[];
      wordCount: number;
    }>;
  };
  seoData: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    readabilityScore: number;
  };
  estimatedReadTime: number;
  wordCount: number;
}

export const useAdvancedAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [progress, setProgress] = useState(0);

  const availableModels: AIModel[] = [
    {
      id: "gpt4",
      name: "GPT-4",
      description: "Best for balanced, high-quality content",
      strengths: ["Natural writing style", "Comprehensive coverage", "Reliable quality"],
      pricing: "Medium cost"
    },
    {
      id: "o3",
      name: "O3",
      description: "Best for creative and innovative content",
      strengths: ["Creative angles", "Unique perspectives", "Engaging narratives"],
      pricing: "Higher cost"
    },
    {
      id: "gemini",
      name: "Gemini",
      description: "Best for technical and data-driven content",
      strengths: ["Technical accuracy", "Data analysis", "Structured content"],
      pricing: "Lower cost"
    }
  ];

  const generateContent = async (request: ContentGenerationRequest): Promise<GeneratedContent | null> => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Step 1: Analyze topic and create outline
      setCurrentStep("Analyzing topic and creating outline...");
      setProgress(20);

      const { data: outlineData, error: outlineError } = await supabase.functions.invoke('generate-content-outline', {
        body: {
          topic: request.topic,
          contentType: request.contentType,
          targetAudience: request.targetAudience,
          keywords: request.keywords,
          aiModel: request.aiModel
        }
      });

      if (outlineError) throw outlineError;

      // Step 2: Generate main content
      setCurrentStep("Generating main content...");
      setProgress(50);

      const { data: contentData, error: contentError } = await supabase.functions.invoke('generate-complete-content', {
        body: {
          ...request,
          outline: outlineData.outline
        }
      });

      if (contentError) throw contentError;

      // Step 3: SEO optimization
      setCurrentStep("Optimizing for SEO...");
      setProgress(75);

      const { data: seoData, error: seoError } = await supabase.functions.invoke('analyze-seo-content', {
        body: {
          content: contentData.content,
          title: contentData.title,
          keywords: request.keywords
        }
      });

      if (seoError) throw seoError;

      // Step 4: Final processing
      setCurrentStep("Finalizing content...");
      setProgress(90);

      const result: GeneratedContent = {
        title: contentData.title,
        content: contentData.content,
        outline: outlineData.outline,
        seoData: seoData,
        estimatedReadTime: Math.ceil(contentData.wordCount / 200),
        wordCount: contentData.wordCount
      };

      setProgress(100);
      setCurrentStep("Content generated successfully!");
      
      toast.success("Content generated successfully!");
      return result;

    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
      return null;
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setCurrentStep("");
        setProgress(0);
      }, 2000);
    }
  };

  const generateOutline = async (topic: string, contentType: string, keywords: string[]): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-outline', {
        body: { topic, contentType, keywords }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating outline:", error);
      toast.error("Failed to generate outline");
      return null;
    }
  };

  const improveSEO = async (content: string, targetKeywords: string[]): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-seo-content', {
        body: { content, keywords: targetKeywords }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error analyzing SEO:", error);
      toast.error("Failed to analyze SEO");
      return null;
    }
  };

  const factCheck = async (content: string, topic: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('fact-check-content', {
        body: { content, topic }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fact-checking:", error);
      toast.error("Failed to fact-check content");
      return null;
    }
  };

  return {
    availableModels,
    isGenerating,
    currentStep,
    progress,
    generateContent,
    generateOutline,
    improveSEO,
    factCheck
  };
};