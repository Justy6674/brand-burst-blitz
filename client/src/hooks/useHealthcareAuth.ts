import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthErrorHandler } from '@/hooks/useAuthErrorHandler';

// AHPRA registration number validation patterns
const AHPRA_REGISTRATION_PATTERNS = {
  medical: /^MED\d{10}$/,
  nursing: /^NMW\d{10}$/,
  pharmacy: /^PHA\d{10}$/,
  dental: /^DEN\d{10}$/,
  physiotherapy: /^PHY\d{10}$/,
  psychology: /^PSY\d{10}$/,
  optometry: /^OPT\d{10}$/,
  osteopathy: /^OST\d{10}$/,
  chiropractic: /^CHI\d{10}$/,
  podiatry: /^POD\d{10}$/,
  chinese_medicine: /^CMR\d{10}$/,
  aboriginal_health: /^AHP\d{10}$/,
  occupational_therapy: /^OCC\d{10}$/,
  social_work: /^SWK\d{10}$/
};

export interface HealthcareProfessional {
  id: string;
  email: string;
  ahpra_registration: string;
  profession_type: keyof typeof AHPRA_REGISTRATION_PATTERNS;
  practice_name?: string;
  specialty?: string;
  practice_type: 'solo' | 'group' | 'network';
  verification_status: 'pending' | 'verified' | 'rejected';
  compliance_training_completed: boolean;
  practice_locations?: string[];
}

interface AuthState {
  user: HealthcareProfessional | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected' | null;
}

export const useHealthcareAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    verificationStatus: null
  });
  
  const { toast } = useToast();
  const { handleSignUpError, handleSignInError } = useAuthErrorHandler();

  // Validate AHPRA registration number format
  const validateAHPRARegistration = useCallback((registration: string, profession: keyof typeof AHPRA_REGISTRATION_PATTERNS): boolean => {
    const pattern = AHPRA_REGISTRATION_PATTERNS[profession];
    return pattern.test(registration.toUpperCase());
  }, []);

  // Check AHPRA registration against database (mock implementation)
  const verifyAHPRARegistration = useCallback(async (registration: string, profession: keyof typeof AHPRA_REGISTRATION_PATTERNS): Promise<{
    isValid: boolean;
    practitionerName?: string;
    registrationStatus?: 'current' | 'expired' | 'suspended';
    specialty?: string;
    endorsements?: string[];
  }> => {
    // In production, this would call the actual AHPRA API
    // For now, we'll simulate the validation
    
    const isFormatValid = validateAHPRARegistration(registration, profession);
    if (!isFormatValid) {
      return { isValid: false };
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock validation result (in production, this would be real AHPRA data)
    const mockValidRegistrations = [
      'MED0001234567', 'NMW0001234567', 'PHY0001234567', 'PSY0001234567',
      'DEN0001234567', 'OPT0001234567', 'OCC0001234567', 'SWK0001234567'
    ];

    const isValid = mockValidRegistrations.includes(registration.toUpperCase());
    
    if (isValid) {
      return {
        isValid: true,
        practitionerName: 'Dr. John Smith',
        registrationStatus: 'current',
        specialty: 'General Practice',
        endorsements: ['Scheduled Medicines', 'Skin Cancer Surgery']
      };
    }

    return { isValid: false };
  }, [validateAHPRARegistration]);

  // Healthcare professional sign up
  const signUpHealthcareProfessional = useCallback(async (data: {
    email: string;
    password: string;
    ahpra_registration: string;
    profession_type: keyof typeof AHPRA_REGISTRATION_PATTERNS;
    practice_name: string;
    practice_type: 'solo' | 'group' | 'network';
  }) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Step 1: Validate AHPRA registration format
      const isFormatValid = validateAHPRARegistration(data.ahpra_registration, data.profession_type);
      if (!isFormatValid) {
        throw new Error(`Invalid AHPRA registration format for ${data.profession_type}. Expected format: ${AHPRA_REGISTRATION_PATTERNS[data.profession_type].source}`);
      }

      // Step 2: Verify AHPRA registration with AHPRA database
      const verificationResult = await verifyAHPRARegistration(data.ahpra_registration, data.profession_type);
      if (!verificationResult.isValid) {
        throw new Error('AHPRA registration number not found or invalid. Please check your registration number and try again.');
      }

      if (verificationResult.registrationStatus !== 'current') {
        throw new Error(`AHPRA registration status is ${verificationResult.registrationStatus}. Only current registrations are accepted.`);
      }

      // Step 3: Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/healthcare-content`,
          data: {
            user_type: 'healthcare_professional',
            ahpra_registration: data.ahpra_registration,
            profession_type: data.profession_type,
            practice_name: data.practice_name
          }
        }
      });

      if (authError) throw authError;

      // Check if email confirmation is required
      if (authData.user && !authData.user.email_confirmed_at) {
        toast({
          title: "Email Confirmation Required",
          description: "Please check your email to confirm your account before signing in.",
          variant: "default"
        });
      }

      // Step 4: Create healthcare professional profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('healthcare_professionals')
          .insert({
            user_id: authData.user.id,
            email: data.email,
            ahpra_registration: data.ahpra_registration,
            profession_type: data.profession_type,
            practice_type: data.practice_type,
            verification_status: 'pending',
            compliance_training_completed: false
          });

        if (profileError) {
          console.error('Error creating professional profile:', profileError);
          // Don't throw here as the auth user was created successfully
        }
      }

      return { 
        success: true, 
        message: 'Healthcare professional account created successfully. Please verify your email.',
        requiresEmailVerification: !authData.user?.email_confirmed_at
      };

    } catch (error) {
      const errorMessage = handleSignUpError(error);
      return { success: false, error: errorMessage };
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [validateAHPRARegistration, verifyAHPRARegistration, toast, handleSignUpError]);

  // Healthcare professional sign in
  const signInHealthcareProfessional = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Get healthcare professional profile
        const { data: professionalData, error: profileError } = await supabase
          .from('healthcare_professionals')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching professional profile:', profileError);
          throw new Error('Healthcare professional profile not found. Please contact support.');
        }

        if (professionalData) {
          const healthcareProfessional: HealthcareProfessional = {
            id: professionalData.user_id,
            email: professionalData.email,
            ahpra_registration: professionalData.ahpra_registration || '',
            profession_type: professionalData.profession_type as keyof typeof AHPRA_REGISTRATION_PATTERNS,
            practice_type: (professionalData.practice_type as 'solo' | 'group' | 'network') || 'solo',
            verification_status: (professionalData.verification_status as 'pending' | 'verified' | 'rejected') || 'pending',
            compliance_training_completed: professionalData.compliance_training_completed || false
          };

          setAuthState({
            user: healthcareProfessional,
            isLoading: false,
            isAuthenticated: true,
            verificationStatus: healthcareProfessional.verification_status
          });
        }
      }

      return { success: true, message: 'Signed in successfully' };

    } catch (error) {
      const errorMessage = handleSignInError(error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        verificationStatus: null
      });
      return { success: false, error: errorMessage };
    }
  }, [handleSignInError]);

  // Complete compliance training
  const completeComplianceTraining = useCallback(async () => {
    if (!authState.user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('healthcare_professionals')
        .update({ 
          compliance_training_completed: true
        })
        .eq('user_id', authState.user.id);

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        user: prev.user ? {
          ...prev.user,
          compliance_training_completed: true
        } : null
      }));

      toast({
        title: "Compliance Training Complete",
        description: "You have successfully completed the AHPRA compliance training.",
        variant: "default"
      });

      return { success: true };
    } catch (error) {
      console.error('Error completing compliance training:', error);
      return { success: false, error: error.message };
    }
  }, [authState.user, toast]);

  // Sign out
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        verificationStatus: null
      });
    }
    
    return { success: !error };
  }, []);

  // Check auth state on mount
  useEffect(() => {
      const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get healthcare professional profile
          const { data: professionalData } = await supabase
            .from('healthcare_professionals')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (professionalData) {
            const healthcareProfessional: HealthcareProfessional = {
              id: professionalData.user_id,
              email: professionalData.email,
              ahpra_registration: professionalData.ahpra_registration || '',
              profession_type: professionalData.profession_type as keyof typeof AHPRA_REGISTRATION_PATTERNS,
              practice_type: (professionalData.practice_type as 'solo' | 'group' | 'network') || 'solo',
              verification_status: (professionalData.verification_status as 'pending' | 'verified' | 'rejected') || 'pending',
              compliance_training_completed: professionalData.compliance_training_completed || false
            };

            setAuthState({
              user: healthcareProfessional,
              isLoading: false,
              isAuthenticated: true,
              verificationStatus: healthcareProfessional.verification_status
            });
          } else {
            // Fallback if professional profile doesn't exist
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
              verificationStatus: null
            });
          }
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            verificationStatus: null
          });
        }
      };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          verificationStatus: null
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    ...authState,
    validateAHPRARegistration,
    verifyAHPRARegistration,
    signUpHealthcareProfessional,
    signInHealthcareProfessional,
    completeComplianceTraining,
    signOut
  };
}; 