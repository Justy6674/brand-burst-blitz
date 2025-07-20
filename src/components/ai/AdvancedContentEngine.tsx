import React from "react";
import { ContentGenerator } from "./ContentGenerator";

interface AdvancedContentEngineProps {
  onContentGenerated?: (content: string, metadata: any) => void;
}

export const AdvancedContentEngine: React.FC<AdvancedContentEngineProps> = ({
  onContentGenerated
}) => {
  return (
    <ContentGenerator onContentGenerated={onContentGenerated} />
  );
};
  {
    id: 'aussie_tradie_showcase',
    name: 'Australian Tradie Job Showcase',
    description: 'Professional before/after job posts that build trust and showcase expertise',
    industry: ['construction', 'plumbing', 'electrical', 'landscaping'],
    type: 'social_post',
    prompts: {
      title: 'Generate an engaging title for this {job_type} project in {location}',
      content: `Create a professional social media post for an Australian tradie showcasing a {job_type} project. 
      
      Context:
      - Location: {location}
      - Project details: {project_details}
      - Customer satisfaction: {customer_feedback}
      - Business name: {business_name}
      
      Include:
      - Brief description of the work completed
      - Professional language that builds trust
      - Call-to-action for similar services
      - Relevant Australian tradie hashtags
      - Mention of local area/suburb
      
      Tone: {tone} - professional yet approachable
      Keep it authentic and avoid overselling.`
    },
    variables: ['job_type', 'location', 'project_details', 'customer_feedback', 'business_name'],
    tone_options: ['professional', 'friendly', 'confident', 'helpful'],
    examples: [
      {
        input: {
          job_type: 'bathroom renovation',
          location: 'Bondi, Sydney',
          project_details: 'Complete bathroom makeover with new tiles and fixtures',
          customer_feedback: 'Very happy with the quality work',
          business_name: 'Elite Plumbing Solutions'
        },
        output: 'Just wrapped up this stunning bathroom renovation in Bondi! 🔧✨\n\nComplete makeover featuring premium tiles and modern fixtures. Our clients are thrilled with the transformation!\n\n"Very happy with the quality work" - satisfied customer\n\nNeed a bathroom renovation in the Eastern Suburbs? Get in touch!\n\n#SydneyPlumber #BondiRenovations #BathroomReno #QualityWork #EasternSuburbs #TradieLife'
      }
    ]
  },
  {
    id: 'local_business_storytelling',
    name: 'Local Business Story Content',
    description: 'Engaging storytelling content that connects with local Australian communities',
    industry: ['retail', 'hospitality', 'services', 'health'],
    type: 'social_post',
    prompts: {
      title: 'Create a compelling story title about {story_theme} for {business_name}',
      content: `Write an engaging story-based social media post for a local Australian business.
      
      Story Elements:
      - Business: {business_name} in {location}
      - Theme: {story_theme}
      - Key message: {key_message}
      - Local connection: {local_connection}
      
      Structure:
      - Hook that relates to local community
      - Brief story or example
      - Connection to business values
      - Gentle call-to-action
      - Local hashtags and community tags
      
      Tone: {tone}, authentic, community-focused
      Make it feel genuine and avoid corporate speak.`
    },
    variables: ['business_name', 'location', 'story_theme', 'key_message', 'local_connection'],
    tone_options: ['warm', 'inspiring', 'relatable', 'genuine'],
    examples: []
  },
  {
    id: 'educational_authority_builder',
    name: 'Educational Authority Content',
    description: 'Expert knowledge sharing that positions your business as the local authority',
    industry: ['health', 'finance', 'legal', 'consulting', 'technology'],
    type: 'blog_article',
    prompts: {
      title: 'Create an SEO-optimized title about {topic} for Australian {industry} professionals',
      content: `Write an authoritative blog article that establishes expertise in {topic} for the Australian market.
      
      Article Requirements:
      - Topic: {topic}
      - Target audience: {target_audience}
      - Key points to cover: {key_points}
      - Local regulations/context: {australian_context}
      - Business expertise: {business_expertise}
      
      Structure:
      1. Compelling introduction with Australian context
      2. 3-5 main sections with practical insights
      3. Real examples relevant to Australian businesses
      4. Actionable takeaways
      5. Professional conclusion with soft business mention
      
      Tone: {tone}, authoritative, helpful
      Include Australian spelling and relevant regulations/standards.`,
      meta_description: 'Write a compelling meta description (150-160 chars) about {topic} for Australian {target_audience}'
    },
    variables: ['topic', 'target_audience', 'key_points', 'australian_context', 'business_expertise'],
    tone_options: ['authoritative', 'educational', 'approachable', 'professional'],
    examples: []
  },
  {
    id: 'conversion_focused_ad_copy',
    name: 'High-Converting Ad Copy',
    description: 'Persuasive ad copy optimized for Australian audiences and platforms',
    industry: ['ecommerce', 'services', 'education', 'healthcare'],
    type: 'ad_copy',
    prompts: {
      title: 'Create a compelling ad headline for {product_service} targeting {target_audience}',
      content: `Write high-converting ad copy for Australian audiences.
      
      Offer Details:
      - Product/Service: {product_service}
      - Target audience: {target_audience}
      - Key benefit: {key_benefit}
      - Unique selling point: {unique_selling_point}
      - Call-to-action: {call_to_action}
      - Special offer: {special_offer}
      
      Requirements:
      - Attention-grabbing headline
      - Clear value proposition
      - Social proof element
      - Urgency or scarcity (if applicable)
      - Strong, clear CTA
      - Australian spelling and cultural references
      
      Format: {ad_format} (Facebook/Google/Instagram)
      Tone: {tone}, persuasive without being pushy`
    },
    variables: ['product_service', 'target_audience', 'key_benefit', 'unique_selling_point', 'call_to_action', 'special_offer', 'ad_format'],
    tone_options: ['persuasive', 'urgent', 'trustworthy', 'exciting'],
    examples: []
  }
];

const ADVANCED_FEATURES = [
  {
    id: 'competitor_analysis',
    name: 'Competitor-Informed Content',
    description: 'Generate content that differentiates from competitors',
    icon: Target
  },
  {
    id: 'trend_integration',
    name: 'Trending Topic Integration',
    description: 'Incorporate current trends and viral content',
    icon: TrendingUp
  },
  {
    id: 'audience_segmentation',
    name: 'Audience-Specific Variants',
    description: 'Create multiple versions for different audience segments',
    icon: Users
  },
  {
    id: 'performance_optimization',
    name: 'Performance-Optimized Copy',
    description: 'Content optimized for engagement and conversions',
    icon: Zap
  }
];

export const AdvancedContentEngine = () => {
  const { currentProfile } = useBusinessProfile();
  const [activeTab, setActiveTab] = useState("advanced");
  
  // Template-based generation state
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  
  // Original AI engine state
  const [contentType, setContentType] = useState<"blog" | "article" | "guide" | "listicle">("blog");
  const [aiModel, setAiModel] = useState<"gpt4" | "o3" | "gemini">("gpt4");
  const [tone, setTone] = useState<"professional" | "casual" | "authoritative" | "friendly">("professional");
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [targetLength, setTargetLength] = useState<"short" | "medium" | "long">("medium");
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [templateGeneratedContent, setTemplateGeneratedContent] = useState<string>('');

  const handleTemplateSelect = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setTemplateVariables({});
    setSelectedTone(template.tone_options[0] || '');
    setTemplateGeneratedContent('');
  };

  const handleVariableChange = (variable: string, value: string) => {
    setTemplateVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const toggleFeature = (featureId: string) => {
    setActiveFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const generateTemplateContent = async () => {
    if (!selectedTemplate) {
      toast.error("Select a template first");
      return;
    }

    const requiredVars = selectedTemplate.variables.filter(variable => 
      !templateVariables[variable]?.trim()
    );

    if (requiredVars.length > 0) {
      toast.error(`Please fill in: ${requiredVars.join(', ')}`);
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI generation with template
      setGenerationStep("Processing template variables...");
      setProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setGenerationStep("Applying advanced AI features...");
      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setGenerationStep("Optimizing for Australian market...");
      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setGenerationStep("Finalizing content...");
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Build enhanced prompt
      let enhancedPrompt = selectedTemplate.prompts.content;
      
      // Replace variables
      Object.entries(templateVariables).forEach(([key, value]) => {
        enhancedPrompt = enhancedPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });
      
      // Add tone
      enhancedPrompt = enhancedPrompt.replace('{tone}', selectedTone);

      // Generate mock content based on template
      let mockContent = "";
      
      if (selectedTemplate.id === 'aussie_tradie_showcase') {
        mockContent = `Just completed an incredible ${templateVariables.job_type} project in ${templateVariables.location}! 🔧✨

${templateVariables.project_details}

"${templateVariables.customer_feedback}" - thrilled customer

Looking for quality ${templateVariables.job_type} services in ${templateVariables.location}? ${templateVariables.business_name} delivers exceptional results every time.

Get in touch for your next project! 

#${templateVariables.location?.replace(/\s+/g, '')} #${templateVariables.job_type?.replace(/\s+/g, '')} #QualityWork #TradieLife #AustralianBusiness`;
      } else if (selectedTemplate.id === 'local_business_storytelling') {
        mockContent = `There's something special about ${templateVariables.story_theme} here in ${templateVariables.location} 💖

${templateVariables.local_connection} - it's what makes ${templateVariables.business_name} more than just another business.

${templateVariables.key_message}

Come experience the difference authentic, community-focused service makes.

#${templateVariables.location?.replace(/\s+/g, '')} #CommunityFirst #LocalBusiness #AuthenticService`;
      } else {
        mockContent = `Generated content for ${selectedTemplate.name} with advanced AI optimization.

Key variables used:
${Object.entries(templateVariables).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Tone: ${selectedTone}
Advanced features: ${activeFeatures.join(', ') || 'None'}

${customPrompt ? `Custom instructions: ${customPrompt}` : ''}`;
      }

      setProgress(100);
      setTemplateGeneratedContent(mockContent);
      setGenerationStep("Template content generated!");
      toast.success("Template content generated successfully!");

    } catch (error) {
      console.error("Error generating template content:", error);
      toast.error("Failed to generate template content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedContent(null);

    try {
      // Step 1: Generate outline
      setGenerationStep("Creating content outline...");
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Content generation
      setGenerationStep("Generating content with AI...");
      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: SEO optimization
      setGenerationStep("Optimizing for SEO...");
      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Final polish
      setGenerationStep("Adding final touches...");
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate generated content
      const mockContent: GeneratedContent = {
        outline: {
          title: `The Ultimate Guide to ${topic}`,
          sections: [
            {
              heading: "Introduction",
              keyPoints: ["Hook the reader", "Define the problem", "Preview the solution"],
              wordCount: 150
            },
            {
              heading: "Understanding the Basics",
              keyPoints: ["Core concepts", "Common misconceptions", "Key terminology"],
              wordCount: 300
            },
            {
              heading: "Step-by-Step Implementation",
              keyPoints: ["Preparation phase", "Execution steps", "Quality checks"],
              wordCount: 500
            },
            {
              heading: "Advanced Tips and Tricks",
              keyPoints: ["Expert strategies", "Common pitfalls", "Optimization techniques"],
              wordCount: 350
            },
            {
              heading: "Conclusion and Next Steps",
              keyPoints: ["Key takeaways", "Action items", "Additional resources"],
              wordCount: 200
            }
          ],
          seoKeywords: keywords.split(",").map(k => k.trim()).filter(k => k),
          estimatedReadTime: 6
        },
        content: `# The Ultimate Guide to ${topic}

## Introduction

Welcome to your comprehensive guide on ${topic}. In this article, we'll explore everything you need to know to master this subject and achieve exceptional results.

## Understanding the Basics

Before diving into implementation, it's crucial to understand the fundamental concepts...

[Content would continue based on the outline...]`,
        metaTitle: `${topic} - Complete Guide for ${targetAudience || "Professionals"}`,
        metaDescription: `Discover the ultimate guide to ${topic}. Learn proven strategies, expert tips, and actionable insights.`,
        tags: [topic.toLowerCase(), "guide", targetAudience?.toLowerCase() || "business"].filter(t => t)
      };

      setProgress(100);
      setGeneratedContent(mockContent);
      setGenerationStep("Content generated successfully!");
      toast.success("Content generated successfully!");

    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const wordCountByLength = {
    short: "500-800 words",
    medium: "1000-1500 words", 
    long: "2000-3000 words"
  };

  const filteredTemplates = CONTENT_TEMPLATES.filter(template => 
    !currentProfile?.industry || 
    template.industry.includes(currentProfile.industry) ||
    template.industry.includes('general')
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Advanced Content Engine</h1>
        </div>
        <p className="text-muted-foreground">
          AI-powered content generation with industry-specific templates and advanced optimization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="advanced">Smart Templates</TabsTrigger>
          <TabsTrigger value="features">AI Features</TabsTrigger>
          <TabsTrigger value="setup">Classic Engine</TabsTrigger>
          <TabsTrigger value="content">Generated Content</TabsTrigger>
        </TabsList>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Industry-Specific Templates
                </CardTitle>
                <CardDescription>
                  Choose from professionally crafted templates designed for Australian businesses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {filteredTemplates.map(template => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {template.description}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{template.type.replace('_', ' ')}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {template.industry.slice(0, 3).map(industry => (
                            <Badge key={industry} variant="secondary" className="text-xs">
                              {industry}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Template Configuration
                </CardTitle>
                <CardDescription>
                  {selectedTemplate ? `Configure your ${selectedTemplate.name}` : 'Select a template to configure'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTemplate ? (
                  <div className="space-y-4">
                    {selectedTemplate.variables.map(variable => (
                      <div key={variable} className="space-y-2">
                        <Label htmlFor={variable}>
                          {variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} *
                        </Label>
                        {variable.includes('details') || variable.includes('description') ? (
                          <Textarea
                            id={variable}
                            placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                            value={templateVariables[variable] || ''}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                          />
                        ) : (
                          <Input
                            id={variable}
                            placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                            value={templateVariables[variable] || ''}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                          />
                        )}
                      </div>
                    ))}

                    <div className="space-y-2">
                      <Label>Content Tone</Label>
                      <Select value={selectedTone} onValueChange={setSelectedTone}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedTemplate.tone_options.map(tone => (
                            <SelectItem key={tone} value={tone}>
                              {tone.charAt(0).toUpperCase() + tone.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Instructions (Optional)</Label>
                      <Textarea
                        placeholder="Any specific requirements or additional context..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                      />
                    </div>

                    <Button 
                      onClick={generateTemplateContent} 
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Zap className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Content
                        </>
                      )}
                    </Button>

                    {isGenerating && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{generationStep}</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a template to start configuring your content
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Advanced AI Features
              </CardTitle>
              <CardDescription>
                Enable additional AI capabilities to enhance your content generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {ADVANCED_FEATURES.map(feature => {
                  const Icon = feature.icon;
                  const isActive = activeFeatures.includes(feature.id);
                  
                  return (
                    <Card 
                      key={feature.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isActive ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            <div>
                              <CardTitle className="text-lg">{feature.name}</CardTitle>
                              <CardDescription className="text-sm">
                                {feature.description}
                              </CardDescription>
                            </div>
                          </div>
                          {isActive && (
                            <Badge variant="default">Active</Badge>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🚀 Pro Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Combine multiple features for maximum content optimization</li>
                  <li>• Competitor Analysis works best with specific competitor examples</li>
                  <li>• Trend Integration requires current market awareness</li>
                  <li>• Performance Optimization focuses on conversion-driven copy</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Classic AI Content Engine
              </CardTitle>
              <CardDescription>
                Generate high-quality, SEO-optimized content using advanced AI models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Content Topic *</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Social Media Marketing for Small Businesses"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Input
                    id="audience"
                    placeholder="e.g., Small business owners"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="guide">How-to Guide</SelectItem>
                      <SelectItem value="listicle">Listicle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>AI Model</Label>
                  <Select value={aiModel} onValueChange={(value: any) => setAiModel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt4">GPT-4 (Balanced)</SelectItem>
                      <SelectItem value="o3">O3 (Creative)</SelectItem>
                      <SelectItem value="gemini">Gemini (Technical)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tone & Style</Label>
                  <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual & Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="friendly">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Length</Label>
                  <Select value={targetLength} onValueChange={(value: any) => setTargetLength(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short ({wordCountByLength.short})</SelectItem>
                      <SelectItem value="medium">Medium ({wordCountByLength.medium})</SelectItem>
                      <SelectItem value="long">Long ({wordCountByLength.long})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">SEO Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., social media, marketing, small business"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>

              {currentProfile && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Content will be generated for: <Badge variant="secondary">{currentProfile.business_name}</Badge>
                  </p>
                </div>
              )}

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !topic.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{generationStep}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {templateGeneratedContent ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <CardTitle>Template Content Generated</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(templateGeneratedContent)}>
                      Copy Content
                    </Button>
                    <Button size="sm">Use in Post</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{templateGeneratedContent}</pre>
                </div>
              </CardContent>
            </Card>
          ) : generatedContent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Content Generated Successfully</span>
                </div>
                <Button variant="outline" size="sm">
                  Copy Content
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={generatedContent.content}
                        className="min-h-[400px] font-mono text-sm"
                        readOnly
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">SEO Meta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Meta Title</Label>
                        <p className="text-sm">{generatedContent.metaTitle}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Meta Description</Label>
                        <p className="text-sm">{generatedContent.metaDescription}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {generatedContent.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Generate content using templates or the classic engine to see results here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};