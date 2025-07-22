import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Copy, Save, Send } from 'lucide-react';

interface GeneratedContent {
  title: string;
  content: string;
  hashtags: string[];
  platforms: string[];
  tone: string;
  type: string;
}

export function RealContentGenerator() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [contentType, setContentType] = useState('post');
  const [platforms, setPlatforms] = useState<string[]>(['facebook']);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const { toast } = useToast();

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'humorous', label: 'Humorous' }
  ];

  const contentTypes = [
    { value: 'post', label: 'Social Media Post' },
    { value: 'story', label: 'Story/Behind-the-scenes' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'educational', label: 'Educational Content' },
    { value: 'promotional', label: 'Promotional Content' },
    { value: 'testimonial', label: 'Testimonial/Review' }
  ];

  const platformOptions = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'twitter', label: 'Twitter/X' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a content prompt to generate content",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-complete-content', {
        body: {
          prompt,
          tone,
          contentType,
          platforms,
          businessContext: {
            industry: 'general',
            audience: 'broad'
          }
        }
      });

      if (error) throw error;

      setGeneratedContent(data);
      toast({
        title: "Content Generated",
        description: "AI content has been generated successfully"
      });
    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAsPost = async () => {
    if (!generatedContent) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: generatedContent.title,
          content: generatedContent.content,
          type: generatedContent.type as any,
          ai_tone: generatedContent.tone as any,
          target_platforms: generatedContent.platforms as ("facebook" | "linkedin" | "twitter" | "instagram")[],
          tags: generatedContent.hashtags,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Post Saved",
        description: "Content has been saved as a draft post"
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save post",
        variant: "destructive"
      });
    }
  };

  const handleCopyContent = () => {
    if (!generatedContent) return;
    
    const fullContent = `${generatedContent.title}\n\n${generatedContent.content}\n\n${generatedContent.hashtags.map(tag => `#${tag}`).join(' ')}`;
    navigator.clipboard.writeText(fullContent);
    
    toast({
      title: "Content Copied",
      description: "Content has been copied to clipboard"
    });
  };

  const togglePlatform = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Content Prompt</label>
            <Textarea
              placeholder="Describe what content you want to create... (e.g., 'Write a post about our new summer sale with 20% off all products')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Content Type</label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Target Platforms</label>
            <div className="flex flex-wrap gap-2">
              {platformOptions.map((platform) => (
                <Badge
                  key={platform.value}
                  variant={platforms.includes(platform.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => togglePlatform(platform.value)}
                >
                  {platform.label}
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={generating}
            className="w-full"
          >
            {generating ? 'Generating...' : 'Generate Content'}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{generatedContent.tone}</Badge>
              <Badge variant="secondary">{generatedContent.type}</Badge>
              {generatedContent.platforms.map(platform => (
                <Badge key={platform} variant="outline">{platform}</Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Title:</h4>
              <p className="text-lg font-semibold">{generatedContent.title}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Content:</h4>
              <div className="bg-muted p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{generatedContent.content}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Hashtags:</h4>
              <div className="flex flex-wrap gap-2">
                {generatedContent.hashtags.map((tag, index) => (
                  <Badge key={index} variant="outline">#{tag}</Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCopyContent} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy Content
              </Button>
              <Button onClick={handleSaveAsPost} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save as Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}