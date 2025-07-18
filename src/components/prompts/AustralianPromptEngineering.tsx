import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Brain, 
  Target, 
  Globe, 
  Shield, 
  Clock,
  TrendingUp,
  FileText,
  Zap,
  CheckCircle
} from 'lucide-react';
import { Industry, INDUSTRIES } from '@/components/industry/IndustryPersonalizationEngine';

interface PromptTemplate {
  id: string;
  name: string;
  category: 'social' | 'blog' | 'email' | 'ad';
  industry: string;
  tone: 'professional' | 'friendly' | 'casual' | 'authoritative' | 'empathetic' | 'exciting';
  basePrompt: string;
  australianContext: string;
  complianceNotes: string[];
  variables: string[];
  version: number;
  effectiveness: number; // 0-100 score
}

const AUSTRALIAN_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'health-social-post',
    name: 'Healthcare Social Media Post',
    category: 'social',
    industry: 'health',
    tone: 'professional',
    basePrompt: "Create a professional healthcare social media post about {topic}. Focus on patient education and trust-building.",
    australianContext: "Use Australian English spelling. Include AHPRA compliance considerations. Reference Australian health guidelines where appropriate. Use local health terminology and avoid prescription medication promotion.",
    complianceNotes: [
      "No prescription medication advertising",
      "Must comply with AHPRA guidelines",
      "Include appropriate disclaimers for medical advice",
      "Avoid health claims without evidence"
    ],
    variables: ['topic', 'practice_name', 'location'],
    version: 2,
    effectiveness: 87
  },
  {
    id: 'finance-blog-post',
    name: 'Financial Services Blog',
    category: 'blog',
    industry: 'finance',
    tone: 'authoritative',
    basePrompt: "Write an authoritative blog post about {topic} for Australian business owners. Include practical advice and current market insights.",
    australianContext: "Reference Australian financial regulations, ASIC guidelines, and local market conditions. Use AUD currency examples. Include relevant Australian tax implications and business structure considerations.",
    complianceNotes: [
      "Include financial service disclaimers",
      "No specific investment advice without licensing",
      "Reference ASIC regulatory requirements",
      "Include risk disclosure statements"
    ],
    variables: ['topic', 'target_audience', 'call_to_action'],
    version: 3,
    effectiveness: 92
  },
  {
    id: 'legal-social-update',
    name: 'Legal Services Update',
    category: 'social',
    industry: 'legal',
    tone: 'professional',
    basePrompt: "Create a professional legal update post about {topic}. Educate without providing specific legal advice.",
    australianContext: "Reference Australian laws and legal procedures. Use proper Australian legal terminology. Include appropriate jurisdiction references (state/federal). Maintain professional legal communication standards.",
    complianceNotes: [
      "No specific legal advice",
      "Include appropriate disclaimers",
      "Follow legal profession conduct rules",
      "Maintain client confidentiality principles"
    ],
    variables: ['topic', 'jurisdiction', 'law_area'],
    version: 1,
    effectiveness: 89
  },
  {
    id: 'tech-product-announcement',
    name: 'Technology Product Launch',
    category: 'social',
    industry: 'tech',
    tone: 'exciting',
    basePrompt: "Create an exciting product announcement for {product_name}. Highlight innovation and benefits for Australian businesses.",
    australianContext: "Focus on benefits for Australian business operations. Reference local tech trends and digital transformation needs. Include Australian data sovereignty and privacy considerations.",
    complianceNotes: [
      "Accurate product capability claims",
      "Privacy policy compliance",
      "Australian Consumer Law adherence",
      "Clear pricing and availability"
    ],
    variables: ['product_name', 'key_features', 'target_market'],
    version: 2,
    effectiveness: 94
  }
];

interface AustralianPromptEngineeringProps {
  selectedIndustry?: string;
  selectedTone?: string;
  onPromptGenerated?: (prompt: string, metadata: any) => void;
}

export const AustralianPromptEngineering: React.FC<AustralianPromptEngineeringProps> = ({
  selectedIndustry,
  selectedTone,
  onPromptGenerated
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [promptVariables, setPromptVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedIndustry) {
      const industryTemplates = AUSTRALIAN_PROMPT_TEMPLATES.filter(
        template => template.industry === selectedIndustry
      );
      if (industryTemplates.length > 0) {
        setSelectedTemplate(industryTemplates[0]);
      }
    }
  }, [selectedIndustry]);

  const generateEnhancedPrompt = () => {
    if (!selectedTemplate || !customTopic) return;

    const industry = INDUSTRIES.find(ind => ind.id === selectedTemplate.industry);
    const currentDate = new Date().toLocaleDateString('en-AU');
    const currentTime = new Date().toLocaleTimeString('en-AU', { 
      timeZone: 'Australia/Sydney',
      hour12: true 
    });

    let enhancedPrompt = selectedTemplate.basePrompt.replace('{topic}', customTopic);
    
    // Replace other variables
    Object.entries(promptVariables).forEach(([key, value]) => {
      enhancedPrompt = enhancedPrompt.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    const fullPrompt = `
AUSTRALIAN BUSINESS CONTENT GENERATION

**Context**: ${selectedTemplate.australianContext}

**Industry**: ${industry?.name} (${selectedTemplate.industry})
**Content Type**: ${selectedTemplate.category.toUpperCase()}
**Tone**: ${selectedTemplate.tone.toUpperCase()}
**Date**: ${currentDate} (Australian date format)
**Time**: ${currentTime} (AEDT/AEST)

**Core Prompt**: ${enhancedPrompt}

**Australian Requirements**:
- Use Australian English spelling (colour, realise, centre, etc.)
- Reference local business hours and timezones
- Include relevant Australian regulations and compliance
- Use AUD currency format ($X.XX)
- Reference Australian locations, seasons, and cultural context
- Include appropriate local business terminology

**Industry Compliance**:
${selectedTemplate.complianceNotes.map(note => `- ${note}`).join('\n')}

**Target Audience**: ${industry?.targetAudience.join(', ')}

**Content Guidelines**:
- Professional Australian business communication style
- Direct but respectful language
- Include relevant local references
- Ensure compliance with Australian advertising standards
- Consider Australian business cycle timing (EOFY, holidays, etc.)

**Output Requirements**:
- Ready-to-publish content
- Appropriate length for ${selectedTemplate.category}
- Include relevant hashtags if social media
- Include call-to-action suitable for Australian audience
- Ensure accessibility and inclusive language
`;

    setGeneratedPrompt(fullPrompt);
    
    if (onPromptGenerated) {
      onPromptGenerated(fullPrompt, {
        template: selectedTemplate,
        industry: industry,
        variables: promptVariables,
        topic: customTopic
      });
    }
  };

  const availableTemplates = selectedIndustry 
    ? AUSTRALIAN_PROMPT_TEMPLATES.filter(template => template.industry === selectedIndustry)
    : AUSTRALIAN_PROMPT_TEMPLATES;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-primary" />
            Australian AI Prompt Engineering
          </CardTitle>
          <CardDescription>
            Generate industry-specific prompts optimized for Australian businesses with built-in compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Template</label>
              <Select 
                onValueChange={(templateId) => {
                  const template = AUSTRALIAN_PROMPT_TEMPLATES.find(t => t.id === templateId);
                  setSelectedTemplate(template || null);
                }}
                value={selectedTemplate?.id || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a prompt template" />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2 text-xs">
                          {template.category}
                        </Badge>
                        {template.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Content Topic</label>
              <Textarea
                placeholder="Enter your content topic or subject..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>

          {selectedTemplate && (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      <Target className="w-3 h-3 mr-1" />
                      {selectedTemplate.industry}
                    </Badge>
                    <Badge variant="outline">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {selectedTemplate.tone}
                    </Badge>
                    <Badge variant="secondary">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {selectedTemplate.effectiveness}% effective
                    </Badge>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                    v{selectedTemplate.version}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Base Prompt</h4>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded border">
                      {selectedTemplate.basePrompt}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-1 flex items-center">
                      <Globe className="w-4 h-4 mr-1 text-blue-600" />
                      Australian Context
                    </h4>
                    <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                      {selectedTemplate.australianContext}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-1 flex items-center">
                      <Shield className="w-4 h-4 mr-1 text-red-600" />
                      Compliance Requirements
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedTemplate.complianceNotes.map((note, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedTemplate.variables.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Template Variables</h4>
                      <div className="space-y-2">
                        {selectedTemplate.variables.map((variable) => (
                          <div key={variable} className="flex items-center space-x-2">
                            <label className="text-xs font-medium min-w-[100px]">
                              {variable.replace('_', ' ')}:
                            </label>
                            <input
                              type="text"
                              placeholder={`Enter ${variable.replace('_', ' ')}`}
                              value={promptVariables[variable] || ""}
                              onChange={(e) => setPromptVariables(prev => ({
                                ...prev,
                                [variable]: e.target.value
                              }))}
                              className="flex-1 px-2 py-1 text-xs border rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center space-x-4">
            <Button 
              onClick={generateEnhancedPrompt}
              disabled={!selectedTemplate || !customTopic}
              className="flex items-center"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate Enhanced Prompt
            </Button>
            
            {generatedPrompt && (
              <Badge className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Prompt Generated
              </Badge>
            )}
          </div>

          {generatedPrompt && (
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800 dark:text-green-200">
                  <FileText className="w-5 h-5 mr-2" />
                  Generated Australian Business Prompt
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  Ready to use with AI content generation tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedPrompt}
                  readOnly
                  className="min-h-[300px] bg-white dark:bg-muted font-mono text-sm"
                />
                <div className="mt-4 flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                    variant="outline"
                  >
                    Copy Prompt
                  </Button>
                  <Alert className="flex-1 py-2">
                    <Clock className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      This prompt includes Australian business context, compliance requirements, and local terminology optimization.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};