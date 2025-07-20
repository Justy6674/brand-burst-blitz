import React, { useState } from 'react';
import { ContentTemplate, getAllTemplates } from '@/data/contentTemplates';
import { TemplateSelector } from './TemplateSelector';
import { ContentForm } from './ContentForm';
import { ContentPreview } from './ContentPreview';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wand2 } from 'lucide-react';

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
      // Simulate AI content generation - in real implementation, this would call the AI service
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate mock content based on template and variables
      const mockContent = generateMockContent(selectedTemplate, variables, tone);
      
      setGeneratedContent(mockContent);
      setCurrentStep('preview');
      
      toast({
        title: "Content Generated Successfully",
        description: `Your ${selectedTemplate.name.toLowerCase()} has been created.`
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
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockContent = (
    template: ContentTemplate, 
    variables: Record<string, string>, 
    tone: string
  ): GeneratedContent => {
    // This is a simplified mock generator - in real implementation, this would call AI APIs
    let content = template.prompts.content;
    let title = template.prompts.title || `${variables.business_name || 'Business'} Content`;

    // Replace variables in content and title
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      content = content.replace(new RegExp(placeholder, 'g'), value);
      title = title.replace(new RegExp(placeholder, 'g'), value);
    });

    // Replace tone placeholder
    content = content.replace(/{tone}/g, tone);

    // Generate mock final content based on template type
    let finalContent = '';
    let metaTitle = '';
    let metaDescription = '';
    let tags: string[] = [];

    switch (template.id) {
      case 'aussie_tradie_showcase':
        finalContent = `Just completed an amazing ${variables.job_type || 'project'} in ${variables.location || 'the local area'}! 🔧✨

${variables.project_details || 'Our team delivered exceptional results'} and the client feedback speaks for itself:

"${variables.customer_feedback || 'Outstanding service and quality workmanship'}" - Happy Customer

Looking for quality ${variables.job_type || 'services'} in ${variables.location?.split(',')[0] || 'your area'}? Get in touch with ${variables.business_name || 'our team'} today!

#QualityWork #LocalTradie #${variables.location?.split(',')[0]?.replace(/\s+/g, '') || 'Local'}Business #ProfessionalService #AustralianMade`;
        
        metaTitle = `${variables.job_type || 'Professional Services'} in ${variables.location || 'Your Area'} | ${variables.business_name || 'Quality Trades'}`;
        metaDescription = `Professional ${variables.job_type || 'services'} in ${variables.location || 'your area'}. Quality workmanship and satisfied customers. Contact ${variables.business_name || 'us'} today!`;
        tags = ['tradie', 'local business', variables.location?.split(',')[0]?.toLowerCase() || 'local', variables.job_type?.toLowerCase() || 'services'];
        break;

      case 'local_business_storytelling':
        finalContent = `There's something special about ${variables.story_topic || 'our community connection'} here at ${variables.business_name || 'our business'} in ${variables.location || 'the local area'}.

${variables.personal_story || 'Our journey started with a simple vision'} - to create a space where ${variables.business_focus || 'quality service meets community spirit'}.

Through our ${variables.community_impact || 'community initiatives'}, we've seen firsthand how local businesses can make a real difference.

That's what ${variables.business_name || 'we'} are all about - more than just business, we're part of the ${variables.location?.split(',')[0] || 'local'} family.

#${variables.location?.split(',')[0]?.replace(/\s+/g, '') || 'Local'}Business #CommunityFirst #LocallyOwned #SupportLocal #${variables.business_focus?.replace(/\s+/g, '') || 'Quality'}Service`;

        metaTitle = `${variables.business_name || 'Local Business'} - ${variables.story_topic || 'Our Story'} | ${variables.location || 'Community'}`;
        metaDescription = `Discover the story behind ${variables.business_name || 'our local business'} in ${variables.location || 'the community'}. ${variables.business_focus || 'Quality service'} with a personal touch.`;
        tags = ['local business', 'community', variables.location?.split(',')[0]?.toLowerCase() || 'local', 'story'];
        break;

      case 'australian_seasonal_strategy':
        finalContent = `# ${variables.business_type || 'Business'} Strategy for ${variables.season || 'Seasonal'} Success in Australia

As ${variables.season || 'the season'} approaches across Australia, ${variables.business_type || 'businesses'} face unique opportunities and challenges that can significantly impact their success.

## Understanding the ${variables.season || 'Seasonal'} Landscape

${variables.seasonal_opportunities || 'This season brings specific opportunities'} that savvy business owners can capitalize on. However, it's equally important to prepare for ${variables.seasonal_challenges || 'the challenges that come with seasonal changes'}.

## Strategic Opportunities

The key is understanding your ${variables.target_market || 'target market'} and how their needs shift during this time. Australian consumers have distinct seasonal patterns that differ significantly from other markets.

## Practical Implementation

Consider these proven strategies:
- Adjust your marketing calendar to align with local events
- Modify your product/service offerings for seasonal demand
- Leverage the unique cultural aspects of Australian ${variables.season || 'seasons'}

## Regional Considerations

Remember that Australia's vast geography means ${variables.season || 'seasonal'} impacts vary significantly between regions. What works in Melbourne might need adjustment for Perth or Darwin.

The businesses that thrive are those that plan ahead and understand the nuances of the Australian market during ${variables.season || 'each season'}.`;

        metaTitle = `${variables.season || 'Seasonal'} ${variables.business_type || 'Business'} Strategy Guide | Australian Market Insights`;
        metaDescription = `Strategic guide for ${variables.business_type || 'businesses'} to maximize ${variables.season || 'seasonal'} opportunities in Australia. Expert insights and practical strategies.`;
        tags = ['business strategy', variables.season?.toLowerCase() || 'seasonal', 'australia', variables.business_type?.toLowerCase() || 'business'];
        break;

      case 'australian_industry_expertise':
        finalContent = `# ${variables.industry_topic || 'Industry Insights'}: Strategic Implications for Australian Businesses

The Australian market is experiencing significant shifts in ${variables.industry_topic || 'key industry areas'}, with ${variables.current_trends || 'emerging trends'} reshaping how businesses operate and compete.

## Current Market Dynamics

Recent developments, including ${variables.regulatory_changes || 'regulatory updates'}, are creating both challenges and opportunities for forward-thinking organizations.

## Business Implications

${variables.business_implications || 'These changes have far-reaching implications for how businesses operate'}, particularly in areas of:

- Strategic planning and market positioning
- Operational efficiency and compliance
- Customer engagement and service delivery
- Risk management and future-proofing

## Expert Analysis

Drawing from ${variables.expert_perspective || 'extensive industry experience'}, it's clear that organizations must adapt quickly to remain competitive in this evolving landscape.

## Looking Forward

The businesses that will thrive are those that proactively embrace these changes and view them as opportunities for innovation and growth rather than obstacles to overcome.

Understanding these dynamics is crucial for any organization looking to maintain market leadership in Australia's increasingly competitive environment.`;

        metaTitle = `${variables.industry_topic || 'Industry Analysis'} in Australia | Expert Business Insights`;
        metaDescription = `Expert analysis of ${variables.industry_topic || 'industry trends'} and strategic implications for Australian businesses. Professional insights and actionable recommendations.`;
        tags = ['industry analysis', 'business strategy', 'australia', variables.industry_topic?.toLowerCase().replace(/\s+/g, '-') || 'insights'];
        break;

      default:
        finalContent = `Generated content for ${template.name} with ${tone} tone.

Based on your inputs:
${Object.entries(variables).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

This content has been customized for your specific needs and audience.`;
        metaTitle = title;
        metaDescription = `${template.description} - Generated content for ${variables.business_name || 'your business'}`;
        tags = template.industry;
    }

    const wordCount = finalContent.split(' ').length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return {
      title: title.replace(/{[^}]+}/g, '').trim(),
      content: finalContent,
      htmlContent: finalContent.replace(/\n/g, '<br>'),
      metaTitle,
      metaDescription,
      tags,
      wordCount,
      readingTime,
      tone,
      template: template.name
    };
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