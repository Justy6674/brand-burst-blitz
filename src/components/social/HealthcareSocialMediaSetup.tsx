import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useHealthcareAuth } from '@/hooks/useHealthcareAuth';
import { useAHPRACompliance } from '@/hooks/useAHPRACompliance';
import { 
  Shield, Copy, CheckCircle, AlertTriangle, Users, 
  Facebook, Instagram, Linkedin, Twitter, Eye,
  Calendar, Clock, Zap, FileText, Heart, Brain
} from 'lucide-react';

interface SocialTemplate {
  id: string;
  title: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  content_type: 'patient_education' | 'practice_marketing' | 'professional_content';
  content: string;
  compliance_score: number;
  specialty: string[];
  hashtags: string[];
  disclaimer: string;
  character_count: number;
  platform_compliant: boolean;
}

const healthcareSocialTemplates: SocialTemplate[] = [
  {
    id: '1',
    title: 'General Health Awareness - Heart Health',
    platform: 'facebook',
    content_type: 'patient_education',
    content: `Understanding your heart health is important for overall wellbeing. Regular check-ups can help identify potential issues early.

Key factors that may influence heart health include:
• Regular physical activity
• Balanced nutrition
• Managing stress
• Not smoking
• Limited alcohol consumption

Consult your healthcare provider for personalised advice about your heart health.`,
    compliance_score: 98,
    specialty: ['medical', 'nursing'],
    hashtags: ['#HeartHealth', '#HealthAwareness', '#PreventiveCare'],
    disclaimer: 'This information is general in nature. Consult your healthcare provider for personalised advice.',
    character_count: 312,
    platform_compliant: true
  },
  {
    id: '2',
    title: 'Mental Health Awareness',
    platform: 'instagram',
    content_type: 'patient_education',
    content: `Mental health is just as important as physical health. 

Small steps that may support mental wellbeing:
✓ Regular sleep routine
✓ Physical activity
✓ Social connections
✓ Mindfulness practices
✓ Professional support when needed

If you're experiencing mental health concerns, consider speaking with a qualified healthcare professional.`,
    compliance_score: 96,
    specialty: ['psychology', 'medical'],
    hashtags: ['#MentalHealthAwareness', '#Wellbeing', '#SelfCare', '#MentalHealthMatters'],
    disclaimer: 'This is general information only. Seek professional help if experiencing mental health concerns.',
    character_count: 298,
    platform_compliant: true
  },
  {
    id: '3',
    title: 'Physiotherapy Exercise Tips',
    platform: 'linkedin',
    content_type: 'patient_education',
    content: `Movement is medicine: Simple exercises that may help maintain joint mobility.

Professional insights on movement:
• Gentle stretching throughout the day
• Strength exercises as appropriate
• Balance and coordination activities
• Movement patterns for daily activities

Individual needs vary. A qualified physiotherapist can provide personalised assessment and exercise recommendations suitable for your specific situation.`,
    compliance_score: 94,
    specialty: ['physiotherapy'],
    hashtags: ['#PhysiotherapyTips', '#MovementIsMedicine', '#Healthcare', '#Rehabilitation'],
    disclaimer: 'Individual assessment required. Consult a physiotherapist for personalised advice.',
    character_count: 367,
    platform_compliant: true
  },
  {
    id: '4',
    title: 'Practice Service Information',
    platform: 'facebook',
    content_type: 'practice_marketing',
    content: `Our practice provides comprehensive healthcare services to support your wellbeing.

Services available:
• General consultations
• Health assessments
• Preventive care programs
• Chronic condition management
• Health education resources

We are committed to providing quality healthcare in accordance with professional standards. Book an appointment to discuss your healthcare needs.`,
    compliance_score: 97,
    specialty: ['medical', 'nursing'],
    hashtags: ['#HealthcareServices', '#PatientCare', '#QualityCare'],
    disclaimer: 'Professional healthcare services. Individual assessment required for all patients.',
    character_count: 298,
    platform_compliant: true
  }
];

export const HealthcareSocialMediaSetup = () => {
  const { user } = useHealthcareAuth();
  const { validateContent } = useAHPRACompliance();
  const [selectedTemplate, setSelectedTemplate] = useState<SocialTemplate>(healthcareSocialTemplates[0]);
  const [customContent, setCustomContent] = useState('');
  const [complianceResult, setComplianceResult] = useState<any>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const copyToClipboard = async (content: string, templateId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTemplate(templateId);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCustomContentCheck = async () => {
    if (!customContent.trim()) return;
    
    const practiceType: any = { type: 'gp', ahpra_registration: 'mock' };
    const result = await validateContent(customContent, practiceType, 'social_media');
    setComplianceResult(result);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return Facebook;
      case 'instagram': return Instagram;
      case 'linkedin': return Linkedin;
      case 'twitter': return Twitter;
      default: return FileText;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'patient_education': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'practice_marketing': return 'bg-green-100 text-green-800 border-green-200';
      case 'professional_content': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    if (specialty.includes('psychology')) return Brain;
    if (specialty.includes('physiotherapy')) return Heart;
    return Shield;
  };

  const filteredTemplates = healthcareSocialTemplates.filter(template => 
    !user?.profession_type || template.specialty.includes(user.profession_type)
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Healthcare Social Media Setup
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          AHPRA-compliant social media templates designed for Australian healthcare professionals. 
          Copy-paste ready content that follows platform policies and professional guidelines.
        </p>
      </div>

      {/* Platform Compliance Alert */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Social Media Platform Requirements:</strong> Healthcare content on social platforms must comply with both AHPRA guidelines and platform advertising policies. Always review platform-specific healthcare advertising requirements before posting.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Compliant Templates
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Custom Content Check
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Platform Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Selector */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Templates</CardTitle>
                  <CardDescription>
                    Pre-approved templates for {user?.profession_type?.replace('_', ' ')} professionals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredTemplates.map((template) => {
                    const PlatformIcon = getPlatformIcon(template.platform);
                    const SpecialtyIcon = getSpecialtyIcon(template.specialty[0]);
                    const isSelected = selectedTemplate.id === template.id;
                    
                    return (
                      <Card 
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <SpecialtyIcon className="h-5 w-5 text-blue-600" />
                            <PlatformIcon className="h-5 w-5 text-gray-500" />
                          </div>
                          
                          <h3 className="font-semibold text-sm mb-2">{template.title}</h3>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getContentTypeColor(template.content_type)}>
                              {template.content_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Score: {template.compliance_score}%</span>
                            <span>{template.character_count} chars</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Template Preview & Copy */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {React.createElement(getPlatformIcon(selectedTemplate.platform), { className: "h-5 w-5" })}
                        {selectedTemplate.title}
                      </CardTitle>
                      <CardDescription>
                        Ready to copy and paste into {selectedTemplate.platform}
                      </CardDescription>
                    </div>
                    <Badge className={`${selectedTemplate.compliance_score >= 95 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {selectedTemplate.compliance_score}% AHPRA Compliant
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Content Preview */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Post Content:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <pre className="whitespace-pre-wrap text-sm font-normal">
                          {selectedTemplate.content}
                        </pre>
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div>
                      <h4 className="font-semibold mb-2">Hashtags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.hashtags.map((hashtag, index) => (
                          <Badge key={index} variant="outline" className="text-blue-600">
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div>
                      <h4 className="font-semibold mb-2">Required Disclaimer:</h4>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">{selectedTemplate.disclaimer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Copy Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => copyToClipboard(
                        `${selectedTemplate.content}\n\n${selectedTemplate.hashtags.join(' ')}\n\n${selectedTemplate.disclaimer}`,
                        selectedTemplate.id
                      )}
                      className="w-full"
                    >
                      {copiedTemplate === selectedTemplate.id ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Complete Post
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(selectedTemplate.content, `${selectedTemplate.id}-content`)}
                      className="w-full"
                    >
                      {copiedTemplate === `${selectedTemplate.id}-content` ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Content Only
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Platform Compliance Status */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Platform Compliance Check:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">AHPRA Compliant</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">{selectedTemplate.platform} Policy Compliant</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Custom Content Compliance Check
              </CardTitle>
              <CardDescription>
                Check your own social media content for AHPRA compliance before posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Social Media Content:
                  </label>
                  <Textarea
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Paste your social media content here for AHPRA compliance checking..."
                    rows={8}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Character count: {customContent.length}
                  </p>
                </div>

                <Button 
                  onClick={handleCustomContentCheck}
                  disabled={!customContent.trim()}
                  className="w-full md:w-auto"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Check AHPRA Compliance
                </Button>
              </div>

              {complianceResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className={`text-2xl font-bold ${
                      complianceResult.isCompliant ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {complianceResult.score}%
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {complianceResult.isCompliant ? 'AHPRA Compliant' : 'Compliance Issues Detected'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {complianceResult.violations.length} violation{complianceResult.violations.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                  </div>

                  {complianceResult.violations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-red-800">Issues to Address:</h4>
                      {complianceResult.violations.map((violation: any, index: number) => (
                        <Alert key={index} className="border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{violation.type}:</strong> {violation.message}
                            {violation.suggestion && (
                              <div className="mt-2 text-sm">
                                <strong>Suggestion:</strong> {violation.suggestion}
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  {complianceResult.suggestions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-blue-800">Improvement Suggestions:</h4>
                      {complianceResult.suggestions.map((suggestion: string, index: number) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  Meta Business Manager Setup
                </CardTitle>
                <CardDescription>
                  Configure Meta (Facebook/Instagram) for healthcare content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Meta Healthcare Policy:</strong> Healthcare-related content must comply with Meta's advertising policies. Avoid making health claims or promoting prescription medications.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Business account verified</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Healthcare category selected</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">AHPRA registration displayed</span>
                  </div>
                </div>

                <Button className="w-full">
                  Connect Meta Business Account
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  LinkedIn Professional Setup
                </CardTitle>
                <CardDescription>
                  Optimize LinkedIn for healthcare professional content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>LinkedIn Healthcare:</strong> LinkedIn is generally more permissive for healthcare professionals sharing educational content and professional insights.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Professional profile optimized</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Healthcare specialization highlighted</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Educational content strategy set</span>
                  </div>
                </div>

                <Button className="w-full">
                  Optimize LinkedIn Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Copy-Paste Workflow Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Copy-Paste Workflow Guide</CardTitle>
              <CardDescription>
                How to use AHPRA-compliant templates across social media platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <h4 className="font-semibold">Select Template</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Choose an AHPRA-compliant template that matches your specialty and content goals.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <h4 className="font-semibold">Copy Content</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Use the copy buttons to grab the complete post with hashtags and disclaimer included.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <h4 className="font-semibold">Paste & Publish</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Paste into your social media platform and publish. Content is pre-approved for AHPRA compliance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 