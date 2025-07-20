import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  PLATFORM_CAPABILITIES, 
  getAvailableIntegrations, 
  getUnavailableReasons,
  type PlatformInfo 
} from '@/lib/platformCapabilities';
import {
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Code,
  Download,
  Copy,
  ExternalLink,
  Clock,
  Zap,
  Settings,
  FileText,
  Link,
  Radio,
  Clipboard
} from 'lucide-react';

export default function SmartBlogIntegrationWizard() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const { toast } = useToast();

  const platform = selectedPlatform ? PLATFORM_CAPABILITIES[selectedPlatform] : null;
  const availableIntegrations = selectedPlatform ? getAvailableIntegrations(selectedPlatform) : [];
  const unavailableReasons = selectedPlatform ? getUnavailableReasons(selectedPlatform) : [];

  const generateEmbedCode = () => {
    const embedCode = `<!-- JBSAAS Blog Widget -->
<div id="jbsaas-blog-widget"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.jbsaas.com/widget.js';
    script.async = true;
    script.onload = function() {
      JBSAASBlog.init({
        containerId: 'jbsaas-blog-widget',
        businessId: 'your-business-id',
        theme: 'auto',
        postsPerPage: 6
      });
    };
    document.head.appendChild(script);
  })();
</script>`;
    return embedCode;
  };

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard"
    });
  };

  const detectPlatform = () => {
    if (!websiteUrl) return;
    
    const url = websiteUrl.toLowerCase();
    
    if (url.includes('wordpress.com') || url.includes('wp.com')) {
      setSelectedPlatform('wordpress');
    } else if (url.includes('wix.com')) {
      setSelectedPlatform('wix');
    } else if (url.includes('shopify.com')) {
      setSelectedPlatform('shopify');
    } else if (url.includes('godaddy.com')) {
      setSelectedPlatform('godaddy');
    } else if (url.includes('webflow.io')) {
      setSelectedPlatform('webflow');
    } else if (url.includes('squarespace.com')) {
      setSelectedPlatform('squarespace');
    } else {
      setSelectedPlatform('custom');
    }
    
    toast({
      title: "Platform Detected",
      description: "We've detected your platform and will show compatible options"
    });
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'embed': return <Code className="h-5 w-5" />;
      case 'api': return <Link className="h-5 w-5" />;
      case 'rss': return <Radio className="h-5 w-5" />;
      case 'manual': return <Clipboard className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Smart Blog Integration Wizard</h1>
        <p className="text-muted-foreground">
          Get personalized integration options based on your website platform
        </p>
      </div>

      {/* Step 1: Platform Detection */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Step 1: Identify Your Platform
            </CardTitle>
            <CardDescription>
              Tell us about your website so we can show you what actually works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL (Optional)</label>
              <div className="flex gap-2">
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourbusiness.com"
                  type="url"
                />
                <Button onClick={detectPlatform} variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Auto-Detect
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Or Select Your Platform</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your website platform" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PLATFORM_CAPABILITIES).map(([key, platform]) => (
                    <SelectItem key={key} value={key}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {platform && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{platform.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(platform.difficulty)}>
                      {platform.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {platform.setup_time}
                    </div>
                  </div>
                </div>
                {platform.notes && (
                  <p className="text-sm text-muted-foreground">{platform.notes}</p>
                )}
              </div>
            )}

            <Button 
              onClick={() => setCurrentStep(2)} 
              disabled={!selectedPlatform}
              className="w-full"
            >
              Continue to Integration Options
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Integration Options */}
      {currentStep === 2 && platform && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Step 2: Available Integration Methods for {platform.name}
              </CardTitle>
              <CardDescription>
                These are the integration methods that actually work with your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableIntegrations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableIntegrations.map((integration) => (
                    <Card 
                      key={integration.type} 
                      className={`cursor-pointer transition-colors ${
                        selectedIntegration === integration.type ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedIntegration(integration.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getIntegrationIcon(integration.type)}
                          <div className="flex-1">
                            <h4 className="font-medium">{integration.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {integration.description}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {integration.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Unfortunately, {platform.name} has very limited integration options. 
                    Only manual copy/paste is available.
                  </AlertDescription>
                </Alert>
              )}

              {selectedIntegration && (
                <div className="mt-4">
                  <Button onClick={() => setCurrentStep(3)} className="w-full">
                    Continue with {availableIntegrations.find(i => i.type === selectedIntegration)?.name}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unavailable Methods */}
          {unavailableReasons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Why Other Methods Won't Work
                </CardTitle>
                <CardDescription>
                  Here's why these integration methods aren't available for {platform.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unavailableReasons.map((reason, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800">{reason.feature}</h4>
                        <p className="text-sm text-red-700">{reason.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 3: Implementation Guide */}
      {currentStep === 3 && platform && selectedIntegration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Step 3: Implementation Guide
            </CardTitle>
            <CardDescription>
              Follow these steps to integrate with {platform.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="instructions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                {selectedIntegration === 'embed' && <TabsTrigger value="code">Embed Code</TabsTrigger>}
                {selectedIntegration === 'manual' && <TabsTrigger value="export">Export Tools</TabsTrigger>}
              </TabsList>

              <TabsContent value="instructions" className="space-y-4">
                {selectedIntegration === 'embed' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Widget Embed Instructions for {platform.name}</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Copy the embed code from the "Embed Code" tab</li>
                      <li>Log into your {platform.name} dashboard</li>
                      {platform.name === 'WordPress' && (
                        <>
                          <li>Go to Appearance → Widgets or use the Block Editor</li>
                          <li>Add a "Custom HTML" block where you want the blog to appear</li>
                          <li>Paste the embed code into the HTML block</li>
                        </>
                      )}
                      {platform.name === 'Wix' && (
                        <>
                          <li>Edit your site in Wix Editor</li>
                          <li>Click "Add" → "Embed" → "Custom HTML"</li>
                          <li>Paste the embed code and adjust the widget size</li>
                        </>
                      )}
                      <li>Save your changes and preview the blog widget</li>
                    </ol>
                  </div>
                )}

                {selectedIntegration === 'api' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">API Integration for {platform.name}</h4>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        API integration requires technical knowledge. Consider hiring a developer if you're not comfortable with code.
                      </AlertDescription>
                    </Alert>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Get your API credentials from JBSAAS dashboard</li>
                      <li>Set up webhook endpoints to receive new blog posts</li>
                      <li>Configure your {platform.name} to accept incoming content</li>
                      <li>Test the integration with a sample post</li>
                    </ol>
                  </div>
                )}

                {selectedIntegration === 'manual' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Manual Export Process for {platform.name}</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Create your blog content in JBSAAS</li>
                      <li>Use the export tools to copy formatted content</li>
                      <li>Log into your {platform.name} dashboard</li>
                      <li>Create a new page/post and paste the content</li>
                      <li>Download and upload any images separately</li>
                      <li>Publish your content on {platform.name}</li>
                    </ol>
                  </div>
                )}
              </TabsContent>

              {selectedIntegration === 'embed' && (
                <TabsContent value="code" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Embed Code</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generateEmbedCode())}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </Button>
                    </div>
                    <Textarea
                      value={generateEmbedCode()}
                      readOnly
                      rows={10}
                      className="font-mono text-xs"
                    />
                  </div>
                  
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      This embed code is responsive and will automatically match your website's styling.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              )}

              {selectedIntegration === 'manual' && (
                <TabsContent value="export" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Export Content</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Export your blog posts as formatted HTML
                        </p>
                        <Button variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Export HTML
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Download Images</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Download all images in a ZIP file
                        </p>
                        <Button variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download Images
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      For {platform.name}, manual export is the most reliable method. 
                      While it requires more work, it ensures your content displays correctly.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              )}
            </Tabs>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setCurrentStep(2)} variant="outline">
                Back
              </Button>
              <Button onClick={() => setCurrentStep(1)} variant="outline">
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}