import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ContentTemplate } from '@/data/contentTemplates';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { AlertCircle, Info, Wand2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContentFormProps {
  template: ContentTemplate;
  onGenerate: (variables: Record<string, string>, tone: string) => void;
  isGenerating?: boolean;
}

interface FormData {
  variables: Record<string, string>;
  tone: string;
}

export const ContentForm: React.FC<ContentFormProps> = ({
  template,
  onGenerate,
  isGenerating = false
}) => {
  const { currentProfile } = useBusinessProfile();
  const [formData, setFormData] = useState<FormData>({
    variables: {},
    tone: template.tone_options[0] || 'professional'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with business data if available
  useEffect(() => {
    const initialVariables: Record<string, string> = {};
    
    template.variables.forEach(variable => {
      // Pre-fill with business profile data where possible
      switch (variable) {
        case 'business_name':
          initialVariables[variable] = currentProfile?.business_name || '';
          break;
        case 'location':
          // Could be extracted from business profile in the future
          initialVariables[variable] = '';
          break;
        default:
          initialVariables[variable] = '';
      }
    });

    setFormData(prev => ({
      ...prev,
      variables: initialVariables
    }));
  }, [template, currentProfile]);

  const updateVariable = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      variables: { ...prev.variables, [key]: value }
    }));
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const updateTone = (tone: string) => {
    setFormData(prev => ({ ...prev, tone }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    template.variables.forEach(variable => {
      const value = formData.variables[variable]?.trim();
      if (!value) {
        newErrors[variable] = `${getVariableLabel(variable)} is required`;
        isValid = false;
      } else if (value.length < 3) {
        newErrors[variable] = `${getVariableLabel(variable)} must be at least 3 characters`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleGenerate = () => {
    if (validateForm()) {
      onGenerate(formData.variables, formData.tone);
    }
  };

  const getVariableLabel = (variable: string): string => {
    const labels: Record<string, string> = {
      business_name: 'Business Name',
      location: 'Location',
      job_type: 'Job Type',
      project_details: 'Project Details',
      customer_feedback: 'Customer Feedback',
      story_topic: 'Story Topic',
      business_focus: 'Business Focus',
      community_impact: 'Community Impact',
      personal_story: 'Personal Story',
      business_type: 'Business Type',
      season: 'Season',
      seasonal_challenges: 'Seasonal Challenges',
      seasonal_opportunities: 'Seasonal Opportunities',
      target_market: 'Target Market',
      industry_topic: 'Industry Topic',
      current_trends: 'Current Trends',
      regulatory_changes: 'Regulatory Changes',
      business_implications: 'Business Implications',
      expert_perspective: 'Expert Perspective'
    };

    return labels[variable] || variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getVariableDescription = (variable: string): string => {
    const descriptions: Record<string, string> = {
      business_name: 'Your business or company name',
      location: 'City, suburb, or region (e.g., "Bondi, Sydney")',
      job_type: 'Type of work performed (e.g., "bathroom renovation")',
      project_details: 'Brief description of what was done',
      customer_feedback: 'What the customer said about your work',
      story_topic: 'The main subject of your story',
      business_focus: 'What your business specializes in',
      community_impact: 'How you contribute to the local community',
      personal_story: 'Personal background or motivation',
      business_type: 'Industry or business category',
      season: 'Australian season (summer, autumn, winter, spring)',
      seasonal_challenges: 'Challenges this season brings to your business',
      seasonal_opportunities: 'Opportunities this season creates',
      target_market: 'Who you\'re targeting this season',
      industry_topic: 'Specific industry subject or trend',
      current_trends: 'What\'s happening in the industry now',
      regulatory_changes: 'Recent or upcoming regulatory changes',
      business_implications: 'How this affects businesses',
      expert_perspective: 'Your background or expertise in this area'
    };

    return descriptions[variable] || 'Provide relevant information for this field';
  };

  const getVariablePlaceholder = (variable: string): string => {
    const placeholders: Record<string, string> = {
      business_name: 'Elite Plumbing Solutions',
      location: 'Bondi, Sydney',
      job_type: 'bathroom renovation',
      project_details: 'Complete bathroom makeover with new tiles and fixtures',
      customer_feedback: 'Very happy with the quality work',
      story_topic: 'Supporting local artists',
      business_focus: 'Coffee and community',
      community_impact: 'Monthly art exhibitions featuring local artists',
      personal_story: 'Started by former art teacher',
      business_type: 'restaurant',
      season: 'summer',
      seasonal_challenges: 'Increased competition from outdoor dining',
      seasonal_opportunities: 'Tourist influx and longer dining hours',
      target_market: 'Tourists and locals seeking al fresco dining',
      industry_topic: 'Open Banking implementation',
      current_trends: 'Increased API adoption and fintech partnerships',
      regulatory_changes: 'ACCC oversight and compliance requirements',
      business_implications: 'New opportunities for customer data insights',
      expert_perspective: '15 years in Australian financial services'
    };

    return placeholders[variable] || `Enter ${getVariableLabel(variable).toLowerCase()}`;
  };

  const isFormValid = template.variables.every(variable => 
    formData.variables[variable]?.trim().length >= 3
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Content Details</h3>
        <p className="text-muted-foreground">
          Fill in the details below to customize your {template.name.toLowerCase()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Template: {template.name}</CardTitle>
          <CardDescription>
            {template.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Info */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {template.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Badge variant="outline">
              {template.industry.slice(0, 2).join(', ')}
              {template.industry.length > 2 && ` +${template.industry.length - 2} more`}
            </Badge>
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <Label>Content Tone</Label>
            <Select value={formData.tone} onValueChange={updateTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {template.tone_options.map((tone) => (
                  <SelectItem key={tone} value={tone}>
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Variable Input Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Variables</CardTitle>
          <CardDescription>
            Provide specific details to personalize your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {template.variables.map((variable) => (
            <div key={variable} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={variable}>
                  {getVariableLabel(variable)}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <div className="group relative">
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-popover text-popover-foreground text-xs rounded-md border shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {getVariableDescription(variable)}
                  </div>
                </div>
              </div>
              
              {variable === 'project_details' || variable === 'personal_story' || variable === 'expert_perspective' ? (
                <Textarea
                  id={variable}
                  value={formData.variables[variable] || ''}
                  onChange={(e) => updateVariable(variable, e.target.value)}
                  placeholder={getVariablePlaceholder(variable)}
                  rows={3}
                  className={errors[variable] ? 'border-destructive' : ''}
                />
              ) : (
                <Input
                  id={variable}
                  value={formData.variables[variable] || ''}
                  onChange={(e) => updateVariable(variable, e.target.value)}
                  placeholder={getVariablePlaceholder(variable)}
                  className={errors[variable] ? 'border-destructive' : ''}
                />
              )}
              
              {errors[variable] && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors[variable]}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Example Output */}
      {template.examples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Example Output</CardTitle>
            <CardDescription>
              Here's what your content might look like with this template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">
                {template.examples[0].output}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleGenerate}
          disabled={!isFormValid || isGenerating}
          className="flex-1"
          size="lg"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating Content...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
      </div>

      {/* Form Validation Info */}
      {!isFormValid && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fill in all required fields with at least 3 characters each to generate content.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};