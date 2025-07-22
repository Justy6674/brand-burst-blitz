import React, { useState } from 'react';
import { ContentTemplate, getAllTemplates } from '@/data/contentTemplates';
import { TemplateSelector } from './TemplateSelector';
import { ContentForm } from './ContentForm';
import { ContentPreview } from './ContentPreview';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedContent {
  title: string;
  content: string;
  htmlContent: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  wordCount: number;
  readingTime: number;
  tone: string;
  template: string;
}

interface ContentGeneratorProps {
  onContentGenerated?: (content: string, metadata: any) => void;
}

export const ContentGenerator: React.FC<ContentGeneratorProps> = ({
  onContentGenerated
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'template' | 'form' | 'preview'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTemplateSelect = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep('form');
  };

  const generateContent = async (variables: Record<string, string>, tone: string) => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    
    try {
      // REAL AI CONTENT GENERATION - No more simulation
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: buildPromptFromTemplate(selectedTemplate, variables),
          tone: tone,
          template: selectedTemplate.name,
          type: selectedTemplate.type,
          variables: variables
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate content');
      }

      if (!data || !data.content) {
        throw new Error('No content received from AI service');
      }

      // Process real AI response
      const mockContent = processAIResponse(data, selectedTemplate, variables, tone);
      
      setGeneratedContent(mockContent);
      setCurrentStep('preview');
      
      toast({
        title: "Content Generated Successfully",
        description: `Your ${selectedTemplate.name.toLowerCase()} has been created with real AI.`
      });

      // Notify parent component
      onContentGenerated?.(mockContent.content, {
        title: mockContent.title,
        template: selectedTemplate.name,
        tone: tone,
        wordCount: mockContent.wordCount,
        metaTitle: mockContent.metaTitle,
        metaDescription: mockContent.metaDescription,
        tags: mockContent.tags
      });

    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const buildPromptFromTemplate = (template: ContentTemplate, variables: Record<string, string>): string => {
    let prompt = template.description;
    
    // Replace template variables in the prompt
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    // Add template-specific instructions
    prompt += `\n\nPlease create ${template.name.toLowerCase()} content that:`;
    prompt += `\n- Follows the ${template.type} format`;
    prompt += `\n- Uses ${variables.tone || 'professional'} tone`;
    prompt += `\n- Is between ${template.estimatedLength} words`;
    
    if (template.type === 'blog-post') {
      prompt += `\n- Includes proper headings and structure`;
      prompt += `\n- Has engaging introduction and conclusion`;
      prompt += `\n- Provides valuable, actionable information`;
    } else if (template.type === 'social-media') {
      prompt += `\n- Is optimized for social media engagement`;
      prompt += `\n- Includes relevant hashtags if appropriate`;
      prompt += `\n- Has clear call-to-action`;
    }

    return prompt;
  };

  const processAIResponse = (aiData: any, template: ContentTemplate, variables: Record<string, string>, tone: string): GeneratedContent => {
    const content = aiData.content || '';
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    // Generate HTML version of content
    const htmlContent = convertToHTML(content);

    // Extract or generate meta information
    const title = aiData.title || extractTitleFromContent(content) || `${template.name} - ${variables.topic || 'Generated Content'}`;
    const metaDescription = aiData.metaDescription || content.substring(0, 160) + '...';
    const tags = aiData.tags || generateTagsFromContent(content, template);

    return {
      title,
      content,
      htmlContent,
      metaTitle: title,
      metaDescription,
      tags,
      wordCount,
      readingTime,
      tone,
      template: template.name
    };
  };

  const convertToHTML = (content: string): string => {
    // Convert markdown-style content to HTML
    return content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.*)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');
  };

  const extractTitleFromContent = (content: string): string | null => {
    // Try to extract title from first heading or first line
    const headingMatch = content.match(/^#\s+(.*?)$/m);
    if (headingMatch) return headingMatch[1];

    const firstLine = content.split('\n')[0];
    if (firstLine && firstLine.length < 100) return firstLine;

    return null;
  };

  const generateTagsFromContent = (content: string, template: ContentTemplate): string[] => {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);
    
    // Count word frequency
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      if (word.length > 3 && !commonWords.has(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    // Get most frequent words
    const sortedWords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    // Add template-specific tags
    const templateTags = [];
    if (template.type === 'blog-post') templateTags.push('blog', 'content');
    if (template.type === 'social-media') templateTags.push('social', 'marketing');

    return [...templateTags, ...sortedWords].slice(0, 8);
  };

  const handleRegenerate = () => {
    if (selectedTemplate) {
      setCurrentStep('form');
      setGeneratedContent(null);
    }
  };

  const handleEdit = (editedContent: string) => {
    if (generatedContent) {
      const updatedContent = {
        ...generatedContent,
        content: editedContent,
        wordCount: editedContent.split(' ').length,
        readingTime: Math.max(1, Math.ceil(editedContent.split(' ').length / 200))
      };
      setGeneratedContent(updatedContent);
    }
  };

  const handleSave = (content: GeneratedContent) => {
    toast({
      title: "Content Saved",
      description: "Your content has been saved successfully."
    });
    
    onContentGenerated?.(content.content, {
      title: content.title,
      template: content.template,
      tone: content.tone,
      wordCount: content.wordCount,
      metaTitle: content.metaTitle,
      metaDescription: content.metaDescription,
      tags: content.tags
    });
  };

  const goBack = () => {
    switch (currentStep) {
      case 'form':
        setCurrentStep('template');
        setSelectedTemplate(null);
        break;
      case 'preview':
        setCurrentStep('form');
        setGeneratedContent(null);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === 'template' ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}>
          1
        </div>
        <div className={`flex-1 h-px ${currentStep !== 'template' ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === 'form' ? 'bg-primary text-primary-foreground' : 
          currentStep === 'preview' ? 'bg-muted' : 'bg-muted'
        }`}>
          2
        </div>
        <div className={`flex-1 h-px ${currentStep === 'preview' ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === 'preview' ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}>
          3
        </div>
      </div>

      {/* Back Button */}
      {currentStep !== 'template' && (
        <Button variant="ghost" onClick={goBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      {/* Content based on current step */}
      {currentStep === 'template' && (
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
        />
      )}

      {currentStep === 'form' && selectedTemplate && (
        <ContentForm
          template={selectedTemplate}
          onGenerate={generateContent}
          isGenerating={isGenerating}
        />
      )}

      {currentStep === 'preview' && generatedContent && (
        <ContentPreview
          content={generatedContent}
          onEdit={handleEdit}
          onSave={handleSave}
          onRegenerate={handleRegenerate}
        />
      )}

      {/* Loading State */}
      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <Wand2 className="h-16 w-16 text-primary mx-auto" />
              </div>
              <h3 className="text-xl font-semibold">Generating Your Content</h3>
              <p className="text-muted-foreground">
                Our AI is crafting your {selectedTemplate?.name.toLowerCase()} with a {selectedTemplate && 'tone'} approach...
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};