import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Mic, 
  MicOff, 
  Wand2, 
  Copy, 
  X, 
  Volume2,
  Lightbulb,
  Sparkles,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedContent {
  analysis: string;
  facebook_post: string;
  linkedin_post: string;
  blog_post: string;
  hashtags: string[];
  compliance_score: number;
  provider: 'openai' | 'gemini';
}

interface QuickIdeaResult {
  success: boolean;
  originalText: string;
  transcribed: boolean;
  content: GeneratedContent;
  timestamp: string;
}

export function QuickAddFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState<QuickIdeaResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize continuous wake word detection
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-AU'; // Australian English
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        // Check for wake word "Hey JB"
        if (transcript.toLowerCase().includes('hey jb')) {
          console.log('Wake word detected!');
          setIsOpen(true);
          toast({
            title: "👋 G'day there!",
            description: "JB is listening... What's your brilliant idea?",
          });
          startVoiceRecording();
        }
      };

      recognition.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.log('Recognition restart failed:', e);
              }
            }
          }, 1000);
        }
      };

      recognition.onend = () => {
        if (isListening && !isRecording) {
          setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.log('Recognition restart failed:', e);
              }
            }
          }, 500);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition stop failed:', e);
        }
      }
    };
  }, [isListening, isRecording]);

  // Start listening for wake word when component mounts
  useEffect(() => {
    const startListening = () => {
      setIsListening(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.log('Speech recognition already running or not available');
        }
      }
    };

    // Small delay to ensure proper initialization
    const timer = setTimeout(startListening, 100);

    return () => {
      clearTimeout(timer);
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition stop failed:', e);
        }
      }
    };
  }, []);

  const startVoiceRecording = async () => {
    try {
      // Stop wake word detection while recording
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Could not stop recognition:', e);
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
        
        // Restart wake word detection
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Could not restart recognition:', e);
            }
          }
        }, 1000);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "🎙️ Recording your brilliant idea",
        description: "Share your healthcare innovation...",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Please allow microphone access to record your ideas.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "🔄 Processing...",
        description: "Converting your voice to brilliant content...",
      });
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      const { data, error } = await supabase.functions.invoke('quick-idea-capture', {
        body: { 
          audio: base64Audio,
          contentType: 'both'
        }
      });

      if (error) throw error;

      setResult(data);
      
      // Save to database
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('ideas').insert({
            user_id: userData.user.id,
            title: data.originalText.substring(0, 100), // First 100 chars as title
            original_text: data.originalText,
            ai_analysis: {
              summary: data.content.analysis,
              viability_score: data.content.compliance_score,
              market_potential: 'AI-generated analysis available',
              provider: data.content.provider
            },
            content_generated: data.content,
            source_type: 'voice',
            tags: ['idea', 'voice', 'healthcare'],
            priority: 3,
            status: 'captured'
          });
        }
      } catch (dbError) {
        console.error('Failed to save to database:', dbError);
        // Continue anyway, data is still in state
      }
      
      toast({
        title: `✨ Content generated with ${data.content.provider.toUpperCase()}!`,
        description: `${data.transcribed ? 'Voice transcribed and ' : ''}content ready to copy • Saved to Ideas Notebook`,
      });
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Error",
        description: "Failed to process your idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processText = async () => {
    if (!textInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter your idea first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('quick-idea-capture', {
        body: { 
          text: textInput,
          contentType: 'both'
        }
      });

      if (error) throw error;

      setResult(data);
      
      // Save to database
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('ideas').insert({
            user_id: userData.user.id,
            title: data.originalText.substring(0, 100), // First 100 chars as title
            original_text: data.originalText,
            ai_analysis: {
              summary: data.content.analysis,
              viability_score: data.content.compliance_score,
              market_potential: 'AI-generated analysis available',
              provider: data.content.provider
            },
            content_generated: data.content,
            source_type: 'text',
            tags: ['idea', 'text', 'healthcare'],
            priority: 3,
            status: 'captured'
          });
        }
      } catch (dbError) {
        console.error('Failed to save to database:', dbError);
        // Continue anyway, data is still in state
      }
      
      toast({
        title: `🚀 Content generated with ${data.content.provider.toUpperCase()}!`,
        description: "Your idea has been transformed into engaging content • Saved to Ideas Notebook",
      });
    } catch (error) {
      console.error('Error processing text:', error);
      toast({
        title: "Error",
        description: "Failed to process your idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copied!",
      description: `${type} content copied to clipboard`,
    });
  };

  const resetForm = () => {
    setResult(null);
    setTextInput('');
    setIsRecording(false);
    setIsProcessing(false);
  };

  const closeModal = () => {
    setIsOpen(false);
    resetForm();
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-16 w-16 rounded-full shadow-xl bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:via-accent hover:to-primary transition-all duration-500 hover:scale-110 hover:shadow-2xl border-2 border-white/20"
        >
          <div className="flex flex-col items-center">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-20 right-0 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          <p className="text-sm font-medium">Quick Add Idea</p>
          <p className="text-xs text-muted-foreground">Say "Hey JB" or click to start</p>
        </div>
        
        {/* Listening indicator */}
        {isListening && (
          <div className="absolute -top-2 -right-2 h-5 w-5 bg-emerald-500 rounded-full">
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-1 bg-emerald-400 rounded-full"></div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in duration-300">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      Quick Add Idea
                      <Sparkles className="h-5 w-5 text-primary" />
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Speak or type your idea, and I'll create content for you
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!result ? (
                <>
                  {/* Input Section */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Voice Input */}
                    <Card className="p-4 border-dashed border-2 hover:border-primary/50 transition-colors">
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <Button
                            size="lg"
                            variant={isRecording ? "destructive" : "default"}
                            className="rounded-full h-16 w-16"
                            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                            disabled={isProcessing}
                          >
                            {isRecording ? (
                              <MicOff className="h-8 w-8" />
                            ) : (
                              <Mic className="h-8 w-8" />
                            )}
                          </Button>
                        </div>
                        <div>
                          <h3 className="font-semibold">Voice Input</h3>
                          <p className="text-sm text-muted-foreground">
                            {isRecording ? "Recording... Click to stop" : "Click to record or say 'Hey JB'"}
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Text Input */}
                    <Card className="p-4 border-dashed border-2 hover:border-primary/50 transition-colors">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">Text Input</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Type your idea below
                          </p>
                        </div>
                        <Textarea
                          placeholder="Share your healthcare innovation idea... (designed for Australian healthcare professionals)"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          rows={4}
                          className="resize-none bg-white border-input text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                          disabled={false}
                        />
                        <Button 
                          onClick={processText}
                          disabled={isProcessing || !textInput.trim()}
                          className="w-full"
                        >
                          {isProcessing ? (
                            <>
                              <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Lightbulb className="h-4 w-4 mr-2" />
                              Generate Content
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  </div>

                  {/* Processing State */}
                  {isProcessing && (
                    <Card className="p-6 text-center bg-gradient-to-r from-primary/5 to-primary/10">
                      <div className="space-y-4">
                        <Wand2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                        <div>
                          <h3 className="text-lg font-semibold">AI is working its magic...</h3>
                          <p className="text-muted-foreground">
                            Analyzing your idea and generating engaging content
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <>
                  {/* Results Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">Generated Content</h3>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Volume2 className="h-3 w-3" />
                          {result.content.provider.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          Compliance: {result.content.compliance_score}%
                        </Badge>
                      </div>
                      <Button variant="outline" onClick={resetForm}>
                        Create Another
                      </Button>
                    </div>

                    {/* Original Text */}
                    <Card className="p-4 bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4" />
                        <h4 className="font-medium">Original Idea:</h4>
                        {result.transcribed && <Badge variant="secondary">Transcribed</Badge>}
                      </div>
                      <p className="text-sm">{result.originalText}</p>
                    </Card>

                    {/* AI Analysis */}
                    <Card className="p-4 bg-blue-50 border-blue-200">
                      <h4 className="font-medium mb-2 text-blue-800">AI Analysis:</h4>
                      <p className="text-sm text-blue-700">{result.content.analysis}</p>
                    </Card>

                    {/* Generated Content Tabs */}
                    <Tabs defaultValue="social" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="social">Social Media</TabsTrigger>
                        <TabsTrigger value="blog">Blog Content</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="social" className="space-y-4">
                        {/* Facebook Post */}
                        <Card className="p-4 bg-blue-50 border-blue-200">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium text-blue-800 flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-600 rounded"></div>
                              Facebook Post
                            </h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(result.content.facebook_post, "Facebook")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm whitespace-pre-line">{result.content.facebook_post}</p>
                        </Card>

                        {/* LinkedIn Post */}
                        <Card className="p-4 bg-blue-50 border-blue-200">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium text-blue-800 flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-700 rounded"></div>
                              LinkedIn Post
                            </h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(result.content.linkedin_post, "LinkedIn")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm whitespace-pre-line">{result.content.linkedin_post}</p>
                        </Card>

                        {/* Hashtags */}
                        <Card className="p-4">
                          <h5 className="font-medium mb-3">Suggested Hashtags:</h5>
                          <div className="flex flex-wrap gap-2">
                            {result.content.hashtags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="cursor-pointer"
                                onClick={() => copyToClipboard(`#${tag}`, "Hashtag")}>
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="blog" className="space-y-4">
                        <Card className="p-4 bg-green-50 border-green-200">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium text-green-800">Blog Post</h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(result.content.blog_post, "Blog post")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-sm whitespace-pre-line bg-white p-4 rounded border max-h-64 overflow-y-auto">
                            {result.content.blog_post}
                          </div>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}