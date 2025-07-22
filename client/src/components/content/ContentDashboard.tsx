import React, { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Eye, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { usePosts } from '@/hooks/usePosts';
import { PostEditor } from './PostEditor';
import type { Tables } from '@/integrations/supabase/types';

type Post = Tables<'posts'>;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return 'bg-green-500/10 text-green-700 border-green-200';
    case 'scheduled': return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'draft': return 'bg-gray-500/10 text-gray-700 border-gray-200';
    default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'blog': return 'bg-purple-500/10 text-purple-700 border-purple-200';
    case 'social': return 'bg-green-500/10 text-green-700 border-green-200';
    case 'ad': return 'bg-orange-500/10 text-orange-700 border-orange-200';
    default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
};

export const ContentDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);

  const { posts, isLoading, error, deletePost, publishPost } = usePosts();

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;
    const matchesType = selectedType === 'all' || post.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const draftPosts = filteredPosts.filter(post => post.status === 'draft');
  const publishedPosts = filteredPosts.filter(post => post.status === 'published');
  const scheduledPosts = filteredPosts.filter(post => post.status === 'scheduled');

  const handleDelete = async (id: string) => {
    await deletePost(id);
    setDeleteConfirm(null);
  };

  const handlePublish = async (id: string) => {
    await publishPost(id);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{post.title || 'Untitled'}</CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline" className={getStatusColor(post.status || 'draft')}>
                {post.status}
              </Badge>
              <Badge variant="outline" className={getTypeColor(post.type)}>
                {post.type}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {post.content && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.content.substring(0, 150)}...
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Created {formatDate(post.created_at)}</span>
              </div>
              {post.published_at && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Published {formatDate(post.published_at)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setEditingPost(post)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            {post.status === 'draft' && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => handlePublish(post.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setDeleteConfirm(post.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (editingPost || showNewPost) {
    return (
      <PostEditor 
        post={editingPost}
        onClose={() => {
          setEditingPost(null);
          setShowNewPost(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your content library and publishing workflow
          </p>
        </div>
        <Button onClick={() => setShowNewPost(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="ad">Advertisement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All Posts ({filteredPosts.length})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({draftPosts.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({scheduledPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No posts found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Try adjusting your search criteria' : 'Create your first post to get started'}
                    </p>
                  </div>
                  {!searchQuery && (
                    <Button onClick={() => setShowNewPost(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Post
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {draftPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="published" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publishedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scheduledPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};