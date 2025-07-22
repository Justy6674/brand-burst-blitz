-- Healthcare Team Management System
-- Comprehensive team invitation and role management for healthcare practices

-- Create healthcare team roles enum
CREATE TYPE public.healthcare_team_role AS ENUM (
  'practice_owner',
  'practice_manager', 
  'senior_practitioner',
  'practitioner',
  'nurse_manager',
  'registered_nurse',
  'enrolled_nurse',
  'admin_manager',
  'admin_staff',
  'receptionist',
  'billing_manager',
  'marketing_coordinator',
  'compliance_officer',
  'guest'
);

-- Create team invitation status enum
CREATE TYPE public.team_invitation_status AS ENUM (
  'pending',
  'accepted',
  'declined',
  'expired',
  'cancelled'
);

-- Healthcare practice teams table
CREATE TABLE public.healthcare_practice_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES healthcare_professionals(id) ON DELETE CASCADE,
  practice_owner_id UUID NOT NULL REFERENCES healthcare_professionals(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL DEFAULT 'Healthcare Team',
  practice_name TEXT NOT NULL,
  team_description TEXT,
  max_team_size INTEGER DEFAULT 50,
  current_team_size INTEGER DEFAULT 1,
  ahpra_practice_number TEXT,
  practice_address JSONB,
  practice_phone TEXT,
  practice_email TEXT,
  compliance_settings JSONB DEFAULT '{}',
  billing_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Healthcare team members table
CREATE TABLE public.healthcare_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES healthcare_practice_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES healthcare_professionals(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES healthcare_professionals(id) ON DELETE CASCADE,
  team_role public.healthcare_team_role NOT NULL,
  display_name TEXT NOT NULL,
  ahpra_registration TEXT,
  profession_type TEXT,
  department TEXT,
  direct_manager_id UUID REFERENCES healthcare_team_members(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '{}',
  access_level INTEGER DEFAULT 1 CHECK (access_level BETWEEN 1 AND 5), -- 1=view only, 5=full admin
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  invitation_accepted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_id, invited_email)
);

-- Healthcare team invitations table
CREATE TABLE public.healthcare_team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES healthcare_practice_teams(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES healthcare_professionals(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_name TEXT NOT NULL,
  team_role public.healthcare_team_role NOT NULL,
  department TEXT,
  personal_message TEXT,
  invitation_token TEXT UNIQUE NOT NULL,
  status public.team_invitation_status DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  declined_reason TEXT,
  reminder_sent_count INTEGER DEFAULT 0,
  last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  compliance_acknowledgment_required BOOLEAN DEFAULT true,
  ahpra_verification_required BOOLEAN DEFAULT false,
  background_check_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Healthcare team permissions template table
CREATE TABLE public.healthcare_team_permission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  team_role public.healthcare_team_role NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_system_template BOOLEAN DEFAULT false,
  created_by UUID REFERENCES healthcare_professionals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Healthcare team audit log table
CREATE TABLE public.healthcare_team_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES healthcare_practice_teams(id) ON DELETE CASCADE,
  performed_by UUID REFERENCES healthcare_professionals(id) ON DELETE SET NULL,
  target_member_id UUID REFERENCES healthcare_team_members(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('invitation', 'member_update', 'permission_change', 'role_change', 'deactivation', 'compliance')),
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  compliance_impact BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.healthcare_practice_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_team_permission_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_team_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for healthcare_practice_teams
CREATE POLICY "Practice owners can manage their teams"
ON public.healthcare_practice_teams
FOR ALL
USING (auth.uid() = practice_owner_id);

CREATE POLICY "Team members can view their team details"
ON public.healthcare_practice_teams
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM healthcare_team_members tm
    WHERE tm.team_id = healthcare_practice_teams.id
    AND tm.user_id = auth.uid()
    AND tm.is_active = true
  )
);

-- RLS Policies for healthcare_team_members
CREATE POLICY "Practice owners can manage team members"
ON public.healthcare_team_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM healthcare_practice_teams hpt
    WHERE hpt.id = healthcare_team_members.team_id
    AND hpt.practice_owner_id = auth.uid()
  )
);

CREATE POLICY "Team members can view team roster"
ON public.healthcare_team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM healthcare_team_members tm
    WHERE tm.team_id = healthcare_team_members.team_id
    AND tm.user_id = auth.uid()
    AND tm.is_active = true
  )
);

CREATE POLICY "Users can view their own team membership"
ON public.healthcare_team_members
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for healthcare_team_invitations
CREATE POLICY "Practice owners can manage invitations"
ON public.healthcare_team_invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM healthcare_practice_teams hpt
    WHERE hpt.id = healthcare_team_invitations.team_id
    AND hpt.practice_owner_id = auth.uid()
  )
);

CREATE POLICY "Invited users can view their invitations"
ON public.healthcare_team_invitations
FOR SELECT
USING (
  invited_email = (
    SELECT email FROM healthcare_professionals
    WHERE id = auth.uid()
  )
);

-- RLS Policies for healthcare_team_permission_templates
CREATE POLICY "Users can view system permission templates"
ON public.healthcare_team_permission_templates
FOR SELECT
USING (is_system_template = true);

CREATE POLICY "Practice owners can manage custom templates"
ON public.healthcare_team_permission_templates
FOR ALL
USING (auth.uid() = created_by);

-- RLS Policies for healthcare_team_audit_log
CREATE POLICY "Practice owners can view team audit logs"
ON public.healthcare_team_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM healthcare_practice_teams hpt
    WHERE hpt.id = healthcare_team_audit_log.team_id
    AND hpt.practice_owner_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_healthcare_teams_practice_owner ON healthcare_practice_teams(practice_owner_id);
CREATE INDEX idx_healthcare_teams_active ON healthcare_practice_teams(is_active);
CREATE INDEX idx_team_members_team_id ON healthcare_team_members(team_id);
CREATE INDEX idx_team_members_user_id ON healthcare_team_members(user_id);
CREATE INDEX idx_team_members_role ON healthcare_team_members(team_role);
CREATE INDEX idx_team_members_active ON healthcare_team_members(is_active);
CREATE INDEX idx_team_invitations_team_id ON healthcare_team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON healthcare_team_invitations(invited_email);
CREATE INDEX idx_team_invitations_status ON healthcare_team_invitations(status);
CREATE INDEX idx_team_invitations_token ON healthcare_team_invitations(invitation_token);
CREATE INDEX idx_team_invitations_expires ON healthcare_team_invitations(expires_at);
CREATE INDEX idx_team_audit_log_team_id ON healthcare_team_audit_log(team_id);
CREATE INDEX idx_team_audit_log_action_type ON healthcare_team_audit_log(action_type);
CREATE INDEX idx_team_audit_log_created_at ON healthcare_team_audit_log(created_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_healthcare_practice_teams_updated_at
BEFORE UPDATE ON healthcare_practice_teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_healthcare_team_members_updated_at
BEFORE UPDATE ON healthcare_team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_healthcare_team_invitations_updated_at
BEFORE UPDATE ON healthcare_team_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_healthcare_team_permission_templates_updated_at
BEFORE UPDATE ON healthcare_team_permission_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default permission templates
INSERT INTO public.healthcare_team_permission_templates (template_name, team_role, permissions, description, is_default, is_system_template) VALUES
(
  'Practice Owner - Full Access',
  'practice_owner',
  '{
    "content": {"create": true, "edit": true, "delete": true, "publish": true, "approve": true},
    "team": {"invite": true, "manage": true, "remove": true, "view_all": true},
    "compliance": {"manage": true, "audit": true, "training": true},
    "billing": {"view": true, "manage": true, "export": true},
    "analytics": {"view": true, "export": true, "configure": true},
    "settings": {"practice": true, "integrations": true, "security": true}
  }',
  'Full administrative access for practice owner',
  true,
  true
),
(
  'Practice Manager - Administrative',
  'practice_manager',
  '{
    "content": {"create": true, "edit": true, "publish": true, "approve": true},
    "team": {"invite": true, "manage": true, "view_all": true},
    "compliance": {"manage": true, "training": true},
    "billing": {"view": true, "manage": true},
    "analytics": {"view": true, "export": true},
    "settings": {"practice": true, "integrations": false}
  }',
  'Administrative access for practice managers',
  true,
  true
),
(
  'Senior Practitioner - Content & Team Lead',
  'senior_practitioner',
  '{
    "content": {"create": true, "edit": true, "publish": true, "approve": false},
    "team": {"view_all": true, "mentor": true},
    "compliance": {"view": true, "training": true},
    "billing": {"view": false},
    "analytics": {"view": true},
    "settings": {"practice": false}
  }',
  'Content creation and team leadership for senior practitioners',
  true,
  true
),
(
  'Practitioner - Content Creation',
  'practitioner',
  '{
    "content": {"create": true, "edit": true, "publish": false, "approve": false},
    "team": {"view_team": true},
    "compliance": {"view": true, "training": true},
    "billing": {"view": false},
    "analytics": {"view": true},
    "settings": {"practice": false}
  }',
  'Content creation access for practitioners',
  true,
  true
),
(
  'Admin Staff - Operations',
  'admin_staff',
  '{
    "content": {"create": false, "edit": false, "publish": false, "schedule": true},
    "team": {"view_team": true},
    "compliance": {"view": true, "training": true},
    "billing": {"view": true, "data_entry": true},
    "analytics": {"view": true},
    "settings": {"practice": false}
  }',
  'Operational access for administrative staff',
  true,
  true
),
(
  'Guest - Limited Access',
  'guest',
  '{
    "content": {"view": true},
    "team": {"view_team": false},
    "compliance": {"training": true},
    "billing": {"view": false},
    "analytics": {"view": false},
    "settings": {"practice": false}
  }',
  'Limited view access for guests and temporary users',
  true,
  true
);

-- Create function to automatically create team when healthcare professional signs up
CREATE OR REPLACE FUNCTION public.create_healthcare_team_for_professional()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only create team for practice owners (solo or group practice types)
  IF NEW.practice_type IN ('solo', 'group') THEN
    INSERT INTO public.healthcare_practice_teams (
      practice_id,
      practice_owner_id,
      team_name,
      practice_name,
      ahpra_practice_number,
      current_team_size
    ) VALUES (
      NEW.id,
      NEW.id,
      NEW.practice_name || ' Team',
      NEW.practice_name,
      NEW.ahpra_registration,
      1
    );
    
    -- Add the owner as the first team member
    INSERT INTO public.healthcare_team_members (
      team_id,
      user_id,
      invited_email,
      invited_by,
      team_role,
      display_name,
      ahpra_registration,
      profession_type,
      access_level,
      invitation_accepted_at
    ) VALUES (
      (SELECT id FROM public.healthcare_practice_teams WHERE practice_owner_id = NEW.id),
      NEW.id,
      NEW.email,
      NEW.id,
      'practice_owner',
      NEW.practitioner_name,
      NEW.ahpra_registration,
      NEW.profession_type,
      5,
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create team on healthcare professional creation
CREATE TRIGGER create_healthcare_team_trigger
AFTER INSERT ON public.healthcare_professionals
FOR EACH ROW
EXECUTE FUNCTION public.create_healthcare_team_for_professional();

-- Create function to generate secure invitation tokens
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$; 