import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Zap, Globe, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { blogService } from '@/services/blogService';

interface SimpleBlogSetupProps {
  businessId: string;
  onSetupComplete?: (config: any) => void;
}

export const SimpleBlogSetup: React.FC<SimpleBlogSetupProps> = ({ 
  businessId, 
  onSetupComplete 
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const [config, setConfig] = useState({
    blogTitle: '',
    blogDescription: '',
    primaryColor: '#3b82f6',
    website: '',
    platform: '',
    integrationMethod: 'embed'
  });

  const steps = [
    {
      id: 'basics',
      title: 'Blog Basics',
      description: 'Set up your blog title and description',
      icon: Globe,
      component: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blogTitle">Blog Title</Label>
            <Input
              id="blogTitle"
              value={config.blogTitle}
              onChange={(e) => setConfig(prev => ({ ...prev, blogTitle: e.target.value }))}
              placeholder="My Business Blog"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blogDescription">Blog Description</Label>
            <Textarea
              id="blogDescription"
              value={config.blogDescription}
              onChange={(e) => setConfig(prev => ({ ...prev, blogDescription: e.target.value }))}
              placeholder="Share insights, tips, and updates from our business..."
              rows={3}
            />
          </div>
        </div>
      )
    },
    {
      id: 'styling',
      title: 'Styling',
      description: 'Choose your blog appearance',
      icon: Palette,
      component: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                id="primaryColor"
                value={config.primaryColor}
                onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-20 h-10"
              />
              <Input
                value={config.primaryColor}
                onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
          <div className="p-4 border rounded-lg" style={{ borderColor: config.primaryColor }}>
            <h3 className="font-medium" style={{ color: config.primaryColor }}>
              {config.blogTitle || 'Sample Blog Title'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {config.blogDescription || 'This is how your blog will look with the selected color.'}
            </p>
            <div className="mt-2">
              <Button size="sm" style={{ backgroundColor: config.primaryColor }}>
                Sample Button
              </Button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'integration',
      title: 'Integration',
      description: 'Choose how to add the blog to your website',
      icon: Zap,
      component: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Your Website URL (Optional)</Label>
            <Input
              id="website"
              value={config.website}
              onChange={(e) => setConfig(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://yourbusiness.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Platform</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['WordPress', 'Shopify', 'Squarespace', 'Wix', 'Custom', 'Not Sure'].map((platform) => (
                <Button
                  key={platform}
                  variant={config.platform === platform ? 'default' : 'outline'}
                  onClick={() => setConfig(prev => ({ ...prev, platform }))}
                  className="text-sm"
                >
                  {platform}
                </Button>
              ))}
            </div>
          </div>
          {config.platform && config.platform !== 'Not Sure' && (
            <div className="space-y-2">
              <Label>Integration Method</Label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={config.integrationMethod === 'embed' ? 'default' : 'outline'}
                  onClick={() => setConfig(prev => ({ ...prev, integrationMethod: 'embed' }))}
                  className="justify-start"
                >
                  <span className="font-medium">Embed Widget</span>
                  <span className="text-sm text-muted-foreground ml-2">- Easy, copy & paste</span>
                </Button>
                <Button
                  variant={config.integrationMethod === 'api' ? 'default' : 'outline'}
                  onClick={() => setConfig(prev => ({ ...prev, integrationMethod: 'api' }))}
                  className="justify-start"
                >
                  <span className="font-medium">API Integration</span>
                  <span className="text-sm text-muted-foreground ml-2">- Advanced, custom control</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeSetup();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeSetup = async () => {
    setIsCompleting(true);
    try {
      // Save blog customization
      await blogService.updateBlogCustomization(businessId, {
        layout_style: 'cards',
        color_scheme: {
          primary: config.primaryColor,
          background: '#ffffff',
          text: '#1e293b'
        },
        typography: {
          font_family: 'Inter, sans-serif',
          heading_size: '1.5rem',
          body_size: '1rem',
          line_height: '1.6'
        },
        branding: {
          logo_position: 'header',
          show_powered_by: true
        },
        post_display: {
          show_date: true,
          show_tags: true,
          show_author: true,
          show_excerpt: true,
          excerpt_length: 150,
          posts_per_page: 9
        },
        seo_settings: {
          meta_title_template: `{title} | ${config.blogTitle}`,
          meta_description_template: '{excerpt}'
        },
        image_settings: {
          position: 'top',
          auto_logo: false,
          aspect_ratio: '16:9',
          overlay_text: false
        }
      });

      toast({
        title: "Blog Setup Complete!",
        description: "Your blog has been configured successfully."
      });

      onSetupComplete?.(config);
    } catch (error) {
      console.error('Error completing setup:', error);
      toast({
        title: "Setup Error",
        description: "There was an issue completing the setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basics
        return config.blogTitle.trim().length > 0;
      case 1: // Styling
        return config.primaryColor.length > 0;
      case 2: // Integration
        return true; // Integration is optional
      default:
        return true;
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Simple Blog Setup</h2>
        <p className="text-muted-foreground">
          Get your blog up and running in just a few steps
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : isCurrent 
                    ? 'border-primary text-primary' 
                    : 'border-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <currentStepData.icon className="h-5 w-5" />
            {currentStepData.title}
          </CardTitle>
          <CardDescription>
            {currentStepData.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStepData.component}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button
          onClick={nextStep}
          disabled={!canProceed() || isCompleting}
        >
          {currentStep === steps.length - 1 
            ? (isCompleting ? 'Completing...' : 'Complete Setup')
            : 'Next'
          }
        </Button>
      </div>
    </div>
  );
};