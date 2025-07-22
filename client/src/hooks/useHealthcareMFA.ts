import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { User } from '@supabase/supabase-js';

interface MFASetupData {
  secret: string;
  qr_code: string;
  backup_codes: string[];
  enrollment_date: string;
}

interface MFAState {
  isEnabled: boolean;
  isEnrolled: boolean;
  enrollmentDate?: string;
  lastUsed?: string;
  backupCodesRemaining: number;
  methods: ('totp' | 'sms' | 'backup_codes')[];
  requiresHealthcareMFA: boolean;
}

interface MFAVerificationData {
  token: string;
  method: 'totp' | 'sms' | 'backup_codes';
}

interface SMSData {
  phone_number: string;
  country_code: string;
  verified: boolean;
}

export const useHealthcareMFA = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [mfaState, setMFAState] = useState<MFAState>({
    isEnabled: false,
    isEnrolled: false,
    backupCodesRemaining: 0,
    methods: [],
    requiresHealthcareMFA: false
  });
  const [smsData, setSMSData] = useState<SMSData | null>(null);

  // Check if user is healthcare professional requiring MFA
  const checkHealthcareMFARequirement = useCallback(async (userId: string) => {
    // Mock healthcare professional check since table doesn't exist
    return {
      requiresHealthcareMFA: true,
      professionType: 'medical',
      ahpraNumber: 'MED0001234567',
      explicitMFARequired: true
    };
  }, []);

  // Load MFA state
  const loadMFAState = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Check healthcare requirement
      const healthcareCheck = await checkHealthcareMFARequirement(user.id);
      
      // Mock MFA state since tables don't exist
      setMFAState({
        isEnabled: false,
        isEnrolled: false,
        enrollmentDate: undefined,
        lastUsed: undefined,
        backupCodesRemaining: 0,
        methods: [],
        requiresHealthcareMFA: healthcareCheck.requiresHealthcareMFA
      });

      setSMSData(null);

    } catch (error) {
      console.error('Error loading MFA state:', error);
      toast({
        title: "Error Loading MFA Settings",
        description: "Could not load multi-factor authentication settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, checkHealthcareMFARequirement, toast]);

  // Initialize MFA enrollment
  const initiateMFAEnrollment = useCallback(async (): Promise<MFASetupData | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      // Generate TOTP secret
      const response = await supabase.functions.invoke('healthcare-mfa-setup', {
        body: { 
          action: 'generate_totp_secret',
          user_id: user.id,
          app_name: 'JBSAAS Healthcare'
        }
      });

      if (response.error) throw response.error;

      const setupData: MFASetupData = response.data;

      toast({
        title: "MFA Setup Initiated",
        description: "Scan the QR code with your authenticator app to continue setup.",
      });

      return setupData;

    } catch (error) {
      console.error('Error initiating MFA enrollment:', error);
      toast({
        title: "MFA Setup Failed",
        description: "Could not initiate multi-factor authentication setup.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Complete MFA enrollment
  const completeMFAEnrollment = useCallback(async (
    secret: string, 
    verificationCode: string
  ): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('healthcare-mfa-setup', {
        body: {
          action: 'complete_totp_enrollment',
          user_id: user.id,
          secret,
          verification_code: verificationCode
        }
      });

      if (response.error) throw response.error;

      // Mock audit log since table doesn't exist
      console.log('MFA enrollment completed for user:', user.id);

      await loadMFAState();

      toast({
        title: "MFA Enrollment Complete",
        description: "Multi-factor authentication has been successfully enabled for your healthcare account.",
      });

      return true;

    } catch (error) {
      console.error('Error completing MFA enrollment:', error);
      toast({
        title: "MFA Enrollment Failed",
        description: "Could not complete multi-factor authentication setup. Please verify your code and try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, mfaState.requiresHealthcareMFA, loadMFAState, toast]);

  // Setup SMS backup
  const setupSMSBackup = useCallback(async (
    phoneNumber: string, 
    countryCode: string = '+61'
  ): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('healthcare-mfa-sms', {
        body: {
          action: 'setup_sms_backup',
          user_id: user.id,
          phone_number: phoneNumber,
          country_code: countryCode
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "SMS Verification Sent",
        description: "Please check your phone for a verification code.",
      });

      return true;

    } catch (error) {
      console.error('Error setting up SMS backup:', error);
      toast({
        title: "SMS Setup Failed",
        description: "Could not setup SMS backup. Please check your phone number and try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Verify SMS backup
  const verifySMSBackup = useCallback(async (verificationCode: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('healthcare-mfa-sms', {
        body: {
          action: 'verify_sms_backup',
          user_id: user.id,
          verification_code: verificationCode
        }
      });

      if (response.error) throw response.error;

      await loadMFAState();

      toast({
        title: "SMS Backup Verified",
        description: "SMS backup has been successfully configured.",
      });

      return true;

    } catch (error) {
      console.error('Error verifying SMS backup:', error);
      toast({
        title: "SMS Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, loadMFAState, toast]);

  // Generate new backup codes
  const generateBackupCodes = useCallback(async (): Promise<string[] | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('healthcare-mfa-setup', {
        body: {
          action: 'generate_backup_codes',
          user_id: user.id
        }
      });

      if (response.error) throw response.error;

      await loadMFAState();

      toast({
        title: "New Backup Codes Generated",
        description: "Save these codes in a secure location. Each code can only be used once.",
      });

      return response.data.backup_codes;

    } catch (error) {
      console.error('Error generating backup codes:', error);
      toast({
        title: "Backup Code Generation Failed",
        description: "Could not generate new backup codes.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, loadMFAState, toast]);

  // Verify MFA token
  const verifyMFA = useCallback(async (
    token: string, 
    method: 'totp' | 'sms' | 'backup_codes' = 'totp'
  ): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('healthcare-mfa-verify', {
        body: {
          user_id: user.id,
          token,
          method
        }
      });

      if (response.error) throw response.error;

      // Mock audit log since table doesn't exist
      console.log('MFA verification successful for user:', user.id, 'method:', method);

      await loadMFAState();

      return true;

    } catch (error) {
      console.error('Error verifying MFA:', error);
      
      // Mock audit log since table doesn't exist
      console.log('MFA verification failed for user:', user.id, 'method:', method);

      toast({
        title: "MFA Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, loadMFAState, toast]);

  // Disable MFA
  const disableMFA = useCallback(async (verificationCode: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('healthcare-mfa-setup', {
        body: {
          action: 'disable_mfa',
          user_id: user.id,
          verification_code: verificationCode
        }
      });

      if (response.error) throw response.error;

      // Mock audit log since table doesn't exist
      console.log('MFA disabled for user:', user.id);

      await loadMFAState();

      toast({
        title: "MFA Disabled",
        description: mfaState.requiresHealthcareMFA 
          ? "Warning: MFA is required for healthcare data access. Please re-enable as soon as possible."
          : "Multi-factor authentication has been disabled.",
        variant: mfaState.requiresHealthcareMFA ? "destructive" : "default",
      });

      return true;

    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast({
        title: "MFA Disable Failed",
        description: "Could not disable multi-factor authentication. Please verify your code.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, mfaState.requiresHealthcareMFA, loadMFAState, toast]);

  // Initialize on user change
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load MFA state when user changes
  useEffect(() => {
    if (user) {
      loadMFAState();
    }
  }, [user, loadMFAState]);

  return {
    // State
    loading,
    mfaState,
    smsData,
    user,

    // Actions
    initiateMFAEnrollment,
    completeMFAEnrollment,
    setupSMSBackup,
    verifySMSBackup,
    generateBackupCodes,
    verifyMFA,
    disableMFA,
    loadMFAState
  };
}; 