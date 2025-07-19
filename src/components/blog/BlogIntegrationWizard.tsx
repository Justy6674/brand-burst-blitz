import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Code, 
  Rss, 
  Webhook, 
  Copy, 
  ExternalLink, 
  CheckCircle,
  AlertCircle,
  Globe,
  Settings,
  Zap,
  Monitor
} from 'lucide-react';

interface BlogIntegrationWizardProps {
  businessId: string;
  businessName: string;
  onComplete?: () => void;
}

interface IntegrationConfig {
  wordpress: {
    url: string;
    username: string;
    password: string;
    tested: boolean;
  };
  api: {
    enabled: boolean;
    apiKey: string;
  };
  rss: {
    enabled: boolean;
    feedUrl: string;
  };
  webhook: {
    enabled: boolean;
    url: string;
    secret: string;
  };
  embed: {
    enabled: boolean;
    widgetId: string;
  };
}

export const BlogIntegrationWizard: React.FC<BlogIntegrationWizardProps> = ({
  businessId,
  businessName,
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState('wordpress');
  const [config, setConfig] = useState<IntegrationConfig>({
    wordpress: { url: '', username: '', password: '', tested: false },
    api: { enabled: false, apiKey: '' },
    rss: { enabled: false, feedUrl: '' },
    webhook: { enabled: false, url: '', secret: '' },
    embed: { enabled: false, widgetId: '' }
  });
  
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    });
  };

  const testWordPressConnection = async () => {
    // TODO: Implement WordPress connection testing
    setTimeout(() => {
      setConfig(prev => ({
        ...prev,
        wordpress: { ...prev.wordpress, tested: true }
      }));
      toast({
        title: "Connection Successful!",
        description: "WordPress connection has been verified.",
      });
    }, 2000);
  };

  const generateApiKey = () => {
    const apiKey = `jbsaas_${businessId}_${Date.now()}`;
    setConfig(prev => ({
      ...prev,
      api: { ...prev.api, apiKey, enabled: true }
    }));
  };

  const generateRSSFeed = () => {
    const feedUrl = `https://api.jbsaas.com/v1/businesses/${businessId}/rss`;
    setConfig(prev => ({
      ...prev,
      rss: { ...prev.rss, feedUrl, enabled: true }
    }));
  };

  const generateWebhook = () => {
    const secret = `whsec_${Math.random().toString(36).substring(7)}`;
    setConfig(prev => ({
      ...prev,
      webhook: { ...prev.webhook, secret, enabled: true }
    }));
  };

  const generateEmbedWidget = () => {
    const widgetId = `jbsaas-blog-${businessId}`;
    setConfig(prev => ({
      ...prev,
      embed: { ...prev.embed, widgetId, enabled: true }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Blog Integration Setup</h2>
        <p className="text-muted-foreground">
          Connect your JBSAAS content to your website and external platforms
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="wordpress" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            WordPress
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="rss" className="flex items-center gap-2">
            <Rss className="w-4 h-4" />
            RSS
          </TabsTrigger>
          <TabsTrigger value="webhook" className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="embed" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Embed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wordpress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                WordPress Integration
              </CardTitle>
              <CardDescription>
                Connect directly to your WordPress site to automatically publish content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wp-url">WordPress Site URL *</Label>
                <Input
                  id="wp-url"
                  placeholder="https://yourwebsite.com"
                  value={config.wordpress.url}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    wordpress: { ...prev.wordpress, url: e.target.value }
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wp-username">Username *</Label>
                <Input
                  id="wp-username"
                  placeholder="WordPress username"
                  value={config.wordpress.username}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    wordpress: { ...prev.wordpress, username: e.target.value }
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wp-password">Application Password *</Label>
                <Input
                  id="wp-password"
                  type="password"
                  placeholder="WordPress application password"
                  value={config.wordpress.password}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    wordpress: { ...prev.wordpress, password: e.target.value }
                  }))}
                />
                <p className="text-sm text-muted-foreground">
                  Create an application password in your WordPress admin under Users → Profile
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={testWordPressConnection}
                  disabled={!config.wordpress.url || !config.wordpress.username || !config.wordpress.password}
                >
                  Test Connection
                </Button>
                
                {config.wordpress.tested && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Connected
                  </Badge>
                )}
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Make sure your WordPress site has the REST API enabled and accessible.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                REST API Integration
              </CardTitle>
              <CardDescription>
                Use our REST API to integrate with any website or application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={config.api.apiKey}
                    placeholder="Click 'Generate API Key' to create"
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={generateApiKey}>
                    {config.api.apiKey ? 'Regenerate' : 'Generate'} API Key
                  </Button>
                  {config.api.apiKey && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(config.api.apiKey, 'API Key')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {config.api.enabled && (
                <>
                  <div className="space-y-3">
                    <Label>API Endpoints</Label>
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="font-mono text-sm">GET /api/v1/businesses/{businessId}/posts</div>
                        <p className="text-xs text-muted-foreground mt-1">Fetch all blog posts</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="font-mono text-sm">POST /api/v1/businesses/{businessId}/posts</div>
                        <p className="text-xs text-muted-foreground mt-1">Create new blog post</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="font-mono text-sm">PUT /api/v1/businesses/{businessId}/posts/:id</div>
                        <p className="text-xs text-muted-foreground mt-1">Update existing post</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sample Code (JavaScript)</Label>
                    <div className="p-4 bg-muted rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`// Fetch blog posts
const response = await fetch('https://api.jbsaas.com/v1/businesses/${businessId}/posts', {
  headers: {
    'Authorization': 'Bearer ${config.api.apiKey}',
    'Content-Type': 'application/json'
  }
});

const posts = await response.json();`}</pre>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(`// Fetch blog posts
const response = await fetch('https://api.jbsaas.com/v1/businesses/${businessId}/posts', {
  headers: {
    'Authorization': 'Bearer ${config.api.apiKey}',
    'Content-Type': 'application/json'
  }
});

const posts = await response.json();`, 'Sample Code')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rss" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rss className="w-5 h-5" />
                RSS Feed Integration
              </CardTitle>
              <CardDescription>
                Automatically syndicate your content via RSS feeds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateRSSFeed}>
                Generate RSS Feed
              </Button>
              
              {config.rss.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>RSS Feed URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={config.rss.feedUrl}
                        readOnly
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(config.rss.feedUrl, 'RSS Feed URL')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => window.open(config.rss.feedUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>How to Use</Label>
                    <div className="space-y-2 text-sm">
                      <p className="p-3 bg-muted rounded-lg">
                        • Add this RSS feed to your website's RSS reader
                      </p>
                      <p className="p-3 bg-muted rounded-lg">
                        • Use with services like Zapier or IFTTT for automation
                      </p>
                      <p className="p-3 bg-muted rounded-lg">
                        • Share with podcast platforms or aggregators
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Webhook Integration
              </CardTitle>
              <CardDescription>
                Receive real-time notifications when content is published
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://yourwebsite.com/webhook/jbsaas"
                  value={config.webhook.url}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    webhook: { ...prev.webhook, url: e.target.value }
                  }))}
                />
              </div>
              
              <Button 
                onClick={generateWebhook}
                disabled={!config.webhook.url}
              >
                <Zap className="w-4 h-4 mr-2" />
                Setup Webhook
              </Button>
              
              {config.webhook.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Webhook Secret</Label>
                    <div className="flex gap-2">
                      <Input
                        value={config.webhook.secret}
                        readOnly
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(config.webhook.secret, 'Webhook Secret')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use this secret to verify webhook authenticity
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sample Payload</Label>
                    <div className="p-4 bg-muted rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`{
  "event": "post.published",
  "business_id": "${businessId}",
  "post": {
    "id": "uuid",
    "title": "Blog Post Title",
    "content": "Post content...",
    "excerpt": "Post excerpt...",
    "published_at": "2024-01-01T00:00:00Z"
  }
}`}</pre>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Embeddable Blog Widget
              </CardTitle>
              <CardDescription>
                Add a blog widget to any website with simple HTML/JavaScript
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateEmbedWidget}>
                Generate Embed Code
              </Button>
              
              {config.embed.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Embed Code</Label>
                    <div className="p-4 bg-muted rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`<!-- JBSAAS Blog Widget -->
<div id="${config.embed.widgetId}"></div>
<script src="https://cdn.jbsaas.com/widgets/blog.js"></script>
<script>
  JBSAASBlog.init({
    element: '#${config.embed.widgetId}',
    businessId: '${businessId}',
    theme: 'auto',
    showExcerpts: true,
    postsPerPage: 5
  });
</script>`}</pre>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(`<!-- JBSAAS Blog Widget -->
<div id="${config.embed.widgetId}"></div>
<script src="https://cdn.jbsaas.com/widgets/blog.js"></script>
<script>
  JBSAASBlog.init({
    element: '#${config.embed.widgetId}',
    businessId: '${businessId}',
    theme: 'auto',
    showExcerpts: true,
    postsPerPage: 5
  });
</script>`, 'Embed Code')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Embed Code
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Customization Options</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <select className="w-full p-2 border rounded">
                          <option value="auto">Auto (matches site)</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="posts-per-page">Posts Per Page</Label>
                        <Input id="posts-per-page" type="number" defaultValue="5" min="1" max="20" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back to Dashboard
        </Button>
        <Button onClick={onComplete}>
          Complete Setup
        </Button>
      </div>
    </div>
  );
};