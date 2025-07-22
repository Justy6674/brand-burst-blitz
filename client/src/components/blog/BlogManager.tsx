import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Globe, 
  Settings, 
  Send,
  ExternalLink,
  Copy,
  FileText,
  Rss,
  Webhook,
  Monitor,
  Code2,
  Zap,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  published: boolean;
  scheduled_publish_at?: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  featured_image?: string;
  business_profile_id?: string;
  meta_description?: string;
  author: string;
  category?: string;
  featured?: boolean;
  published_at?: string;
}

interface BlogIntegration {
  id: string;
  integration_name: string;
  integration_type: string;
  configuration: any;
  is_active: boolean;
  last_sync_at?: string;
}

export const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [integrations, setIntegrations] = useState<BlogIntegration[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  
  const { businessProfiles } = useBusinessProfile();
  const { toast } = useToast();

  // Form state for creating/editing posts
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    meta_description: '',
    published: false,
    scheduled_publish_at: '',
    featured_image: ''
  });

  useEffect(() => {
    loadBlogPosts();
    loadIntegrations();
  }, []);

  const loadBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('website_integrations')
        .select('*')
        .eq('integration_type', 'blog');

      if (error) throw error;
      setIntegrations((data || []).map(item => ({
        ...item,
        name: item.integration_name,
        type: item.integration_type as any
      })));
    } catch (error) {
      console.error('Error loading integrations:', error);
    }
  };

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSavePost = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const slug = createSlug(formData.title);
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const postData = {
        ...formData,
        slug,
        tags,
        excerpt: formData.excerpt || formData.content.substring(0, 160) + '...',
        business_profile_id: businessProfiles?.[0]?.id,
        author: 'JBSAAS Team',
        published_at: formData.published ? new Date().toISOString() : null,
        scheduled_publish_at: formData.scheduled_publish_at || null
      };

      if (selectedPost) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', selectedPost.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Blog post updated successfully",
        });
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Blog post created successfully",
        });
      }

      // Reset form and reload posts
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        tags: '',
        meta_description: '',
        published: false,
        scheduled_publish_at: '',
        featured_image: ''
      });
      setSelectedPost(null);
      setIsEditing(false);
      loadBlogPosts();

      // Trigger publishing pipeline if published
      if (formData.published) {
        await triggerPublishing(postData);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive",
      });
    }
  };

  const triggerPublishing = async (postData: any) => {
    try {
      // Call the multi-site publishing edge function
      const { error } = await supabase.functions.invoke('multi-site-publisher', {
        body: {
          post: postData,
          business_id: businessProfiles?.[0]?.id,
          publish_immediately: true
        }
      });

      if (error) throw error;
      
      toast({
        title: "Publishing Started",
        description: "Your blog post is being published to all connected platforms",
      });
    } catch (error) {
      console.error('Error triggering publishing:', error);
      toast({
        title: "Publishing Error",
        description: "Failed to publish to external platforms",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
      loadBlogPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      tags: post.tags.join(', '),
      meta_description: post.meta_description || '',
      published: post.published,
      scheduled_publish_at: post.scheduled_publish_at || '',
      featured_image: post.featured_image || ''
    });
    setIsEditing(true);
  };

  const generateEmbedCode = (postId: string) => {
    const embedCode = `<div id="jbsaas-blog-post-${postId}"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://api.jbsaas.com/embed/blog.js';
  script.setAttribute('data-post-id', '${postId}');
  script.setAttribute('data-business-id', '${businessProfiles?.[0]?.id}');
  document.head.appendChild(script);
})();
</script>`;

    navigator.clipboard.writeText(embedCode).then(() => {
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard",
      });
    });
  };

  const getStatusBadge = (post: BlogPost) => {
    if (post.published) {
      return <Badge variant="default">Published</Badge>;
    } else if (post.scheduled_publish_at) {
      return <Badge variant="outline">Scheduled</Badge>;
    } else {
      return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Manager</h1>
          <p className="text-muted-foreground">
            Create, manage, and publish blog content across all your platforms
          </p>
        </div>
        
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedPost(null);
              setFormData({
                title: '',
                content: '',
                excerpt: '',
                tags: '',
                meta_description: '',
                published: false,
                scheduled_publish_at: '',
                featured_image: ''
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Blog Post
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPost ? 'Edit Blog Post' : 'Create New Blog Post'}
              </DialogTitle>
              <DialogDescription>
                Create engaging blog content that will be published across all your connected platforms
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter blog post title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="published">Publishing Status</Label>
                  <Select 
                    value={formData.published ? 'published' : (formData.scheduled_publish_at ? 'scheduled' : 'draft')} 
                    onValueChange={(value) => {
                      if (value === 'published') {
                        setFormData({ ...formData, published: true, scheduled_publish_at: '' });
                      } else if (value === 'scheduled') {
                        setFormData({ ...formData, published: false, scheduled_publish_at: new Date().toISOString().slice(0, 16) });
                      } else {
                        setFormData({ ...formData, published: false, scheduled_publish_at: '' });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.scheduled_publish_at && !formData.published && (
                <div className="space-y-2">
                  <Label htmlFor="scheduled_publish_at">Scheduled Date & Time</Label>
                  <Input
                    id="scheduled_publish_at"
                    type="datetime-local"
                    value={formData.scheduled_publish_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_publish_at: e.target.value })}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your blog post content here..."
                  rows={12}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short description of the post (optional - will be auto-generated if empty)"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="marketing, business, strategy (comma-separated)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="SEO meta description (recommended 150-160 characters)"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePost}>
                  {selectedPost ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Blog Posts
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading blog posts...</div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first blog post to get started with content publishing
                </p>
                <Button onClick={() => setIsEditing(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="line-clamp-1">{post.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {post.excerpt}
                        </CardDescription>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          {post.published_at && (
                            <span>• Published {new Date(post.published_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(post)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {post.tags.length > 0 && (
                          <div className="flex space-x-1">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateEmbedCode(post.id)}
                        >
                          <Code2 className="w-4 h-4 mr-1" />
                          Embed
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPost(post)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  WordPress
                </CardTitle>
                <CardDescription>
                  Automatically publish to WordPress sites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure WordPress
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  REST API
                </CardTitle>
                <CardDescription>
                  Access content via REST API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Code2 className="w-4 h-4 mr-2" />
                  Generate API Key
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rss className="w-5 h-5" />
                  RSS Feed
                </CardTitle>
                <CardDescription>
                  Syndicate content via RSS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Rss className="w-4 h-4 mr-2" />
                  Generate RSS Feed
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5" />
                  Webhooks
                </CardTitle>
                <CardDescription>
                  Real-time content notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Webhook className="w-4 h-4 mr-2" />
                  Setup Webhooks
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Embed Widget
                </CardTitle>
                <CardDescription>
                  Add blog widget to any site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Globe className="w-4 h-4 mr-2" />
                  Generate Widget
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Zapier
                </CardTitle>
                <CardDescription>
                  Connect to 3000+ apps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Zapier
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{posts.length}</div>
                <p className="text-xs text-muted-foreground">
                  {posts.filter(p => p.published).length} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {posts.filter(p => p.published).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Live blog posts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {posts.filter(p => !p.published && !p.scheduled_publish_at).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Work in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {posts.filter(p => p.scheduled_publish_at && !p.published).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Future posts
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blog Settings</CardTitle>
              <CardDescription>
                Configure your blog preferences and publishing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-publish to WordPress</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically publish new posts to connected WordPress sites
                  </div>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Send webhook notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Notify external services when content is published
                  </div>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Generate RSS feed</Label>
                  <div className="text-sm text-muted-foreground">
                    Make content available via RSS syndication
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};