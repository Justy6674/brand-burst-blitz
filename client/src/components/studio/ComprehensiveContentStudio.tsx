import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, Calendar, Image, Search, Download, Copy, 
  ExternalLink, Settings, Monitor, Smartphone, Code,
  Zap, Globe, Eye, FileText, PenTool, Camera, Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AIContentGenerator } from '@/components/content/AIContentGenerator';
import { AISearchableTemplateLibrary } from '@/components/templates/AISearchableTemplateLibrary';
import { AustralianMarketDataFeeds } from '@/components/analytics/AustralianMarketDataFeeds';

interface ContentItem {
  id: string;
  type: 'text' | 'image' | 'schedule';
  content: string;
  title: string;
  platform?: string;
  scheduledFor?: string;
  imageUrl?: string;
  exportFormat: 'html' | 'markdown' | 'text' | 'json';
}

export const ComprehensiveContentStudio = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [generatedContent, setGeneratedContent] = useState<ContentItem[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [isEmbedMode, setIsEmbedMode] = useState(false);

  const { toast } = useToast();

  // Website Content Scraper using Firecrawl
  const scrapeWebsite = async () => {
    if (!websiteUrl) return;
    
    try {
      const response = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      });
      
      const data = await response.json();
      setScrapedData(data);
      
      toast({
        title: "Website Scraped!",
        description: `Successfully analyzed ${websiteUrl} for content insights`,
      });
    } catch (error) {
      toast({
        title: "Scraping Failed",
        description: "Unable to analyze website. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Export content in various formats
  const exportContent = (item: ContentItem, format: 'copy' | 'download' | 'html' | 'json') => {
    switch (format) {
      case 'copy':
        navigator.clipboard.writeText(item.content);
        toast({ title: "Copied!", description: "Content copied to clipboard" });
        break;
      
      case 'download':
        const blob = new Blob([item.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.title.replace(/\s+/g, '-')}.txt`;
        a.click();
        break;
        
      case 'html':
        const htmlContent = `<!DOCTYPE html>
<html><head><title>${item.title}</title></head>
<body><div class="content">${item.content}</div></body></html>`;
        navigator.clipboard.writeText(htmlContent);
        toast({ title: "HTML Copied!", description: "Ready to paste in your website" });
        break;
        
      case 'json':
        navigator.clipboard.writeText(JSON.stringify(item, null, 2));
        toast({ title: "JSON Copied!", description: "Content data copied as JSON" });
        break;
    }
  };

  // Generate embeddable widget code
  const generateEmbedCode = () => {
    const embedCode = `
<!-- JBSAAS Content Studio Widget -->
<div id="jbsaas-content-studio"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = '${window.location.origin}/content-studio-widget.js';
  script.onload = function() {
    JBSAASContentStudio.init({
      container: 'jbsaas-content-studio',
      apiKey: 'YOUR_API_KEY',
      features: ['ai-generator', 'templates', 'scheduler', 'images'],
      theme: 'modern'
    });
  };
  document.head.appendChild(script);
})();
</script>`;
    
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed Code Copied!",
      description: "Paste this code into any website to embed the full JBSAAS system",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Complete Content Creation Studio
          </h2>
          <p className="text-muted-foreground">
            Full-featured content creation system with AI, templates, scheduling, and export tools
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateEmbedCode}>
            <Code className="h-4 w-4 mr-1" />
            Get Embed Code
          </Button>
          <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-blue-50 text-purple-800 border-purple-200">
            <Globe className="h-3 w-3 mr-1" />
            Embeddable Everywhere
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            AI Create
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="scrape" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Site Scanner
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Image Bank
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scheduler
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Hub
          </TabsTrigger>
        </TabsList>

        {/* AI Content Creation */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Content Generator
              </CardTitle>
              <CardDescription>
                Create professional content with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIContentGenerator 
                onContentGenerated={(content, postId) => {
                  const newItem: ContentItem = {
                    id: postId,
                    type: 'text',
                    content,
                    title: `AI Generated Content ${new Date().toLocaleTimeString()}`,
                    exportFormat: 'text'
                  };
                  setGeneratedContent(prev => [newItem, ...prev]);
                  
                  toast({
                    title: "Content Generated!",
                    description: "Added to your export hub - ready to copy or download",
                  });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Template Library */}
        <TabsContent value="templates" className="space-y-6">
          <AISearchableTemplateLibrary />
        </TabsContent>

        {/* Website Content Scraper */}
        <TabsContent value="scrape" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Competitor Content Scanner
              </CardTitle>
              <CardDescription>
                Analyze competitor websites for content inspiration and ideas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://competitor-website.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={scrapeWebsite}>
                  <Search className="h-4 w-4 mr-1" />
                  Scan Site
                </Button>
              </div>
              
              {scrapedData && (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Content Analysis Results:</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Pages Found:</strong> {scrapedData.total || 'N/A'}</p>
                        <p><strong>Content Type:</strong> {scrapedData.contentType || 'Mixed'}</p>
                        <p><strong>Main Topics:</strong> {scrapedData.topics?.join(', ') || 'Various'}</p>
                      </div>
                      <div>
                        <p><strong>SEO Score:</strong> {scrapedData.seoScore || 'Analyzing...'}</p>
                        <p><strong>Word Count:</strong> {scrapedData.wordCount || 'Calculating...'}</p>
                        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      const insight = `Content insights from ${websiteUrl}:\n\n${JSON.stringify(scrapedData, null, 2)}`;
                      navigator.clipboard.writeText(insight);
                      toast({ title: "Analysis Copied!", description: "Competitor insights copied to clipboard" });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image Bank */}
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                AI Image Bank
              </CardTitle>
              <CardDescription>
                Generate and manage images for your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                    <div className="text-center">
                      <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Stock Image {i}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate AI Image
                </Button>
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Browse Stock Library
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Scheduler */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Content Scheduler
              </CardTitle>
              <CardDescription>
                Plan and schedule your content across platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center">
                    <h4 className="font-semibold text-sm mb-2">{day}</h4>
                    <div className="space-y-2">
                      <div className="bg-blue-100 text-blue-800 p-2 rounded text-xs">
                        9:00 AM - Blog Post
                      </div>
                      <div className="bg-green-100 text-green-800 p-2 rounded text-xs">
                        2:00 PM - Social
                      </div>
                      <div className="bg-purple-100 text-purple-800 p-2 rounded text-xs">
                        6:00 PM - Email
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full">
                <Calendar className="h-4 w-4 mr-1" />
                Add Scheduled Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Hub */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Content Export Hub
              </CardTitle>
              <CardDescription>
                Export your generated content in various formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedContent.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                  <p className="text-muted-foreground">Generate content in other tabs to see export options here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedContent.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.content.substring(0, 100)}...
                          </p>
                        </div>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportContent(item, 'copy')}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Text
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportContent(item, 'html')}
                        >
                          <Code className="h-3 w-3 mr-1" />
                          Copy HTML
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportContent(item, 'download')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportContent(item, 'json')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Export JSON
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Embed Instructions */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Embed This Entire System
          </CardTitle>
          <CardDescription>
            Add the complete JBSAAS Content Studio to any website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">✨ What Gets Embedded:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• AI Content Generator</li>
                <li>• Template Library</li>
                <li>• Website Content Scanner</li>
                <li>• Image Bank & Generator</li>
                <li>• Content Scheduler</li>
                <li>• Export Tools</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">🎯 Perfect For:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Agency websites</li>
                <li>• Marketing consultants</li>
                <li>• Business service providers</li>
                <li>• Content creators</li>
                <li>• White-label solutions</li>
              </ul>
            </div>
          </div>
          
          <Button onClick={generateEmbedCode} className="w-full">
            <Code className="h-4 w-4 mr-2" />
            Get Complete Embed Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};