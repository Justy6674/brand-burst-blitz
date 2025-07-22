import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { EmailConfirmationRequired } from './EmailConfirmationRequired';
import { LoadingState } from '@/components/common/LoadingState';

interface EmailConfirmationGuardProps {
  children: React.ReactNode;
  isHealthcareProfessional?: boolean;
}

export const EmailConfirmationGuard: React.FC<EmailConfirmationGuardProps> = ({ 
  children, 
  isHealthcareProfessional = false 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { isEmailConfirmed, isCheckingConfirmation, checkEmailConfirmation } = useEmailConfirmation();
  const [hasChecked, setHasChecked] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && user) {
      checkEmailConfirmation().then(() => setHasChecked(true));
    }
  }, [user, authLoading, checkEmailConfirmation]);

  // Loading states
  if (authLoading || isCheckingConfirmation || !hasChecked) {
    return <LoadingState />;
  }

  // No user - redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Email not confirmed - show confirmation page
  if (!isEmailConfirmed) {
    return <EmailConfirmationRequired isHealthcareProfessional={isHealthcareProfessional} />;
  }

  // Email confirmed - proceed
  return <>{children}</>;
}; 