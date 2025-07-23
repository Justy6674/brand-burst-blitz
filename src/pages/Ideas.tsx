import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Square, PenTool, FileText, Wand2, Clock, Copy, ExternalLink, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IdeaConcept {
  id: string;
  title: string;
  content: string;
  type: 'voice' | 'sketch' | 'text';
  status: 'captured' | 'analyzed' | 'converted' | 'published';
  ai_analysis?: string;
  content_suggestions?: {
    facebook_post?: string;
    instagram_post?: string;
    linkedin_post?: string;
    blog_post?: string;
  };
  created_at: string;
}

export default function Ideas() {
  const [activeMode, setActiveMode] = useState<'voice' | 'sketch' | 'text' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideas, setIdeas] = useState<IdeaConcept[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contentType, setContentType] = useState<'both' | 'social' | 'blog'>('both');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processVoiceIdea(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak your idea now...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Processing your voice idea...",
      });
    }
  };

  const processVoiceIdea = async (audioBlob: Blob) => {
    try {
      setIsAnalyzing(true);
      
      // Simulate AI processing for now
      const ideaData: IdeaConcept = {
        id: Date.now().toString(),
        title: 'Voice Idea',
        content: 'AI-transcribed voice idea about healthcare innovation and patient engagement strategies',
        type: 'voice',
        status: 'analyzed',
        ai_analysis: "This appears to be a healthcare-related business idea focused on improving patient engagement through digital tools and personalized care approaches.",
        content_suggestions: {
          facebook_post: "🏥 Exciting healthcare innovation coming soon! We're exploring new ways to make patient care more personal and accessible. #HealthcareInnovation #PatientFirst",
          linkedin_post: "Healthcare Innovation Alert 📊\n\nExploring new approaches to patient engagement through technology. The future of healthcare is becoming more personalized and accessible than ever.\n\n#HealthTech #Innovation #PatientCare",
          blog_post: "# Revolutionizing Patient Engagement in Modern Healthcare\n\nThe healthcare landscape is rapidly evolving, and with it comes unprecedented opportunities to enhance patient engagement...\n\n## The Challenge\nTraditional healthcare models often leave patients feeling disconnected...\n\n## Our Solution\nBy leveraging cutting-edge technology and personalized approaches..."
        },
        created_at: new Date().toISOString()
      };

      setIdeas(prev => [ideaData, ...prev]);
      setActiveMode(null);
      
      toast({
        title: "Voice idea captured!",
        description: "AI analysis and content generation complete",
      });
    } catch (error) {
      console.error('Error processing voice idea:', error);
      toast({
        title: "Error",
        description: "Failed to process voice idea",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveTextIdea = async () => {
    if (!ideaTitle.trim() || !textContent.trim()) {
      toast({
        title: "Error",
        description: "Please provide both title and content",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const ideaData: IdeaConcept = {
        id: Date.now().toString(),
        title: ideaTitle,
        content: textContent,
        type: 'text',
        status: 'analyzed',
        ai_analysis: `Comprehensive analysis of "${ideaTitle}": This idea shows strong potential for improving healthcare outcomes through innovative approaches. The concept could help bridge gaps in current patient care delivery.`,
        content_suggestions: {
          facebook_post: `💡 Excited to share insights about ${ideaTitle}! 🏥 ${textContent.slice(0, 100)}... #HealthcareInnovation #PatientCare`,
          linkedin_post: `Healthcare Innovation: ${ideaTitle}\n\n${textContent.slice(0, 200)}...\n\nThis approach could transform how we deliver patient care. What are your thoughts on this innovation?\n\n#HealthTech #Innovation`,
          blog_post: `# ${ideaTitle}: A New Approach to Healthcare\n\n## Introduction\n${textContent}\n\n## Key Benefits\n- Enhanced patient experience\n- Improved healthcare outcomes\n- Streamlined processes\n\n## Implementation Strategy\nTo successfully implement this innovation, healthcare providers should consider...\n\n## Conclusion\n${ideaTitle} represents a significant step forward in modern healthcare delivery.`
        },
        created_at: new Date().toISOString()
      };

      setIdeas(prev => [ideaData, ...prev]);
      setActiveMode(null);
      setIdeaTitle('');
      setTextContent('');
      
      toast({
        title: "Text idea captured!",
        description: "AI analysis and content generation complete",
      });
    } catch (error) {
      console.error('Error saving text idea:', error);
      toast({
        title: "Error",
        description: "Failed to save text idea",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveSketchIdea = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !ideaTitle.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title and draw something",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const ideaData: IdeaConcept = {
        id: Date.now().toString(),
        title: ideaTitle,
        content: 'Visual concept captured through digital sketch',
        type: 'sketch',
        status: 'analyzed',
        ai_analysis: `Visual concept analysis for "${ideaTitle}": This sketch demonstrates innovative thinking in healthcare workflow design. The visual approach shows potential for improving patient flow and care coordination.`,
        content_suggestions: {
          facebook_post: `🎨 Check out this innovative concept: ${ideaTitle}! Sometimes the best healthcare ideas start with a simple sketch. Visual thinking leads to breakthrough solutions! #HealthcareDesign #Innovation`,
          linkedin_post: `Design Thinking in Healthcare: ${ideaTitle}\n\n🎨 Visualization is key to innovation in patient care. This sketch represents our approach to solving complex healthcare challenges through creative problem-solving.\n\n#DesignThinking #HealthTech #Innovation`,
          blog_post: `# Visual Innovation in Healthcare: ${ideaTitle}\n\n## The Power of Visual Thinking\nIn healthcare, complex problems often require creative solutions. This visual concept explores...\n\n## Design Process\nOur approach to healthcare innovation begins with visualization...\n\n## Implementation Vision\nThis sketch represents more than just an idea—it's a roadmap for transforming patient care.`
        },
        created_at: new Date().toISOString()
      };

      setIdeas(prev => [ideaData, ...prev]);
      setActiveMode(null);
      setIdeaTitle('');
      
      toast({
        title: "Sketch idea captured!",
        description: "AI analysis and content generation complete",
      });
    } catch (error) {
      console.error('Error saving sketch idea:', error);
      toast({
        title: "Error",
        description: "Failed to save sketch idea",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} content copied to clipboard`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'captured': return 'bg-blue-100 text-blue-800';
      case 'analyzed': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-8 w-8 text-primary" />
            Smart Ideas Notebook
          </h1>
          <p className="text-muted-foreground">Capture ideas and let AI generate content for social media and blogs</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={contentType} onValueChange={(value: 'both' | 'social' | 'blog') => setContentType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Social + Blog Content</SelectItem>
              <SelectItem value="social">Social Media Only</SelectItem>
              <SelectItem value="blog">Blog Content Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Capture Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Idea Capture</CardTitle>
        </CardHeader>
        <CardContent>
          {!activeMode ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Button
                variant="outline"
                size="lg"
                className="h-24 flex flex-col gap-2 hover:bg-primary/5"
                onClick={() => setActiveMode('voice')}
              >
                <Mic className="h-8 w-8 text-primary" />
                <span className="font-medium">Voice Recording</span>
                <span className="text-xs text-muted-foreground">Speak your idea</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-24 flex flex-col gap-2 hover:bg-primary/5"
                onClick={() => setActiveMode('sketch')}
              >
                <PenTool className="h-8 w-8 text-primary" />
                <span className="font-medium">Digital Sketch</span>
                <span className="text-xs text-muted-foreground">Draw your concept</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-24 flex flex-col gap-2 hover:bg-primary/5"
                onClick={() => setActiveMode('text')}
              >
                <FileText className="h-8 w-8 text-primary" />
                <span className="font-medium">Text Note</span>
                <span className="text-xs text-muted-foreground">Type your thoughts</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMode === 'voice' && (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    {isRecording ? (
                      <Button
                        size="lg"
                        variant="destructive"
                        className="rounded-full h-20 w-20"
                        onClick={stopVoiceRecording}
                      >
                        <Square className="h-8 w-8" />
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="rounded-full h-20 w-20 bg-red-500 hover:bg-red-600"
                        onClick={startVoiceRecording}
                        disabled={isAnalyzing}
                      >
                        <Mic className="h-8 w-8" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      {isRecording ? "🎙️ Recording in progress..." : "Click to start recording"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isRecording ? "Click the red button to stop" : "Capture your idea with voice"}
                    </p>
                  </div>
                  {isAnalyzing && (
                    <div className="flex items-center justify-center gap-2 bg-primary/10 p-4 rounded-lg">
                      <Wand2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="font-medium">AI is analyzing your voice idea and generating content...</span>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => setActiveMode(null)}>
                    Cancel
                  </Button>
                </div>
              )}

              {activeMode === 'sketch' && (
                <div className="space-y-4">
                  <Input
                    placeholder="Enter your idea title..."
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                  />
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm text-muted-foreground mb-2">Draw your concept below:</p>
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={400}
                      className="border border-dashed border-gray-300 w-full cursor-crosshair bg-white rounded"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveSketchIdea} disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Wand2 className="h-4 w-4 animate-spin mr-2" />
                          Analyzing & Generating Content...
                        </>
                      ) : (
                        'Save & Generate Content'
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setActiveMode(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {activeMode === 'text' && (
                <div className="space-y-4">
                  <Input
                    placeholder="Enter your idea title..."
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Describe your idea in detail..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button onClick={saveTextIdea} disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Wand2 className="h-4 w-4 animate-spin mr-2" />
                          Analyzing & Generating Content...
                        </>
                      ) : (
                        'Save & Generate Content'
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setActiveMode(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ideas Library */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Ideas Library</h2>
        {ideas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Clock className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No ideas yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Start capturing your ideas using voice, sketch, or text above. AI will analyze each idea and generate ready-to-use content for social media and blogs.
              </p>
            </CardContent>
          </Card>
        ) : (
          ideas.map((idea) => (
            <Card key={idea.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {idea.type === 'voice' && <Mic className="h-5 w-5" />}
                      {idea.type === 'sketch' && <PenTool className="h-5 w-5" />}
                      {idea.type === 'text' && <FileText className="h-5 w-5" />}
                      {idea.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(idea.created_at).toLocaleDateString()} • {new Date(idea.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(idea.status)}>
                      {idea.status}
                    </Badge>
                    <Badge variant="outline">
                      {idea.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Original Idea:</h4>
                    <p className="text-sm bg-muted p-3 rounded-lg">{idea.content}</p>
                  </div>
                  
                  {idea.ai_analysis && (
                    <div>
                      <h4 className="font-medium mb-2">AI Analysis:</h4>
                      <p className="text-sm bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">{idea.ai_analysis}</p>
                    </div>
                  )}

                  {idea.content_suggestions && (
                    <div>
                      <h4 className="font-medium mb-3">Generated Content:</h4>
                      <Tabs defaultValue="social" className="space-y-4">
                        <TabsList>
                          <TabsTrigger value="social">Social Media</TabsTrigger>
                          <TabsTrigger value="blog">Blog Content</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="social" className="space-y-3">
                          {idea.content_suggestions.facebook_post && (
                            <div className="border rounded-lg p-4 bg-blue-50">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium text-blue-800 flex items-center gap-2">
                                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                                  Facebook Post
                                </h5>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(idea.content_suggestions!.facebook_post!, "Facebook")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm">{idea.content_suggestions.facebook_post}</p>
                            </div>
                          )}
                          
                          {idea.content_suggestions.linkedin_post && (
                            <div className="border rounded-lg p-4 bg-blue-50">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium text-blue-800 flex items-center gap-2">
                                  <div className="w-4 h-4 bg-blue-700 rounded"></div>
                                  LinkedIn Post
                                </h5>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(idea.content_suggestions!.linkedin_post!, "LinkedIn")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm whitespace-pre-line">{idea.content_suggestions.linkedin_post}</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="blog" className="space-y-3">
                          {idea.content_suggestions.blog_post && (
                            <div className="border rounded-lg p-4 bg-green-50">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium text-green-800 flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Blog Post
                                </h5>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(idea.content_suggestions!.blog_post!, "Blog post")}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-sm whitespace-pre-line bg-white p-3 rounded border">
                                {idea.content_suggestions.blog_post}
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}