import React, { useState, useEffect } from 'react';
import { Wand2, Sparkles, FileText, MessageSquare, Megaphone, Brain, Zap, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { useContentTemplates } from '@/hooks/useContentTemplates';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { AdvancedContentEngine } from '@/components/ai/AdvancedContentEngine';
import { AHPRAComplianceDashboard } from '@/components/compliance/AHPRAComplianceDashboard';
import { useAHPRACompliance, ComplianceResult, HealthcarePracticeType } from '@/hooks/useAHPRACompliance';

const contentTypes = [
  { value: 'blog', label: 'Patient Education Blog', icon: FileText },
  { value: 'social_media', label: 'Healthcare Social Media', icon: MessageSquare },
  { value: 'advertisement', label: 'Practice Advertisement', icon: Megaphone },
  { value: 'website', label: 'Practice Website Content', icon: FileText },
];

// Healthcare-specific tones that maintain AHPRA compliance
const healthcareTones = [
  { value: 'professional', label: 'Professional & Clinical' },
  { value: 'empathetic', label: 'Empathetic & Caring' },
  { value: 'educational', label: 'Educational & Informative' },
  { value: 'reassuring', label: 'Reassuring & Supportive' },
  { value: 'clinical', label: 'Clinical & Evidence-Based' },
  { value: 'health-promotional', label: 'Health Promotional' },
];

// Healthcare practice types for AHPRA compliance
const healthcarePracticeTypes = [
  { value: 'gp', label: 'General Practice (GP)' },
  { value: 'specialist', label: 'Medical Specialist' },
  { value: 'allied_health', label: 'Allied Health Professional' },
  { value: 'psychology', label: 'Psychology Practice' },
  { value: 'social_work', label: 'Social Work Practice' },
  { value: 'nursing', label: 'Nursing Practice' },
  { value: 'dental', label: 'Dental Practice' },
  { value: 'optometry', label: 'Optometry Practice' },
];

// Healthcare practice type mapping from questionnaire industry to AHPRA types
const getHealthcarePracticeType = (industry: string): HealthcarePracticeType => {
  const mapping: Record<string, HealthcarePracticeType> = {
    'health': 'gp',
    'psychology': 'psychology',
    'physio': 'allied_health',
    'allied_health': 'allied_health',
    'dental': 'dental',
    'nursing': 'nursing'
  };
  return mapping[industry] || 'gp';
};

interface QuestionnaireData {
  business_name?: string;
  industry?: string;
  target_audience_demographics?: string;
  target_audience_psychographics?: string;
  brand_voice?: string;
  target_platforms?: string[];
  content_topics?: string[];
  primary_goals?: string[];
  competitive_advantages?: string;
  specialty?: string;
}

interface AIContentGeneratorProps {
  onContentGenerated?: (content: string, postId: string) => void;
}

export const AIContentGenerator = ({ onContentGenerated }: AIContentGeneratorProps) => {
  const [mode, setMode] = useState<"quick" | "advanced" | "compliance">("quick");
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<'blog' | 'social_media' | 'advertisement' | 'website'>('blog');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [isLoadingQuestionnaire, setIsLoadingQuestionnaire] = useState(true);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [showComplianceDashboard, setShowComplianceDashboard] = useState(false);
  
  // Healthcare-specific AHPRA compliance state
  const [practiceType, setPracticeType] = useState<'gp' | 'specialist' | 'allied_health' | 'psychology' | 'social_work' | 'nursing' | 'dental' | 'optometry'>('gp');
  const [ahpraRegistration, setAhpraRegistration] = useState('');
  const [specialty, setSpecialty] = useState('');

  const { generateContent, isGenerating } = useAIGeneration();
  const { templates } = useContentTemplates();
  const { businessProfiles, isLoading: profilesLoading } = useBusinessProfile();
  const { user } = useAuth();

  // Get the primary business profile
  const selectedProfile = businessProfiles?.find(p => p.is_primary) || businessProfiles?.[0];

  const filteredTemplates = templates.filter(template => template.type === selectedType);

  // Load questionnaire data on component mount
  useEffect(() => {
    loadQuestionnaireData();
  }, [selectedProfile]);

  const loadQuestionnaireData = async () => {
    if (!selectedProfile || !user) {
      setIsLoadingQuestionnaire(false);
      return;
    }

    try {
      // Get questionnaire data from business profile compliance_settings
      const { data: profileData, error } = await supabase
        .from('business_profiles')
        .select('compliance_settings, business_name, industry, default_ai_tone, website_url')
        .eq('id', selectedProfile.id)
        .single();

      if (error || !profileData) {
        console.error('Error loading questionnaire data:', error);
        setIsLoadingQuestionnaire(false);
        return;
      }

      // Parse compliance settings to get questionnaire data
      let questionnaireResponses = null;
      if (profileData.compliance_settings) {
        try {
          const complianceSettings = typeof profileData.compliance_settings === 'string' 
            ? JSON.parse(profileData.compliance_settings)
            : profileData.compliance_settings;
          
          questionnaireResponses = complianceSettings.questionnaire_data || complianceSettings;
        } catch (parseError) {
          console.error('Error parsing compliance settings:', parseError);
        }
      }

      // Extract questionnaire data
      const questData: QuestionnaireData = {
        business_name: profileData.business_name,
        industry: profileData.industry,
        brand_voice: profileData.default_ai_tone,
        target_audience_demographics: questionnaireResponses?.target_audience_demographics,
        target_audience_psychographics: questionnaireResponses?.target_audience_psychographics,
        target_platforms: questionnaireResponses?.target_platforms,
        content_topics: questionnaireResponses?.content_topics,
        primary_goals: questionnaireResponses?.primary_goals,
        competitive_advantages: questionnaireResponses?.competitive_advantages,
        specialty: getSpecialtyFromIndustry(profileData.industry)
      };

      setQuestionnaireData(questData);
    } catch (error) {
      console.error('Error loading questionnaire data:', error);
    } finally {
      setIsLoadingQuestionnaire(false);
    }
  };

  const getSpecialtyFromIndustry = (industry: string): string => {
    const specialtyMap: Record<string, string> = {
      'health': 'General Practice',
      'psychology': 'Clinical Psychology',
      'physio': 'Physiotherapy',
      'allied_health': 'Allied Health',
      'dental': 'Dentistry',
      'nursing': 'Nursing Practice'
    };
    return specialtyMap[industry] || 'Healthcare Professional';
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (!questionnaireData) {
      alert('Please complete your business questionnaire first to enable personalized content generation');
      return;
    }

    try {
      // Build healthcare-specific context using REAL questionnaire data
      const practiceType = getHealthcarePracticeType(questionnaireData.industry || 'health');
      const specialty = questionnaireData.specialty || 'General Healthcare';
      const brandVoice = questionnaireData.brand_voice || 'professional';
      const targetAudience = questionnaireData.target_audience_demographics || 'Australian healthcare consumers';
      const targetPlatforms = questionnaireData.target_platforms || ['facebook'];
      
      // Create REAL personalized healthcare context
      const healthcareContext = `Healthcare Practice: ${questionnaireData.business_name}
Practice Type: ${practiceType}
Specialty: ${specialty}
Brand Voice: ${brandVoice}
Target Audience: ${targetAudience}
Target Platforms: ${targetPlatforms.join(', ')}
Content Topics: ${questionnaireData.content_topics?.join(', ') || 'Patient education'}
Primary Goals: ${questionnaireData.primary_goals?.join(', ') || 'Patient education'}
Competitive Advantages: ${questionnaireData.competitive_advantages || 'Quality healthcare service'}

IMPORTANT COMPLIANCE REQUIREMENTS:
- All content must comply with AHPRA advertising guidelines and TGA therapeutic advertising requirements
- No patient testimonials or reviews (AHPRA prohibition)
- No prohibited drug names (Botox, Juvederm, etc.)
- Include appropriate risk disclaimers for healthcare content
- Maintain professional boundaries and evidence-based language
- Content must be appropriate for ${specialty} practice targeting ${targetAudience}`;

      const result = await generateContent({
        prompt: `${prompt}

PERSONALIZATION CONTEXT: Create content specifically for a ${specialty} practice named "${questionnaireData.business_name}" that uses a ${brandVoice} tone and targets ${targetAudience}. 

The content should reflect their competitive advantages: ${questionnaireData.competitive_advantages || 'Quality healthcare service'}

This content will be used on: ${targetPlatforms.join(' and ')}

COMPLIANCE: This content is for Australian healthcare professionals and must comply with AHPRA advertising guidelines and TGA therapeutic advertising requirements.`,
        templateId: selectedTemplate,
        tone: brandVoice,
        type: selectedType === 'social_media' ? 'social' : selectedType === 'advertisement' ? 'ad' : selectedType as "blog" | "social" | "ad",
        businessContext: healthcareContext,
        businessProfileId: selectedProfile?.id
      });

      setGeneratedContent(result.content);
      
      // Automatically switch to compliance tab after generation
      setMode("compliance");
      
      onContentGenerated?.(result.content, result.postId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const TypeIcon = contentTypes.find(type => type.value === selectedType)?.icon || FileText;

  if (isLoadingQuestionnaire || profilesLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your healthcare practice data...</p>
        </div>
      </div>
    );
  }

  if (!questionnaireData) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Business Questionnaire Required</strong>
            <br />
            Please complete your business intelligence questionnaire to enable personalized, AHPRA-compliant content generation.
            <br />
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.href = '/questionnaire'}>
              Complete Questionnaire
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personalized Practice Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Personalized for {questionnaireData.business_name}
          </CardTitle>
          <CardDescription>
            Content optimized for {questionnaireData.specialty} practice using {questionnaireData.brand_voice} tone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Label className="font-medium">Specialty</Label>
              <p className="text-muted-foreground">{questionnaireData.specialty}</p>
            </div>
            <div>
              <Label className="font-medium">Brand Voice</Label>
              <p className="text-muted-foreground capitalize">{questionnaireData.brand_voice}</p>
            </div>
            <div>
              <Label className="font-medium">Target Platforms</Label>
              <p className="text-muted-foreground">{questionnaireData.target_platforms?.slice(0, 2).join(', ')}</p>
            </div>
            <div>
              <Label className="font-medium">Primary Goals</Label>
              <p className="text-muted-foreground">{questionnaireData.primary_goals?.slice(0, 2).join(', ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Generate
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            AHPRA Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Quick Healthcare Content Generation
              </CardTitle>
              <CardDescription>
                Generate AHPRA-compliant content personalized for your {questionnaireData.specialty} practice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Content Type Selection */}
              <div className="space-y-2">
                <Label>Content Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {contentTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={selectedType === type.value ? "default" : "outline"}
                      onClick={() => setSelectedType(type.value as any)}
                      className="flex items-center gap-2 h-auto p-4"
                    >
                      <type.icon className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{type.label}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Content Template Selection */}
              {filteredTemplates.length > 0 && (
                <div className="space-y-2">
                  <Label>Content Template (Optional)</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template or create custom content..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Content Prompt */}
              <div className="space-y-2">
                <Label>Content Topic</Label>
                <Textarea
                  placeholder={`What would you like to create content about? Example: "Tips for managing diabetes in elderly patients" or "Benefits of regular physiotherapy for sports injuries"`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Your content will be automatically personalized for {questionnaireData.specialty} practice with {questionnaireData.brand_voice} tone targeting {questionnaireData.target_audience_demographics?.slice(0, 50)}...
                </p>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating AHPRA-Compliant Content...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Personalized Healthcare Content
                  </>
                )}
              </Button>

              {/* Generated Content Preview */}
              {generatedContent && (
                <div className="space-y-2">
                  <Label>Generated Content</Label>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <pre className="whitespace-pre-wrap font-sans text-sm">{generatedContent}</pre>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generatedContent)}>
                      Copy Content
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setMode("compliance")}>
                      Check AHPRA Compliance
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedContentEngine />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <AHPRAComplianceDashboard 
            content={generatedContent}
            practiceType={getHealthcarePracticeType(questionnaireData.industry || 'health')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIContentGenerator;