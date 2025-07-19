import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, FileText, Image } from 'lucide-react';
import type { PlatformCapability } from '@/lib/platformCapabilities';

interface ManualExportToolsProps {
  businessId: string;
  platform: PlatformCapability;
}

export const ManualExportTools: React.FC<ManualExportToolsProps> = ({
  businessId,
  platform
}) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const copyToClipboard = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const sampleBlogHTML = `<!DOCTYPE html>
<article class="blog-post">
  <header>
    <h1>Your Blog Post Title</h1>
    <meta name="description" content="Your blog post meta description">
    <time datetime="2024-01-15">January 15, 2024</time>
  </header>
  
  <div class="featured-image">
    <img src="featured-image.jpg" alt="Featured image description" />
  </div>
  
  <div class="content">
    <p>Your blog post content goes here. This is optimized for ${platform.name} and includes proper formatting...</p>
    
    <h2>Section Heading</h2>
    <p>More content with proper structure for SEO and readability.</p>
    
    <ul>
      <li>Bullet point optimized for your platform</li>
      <li>Clean formatting that works in ${platform.name}</li>
    </ul>
  </div>
  
  <footer class="post-meta">
    <div class="tags">
      <span>Tags: business, marketing, ${platform.name}</span>
    </div>
  </footer>
</article>`;

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      // Mock export process - in real implementation, this would call an edge function
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Export Ready!",
        description: `Complete ${platform.name} package downloaded`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Copy & Paste Tools for {platform.name}
        </CardTitle>
        <CardDescription>
          Perfect for platforms that don't support automatic integration. 
          Everything is pre-formatted for {platform.name}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Why Manual Message */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Why Copy & Paste?</h3>
          <p className="text-sm text-blue-800">
            {platform.name} doesn't support automatic blog integration, but that's okay! 
            Our copy & paste tools are designed specifically for {platform.name} and work perfectly.
          </p>
        </div>

        {/* HTML Content Export */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">📝 Blog Content (HTML)</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(sampleBlogHTML, 'Blog HTML')}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy HTML
            </Button>
          </div>
          <div className="p-3 bg-muted rounded-lg max-h-40 overflow-y-auto">
            <pre className="text-xs text-muted-foreground">
              {sampleBlogHTML.substring(0, 300)}...
            </pre>
          </div>
          <p className="text-sm text-muted-foreground">
            Pre-formatted for {platform.name} editor with proper headings, meta tags, and structure.
          </p>
        </div>

        {/* Images Export */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">🖼️ Images & Media</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportZip}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Preparing...' : 'Download Images'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            All images optimized for web, with proper file names and alt text included.
          </p>
        </div>

        {/* SEO Data */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">🎯 SEO Data</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(`Title: Your Optimized Blog Title\nMeta Description: Your SEO-optimized meta description\nKeywords: business, marketing, ${platform.name}\nSlug: your-blog-post-url`, 'SEO Data')}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy SEO Data
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Pre-written title, meta description, and keywords ready to paste into {platform.name}.
          </p>
        </div>

        {/* Platform-Specific Tips */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-medium text-amber-900 mb-2">💡 {platform.name} Pro Tips</h3>
          <ul className="text-sm text-amber-800 space-y-1">
            {platform.instructions.manual.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>

        {/* Success Guarantee */}
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✅ 100% Compatible with {platform.name}
          </p>
          <p className="text-xs text-green-700 mt-1">
            This content is specifically formatted and tested for {platform.name}. 
            No technical setup required - just copy, paste, and publish!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};