import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Users, Crown, Key, AlertTriangle, Calendar, Mail, Settings } from "lucide-react";
import { useUserRoles } from '@/hooks/useUserRoles';
import { AdminGuard } from '@/components/auth/PermissionGuards';
import { format } from 'date-fns';

export const UserRoleManagement = () => {
  const { 
    userRoles, 
    allUsers, 
    currentUserRole, 
    isAdmin, 
    isLoading, 
    assignRole, 
    revokeRole, 
    updateRole 
  } = useUserRoles();
  
  const [selectedUserId, setSelectedUserId] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<'admin' | 'subscriber' | 'trial'>('trial');
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRole) return;
    
    try {
      await assignRole(selectedUserId, selectedRole);
      setAssignDialogOpen(false);
      setSelectedUserId('');
      setSelectedRole('trial');
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  const handleToggleRole = async (roleId: string, isActive: boolean) => {
    try {
      await updateRole(roleId, { is_active: !isActive });
    } catch (error) {
      console.error('Failed to toggle role:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'subscriber':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'trial':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'subscriber':
        return <Shield className="h-4 w-4" />;
      case 'trial':
        return <Key className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  // Get users without active roles
  const usersWithoutRoles = allUsers?.filter(user => 
    !userRoles?.some(role => role.user_id === user.id && role.is_active)
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AdminGuard fallback={
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access user role management.
        </AlertDescription>
      </Alert>
    }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">User Role Management</h3>
            <p className="text-muted-foreground">Manage user roles and permissions across the platform</p>
          </div>
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign User Role</DialogTitle>
                <DialogDescription>
                  Select a user and assign them a role with specific permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-select">Select User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {usersWithoutRoles.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="role-select">Select Role</Label>
                  <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial - Limited access</SelectItem>
                      <SelectItem value="subscriber">Subscriber - Full access</SelectItem>
                      <SelectItem value="admin">Admin - System administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignRole} disabled={!selectedUserId}>
                  Assign Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Role Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Administrators</p>
                  <p className="text-2xl font-bold">
                    {userRoles?.filter(role => role.role === 'admin' && role.is_active).length || 0}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subscribers</p>
                  <p className="text-2xl font-bold">
                    {userRoles?.filter(role => role.role === 'subscriber' && role.is_active).length || 0}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trial Users</p>
                  <p className="text-2xl font-bold">
                    {userRoles?.filter(role => role.role === 'trial' && role.is_active).length || 0}
                  </p>
                </div>
                <Key className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active User Roles</CardTitle>
            <CardDescription>Manage and monitor user permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Assigned By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRoles?.map((userRole) => (
                    <TableRow key={userRole.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">{allUsers?.find(u => u.id === userRole.user_id)?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">
                              {allUsers?.find(u => u.id === userRole.user_id)?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleColor(userRole.role)} flex items-center gap-1 w-fit`}>
                          {getRoleIcon(userRole.role)}
                          {userRole.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {userRole.assigned_at 
                            ? format(new Date(userRole.assigned_at), 'MMM dd, yyyy')
                            : 'Unknown'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {userRole.assigned_by ? 'Admin' : 'System'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={userRole.is_active || false}
                            onCheckedChange={() => handleToggleRole(userRole.id, userRole.is_active || false)}
                          />
                          <span className="text-sm">
                            {userRole.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeRole(userRole.id)}
                            disabled={!userRole.is_active}
                          >
                            Revoke
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions Reference</CardTitle>
            <CardDescription>Overview of what each role can do</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-red-500" />
                  <h4 className="font-medium">Administrator</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Full system access</li>
                  <li>• User management</li>
                  <li>• All business profiles</li>
                  <li>• System configuration</li>
                  <li>• Audit logs access</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium">Subscriber</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Full content creation</li>
                  <li>• Unlimited posts</li>
                  <li>• Business management</li>
                  <li>• Analytics access</li>
                  <li>• Template creation</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-gray-500" />
                  <h4 className="font-medium">Trial</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Limited content creation</li>
                  <li>• Basic analytics</li>
                  <li>• Template browsing</li>
                  <li>• Limited social accounts</li>
                  <li>• Basic features only</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
};