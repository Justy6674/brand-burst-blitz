import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useBusinessProfileContext } from '@/contexts/BusinessProfileContext';
import type { Tables } from '@/integrations/supabase/types';

type Post = Tables<'posts'>;

interface UsePostsReturn {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  createPost: (post: Partial<Post>) => Promise<Post | null>;
  updatePost: (id: string, updates: Partial<Post>) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
  publishPost: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const usePosts = (): UsePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { activeProfile } = useBusinessProfileContext();

  const fetchPosts = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      let query = supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id);
      
      // Filter by active business profile if available
      if (activeProfile?.id) {
        query = query.eq('business_profile_id', activeProfile.id);
      }
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching posts:', fetchError);
        setError(fetchError.message);
        return;
      }

      setPosts(data || []);
    } catch (err: any) {
      console.error('Unexpected error fetching posts:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (postData: Partial<Post>): Promise<Post | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          user_id: user.id,
          business_profile_id: activeProfile?.id || null,
          type: postData.type || 'blog'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        toast({
          title: 'Failed to create post',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }

      setPosts(prev => [data, ...prev]);
      toast({
        title: 'Post created',
        description: 'Your post has been created successfully.',
      });

      return data;
    } catch (err: any) {
      console.error('Unexpected error creating post:', err);
      toast({
        title: 'Failed to create post',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updatePost = async (id: string, updates: Partial<Post>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error updating post:', error);
        toast({
          title: 'Failed to update post',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      setPosts(prev => prev.map(post => 
        post.id === id ? { ...post, ...updates } : post
      ));

      toast({
        title: 'Post updated',
        description: 'Your post has been updated successfully.',
      });

      return true;
    } catch (err: any) {
      console.error('Unexpected error updating post:', err);
      toast({
        title: 'Failed to update post',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deletePost = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting post:', error);
        toast({
          title: 'Failed to delete post',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      setPosts(prev => prev.filter(post => post.id !== id));
      toast({
        title: 'Post deleted',
        description: 'Your post has been deleted successfully.',
      });

      return true;
    } catch (err: any) {
      console.error('Unexpected error deleting post:', err);
      toast({
        title: 'Failed to delete post',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const publishPost = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error publishing post:', error);
        toast({
          title: 'Failed to publish post',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      setPosts(prev => prev.map(post => 
        post.id === id 
          ? { ...post, status: 'published', published_at: new Date().toISOString() }
          : post
      ));

      toast({
        title: 'Post published',
        description: 'Your post has been published successfully.',
      });

      return true;
    } catch (err: any) {
      console.error('Unexpected error publishing post:', err);
      toast({
        title: 'Failed to publish post',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user, activeProfile]); // Refetch when user or active profile changes

  return {
    posts,
    isLoading,
    error,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    refetch: fetchPosts,
  };
};