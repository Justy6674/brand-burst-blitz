import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  PenTool, 
  Sparkles, 
  Image, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Twitter,
  Calendar,
  Loader2,
  Wand2,
  FileText,
  Hash
} from 'lucide-react';

const CreateContent = () => {
  const [activeTab, setActiveTab] = useState('blog');
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      if (activeTab === 'blog') {
        setTitle(`The Ultimate Guide to ${topic}`);
        setContent(`# The Ultimate Guide to ${topic}

In today's digital landscape, understanding ${topic} is crucial for success. This comprehensive guide will walk you through everything you need to know.

## Introduction

${topic} has become increasingly important in recent years. Here's what you need to know to get started.

## Key Benefits

1. Improved efficiency
2. Better results
3. Cost savings
4. Enhanced user experience

## Best Practices

When implementing ${topic}, consider these best practices:

- Start with clear objectives
- Monitor progress regularly
- Gather feedback from users
- Iterate and improve

## Conclusion

By following this guide, you'll be well-equipped to leverage ${topic} effectively. Remember to stay updated with the latest trends and continuously refine your approach.`);
      } else {
        setContent(`🚀 Excited to share insights about ${topic}! 

Did you know that ${topic} can transform your business? Here are 3 key benefits:

✅ Increased efficiency
✅ Better customer satisfaction  
✅ Competitive advantage

What's your experience with ${topic}? Share in the comments! 👇

#${topic.replace(/\s+/g, '')} #Business #Growth #Innovation`);
      }
      
      setIsGenerating(false);
      toast({
        title: "Content Generated!",
        description: "Your AI-powered content is ready for review.",
      });
    }, 3000);
  };

  const togglePlatform = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const platformIcons = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gradient-primary">Create Content</h1>
        <p className="text-muted-foreground">
          Generate AI-powered content for your blog and social media
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Creation Form */}
        <div className="lg:col-span-2">
          <Card className="glass-strong">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="h-5 w-5 mr-2 text-primary" />
                AI Content Generator
              </CardTitle>
              <CardDescription>
                Enter your topic and let AI create amazing content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="blog" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Blog Post
                  </TabsTrigger>
                  <TabsTrigger value="social" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Social Media
                  </TabsTrigger>
                </TabsList>

                <div className="space-y-6">
                  {/* Topic Input */}
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic or Keywords</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Digital Marketing, Productivity Tips, Health & Wellness"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="bg-background/50 border-white/10"
                    />
                  </div>

                  {/* Tone Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone & Style</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="bg-background/50 border-white/10">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="authoritative">Authoritative</SelectItem>
                        <SelectItem value="empathetic">Empathetic</SelectItem>
                        <SelectItem value="exciting">Exciting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Platform Selection for Social */}
                  {activeTab === 'social' && (
                    <div className="space-y-2">
                      <Label>Target Platforms</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(platformIcons).map(([platform, Icon]) => (
                          <Button
                            key={platform}
                            variant={platforms.includes(platform) ? "default" : "outline"}
                            onClick={() => togglePlatform(platform)}
                            className="flex items-center gap-2 h-12"
                          >
                            <Icon className="h-4 w-4" />
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generate Button */}
                  <Button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic.trim()}
                    className="w-full bg-gradient-primary hover:scale-105 transition-all h-12"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </div>

                {/* Content Tabs */}
                <TabsContent value="blog" className="mt-8 space-y-4">
                  {title && (
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-background/50 border-white/10"
                      />
                    </div>
                  )}
                  {content && (
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[400px] bg-background/50 border-white/10"
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="social" className="mt-8 space-y-4">
                  {content && (
                    <div className="space-y-2">
                      <Label htmlFor="social-content">Social Media Post</Label>
                      <Textarea
                        id="social-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[200px] bg-background/50 border-white/10"
                        placeholder="Your social media content will appear here..."
                      />
                    </div>
                  )}
                </TabsContent>

                {/* Action Buttons */}
                {content && (
                  <div className="flex gap-4 mt-6">
                    <Button variant="outline" className="flex-1">
                      <Image className="mr-2 h-4 w-4" />
                      Add Images
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                    <Button className="flex-1 bg-gradient-primary">
                      <PenTool className="mr-2 h-4 w-4" />
                      Save Draft
                    </Button>
                  </div>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Templates */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Quick Templates</CardTitle>
              <CardDescription>Pre-built templates to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start" onClick={() => setTopic('Digital Marketing Tips')}>
                📱 Digital Marketing
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setTopic('Productivity Hacks')}>
                ⚡ Productivity
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setTopic('Health and Wellness')}>
                🧘 Health & Wellness
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setTopic('Small Business Growth')}>
                📈 Business Growth
              </Button>
            </CardContent>
          </Card>

          {/* Recent Drafts */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Recent Drafts</CardTitle>
              <CardDescription>Your latest content drafts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No drafts yet</p>
                <p className="text-xs">Create your first piece of content</p>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card className="glass border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                AI Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Posts Created</span>
                  <Badge variant="secondary">0/3</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-primary h-2 rounded-full w-0" />
                </div>
                <p className="text-xs text-muted-foreground">
                  3 free AI generations remaining on trial plan
                </p>
                <Button size="sm" className="w-full bg-gradient-primary">
                  Upgrade for Unlimited
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateContent;