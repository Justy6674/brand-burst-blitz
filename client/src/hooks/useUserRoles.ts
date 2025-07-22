import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate, Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];
type UserRoleRow = Tables<'user_roles'>;
type User = Tables<'users'>;

interface UseUserRolesReturn {
  userRoles: UserRoleRow[] | undefined;
  allUsers: User[] | undefined;
  currentUserRole: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  assignRole: (userId: string, role: UserRole) => Promise<void>;
  revokeRole: (roleId: string) => Promise<void>;
  updateRole: (roleId: string, data: Partial<TablesUpdate<'user_roles'>>) => Promise<void>;
  checkPermission: (action: string, resource?: string) => boolean;
  refetchRoles: () => void;
}

// Permission definitions
const PERMISSIONS = {
  admin: {
    users: ['create', 'read', 'update', 'delete'],
    business_profiles: ['create', 'read', 'update', 'delete'],
    posts: ['create', 'read', 'update', 'delete'],
    analytics: ['read'],
    templates: ['create', 'read', 'update', 'delete'],
    competitors: ['create', 'read', 'update', 'delete'],
    social_accounts: ['create', 'read', 'update', 'delete'],
    system: ['manage', 'audit', 'configure'],
  },
  subscriber: {
    business_profiles: ['create', 'read', 'update', 'delete'], // own only
    posts: ['create', 'read', 'update', 'delete'], // own only
    analytics: ['read'], // own only
    templates: ['create', 'read', 'update', 'delete'], // own only
    competitors: ['create', 'read', 'update', 'delete'], // own only
    social_accounts: ['create', 'read', 'update', 'delete'], // own only
  },
  trial: {
    business_profiles: ['create', 'read', 'update'], // limited, own only
    posts: ['create', 'read', 'update'], // limited to trial_posts_used
    analytics: ['read'], // own only, basic
    templates: ['read'], // read public only
    competitors: ['read'], // limited
    social_accounts: ['create', 'read'], // limited
  },
} as const;

export const useUserRoles = (): UseUserRolesReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user's role
  const { data: currentUserRole, isLoading: isLoadingCurrentRole } = useQuery({
    queryKey: ['current-user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data?.role || 'trial';
    },
    enabled: !!user,
  });

  // Get all user roles (admin only)
  const { data: userRoles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data as UserRoleRow[];
    },
    enabled: currentUserRole === 'admin',
  });

  // Get all users (admin only)
  const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: currentUserRole === 'admin',
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      // First, deactivate any existing roles for the user
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Then assign the new role
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          assigned_by: user?.id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Update the user's role in the users table as well
      await supabase
        .from('users')
        .update({ role })
        .eq('id', userId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast({
        title: "Role Assigned",
        description: "User role has been successfully assigned.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign role.",
        variant: "destructive",
      });
    },
  });

  // Revoke role mutation
  const revokeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: "Role Revoked",
        description: "User role has been successfully revoked.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke role.",
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, data }: { roleId: string; data: Partial<TablesUpdate<'user_roles'>> }) => {
      const { error } = await supabase
        .from('user_roles')
        .update(data)
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role.",
        variant: "destructive",
      });
    },
  });

  // Permission checking function
  const checkPermission = (action: string, resource: string = 'general'): boolean => {
    if (!currentUserRole) return false;
    
    const rolePermissions = PERMISSIONS[currentUserRole];
    if (!rolePermissions) return false;
    
    const resourcePermissions = rolePermissions[resource as keyof typeof rolePermissions];
    if (!resourcePermissions) return false;
    
    return resourcePermissions.includes(action as any);
  };

  const isAdmin = currentUserRole === 'admin';
  const isLoading = isLoadingCurrentRole || isLoadingRoles || isLoadingUsers;

  return {
    userRoles,
    allUsers,
    currentUserRole: currentUserRole || null,
    isAdmin,
    isLoading,
    error: null,
    assignRole: async (userId: string, role: UserRole) => {
      await assignRoleMutation.mutateAsync({ userId, role });
    },
    revokeRole: revokeRoleMutation.mutateAsync,
    updateRole: (roleId: string, data: Partial<TablesUpdate<'user_roles'>>) => 
      updateRoleMutation.mutateAsync({ roleId, data }),
    checkPermission,
    refetchRoles: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['current-user-role'] });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
  };
};