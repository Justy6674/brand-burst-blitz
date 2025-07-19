import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, Eye, Settings } from 'lucide-react';
import type { PlatformCapability } from '@/lib/platformCapabilities';

interface EmbedCodeGeneratorProps {
  businessId: string;
  platform: PlatformCapability;
}

export const EmbedCodeGenerator: React.FC<EmbedCodeGeneratorProps> = ({
  businessId,
  platform
}) => {
  const { toast } = useToast();
  const [embedConfig, setEmbedConfig] = useState({
    theme: 'modern',
    postsCount: '6',
    showSearch: true,
    showCategories: true,
    containerHeight: '600'
  });

  const generateEmbedCode = () => {
    const baseUrl = 'https://api.jbsaas.com/embed/blog';
    const params = new URLSearchParams({
      business: businessId,
      theme: embedConfig.theme,
      posts: embedConfig.postsCount,
      search: embedConfig.showSearch.toString(),
      categories: embedConfig.showCategories.toString()
    });

    // Platform-specific embed code
    switch (platform.id) {
      case 'wordpress':
        return `[jbsaas-blog business="${businessId}" theme="${embedConfig.theme}" posts="${embedConfig.postsCount}"]`;
      
      case 'wix':
        return `<iframe src="${baseUrl}?${params}" 
        width="100%" 
        height="${embedConfig.containerHeight}px" 
        frameborder="0" 
        style="border: none; border-radius: 8px;">
</iframe>`;
      
      case 'squarespace':
        return `<div class="jbsaas-embed" style="width: 100%; min-height: ${embedConfig.containerHeight}px;">
  <script>
    (function() {
      var embed = document.createElement('iframe');
      embed.src = '${baseUrl}?${params}';
      embed.style.width = '100%';
      embed.style.height = '${embedConfig.containerHeight}px';
      embed.style.border = 'none';
      embed.style.borderRadius = '8px';
      document.currentScript.parentNode.appendChild(embed);
    })();
  </script>
</div>`;
      
      default:
        return `<!-- JBSAAS Blog Embed for ${platform.name} -->
<div id="jbsaas-blog-container"></div>
<script>
(function() {
  window.jbsaasConfig = {
    businessId: '${businessId}',
    theme: '${embedConfig.theme}',
    postsCount: ${embedConfig.postsCount},
    showSearch: ${embedConfig.showSearch},
    showCategories: ${embedConfig.showCategories},
    container: 'jbsaas-blog-container'
  };
  
  var script = document.createElement('script');
  script.src = 'https://api.jbsaas.com/embed.js';
  script.async = true;
  document.head.appendChild(script);
})();
</script>`;
    }
  };

  const copyEmbedCode = async () => {
    const code = generateEmbedCode();
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Embed code copied!",
        description: "Ready to paste into your website",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  const previewEmbed = () => {
    window.open(`https://api.jbsaas.com/embed/blog?business=${businessId}&theme=${embedConfig.theme}&posts=${embedConfig.postsCount}&preview=true`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔗 Embed Widget for {platform.name}
        </CardTitle>
        <CardDescription>
          Generate a customized embed code that works perfectly with {platform.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Configuration Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Widget Theme</Label>
            <Select value={embedConfig.theme} onValueChange={(value) => setEmbedConfig(prev => ({ ...prev, theme: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postsCount">Number of Posts</Label>
            <Select value={embedConfig.postsCount} onValueChange={(value) => setEmbedConfig(prev => ({ ...prev, postsCount: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 posts</SelectItem>
                <SelectItem value="6">6 posts</SelectItem>
                <SelectItem value="9">9 posts</SelectItem>
                <SelectItem value="12">12 posts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Container Height (px)</Label>
            <Input
              id="height"
              type="number"
              value={embedConfig.containerHeight}
              onChange={(e) => setEmbedConfig(prev => ({ ...prev, containerHeight: e.target.value }))}
              min="400"
              max="1200"
            />
          </div>

          <div className="space-y-3">
            <Label>Widget Features</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={embedConfig.showSearch}
                  onChange={(e) => setEmbedConfig(prev => ({ ...prev, showSearch: e.target.checked }))}
                />
                <span className="text-sm">Show search bar</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={embedConfig.showCategories}
                  onChange={(e) => setEmbedConfig(prev => ({ ...prev, showCategories: e.target.checked }))}
                />
                <span className="text-sm">Show categories</span>
              </label>
            </div>
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="flex gap-2">
          <Button onClick={previewEmbed} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview Widget
          </Button>
          <Button onClick={copyEmbedCode}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Embed Code
          </Button>
        </div>

        {/* Generated Code Display */}
        <div className="space-y-2">
          <Label>Generated Embed Code for {platform.name}</Label>
          <Textarea
            value={generateEmbedCode()}
            readOnly
            className="min-h-[120px] font-mono text-sm"
            placeholder="Configure your widget above to generate embed code..."
          />
        </div>

        {/* Platform-Specific Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            📋 How to add this to {platform.name}:
          </h4>
          <ol className="text-sm text-blue-800 space-y-1">
            {platform.instructions.embed?.map((step, index) => (
              <li key={index}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Success Message */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ <strong>Perfect for {platform.name}:</strong> This embed code is specifically optimized 
            for {platform.name} and will display beautifully on your website. The widget automatically 
            updates when you publish new blog posts!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};