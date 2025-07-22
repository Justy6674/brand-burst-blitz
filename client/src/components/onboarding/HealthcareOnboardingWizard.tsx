import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useHealthcareAuth } from '@/hooks/useHealthcareAuth';
import { 
  Shield, CheckCircle, ChevronRight, ChevronLeft, Users, 
  FileText, Settings, Zap, AlertTriangle, Award, Book, Monitor 
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  required: boolean;
}

interface HealthcareOnboardingWizardProps {
  onComplete: () => void;
}

export const HealthcareOnboardingWizard: React.FC<HealthcareOnboardingWizardProps> = ({ onComplete }) => {
  const { user, completeComplianceTraining } = useHealthcareAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Healthcare Platform',
      description: 'Learn about AHPRA compliance and platform features',
      icon: Shield,
      completed: false,
      required: true
    },
    {
      id: 'compliance',
      title: 'AHPRA Compliance Training',
      description: 'Complete mandatory compliance training for Australian healthcare advertising',
      icon: Award,
      completed: false,
      required: true
    },
    {
      id: 'practice-setup',
      title: 'Practice Configuration',
      description: 'Configure your practice details and specialty-specific settings',
      icon: Settings,
      completed: false,
      required: true
    },
    {
      id: 'content-strategy',
      title: 'Content Strategy Setup',
      description: 'Define your content goals and patient communication approach',
      icon: FileText,
      completed: false,
      required: true
    },
    {
      id: 'tech-integration',
      title: 'Technology Integration',
      description: 'Connect your practice management software and website',
      icon: Monitor,
      completed: false,
      required: false
    },
    {
      id: 'complete',
      title: 'Platform Ready',
      description: 'Start creating AHPRA-compliant content for your practice',
      icon: CheckCircle,
      completed: false,
      required: true
    }
  ];

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const renderWelcomeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Australia's First Healthcare Content Platform
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          JBSAAS is specifically designed for Australian healthcare professionals. 
          Every feature follows AHPRA advertising guidelines and TGA therapeutic advertising requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 mb-2">AHPRA Compliant</h3>
            <p className="text-sm text-green-700">
              Every piece of content automatically follows AHPRA advertising guidelines
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-800 mb-2">TGA Validated</h3>
            <p className="text-sm text-blue-700">
              Built-in validation prevents prohibited therapeutic claims and drug names
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-800 mb-2">Healthcare Specific</h3>
            <p className="text-sm text-purple-700">
              Designed exclusively for {user?.profession_type.replace('_', ' ')} professionals
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Your Practice Details:</strong> {user?.practice_name} • {user?.profession_type.replace('_', ' ').toUpperCase()} • AHPRA: {user?.ahpra_registration}
        </AlertDescription>
      </Alert>

      <div className="text-center">
        <Button 
          onClick={() => markStepComplete('welcome')}
          size="lg"
          className="px-8"
        >
          Get Started
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderComplianceTraining = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Award className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AHPRA Compliance Training
        </h2>
        <p className="text-gray-600">
          Complete this mandatory training to understand Australian healthcare advertising regulations
        </p>
      </div>

      <div className="space-y-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              AHPRA Advertising Guidelines - What's Prohibited
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-red-700 mb-2">❌ Never Allow:</h4>
                <ul className="text-sm space-y-1 text-red-600">
                  <li>• Patient testimonials or reviews</li>
                  <li>• "Best doctor" or superiority claims</li>
                  <li>• Finance offers without terms</li>
                  <li>• Misleading before/after photos</li>
                  <li>• Guarantees of treatment outcomes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2">🚫 TGA Prohibited:</h4>
                <ul className="text-sm space-y-1 text-red-600">
                  <li>• Drug brand names (Botox, Juvederm)</li>
                  <li>• "Miracle cure" therapeutic claims</li>
                  <li>• Unproven medical device benefits</li>
                  <li>• "Totally safe" treatment claims</li>
                  <li>• Generic drug ingredient names</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              What This Platform Does For You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">✅ Automatic Compliance:</h4>
                <ul className="text-sm space-y-1 text-green-600">
                  <li>• Detects and blocks patient testimonials</li>
                  <li>• Prevents prohibited drug name usage</li>
                  <li>• Enforces professional boundaries</li>
                  <li>• Includes required disclaimers</li>
                  <li>• Validates AHPRA registration display</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-700 mb-2">🛡️ Protection Features:</h4>
                <ul className="text-sm space-y-1 text-green-600">
                  <li>• Real-time compliance scoring</li>
                  <li>• Violation detection with suggestions</li>
                  <li>• Professional indemnity protection</li>
                  <li>• Evidence-based language enforcement</li>
                  <li>• Cultural safety considerations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="border-orange-200 bg-orange-50">
          <Book className="h-4 w-4" />
          <AlertDescription>
            <strong>Your Responsibility:</strong> While this platform provides automatic compliance checking, 
            you remain responsible for reviewing all content before publication. Healthcare professionals 
            must ensure all communications meet their professional standards and regulatory requirements.
          </AlertDescription>
        </Alert>
      </div>

      <div className="text-center">
        <Button 
          onClick={async () => {
            await completeComplianceTraining();
            markStepComplete('compliance');
          }}
          size="lg"
          className="px-8"
        >
          Complete Training & Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderPracticeSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Practice Configuration
        </h2>
        <p className="text-gray-600">
          Customize settings specific to your {user?.profession_type.replace('_', ' ')} practice
        </p>
      </div>

      {/* Specialty-Specific Settings */}
      {user?.profession_type === 'medical' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Medical Practice Specific Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">✅ Enabled for Medical Practitioners:</h4>
                <ul className="text-sm space-y-1">
                  <li>• General health advice content</li>
                  <li>• Preventive care messaging</li>
                  <li>• Practice service descriptions</li>
                  <li>• Patient education materials</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">⚠️ Special Considerations:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Specialist referral protocols</li>
                  <li>• Medical procedure disclaimers</li>
                  <li>• Diagnostic service limitations</li>
                  <li>• Emergency care directives</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user?.profession_type === 'psychology' && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-800">Psychology Practice Specific Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">✅ Enabled for Psychologists:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Mental health awareness content</li>
                  <li>• Therapy approach descriptions</li>
                  <li>• Self-care and wellbeing tips</li>
                  <li>• Treatment modality explanations</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">⚠️ Psychology-Specific Compliance:</h4>
                <ul className="text-sm space-y-1">
                  <li>• No diagnostic claims in content</li>
                  <li>• Crisis support information required</li>
                  <li>• Confidentiality reminders</li>
                  <li>• Professional relationship boundaries</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user?.profession_type === 'physiotherapy' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Physiotherapy Practice Specific Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">✅ Enabled for Physiotherapists:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Exercise and movement content</li>
                  <li>• Injury prevention education</li>
                  <li>• Treatment technique descriptions</li>
                  <li>• Rehabilitation goal setting</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">⚠️ Physiotherapy Compliance:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Individual assessment requirements</li>
                  <li>• Exercise safety disclaimers</li>
                  <li>• Scope of practice limitations</li>
                  <li>• Medical referral guidelines</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button 
          onClick={() => markStepComplete('practice-setup')}
          size="lg"
          className="px-8"
        >
          Save Practice Settings
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderContentStrategy = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Content Strategy Setup
        </h2>
        <p className="text-gray-600">
          Define your healthcare content goals and patient communication approach
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors">
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-800 mb-2">Patient Education</h3>
            <p className="text-sm text-blue-700">
              Focus on educating patients about health conditions, treatments, and prevention
            </p>
            <Badge variant="outline" className="mt-3">Primary Goal</Badge>
          </CardContent>
        </Card>

        <Card className="border-green-200 hover:bg-green-50 cursor-pointer transition-colors">
          <CardContent className="pt-6 text-center">
            <Zap className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 mb-2">Practice Marketing</h3>
            <p className="text-sm text-green-700">
              Promote your practice services and build your professional reputation
            </p>
            <Badge variant="outline" className="mt-3">Secondary Goal</Badge>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:bg-purple-50 cursor-pointer transition-colors">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-800 mb-2">Professional Network</h3>
            <p className="text-sm text-purple-700">
              Share insights with colleagues and build referral relationships
            </p>
            <Badge variant="outline" className="mt-3">Tertiary Goal</Badge>
          </CardContent>
        </Card>
      </div>

      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Content Strategy Configured:</strong> Your content will be optimized for patient education 
          with AHPRA-compliant practice marketing and professional networking opportunities.
        </AlertDescription>
      </Alert>

      <div className="text-center">
        <Button 
          onClick={() => markStepComplete('content-strategy')}
          size="lg"
          className="px-8"
        >
          Set Content Strategy
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <CheckCircle className="h-24 w-24 text-green-600 mx-auto" />
      <h2 className="text-3xl font-bold text-gray-900">
        🎉 Healthcare Platform Ready!
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Congratulations! Your healthcare practice is now set up with full AHPRA compliance. 
        You can start creating patient education materials and practice marketing content.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">AHPRA Compliant</h3>
            <p className="text-xs text-green-600">All content follows advertising guidelines</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">TGA Validated</h3>
            <p className="text-xs text-blue-600">Therapeutic claims automatically checked</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-4">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800">Training Complete</h3>
            <p className="text-xs text-purple-600">Compliance training certified</p>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={() => {
          markStepComplete('complete');
          onComplete();
        }}
        size="lg"
        className="px-12 py-3 text-lg"
      >
        Start Creating Healthcare Content
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (steps[currentStep].id) {
      case 'welcome': return renderWelcomeStep();
      case 'compliance': return renderComplianceTraining();
      case 'practice-setup': return renderPracticeSetup();
      case 'content-strategy': return renderContentStrategy();
      case 'tech-integration': return renderContentStrategy(); // Skip for now
      case 'complete': return renderComplete();
      default: return renderWelcomeStep();
    }
  };

  const canProceed = completedSteps.has(steps[currentStep].id);
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Healthcare Practice Setup</h1>
          <Badge variant="outline">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mb-4" />
        
        {/* Step Navigation */}
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = completedSteps.has(step.id);
            
            return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isCompleted ? 'bg-green-100 text-green-700' :
                  isActive ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-2 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isActive ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-300 mx-2 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="mb-6">
        <CardContent className="p-8">
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        {currentStep < steps.length - 1 && (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed}
          >
            Next Step
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}; 