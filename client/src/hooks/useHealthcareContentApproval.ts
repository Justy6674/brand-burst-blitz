import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface ContentApprovalItem {
  id: string;
  content_id: string;
  content_type: 'social_post' | 'blog_article' | 'patient_education' | 'practice_update' | 'marketing_material';
  content_title: string;
  content_text: string;
  content_platform: string[];
  created_by: string;
  created_by_name: string;
  created_by_role: 'practitioner' | 'admin' | 'content_creator' | 'marketing_team';
  practice_id: string;
  practice_name: string;
  specialty: string;
  target_audience: 'patients' | 'professionals' | 'community' | 'staff';
  scheduled_publish_date?: string;
  
  // Approval workflow
  approval_status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_changes' | 'published';
  approval_level: 'junior_review' | 'senior_review' | 'manager_approval' | 'final_approval';
  assigned_reviewer_id?: string;
  assigned_reviewer_name?: string;
  reviewer_role: 'practice_manager' | 'senior_practitioner' | 'compliance_officer' | 'marketing_manager';
  
  // Review details
  review_notes?: string;
  compliance_score: number;
  ahpra_compliant: boolean;
  tga_compliant: boolean;
  professional_boundaries_checked: boolean;
  cultural_safety_verified: boolean;
  
  // Timestamps
  submitted_at: string;
  review_started_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  published_at?: string;
  
  // Escalation
  escalation_required: boolean;
  escalation_reason?: string;
  escalated_to?: string;
  
  // Version control
  version: number;
  previous_versions?: string[];
  change_summary?: string;
}

interface ApprovalWorkflowSettings {
  practice_id: string;
  require_manager_approval: boolean;
  require_senior_review: boolean;
  auto_approve_experienced_staff: boolean;
  auto_approve_threshold_score: number;
  escalation_triggers: string[];
  notification_settings: {
    email_notifications: boolean;
    slack_notifications: boolean;
    sms_notifications: boolean;
  };
  approval_deadlines: {
    junior_review_hours: number;
    senior_review_hours: number;
    manager_approval_hours: number;
  };
}

interface ApprovalStats {
  total_pending: number;
  total_under_review: number;
  total_approved: number;
  total_rejected: number;
  average_approval_time_hours: number;
  compliance_score_average: number;
  backlog_items: number;
  overdue_reviews: number;
}

export function useHealthcareContentApproval() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [approvalQueue, setApprovalQueue] = useState<ContentApprovalItem[]>([]);
  const [workflowSettings, setWorkflowSettings] = useState<ApprovalWorkflowSettings | null>(null);
  const [approvalStats, setApprovalStats] = useState<ApprovalStats | null>(null);
  const [userRole, setUserRole] = useState<'practitioner' | 'practice_manager' | 'senior_practitioner' | 'admin'>('practitioner');

  // Load approval queue for current practice
  const loadApprovalQueue = useCallback(async (practiceId?: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Determine user role and permissions
      const { data: roleData } = await supabase
        .from('healthcare_team_members')
        .select('role, practice_id')
        .eq('user_id', user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role);
      }

      // Load approval queue based on user role
      const query = supabase
        .from('healthcare_content_approval_queue')
        .select(`
          *,
          healthcare_content_posts!inner(
            title,
            content,
            platforms,
            specialty,
            target_audience
          ),
          profiles!created_by(
            full_name
          ),
          assigned_reviewer:profiles!assigned_reviewer_id(
            full_name
          )
        `)
        .order('submitted_at', { ascending: true });

      // Filter based on user role
      if (roleData?.role === 'practice_manager') {
        // Practice managers see all content needing approval
        query.in('approval_status', ['pending', 'under_review', 'requires_changes']);
      } else if (roleData?.role === 'senior_practitioner') {
        // Senior practitioners see content assigned to them or needing senior review
        query.or(`assigned_reviewer_id.eq.${user.id},approval_level.eq.senior_review`);
      } else {
        // Regular practitioners see their own submitted content
        query.eq('created_by', user.id);
      }

      if (practiceId) {
        query.eq('practice_id', practiceId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match interface
      const transformedData: ContentApprovalItem[] = (data || []).map(item => ({
        id: item.id,
        content_id: item.content_id,
        content_type: item.content_type,
        content_title: item.healthcare_content_posts?.title || 'Untitled',
        content_text: item.healthcare_content_posts?.content || '',
        content_platform: item.healthcare_content_posts?.platforms || [],
        created_by: item.created_by,
        created_by_name: item.profiles?.full_name || 'Unknown',
        created_by_role: item.created_by_role,
        practice_id: item.practice_id,
        practice_name: item.practice_name,
        specialty: item.healthcare_content_posts?.specialty || item.specialty,
        target_audience: item.healthcare_content_posts?.target_audience || 'patients',
        scheduled_publish_date: item.scheduled_publish_date,
        approval_status: item.approval_status,
        approval_level: item.approval_level,
        assigned_reviewer_id: item.assigned_reviewer_id,
        assigned_reviewer_name: item.assigned_reviewer?.full_name,
        reviewer_role: item.reviewer_role,
        review_notes: item.review_notes,
        compliance_score: item.compliance_score,
        ahpra_compliant: item.ahpra_compliant,
        tga_compliant: item.tga_compliant,
        professional_boundaries_checked: item.professional_boundaries_checked,
        cultural_safety_verified: item.cultural_safety_verified,
        submitted_at: item.submitted_at,
        review_started_at: item.review_started_at,
        reviewed_at: item.reviewed_at,
        approved_at: item.approved_at,
        published_at: item.published_at,
        escalation_required: item.escalation_required,
        escalation_reason: item.escalation_reason,
        escalated_to: item.escalated_to,
        version: item.version,
        previous_versions: item.previous_versions,
        change_summary: item.change_summary
      }));

      setApprovalQueue(transformedData);

    } catch (error) {
      console.error('Error loading approval queue:', error);
      toast({
        title: "Load Failed",
        description: "Could not load content approval queue.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Submit content for approval
  const submitForApproval = useCallback(async (contentData: {
    content_id: string;
    content_type: ContentApprovalItem['content_type'];
    practice_id: string;
    specialty: string;
    scheduled_publish_date?: string;
  }) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get practice info and user role
      const { data: practiceData } = await supabase
        .from('healthcare_practices')
        .select('practice_name')
        .eq('id', contentData.practice_id)
        .single();

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Determine approval level based on content type and user experience
      const approvalLevel = determineApprovalLevel(contentData.content_type, user.id);

      // Create approval queue item
      const approvalItem = {
        content_id: contentData.content_id,
        content_type: contentData.content_type,
        created_by: user.id,
        created_by_name: userProfile?.full_name || 'Unknown',
        created_by_role: 'practitioner' as const,
        practice_id: contentData.practice_id,
        practice_name: practiceData?.practice_name || 'Unknown Practice',
        specialty: contentData.specialty,
        scheduled_publish_date: contentData.scheduled_publish_date,
        approval_status: 'pending' as const,
        approval_level: approvalLevel,
        reviewer_role: getReviewerRole(approvalLevel),
        compliance_score: 0, // Will be calculated during review
        ahpra_compliant: false,
        tga_compliant: false,
        professional_boundaries_checked: false,
        cultural_safety_verified: false,
        submitted_at: new Date().toISOString(),
        escalation_required: false,
        version: 1
      };

      const { data, error } = await supabase
        .from('healthcare_content_approval_queue')
        .insert(approvalItem)
        .select()
        .single();

      if (error) throw error;

      // Assign reviewer automatically if possible
      await autoAssignReviewer(data.id, approvalLevel, contentData.practice_id);

      // Send notification to reviewers
      await sendApprovalNotification(data.id, 'submitted');

      await loadApprovalQueue(contentData.practice_id);

      toast({
        title: "Submitted for Approval",
        description: "Content has been submitted for review by practice management.",
      });

      return { success: true, approvalId: data.id };

    } catch (error) {
      console.error('Error submitting for approval:', error);
      toast({
        title: "Submission Failed",
        description: "Could not submit content for approval.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [loadApprovalQueue, toast]);

  // Start review process
  const startReview = useCallback(async (approvalId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('healthcare_content_approval_queue')
        .update({
          approval_status: 'under_review',
          assigned_reviewer_id: user.id,
          review_started_at: new Date().toISOString()
        })
        .eq('id', approvalId);

      if (error) throw error;

      await loadApprovalQueue();

      toast({
        title: "Review Started",
        description: "You are now reviewing this content.",
      });

    } catch (error) {
      console.error('Error starting review:', error);
      toast({
        title: "Review Start Failed",
        description: "Could not start review process.",
        variant: "destructive",
      });
    }
  }, [loadApprovalQueue, toast]);

  // Complete review with decision
  const completeReview = useCallback(async (
    approvalId: string,
    decision: 'approved' | 'rejected' | 'requires_changes',
    reviewNotes: string,
    complianceScores: {
      overall_score: number;
      ahpra_compliant: boolean;
      tga_compliant: boolean;
      professional_boundaries_checked: boolean;
      cultural_safety_verified: boolean;
    }
  ) => {
    try {
      const updateData = {
        approval_status: decision,
        review_notes: reviewNotes,
        compliance_score: complianceScores.overall_score,
        ahpra_compliant: complianceScores.ahpra_compliant,
        tga_compliant: complianceScores.tga_compliant,
        professional_boundaries_checked: complianceScores.professional_boundaries_checked,
        cultural_safety_verified: complianceScores.cultural_safety_verified,
        reviewed_at: new Date().toISOString()
      };

      if (decision === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('healthcare_content_approval_queue')
        .update(updateData)
        .eq('id', approvalId);

      if (error) throw error;

      // Send notification to content creator
      await sendApprovalNotification(approvalId, decision);

      // Log audit trail
      await logApprovalAction(approvalId, decision, reviewNotes);

      await loadApprovalQueue();

      toast({
        title: "Review Complete",
        description: `Content has been ${decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'returned for changes'}.`,
      });

    } catch (error) {
      console.error('Error completing review:', error);
      toast({
        title: "Review Failed",
        description: "Could not complete review.",
        variant: "destructive",
      });
    }
  }, [loadApprovalQueue, toast]);

  // Helper functions
  const determineApprovalLevel = (contentType: string, userId: string): ContentApprovalItem['approval_level'] => {
    // Complex logic to determine approval level based on content type, user experience, etc.
    if (contentType === 'marketing_material') return 'manager_approval';
    if (contentType === 'patient_education') return 'senior_review';
    return 'junior_review';
  };

  const getReviewerRole = (approvalLevel: ContentApprovalItem['approval_level']): ContentApprovalItem['reviewer_role'] => {
    switch (approvalLevel) {
      case 'manager_approval': return 'practice_manager';
      case 'senior_review': return 'senior_practitioner';
      default: return 'practice_manager';
    }
  };

  const autoAssignReviewer = async (approvalId: string, approvalLevel: string, practiceId: string) => {
    // Logic to automatically assign the most appropriate reviewer
    const reviewerRole = getReviewerRole(approvalLevel as ContentApprovalItem['approval_level']);
    
    const { data: availableReviewers } = await supabase
      .from('healthcare_team_members')
      .select('user_id, full_name')
      .eq('practice_id', practiceId)
      .eq('role', reviewerRole)
      .eq('is_active', true)
      .limit(1);

    if (availableReviewers && availableReviewers.length > 0) {
      await supabase
        .from('healthcare_content_approval_queue')
        .update({
          assigned_reviewer_id: availableReviewers[0].user_id
        })
        .eq('id', approvalId);
    }
  };

  const sendApprovalNotification = async (approvalId: string, type: string) => {
    // Logic to send notifications via email, SMS, or in-app
    console.log(`Sending ${type} notification for approval ${approvalId}`);
  };

  const logApprovalAction = async (approvalId: string, action: string, notes: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('healthcare_team_audit_log')
      .insert({
        team_id: null,
        performed_by: user.id,
        action: `Content approval: ${action}`,
        action_type: 'approval',
        details: {
          approval_id: approvalId,
          action,
          notes
        },
        compliance_impact: true
      });
  };

  // Load workflow settings
  const loadWorkflowSettings = useCallback(async (practiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('healthcare_approval_workflow_settings')
        .select('*')
        .eq('practice_id', practiceId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setWorkflowSettings(data);
      } else {
        // Set default settings
        const defaultSettings: ApprovalWorkflowSettings = {
          practice_id: practiceId,
          require_manager_approval: true,
          require_senior_review: true,
          auto_approve_experienced_staff: false,
          auto_approve_threshold_score: 95,
          escalation_triggers: ['low_compliance_score', 'controversial_content', 'patient_complaint'],
          notification_settings: {
            email_notifications: true,
            slack_notifications: false,
            sms_notifications: false
          },
          approval_deadlines: {
            junior_review_hours: 24,
            senior_review_hours: 48,
            manager_approval_hours: 72
          }
        };
        setWorkflowSettings(defaultSettings);
      }

    } catch (error) {
      console.error('Error loading workflow settings:', error);
    }
  }, []);

  // Calculate approval statistics
  const calculateApprovalStats = useCallback(() => {
    const stats: ApprovalStats = {
      total_pending: approvalQueue.filter(item => item.approval_status === 'pending').length,
      total_under_review: approvalQueue.filter(item => item.approval_status === 'under_review').length,
      total_approved: approvalQueue.filter(item => item.approval_status === 'approved').length,
      total_rejected: approvalQueue.filter(item => item.approval_status === 'rejected').length,
      average_approval_time_hours: 0,
      compliance_score_average: 0,
      backlog_items: approvalQueue.filter(item => 
        ['pending', 'under_review', 'requires_changes'].includes(item.approval_status)
      ).length,
      overdue_reviews: 0
    };

    // Calculate averages
    const reviewedItems = approvalQueue.filter(item => item.reviewed_at);
    if (reviewedItems.length > 0) {
      const totalApprovalTime = reviewedItems.reduce((sum, item) => {
        const submitted = new Date(item.submitted_at);
        const reviewed = new Date(item.reviewed_at!);
        return sum + (reviewed.getTime() - submitted.getTime());
      }, 0);
      stats.average_approval_time_hours = totalApprovalTime / (reviewedItems.length * 1000 * 60 * 60);

      stats.compliance_score_average = reviewedItems.reduce((sum, item) => sum + item.compliance_score, 0) / reviewedItems.length;
    }

    setApprovalStats(stats);
    return stats;
  }, [approvalQueue]);

  // Initialize data loading
  useEffect(() => {
    loadApprovalQueue();
  }, [loadApprovalQueue]);

  useEffect(() => {
    if (approvalQueue.length > 0) {
      calculateApprovalStats();
    }
  }, [approvalQueue, calculateApprovalStats]);

  return {
    // State
    loading,
    approvalQueue,
    workflowSettings,
    approvalStats,
    userRole,

    // Actions
    loadApprovalQueue,
    submitForApproval,
    startReview,
    completeReview,
    loadWorkflowSettings,

    // Utils
    calculateApprovalStats
  };
} 