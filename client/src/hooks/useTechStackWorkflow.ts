import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface TechStackConfig {
  id: string;
  practice_type: 'GP' | 'Allied Health' | 'Specialist' | 'Group Practice' | 'Healthcare Network';
  tech_capability: 'Basic' | 'Intermediate' | 'Advanced';
  workflow_type: 'automated' | 'copy_paste' | 'hybrid';
  platform_integrations: string[];
  automation_features: string[];
  manual_instructions: string[];
  estimated_setup_time: number; // minutes
  complexity_score: number; // 1-10
}

interface WorkflowAssignment {
  user_id: string;
  practice_type: string;
  tech_capability: string;
  assigned_workflow: 'automated' | 'copy_paste' | 'hybrid';
  platform_connections: PlatformConnection[];
  workflow_steps: WorkflowStep[];
  estimated_completion: number;
  assigned_at: string;
  completed_at?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

interface PlatformConnection {
  platform: string;
  connection_type: 'oauth' | 'api_key' | 'manual' | 'copy_paste';
  status: 'not_started' | 'connected' | 'failed' | 'manual_required';
  instructions?: string;
  automation_available: boolean;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  type: 'automated' | 'manual' | 'verification';
  platform?: string;
  estimated_duration: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  instructions?: string;
  automation_script?: string;
  fallback_instructions?: string;
}

interface TechCapabilityAssessment {
  has_website: boolean;
  website_platform?: 'WordPress' | 'Wix' | 'Squarespace' | 'Custom' | 'None';
  social_media_experience: 'None' | 'Basic' | 'Intermediate' | 'Advanced';
  current_tools: string[];
  technical_comfort: 'Low' | 'Medium' | 'High';
  staff_count: number;
  dedicated_marketing_person: boolean;
  budget_for_automation: 'Under $100' | '$100-500' | '$500-1000' | 'Over $1000';
}

export const useTechStackWorkflow = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<WorkflowAssignment | null>(null);
  const [availableConfigs, setAvailableConfigs] = useState<TechStackConfig[]>([]);
  const [techAssessment, setTechAssessment] = useState<TechCapabilityAssessment | null>(null);

  // Load available tech stack configurations
  const loadTechStackConfigs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('healthcare_tech_stack_configs')
        .select('*')
        .order('complexity_score');

      if (error) throw error;
      setAvailableConfigs(data || []);
    } catch (error) {
      console.error('Error loading tech stack configs:', error);
    }
  }, []);

  // Assess user's technical capability
  const assessTechCapability = useCallback((assessment: TechCapabilityAssessment): 'Basic' | 'Intermediate' | 'Advanced' => {
    let score = 0;

    // Website sophistication (0-3 points)
    if (assessment.website_platform === 'Custom') score += 3;
    else if (assessment.website_platform === 'WordPress') score += 2;
    else if (assessment.website_platform && assessment.website_platform !== 'None') score += 1;

    // Social media experience (0-3 points)
    if (assessment.social_media_experience === 'Advanced') score += 3;
    else if (assessment.social_media_experience === 'Intermediate') score += 2;
    else if (assessment.social_media_experience === 'Basic') score += 1;

    // Technical comfort (0-3 points)
    if (assessment.technical_comfort === 'High') score += 3;
    else if (assessment.technical_comfort === 'Medium') score += 2;
    else if (assessment.technical_comfort === 'Low') score += 1;

    // Current tools usage (0-2 points)
    score += Math.min(assessment.current_tools.length / 3, 2);

    // Staff and resources (0-2 points)
    if (assessment.dedicated_marketing_person) score += 1;
    if (assessment.staff_count >= 5) score += 1;

    // Budget for automation (0-2 points)
    if (assessment.budget_for_automation === 'Over $1000') score += 2;
    else if (assessment.budget_for_automation === '$500-1000') score += 1.5;
    else if (assessment.budget_for_automation === '$100-500') score += 1;

    // Determine capability level
    if (score >= 12) return 'Advanced';
    if (score >= 7) return 'Intermediate';
    return 'Basic';
  }, []);

  // Assign workflow based on practice type and tech capability
  const assignWorkflow = useCallback(async (
    practiceType: string, 
    assessment: TechCapabilityAssessment
  ): Promise<WorkflowAssignment | null> => {
    setLoading(true);
    try {
      const techCapability = assessTechCapability(assessment);
      
      // Find matching configuration
      const config = availableConfigs.find(
        c => c.practice_type === practiceType && c.tech_capability === techCapability
      ) || availableConfigs.find(
        c => c.practice_type === practiceType && c.tech_capability === 'Basic'
      );

      if (!config) {
        throw new Error('No suitable workflow configuration found');
      }

      // Create platform connections based on config
      const platformConnections: PlatformConnection[] = config.platform_integrations.map(platform => ({
        platform,
        connection_type: determineConnectionType(platform, techCapability),
        status: 'not_started',
        automation_available: config.automation_features.includes(platform),
        instructions: getConnectionInstructions(platform, techCapability)
      }));

      // Create workflow steps
      const workflowSteps: WorkflowStep[] = generateWorkflowSteps(config, platformConnections, assessment);

      const assignment: WorkflowAssignment = {
        user_id: '', // Will be set when saving
        practice_type: practiceType,
        tech_capability: techCapability,
        assigned_workflow: config.workflow_type,
        platform_connections: platformConnections,
        workflow_steps: workflowSteps,
        estimated_completion: config.estimated_setup_time,
        assigned_at: new Date().toISOString(),
        status: 'pending'
      };

      // Save assignment to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        assignment.user_id = user.id;
        
        const { data, error } = await supabase
          .from('healthcare_workflow_assignments')
          .insert(assignment)
          .select()
          .single();

        if (error) throw error;
        
        setCurrentAssignment(data);
        setTechAssessment(assessment);

        // Log workflow assignment
        await supabase
          .from('healthcare_team_audit_log')
          .insert({
            team_id: null,
            performed_by: user.id,
            action: `Tech stack workflow assigned - ${assignment.assigned_workflow}`,
            action_type: 'system',
            details: {
              practice_type: practiceType,
              tech_capability: techCapability,
              workflow_type: assignment.assigned_workflow,
              platform_count: platformConnections.length,
              estimated_time: assignment.estimated_completion
            },
            compliance_impact: false
          });

        toast({
          title: "Workflow Assigned",
          description: `${assignment.assigned_workflow} workflow assigned based on your practice needs and technical capability.`,
        });

        return data;
      }

      return null;
    } catch (error) {
      console.error('Error assigning workflow:', error);
      toast({
        title: "Workflow Assignment Failed",
        description: "Could not assign appropriate workflow. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [availableConfigs, assessTechCapability, toast]);

  // Update workflow step status
  const updateStepStatus = useCallback(async (
    stepId: string, 
    status: WorkflowStep['status'],
    notes?: string
  ) => {
    if (!currentAssignment) return;

    setLoading(true);
    try {
      const updatedSteps = currentAssignment.workflow_steps.map(step => 
        step.id === stepId ? { ...step, status } : step
      );

      const updatedAssignment = {
        ...currentAssignment,
        workflow_steps: updatedSteps,
        status: updatedSteps.every(s => s.status === 'completed') ? 'completed' as const : 'in_progress' as const
      };

      if (updatedAssignment.status === 'completed') {
        updatedAssignment.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('healthcare_workflow_assignments')
        .update(updatedAssignment)
        .eq('id', currentAssignment.user_id)
        .select()
        .single();

      if (error) throw error;
      
      setCurrentAssignment(data);

      // Log step completion
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: null,
          performed_by: currentAssignment.user_id,
          action: `Workflow step ${status} - ${stepId}`,
          action_type: 'workflow',
          details: {
            step_id: stepId,
            status,
            notes,
            workflow_type: currentAssignment.assigned_workflow
          },
          compliance_impact: false
        });

      if (updatedAssignment.status === 'completed') {
        toast({
          title: "Workflow Complete!",
          description: "Your tech stack setup is complete. You can now start creating content.",
        });
      }

    } catch (error) {
      console.error('Error updating step status:', error);
      toast({
        title: "Update Failed",
        description: "Could not update step status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentAssignment, toast]);

  // Execute automated step
  const executeAutomatedStep = useCallback(async (stepId: string) => {
    if (!currentAssignment) return;

    const step = currentAssignment.workflow_steps.find(s => s.id === stepId);
    if (!step || step.type !== 'automated') return;

    setLoading(true);
    try {
      // Call automation edge function
      const response = await supabase.functions.invoke('healthcare-workflow-automation', {
        body: {
          step_id: stepId,
          step_config: step,
          user_id: currentAssignment.user_id,
          practice_type: currentAssignment.practice_type
        }
      });

      if (response.error) throw response.error;

      await updateStepStatus(stepId, 'completed', 'Automated execution successful');

    } catch (error) {
      console.error('Error executing automated step:', error);
      await updateStepStatus(stepId, 'failed', 'Automation failed - manual fallback required');
      
      toast({
        title: "Automation Failed",
        description: "Automated setup failed. Please follow manual instructions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentAssignment, updateStepStatus, toast]);

  // Load current assignment on component mount
  useEffect(() => {
    const loadCurrentAssignment = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data } = await supabase
          .from('healthcare_workflow_assignments')
          .select('*')
          .eq('user_id', user.id)
          .order('assigned_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          setCurrentAssignment(data);
        }
      } catch (error) {
        console.error('Error loading current assignment:', error);
      }
    };

    loadCurrentAssignment();
  }, []);

  // Load configs on component mount
  useEffect(() => {
    loadTechStackConfigs();
  }, [loadTechStackConfigs]);

  return {
    // State
    loading,
    currentAssignment,
    availableConfigs,
    techAssessment,

    // Actions
    assignWorkflow,
    updateStepStatus,
    executeAutomatedStep,
    assessTechCapability,
    loadTechStackConfigs
  };
};

// Helper functions
function determineConnectionType(
  platform: string, 
  techCapability: 'Basic' | 'Intermediate' | 'Advanced'
): PlatformConnection['connection_type'] {
  const platformCapabilities = {
    'Facebook': { oauth: true, api: true },
    'Instagram': { oauth: true, api: true },
    'Google My Business': { oauth: true, api: true },
    'WordPress': { oauth: false, api: true },
    'Mailchimp': { oauth: true, api: true },
    'Canva': { oauth: true, api: false },
    'Hootsuite': { oauth: true, api: true },
    'Buffer': { oauth: true, api: true }
  };

  const caps = platformCapabilities[platform as keyof typeof platformCapabilities];
  
  if (techCapability === 'Advanced' && caps?.oauth) return 'oauth';
  if (techCapability === 'Intermediate' && caps?.api) return 'api_key';
  return 'copy_paste';
}

function getConnectionInstructions(
  platform: string, 
  techCapability: 'Basic' | 'Intermediate' | 'Advanced'
): string {
  const instructions = {
    'Facebook': {
      'Basic': 'We\'ll guide you through copying and pasting your content to Facebook.',
      'Intermediate': 'Connect using your Facebook app credentials for automated posting.',
      'Advanced': 'OAuth integration will allow full automation of your Facebook content.'
    },
    'Instagram': {
      'Basic': 'Manual posting with optimized content suggestions.',
      'Intermediate': 'Instagram Business API integration for scheduled posts.',
      'Advanced': 'Full automation with story posting and engagement tracking.'
    },
    'WordPress': {
      'Basic': 'Copy and paste blog content with formatting preserved.',
      'Intermediate': 'WordPress API integration for automatic blog publishing.',
      'Advanced': 'Full CMS integration with SEO optimization and scheduling.'
    }
  };

  return instructions[platform as keyof typeof instructions]?.[techCapability] || 
         `${techCapability} level integration available for ${platform}`;
}

function generateWorkflowSteps(
  config: TechStackConfig,
  platformConnections: PlatformConnection[],
  assessment: TechCapabilityAssessment
): WorkflowStep[] {
  const steps: WorkflowStep[] = [];

  // Platform connection steps
  platformConnections.forEach((connection, index) => {
    steps.push({
      id: `connect_${connection.platform.toLowerCase().replace(' ', '_')}`,
      title: `Connect ${connection.platform}`,
      description: `Set up ${connection.platform} integration for your practice`,
      type: connection.automation_available ? 'automated' : 'manual',
      platform: connection.platform,
      estimated_duration: connection.automation_available ? 5 : 15,
      status: 'pending',
      instructions: connection.instructions,
      automation_script: connection.automation_available ? `connect_${connection.platform}` : undefined,
      fallback_instructions: `Manual setup instructions for ${connection.platform}`
    });
  });

  // Content setup steps
  if (config.workflow_type !== 'copy_paste') {
    steps.push({
      id: 'content_templates',
      title: 'Set Up Content Templates',
      description: 'Configure healthcare-compliant content templates for your practice',
      type: 'automated',
      estimated_duration: 10,
      status: 'pending',
      automation_script: 'setup_content_templates'
    });

    steps.push({
      id: 'posting_schedule',
      title: 'Configure Posting Schedule',
      description: 'Set up optimal posting times for your patient demographics',
      type: 'automated',
      estimated_duration: 5,
      status: 'pending',
      automation_script: 'setup_posting_schedule'
    });
  }

  // Verification step
  steps.push({
    id: 'verification',
    title: 'Verify Setup',
    description: 'Test all connections and create your first post',
    type: 'verification',
    estimated_duration: 10,
    status: 'pending',
    instructions: 'We\'ll help you create and schedule your first healthcare-compliant post'
  });

  return steps;
} 