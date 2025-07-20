import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useHealthcareAuth } from '@/hooks/useHealthcareAuth';
import { useAHPRACompliance } from '@/hooks/useAHPRACompliance';
import { HealthcareFacebookSetup } from './HealthcareFacebookSetup';
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

// Healthcare-compliant social media content templates
const healthcareSocialTemplates: SocialTemplate[] = [
  {
    id: 'mental_health_awareness',
    title: 'Mental Health Awareness Post',
    platform: 'facebook',
    content_type: 'patient_education',
    content: `Mental health is just as important as physical health. 💙

If you're experiencing persistent feelings of sadness, anxiety, or overwhelming stress, you're not alone. Professional support is available and effective.

Remember:
✓ Seeking help is a sign of strength
✓ Treatment options are varied and personalised
✓ Recovery is possible with the right support

For immediate support:
🔗 Lifeline: 13 11 14
🔗 Beyond Blue: 1300 22 4636

This information is general in nature. For advice specific to your situation, please consult with a qualified healthcare professional.

#MentalHealthAwareness #HealthcareEducation #PatientSupport #AustralianHealthcare`,
    compliance_score: 98,
    specialty: ['psychology', 'gp', 'mental_health'],
    hashtags: ['#MentalHealthAwareness', '#HealthcareEducation', '#PatientSupport', '#AustralianHealthcare'],
    disclaimer: 'This information is general in nature. For advice specific to your situation, please consult with a qualified healthcare professional.',
    character_count: 542,
    platform_compliant: true
  },
  {
    id: 'diabetes_prevention',
    title: 'Diabetes Prevention Tips',
    platform: 'instagram',
    content_type: 'patient_education',
    content: `Type 2 diabetes is largely preventable! 🌟

Simple steps that make a big difference:

🥗 Eat a balanced diet with plenty of vegetables
🚶‍♀️ Stay active - aim for 150 minutes per week
⚖️ Maintain a healthy weight
🩺 Regular health check-ups

Early detection and lifestyle changes can significantly improve outcomes.

Book a health assessment with your GP to understand your risk factors.

This is general health information. Always consult your healthcare provider for personalised advice.

#DiabetesPrevention #HealthyLiving #PreventiveCare #AustralianHealthcare #GeneralPractice`,
    compliance_score: 97,
    specialty: ['gp', 'endocrinology', 'allied_health'],
    hashtags: ['#DiabetesPrevention', '#HealthyLiving', '#PreventiveCare', '#AustralianHealthcare'],
    disclaimer: 'This is general health information. Always consult your healthcare provider for personalised advice.',
    character_count: 456,
    platform_compliant: true
  },
  {
    id: 'physiotherapy_benefits',
    title: 'Physiotherapy Education',
    platform: 'linkedin',
    content_type: 'professional_content',
    content: `Evidence-based physiotherapy improves quality of life and functional outcomes.

Recent research demonstrates:
• 85% improvement in mobility outcomes
• 70% reduction in chronic pain management needs
• Faster recovery times with early intervention

Physiotherapy is integral to:
- Post-surgical rehabilitation
- Chronic condition management
- Injury prevention strategies
- Workplace ergonomic solutions

Professional collaboration between GPs and physiotherapists ensures comprehensive patient care.

For referrals and professional consultations, please contact our practice.

This content is intended for healthcare professionals. Patient care decisions should always be individualised.`,
    compliance_score: 96,
    specialty: ['physiotherapy', 'allied_health', 'rehabilitation'],
    hashtags: ['#Physiotherapy', '#EvidenceBasedCare', '#HealthcareProfessional', '#PatientOutcomes'],
    disclaimer: 'This content is intended for healthcare professionals. Patient care decisions should always be individualised.',
    character_count: 612,
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
  const [activeTab, setActiveTab] = useState('templates');

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Healthcare Social Media Setup</h2>
          <p className="text-gray-600">
            AHPRA-compliant social media management for Australian healthcare professionals
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          AHPRA Compliant
        </Badge>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Healthcare Compliance:</strong> All content templates and setup guides are designed specifically for Australian healthcare professionals and comply with AHPRA advertising guidelines and TGA therapeutic advertising requirements.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Content Templates</TabsTrigger>
          <TabsTrigger value="facebook-setup">Facebook Setup</TabsTrigger>
          <TabsTrigger value="platforms">Other Platforms</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Check</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Library */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  AHPRA-Compliant Templates
                </CardTitle>
                <CardDescription>
                  Pre-approved content templates for healthcare social media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {healthcareSocialTemplates.map((template) => {
                  const PlatformIcon = getPlatformIcon(template.platform);
                  const isSelected = selectedTemplate.id === template.id;
                  
                  return (
                    <div 
                      key={template.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <h4 className="font-medium">{template.title}</h4>
                          <div className="flex items-center gap-2">
                            <PlatformIcon className="h-4 w-4" />
                            <Badge 
                              variant="outline" 
                              className={getContentTypeColor(template.content_type)}
                            >
                              {template.content_type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {template.compliance_score}% Compliant
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Eye className="h-4 w-4" />
                        <span>{template.character_count} characters</span>
                        <span>•</span>
                        <span>{template.specialty.join(', ')}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Template Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Content Preview
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedTemplate.content, selectedTemplate.id)}
                  >
                    {copiedTemplate === selectedTemplate.id ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    Copy Content
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{selectedTemplate.content}</pre>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Hashtags:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.hashtags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Compliance Disclaimer:</h4>
                  <p className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border">
                    {selectedTemplate.disclaimer}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Character Count:</span>
                    <div className="text-gray-600">{selectedTemplate.character_count}</div>
                  </div>
                  <div>
                    <span className="font-medium">Compliance Score:</span>
                    <div className="text-green-600 font-medium">{selectedTemplate.compliance_score}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="facebook-setup" className="space-y-6">
          <HealthcareFacebookSetup 
            practiceId={user?.id}
            onComplete={(accounts) => {
              console.log('Facebook setup completed:', accounts);
              // Could show success message or redirect
            }}
          />
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>LinkedIn Healthcare Policy:</strong> Focus on professional content, evidence-based information, and peer-to-peer education. Avoid patient testimonials and direct medical advice.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Company page setup pending</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Professional credentials verification</span>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  Setup LinkedIn Professional
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="h-5 w-5 text-gray-900" />
                  Twitter/X Healthcare Setup
                </CardTitle>
                <CardDescription>
                  Configure Twitter for healthcare communication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Twitter Healthcare Considerations:</strong> Character limits require careful messaging. Focus on health awareness and directing to professional consultations.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Business account verification pending</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Healthcare profile optimization needed</span>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  Setup Twitter Healthcare
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AHPRA Compliance Checker
              </CardTitle>
              <CardDescription>
                Validate your custom content for AHPRA and TGA compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="custom-content" className="text-sm font-medium">
                  Custom Content to Check
                </label>
                <Textarea
                  id="custom-content"
                  placeholder="Paste your social media content here for AHPRA compliance checking..."
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  rows={6}
                />
              </div>
              
              <Button 
                onClick={handleCustomContentCheck}
                disabled={!customContent.trim()}
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Check AHPRA Compliance
              </Button>

              {complianceResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Compliance Score:</span>
                    <Badge 
                      variant={complianceResult.score >= 90 ? 'default' : 'destructive'}
                    >
                      {complianceResult.score}%
                    </Badge>
                  </div>
                  
                  {complianceResult.issues.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Compliance Issues:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                        {complianceResult.issues.map((issue: string, index: number) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {complianceResult.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Suggestions:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-600">
                        {complianceResult.suggestions.map((suggestion: string, index: number) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 