import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, PenTool, FileText, Wand2, Clock } from 'lucide-react';
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
  };
  created_at: string;
}

export function QuickIdeaCapture() {
  const [activeMode, setActiveMode] = useState<'voice' | 'sketch' | 'text' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideas, setIdeas] = useState<IdeaConcept[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
        content: 'AI-transcribed voice idea about healthcare innovation',
        type: 'voice',
        status: 'analyzed',
        ai_analysis: "This appears to be a healthcare-related business idea focused on patient engagement.",
        content_suggestions: {
          facebook_post: "Exciting healthcare innovation coming soon! 🏥✨",
          linkedin_post: "Exploring new ways to improve patient care through technology."
        },
        created_at: new Date().toISOString()
      };

      setIdeas(prev => [ideaData, ...prev]);
      setActiveMode(null);
      
      toast({
        title: "Voice idea captured!",
        description: "AI analysis complete",
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
        ai_analysis: `Great healthcare idea about ${ideaTitle}. This could help improve patient outcomes.`,
        content_suggestions: {
          facebook_post: `Excited to share insights about ${ideaTitle}! 🏥 ${textContent.slice(0, 100)}...`,
          linkedin_post: `Healthcare Innovation: ${ideaTitle}\n\n${textContent.slice(0, 200)}...`
        },
        created_at: new Date().toISOString()
      };

      setIdeas(prev => [ideaData, ...prev]);
      setActiveMode(null);
      setIdeaTitle('');
      setTextContent('');
      
      toast({
        title: "Text idea captured!",
        description: "AI analysis complete",
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
        content: 'Sketch idea captured',
        type: 'sketch',
        status: 'analyzed',
        ai_analysis: `Visual concept for ${ideaTitle}. This sketch shows potential for healthcare workflow improvement.`,
        content_suggestions: {
          facebook_post: `Check out this innovative concept: ${ideaTitle}! 🎨 Sometimes the best ideas start with a simple sketch.`,
          linkedin_post: `Design thinking in healthcare: ${ideaTitle}\n\nVisualization is key to innovation in patient care.`
        },
        created_at: new Date().toISOString()
      };

      setIdeas(prev => [ideaData, ...prev]);
      setActiveMode(null);
      setIdeaTitle('');
      
      toast({
        title: "Sketch idea captured!",
        description: "AI analysis complete",
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
                className="h-24 flex flex-col gap-2"
                onClick={() => setActiveMode('voice')}
              >
                <Mic className="h-8 w-8" />
                Voice Recording
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-24 flex flex-col gap-2"
                onClick={() => setActiveMode('sketch')}
              >
                <PenTool className="h-8 w-8" />
                Quick Sketch
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-24 flex flex-col gap-2"
                onClick={() => setActiveMode('text')}
              >
                <FileText className="h-8 w-8" />
                Text Note
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
                        className="rounded-full h-20 w-20"
                        onClick={startVoiceRecording}
                        disabled={isAnalyzing}
                      >
                        <Mic className="h-8 w-8" />
                      </Button>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {isRecording ? "Recording... Click to stop" : "Click to start recording"}
                  </p>
                  {isAnalyzing && (
                    <div className="flex items-center justify-center gap-2">
                      <Wand2 className="h-4 w-4 animate-spin" />
                      <span>AI is analyzing your voice idea...</span>
                    </div>
                  )}
                </div>
              )}

              {activeMode === 'sketch' && (
                <div className="space-y-4">
                  <Input
                    placeholder="Enter idea title..."
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                  />
                  <div className="border rounded-lg p-4">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={400}
                      className="border border-dashed border-gray-300 w-full cursor-crosshair"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveSketchIdea} disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Wand2 className="h-4 w-4 animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        'Save Sketch'
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
                    placeholder="Enter idea title..."
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Describe your idea..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={6}
                  />
                  <div className="flex gap-2">
                    <Button onClick={saveTextIdea} disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Wand2 className="h-4 w-4 animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        'Save Idea'
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

      {/* Ideas List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Ideas</h3>
        {ideas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No ideas yet</h3>
              <p className="text-muted-foreground text-center">
                Capture your first idea using voice, sketch, or text above.
              </p>
            </CardContent>
          </Card>
        ) : (
          ideas.map((idea) => (
            <Card key={idea.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(idea.created_at).toLocaleDateString()}
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
                <p className="text-sm mb-4">{idea.content}</p>
                {idea.ai_analysis && (
                  <div className="bg-muted p-3 rounded-lg mb-4">
                    <p className="text-sm"><strong>AI Analysis:</strong> {idea.ai_analysis}</p>
                  </div>
                )}
                {idea.content_suggestions && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Generated Content:</h4>
                    {idea.content_suggestions.facebook_post && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Facebook:</p>
                        <p className="text-sm">{idea.content_suggestions.facebook_post}</p>
                      </div>
                    )}
                    {idea.content_suggestions.linkedin_post && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">LinkedIn:</p>
                        <p className="text-sm">{idea.content_suggestions.linkedin_post}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}