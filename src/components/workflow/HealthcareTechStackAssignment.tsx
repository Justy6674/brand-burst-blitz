import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useTechStackWorkflow } from '@/hooks/useTechStackWorkflow';
import { 
  Laptop, 
  Smartphone, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PlayCircle,
  Copy,
  Link,
  Settings,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Zap,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TechStackAssignmentProps {
  practiceType: string;
  onWorkflowComplete?: () => void;
}

export const HealthcareTechStackAssignment: React.FC<TechStackAssignmentProps> = ({
  practiceType,
  onWorkflowComplete
}) => {
  const { toast } = useToast();
  const {
    loading,
    currentAssignment,
    availableConfigs,
    techAssessment,
    assignWorkflow,
    updateStepStatus,
    executeAutomatedStep,
    assessTechCapability
  } = useTechStackWorkflow();

  const [currentTab, setCurrentTab] = useState<'assessment' | 'assignment' | 'progress'>('assessment');
  const [assessmentData, setAssessmentData] = useState({
    has_website: false,
    website_platform: 'None',
    social_media_experience: 'None',
    current_tools: [] as string[],
    technical_comfort: 'Low',
    staff_count: 1,
    dedicated_marketing_person: false,
    budget_for_automation: 'Under $100'
  });

  // Move to assignment tab if we have an existing assignment
  useEffect(() => {
    if (currentAssignment && !techAssessment) {
      setCurrentTab('assignment');
    } else if (currentAssignment) {
      setCurrentTab('progress');
    }
  }, [currentAssignment, techAssessment]);

  const handleAssessmentSubmit = async () => {
    const assessmentWithTypedData = {
      ...assessmentData,
      website_platform: assessmentData.website_platform as "WordPress" | "Wix" | "Squarespace" | "Custom" | "None",
      social_media_experience: assessmentData.social_media_experience as "Basic" | "Intermediate" | "Advanced" | "None",
      technical_comfort: assessmentData.technical_comfort as "Low" | "Medium" | "High",
      budget_for_automation: assessmentData.budget_for_automation as "Under $100" | "$100-500" | "$500-1000" | "Over $1000"
    };
    const assignment = await assignWorkflow(practiceType, assessmentWithTypedData);
    if (assignment) {
      setCurrentTab('progress');
    }
  };

  const handleToolToggle = (tool: string) => {
    setAssessmentData(prev => ({
      ...prev,
      current_tools: prev.current_tools.includes(tool)
        ? prev.current_tools.filter(t => t !== tool)
        : [...prev.current_tools, tool]
    }));
  };

  const getWorkflowTypeIcon = (type: string) => {
    switch (type) {
      case 'automated': return <Zap className="h-4 w-4 text-green-600" />;
      case 'copy_paste': return <Copy className="h-4 w-4 text-blue-600" />;
      case 'hybrid': return <Settings className="h-4 w-4 text-purple-600" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const calculateProgress = () => {
    if (!currentAssignment) return 0;
    const completedSteps = currentAssignment.workflow_steps.filter(s => s.status === 'completed').length;
    return (completedSteps / currentAssignment.workflow_steps.length) * 100;
  };

  const availableTools = [
    'Facebook Business Manager',
    'Instagram Business',
    'Google My Business',
    'WordPress',
    'Mailchimp',
    'Canva',
    'Hootsuite',
    'Buffer',
    'LinkedIn',
    'Practice Management Software',
    'Email Marketing Platform',
    'Analytics Tools'
  ];

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading tech stack workflow...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5" />
            Tech Stack Setup for {practiceType}
          </CardTitle>
          <CardDescription>
            We'll assess your technical capabilities and assign the most appropriate workflow for your practice
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={currentTab} onValueChange={setCurrentTab as any}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment">Technical Assessment</TabsTrigger>
          <TabsTrigger value="assignment" disabled={!currentAssignment}>Workflow Assignment</TabsTrigger>
          <TabsTrigger value="progress" disabled={!currentAssignment}>Setup Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Capability Assessment</CardTitle>
              <CardDescription>
                Help us understand your current technical setup and comfort level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Website Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="has-website"
                    checked={assessmentData.has_website}
                    onCheckedChange={(checked) => 
                      setAssessmentData(prev => ({ ...prev, has_website: checked as boolean }))
                    }
                  />
                  <Label htmlFor="has-website">My practice has a website</Label>
                </div>

                {assessmentData.has_website && (
                  <div className="space-y-2">
                    <Label>Website Platform:</Label>
                    <Select 
                      value={assessmentData.website_platform} 
                      onValueChange={(value) => 
                        setAssessmentData(prev => ({ ...prev, website_platform: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WordPress">WordPress</SelectItem>
                        <SelectItem value="Wix">Wix</SelectItem>
                        <SelectItem value="Squarespace">Squarespace</SelectItem>
                        <SelectItem value="Custom">Custom/Developer Built</SelectItem>
                        <SelectItem value="None">None/Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              {/* Social Media Experience */}
              <div className="space-y-2">
                <Label>Social Media Experience:</Label>
                <Select 
                  value={assessmentData.social_media_experience} 
                  onValueChange={(value) => 
                    setAssessmentData(prev => ({ ...prev, social_media_experience: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">No experience</SelectItem>
                    <SelectItem value="Basic">Basic (personal use only)</SelectItem>
                    <SelectItem value="Intermediate">Intermediate (some business use)</SelectItem>
                    <SelectItem value="Advanced">Advanced (regular business marketing)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Technical Comfort */}
              <div className="space-y-2">
                <Label>Technical Comfort Level:</Label>
                <Select 
                  value={assessmentData.technical_comfort} 
                  onValueChange={(value) => 
                    setAssessmentData(prev => ({ ...prev, technical_comfort: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low - Prefer simple, manual processes</SelectItem>
                    <SelectItem value="Medium">Medium - Comfortable with basic tech tools</SelectItem>
                    <SelectItem value="High">High - Enjoy learning new technologies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Current Tools */}
              <div className="space-y-4">
                <Label>Current Marketing Tools (select all that apply):</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableTools.map(tool => (
                    <div key={tool} className="flex items-center space-x-2">
                      <Checkbox 
                        id={tool}
                        checked={assessmentData.current_tools.includes(tool)}
                        onCheckedChange={() => handleToolToggle(tool)}
                      />
                      <Label htmlFor={tool} className="text-sm">{tool}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Practice Resources */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-count">Number of Staff Members:</Label>
                  <Input
                    id="staff-count"
                    type="number"
                    min="1"
                    value={assessmentData.staff_count}
                    onChange={(e) => 
                      setAssessmentData(prev => ({ ...prev, staff_count: parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Budget for Automation:</Label>
                  <Select 
                    value={assessmentData.budget_for_automation} 
                    onValueChange={(value) => 
                      setAssessmentData(prev => ({ ...prev, budget_for_automation: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under $100">Under $100/month</SelectItem>
                      <SelectItem value="$100-500">$100-500/month</SelectItem>
                      <SelectItem value="$500-1000">$500-1000/month</SelectItem>
                      <SelectItem value="Over $1000">Over $1000/month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="marketing-person"
                  checked={assessmentData.dedicated_marketing_person}
                  onCheckedChange={(checked) => 
                    setAssessmentData(prev => ({ ...prev, dedicated_marketing_person: checked as boolean }))
                  }
                />
                <Label htmlFor="marketing-person">We have a dedicated marketing person</Label>
              </div>

              <Button 
                onClick={handleAssessmentSubmit}
                disabled={loading}
                className="w-full"
              >
                <Target className="h-4 w-4 mr-2" />
                Assign My Workflow
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignment" className="space-y-6">
          {currentAssignment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getWorkflowTypeIcon(currentAssignment.assigned_workflow)}
                  {currentAssignment.assigned_workflow.charAt(0).toUpperCase() + currentAssignment.assigned_workflow.slice(1)} Workflow Assigned
                </CardTitle>
                <CardDescription>
                  Based on your technical capability ({currentAssignment.tech_capability}), we've assigned the most suitable workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Workflow Summary */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-medium">Estimated Time</h3>
                    <p className="text-2xl font-bold text-blue-600">{currentAssignment.estimated_completion}min</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Link className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-medium">Platforms</h3>
                    <p className="text-2xl font-bold text-green-600">{currentAssignment.platform_connections.length}</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-medium">Setup Steps</h3>
                    <p className="text-2xl font-bold text-purple-600">{currentAssignment.workflow_steps.length}</p>
                  </div>
                </div>

                {/* Platform Connections */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Platform Connections</h3>
                  <div className="grid gap-3">
                    {currentAssignment.platform_connections.map((connection, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium">{connection.platform}</p>
                            <p className="text-sm text-gray-600">{connection.instructions}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={connection.automation_available ? "default" : "secondary"}>
                            {connection.connection_type}
                          </Badge>
                          {connection.automation_available && (
                            <Badge variant="outline" className="text-green-700 border-green-200">
                              <Zap className="h-3 w-3 mr-1" />
                              Automated
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Type Description */}
                <Alert>
                  {currentAssignment.assigned_workflow === 'automated' && (
                    <>
                      <Zap className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Automated Workflow:</strong> Most connections will be set up automatically through 
                        OAuth integrations. You'll primarily need to approve connections and provide minimal configuration.
                      </AlertDescription>
                    </>
                  )}
                  {currentAssignment.assigned_workflow === 'copy_paste' && (
                    <>
                      <Copy className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Copy-Paste Workflow:</strong> We'll provide you with optimized content and step-by-step 
                        instructions for manual posting. Perfect for maintaining full control over your content.
                      </AlertDescription>
                    </>
                  )}
                  {currentAssignment.assigned_workflow === 'hybrid' && (
                    <>
                      <Settings className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Hybrid Workflow:</strong> Some platforms will be automated while others will use 
                        manual processes. This gives you the best of both worlds based on your comfort level.
                      </AlertDescription>
                    </>
                  )}
                </Alert>

                <Button 
                  onClick={() => setCurrentTab('progress')}
                  className="w-full"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Setup Process
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {currentAssignment && (
            <>
              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Setup Progress</span>
                    <Badge variant={currentAssignment.status === 'completed' ? "default" : "secondary"}>
                      {currentAssignment.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {currentAssignment.status === 'completed' 
                      ? 'Your tech stack setup is complete!'
                      : `${Math.round(calculateProgress())}% complete`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={calculateProgress()} className="w-full" />
                </CardContent>
              </Card>

              {/* Workflow Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Setup Steps</CardTitle>
                  <CardDescription>
                    Follow these steps to complete your tech stack setup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentAssignment.workflow_steps.map((step, index) => (
                    <div key={step.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getStepStatusIcon(step.status)}
                          <div>
                            <h3 className="font-medium">{step.title}</h3>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {step.estimated_duration}min
                          </Badge>
                          {step.type === 'automated' && (
                            <Badge variant="outline" className="text-green-700 border-green-200">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto
                            </Badge>
                          )}
                        </div>
                      </div>

                      {step.instructions && (
                        <p className="text-sm text-gray-600 mb-3">{step.instructions}</p>
                      )}

                      <div className="flex gap-2">
                        {step.status === 'pending' && step.type === 'automated' && (
                          <Button
                            size="sm"
                            onClick={() => executeAutomatedStep(step.id)}
                            disabled={loading}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Auto Setup
                          </Button>
                        )}
                        
                        {step.status === 'pending' && step.type === 'manual' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStepStatus(step.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                        )}

                        {step.status === 'failed' && step.fallback_instructions && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStepStatus(step.id, 'in_progress')}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Manual Setup
                          </Button>
                        )}

                        {step.status === 'completed' && (
                          <Badge variant="outline" className="text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>

                      {step.status === 'failed' && step.fallback_instructions && (
                        <Alert className="mt-3 border-amber-200 bg-amber-50">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-amber-800">
                            <strong>Manual Setup Required:</strong> {step.fallback_instructions}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {currentAssignment.status === 'completed' && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-green-800 mb-2">
                        Tech Stack Setup Complete!
                      </h3>
                      <p className="text-green-700 mb-4">
                        Your {practiceType} practice is now ready to start creating and sharing content 
                        across all connected platforms.
                      </p>
                      <Button onClick={onWorkflowComplete}>
                        <Target className="h-4 w-4 mr-2" />
                        Start Creating Content
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}; 