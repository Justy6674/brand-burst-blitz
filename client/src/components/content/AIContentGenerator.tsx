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
  business_name: string;
  industry: string;
  specialty: string;
  target_audience_demographics: string;
  primary_goals: string[];
  brand_voice: string;
  target_platforms: string[];
  content_topics: string[];
  practice_type: string;
}

interface AIContentGeneratorProps {
  onContentGenerated?: (content: string, postId: string) => void;
}

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({ onContentGenerated }) => {
  const { user } = useAuth();
  const { businessProfiles } = useBusinessProfile();
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Content generation state
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('social_media');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [activeTab, setActiveTab] = useState('generator');

  const { validateAHPRACompliance } = useAHPRACompliance();

  // Load questionnaire data on component mount
  useEffect(() => {
    loadQuestionnaireData();
  }, [user]);

  const loadQuestionnaireData = async () => {
    if (!user?.id) {
      setIsLoadingProfile(false);
      return;
    }

    try {
      setIsLoadingProfile(true);
      
      // Get questionnaire responses from business profile compliance_settings
      const { data: profileData, error } = await supabase
        .from('business_profiles')
        .select('compliance_settings, business_name, industry, default_ai_tone')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      if (error || !profileData) {
        setIsLoadingProfile(false);
        return;
      }

      // Extract questionnaire data from compliance_settings
      const complianceSettings = typeof profileData.compliance_settings === 'string' 
        ? JSON.parse(profileData.compliance_settings)
        : profileData.compliance_settings;

      const questionnaireResponses = complianceSettings?.questionnaire_data;

      if (questionnaireResponses) {
        const fullData: QuestionnaireData = {
          business_name: profileData.business_name,
          industry: profileData.industry,
          specialty: getSpecialtyFromIndustry(profileData.industry),
          target_audience_demographics: questionnaireResponses.target_audience || 'Australian healthcare consumers',
          primary_goals: questionnaireResponses.goals?.primary || ['patient-education'],
          brand_voice: profileData.default_ai_tone || 'professional',
          target_platforms: questionnaireResponses.platforms || ['facebook'],
          content_topics: ['patient-education', 'health-tips', 'practice-updates'],
          practice_type: profileData.industry
        };

        setQuestionnaireData(fullData);
        setSelectedPlatforms(fullData.target_platforms.slice(0, 2)); // Pre-select user's platforms
      }

    } catch (error) {
      console.error('Error loading questionnaire data:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const getSpecialtyFromIndustry = (industry: string): string => {
    const specialtyMap: { [key: string]: string } = {
      'health': 'General Practice',
      'psychology': 'Clinical Psychology', 
      'physio': 'Physiotherapy',
      'allied_health': 'Allied Health',
      'dental': 'Dentistry',
      'nursing': 'Nursing Practice'
    };
    return specialtyMap[industry] || 'Healthcare Professional';
  };

  const getHealthcarePracticeType = (industry: string): HealthcarePracticeType => {
    const practiceTypeMap: { [key: string]: HealthcarePracticeType } = {
      'health': { type: 'gp', ahpra_registration: true },
      'psychology': { type: 'psychology', ahpra_registration: true },
      'physio': { type: 'allied_health', ahpra_registration: true },
      'allied_health': { type: 'allied_health', ahpra_registration: true },
      'dental': { type: 'dental', ahpra_registration: true },
      'nursing': { type: 'nursing', ahpra_registration: true }
    };
    return practiceTypeMap[industry] || { type: 'gp', ahpra_registration: true };
  };

  // Generate content using questionnaire data for personalization
  const generateContent = async () => {
    if (!prompt.trim() || !questionnaireData) return;

    setIsGenerating(true);
    try {
      // Build specialty-specific prompt using questionnaire data
      const personalizedPrompt = buildPersonalizedPrompt();
      
      const response = await fetch('/api/generate-healthcare-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: personalizedPrompt,
          specialty: questionnaireData.specialty,
          contentType,
          practiceType: questionnaireData.practice_type,
          brandVoice: questionnaireData.brand_voice,
          targetAudience: questionnaireData.target_audience_demographics,
          targetPlatforms: selectedPlatforms,
          complianceMode: true
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedContent(result.content);
        
        // Validate AHPRA compliance
        const practiceType = getHealthcarePracticeType(questionnaireData.practice_type);
        const compliance = await validateAHPRACompliance(result.content, practiceType);
        setComplianceResult(compliance);
        
        setActiveTab('preview');
        
        // Notify parent component
        if (onContentGenerated) {
          onContentGenerated(result.content, `generated_${Date.now()}`);
        }
      }
    } catch (error) {
      console.error('Content generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const buildPersonalizedPrompt = (): string => {
    if (!questionnaireData) return prompt;

    return `
    Practice Context:
    - Business: ${questionnaireData.business_name}
    - Specialty: ${questionnaireData.specialty}
    - Target Audience: ${questionnaireData.target_audience_demographics}
    - Brand Voice: ${questionnaireData.brand_voice}
    - Primary Goals: ${questionnaireData.primary_goals.join(', ')}
    - Platform(s): ${selectedPlatforms.join(', ')}
    
    Content Request: ${prompt}
    
    Please create ${questionnaireData.specialty}-specific content that:
    1. Uses ${questionnaireData.brand_voice} tone
    2. Targets ${questionnaireData.target_audience_demographics}
    3. Aligns with ${questionnaireData.primary_goals.join(' and ')} goals
    4. Is optimized for ${selectedPlatforms.join(' and ')} platform(s)
    5. Maintains AHPRA compliance for ${questionnaireData.specialty} practice
    `;
  };

  // Show loading state while loading questionnaire data
  if (isLoadingProfile) {
    return (
      <div className="p-6 text-center">
        <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your practice profile...</p>
      </div>
    );
  }

  // Show setup prompt if no questionnaire data
  if (!questionnaireData) {
    return (
      <div className="p-6 text-center">
        <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Complete Your Practice Profile</h3>
        <p className="text-muted-foreground mb-4">
          To generate personalized healthcare content, please complete your business questionnaire first.
        </p>
        <Button onClick={() => window.location.href = '/questionnaire'}>
          Complete Practice Questionnaire
        </Button>
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

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator" className="flex items-center gap-2">
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

        <TabsContent value="generator" className="space-y-6">
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
                      variant={contentType === type.value ? "default" : "outline"}
                      onClick={() => setContentType(type.value as any)}
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
                onClick={generateContent} 
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
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("compliance")}>
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
            practiceType={getHealthcarePracticeType(questionnaireData.practice_type)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIContentGenerator;