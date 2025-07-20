import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuthErrorHandler } from './useAuthErrorHandler';

export type HealthcareTeamRole = 
  | 'practice_owner'
  | 'practice_manager'
  | 'senior_practitioner'
  | 'practitioner'
  | 'nurse_manager'
  | 'registered_nurse'
  | 'enrolled_nurse'
  | 'admin_manager'
  | 'admin_staff'
  | 'receptionist'
  | 'billing_manager'
  | 'marketing_coordinator'
  | 'compliance_officer'
  | 'guest';

export type TeamInvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';

export interface HealthcareTeam {
  id: string;
  practice_id: string;
  practice_owner_id: string;
  team_name: string;
  practice_name: string;
  team_description?: string;
  max_team_size: number;
  current_team_size: number;
  ahpra_practice_number?: string;
  practice_address?: any;
  practice_phone?: string;
  practice_email?: string;
  compliance_settings: any;
  billing_settings: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id?: string;
  invited_email: string;
  invited_by: string;
  team_role: HealthcareTeamRole;
  display_name: string;
  ahpra_registration?: string;
  profession_type?: string;
  department?: string;
  direct_manager_id?: string;
  permissions: any;
  access_level: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  last_login_at?: string;
  invitation_accepted_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  invited_by: string;
  invited_email: string;
  invited_name: string;
  team_role: HealthcareTeamRole;
  department?: string;
  personal_message?: string;
  invitation_token: string;
  status: TeamInvitationStatus;
  expires_at: string;
  accepted_at?: string;
  declined_at?: string;
  declined_reason?: string;
  reminder_sent_count: number;
  last_reminder_sent_at?: string;
  compliance_acknowledgment_required: boolean;
  ahpra_verification_required: boolean;
  background_check_required: boolean;
  created_at: string;
  updated_at: string;
}

interface TeamManagementState {
  team: HealthcareTeam | null;
  teamMembers: TeamMember[];
  pendingInvitations: TeamInvitation[];
  isLoading: boolean;
  isInviting: boolean;
}

export const useHealthcareTeamManagement = () => {
  const { toast } = useToast();
  const { handleAuthError } = useAuthErrorHandler();
  
  const [state, setState] = useState<TeamManagementState>({
    team: null,
    teamMembers: [],
    pendingInvitations: [],
    isLoading: true,
    isInviting: false
  });

  // Load team data
  const loadTeamData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Get current user's team (as owner or member)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, try to get team as owner
      let { data: team } = await supabase
        .from('healthcare_practice_teams')
        .select('*')
        .eq('practice_owner_id', user.id)
        .eq('is_active', true)
        .single();

      // If not owner, try to get team as member
      if (!team) {
        const { data: memberData } = await supabase
          .from('healthcare_team_members')
          .select(`
            team_id,
            healthcare_practice_teams!inner(*)
          `)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        team = memberData?.healthcare_practice_teams;
      }

      if (!team) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Load team members
      const { data: members, error: membersError } = await supabase
        .from('healthcare_team_members')
        .select('*')
        .eq('team_id', team.id)
        .eq('is_active', true)
        .order('created_at');

      if (membersError) throw membersError;

      // Load pending invitations
      const { data: invitations, error: invitationsError } = await supabase
        .from('healthcare_team_invitations')
        .select('*')
        .eq('team_id', team.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (invitationsError) throw invitationsError;

      setState({
        team,
        teamMembers: members || [],
        pendingInvitations: invitations || [],
        isLoading: false,
        isInviting: false
      });

    } catch (error: any) {
      handleAuthError(error, 'general', { 
        customMessage: 'Failed to load team data' 
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [handleAuthError]);

  // Invite team member
  const inviteTeamMember = useCallback(async (invitation: {
    email: string;
    name: string;
    role: HealthcareTeamRole;
    department?: string;
    personalMessage?: string;
    requireAHPRAVerification?: boolean;
    requireBackgroundCheck?: boolean;
  }) => {
    if (!state.team) {
      toast({
        title: "Error",
        description: "No team found. Please contact support.",
        variant: "destructive"
      });
      return { success: false };
    }

    setState(prev => ({ ...prev, isInviting: true }));

    try {
      // Generate secure invitation token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token');

      if (tokenError) throw tokenError;

      // Create invitation record
      const { data: invitationData, error: invitationError } = await supabase
        .from('healthcare_team_invitations')
        .insert({
          team_id: state.team.id,
          invited_by: state.team.practice_owner_id,
          invited_email: invitation.email.toLowerCase(),
          invited_name: invitation.name,
          team_role: invitation.role,
          department: invitation.department,
          personal_message: invitation.personalMessage,
          invitation_token: tokenData,
          ahpra_verification_required: invitation.requireAHPRAVerification || false,
          background_check_required: invitation.requireBackgroundCheck || false,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single();

      if (invitationError) throw invitationError;

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-team-invitation', {
        body: {
          invitation_id: invitationData.id,
          invited_email: invitation.email,
          invited_name: invitation.name,
          team_name: state.team.team_name,
          practice_name: state.team.practice_name,
          role: invitation.role,
          personal_message: invitation.personalMessage,
          invitation_url: `${window.location.origin}/team/join/${tokenData}`
        }
      });

      if (emailError) {
        console.warn('Email sending failed:', emailError);
        // Don't fail the invitation if email fails
      }

      // Log audit trail
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: state.team.id,
          performed_by: state.team.practice_owner_id,
          action: `Invited ${invitation.name} (${invitation.email}) as ${invitation.role}`,
          action_type: 'invitation',
          details: {
            invited_email: invitation.email,
            invited_name: invitation.name,
            team_role: invitation.role,
            department: invitation.department
          }
        });

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${invitation.name} (${invitation.email})`,
      });

      // Reload team data
      await loadTeamData();
      
      return { success: true, invitation: invitationData };

    } catch (error: any) {
      handleAuthError(error, 'general', {
        customMessage: 'Failed to send team invitation'
      });
      return { success: false, error: error.message };
    } finally {
      setState(prev => ({ ...prev, isInviting: false }));
    }
  }, [state.team, toast, handleAuthError, loadTeamData]);

  // Accept invitation
  const acceptInvitation = useCallback(async (invitationToken: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find and validate invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('healthcare_team_invitations')
        .select('*')
        .eq('invitation_token', invitationToken)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (invitationError || !invitation) {
        throw new Error('Invalid or expired invitation');
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('healthcare_team_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      // Add user to team
      const { error: memberError } = await supabase
        .from('healthcare_team_members')
        .insert({
          team_id: invitation.team_id,
          user_id: user.id,
          invited_email: invitation.invited_email,
          invited_by: invitation.invited_by,
          team_role: invitation.team_role,
          display_name: invitation.invited_name,
          department: invitation.department,
          invitation_accepted_at: new Date().toISOString()
        });

      if (memberError) throw memberError;

      // Update team size
      await supabase.rpc('increment_team_size', { team_id: invitation.team_id });

      // Log audit trail
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: invitation.team_id,
          performed_by: user.id,
          action: `Accepted team invitation as ${invitation.team_role}`,
          action_type: 'invitation',
          details: {
            invitation_id: invitation.id,
            team_role: invitation.team_role
          }
        });

      toast({
        title: "Welcome to the Team!",
        description: "You've successfully joined the healthcare team.",
      });

      // Reload team data
      await loadTeamData();

      return { success: true };

    } catch (error: any) {
      handleAuthError(error, 'general', {
        customMessage: 'Failed to accept invitation'
      });
      return { success: false, error: error.message };
    }
  }, [toast, handleAuthError, loadTeamData]);

  // Update team member role or permissions
  const updateTeamMember = useCallback(async (memberId: string, updates: {
    team_role?: HealthcareTeamRole;
    permissions?: any;
    access_level?: number;
    department?: string;
    is_active?: boolean;
    notes?: string;
  }) => {
    if (!state.team) return { success: false };

    try {
      const { error } = await supabase
        .from('healthcare_team_members')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);

      if (error) throw error;

      // Log audit trail
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: state.team.id,
          performed_by: state.team.practice_owner_id,
          target_member_id: memberId,
          action: 'Updated team member',
          action_type: 'member_update',
          details: updates
        });

      toast({
        title: "Member Updated",
        description: "Team member has been successfully updated.",
      });

      // Reload team data
      await loadTeamData();

      return { success: true };

    } catch (error: any) {
      handleAuthError(error, 'general', {
        customMessage: 'Failed to update team member'
      });
      return { success: false, error: error.message };
    }
  }, [state.team, toast, handleAuthError, loadTeamData]);

  // Remove team member
  const removeTeamMember = useCallback(async (memberId: string, reason?: string) => {
    if (!state.team) return { success: false };

    try {
      // Deactivate member instead of deleting
      const { error } = await supabase
        .from('healthcare_team_members')
        .update({
          is_active: false,
          end_date: new Date().toISOString().split('T')[0],
          notes: reason ? `Removed: ${reason}` : 'Removed from team',
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);

      if (error) throw error;

      // Update team size
      await supabase.rpc('decrement_team_size', { team_id: state.team.id });

      // Log audit trail
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: state.team.id,
          performed_by: state.team.practice_owner_id,
          target_member_id: memberId,
          action: `Removed team member${reason ? `: ${reason}` : ''}`,
          action_type: 'deactivation',
          details: { reason }
        });

      toast({
        title: "Member Removed",
        description: "Team member has been removed from the team.",
      });

      // Reload team data
      await loadTeamData();

      return { success: true };

    } catch (error: any) {
      handleAuthError(error, 'general', {
        customMessage: 'Failed to remove team member'
      });
      return { success: false, error: error.message };
    }
  }, [state.team, toast, handleAuthError, loadTeamData]);

  // Cancel pending invitation
  const cancelInvitation = useCallback(async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('healthcare_team_invitations')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation Cancelled",
        description: "The team invitation has been cancelled.",
      });

      // Reload team data
      await loadTeamData();

      return { success: true };

    } catch (error: any) {
      handleAuthError(error, 'general', {
        customMessage: 'Failed to cancel invitation'
      });
      return { success: false, error: error.message };
    }
  }, [toast, handleAuthError, loadTeamData]);

  // Load team data on mount
  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  return {
    ...state,
    loadTeamData,
    inviteTeamMember,
    acceptInvitation,
    updateTeamMember,
    removeTeamMember,
    cancelInvitation
  };
}; 