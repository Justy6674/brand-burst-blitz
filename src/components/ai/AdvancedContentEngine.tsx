import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, FileText, Target, Zap, CheckCircle } from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { toast } from "sonner";

interface ContentOutline {
  title: string;
  sections: {
    heading: string;
    keyPoints: string[];
    wordCount: number;
  }[];
  seoKeywords: string[];
  estimatedReadTime: number;
}

interface GeneratedContent {
  outline: ContentOutline;
  content: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
}

export const AdvancedContentEngine = () => {
  const { currentProfile } = useBusinessProfile();
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Advanced AI Content Engine
          </CardTitle>
          <CardDescription>
            Generate high-quality, SEO-optimized content using advanced AI models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Content Setup</TabsTrigger>
              <TabsTrigger value="outline">Outline Preview</TabsTrigger>
              <TabsTrigger value="content">Generated Content</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="outline" className="space-y-4">
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Content Outline Generated</span>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {generatedContent.outline.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {generatedContent.outline.estimatedReadTime} min read
                        </Badge>
                        <Badge variant="outline">
                          {generatedContent.outline.sections.reduce((acc, section) => acc + section.wordCount, 0)} words
                        </Badge>
                        <Badge variant="outline">
                          {generatedContent.outline.sections.length} sections
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {generatedContent.outline.sections.map((section, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4">
                          <h4 className="font-medium">{section.heading}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            ~{section.wordCount} words
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {section.keyPoints.map((point, pointIndex) => (
                              <li key={pointIndex} className="flex items-center gap-2">
                                <Target className="h-3 w-3" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      
                      {generatedContent.outline.seoKeywords.length > 0 && (
                        <div className="pt-4 border-t">
                          <h4 className="font-medium mb-2">SEO Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {generatedContent.outline.seoKeywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary">{keyword}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generate content first to see the outline</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              {generatedContent ? (
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
                  <p>Generate content first to see the results</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};