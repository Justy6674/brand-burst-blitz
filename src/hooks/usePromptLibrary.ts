import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Prompt = Tables<'prompts'>;

interface UsePromptLibraryReturn {
  prompts: Prompt[] | undefined;
  isLoading: boolean;
  error: string | null;
  createPrompt: (data: Omit<TablesInsert<'prompts'>, 'created_by'>) => Promise<Prompt>;
  updatePrompt: (id: string, data: Partial<TablesUpdate<'prompts'>>) => Promise<Prompt>;
  deletePrompt: (id: string) => Promise<void>;
  createVersion: (basePromptId: string, data: Partial<TablesInsert<'prompts'>>) => Promise<Prompt>;
  togglePublicStatus: (id: string) => Promise<void>;
  incrementUsage: (id: string) => Promise<void>;
  getPromptVersions: (basePromptId: string) => Prompt[];
  getPopularPrompts: () => Prompt[];
  searchPrompts: (query: string) => Prompt[];
  refetch: () => void;
}

export const usePromptLibrary = (): UsePromptLibraryReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all prompts (user's own + public)
  const { data: prompts, isLoading, error, refetch } = useQuery({
    queryKey: ['prompts', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .or(`created_by.eq.${user.id},is_public.eq.true`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Prompt[];
    },
    enabled: !!user,
  });

  // Create new prompt
  const createPromptMutation = useMutation({
    mutationFn: async (data: Omit<TablesInsert<'prompts'>, 'created_by'>) => {
      if (!user) throw new Error('No user');

      const { data: newPrompt, error } = await supabase
        .from('prompts')
        .insert({
          ...data,
          created_by: user.id,
          version: 1,
          usage_count: 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return newPrompt as Prompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast({
        title: "Prompt Created",
        description: "New prompt has been added to your library.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create prompt.",
        variant: "destructive",
      });
    },
  });

  // Update prompt
  const updatePromptMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TablesUpdate<'prompts'>> }) => {
      const { data: updatedPrompt, error } = await supabase
        .from('prompts')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedPrompt as Prompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast({
        title: "Prompt Updated",
        description: "Prompt has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update prompt.",
        variant: "destructive",
      });
    },
  });

  // Delete prompt
  const deletePromptMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('prompts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast({
        title: "Prompt Deleted",
        description: "Prompt has been moved to archive.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete prompt.",
        variant: "destructive",
      });
    },
  });

  // Create new version
  const createVersionMutation = useMutation({
    mutationFn: async ({ basePromptId, data }: { basePromptId: string; data: Partial<TablesInsert<'prompts'>> }) => {
      if (!user) throw new Error('No user');

      // Get the base prompt to determine next version number
      const { data: basePrompt, error: baseError } = await supabase
        .from('prompts')
        .select('version, name, type, platform, category')
        .eq('id', basePromptId)
        .single();

      if (baseError) throw baseError;

      // Get highest version number for this prompt name
      const { data: versions, error: versionsError } = await supabase
        .from('prompts')
        .select('version')
        .eq('name', basePrompt.name)
        .eq('created_by', user.id)
        .order('version', { ascending: false });

      if (versionsError) throw versionsError;

      const nextVersion = Math.max(...(versions?.map(v => v.version || 1) || [1])) + 1;

      const { data: newVersion, error } = await supabase
        .from('prompts')
        .insert({
          name: basePrompt.name,
          type: basePrompt.type,
          platform: basePrompt.platform,
          category: basePrompt.category,
          prompt_text: data.prompt_text || '',
          created_by: user.id,
          version: nextVersion,
          usage_count: 0,
          is_active: true,
          variables: data.variables,
        })
        .select()
        .single();

      if (error) throw error;
      return newVersion as Prompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast({
        title: "New Version Created",
        description: "A new version of the prompt has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create version.",
        variant: "destructive",
      });
    },
  });

  // Toggle public status
  const togglePublicMutation = useMutation({
    mutationFn: async (id: string) => {
      const prompt = prompts?.find(p => p.id === id);
      if (!prompt) throw new Error('Prompt not found');

      const { error } = await supabase
        .from('prompts')
        .update({ is_public: !prompt.is_public })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast({
        title: "Visibility Updated",
        description: "Prompt visibility has been changed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update visibility.",
        variant: "destructive",
      });
    },
  });

  // Increment usage count
  const incrementUsageMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get current usage count first
      const { data: currentPrompt, error: fetchError } = await supabase
        .from('prompts')
        .select('usage_count')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('prompts')
        .update({ 
          usage_count: (currentPrompt.usage_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });

  // Helper functions
  const getPromptVersions = (basePromptId: string): Prompt[] => {
    if (!prompts) return [];
    
    const basePrompt = prompts.find(p => p.id === basePromptId);
    if (!basePrompt) return [];
    
    return prompts
      .filter(p => p.name === basePrompt.name && p.created_by === basePrompt.created_by)
      .sort((a, b) => (b.version || 1) - (a.version || 1));
  };

  const getPopularPrompts = (): Prompt[] => {
    if (!prompts) return [];
    
    return prompts
      .filter(p => p.is_public && (p.usage_count || 0) > 0)
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
      .slice(0, 10);
  };

  const searchPrompts = (query: string): Prompt[] => {
    if (!prompts || !query.trim()) return prompts || [];
    
    const searchTerm = query.toLowerCase();
    return prompts.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.prompt_text.toLowerCase().includes(searchTerm) ||
      p.category?.toLowerCase().includes(searchTerm) ||
      p.type.toLowerCase().includes(searchTerm)
    );
  };

  return {
    prompts,
    isLoading,
    error: error?.message || null,
    createPrompt: createPromptMutation.mutateAsync,
    updatePrompt: (id: string, data: Partial<TablesUpdate<'prompts'>>) => 
      updatePromptMutation.mutateAsync({ id, data }),
    deletePrompt: deletePromptMutation.mutateAsync,
    createVersion: (basePromptId: string, data: Partial<TablesInsert<'prompts'>>) =>
      createVersionMutation.mutateAsync({ basePromptId, data }),
    togglePublicStatus: togglePublicMutation.mutateAsync,
    incrementUsage: incrementUsageMutation.mutateAsync,
    getPromptVersions,
    getPopularPrompts,
    searchPrompts,
    refetch,
  };
};