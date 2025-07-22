import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuditLogData {
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
}

export const useAuditLog = () => {
  const logAction = useCallback(async (data: AuditLogData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('audit_logs').insert({
        ...data,
        user_id: user?.id,
        ip_address: await getUserIP(),
        user_agent: navigator.userAgent,
        old_values: data.old_values || {},
        new_values: data.new_values || {},
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  }, []);

  const logCreate = useCallback(async (tableName: string, recordId: string, newValues: any) => {
    await logAction({
      action: 'CREATE',
      table_name: tableName,
      record_id: recordId,
      new_values: newValues,
    });
  }, [logAction]);

  const logUpdate = useCallback(async (tableName: string, recordId: string, oldValues: any, newValues: any) => {
    await logAction({
      action: 'UPDATE',
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues,
    });
  }, [logAction]);

  const logDelete = useCallback(async (tableName: string, recordId: string, oldValues: any) => {
    await logAction({
      action: 'DELETE',
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
    });
  }, [logAction]);

  const logLogin = useCallback(async () => {
    await logAction({
      action: 'LOGIN',
    });
  }, [logAction]);

  const logLogout = useCallback(async () => {
    await logAction({
      action: 'LOGOUT',
    });
  }, [logAction]);

  return {
    logAction,
    logCreate,
    logUpdate,
    logDelete,
    logLogin,
    logLogout,
  };
};

async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}