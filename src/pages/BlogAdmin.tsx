import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Save, 
  Calendar, 
  Image as ImageIcon,
  Tag,
  Globe,
  FileText,
  Clock,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  tags: string[];
  author: string;
  published: boolean;
  featured: boolean;
  meta_description: string;
  scheduled_publish_at: string | null;
  created_at: string;
  updated_at: string;
}

const BlogAdmin = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const categories = ['Business Strategy', 'AI & Content', 'Social Media Marketing', 'Competitive Analysis', 'Industry Insights', 'Platform Updates'];

  const emptyPost: Partial<BlogPost> = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: 'Business Strategy',
    tags: [],
    author: 'JBSAAS Team',
    published: false,
    featured: false,
    meta_description: '',
    scheduled_publish_at: null,
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const savePost = async (postData: Partial<BlogPost>) => {
    try {
      // Validate required fields
      if (!postData.title || !postData.content) {
        toast({
          title: "Error",
          description: "Title and content are required",
          variant: "destructive",
        });
        return;
      }

      const slug = postData.slug || generateSlug(postData.title);
      const processedData = {
        title: postData.title,
        content: postData.content,
        slug,
        excerpt: postData.excerpt || '',
        featured_image: postData.featured_image || '',
        category: postData.category || 'Business Strategy',
        tags: Array.isArray(postData.tags) ? postData.tags : [],
        author: postData.author || 'JBSAAS Team',
        published: postData.published || false,
        featured: postData.featured || false,
        meta_description: postData.meta_description || '',
        scheduled_publish_at: postData.scheduled_publish_at || null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(processedData)
          .eq('id', editingPost.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Blog post updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([processedData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Blog post created successfully",
        });
      }

      setEditingPost(null);
      setIsCreating(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !post.published })
        .eq('id', post.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Post ${!post.published ? 'published' : 'unpublished'} successfully`,
      });
      fetchPosts();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: "Error",
        description: "Failed to update publish status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const currentPost = editingPost || (isCreating ? emptyPost : null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Blog Admin</h1>
          <p className="text-muted-foreground mt-2">Manage your blog posts and content</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-gradient-primary"
          disabled={isCreating || !!editingPost}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {currentPost && (
        <Card className="mb-8 glass-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={currentPost.title || ''}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = generateSlug(title);
                    if (editingPost) {
                      setEditingPost({ ...editingPost, title, slug });
                    } else {
                      setIsCreating(true);
                    }
                  }}
                  placeholder="Post title"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={currentPost.slug || ''}
                  onChange={(e) => {
                    const slug = e.target.value;
                    if (editingPost) {
                      setEditingPost({ ...editingPost, slug });
                    }
                  }}
                  placeholder="post-slug"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={currentPost.excerpt || ''}
                onChange={(e) => {
                  const excerpt = e.target.value;
                  if (editingPost) {
                    setEditingPost({ ...editingPost, excerpt });
                  }
                }}
                placeholder="Brief description of the post"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={currentPost.content || ''}
                onChange={(e) => {
                  const content = e.target.value;
                  if (editingPost) {
                    setEditingPost({ ...editingPost, content });
                  }
                }}
                placeholder="Post content (supports Markdown)"
                rows={12}
                className="font-mono"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={currentPost.category || categories[0]}
                  onChange={(e) => {
                    const category = e.target.value;
                    if (editingPost) {
                      setEditingPost({ ...editingPost, category });
                    }
                  }}
                  className="w-full bg-input border border-border rounded-md px-3 py-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={currentPost.author || 'JBSAAS Team'}
                  onChange={(e) => {
                    const author = e.target.value;
                    if (editingPost) {
                      setEditingPost({ ...editingPost, author });
                    }
                  }}
                  placeholder="Author name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="featured_image">Featured Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="featured_image"
                  value={currentPost.featured_image || ''}
                  onChange={(e) => {
                    const featured_image = e.target.value;
                    if (editingPost) {
                      setEditingPost({ ...editingPost, featured_image });
                    }
                  }}
                  placeholder="Image URL"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await handleImageUpload(file);
                      if (url && editingPost) {
                        setEditingPost({ ...editingPost, featured_image: url });
                      }
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={uploading}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="meta_description">Meta Description (SEO)</Label>
              <Textarea
                id="meta_description"
                value={currentPost.meta_description || ''}
                onChange={(e) => {
                  const meta_description = e.target.value;
                  if (editingPost) {
                    setEditingPost({ ...editingPost, meta_description });
                  }
                }}
                placeholder="SEO meta description"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={currentPost.published || false}
                  onCheckedChange={(published) => {
                    if (editingPost) {
                      setEditingPost({ ...editingPost, published });
                    }
                  }}
                />
                <Label htmlFor="published">Published</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={currentPost.featured || false}
                  onCheckedChange={(featured) => {
                    if (editingPost) {
                      setEditingPost({ ...editingPost, featured });
                    }
                  }}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => savePost(currentPost)} className="bg-gradient-primary">
                <Save className="h-4 w-4 mr-2" />
                Save Post
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingPost(null);
                  setIsCreating(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        <h2 className="text-2xl font-bold">All Posts</h2>
        {posts.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
            <p className="text-muted-foreground">Create your first blog post to get started.</p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="card-dark">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{post.title}</h3>
                      <div className="flex gap-2">
                        {post.published && (
                          <Badge className="bg-success text-success-foreground">
                            <Globe className="h-3 w-3 mr-1" />
                            Published
                          </Badge>
                        )}
                        {post.featured && (
                          <Badge className="bg-primary text-primary-foreground">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {!post.published && (
                          <Badge variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublished(post)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPost(post)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BlogAdmin;