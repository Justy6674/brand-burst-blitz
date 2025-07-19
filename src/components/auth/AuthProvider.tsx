import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events
        if (event === 'SIGNED_IN') {
          // Create user profile if it doesn't exist
          if (session?.user) {
            setTimeout(async () => {
              // Check if profile exists
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', session.user.id)
                .single();

              if (!existingProfile) {
                // Create profile if it doesn't exist
                const { error } = await supabase
                  .from('profiles')
                  .insert({
                    user_id: session.user.id,
                    full_name: session.user.user_metadata?.business_name || session.user.email?.split('@')[0]
                  });

                if (error) {
                  console.error('Error creating user profile:', error);
                }
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

              if (userError) {
                console.error('Error creating user entry:', userError);
              }
            }, 0);
          }
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign out.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};