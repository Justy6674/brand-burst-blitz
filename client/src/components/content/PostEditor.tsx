import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Eye, Calendar, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePosts } from '@/hooks/usePosts';
import type { Tables } from '@/integrations/supabase/types';

type Post = Tables<'posts'>;

interface PostEditorProps {
  post?: Post | null;
  onClose: () => void;
}

const contentTypes = [
  { value: 'blog', label: 'Blog Post' },
  { value: 'social', label: 'Social Media' },
  { value: 'ad', label: 'Advertisement' },
];

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'exciting', label: 'Exciting' },
];

export const PostEditor = ({ post, onClose }: PostEditorProps) => {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [type, setType] = useState<'blog' | 'social' | 'ad'>(post?.type || 'blog');
  const [aiTone, setAiTone] = useState(post?.ai_tone || 'professional');
  const [tags, setTags] = useState(post?.tags?.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);

  const { createPost, updatePost, publishPost } = usePosts();

  const isEditing = !!post;

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);

    const postData = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || undefined,
      type,
      ai_tone: aiTone,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      status,
      ...(status === 'published' && { published_at: new Date().toISOString() })
    };

    let success = false;

    if (isEditing && post) {
      success = await updatePost(post.id, postData);
    } else {
      const createdPost = await createPost(postData);
      success = !!createdPost;
    }

    if (success) {
      onClose();
    }

    setIsSaving(false);
  };

  const handlePublish = async () => {
    if (isEditing && post) {
      await publishPost(post.id);
      onClose();
    } else {
      await handleSave('published');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h2>
            <p className="text-muted-foreground">
              {isEditing ? 'Update your content' : 'Create engaging content for your audience'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => handleSave('draft')}
            disabled={isSaving || !title.trim() || !content.trim()}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button 
            onClick={handlePublish}
            disabled={isSaving || !title.trim() || !content.trim()}
          >
            <Eye className="mr-2 h-4 w-4" />
            {isEditing && post?.status === 'draft' ? 'Publish' : 'Publish Now'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>
                Write your main content here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a compelling title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt (Optional)</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief summary or hook..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={type === 'social' ? 8 : 15}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={type} onValueChange={(value: any) => setType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((contentType) => (
                      <SelectItem key={contentType.value} value={contentType.value}>
                        {contentType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>AI Tone</Label>
                <Select value={aiTone} onValueChange={(value: any) => setAiTone(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((tone) => (
                      <SelectItem key={tone.value} value={tone.value}>
                        {tone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="tag1, tag2, tag3"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate tags with commas
                </p>
              </div>

              {isEditing && post && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge variant="outline" className="capitalize">
                    {post.status}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Enhancement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="mr-2 h-4 w-4" />
                AI Enhancement
              </CardTitle>
              <CardDescription>
                Improve your content with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full">
                Improve Writing
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Generate Summary
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Suggest Tags
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                SEO Optimize
              </Button>
            </CardContent>
          </Card>

          {/* Publishing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Publishing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full">
                Schedule Post
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Add to Calendar
              </Button>
              {isEditing && post?.created_at && (
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(post.created_at).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};