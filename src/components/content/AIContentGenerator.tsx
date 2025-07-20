import React, { useState } from 'react';
import { Wand2, Sparkles, FileText, MessageSquare, Megaphone, Brain, Zap, Shield, AlertTriangle } from 'lucide-react';
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
  
  // Healthcare-specific AHPRA compliance state
  const [practiceType, setPracticeType] = useState<'gp' | 'specialist' | 'allied_health' | 'psychology' | 'social_work' | 'nursing' | 'dental' | 'optometry'>('gp');
  const [ahpraRegistration, setAhpraRegistration] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [showComplianceDashboard, setShowComplianceDashboard] = useState(false);

  const { generateContent, isGenerating } = useAIGeneration();
  const { templates } = useContentTemplates();
  const { businessProfiles, isLoading: profilesLoading } = useBusinessProfile();

  // Use first business profile if none selected
  const selectedProfile = selectedBusinessId 
    ? businessProfiles?.find(p => p.id === selectedBusinessId) 
    : businessProfiles?.[0];

  const filteredTemplates = templates.filter(template => template.type === selectedType);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Validate AHPRA registration for healthcare content
    if (!ahpraRegistration.trim()) {
      alert('AHPRA registration number is required for healthcare content generation');
      return;
    }

    try {
      // Healthcare-specific business context with AHPRA compliance
      const healthcareContext = selectedProfile ? 
        `Healthcare Practice: ${selectedProfile.business_name}, Type: ${practiceType}, AHPRA: ${ahpraRegistration}, Specialty: ${specialty || 'General'}, Website: ${selectedProfile.website_url || 'N/A'}. 
        IMPORTANT: All content must comply with AHPRA advertising guidelines and TGA therapeutic advertising requirements. 
        - No patient testimonials or reviews
        - No prohibited drug names (Botox, Juvederm, etc.)
        - Include appropriate risk disclaimers
        - Maintain professional boundaries
        - Use evidence-based language only` : 
        undefined;

      const result = await generateContent({
        prompt: `${prompt}\n\nIMPORTANT: This content is for Australian healthcare professionals and must comply with AHPRA advertising guidelines and TGA therapeutic advertising requirements. Ensure no patient testimonials, prohibited drug names, or misleading therapeutic claims are included.`,
        templateId: selectedTemplate,
        tone: selectedTone,
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-primary" />
            <CardTitle>AI Content Generator</CardTitle>
          </div>
          <CardDescription>
            Choose between quick generation or advanced AI-powered content creation
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={mode} onValueChange={(value: any) => setMode(value)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Generate
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Advanced Engine
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                AHPRA Compliance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="space-y-6">
          {/* Healthcare Practice Configuration */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Shield className="h-5 w-5" />
                Healthcare Practice Setup
              </CardTitle>
              <CardDescription>
                Configure your practice details for AHPRA-compliant content generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Practice Type</Label>
                  <Select value={practiceType} onValueChange={(value: any) => setPracticeType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {healthcarePracticeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>AHPRA Registration Number *</Label>
                  <input
                    type="text"
                    placeholder="e.g., MED0001234567"
                    value={ahpraRegistration}
                    onChange={(e) => setAhpraRegistration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {practiceType === 'specialist' && (
                <div className="space-y-2">
                  <Label>Medical Specialty</Label>
                  <input
                    type="text"
                    placeholder="e.g., Cardiology, Dermatology, Psychiatry"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Healthcare Practice Selection */}
          {!profilesLoading && businessProfiles && businessProfiles.length > 0 && (
            <div className="space-y-2">
              <Label>Select Healthcare Practice</Label>
              <Select 
                value={selectedBusinessId || businessProfiles[0]?.id || ''} 
                onValueChange={setSelectedBusinessId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose healthcare practice..." />
                </SelectTrigger>
                <SelectContent>
                  {businessProfiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      <div className="flex flex-col">
                        <span>{profile.business_name}</span>
                        {profile.website_url && (
                          <span className="text-xs text-muted-foreground">{profile.website_url}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Healthcare Content Type Selection */}
          <div className="space-y-2">
            <Label>Healthcare Content Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{contentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? 'default' : 'outline'}
                    onClick={() => setSelectedType(type.value as any)}
                    className="flex flex-col items-center space-y-1 h-auto p-4"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs text-center">{type.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Healthcare Tone Selection */}
          <div className="space-y-2">
            <Label>Healthcare Communication Tone</Label>
            <Select value={selectedTone} onValueChange={setSelectedTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {healthcareTones.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Selection */}
          {filteredTemplates.length > 0 && (
            <div className="space-y-2">
              <Label>Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template</SelectItem>
                  {filteredTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label>Content Prompt</Label>
            <Textarea
              placeholder="Describe what you want to create... (e.g., 'Write a blog post about the benefits of remote work for productivity')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          {/* AHPRA Compliance Warning */}
          {!ahpraRegistration.trim() && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>AHPRA Registration Required:</strong> Please enter your AHPRA registration number to ensure compliance with Australian healthcare advertising regulations.
              </AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate} 
            disabled={!prompt.trim() || !ahpraRegistration.trim() || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Generating AHPRA-Compliant Content...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Generate Healthcare Content
              </>
            )}
          </Button>

          {/* Business Context Display */}
          {selectedProfile && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="secondary">
                {selectedProfile.business_name} - {selectedProfile.industry}
              </Badge>
              {selectedProfile.website_url && (
                <Badge variant="outline">{selectedProfile.website_url}</Badge>
              )}
              <span>Business context will be included</span>
            </div>
          )}
            </TabsContent>

            <TabsContent value="advanced">
              <AdvancedContentEngine />
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              {generatedContent ? (
                <AHPRAComplianceDashboard
                  content={generatedContent}
                  practiceType={{
                    type: practiceType,
                    ahpra_registration: ahpraRegistration,
                    specialty: specialty || undefined
                  }}
                  contentType={selectedType}
                  onComplianceChange={setComplianceResult}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      AHPRA/TGA Compliance Centre
                    </CardTitle>
                    <CardDescription>
                      Generate content first to see AHPRA/TGA compliance analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert className="border-blue-200 bg-blue-50">
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        After generating healthcare content, this tab will show:
                        <ul className="mt-2 space-y-1 text-sm">
                          <li>• AHPRA advertising guidelines compliance check</li>
                          <li>• TGA therapeutic advertising validation</li>
                          <li>• Patient testimonial detection</li>
                          <li>• Professional boundary enforcement</li>
                          <li>• Real-time compliance scoring</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generated Content Preview with Compliance Status */}
      {generatedContent && mode === "quick" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TypeIcon className="h-5 w-5 text-primary" />
                <CardTitle>Generated Healthcare Content</CardTitle>
              </div>
              {complianceResult && (
                <div className="flex items-center space-x-2">
                  {complianceResult.isCompliant ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      ✅ AHPRA Compliant
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      ⚠️ Compliance Issues
                    </Badge>
                  )}
                  <Badge variant="outline">
                    Score: {complianceResult.score}/100
                  </Badge>
                </div>
              )}
            </div>
            <CardDescription>
              Your AI-generated {contentTypes.find(t => t.value === selectedType)?.label.toLowerCase()} content
              {complianceResult && !complianceResult.isCompliant && (
                <span className="text-red-600 ml-2">
                  • Check compliance tab for details
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
            </div>
            {complianceResult && !complianceResult.isCompliant && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setMode("compliance")}
                  className="w-full"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  View AHPRA Compliance Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};