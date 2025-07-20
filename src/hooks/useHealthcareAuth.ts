import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  last_compliance_check?: string;
  practice_locations?: string[];
}

export interface AuthState {
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
        practitionerName: 'Dr. Healthcare Professional', // Would come from AHPRA
        registrationStatus: 'current',
        specialty: profession === 'medical' ? 'General Practice' : undefined,
        endorsements: profession === 'nursing' ? ['Nurse Practitioner'] : undefined
      };
    }

    return { isValid: false };
  }, [validateAHPRARegistration]);

  // Healthcare professional signup with AHPRA validation
  const signUpHealthcareProfessional = useCallback(async (data: {
    email: string;
    password: string;
    ahpra_registration: string;
    profession_type: keyof typeof AHPRA_REGISTRATION_PATTERNS;
    practice_name: string;
    specialty?: string;
    practice_type: 'solo' | 'group' | 'network';
    practice_locations?: string[];
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
          data: {
            user_type: 'healthcare_professional',
            ahpra_registration: data.ahpra_registration,
            profession_type: data.profession_type,
            practice_name: data.practice_name
          }
        }
      });

      if (authError) throw authError;

      // Step 4: Create healthcare professional profile
      const { error: profileError } = await supabase
        .from('healthcare_professionals')
        .insert({
          id: authData.user?.id,
          email: data.email,
          ahpra_registration: data.ahpra_registration,
          profession_type: data.profession_type,
          practice_name: data.practice_name,
          specialty: data.specialty,
          practice_type: data.practice_type,
          verification_status: 'verified', // Auto-verified since AHPRA check passed
          compliance_training_completed: false,
          practice_locations: data.practice_locations || [],
          practitioner_name: verificationResult.practitionerName,
          registration_status: verificationResult.registrationStatus,
          endorsements: verificationResult.endorsements
        });

      if (profileError) throw profileError;

      toast({
        title: "Healthcare Professional Account Created",
        description: "Your AHPRA registration has been verified. Please complete compliance training to access all features.",
      });

      return { success: true, user: authData.user };

    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [validateAHPRARegistration, verifyAHPRARegistration, toast]);

  // Sign in with healthcare validation
  const signInHealthcareProfessional = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // Fetch healthcare professional profile
      const { data: profile, error: profileError } = await supabase
        .from('healthcare_professionals')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Healthcare professional profile not found. Please contact support.');
      }

      // Check if compliance training is required
      if (!profile.compliance_training_completed) {
        toast({
          title: "Compliance Training Required",
          description: "Please complete AHPRA compliance training to access all features.",
          variant: "default"
        });
      }

      setAuthState({
        user: profile,
        isLoading: false,
        isAuthenticated: true,
        verificationStatus: profile.verification_status
      });

      return { success: true, user: profile };

    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      });
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  }, [toast]);

  // Complete compliance training
  const completeComplianceTraining = useCallback(async () => {
    if (!authState.user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('healthcare_professionals')
        .update({ 
          compliance_training_completed: true,
          last_compliance_check: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        user: prev.user ? {
          ...prev.user,
          compliance_training_completed: true,
          last_compliance_check: new Date().toISOString()
        } : null
      }));

      toast({
        title: "Compliance Training Completed",
        description: "You now have full access to all AHPRA-compliant features.",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Training Update Failed",
        description: error.message,
        variant: "destructive"
      });
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
    return { success: !error, error };
  }, []);

  // Check auth state on mount
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch healthcare professional profile
        const { data: profile } = await supabase
          .from('healthcare_professionals')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setAuthState({
            user: profile,
            isLoading: false,
            isAuthenticated: true,
            verificationStatus: profile.verification_status
          });
        } else {
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