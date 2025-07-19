import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { BusinessOnboardingDashboard } from '@/components/onboarding/BusinessOnboardingDashboard';
import { AIContentGenerator } from '@/components/content/AIContentGenerator';
import { SmartIntegrationWizard } from '@/components/blog/SmartIntegrationWizard';
import { ArrowLeft, Settings } from 'lucide-react';

export const CreateContent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { businessProfiles, isLoading } = useBusinessProfile();
  const [showBlogIntegration, setShowBlogIntegration] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Content</h1>
            <p className="text-muted-foreground">
              Generate engaging content using AI-powered tools
            </p>
          </div>
          
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
      
      <AIContentGenerator onContentGenerated={handleContentGenerated} />
    </div>
  );
};