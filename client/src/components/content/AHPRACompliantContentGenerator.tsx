import React, { useState, useEffect } from 'react';
import { useAHPRACompliantContentGenerator } from '../../hooks/useAHPRACompliantContentGenerator';
import { useHealthcareAuth } from '../../hooks/useHealthcareAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  FileText, 
  Shield, 
  Sparkles, 
  Copy, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Heart,
  BookOpen,
  MessageSquare,
  Globe,
  Mail,
  Hash,
  TrendingUp,
  Users,
  Stethoscope
} from 'lucide-react';

interface AHPRACompliantContentGeneratorProps {
  practiceId: string;
  defaultSpecialty?: string;
}

export function AHPRACompliantContentGenerator({ 
  practiceId, 
  defaultSpecialty = 'gp' 
}: AHPRACompliantContentGeneratorProps) {
  const { user } = useHealthcareAuth();
  const {
    isGenerating,
    generatedContent,
    generationHistory,
    generateCompliantContent,
    generateContentVariations,
    regenerateWithImprovements,
    getAvailableTemplates
  } = useAHPRACompliantContentGenerator();

  const [contentRequest, setContentRequest] = useState({
    topic: '',
    contentType: 'patient_education' as const,
    specialty: defaultSpecialty as any,
    wordCount: 300,
    includeDisclaimer: true,
    targetPlatform: 'website' as any,
    practiceSpecifics: {
      practiceName: '',
      ahpraNumber: '',
      specialtyArea: '',
      location: ''
    }
  });

  const [showPreview, setShowPreview] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const contentTypes = [
    { value: 'patient_education', label: 'Patient Education', icon: BookOpen },
    { value: 'blog_post', label: 'Blog Post', icon: FileText },
    { value: 'social_media', label: 'Social Media', icon: MessageSquare },
    { value: 'newsletter', label: 'Newsletter', icon: Mail },
    { value: 'website_content', label: 'Website Content', icon: Globe }
  ];

  const specialties = [
    { value: 'gp', label: 'General Practice', icon: Stethoscope },
    { value: 'psychology', label: 'Psychology', icon: Heart },
    { value: 'allied_health', label: 'Allied Health', icon: Users },
    { value: 'specialist', label: 'Specialist', icon: TrendingUp },
    { value: 'dentistry', label: 'Dentistry', icon: Shield }
  ];

  const platforms = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'website', label: 'Website' },
    { value: 'email', label: 'Email' }
  ];

  const handleGenerateContent = async () => {
    if (!contentRequest.topic.trim()) return;
    
    await generateCompliantContent(contentRequest);
    setShowPreview(true);
  };

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const renderComplianceScore = (score: number) => {
    const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-green-600';
      if (score >= 70) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getScoreLabel = (score: number) => {
      if (score >= 90) return 'Excellent';
      if (score >= 70) return 'Good';
      return 'Needs Review';
    };

    return (
      <div className="flex items-center gap-2">
        <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {score}/100
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Compliance Score</span>
          <span className={`text-xs ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </span>
        </div>
      </div>
    );
  };

  const renderContentForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate AHPRA-Compliant Content
        </CardTitle>
        <CardDescription>
          Create healthcare content that meets Australian professional standards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Healthcare Specialty</label>
            <select
              value={contentRequest.specialty}
              onChange={(e) => setContentRequest({
                ...contentRequest,
                specialty: e.target.value as any
              })}
              className="w-full p-2 border rounded-md"
            >
              {specialties.map((specialty) => (
                <option key={specialty.value} value={specialty.value}>
                  {specialty.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Type</label>
            <select
              value={contentRequest.contentType}
              onChange={(e) => setContentRequest({
                ...contentRequest,
                contentType: e.target.value as any
              })}
              className="w-full p-2 border rounded-md"
            >
              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Platform</label>
            <select
              value={contentRequest.targetPlatform}
              onChange={(e) => setContentRequest({
                ...contentRequest,
                targetPlatform: e.target.value as any
              })}
              className="w-full p-2 border rounded-md"
            >
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Word Count</label>
            <select
              value={contentRequest.wordCount}
              onChange={(e) => setContentRequest({
                ...contentRequest,
                wordCount: parseInt(e.target.value)
              })}
              className="w-full p-2 border rounded-md"
            >
              <option value={150}>150 words (Social Media)</option>
              <option value={300}>300 words (Short Article)</option>
              <option value={500}>500 words (Blog Post)</option>
              <option value={800}>800 words (Long Article)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Content Topic</label>
          <Textarea
            placeholder="e.g., Benefits of regular health check-ups for adults over 40"
            value={contentRequest.topic}
            onChange={(e) => setContentRequest({
              ...contentRequest,
              topic: e.target.value
            })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Practice Name (Optional)</label>
            <input
              type="text"
              placeholder="Your Practice Name"
              value={contentRequest.practiceSpecifics.practiceName}
              onChange={(e) => setContentRequest({
                ...contentRequest,
                practiceSpecifics: {
                  ...contentRequest.practiceSpecifics,
                  practiceName: e.target.value
                }
              })}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">AHPRA Number (Optional)</label>
            <input
              type="text"
              placeholder="MED0001234567"
              value={contentRequest.practiceSpecifics.ahpraNumber}
              onChange={(e) => setContentRequest({
                ...contentRequest,
                practiceSpecifics: {
                  ...contentRequest.practiceSpecifics,
                  ahpraNumber: e.target.value
                }
              })}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <Button
          onClick={handleGenerateContent}
          disabled={!contentRequest.topic.trim() || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating AHPRA-Compliant Content...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Healthcare Content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const renderGeneratedContent = () => {
    if (!generatedContent) return null;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Content
            </CardTitle>
            <div className="flex items-center gap-4">
              {renderComplianceScore(generatedContent.complianceScore)}
            </div>
          </div>
          <CardDescription>
            AHPRA-compliant content ready for use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge variant={generatedContent.ahpraCompliant ? "default" : "destructive"}>
              <Shield className="h-3 w-3 mr-1" />
              AHPRA {generatedContent.ahpraCompliant ? 'Compliant' : 'Review Required'}
            </Badge>
            <Badge variant={generatedContent.tgaCompliant ? "default" : "destructive"}>
              <CheckCircle className="h-3 w-3 mr-1" />
              TGA {generatedContent.tgaCompliant ? 'Compliant' : 'Review Required'}
            </Badge>
            <Badge variant="outline">
              {generatedContent.contentMetadata.wordCount} words
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Title</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyToClipboard(generatedContent.title, 'title')}
                >
                  {copiedField === 'title' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-lg">{generatedContent.title}</h3>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Content</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyToClipboard(generatedContent.content, 'content')}
                >
                  {copiedField === 'content' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                <div className="whitespace-pre-wrap">{generatedContent.content}</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Healthcare Disclaimer</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyToClipboard(generatedContent.disclaimer, 'disclaimer')}
                >
                  {copiedField === 'disclaimer' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">{generatedContent.disclaimer}</p>
              </div>
            </div>

            {generatedContent.hashtags.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Healthcare Hashtags</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(generatedContent.hashtags.join(' '), 'hashtags')}
                  >
                    {copiedField === 'hashtags' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generatedContent.hashtags.map((hashtag, index) => (
                    <Badge key={index} variant="outline" className="text-blue-600">
                      <Hash className="h-3 w-3 mr-1" />
                      {hashtag.replace('#', '')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {generatedContent.suggestedImprovements.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Compliance Suggestions:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {generatedContent.suggestedImprovements.map((improvement, index) => (
                      <li key={index} className="text-sm">{improvement}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleGenerateContent()}
              disabled={isGenerating}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContentHistory = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Recent Content
        </CardTitle>
        <CardDescription>
          Your recently generated healthcare content
        </CardDescription>
      </CardHeader>
      <CardContent>
        {generationHistory.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Content Generated Yet
            </h3>
            <p className="text-gray-600">
              Start by generating your first AHPRA-compliant healthcare content.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {generationHistory.map((content) => (
              <div
                key={content.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setGeneratedContent(content)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{content.title}</h4>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {content.specialty}
                      </Badge>
                      <Badge variant={content.ahpraCompliant ? "default" : "destructive"} className="text-xs">
                        {content.complianceScore}/100
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(content.generatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            AHPRA-Compliant Content Generator
          </h2>
          <p className="text-gray-600">
            Generate healthcare content that meets Australian professional standards
          </p>
        </div>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          All generated content is automatically validated against AHPRA advertising guidelines 
          and TGA therapeutic advertising requirements to ensure professional compliance.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Content</TabsTrigger>
          <TabsTrigger value="preview">Preview & Export</TabsTrigger>
          <TabsTrigger value="history">Content History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {renderContentForm()}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {generatedContent ? renderGeneratedContent() : (
            <Card>
              <CardContent className="p-6 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Content to Preview
                </h3>
                <p className="text-gray-600 mb-4">
                  Generate your first piece of AHPRA-compliant content to see the preview.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {renderContentHistory()}
        </TabsContent>
      </Tabs>
    </div>
  );
} 