import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  Edit, 
  Copy, 
  Download, 
  Share2, 
  CheckCircle, 
  RefreshCw,
  FileText,
  Code,
  Smartphone,
  Monitor
} from 'lucide-react';

interface GeneratedContent {
  title: string;
  content: string;
  htmlContent: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  wordCount: number;
  readingTime: number;
  tone: string;
  template: string;
}

interface ContentPreviewProps {
  content: GeneratedContent;
  onEdit?: (editedContent: string) => void;
  onSave?: (content: GeneratedContent) => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  content,
  onEdit,
  onSave,
  onRegenerate,
  isRegenerating = false
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content.content);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
      toast({
        title: "Copied!",
        description: `${item} copied to clipboard`
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please manually select and copy the text",
        variant: "destructive"
      });
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      onEdit?.(editedContent);
      setIsEditing(false);
      toast({
        title: "Content updated",
        description: "Your changes have been applied"
      });
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const updatedContent = {
      ...content,
      content: editedContent,
      wordCount: editedContent.split(' ').length,
      readingTime: Math.max(1, Math.ceil(editedContent.split(' ').length / 200))
    };
    onSave?.(updatedContent);
    toast({
      title: "Content saved",
      description: "Your content has been saved successfully"
    });
  };

  const downloadContent = (format: 'txt' | 'html' | 'md') => {
    let fileContent = '';
    let fileName = '';
    let mimeType = '';

    switch (format) {
      case 'txt':
        fileContent = `${content.title}\n\n${content.content}`;
        fileName = `${content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
        mimeType = 'text/plain';
        break;
      case 'html':
        fileContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.metaTitle || content.title}</title>
  ${content.metaDescription ? `<meta name="description" content="${content.metaDescription}">` : ''}
</head>
<body>
  <h1>${content.title}</h1>
  ${content.htmlContent || content.content.replace(/\n/g, '<br>')}
</body>
</html>`;
        fileName = `${content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
        mimeType = 'text/html';
        break;
      case 'md':
        fileContent = `# ${content.title}\n\n${content.content}`;
        fileName = `${content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
        mimeType = 'text/markdown';
        break;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: `Content downloaded as ${format.toUpperCase()}`
    });
  };

  const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: content.content
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(content.content, 'Content');
      }
    } else {
      copyToClipboard(content.content, 'Content');
    }
  };

  const formatContent = (text: string) => {
    // Simple formatting for display
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('#')) {
          return <h3 key={index} className="font-semibold text-lg mt-4 mb-2">{line.replace('#', '').trim()}</h3>;
        }
        return line ? <p key={index} className="mb-3">{line}</p> : <br key={index} />;
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Content Preview</h3>
          <p className="text-muted-foreground">
            Review and edit your generated content
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Word Count</p>
              <p className="font-semibold">{content.wordCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reading Time</p>
              <p className="font-semibold">{content.readingTime} min</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tone</p>
              <Badge variant="secondary">{content.tone}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Template</p>
              <Badge variant="outline">{content.template}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Tabs */}
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="edit">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="export">
            <Code className="h-4 w-4 mr-2" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{content.title}</CardTitle>
              {content.tags && content.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {content.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div 
                className={`prose prose-sm max-w-none transition-all duration-300 ${
                  previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
                }`}
              >
                {formatContent(content.content)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit Content</CardTitle>
              <CardDescription>
                Make changes to your generated content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={20}
                className="font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleEdit} variant="outline">
                  Apply Changes
                </Button>
                <Button 
                  onClick={() => setEditedContent(content.content)}
                  variant="ghost"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Options</CardTitle>
              <CardDescription>
                Download or copy your content in various formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(content.content, 'Content')}
                  className="justify-start"
                >
                  {copiedItem === 'Content' ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copiedItem === 'Content' ? 'Copied!' : 'Copy Text'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(content.title, 'Title')}
                  className="justify-start"
                >
                  {copiedItem === 'Title' ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copiedItem === 'Title' ? 'Copied!' : 'Copy Title'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => downloadContent('txt')}
                  className="justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download TXT
                </Button>

                <Button
                  variant="outline"
                  onClick={() => downloadContent('html')}
                  className="justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download HTML
                </Button>

                <Button
                  variant="outline"
                  onClick={() => downloadContent('md')}
                  className="justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Markdown
                </Button>

                <Button
                  variant="outline"
                  onClick={shareContent}
                  className="justify-start"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Content
                </Button>
              </div>

              {/* SEO Data Export */}
              {(content.metaTitle || content.metaDescription) && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-medium">SEO Metadata</h4>
                  {content.metaTitle && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Meta Title</label>
                      <div className="flex gap-2">
                        <input
                          value={content.metaTitle}
                          readOnly
                          className="flex-1 px-3 py-2 bg-muted rounded-md text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(content.metaTitle!, 'Meta Title')}
                        >
                          {copiedItem === 'Meta Title' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  {content.metaDescription && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Meta Description</label>
                      <div className="flex gap-2">
                        <textarea
                          value={content.metaDescription}
                          readOnly
                          rows={2}
                          className="flex-1 px-3 py-2 bg-muted rounded-md text-sm resize-none"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(content.metaDescription!, 'Meta Description')}
                        >
                          {copiedItem === 'Meta Description' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1">
          <FileText className="h-4 w-4 mr-2" />
          Save Content
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onRegenerate}
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};