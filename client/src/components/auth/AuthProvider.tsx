import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authError: string | null;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  forceAuthReset: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to clear all auth data from localStorage
const clearLocalAuthData = () => {
  try {
    // Clear Supabase auth data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('supabase.auth.token') || 
          key.startsWith('sb-') || 
          key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    console.log('✅ Cleared invalid auth data from localStorage');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const clearAuthError = () => setAuthError(null);

  const forceAuthReset = () => {
    console.log('🔄 Forcing auth reset...');
    clearLocalAuthData();
    setUser(null);
    setSession(null);
    setAuthError(null);
    setRetryCount(0);
    setLoading(false);
    toast({
      title: "Session Cleared",
      description: "Your authentication session has been reset. Please sign in again.",
      variant: "default"
    });
  };

  const handleAuthError = (error: any, context: string) => {
    console.error(`🚨 Auth Error (${context}):`, error);
    
    // Check for specific auth errors that require localStorage cleanup
    if (error?.message?.includes('refresh_token_not_found') ||
        error?.message?.includes('Invalid Refresh Token') ||
        error?.message?.includes('JWT expired') ||
        error?.status === 400) {
      
      console.log('🧹 Detected invalid/expired tokens, cleaning up...');
      clearLocalAuthData();
      setAuthError('Your session has expired. Please sign in again.');
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    // Handle other auth errors
    if (retryCount < 2) {
      console.log(`🔄 Retrying auth operation (${retryCount + 1}/2)...`);
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        supabase.auth.getSession();
      }, 1000 * (retryCount + 1));
    } else {
      setAuthError(`Authentication error: ${error?.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log(`🔐 Auth Event: ${event}`, session ? 'Session exists' : 'No session');

        try {
          setSession(session);
          setUser(session?.user ?? null);
          setAuthError(null);
          setRetryCount(0);

          // Handle different auth events
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ User signed in successfully');
            
            // Create user profile if it doesn't exist
            setTimeout(async () => {
              try {
                const { data: existingProfile } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('user_id', session.user.id)
                  .single();

                if (!existingProfile) {
                  const { error } = await supabase
                    .from('profiles')
                    .insert({
                      user_id: session.user.id,
                      full_name: session.user.user_metadata?.business_name || session.user.email?.split('@')[0]
                    });

                  if (error) console.error('Error creating user profile:', error);
                }

                // Also create/update users table entry for compatibility
                const { error: userError } = await supabase
                  .from('users')
                  .upsert({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.business_name || session.user.email?.split('@')[0],
                    role: 'trial'
                  }, {
                    onConflict: 'id'
                  });

                if (userError) console.error('Error creating user entry:', userError);
              } catch (error) {
                console.error('Error in post-signin setup:', error);
              }
            }, 0);
          }

          if (event === 'SIGNED_OUT') {
            console.log('👋 User signed out');
            setUser(null);
            setSession(null);
            clearLocalAuthData();
          }

          if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 Token refreshed successfully');
            setRetryCount(0);
          }

          if (loading) {
            setLoading(false);
          }

        } catch (error) {
          handleAuthError(error, 'Auth state change');
        }
      }
    );

    // THEN check for existing session with error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          handleAuthError(error, 'Initial session check');
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          console.log('🔍 Initial session check complete', session ? 'Session found' : 'No session');
        }
      } catch (error) {
        if (mounted) {
          handleAuthError(error, 'Session initialization');
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loading, retryCount]);

  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      clearLocalAuthData();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setAuthError(null);
      setRetryCount(0);
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      // Force clear even if signOut fails
      forceAuthReset();
    }
  };

  const value = {
    user,
    session,
    loading,
    authError,
    signOut,
    clearAuthError,
    forceAuthReset
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};