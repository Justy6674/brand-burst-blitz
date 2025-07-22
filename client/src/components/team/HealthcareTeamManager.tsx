import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useHealthcareTeamManagement, HealthcareTeamRole, TeamMember, TeamInvitation } from '@/hooks/useHealthcareTeamManagement';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Settings, 
  Trash2, 
  Edit3, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Eye,
  MoreVertical,
  Calendar,
  MapPin,
  Phone
} from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const ROLE_LABELS: Record<HealthcareTeamRole, string> = {
  practice_owner: 'Practice Owner',
  practice_manager: 'Practice Manager',
  senior_practitioner: 'Senior Practitioner',
  practitioner: 'Practitioner',
  nurse_manager: 'Nurse Manager',
  registered_nurse: 'Registered Nurse',
  enrolled_nurse: 'Enrolled Nurse',
  admin_manager: 'Administration Manager',
  admin_staff: 'Administrative Staff',
  receptionist: 'Receptionist',
  billing_manager: 'Billing Manager',
  marketing_coordinator: 'Marketing Coordinator',
  compliance_officer: 'Compliance Officer',
  guest: 'Guest Access'
};

const ROLE_DESCRIPTIONS: Record<HealthcareTeamRole, string> = {
  practice_owner: 'Full administrative access and practice ownership',
  practice_manager: 'Administrative access and team management',
  senior_practitioner: 'Content creation and clinical leadership',
  practitioner: 'Content creation and clinical work',
  nurse_manager: 'Nursing team leadership and management',
  registered_nurse: 'Clinical nursing and patient care',
  enrolled_nurse: 'Support nursing and patient assistance',
  admin_manager: 'Administrative operations management',
  admin_staff: 'General administrative support',
  receptionist: 'Front desk and patient communication',
  billing_manager: 'Financial and billing operations',
  marketing_coordinator: 'Marketing and social media management',
  compliance_officer: 'AHPRA compliance and quality assurance',
  guest: 'Limited view access for temporary users'
};

const ACCESS_LEVEL_LABELS = {
  1: 'View Only',
  2: 'Limited Edit',
  3: 'Standard Access',
  4: 'Advanced Access',
  5: 'Full Admin'
};

interface InviteTeamMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (invitation: {
    email: string;
    name: string;
    role: HealthcareTeamRole;
    department?: string;
    personalMessage?: string;
    requireAHPRAVerification?: boolean;
    requireBackgroundCheck?: boolean;
  }) => Promise<{ success: boolean }>;
  isInviting: boolean;
}

const InviteTeamMemberDialog: React.FC<InviteTeamMemberDialogProps> = ({
  isOpen,
  onClose,
  onInvite,
  isInviting
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: '' as HealthcareTeamRole,
    department: '',
    personalMessage: '',
    requireAHPRAVerification: false,
    requireBackgroundCheck: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await onInvite(formData);
    
    if (result.success) {
      setFormData({
        email: '',
        name: '',
        role: '' as HealthcareTeamRole,
        department: '',
        personalMessage: '',
        requireAHPRAVerification: false,
        requireBackgroundCheck: false
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your healthcare team with appropriate permissions and compliance requirements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="colleague@practice.com.au"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Dr. Jane Smith"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Team Role *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: HealthcareTeamRole) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                  <SelectItem key={role} value={role}>
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[role as HealthcareTeamRole]}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              placeholder="General Practice, Nursing, Administration"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message</Label>
            <Textarea
              id="message"
              value={formData.personalMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, personalMessage: e.target.value }))}
              placeholder="Optional welcome message..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ahpra"
                checked={formData.requireAHPRAVerification}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, requireAHPRAVerification: !!checked }))
                }
              />
              <Label htmlFor="ahpra" className="text-sm">
                Require AHPRA registration verification
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="background"
                checked={formData.requireBackgroundCheck}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, requireBackgroundCheck: !!checked }))
                }
              />
              <Label htmlFor="background" className="text-sm">
                Require background check
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isInviting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isInviting}>
              {isInviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface TeamMemberCardProps {
  member: TeamMember;
  isOwner: boolean;
  onUpdate: (memberId: string, updates: any) => void;
  onRemove: (memberId: string) => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, isOwner, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = () => {
    if (!member.user_id) {
      return <Badge variant="secondary">Invited</Badge>;
    }
    if (!member.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>{getInitials(member.display_name)}</AvatarFallback>
            </Avatar>
            
            <div>
              <div className="font-medium">{member.display_name}</div>
              <div className="text-sm text-gray-500">{member.invited_email}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {ROLE_LABELS[member.team_role]}
                </Badge>
                {getStatusBadge()}
              </div>
            </div>
          </div>

          {isOwner && member.team_role !== 'practice_owner' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Member
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onRemove(member.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {member.department && (
          <div className="mt-3 flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-3 w-3" />
            {member.department}
          </div>
        )}

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Level {member.access_level} Access
          </div>
          {member.invitation_accepted_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined {new Date(member.invitation_accepted_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface PendingInvitationCardProps {
  invitation: TeamInvitation;
  onCancel: (invitationId: string) => void;
}

const PendingInvitationCard: React.FC<PendingInvitationCardProps> = ({ invitation, onCancel }) => {
  const isExpired = new Date(invitation.expires_at) < new Date();
  const daysUntilExpiry = Math.ceil((new Date(invitation.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            
            <div>
              <div className="font-medium">{invitation.invited_name}</div>
              <div className="text-sm text-gray-500">{invitation.invited_email}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {ROLE_LABELS[invitation.team_role]}
                </Badge>
                {isExpired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {daysUntilExpiry}d left
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onCancel(invitation.id)}
            className="text-red-600 hover:text-red-800"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>

        {invitation.personal_message && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
            "{invitation.personal_message}"
          </div>
        )}

        <div className="mt-3 text-xs text-gray-500">
          Invited {new Date(invitation.created_at).toLocaleDateString()} • 
          {invitation.reminder_sent_count} reminders sent
        </div>
      </CardContent>
    </Card>
  );
};

export const HealthcareTeamManager: React.FC = () => {
  const {
    team,
    teamMembers,
    pendingInvitations,
    isLoading,
    isInviting,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
    cancelInvitation
  } = useHealthcareTeamManagement();

  const [showInviteDialog, setShowInviteDialog] = useState(false);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No team found. Only practice owners can manage teams. Please contact support if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isOwner = teamMembers.some(m => m.team_role === 'practice_owner' && m.user_id);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Team Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                {team.team_name}
              </CardTitle>
              <CardDescription>
                {team.practice_name} • {team.current_team_size} of {team.max_team_size} members
              </CardDescription>
            </div>
            
            {isOwner && (
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>

          {team.team_description && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{team.team_description}</p>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Team Content */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">
            Team Members ({teamMembers.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            Pending Invitations ({pendingInvitations.length})
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger value="settings">
              Team Settings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {teamMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                isOwner={isOwner}
                onUpdate={updateTeamMember}
                onRemove={removeTeamMember}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          {pendingInvitations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Invitations</h3>
                <p className="text-gray-500">All team invitations have been resolved.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingInvitations.map((invitation) => (
                <PendingInvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onCancel={cancelInvitation}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {isOwner && (
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Settings</CardTitle>
                <CardDescription>
                  Configure team policies and compliance requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Team settings and advanced configuration options will be available in a future update.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Invite Dialog */}
      <InviteTeamMemberDialog
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        onInvite={inviteTeamMember}
        isInviting={isInviting}
      />
    </div>
  );
}; 