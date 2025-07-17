import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Tables } from '@/integrations/supabase/types';

type ContentTemplate = Tables<'content_templates'>;

interface UseContentTemplatesReturn {
  templates: ContentTemplate[];
  publicTemplates: ContentTemplate[];
  isLoading: boolean;
  error: string | null;
  createTemplate: (template: Omit<Partial<ContentTemplate>, 'user_id'> & { 
    name: string; 
    template_content: string; 
    type: ContentTemplate['type']; 
  }) => Promise<ContentTemplate | null>;
  updateTemplate: (id: string, updates: Partial<ContentTemplate>) => Promise<ContentTemplate | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  duplicateTemplate: (id: string) => Promise<ContentTemplate | null>;
  refetch: () => Promise<void>;
}

export const useContentTemplates = (): UseContentTemplatesReturn => {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<ContentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTemplates = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Fetch user's templates
      const { data: userTemplates, error: userError } = await supabase
        .from('content_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (userError) throw userError;

      // Fetch public templates
      const { data: publicTemplatesData, error: publicError } = await supabase
        .from('content_templates')
        .select('*')
        .eq('is_public', true)
        .neq('user_id', user.id)
        .order('usage_count', { ascending: false })
        .limit(20);

      if (publicError) throw publicError;

      setTemplates(userTemplates || []);
      setPublicTemplates(publicTemplatesData || []);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.message || 'Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<Partial<ContentTemplate>, 'user_id'> & { 
    name: string; 
    template_content: string; 
    type: ContentTemplate['type']; 
  }): Promise<ContentTemplate | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('content_templates')
        .insert({
          name: templateData.name,
          template_content: templateData.template_content,
          type: templateData.type,
          ai_prompt_template: templateData.ai_prompt_template || null,
          business_profile_id: templateData.business_profile_id || null,
          default_tone: templateData.default_tone || null,
          tags: templateData.tags || null,
          is_public: templateData.is_public || false,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error creating template:', err);
      setError(err.message || 'Failed to create template');
      return null;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<ContentTemplate>): Promise<ContentTemplate | null> => {
    try {
      const { data, error } = await supabase
        .from('content_templates')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (err: any) {
      console.error('Error updating template:', err);
      setError(err.message || 'Failed to update template');
      return null;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('content_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting template:', err);
      setError(err.message || 'Failed to delete template');
      return false;
    }
  };

  const duplicateTemplate = async (id: string): Promise<ContentTemplate | null> => {
    try {
      const template = templates.find(t => t.id === id) || publicTemplates.find(t => t.id === id);
      if (!template) return null;

      const { data, error } = await supabase
        .from('content_templates')
        .insert({
          name: `${template.name} (Copy)`,
          template_content: template.template_content,
          type: template.type,
          ai_prompt_template: template.ai_prompt_template,
          business_profile_id: template.business_profile_id,
          default_tone: template.default_tone,
          tags: template.tags,
          is_public: false,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error duplicating template:', err);
      setError(err.message || 'Failed to duplicate template');
      return null;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates,
    publicTemplates,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    refetch: fetchTemplates,
  };
};