import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Code, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogData {
  posts: {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    metaDescription?: string;
    keywords?: string[];
    image_urls?: string[];
    status: string;
    created_at: string;
    updated_at?: string;
    ai_tone?: string;
    ahpra_compliance_score?: number;
  }[];
  metadata?: {
    practice_name?: string;
    website_url?: string;
    specialty?: string;
    total_posts?: number;
  };
}

interface ManualExportToolsProps {
  blogData: BlogData;
}

type ExportFormat = 'csv' | 'html' | 'json' | 'txt';

export const ManualExportTools: React.FC<ManualExportToolsProps> = ({
  blogData
}) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<{ format: string; count: number; timestamp: Date } | null>(null);
  const { toast } = useToast();

  const generateFileName = (format: ExportFormat): string => {
    const timestamp = new Date().toISOString().split('T')[0];
    const practiceSlug = blogData.metadata?.practice_name?.toLowerCase().replace(/\s+/g, '-') || 'healthcare-practice';
    return `${practiceSlug}-blog-export-${timestamp}.${format}`;
  };

  const exportToCSV = (): string => {
    const headers = [
      'Title',
      'Content Preview',
      'Status',
      'AHPRA Compliance Score',
      'AI Tone',
      'Meta Description',
      'Keywords',
      'Created Date',
      'Updated Date',
      'Image Count'
    ];

    const rows = blogData.posts.map(post => [
      `"${post.title.replace(/"/g, '""')}"`,
      `"${(post.excerpt || post.content.slice(0, 100)).replace(/"/g, '""')}..."`,
      post.status,
      post.ahpra_compliance_score || 'N/A',
      post.ai_tone || 'N/A',
      `"${(post.metaDescription || '').replace(/"/g, '""')}"`,
      `"${(post.keywords?.join(', ') || '').replace(/"/g, '""')}"`,
      new Date(post.created_at).toLocaleDateString(),
      post.updated_at ? new Date(post.updated_at).toLocaleDateString() : 'N/A',
      post.image_urls?.length || 0
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const exportToHTML = (): string => {
    const practiceInfo = blogData.metadata;
    const now = new Date().toLocaleString();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${practiceInfo?.practice_name || 'Healthcare Practice'} - Blog Export</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .post { border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .post-title { color: #2563eb; font-size: 1.5em; margin-bottom: 10px; }
        .post-meta { background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 0.9em; color: #6c757d; }
        .compliance-score { 
            display: inline-block; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-weight: bold; 
            color: white;
        }
        .compliance-high { background-color: #22c55e; }
        .compliance-medium { background-color: #f59e0b; }
        .compliance-low { background-color: #ef4444; }
        .content-preview { margin: 15px 0; color: #374151; }
        .keywords { margin-top: 10px; }
        .keyword-tag { 
            background: #e5e7eb; 
            padding: 2px 6px; 
            border-radius: 3px; 
            font-size: 0.8em; 
            margin-right: 5px; 
        }
        .export-info { text-align: center; margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${practiceInfo?.practice_name || 'Healthcare Practice'} - Blog Export</h1>
        <p><strong>Specialty:</strong> ${practiceInfo?.specialty || 'Healthcare Professional'}</p>
        <p><strong>Website:</strong> ${practiceInfo?.website_url || 'N/A'}</p>
        <p><strong>Total Posts:</strong> ${blogData.posts.length}</p>
        <p><strong>Export Date:</strong> ${now}</p>
    </div>

    ${blogData.posts.map(post => {
      const complianceClass = 
        (post.ahpra_compliance_score || 0) >= 90 ? 'compliance-high' :
        (post.ahpra_compliance_score || 0) >= 80 ? 'compliance-medium' : 'compliance-low';
      
      return `
        <div class="post">
            <h2 class="post-title">${post.title}</h2>
            
            <div class="post-meta">
                <strong>Status:</strong> ${post.status} | 
                <strong>AI Tone:</strong> ${post.ai_tone || 'N/A'} | 
                <strong>Created:</strong> ${new Date(post.created_at).toLocaleDateString()} |
                <span class="compliance-score ${complianceClass}">
                    AHPRA Compliance: ${post.ahpra_compliance_score || 'N/A'}%
                </span>
            </div>

            <div class="content-preview">
                <strong>Content Preview:</strong><br>
                ${post.excerpt || post.content.slice(0, 200)}...
            </div>

            ${post.metaDescription ? `
                <div><strong>Meta Description:</strong> ${post.metaDescription}</div>
            ` : ''}

            ${post.keywords && post.keywords.length > 0 ? `
                <div class="keywords">
                    <strong>Keywords:</strong><br>
                    ${post.keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                </div>
            ` : ''}

            ${post.image_urls && post.image_urls.length > 0 ? `
                <div><strong>Images:</strong> ${post.image_urls.length} attached</div>
            ` : ''}
        </div>
      `;
    }).join('')}

    <div class="export-info">
        <p><em>This blog export was generated from JBSAAS Healthcare Content Platform</em></p>
        <p><em>AHPRA-compliant content generation for Australian healthcare professionals</em></p>
    </div>
</body>
</html>`;
  };

  const exportToJSON = (): string => {
    const exportData = {
      metadata: {
        ...blogData.metadata,
        export_date: new Date().toISOString(),
        export_format: 'json',
        total_posts: blogData.posts.length,
        platform: 'JBSAAS Healthcare Content Platform',
        compliance_note: 'All content generated with AHPRA/TGA compliance validation'
      },
      posts: blogData.posts.map(post => ({
        ...post,
        export_note: 'Healthcare content with compliance validation',
        word_count: post.content.split(' ').length,
        reading_time_minutes: Math.ceil(post.content.split(' ').length / 200)
      }))
    };

    return JSON.stringify(exportData, null, 2);
  };

  const exportToTXT = (): string => {
    const practiceInfo = blogData.metadata;
    const now = new Date().toLocaleString();

    let content = `${practiceInfo?.practice_name || 'Healthcare Practice'} - Blog Export\n`;
    content += `${'='.repeat(60)}\n\n`;
    content += `Specialty: ${practiceInfo?.specialty || 'Healthcare Professional'}\n`;
    content += `Website: ${practiceInfo?.website_url || 'N/A'}\n`;
    content += `Total Posts: ${blogData.posts.length}\n`;
    content += `Export Date: ${now}\n\n`;
    content += `${'='.repeat(60)}\n\n`;

    blogData.posts.forEach((post, index) => {
      content += `POST ${index + 1}: ${post.title}\n`;
      content += `${'-'.repeat(40)}\n`;
      content += `Status: ${post.status}\n`;
      content += `AI Tone: ${post.ai_tone || 'N/A'}\n`;
      content += `AHPRA Compliance Score: ${post.ahpra_compliance_score || 'N/A'}%\n`;
      content += `Created: ${new Date(post.created_at).toLocaleDateString()}\n`;
      
      if (post.metaDescription) {
        content += `Meta Description: ${post.metaDescription}\n`;
      }
      
      if (post.keywords && post.keywords.length > 0) {
        content += `Keywords: ${post.keywords.join(', ')}\n`;
      }
      
      content += `\nContent:\n${post.content}\n\n`;
      content += `${'='.repeat(60)}\n\n`;
    });

    content += `\nGenerated by JBSAAS Healthcare Content Platform\n`;
    content += `AHPRA-compliant content for Australian healthcare professionals\n`;

    return content;
  };

  const handleExport = async () => {
    if (blogData.posts.length === 0) {
      toast({
        title: 'No Content to Export',
        description: 'Please create some blog posts before exporting.',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);

    try {
      let content: string;
      let mimeType: string;

      switch (exportFormat) {
        case 'csv':
          content = exportToCSV();
          mimeType = 'text/csv';
          break;
        case 'html':
          content = exportToHTML();
          mimeType = 'text/html';
          break;
        case 'json':
          content = exportToJSON();
          mimeType = 'application/json';
          break;
        case 'txt':
          content = exportToTXT();
          mimeType = 'text/plain';
          break;
        default:
          throw new Error('Invalid export format');
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = generateFileName(exportFormat);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update last export info
      setLastExport({
        format: exportFormat.toUpperCase(),
        count: blogData.posts.length,
        timestamp: new Date()
      });

      toast({
        title: 'Export Successful!',
        description: `Exported ${blogData.posts.length} blog posts as ${exportFormat.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your blog data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatDescription = (format: ExportFormat): string => {
    switch (format) {
      case 'csv':
        return 'Spreadsheet format - Perfect for analytics and data analysis';
      case 'html':
        return 'Web format - Styled HTML page ready for viewing or embedding';
      case 'json':
        return 'Data format - Structured data for developers and integrations';
      case 'txt':
        return 'Text format - Simple plain text for universal compatibility';
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return <Database className="h-4 w-4" />;
      case 'html':
        return <Code className="h-4 w-4" />;
      case 'json':
        return <FileText className="h-4 w-4" />;
      case 'txt':
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Blog Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Stats */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{blogData.posts.length}</div>
            <div className="text-sm text-muted-foreground">Blog Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {blogData.posts.filter(p => p.ahpra_compliance_score && p.ahpra_compliance_score >= 90).length}
            </div>
            <div className="text-sm text-muted-foreground">AHPRA Compliant</div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  CSV - Spreadsheet Format
                </div>
              </SelectItem>
              <SelectItem value="html">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  HTML - Web Format
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  JSON - Data Format
                </div>
              </SelectItem>
              <SelectItem value="txt">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  TXT - Plain Text
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {getFormatDescription(exportFormat)}
          </p>
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport}
          disabled={isExporting || blogData.posts.length === 0}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <>
              <Download className="h-4 w-4 mr-2 animate-pulse" />
              Exporting {blogData.posts.length} posts...
            </>
          ) : (
            <>
              {getFormatIcon(exportFormat)}
              <span className="ml-2">
                Export {blogData.posts.length} Posts as {exportFormat.toUpperCase()}
              </span>
            </>
          )}
        </Button>

        {/* Last Export Info */}
        {lastExport && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="text-sm">
              <span className="font-medium">Last export:</span> {lastExport.count} posts as {lastExport.format} 
              <span className="text-muted-foreground ml-2">
                ({lastExport.timestamp.toLocaleString()})
              </span>
            </div>
          </div>
        )}

        {/* Export Tips */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <div className="font-medium mb-1">Export Tips:</div>
              <ul className="space-y-1 text-xs">
                <li>• CSV format is perfect for importing into Excel or Google Sheets</li>
                <li>• HTML format creates a styled web page with all your content</li>
                <li>• JSON format preserves all metadata for technical integrations</li>
                <li>• All exports include AHPRA compliance scores for your records</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};