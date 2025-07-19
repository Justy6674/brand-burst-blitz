import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, ExternalLink, Code, Palette, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Platform {
  id: string;
  name: string;
  description: string;
  marketShare: string;
  embedMethod: string;
  instructions: string[];
  codeExample: string;
}

const PLATFORMS: Platform[] = [
  {
    id: "wordpress",
    name: "WordPress",
    description: "Most popular CMS worldwide",
    marketShare: "43%",
    embedMethod: "Shortcode",
    instructions: [
      "1. Copy the shortcode below",
      "2. Go to your WordPress admin dashboard",
      "3. Edit the page/post where you want the blog",
      "4. Paste the shortcode in the content editor",
      "5. Update/publish the page"
    ],
    codeExample: "[jbsaas_blog user_id=\"USER_ID\" theme=\"modern\" posts=\"10\"]"
  },
  {
    id: "godaddy",
    name: "GoDaddy Website Builder",
    description: "Popular website builder",
    marketShare: "15%",
    embedMethod: "HTML Widget",
    instructions: [
      "1. Copy the HTML code below",
      "2. Go to your GoDaddy Website Builder",
      "3. Click 'Add Section' or 'Add Widget'",
      "4. Select 'HTML' or 'Custom Code' widget",
      "5. Paste the code and save"
    ],
    codeExample: `<div id="jbsaas-blog"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://your-domain.com/embed.js';
  script.setAttribute('data-user-id', 'USER_ID');
  script.setAttribute('data-theme', 'modern');
  document.head.appendChild(script);
})();
</script>`
  },
  {
    id: "wix",
    name: "Wix",
    description: "Drag & drop website builder",
    marketShare: "8%",
    embedMethod: "HTML Embed",
    instructions: [
      "1. In Wix Editor, click '+ Add'",
      "2. Select 'More' then 'HTML iframe'",
      "3. Click 'Enter Code'",
      "4. Paste the HTML code below",
      "5. Click 'Update' and publish your site"
    ],
    codeExample: `<iframe src="https://your-domain.com/embed/blog?user=USER_ID&theme=modern" 
        width="100%" height="800" frameborder="0" 
        style="border: none; border-radius: 8px;">
</iframe>`
  },
  {
    id: "squarespace",
    name: "Squarespace",
    description: "Design-focused website platform",
    marketShare: "5%",
    embedMethod: "Code Block",
    instructions: [
      "1. Edit your Squarespace page",
      "2. Click where you want to add the blog",
      "3. Add a 'Code' block",
      "4. Paste the HTML code below",
      "5. Click 'Apply' and save"
    ],
    codeExample: `<div class="jbsaas-embed" style="width: 100%; min-height: 600px;">
  <script>
    (function() {
      var embed = document.createElement('iframe');
      embed.src = 'https://your-domain.com/embed/blog?user=USER_ID&theme=minimal';
      embed.style.width = '100%';
      embed.style.height = '800px';
      embed.style.border = 'none';
      document.currentScript.parentNode.appendChild(embed);
    })();
  </script>
</div>`
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "E-commerce platform",
    marketShare: "4%",
    embedMethod: "Liquid Template",
    instructions: [
      "1. Go to Shopify Admin > Online Store > Themes",
      "2. Click 'Actions' > 'Edit code'",
      "3. Create a new template or edit existing page",
      "4. Add the Liquid code below",
      "5. Save and assign to a page"
    ],
    codeExample: `{% comment %} JBSAAS Blog Embed {% endcomment %}
<div class="jbsaas-blog-container">
  <script>
    window.jbsaasConfig = {
      userId: 'USER_ID',
      theme: 'ecommerce',
      showCategories: true
    };
  </script>
  <script src="https://your-domain.com/shopify-embed.js"></script>
</div>`
  },
  {
    id: "webflow",
    name: "Webflow",
    description: "Visual web design platform",
    marketShare: "2%",
    embedMethod: "Custom Code Widget",
    instructions: [
      "1. In Webflow Designer, drag an 'Embed' element",
      "2. Double-click the embed element",
      "3. Paste the HTML code below",
      "4. Click 'Save & Close'",
      "5. Publish your site"
    ],
    codeExample: `<div class="w-embed">
  <div id="jbsaas-blog-webflow"></div>
  <script>
    var jbsaasEmbed = document.createElement('script');
    jbsaasEmbed.src = 'https://your-domain.com/embed.js';
    jbsaasEmbed.dataset.userId = 'USER_ID';
    jbsaasEmbed.dataset.theme = 'clean';
    jbsaasEmbed.dataset.container = 'jbsaas-blog-webflow';
    document.head.appendChild(jbsaasEmbed);
  </script>
</div>`
  },
  {
    id: "weebly",
    name: "Weebly",
    description: "Simple website builder",
    marketShare: "1%",
    embedMethod: "HTML Code Element",
    instructions: [
      "1. In Weebly editor, click where you want the blog",
      "2. From the 'More' tab, drag 'Embed Code' element",
      "3. Click 'Edit Custom HTML'",
      "4. Paste the code below",
      "5. Click 'Publish' to save changes"
    ],
    codeExample: `<!-- JBSAAS Blog Embed for Weebly -->
<div style="width: 100%; margin: 20px 0;">
  <iframe src="https://your-domain.com/embed/blog?user=USER_ID&theme=modern&platform=weebly" 
          width="100%" height="700" frameborder="0" 
          scrolling="auto" style="border-radius: 6px;">
  </iframe>
</div>`
  },
  {
    id: "custom",
    name: "Custom HTML Website",
    description: "Any HTML-based website",
    marketShare: "20%",
    embedMethod: "JavaScript Widget",
    instructions: [
      "1. Copy the JavaScript code below",
      "2. Paste it in your HTML file where you want the blog",
      "3. Replace USER_ID with your actual user ID",
      "4. Customize theme and options as needed",
      "5. Save and upload your file"
    ],
    codeExample: `<!-- JBSAAS Blog Embed -->
<div id="jbsaas-blog-container"></div>
<script>
(function() {
  // JBSAAS Blog Configuration
  window.jbsaasConfig = {
    userId: 'USER_ID',
    theme: 'modern',
    container: 'jbsaas-blog-container',
    showSearch: true,
    showCategories: true,
    postsPerPage: 12,
    enableComments: false
  };
  
  // Load JBSAAS embed script
  var script = document.createElement('script');
  script.src = 'https://your-domain.com/embed.js';
  script.async = true;
  document.head.appendChild(script);
})();
</script>`
  }
];

const THEMES = [
  { id: "modern", name: "Modern", description: "Clean, contemporary design" },
  { id: "minimal", name: "Minimal", description: "Simple, focused layout" },
  { id: "professional", name: "Professional", description: "Business-ready styling" },
  { id: "creative", name: "Creative", description: "Bold, artistic design" },
  { id: "ecommerce", name: "E-commerce", description: "Product-focused layout" },
  { id: "clean", name: "Clean", description: "Crisp, uncluttered design" }
];

export function UniversalEmbedWizard() {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [userId, setUserId] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("modern");
  const [customizations, setCustomizations] = useState({
    showSearch: true,
    showCategories: true,
    postsPerPage: 10,
    enableComments: false
  });

  const generateEmbedCode = (platform: Platform) => {
    if (!userId) return platform.codeExample;
    
    return platform.codeExample.replace(/USER_ID/g, userId)
                                .replace(/modern/g, selectedTheme);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  const downloadInstructions = (platform: Platform) => {
    const instructions = `
${platform.name} Integration Instructions
========================================

Platform: ${platform.name}
Method: ${platform.embedMethod}
Market Share: ${platform.marketShare}

Step-by-Step Instructions:
${platform.instructions.map((step, index) => `${step}`).join('\n')}

Embed Code:
-----------
${generateEmbedCode(platform)}

Customization Options:
---------------------
- Theme: ${selectedTheme}
- Show Search: ${customizations.showSearch}
- Show Categories: ${customizations.showCategories}
- Posts Per Page: ${customizations.postsPerPage}
- Enable Comments: ${customizations.enableComments}

Support:
--------
If you need help, visit: https://your-domain.com/support
Or email: support@your-domain.com

Generated by JBSAAS Universal Embed Wizard
`;

    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${platform.name.toLowerCase()}-integration-instructions.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Universal Blog Embed Wizard</h1>
        <p className="text-muted-foreground">
          Get your JBSAAS blog working on any website in minutes
        </p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Blog Configuration
          </CardTitle>
          <CardDescription>
            Customize your blog settings before generating embed codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userId">Your User ID *</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Get this from your dashboard settings"
            />
          </div>

          <div>
            <Label htmlFor="theme">Blog Theme</Label>
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a theme" />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    <div>
                      <div className="font-medium">{theme.name}</div>
                      <div className="text-sm text-muted-foreground">{theme.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showSearch"
                checked={customizations.showSearch}
                onChange={(e) => setCustomizations(prev => ({ ...prev, showSearch: e.target.checked }))}
              />
              <Label htmlFor="showSearch">Show Search</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showCategories"
                checked={customizations.showCategories}
                onChange={(e) => setCustomizations(prev => ({ ...prev, showCategories: e.target.checked }))}
              />
              <Label htmlFor="showCategories">Show Categories</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="postsPerPage">Posts per page:</Label>
              <Input
                id="postsPerPage"
                type="number"
                value={customizations.postsPerPage}
                onChange={(e) => setCustomizations(prev => ({ ...prev, postsPerPage: parseInt(e.target.value) }))}
                className="w-16"
                min="1"
                max="50"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableComments"
                checked={customizations.enableComments}
                onChange={(e) => setCustomizations(prev => ({ ...prev, enableComments: e.target.checked }))}
              />
              <Label htmlFor="enableComments">Enable Comments</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Choose Your Platform
          </CardTitle>
          <CardDescription>
            Select your website platform to get customized integration instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORMS.map((platform) => (
              <Card
                key={platform.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPlatform?.id === platform.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPlatform(platform)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{platform.name}</h3>
                    <Badge variant="secondary">{platform.marketShare}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{platform.description}</p>
                  <Badge variant="outline">{platform.embedMethod}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Instructions */}
      {selectedPlatform && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              {selectedPlatform.name} Integration
            </CardTitle>
            <div className="flex gap-2">
              <Badge>{selectedPlatform.embedMethod}</Badge>
              <Badge variant="outline">Market Share: {selectedPlatform.marketShare}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="instructions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="code">Embed Code</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="instructions" className="mt-6">
                <div className="space-y-4">
                  <Alert>
                    <Palette className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Easy Setup:</strong> Follow these steps to add your JBSAAS blog to your {selectedPlatform.name} website.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    {selectedPlatform.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm">{instruction}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => downloadInstructions(selectedPlatform)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Instructions
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="code" className="mt-6">
                <div className="space-y-4">
                  {!userId && (
                    <Alert>
                      <AlertDescription>
                        <strong>Note:</strong> Enter your User ID above to personalize the embed code.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Embed Code for {selectedPlatform.name}</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generateEmbedCode(selectedPlatform))}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </Button>
                    </div>
                    <Textarea
                      value={generateEmbedCode(selectedPlatform)}
                      readOnly
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>Important:</strong> Replace any placeholder values and test the embed on a staging site before going live.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      <strong>Preview:</strong> This is how your blog will look with the {selectedTheme} theme.
                    </AlertDescription>
                  </Alert>

                  <div className="border rounded-lg p-6 bg-white min-h-[400px]">
                    <div className="text-center text-muted-foreground">
                      <h3 className="text-lg font-semibold mb-2">Blog Preview</h3>
                      <p>Theme: {selectedTheme}</p>
                      <p>Search: {customizations.showSearch ? 'Enabled' : 'Disabled'}</p>
                      <p>Categories: {customizations.showCategories ? 'Shown' : 'Hidden'}</p>
                      <p>Posts per page: {customizations.postsPerPage}</p>
                      
                      <div className="mt-6 p-4 bg-muted rounded">
                        <p className="text-sm">
                          Your actual blog content will appear here with your chosen theme and customizations.
                          The blog will automatically match your website's colors and fonts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Quick Help */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Video Tutorials</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Watch step-by-step videos for each platform
              </p>
              <Button variant="outline" size="sm">
                Watch Videos
              </Button>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Live Chat Support</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Get instant help from our technical team
              </p>
              <Button variant="outline" size="sm">
                Start Chat
              </Button>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Setup Service</h4>
              <p className="text-sm text-muted-foreground mb-3">
                We'll install it for you (Premium plan)
              </p>
              <Button variant="outline" size="sm">
                Book Setup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}