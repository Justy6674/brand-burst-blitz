import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export interface AutomationRule {
  id?: string;
  business_id?: string;
  user_id?: string;
  name: string;
  event_type?: string;
  conditions: any;
  actions: any[];
  is_active?: boolean;
  execution_count?: number;
  last_executed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UseAutomationRulesReturn {
  rules: AutomationRule[];
  loading: boolean;
  error: string | null;
  createRule: (rule: Omit<AutomationRule, 'id'>) => Promise<AutomationRule | null>;
  updateRule: (id: string, updates: Partial<AutomationRule>) => Promise<AutomationRule | null>;
  deleteRule: (id: string) => Promise<boolean>;
  toggleRule: (id: string, isActive: boolean) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const useAutomationRules = (businessId?: string): UseAutomationRulesReturn => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRules = useCallback(async () => {
    if (!user) {
      setRules([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('automation_rules')
        .select('*')
        .eq('user_id', user.id);

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Type conversion for JSONB fields
      const typedData: AutomationRule[] = (data || []).map(item => ({
        ...item,
        conditions: typeof item.conditions === 'string' ? JSON.parse(item.conditions) : item.conditions,
        actions: Array.isArray(item.actions) ? item.actions : JSON.parse(item.actions as string || '[]')
      }));

      setRules(typedData);
    } catch (err: any) {
      console.error('Error fetching automation rules:', err);
      setError(err.message || 'Failed to fetch automation rules');
      toast.error('Failed to load automation rules');
    } finally {
      setLoading(false);
    }
  }, [user, businessId]);

  const createRule = useCallback(async (ruleData: Omit<AutomationRule, 'id'>): Promise<AutomationRule | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert({
          ...ruleData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const typedData: AutomationRule = {
        ...data,
        conditions: typeof data.conditions === 'string' ? JSON.parse(data.conditions) : data.conditions,
        actions: Array.isArray(data.actions) ? data.actions : JSON.parse(data.actions as string || '[]')
      };

      setRules(prev => [typedData, ...prev]);
      toast.success('Automation rule created successfully');
      return typedData;
    } catch (err: any) {
      console.error('Error creating automation rule:', err);
      toast.error('Failed to create automation rule');
      return null;
    }
  }, [user]);

  const updateRule = useCallback(async (id: string, updates: Partial<AutomationRule>): Promise<AutomationRule | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const typedData: AutomationRule = {
        ...data,
        conditions: typeof data.conditions === 'string' ? JSON.parse(data.conditions) : data.conditions,
        actions: Array.isArray(data.actions) ? data.actions : JSON.parse(data.actions as string || '[]')
      };

      setRules(prev => 
        prev.map(rule => 
          rule.id === id ? typedData : rule
        )
      );
      
      toast.success('Automation rule updated successfully');
      return typedData;
    } catch (err: any) {
      console.error('Error updating automation rule:', err);
      toast.error('Failed to update automation rule');
      return null;
    }
  }, [user]);

  const deleteRule = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setRules(prev => prev.filter(rule => rule.id !== id));
      toast.success('Automation rule deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting automation rule:', err);
      toast.error('Failed to delete automation rule');
      return false;
    }
  }, [user]);

  const toggleRule = useCallback(async (id: string, isActive: boolean): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .update({ is_active: isActive })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const typedData: AutomationRule = {
        ...data,
        conditions: typeof data.conditions === 'string' ? JSON.parse(data.conditions) : data.conditions,
        actions: Array.isArray(data.actions) ? data.actions : JSON.parse(data.actions as string || '[]')
      };

      setRules(prev => 
        prev.map(rule => 
          rule.id === id ? typedData : rule
        )
      );
      
      toast.success(`Automation rule ${isActive ? 'enabled' : 'disabled'}`);
      return true;
    } catch (err: any) {
      console.error('Error toggling automation rule:', err);
      toast.error('Failed to toggle automation rule');
      return false;
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('automation-rules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'automation_rules',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time automation rule change:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              const newRule: AutomationRule = {
                ...payload.new,
                name: payload.new.name || 'Auto Generated Rule',
                conditions: typeof payload.new.conditions === 'string' ? JSON.parse(payload.new.conditions) : payload.new.conditions,
                actions: Array.isArray(payload.new.actions) ? payload.new.actions : JSON.parse(payload.new.actions as string || '[]')
              };
              setRules(prev => {
                const exists = prev.find(r => r.id === payload.new.id);
                if (exists) return prev;
                return [newRule, ...prev];
              });
              break;
              
            case 'UPDATE':
              const updatedRule: AutomationRule = {
                ...payload.new,
                name: payload.new.name || 'Auto Generated Rule',
                conditions: typeof payload.new.conditions === 'string' ? JSON.parse(payload.new.conditions) : payload.new.conditions,
                actions: Array.isArray(payload.new.actions) ? payload.new.actions : JSON.parse(payload.new.actions as string || '[]')
              };
              setRules(prev => 
                prev.map(rule => 
                  rule.id === payload.new.id ? updatedRule : rule
                )
              );
              break;
              
            case 'DELETE':
              setRules(prev => prev.filter(rule => rule.id !== payload.old.id));
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return {
    rules,
    loading,
    error,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    refetch: fetchRules,
  };
};