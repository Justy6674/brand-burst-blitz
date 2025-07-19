import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Globe, Code, Rss, Zap, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogWebsiteIntegrationProps {
  blogId?: string;
  blogDomain?: string;
}

export function BlogWebsiteIntegration({ blogId = 'your-blog-id', blogDomain = 'your-domain.com' }: BlogWebsiteIntegrationProps) {
  const [selectedMethod, setSelectedMethod] = useState('embed');
  const [customDomain, setCustomDomain] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const integrationMethods = [
    {
      id: 'embed',
      title: 'JavaScript Embed Widget',
      description: 'Add blog posts directly to any website with a simple script',
      icon: Code,
      difficulty: 'Easy',
      timeToSetup: '5 minutes'
    },
    {
      id: 'api',
      title: 'REST API Integration',
      description: 'Full programmatic access to your blog content',
      icon: Zap,
      difficulty: 'Advanced',
      timeToSetup: '30 minutes'
    },
    {
      id: 'rss',
      title: 'RSS Feed',
      description: 'Syndicate content to other platforms and readers',
      icon: Rss,
      difficulty: 'Easy',
      timeToSetup: '2 minutes'
    },
    {
      id: 'webhook',
      title: 'Webhook Integration',
      description: 'Real-time notifications when new content is published',
      icon: Globe,
      difficulty: 'Intermediate',
      timeToSetup: '15 minutes'
    }
  ];

  const embedCode = `<!-- JBSAAS Blog Widget -->
<div id="jbsaas-blog-widget"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://cdn.jbsaas.com/widget.js';
  script.async = true;
  script.onload = function() {
    JBSAASBlog.init({
      blogId: '${blogId}',
      containerId: 'jbsaas-blog-widget',
      theme: 'auto', // 'light', 'dark', or 'auto'
      layout: 'grid', // 'grid', 'list', or 'cards'
      postsPerPage: 6,
      showExcerpt: true,
      showDate: true,
      showAuthor: true,
      showCategories: true,
      customStyles: {
        primaryColor: '#3b82f6',
        fontFamily: 'inherit'
      }
    });
  };
  document.head.appendChild(script);
})();
</script>`;

  const apiEndpoints = [
    {
      method: 'GET',
      endpoint: `/api/blogs/${blogId}/posts`,
      description: 'Fetch all published blog posts',
      example: `curl -X GET "https://api.jbsaas.com/api/blogs/${blogId}/posts" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
    },
    {
      method: 'GET',
      endpoint: `/api/blogs/${blogId}/posts/{postId}`,
      description: 'Fetch a specific blog post',
      example: `curl -X GET "https://api.jbsaas.com/api/blogs/${blogId}/posts/post-123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    },
    {
      method: 'POST',
      endpoint: `/api/blogs/${blogId}/posts`,
      description: 'Create a new blog post programmatically',
      example: `curl -X POST "https://api.jbsaas.com/api/blogs/${blogId}/posts" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "New Post", "content": "Post content...", "status": "published"}'`
    }
  ];

  const wordpressPlugin = `<?php
/*
Plugin Name: JBSAAS Blog Integration
Description: Integrate JBSAAS blog content into your WordPress site
Version: 1.0
*/

// Add shortcode for blog integration
function jbsaas_blog_shortcode($atts) {
    $atts = shortcode_atts(array(
        'blog_id' => '${blogId}',
        'posts' => '6',
        'layout' => 'grid'
    ), $atts);
    
    return '<div id="jbsaas-blog-' . esc_attr($atts['blog_id']) . '"></div>
    <script>
    jQuery(document).ready(function($) {
        $.getScript("https://cdn.jbsaas.com/widget.js", function() {
            JBSAASBlog.init({
                blogId: "' . esc_attr($atts['blog_id']) . '",
                containerId: "jbsaas-blog-' . esc_attr($atts['blog_id']) . '",
                postsPerPage: ' . intval($atts['posts']) . ',
                layout: "' . esc_attr($atts['layout']) . '"
            });
        });
    });
    </script>';
}
add_shortcode('jbsaas_blog', 'jbsaas_blog_shortcode');
?>`;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Blog Website Integration</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect your JBSAAS blog to any website with our flexible integration options. 
          From simple embeds to powerful APIs, we've got you covered.
        </p>
      </div>

      {/* Integration Methods Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrationMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <Card 
              key={method.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedMethod === method.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <CardHeader className="text-center pb-3">
                <IconComponent className="h-8 w-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">{method.title}</CardTitle>
                <div className="flex gap-2 justify-center">
                  <Badge variant="outline">{method.difficulty}</Badge>
                  <Badge variant="secondary">{method.timeToSetup}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  {method.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Integration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {selectedMethod === 'embed' && <Code className="h-5 w-5" />}
            {selectedMethod === 'api' && <Zap className="h-5 w-5" />}
            {selectedMethod === 'rss' && <Rss className="h-5 w-5" />}
            {selectedMethod === 'webhook' && <Globe className="h-5 w-5" />}
            {integrationMethods.find(m => m.id === selectedMethod)?.title}
          </CardTitle>
          <CardDescription>
            {integrationMethods.find(m => m.id === selectedMethod)?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="customize">Customize</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              {selectedMethod === 'embed' && (
                <div className="space-y-4">
                  <div>
                    <Label>Embed Code</Label>
                    <div className="relative">
                      <Textarea
                        value={embedCode}
                        readOnly
                        className="font-mono text-sm"
                        rows={20}
                      />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(embedCode, 'Embed code')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Quick Setup Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Copy the embed code above</li>
                      <li>Paste it into your website's HTML where you want the blog to appear</li>
                      <li>Replace 'your-blog-id' with your actual blog ID</li>
                      <li>Save and publish your page</li>
                    </ol>
                  </div>
                </div>
              )}

              {selectedMethod === 'api' && (
                <div className="space-y-4">
                  <div>
                    <Label>API Base URL</Label>
                    <div className="flex">
                      <Input
                        value="https://api.jbsaas.com"
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2"
                        onClick={() => copyToClipboard('https://api.jbsaas.com', 'API base URL')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Authentication</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Include your API key in the Authorization header:
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Available Endpoints</Label>
                    {apiEndpoints.map((endpoint, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm">{endpoint.endpoint}</code>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {endpoint.description}
                          </p>
                          <details className="text-sm">
                            <summary className="cursor-pointer font-medium">
                              Example Request
                            </summary>
                            <div className="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-xs overflow-x-auto">
                              {endpoint.example}
                            </div>
                          </details>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {selectedMethod === 'rss' && (
                <div className="space-y-4">
                  <div>
                    <Label>RSS Feed URL</Label>
                    <div className="flex">
                      <Input
                        value={`https://api.jbsaas.com/blogs/${blogId}/rss.xml`}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2"
                        onClick={() => copyToClipboard(`https://api.jbsaas.com/blogs/${blogId}/rss.xml`, 'RSS feed URL')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">RSS Integration Benefits:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Automatic content syndication to RSS readers</li>
                      <li>Easy integration with other platforms (Medium, LinkedIn, etc.)</li>
                      <li>Real-time updates when new posts are published</li>
                      <li>Standard RSS 2.0 format for maximum compatibility</li>
                    </ul>
                  </div>

                  <div>
                    <Label>Popular RSS Readers & Platforms</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {['Feedly', 'Inoreader', 'NewsBlur', 'Medium', 'LinkedIn', 'Zapier', 'IFTTT', 'Buffer'].map((platform) => (
                        <Badge key={platform} variant="outline" className="justify-center">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'webhook' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://your-site.com/webhook"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll send POST requests to this URL when events occur
                    </p>
                  </div>

                  <div>
                    <Label>Webhook Events</Label>
                    <div className="space-y-2 mt-2">
                      {[
                        { event: 'post.published', description: 'When a new blog post is published' },
                        { event: 'post.updated', description: 'When an existing post is updated' },
                        { event: 'post.deleted', description: 'When a post is deleted' },
                      ].map((webhook) => (
                        <div key={webhook.event} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <code className="text-sm font-mono">{webhook.event}</code>
                            <p className="text-sm text-muted-foreground">{webhook.description}</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full">
                    Configure Webhook
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="customize" className="space-y-4">
              {selectedMethod === 'embed' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Theme</Label>
                      <Select defaultValue="auto">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto (match website)</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Layout</Label>
                      <Select defaultValue="grid">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid</SelectItem>
                          <SelectItem value="list">List</SelectItem>
                          <SelectItem value="cards">Cards</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Custom CSS (Optional)</Label>
                    <Textarea
                      placeholder=".jbsaas-blog { border-radius: 12px; }"
                      className="font-mono"
                      rows={6}
                    />
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🎨 Design Customization</h4>
                <p className="text-sm">
                  Our widget automatically adapts to your website's styling. For advanced customization,
                  use the custom CSS field or contact our team for white-label solutions.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              {selectedMethod === 'embed' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">WordPress Integration</h4>
                    <div className="relative">
                      <Textarea
                        value={wordpressPlugin}
                        readOnly
                        className="font-mono text-sm"
                        rows={12}
                      />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(wordpressPlugin, 'WordPress plugin code')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Use shortcode: <code>[jbsaas_blog blog_id="{blogId}" posts="6" layout="grid"]</code>
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">React Component Example</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm overflow-x-auto">
{`import { useEffect } from 'react';

export function BlogWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jbsaas.com/widget.js';
    script.async = true;
    script.onload = () => {
      window.JBSAASBlog.init({
        blogId: '${blogId}',
        containerId: 'blog-container',
        theme: 'auto'
      });
    };
    document.head.appendChild(script);
  }, []);

  return <div id="blog-container" />;
}`}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live Demo
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Examples
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Custom Domain Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Domain Setup</CardTitle>
          <CardDescription>
            Host your blog on your own domain for maximum brand consistency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="custom-domain">Your Domain</Label>
            <Input
              id="custom-domain"
              placeholder="blog.yourcompany.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
            />
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">DNS Configuration Required:</h4>
            <div className="space-y-2 text-sm font-mono">
              <div>CNAME: blog.yourcompany.com → blogs.jbsaas.com</div>
              <div>TXT: _jbsaas-verify → {blogId}</div>
            </div>
          </div>

          <Button className="w-full">
            Verify Domain Setup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}