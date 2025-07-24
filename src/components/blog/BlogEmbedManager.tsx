import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Copy, 
  ExternalLink, 
  Code, 
  Globe, 
  Palette, 
  Settings,
  Eye,
  Download,
  Share2,
  Info
} from 'lucide-react';

interface BlogEmbedConfig {
  user_id: string;
  business_profile_id?: string;
  style: 'default' | 'minimal' | 'modern' | 'healthcare';
  show_header: boolean;
  show_footer: boolean;
  max_posts: number;
  color_scheme: 'light' | 'dark' | 'auto';
  categories: string[];
}

interface BusinessProfile {
  id: string;
  business_name: string;
  logo_url?: string;
  website_url?: string;
}

const BlogEmbedManager = () => {
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [config, setConfig] = useState<BlogEmbedConfig>({
    user_id: '',
    business_profile_id: '',
    style: 'default',
    show_header: true,
    show_footer: true,
    max_posts: 10,
    color_scheme: 'auto',
    categories: []
  });
  const [embedCode, setEmbedCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinessProfiles();
  }, []);

  useEffect(() => {
    generateEmbedCode();
  }, [config, selectedProfile]);

  const fetchBusinessProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setConfig(prev => ({ ...prev, user_id: user.id }));

      const { data, error } = await supabase
        .from('business_profiles')
        .select('id, business_name, logo_url, website_url')
        .eq('user_id', user.id);

      if (error) throw error;
      setBusinessProfiles(data || []);
      
      // Set first profile as default
      if (data && data.length > 0) {
        setSelectedProfile(data[0].id);
        setConfig(prev => ({ ...prev, business_profile_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching business profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load business profiles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();
    
    if (config.business_profile_id) {
      params.set('business', config.business_profile_id);
    } else {
      params.set('user', config.user_id);
    }
    
    params.set('style', config.style);
    params.set('max', config.max_posts.toString());
    params.set('header', config.show_header.toString());
    params.set('footer', config.show_footer.toString());
    params.set('theme', config.color_scheme);

    const url = `${baseUrl}/embedded-blog?${params.toString()}`;
    setPreviewUrl(url);

    // Generate different embed codes for different platforms
    const iframeCode = `<iframe src="${url}" width="100%" height="800" frameborder="0" style="border:none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`;
    
    setEmbedCode(iframeCode);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const getPlatformSpecificCode = (platform: string) => {
    const url = previewUrl;
    
    switch (platform) {
      case 'wordpress':
        return `[iframe src="${url}" width="100%" height="800"]`;
      case 'squarespace':
        return `<div class="sqs-block-code sqs-block-code-inline">\n  <iframe src="${url}" width="100%" height="800" frameborder="0"></iframe>\n</div>`;
      case 'wix':
        return `<!-- Add this to an HTML element in Wix -->\n<iframe src="${url}" width="100%" height="800" frameborder="0"></iframe>`;
      case 'webflow':
        return `<!-- Add this to an Embed element in Webflow -->\n<iframe src="${url}" width="100%" height="800" frameborder="0"></iframe>`;
      case 'godaddy':
        return `<!-- Add this to your HTML/Embed widget -->\n<iframe src="${url}" width="100%" height="800" frameborder="0" style="border:none;"></iframe>`;
      default:
        return embedCode;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedProfileData = businessProfiles.find(p => p.id === selectedProfile);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Blog Embed Manager
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Embed your professional blog on any website with a simple code snippet
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="configure" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Profile Selection */}
              <div className="space-y-2">
                <Label htmlFor="business-profile">Business Profile</Label>
                <Select value={selectedProfile} onValueChange={(value) => {
                  setSelectedProfile(value);
                  setConfig(prev => ({ ...prev, business_profile_id: value }));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.business_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProfileData && (
                  <p className="text-xs text-muted-foreground">
                    Blog will display posts from: {selectedProfileData.business_name}
                  </p>
                )}
              </div>

              <Separator />

              {/* Display Options */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Display Options
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="style">Style</Label>
                    <Select value={config.style} onValueChange={(value: any) => 
                      setConfig(prev => ({ ...prev, style: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-posts">Max Posts</Label>
                    <Select value={config.max_posts.toString()} onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, max_posts: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Posts</SelectItem>
                        <SelectItem value="10">10 Posts</SelectItem>
                        <SelectItem value="20">20 Posts</SelectItem>
                        <SelectItem value="50">50 Posts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-header">Show Header</Label>
                      <p className="text-xs text-muted-foreground">Display navigation header</p>
                    </div>
                    <Switch
                      id="show-header"
                      checked={config.show_header}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, show_header: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label htmlFor="show-footer">Show Footer Attribution</Label>
                       <p className="text-xs text-muted-foreground">Display "Powered by JB-Health"</p>
                    </div>
                    <Switch
                      id="show-footer"
                      checked={config.show_footer}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, show_footer: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Live Preview
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(previewUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                <Badge variant="outline">{selectedProfileData?.business_name}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={previewUrl}
                  width="100%"
                  height="600"
                  frameBorder="0"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Universal Embed Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Copy this code and paste it into any website where you want your blog to appear.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>HTML Embed Code</Label>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{embedCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(embedCode, 'Embed code')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Direct URL</Label>
                <div className="relative">
                  <Input
                    value={previewUrl}
                    readOnly
                    className="pr-10 font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-1 right-1"
                    onClick={() => copyToClipboard(previewUrl, 'URL')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { id: 'wordpress', name: 'WordPress', description: 'Add to posts or pages using shortcode' },
              { id: 'squarespace', name: 'Squarespace', description: 'Add to code blocks or markdown' },
              { id: 'wix', name: 'Wix', description: 'Use HTML element to embed' },
              { id: 'webflow', name: 'Webflow', description: 'Add to Embed elements' },
              { id: 'godaddy', name: 'GoDaddy Website Builder', description: 'Use HTML/Embed widget' },
              { id: 'shopify', name: 'Shopify', description: 'Add to pages or blog templates' }
            ].map((platform) => (
              <Card key={platform.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {platform.name}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(getPlatformSpecificCode(platform.id), `${platform.name} code`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{platform.description}</p>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    <code>{getPlatformSpecificCode(platform.id)}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogEmbedManager;