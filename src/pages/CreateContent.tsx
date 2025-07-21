import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { BusinessOnboardingDashboard } from '@/components/onboarding/BusinessOnboardingDashboard';
import { AIContentGenerator } from '@/components/content/AIContentGenerator';
import { BulkPatientEducationGenerator } from '@/components/content/BulkPatientEducationGenerator';
import { HealthcareContentApprovalWorkflow } from '@/components/content/HealthcareContentApprovalWorkflow';
import { HealthcareImageGenerator } from '@/components/media/HealthcareImageGenerator';
import { SmartIntegrationWizard } from '@/components/blog/SmartIntegrationWizard';
import { ArrowLeft, Settings, Wand2, Zap, BookOpen, FileText, Shield, CheckSquare, Camera } from 'lucide-react';

export const CreateContent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { businessProfiles, isLoading } = useBusinessProfile();
  const [showBlogIntegration, setShowBlogIntegration] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [activeContentTab, setActiveContentTab] = useState('individual');

  // Show onboarding if no business profiles exist
  if (!isLoading && (!businessProfiles || businessProfiles.length === 0)) {
    return <BusinessOnboardingDashboard />;
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

  // Get the first business profile for bulk education generator
  const firstBusinessProfile = businessProfiles?.[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Healthcare Content Creation</h1>
            <p className="text-muted-foreground">
              Generate AHPRA-compliant content for Australian healthcare professionals
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              AHPRA Compliant
            </Badge>
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
                Create single pieces of AHPRA-compliant healthcare content for your practice
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
                Create comprehensive healthcare awareness campaigns with bulk patient education content
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {firstBusinessProfile ? (
                <BulkPatientEducationGenerator 
                  practiceId={firstBusinessProfile.id}
                  defaultSpecialty="gp"
                />
              ) : (
                <div className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Practice Profile Required
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Set up your healthcare practice profile to access bulk patient education content generation.
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
              {firstBusinessProfile ? (
                <HealthcareImageGenerator 
                  practiceId={firstBusinessProfile.id}
                  specialty="gp"
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
                    Set up your healthcare practice profile to access the healthcare image generation system.
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
      </Tabs>
    </div>
  );
};