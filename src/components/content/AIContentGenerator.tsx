import React, { useState } from 'react';
import { Wand2, Sparkles, FileText, MessageSquare, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { useContentTemplates } from '@/hooks/useContentTemplates';
import { useBusinessProfileContext } from '@/contexts/BusinessProfileContext';

const contentTypes = [
  { value: 'blog', label: 'Blog Post', icon: FileText },
  { value: 'social', label: 'Social Media', icon: MessageSquare },
  { value: 'ad', label: 'Advertisement', icon: Megaphone },
];

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'exciting', label: 'Exciting' },
];

interface AIContentGeneratorProps {
  onContentGenerated?: (content: string, postId: string) => void;
}

export const AIContentGenerator = ({ onContentGenerated }: AIContentGeneratorProps) => {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<'blog' | 'social' | 'ad'>('blog');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState('');

  const { generateContent, isGenerating } = useAIGeneration();
  const { templates } = useContentTemplates();
  const { activeProfile, allProfiles, isLoading: profilesLoading, switchProfile } = useBusinessProfileContext();

  const selectedProfile = selectedBusinessId 
    ? allProfiles.find(p => p.id === selectedBusinessId) 
    : activeProfile;

  const filteredTemplates = templates.filter(template => template.type === selectedType);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      const businessContext = selectedProfile ? 
        `Business: ${selectedProfile.business_name}, Industry: ${selectedProfile.industry}, Website: ${selectedProfile.website_url || 'N/A'}` : 
        undefined;

      const result = await generateContent({
        prompt,
        templateId: selectedTemplate,
        tone: selectedTone,
        type: selectedType,
        businessContext,
        businessProfileId: selectedProfile?.id
      });

      setGeneratedContent(result.content);
      onContentGenerated?.(result.content, result.postId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const TypeIcon = contentTypes.find(type => type.value === selectedType)?.icon || FileText;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-primary" />
            <CardTitle>AI Content Generator</CardTitle>
          </div>
          <CardDescription>
            Create engaging content using AI. Choose your content type, tone, and provide a prompt.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Business/Website Selection */}
          {!profilesLoading && allProfiles.length > 0 && (
            <div className="space-y-2">
              <Label>Select Business/Website</Label>
              <Select 
                value={selectedBusinessId || activeProfile?.id || ''} 
                onValueChange={setSelectedBusinessId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose business/website..." />
                </SelectTrigger>
                <SelectContent>
                  {allProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      <div className="flex flex-col">
                        <span>{profile.business_name}</span>
                        {profile.website_url && (
                          <span className="text-xs text-muted-foreground">{profile.website_url}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Content Type Selection */}
          <div className="space-y-2">
            <Label>Content Type</Label>
            <div className="grid grid-cols-3 gap-2">{contentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? 'default' : 'outline'}
                    onClick={() => setSelectedType(type.value as any)}
                    className="flex items-center space-x-2 h-auto p-4"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={selectedTone} onValueChange={setSelectedTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tones.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Selection */}
          {filteredTemplates.length > 0 && (
            <div className="space-y-2">
              <Label>Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template</SelectItem>
                  {filteredTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label>Content Prompt</Label>
            <Textarea
              placeholder="Describe what you want to create... (e.g., 'Write a blog post about the benefits of remote work for productivity')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate} 
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>

          {/* Business Context Display */}
          {selectedProfile && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="secondary">
                {selectedProfile.business_name} - {selectedProfile.industry}
              </Badge>
              {selectedProfile.website_url && (
                <Badge variant="outline">{selectedProfile.website_url}</Badge>
              )}
              <span>Business context will be included</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Content Preview */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TypeIcon className="h-5 w-5 text-primary" />
              <CardTitle>Generated Content</CardTitle>
            </div>
            <CardDescription>
              Your AI-generated {contentTypes.find(t => t.value === selectedType)?.label.toLowerCase()} content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};