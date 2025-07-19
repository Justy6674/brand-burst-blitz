import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Code, Download, ExternalLink, Copy, Palette, Settings, 
  Globe, Zap, CheckCircle, ArrowRight, Monitor, Smartphone,
  Eye, Lightbulb, FileText, Link
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Top 10 Website Platforms
const WEBSITE_PLATFORMS = [
  {
    id: 'wordpress',
    name: 'WordPress',
    description: 'Self-hosted and WordPress.com',
    logo: '🔷',
    method: 'shortcode',
    difficulty: 'Easy',
    marketShare: '43%'
  },
  {
    id: 'wix', 
    name: 'Wix',
    description: 'Drag & drop website builder',
    logo: '🎨',
    method: 'embed',
    difficulty: 'Easy',
    marketShare: '8%'
  },
  {
    id: 'squarespace',
    name: 'Squarespace', 
    description: 'Design-focused platform',
    logo: '⬛',
    method: 'code-block',
    difficulty: 'Easy',
    marketShare: '3%'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'E-commerce platform',
    logo: '🛍️',
    method: 'liquid-template',
    difficulty: 'Medium',
    marketShare: '4%'
  },
  {
    id: 'webflow',
    name: 'Webflow',
    description: 'Designer-friendly platform',
    logo: '🌊',
    method: 'embed',
    difficulty: 'Easy',
    marketShare: '1%'
  },
  {
    id: 'weebly',
    name: 'Weebly',
    description: 'Simple drag & drop',
    logo: '🔶',
    method: 'embed',
    difficulty: 'Easy',
    marketShare: '1%'
  },
  {
    id: 'godaddy',
    name: 'GoDaddy Website Builder',
    description: 'Domain registrar builder',
    logo: '🚀',
    method: 'embed',
    difficulty: 'Easy',
    marketShare: '2%'
  },
  {
    id: 'jimdo',
    name: 'Jimdo',
    description: 'AI-powered builder',
    logo: '🤖',
    method: 'embed',
    difficulty: 'Easy',
    marketShare: '0.5%'
  },
  {
    id: 'strikingly',
    name: 'Strikingly',
    description: 'One-page websites',
    logo: '⚡',
    method: 'embed',
    difficulty: 'Easy',
    marketShare: '0.3%'
  },
  {
    id: 'custom',
    name: 'Custom HTML/CSS',
    description: 'Any website with HTML access',
    logo: '💻',
    method: 'iframe',
    difficulty: 'Medium',
    marketShare: '20%'
  }
];

export const BlogEmbedWizard = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [blogUrl, setBlogUrl] = useState('');
  const [embedStyle, setEmbedStyle] = useState('modern');
  const [embedCode, setEmbedCode] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const { toast } = useToast();

  // Generate embed code based on platform and settings
  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const embedUrl = `${baseUrl}/embed/blog?style=${embedStyle}&source=${encodeURIComponent(blogUrl)}`;
    
    switch (selectedPlatform) {
      case 'wordpress':
        return `[jbsaas-blog url="${blogUrl}" style="${embedStyle}"]`;
      
      case 'squarespace':
      case 'wix':
      case 'webflow':
      case 'weebly':
      case 'godaddy':
      case 'jimdo':
      case 'strikingly':
        return `<div id="jbsaas-blog-widget"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = '${baseUrl}/widget.js';
  script.onload = function() {
    JBSAASBlog.init({
      container: 'jbsaas-blog-widget',
      blogUrl: '${blogUrl}',
      style: '${embedStyle}'
    });
  };
  document.head.appendChild(script);
})();
</script>`;
      
      case 'shopify':
        return `{% comment %} Add to your template file {% endcomment %}
<div id="jbsaas-blog-widget"></div>
<script>
  window.jbsaasBlogConfig = {
    blogUrl: '${blogUrl}',
    style: '${embedStyle}'
  };
</script>
<script src="${baseUrl}/widget.js" defer></script>`;
      
      default:
        return `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border: none; border-radius: 8px;">
</iframe>`;
    }
  };

  useEffect(() => {
    if (selectedPlatform && blogUrl) {
      setEmbedCode(generateEmbedCode());
    }
  }, [selectedPlatform, blogUrl, embedStyle]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the code",
        variant: "destructive"
      });
    }
  };

  const downloadInstructions = (platform: string) => {
    const instructions = generatePlatformInstructions(platform);
    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jbsaas-blog-setup-${platform}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePlatformInstructions = (platform: string) => {
    const baseInstructions = `
JBSAAS Blog Embed Instructions for ${WEBSITE_PLATFORMS.find(p => p.id === platform)?.name}

=== STEP-BY-STEP SETUP ===

`;

    const platformSpecific = {
      wordpress: `
1. Log into your WordPress Admin Dashboard
2. Go to Plugins > Add New > Upload Plugin
3. Upload the JBSAAS Blog Plugin (download from your JBSAAS dashboard)
4. Activate the plugin
5. Go to any post/page where you want the blog
6. Add the shortcode: [jbsaas-blog url="${blogUrl}" style="${embedStyle}"]
7. Save and publish

ALTERNATIVE METHOD (without plugin):
1. Go to Appearance > Theme Editor
2. Open your theme's functions.php file
3. Add the JBSAAS blog integration code (provided in dashboard)
4. Use the shortcode in any post or page
`,
      
      wix: `
1. Open your Wix Editor
2. Click the '+' button to add an element
3. Select 'Embed' from the menu
4. Choose 'Custom Embeds' > 'Embed HTML'
5. Paste the provided embed code
6. Adjust the size and position as needed
7. Click 'Apply' and publish your site
`,

      squarespace: `
1. Log into your Squarespace account
2. Go to the page where you want to add the blog
3. Click an insert point and select 'Code' from the menu
4. Paste the provided embed code
5. Click 'Apply'
6. Save and publish your page
`,

      shopify: `
1. Go to Online Store > Themes in your Shopify admin
2. Click 'Actions' > 'Edit code' on your active theme
3. Open the template file where you want the blog (e.g., page.liquid)
4. Paste the provided Liquid code
5. Save the file
6. Create a new page and select your custom template
7. Publish the page
`
    };

    return baseInstructions + (platformSpecific[platform] || `
1. Access your website's HTML editor or content management system
2. Navigate to the page where you want to add the blog
3. Find the HTML/code editing option
4. Paste the provided embed code
5. Save and publish your changes

If you need help finding the HTML editor, contact your platform's support team.
`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            Blog Embed Wizard
          </h2>
          <p className="text-muted-foreground">
            Embed your JBSAAS blog content on any website with one-click setup
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Zap className="h-3 w-3 mr-1" />
          Universal Compatibility
        </Badge>
      </div>

      <Tabs defaultValue="wizard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wizard">Setup Wizard</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="space-y-6">
          {/* Step 1: Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                Choose Your Website Platform
              </CardTitle>
              <CardDescription>
                Select your website builder or content management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {WEBSITE_PLATFORMS.map((platform) => (
                  <Card 
                    key={platform.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPlatform === platform.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedPlatform(platform.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-2xl">{platform.logo}</div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            platform.difficulty === 'Easy' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}
                        >
                          {platform.difficulty}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{platform.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{platform.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Market: {platform.marketShare}</span>
                        <span className="text-primary">{platform.method}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Blog Configuration */}
          {selectedPlatform && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Configure Your Blog
                </CardTitle>
                <CardDescription>
                  Set up your blog URL and styling preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Blog Source URL</label>
                  <Input
                    placeholder="https://yourdomain.com/blog or leave empty for JBSAAS hosted blog"
                    value={blogUrl}
                    onChange={(e) => setBlogUrl(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Style Theme</label>
                  <Select value={embedStyle} onValueChange={setEmbedStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern (Clean, minimal)</SelectItem>
                      <SelectItem value="classic">Classic (Traditional blog)</SelectItem>
                      <SelectItem value="cards">Cards (Grid layout)</SelectItem>
                      <SelectItem value="minimal">Minimal (Text-focused)</SelectItem>
                      <SelectItem value="magazine">Magazine (Media-rich)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Get Embed Code */}
          {selectedPlatform && embedCode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  Your Embed Code
                </CardTitle>
                <CardDescription>
                  Copy this code and paste it into your {WEBSITE_PLATFORMS.find(p => p.id === selectedPlatform)?.name} website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Embed Code:</span>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(embedCode)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadInstructions(selectedPlatform)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Guide
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={embedCode}
                    readOnly
                    className="font-mono text-sm min-h-[120px]"
                  />
                </div>
                
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Quick Setup:</strong> Download the step-by-step guide for {WEBSITE_PLATFORMS.find(p => p.id === selectedPlatform)?.name} with screenshots and detailed instructions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your blog will look on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white min-h-[400px]">
                <div className="text-center py-20 text-muted-foreground">
                  <Monitor className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Blog Preview</h3>
                  <p>Configure your settings in the wizard to see a live preview</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Integration Options</CardTitle>
              <CardDescription>
                Custom solutions for developers and advanced users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">API Integration</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">
                      GET /api/blog/posts<br/>
                      GET /api/blog/posts/[id]<br/>
                      GET /api/blog/rss
                    </code>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Webhook Notifications</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">
                      POST /webhooks/blog-updated<br/>
                      POST /webhooks/new-post<br/>
                      POST /webhooks/post-deleted
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};