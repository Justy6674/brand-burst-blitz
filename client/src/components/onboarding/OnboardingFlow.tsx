import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronRight, User, Building, Target, Wand2, Rocket } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
  completed: boolean;
  route?: string;
}

export const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { profile } = useBusinessProfile();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);

  // Determine completion status based on profile data
  const hasCompletedProfile = !!(profile && profile.business_name);
  const hasCompletedQuestionnaire = !!(profile && profile.industry && profile.industry !== 'general');

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Business Profile',
      description: 'Set up your business information and branding',
      icon: Building,
      required: true,
      completed: hasCompletedProfile,
      route: '/business-settings'
    },
    {
      id: 'questionnaire',
      title: 'Business Analysis',
      description: 'Complete our AI-powered business questionnaire',
      icon: Target,
      required: true,
      completed: hasCompletedQuestionnaire,
      route: '/questionnaire'
    },
    {
      id: 'content',
      title: 'First Content',
      description: 'Generate your first piece of AI content',
      icon: Wand2,
      required: false,
      completed: false,
      route: '/create-content'
    },
    {
      id: 'social',
      title: 'Social Setup',
      description: 'Connect your social media accounts (Optional)',
      icon: User,
      required: false,
      completed: false,
      route: '/social-media'
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;
  const requiredStepsCompleted = steps.filter(step => step.required && step.completed).length;
  const totalRequiredSteps = steps.filter(step => step.required).length;

  const handleStepClick = (step: OnboardingStep, index: number) => {
    if (step.route) {
      navigate(step.route);
    } else {
      toast({
        title: "Coming Soon",
        description: "This feature will be available shortly.",
      });
    }
  };

  const handleCompleteOnboarding = () => {
    if (requiredStepsCompleted === totalRequiredSteps) {
      toast({
        title: "Welcome to JB-SaaS!",
        description: "Your onboarding is complete. Start creating amazing content!",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Please complete required steps",
        description: `Complete ${totalRequiredSteps - requiredStepsCompleted} more required steps to finish setup.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome to JB-SaaS</h1>
        <p className="text-lg text-muted-foreground">
          Let's get your AI-powered content creation platform set up in just a few steps
        </p>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Setup Progress</span>
            <span>{completedSteps}/{totalSteps} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Steps */}
      <div className="grid gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = step.completed;
          const isCurrent = index === currentStep && !isCompleted;

          return (
            <Card
              key={step.id}
              className={`cursor-pointer transition-all duration-200 ${
                isCurrent
                  ? 'ring-2 ring-primary shadow-lg'
                  : isCompleted
                  ? 'bg-muted/50 border-green-200'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleStepClick(step, index)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  {/* Step Icon/Status */}
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full ${
                      isCompleted
                        ? 'bg-green-100 text-green-600'
                        : isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      {step.required && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                          Required
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
        >
          Skip for now
        </Button>
        
        {requiredStepsCompleted === totalRequiredSteps ? (
          <Button
            onClick={handleCompleteOnboarding}
            className="bg-green-600 hover:bg-green-700"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Start Creating Content
          </Button>
        ) : (
          <Button
            onClick={() => {
              const nextIncompleteStep = steps.find(step => step.required && !step.completed);
              if (nextIncompleteStep) {
                handleStepClick(nextIncompleteStep, steps.indexOf(nextIncompleteStep));
              }
            }}
          >
            Continue Setup
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Help Section */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
          <CardDescription>
            Our setup process is designed to be quick and easy. Each step will help personalize your AI content generation experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">What you'll get:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Personalized AI content generation</li>
                <li>• Industry-specific templates</li>
                <li>• Automated social media publishing</li>
                <li>• Advanced analytics and insights</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Estimated time:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Business Profile: 2 minutes</li>
                <li>• Business Analysis: 5 minutes</li>
                <li>• First Content: 1 minute</li>
                <li>• Social Setup: 3 minutes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};