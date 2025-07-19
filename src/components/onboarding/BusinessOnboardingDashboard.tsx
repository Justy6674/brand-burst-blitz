import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { BusinessSetupWizard } from '@/components/onboarding/BusinessSetupWizard';
import { BlogIntegrationWizard } from '@/components/blog/BlogIntegrationWizard';
import { 
  Building2, 
  Globe, 
  Zap, 
  Code, 
  Rss, 
  Monitor,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const BusinessOnboardingDashboard = () => {
  const { businessProfiles, isLoading } = useBusinessProfile();
  const navigate = useNavigate();
  const [showSetupWizard, setShowSetupWizard] = React.useState(false);
  const [showBlogIntegration, setShowBlogIntegration] = React.useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>('');

  // Show setup wizard if no business profiles exist
  React.useEffect(() => {
    if (!isLoading && (!businessProfiles || businessProfiles.length === 0)) {
      setShowSetupWizard(true);
    }
  }, [businessProfiles, isLoading]);

  if (showSetupWizard) {
    return (
      <BusinessSetupWizard 
        onComplete={() => {
          setShowSetupWizard(false);
          navigate('/dashboard');
        }}
      />
    );
  }

  if (showBlogIntegration && selectedBusinessId) {
    const selectedBusiness = businessProfiles?.find(p => p.id === selectedBusinessId);
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BlogIntegrationWizard
          businessId={selectedBusinessId}
          businessName={selectedBusiness?.business_name || 'Business'}
          onComplete={() => {
            setShowBlogIntegration(false);
            navigate('/dashboard');
          }}
        />
      </div>
    );
  }

  const onboardingSteps = [
    {
      id: 'business-profile',
      title: 'Business Profile Setup',
      description: 'Create and configure your business profiles',
      icon: Building2,
      status: businessProfiles?.length ? 'completed' : 'pending',
      action: () => setShowSetupWizard(true),
      needsBusinessId: false
    },
    {
      id: 'blog-integration',
      title: 'Blog Integration',
      description: 'Connect your websites and publishing platforms',
      icon: Globe,
      status: 'pending', // TODO: Check if integrations exist
      action: (businessId?: string) => {
        if (businessId) {
          setSelectedBusinessId(businessId);
          setShowBlogIntegration(true);
        }
      },
      needsBusinessId: true
    },
    {
      id: 'content-automation',
      title: 'Content Automation',
      description: 'Set up automated content publishing',
      icon: Zap,
      status: 'pending',
      action: () => navigate('/dashboard/publishing'),
      needsBusinessId: false
    },
    {
      id: 'api-setup',
      title: 'API Integration',
      description: 'Configure API access for external tools',
      icon: Code,
      status: 'pending',
      action: () => navigate('/dashboard/api'),
      needsBusinessId: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to JBSAAS!</h1>
        <p className="text-xl text-muted-foreground">
          Let's get your business set up for automated content publishing and blog management
        </p>
      </div>

      {/* Business Profiles Overview */}
      {businessProfiles?.length && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Your Business Profiles ({businessProfiles.length})
            </CardTitle>
            <CardDescription>
              Manage multiple businesses and their content publishing settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {businessProfiles.map((profile) => (
                <Card key={profile.id} className="relative">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{profile.business_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {profile.industry?.replace('_', ' ') || 'General Business'}
                          </p>
                        </div>
                        {profile.is_primary && (
                          <Badge variant="secondary" className="text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                      
                      {profile.website_url && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="w-4 h-4" />
                          <span className="truncate">
                            {profile.website_url.replace(/^https?:\/\//, '')}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedBusinessId(profile.id);
                            setShowBlogIntegration(true);
                          }}
                        >
                          Setup Blog Integration
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/dashboard/business/${profile.id}`)}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Checklist</CardTitle>
          <CardDescription>
            Complete these steps to unlock the full power of JBSAAS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onboardingSteps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                      <span className="text-sm">{index + 1}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                
                <div className="flex-shrink-0">
                  {step.needsBusinessId && businessProfiles?.length ? (
                    <div className="space-y-2">
                      {businessProfiles.map((profile) => (
                        <Button
                          key={profile.id}
                          size="sm"
                          onClick={() => step.action(profile.id)}
                          disabled={step.status === 'completed'}
                        >
                          Setup {profile.business_name}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => step.action()}
                      disabled={step.status === 'completed'}
                    >
                      {step.status === 'completed' ? 'Completed' : 'Setup'}
                      {step.status !== 'completed' && (
                        <ArrowRight className="w-4 h-4 ml-2" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/dashboard/create')}>
          <CardContent className="p-6 text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Create Content</h3>
            <p className="text-sm text-muted-foreground">Generate AI-powered blog posts and social content</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/dashboard/analytics')}>
          <CardContent className="p-6 text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Monitor className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">View Analytics</h3>
            <p className="text-sm text-muted-foreground">Track performance across all platforms</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/dashboard/calendar')}>
          <CardContent className="p-6 text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Rss className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Content Calendar</h3>
            <p className="text-sm text-muted-foreground">Schedule and manage your content pipeline</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};