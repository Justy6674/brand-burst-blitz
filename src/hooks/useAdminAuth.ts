import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const { data } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'validate', sessionToken }
      });

      if (data?.success && data?.isValid) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_session_token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('admin_session_token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'login', password }
      });

      if (error) {
        return { success: false, error: 'Authentication service unavailable' };
      }

      if (data?.success) {
        localStorage.setItem('admin_session_token', data.sessionToken);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: data?.error || 'Invalid password' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_session_token');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };
};