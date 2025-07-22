import React from 'react';
import { useUserRoles } from '@/hooks/useUserRoles';

interface PermissionGuardProps {
  action: string;
  resource?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  action,
  resource = 'general',
  children,
  fallback = null,
}) => {
  const { checkPermission } = useUserRoles();
  
  if (checkPermission(action, resource)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  roles,
  children,
  fallback = null,
}) => {
  const { currentUserRole } = useUserRoles();
  
  if (currentUserRole && roles.includes(currentUserRole)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  fallback = null,
}) => {
  const { isAdmin } = useUserRoles();
  
  if (isAdmin) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};