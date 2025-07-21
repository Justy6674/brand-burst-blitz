import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { BusinessOnboardingDashboard } from '@/components/onboarding/BusinessOnboardingDashboard';
import { AIContentGenerator } from '@/components/content/AIContentGenerator';
import { BulkPatientEducationGenerator } from '@/components/content/BulkPatientEducationGenerator';
import { HealthcareContentApprovalWorkflow } from '@/components/content/HealthcareContentApprovalWorkflow';
import { HealthcareImageGenerator } from '@/components/media/HealthcareImageGenerator';
import { SmartIntegrationWizard } from '@/components/blog/SmartIntegrationWizard';
import { ArrowLeft, Settings, Wand2, Zap, BookOpen, FileText, Shield, CheckSquare, Camera, Sparkles } from 'lucide-react';

interface QuestionnaireData {
  business_name: string;
  industry: string;
  specialty: string;
  target_audience_demographics: string;
  primary_goals: string[];
  brand_voice: string;
  target_platforms: string[];
  practice_type: string;
}

export const CreateContent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { businessProfiles, isLoading } = useBusinessProfile();
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showBlogIntegration, setShowBlogIntegration] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [activeContentTab, setActiveContentTab] = useState('individual');

  // Load questionnaire data for personalized defaults
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
          practice_type: profileData.industry
        };

        setQuestionnaireData(fullData);
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

  // Show onboarding if no business profiles exist
  if (!isLoading && (!businessProfiles || businessProfiles.length === 0)) {
    return <BusinessOnboardingDashboard />;
  }

  // Show loading state while loading questionnaire data
  if (isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your personalized content creation setup...</p>
        </div>
      </div>
    );
  }

  // Show blog integration wizard if requested
  if (showBlogIntegration && selectedBusinessId) {
    const selectedBusiness = businessProfiles?.find(p => p.id === selectedBusinessId);
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setShowBlogIntegration(false)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Content Creation
          </Button>
        </div>
        
        <SmartIntegrationWizard
          businessId={selectedBusinessId}
          onComplete={() => setShowBlogIntegration(false)}
        />
      </div>
    );
  }

  const handleContentGenerated = (content: string, postId: string) => {
    toast({
      title: 'Content created successfully',
      description: 'Your content has been saved as a draft.',
    });
    
    // Navigate to publishing pipeline or dashboard
    navigate('/dashboard');
  };

  const handleSetupIntegration = (businessId: string) => {
    setSelectedBusinessId(businessId);
    setShowBlogIntegration(true);
  };

  // Get the first business profile for components that need it
  const firstBusinessProfile = businessProfiles?.[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {questionnaireData ? 
                `${questionnaireData.specialty} Content Creation` : 
                'Healthcare Content Creation'
              }
            </h1>
            <p className="text-muted-foreground">
              {questionnaireData ? 
                `Generate AHPRA-compliant content for ${questionnaireData.business_name}` :
                'Generate AHPRA-compliant content for Australian healthcare professionals'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              AHPRA Compliant
            </Badge>
            {questionnaireData && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {questionnaireData.specialty}
              </Badge>
            )}
            {businessProfiles && businessProfiles.length > 0 && (
              <Button 
                variant="outline"
                onClick={() => handleSetupIntegration(businessProfiles[0].id)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Setup Blog Integration
              </Button>
            )}
          </div>
        </div>

        {/* Personalized Practice Overview */}
        {questionnaireData && (
          <Card className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{questionnaireData.business_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Targeting {questionnaireData.target_audience_demographics} • 
                    {questionnaireData.brand_voice} tone • 
                    {questionnaireData.target_platforms.join(', ')} platforms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Integration Status Cards */}
        {businessProfiles && businessProfiles.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {businessProfiles.map((profile) => (
              <Card key={profile.id} className="border-muted">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{profile.business_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Blog integration not configured
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSetupIntegration(profile.id)}
                    >
                      Setup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Content Creation Tabs */}
      <Tabs value={activeContentTab} onValueChange={setActiveContentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Individual Content
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Bulk Patient Education
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Approval Workflow
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Healthcare Images
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Individual Content Generator
              </CardTitle>
              <CardDescription>
                {questionnaireData ? 
                  `Create ${questionnaireData.specialty}-specific AHPRA-compliant content for ${questionnaireData.business_name}` :
                  'Create single pieces of AHPRA-compliant healthcare content for your practice'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIContentGenerator onContentGenerated={handleContentGenerated} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Bulk Patient Education Generator
              </CardTitle>
              <CardDescription>
                {questionnaireData ? 
                  `Create comprehensive ${questionnaireData.specialty} awareness campaigns with bulk patient education content` :
                  'Create comprehensive healthcare awareness campaigns with bulk patient education content'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {firstBusinessProfile && questionnaireData ? (
                <BulkPatientEducationGenerator 
                  practiceId={firstBusinessProfile.id}
                  defaultSpecialty={questionnaireData.practice_type}
                />
              ) : (
                <div className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Practice Profile Required
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Complete your healthcare practice questionnaire to access personalized bulk patient education content generation.
                  </p>
                  <Button onClick={() => navigate('/questionnaire')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Complete Practice Questionnaire
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Content Approval Workflow
              </CardTitle>
              <CardDescription>
                Practice manager oversight and approval system for healthcare content
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {firstBusinessProfile ? (
                <HealthcareContentApprovalWorkflow 
                  practiceId={firstBusinessProfile.id}
                  userRole="practitioner"
                />
              ) : (
                <div className="p-6 text-center">
                  <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Practice Profile Required
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Set up your healthcare practice profile to access the content approval workflow system.
                  </p>
                  <Button onClick={() => navigate('/onboarding')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Setup Practice Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Healthcare Image Generator
              </CardTitle>
              <CardDescription>
                Generate AHPRA-compliant healthcare images with appropriate medical disclaimers
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {firstBusinessProfile && questionnaireData ? (
                <HealthcareImageGenerator 
                  practiceId={firstBusinessProfile.id}
                  specialty={questionnaireData.practice_type}
                  onImageGenerated={(imageData) => {
                    toast({
                      title: "Image Generated Successfully",
                      description: `Healthcare image created with ${imageData.complianceValidation.complianceScore}% compliance score`,
                    });
                  }}
                />
              ) : (
                <div className="p-6 text-center">
                  <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Practice Profile Required
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Complete your healthcare practice questionnaire to access personalized healthcare image generation.
                  </p>
                  <Button onClick={() => navigate('/questionnaire')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Complete Practice Questionnaire
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};