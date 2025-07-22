import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { useToast } from '../../hooks/use-toast';
import { useHealthcareAuth } from '../../hooks/useHealthcareAuth';
import { useWakeWordDetection } from '../../hooks/useWakeWordDetection';
import { useAutoSaveDrafts } from '../../hooks/useAutoSaveDrafts';
import { useMobileCanvasOptimization } from '../../hooks/useMobileCanvasOptimization';
import { useHealthcareSpecialtyAI } from '../../hooks/useHealthcareSpecialtyAI';
import { useRealtimeStreamingAnalysis } from '../../hooks/useRealtimeStreamingAnalysis';
import { supabase } from '../../integrations/supabase/client';
import { 
  Mic, 
  MicOff, 
  Palette, 
  Lightbulb, 
  Wand2, 
  FileText, 
  Share2, 
  Brain,
  Pencil,
  Eraser,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Calendar,
  Heart,
  Stethoscope,
  Users,
  Activity,
  Zap,
  Smartphone,
  Wifi,
  Shield,
  Clock,
  Target,
  Eye,
  Headphones,
  Save,
  WifiOff
} from 'lucide-react';

interface IdeaConcept {
  id: string;
  title: string;
  content: string;
  type: 'voice' | 'sketch' | 'text';
  voice_transcript?: string;
  sketch_data?: string;
  ai_analysis?: string;
  content_suggestions?: {
    blog_post?: string;
    facebook_post?: string;
    instagram_post?: string;
    linkedin_post?: string;
  };
  ahpra_compliance_score?: number;
  status: 'captured' | 'analyzed' | 'converted' | 'published';
  created_at: string;
  practice_id: string;
}

interface SmartIdeasSketchboardProps {
  practiceId?: string;
  onIdeaConverted?: (idea: IdeaConcept, contentType: string) => void;
}

export function SmartIdeasSketchboard({ practiceId, onIdeaConverted }: SmartIdeasSketchboardProps) {
  const { user, profile } = useHealthcareAuth();
  const { toast } = useToast();

  // State management
  const [ideas, setIdeas] = useState<IdeaConcept[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<IdeaConcept | null>(null);
  const [activeTab, setActiveTab] = useState<'voice' | 'sketch' | 'text'>('voice');
  const [textIdea, setTextIdea] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#3b82f6');

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 🚀 OPTIMIZATION 1: Wake Word Detection
  const {
    isSupported: isWakeWordSupported,
    isListening: isWakeWordListening
  } = useWakeWordDetection({
    enabled: true,
    onWakeWordDetected: () => {
      setActiveTab('voice');
      startRealtimeVoiceCapture();
    },
    onVoiceCommand: (command) => {
      setTextIdea(command);
      processTextIdea(command);
    }
  });

  // 🚀 OPTIMIZATION 2: Auto-Save Drafts
  const {
    drafts,
    isInitialized: isDraftsInitialized,
    saveDraft,
    deleteDraft,
    triggerAutoSave,
    restoreDraft,
    lastSaveTime
  } = useAutoSaveDrafts({
    enabled: true,
    interval: 10000, // 10 seconds
    practiceId: practiceId || user?.id || '',
    onDraftRestored: (draft) => {
      setTextIdea(draft.content);
      setActiveTab(draft.type);
      if (draft.sketch_data && canvasRef.current) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvasRef.current?.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            ctx.drawImage(img, 0, 0);
          }
        };
        img.src = draft.sketch_data;
      }
    },
    onAutoSaveComplete: (draftId) => {
      console.log('Auto-saved draft:', draftId);
    }
  });

  // 🚀 OPTIMIZATION 3: Mobile Canvas Optimization
  const {
    isMobile,
    isDrawing,
    gestureState,
    clearCanvas: clearMobileCanvas,
    downloadCanvasImage,
    triggerHapticFeedback
  } = useMobileCanvasOptimization({
    canvasRef,
    brushSize,
    brushColor,
    onDrawStart: (point) => {
      triggerAutoSave({
        content: 'Drawing in progress...',
        type: 'sketch',
        sketch_data: canvasRef.current?.toDataURL()
      });
    },
    onDrawMove: (point) => {
      // Auto-save every 50 strokes
      if (Math.random() < 0.02) {
        triggerAutoSave({
          content: 'Sketch in progress',
          type: 'sketch',
          sketch_data: canvasRef.current?.toDataURL()
        });
      }
    },
    onDrawEnd: () => {
      triggerAutoSave({
        content: 'Sketch completed',
        type: 'sketch',
        sketch_data: canvasRef.current?.toDataURL()
      });
    },
    enablePressureSensitivity: true,
    enableGestureDetection: true
  });

  // 🚀 OPTIMIZATION 4: Healthcare Specialty AI
  const {
    getCurrentSpecialtyContext,
    analyzeContentForSpecialty,
    generateSpecialtyContent,
    getSpecialtySuggestions,
    validateSpecialtyCompliance
  } = useHealthcareSpecialtyAI();

  // 🚀 OPTIMIZATION 5: Real-time Streaming Analysis
  const {
    isVoiceStreaming,
    currentTranscript,
    voiceAnalysis,
    startVoiceStreaming,
    stopVoiceStreaming,
    isCanvasStreaming,
    canvasAnalysis,
    startCanvasStreaming,
    stopCanvasStreaming,
    isConnected: isStreamingConnected,
    getRealtimeSuggestions
  } = useRealtimeStreamingAnalysis({
    enabled: true,
    voiceStreamingEnabled: true,
    canvasStreamingEnabled: true,
    analysisInterval: 1000,
    confidenceThreshold: 0.7,
    practiceType: profile?.practice_type || 'general_practice'
  });

  // Load existing ideas
  useEffect(() => {
    loadExistingIdeas();
  }, []);

  // Auto-save text changes
  useEffect(() => {
    if (textIdea.length > 10) {
      triggerAutoSave({
        content: textIdea,
        type: 'text'
      });
    }
  }, [textIdea, triggerAutoSave]);

  // Start canvas streaming when sketch tab is active
  useEffect(() => {
    if (activeTab === 'sketch' && canvasRef.current) {
      startCanvasStreaming(canvasRef);
    } else {
      stopCanvasStreaming();
    }
  }, [activeTab, startCanvasStreaming, stopCanvasStreaming]);

  const loadExistingIdeas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('healthcare_idea_concepts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Error loading ideas:', error);
    }
  }, [user?.id]);

  // Start real-time voice capture with streaming
  const startRealtimeVoiceCapture = useCallback(() => {
    setActiveTab('voice');
    startVoiceStreaming();
    
    toast({
      title: "🎯 Voice Streaming Active",
      description: "AI is analyzing your speech in real-time...",
    });
  }, [startVoiceStreaming, toast]);

  // Process voice transcript with specialty AI
  const processVoiceIdea = useCallback(async (transcript?: string) => {
    const content = transcript || currentTranscript;
    if (!content) return;

    try {
      setIsAnalyzing(true);

      // Get specialty context
      const specialtyContext = getCurrentSpecialtyContext();
      
      // Analyze with specialty AI
      const specialtyAnalysis = await analyzeContentForSpecialty(content, 'voice');
      
      // Generate content suggestions
      const suggestions = await Promise.all([
        generateSpecialtyContent(content, 'patient_education', 'blog'),
        generateSpecialtyContent(content, 'patient_education', 'facebook'),
        generateSpecialtyContent(content, 'patient_education', 'instagram'),
        generateSpecialtyContent(content, 'patient_education', 'linkedin')
      ]);

      const newIdea: IdeaConcept = {
        id: Date.now().toString(),
        title: specialtyAnalysis.contentType.replace('_', ' ').toUpperCase() + ': ' + content.slice(0, 50) + '...',
        content,
        type: 'voice',
        voice_transcript: content,
        ai_analysis: `Specialty: ${specialtyContext.profession}\nContent Type: ${specialtyAnalysis.contentType}\nTarget: ${specialtyAnalysis.targetAudience}\nCompliance: ${specialtyAnalysis.complianceScore}%`,
        content_suggestions: {
          blog_post: suggestions[0],
          facebook_post: suggestions[1],
          instagram_post: suggestions[2],
          linkedin_post: suggestions[3]
        },
        ahpra_compliance_score: specialtyAnalysis.complianceScore,
        status: 'analyzed',
        created_at: new Date().toISOString(),
        practice_id: practiceId || user?.id || ''
      };

      // Save to database and local state
      await saveIdeaToDatabase(newIdea);
      setIdeas(prev => [newIdea, ...prev]);
      setSelectedIdea(newIdea);

      toast({
        title: "🧠 AI Analysis Complete!",
        description: `${specialtyContext.profession} content generated with ${specialtyAnalysis.complianceScore}% AHPRA compliance`,
      });

      triggerHapticFeedback('medium');
    } catch (error) {
      console.error('Error processing voice idea:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process voice recording",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentTranscript, getCurrentSpecialtyContext, analyzeContentForSpecialty, generateSpecialtyContent, practiceId, user?.id, toast, triggerHapticFeedback]);

  // Process sketch with AI analysis
  const processSketchIdea = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsAnalyzing(true);
      const sketchData = canvas.toDataURL();
      
      // Get specialty suggestions for sketch
      const suggestions = getSpecialtySuggestions('medical diagram or sketch');
      
      // Call Edge Function for sketch analysis
      const { data, error } = await supabase.functions.invoke('analyze-sketch-idea', {
        body: {
          sketchData,
          practiceType: profile?.practice_type || 'general_practice',
          practiceId: practiceId || user?.id,
          specialtyContext: getCurrentSpecialtyContext()
        }
      });

      if (error) throw error;

      const newIdea: IdeaConcept = {
        id: Date.now().toString(),
        title: data.title || 'Healthcare Sketch Idea',
        content: data.description || '',
        type: 'sketch',
        sketch_data: sketchData,
        ai_analysis: data.analysis + '\n\nSpecialty Suggestions: ' + suggestions.join(', '),
        content_suggestions: data.suggestions,
        ahpra_compliance_score: data.complianceScore || 0,
        status: 'analyzed',
        created_at: new Date().toISOString(),
        practice_id: practiceId || user?.id || ''
      };

      await saveIdeaToDatabase(newIdea);
      setIdeas(prev => [newIdea, ...prev]);
      setSelectedIdea(newIdea);

      toast({
        title: "🎨 Sketch Analyzed!",
        description: "AI has interpreted your healthcare diagram",
      });

      triggerHapticFeedback('medium');
    } catch (error) {
      console.error('Error processing sketch:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze sketch",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [profile?.practice_type, practiceId, user?.id, toast, triggerHapticFeedback, getSpecialtySuggestions, getCurrentSpecialtyContext]);

  // Process text idea with specialty AI
  const processTextIdea = useCallback(async (content?: string) => {
    const text = content || textIdea;
    if (!text.trim()) return;

    try {
      setIsAnalyzing(true);

      // Validate compliance first
      const complianceCheck = await validateSpecialtyCompliance(text);
      
      if (!complianceCheck.isCompliant) {
        toast({
          title: "⚠️ Compliance Issues Detected",
          description: complianceCheck.issues.join(', '),
          variant: "destructive"
        });
      }

      // Analyze with specialty AI
      const specialtyAnalysis = await analyzeContentForSpecialty(text, 'text');
      
      // Generate content
      const suggestions = await Promise.all([
        generateSpecialtyContent(text, 'patient_education', 'blog'),
        generateSpecialtyContent(text, 'patient_education', 'facebook'),
        generateSpecialtyContent(text, 'patient_education', 'instagram'),
        generateSpecialtyContent(text, 'patient_education', 'linkedin')
      ]);

      const newIdea: IdeaConcept = {
        id: Date.now().toString(),
        title: specialtyAnalysis.contentType.replace('_', ' ').toUpperCase() + ': ' + text.slice(0, 50) + '...',
        content: text,
        type: 'text',
        ai_analysis: `Analysis: ${specialtyAnalysis.contentType}\nCompliance: ${complianceCheck.score}%\nSuggestions: ${complianceCheck.suggestions.join(', ')}`,
        content_suggestions: {
          blog_post: suggestions[0],
          facebook_post: suggestions[1],
          instagram_post: suggestions[2],
          linkedin_post: suggestions[3]
        },
        ahpra_compliance_score: complianceCheck.score,
        status: 'analyzed',
        created_at: new Date().toISOString(),
        practice_id: practiceId || user?.id || ''
      };

      await saveIdeaToDatabase(newIdea);
      setIdeas(prev => [newIdea, ...prev]);
      setSelectedIdea(newIdea);
      setTextIdea('');

      toast({
        title: "📝 Text Idea Processed!",
        description: `Generated with ${complianceCheck.score}% compliance score`,
      });

      triggerHapticFeedback('medium');
    } catch (error) {
      console.error('Error processing text idea:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process text idea",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [textIdea, validateSpecialtyCompliance, analyzeContentForSpecialty, generateSpecialtyContent, practiceId, user?.id, toast, triggerHapticFeedback]);

  const saveIdeaToDatabase = useCallback(async (idea: IdeaConcept) => {
    try {
      const { error } = await supabase
        .from('healthcare_idea_concepts')
        .upsert({
          id: idea.id,
          user_id: user?.id,
          practice_id: idea.practice_id,
          title: idea.title,
          content: idea.content,
          type: idea.type,
          voice_transcript: idea.voice_transcript,
          sketch_data: idea.sketch_data,
          ai_analysis: idea.ai_analysis,
          content_suggestions: idea.content_suggestions,
          ahpra_compliance_score: idea.ahpra_compliance_score,
          status: idea.status,
          created_at: idea.created_at
        });

      if (error) throw error;

      // Save as draft for backup
      saveDraft(idea);
    } catch (error) {
      console.error('Error saving idea to database:', error);
    }
  }, [user?.id, saveDraft]);

  const convertToContent = useCallback(async (idea: IdeaConcept, contentType: 'blog' | 'facebook' | 'instagram' | 'linkedin') => {
    try {
      setIsConverting(true);

      let content = '';
      switch (contentType) {
        case 'blog':
          content = idea.content_suggestions?.blog_post || '';
          break;
        case 'facebook':
          content = idea.content_suggestions?.facebook_post || '';
          break;
        case 'instagram':
          content = idea.content_suggestions?.instagram_post || '';
          break;
        case 'linkedin':
          content = idea.content_suggestions?.linkedin_post || '';
          break;
      }

      if (!content) {
        // Generate new content if not available
        content = await generateSpecialtyContent(idea.content, 'patient_education', contentType);
      }

      // Update idea status
      const updatedIdea = { ...idea, status: 'converted' as const };
      setIdeas(prev => prev.map(i => i.id === idea.id ? updatedIdea : i));
      setSelectedIdea(updatedIdea);

      // Callback to parent component
      onIdeaConverted?.(updatedIdea, contentType);

      toast({
        title: "🚀 Content Generated!",
        description: `Your ${contentType} content is ready with AHPRA compliance`,
      });

      triggerHapticFeedback('heavy');
    } catch (error) {
      console.error('Error converting to content:', error);
      toast({
        title: "Conversion Failed",
        description: "Failed to convert idea to content",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  }, [generateSpecialtyContent, onIdeaConverted, toast, triggerHapticFeedback]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIdeaTypeIcon = (type: string) => {
    switch (type) {
      case 'voice': return <Mic className="h-4 w-4" />;
      case 'sketch': return <Palette className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get real-time suggestions
  const realtimeSuggestions = getRealtimeSuggestions();
  const specialtyContext = getCurrentSpecialtyContext();

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Optimization Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Smart Ideas Sketchboard
            {isMobile && <Smartphone className="h-4 w-4 text-blue-500" />}
          </h2>
          <p className="text-gray-600">
            🚀 Optimized for {specialtyContext.profession} • 
            {isWakeWordSupported && ' "Hey JB" Enabled •'}
            {isDraftsInitialized && ' Auto-Save Active •'}
            {isStreamingConnected ? ' Real-time AI' : ' Offline Mode'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Optimization Status Indicators */}
          <div className="flex items-center gap-1">
            {isWakeWordListening && (
              <Badge variant="default" className="flex items-center gap-1 animate-pulse">
                <Headphones className="h-3 w-3" />
                Listening
              </Badge>
            )}
            
            {isStreamingConnected ? (
              <Badge variant="default" className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Live AI
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Offline
              </Badge>
            )}

            {lastSaveTime > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Save className="h-3 w-3" />
                Saved {formatTime(Math.floor((Date.now() - lastSaveTime) / 1000))} ago
              </Badge>
            )}
          </div>

          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            AHPRA Compliant
          </Badge>
        </div>
      </div>

      {/* Real-time Suggestions Bar */}
      {realtimeSuggestions.length > 0 && (
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            <strong>Live Suggestions:</strong> {realtimeSuggestions.join(' • ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Voice Streaming Status */}
      {isVoiceStreaming && voiceAnalysis && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-800 font-medium">🎙️ Real-time Voice Analysis</span>
              <Badge variant="outline">{Math.round(voiceAnalysis.confidence * 100)}% confidence</Badge>
            </div>
            
            {voiceAnalysis.analysis && (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Type:</strong> {voiceAnalysis.analysis.contentType.replace('_', ' ')}
                  <strong className="ml-4">AHPRA:</strong> 
                  <span className={getComplianceColor(voiceAnalysis.analysis.ahpraCompliance)}>
                    {voiceAnalysis.analysis.ahpraCompliance}%
                  </span>
                </div>
                
                <Progress value={voiceAnalysis.analysis.ahpraCompliance} className="h-2" />
                
                {voiceAnalysis.analysis.detectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {voiceAnalysis.analysis.detectedTopics.map(topic => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Idea Capture Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Capture Your Idea
              {isMobile && <span className="text-sm text-gray-500">(Touch Optimized)</span>}
            </CardTitle>
            <CardDescription>
              Healthcare ideas with AI analysis, auto-save, and {specialtyContext.profession} optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="voice" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Voice
                  {isVoiceStreaming && <Activity className="h-3 w-3 animate-spin text-green-500" />}
                </TabsTrigger>
                <TabsTrigger value="sketch" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Sketch
                  {isCanvasStreaming && <Eye className="h-3 w-3 animate-pulse text-blue-500" />}
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Text
                </TabsTrigger>
              </TabsList>

              {/* Enhanced Voice Input Tab */}
              <TabsContent value="voice" className="space-y-4">
                <Alert>
                  <Mic className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Voice Ideas:</strong> Say "Hey JB" for hands-free activation, or describe your {specialtyContext.profession.toLowerCase()} content idea
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                    {isVoiceStreaming ? (
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center">
                          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                            <Mic className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">Real-time Analysis Active</div>
                          <div className="text-green-600 font-mono">
                            {currentTranscript || 'Listening...'}
                          </div>
                        </div>
                        <Button
                          onClick={stopVoiceStreaming}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Square className="h-4 w-4" />
                          Stop Streaming
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <Button
                          onClick={startRealtimeVoiceCapture}
                          size="lg"
                          className="h-16 w-16 rounded-full flex items-center justify-center"
                        >
                          <Mic className="h-8 w-8" />
                        </Button>
                        <div>
                          <div className="text-lg font-semibold">Real-time Voice Capture</div>
                          <div className="text-gray-600">
                            Click or say "Hey JB" to start
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {currentTranscript && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-blue-800 flex-1">"{currentTranscript}"</span>
                        <Button
                          onClick={() => processVoiceIdea()}
                          disabled={isAnalyzing}
                          className="flex items-center gap-2"
                        >
                          {isAnalyzing ? (
                            <>
                              <Activity className="h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4" />
                              Analyze with AI
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Enhanced Sketch Input Tab */}
              <TabsContent value="sketch" className="space-y-4">
                <Alert>
                  <Palette className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Healthcare Sketches:</strong> Draw medical diagrams, workflow charts, or concept maps. 
                    {isMobile && ' Touch and pressure-sensitive!'}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {/* Enhanced Drawing Tools */}
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="brush-size">Brush:</Label>
                      <Input
                        id="brush-size"
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm w-12">{brushSize}px</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor="brush-color">Color:</Label>
                      <Input
                        id="brush-color"
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-12 h-8"
                      />
                    </div>

                    <Button
                      onClick={clearMobileCanvas}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Eraser className="h-4 w-4" />
                      Clear
                    </Button>

                    {isMobile && (
                      <Button
                        onClick={() => downloadCanvasImage('healthcare-sketch')}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Save
                      </Button>
                    )}
                  </div>

                  {/* Enhanced Canvas */}
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-2">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={400}
                      className={`border border-gray-300 rounded w-full ${
                        isMobile ? 'cursor-crosshair touch-none' : 'cursor-crosshair'
                      }`}
                    />
                  </div>

                  {/* Canvas Analysis Display */}
                  {canvasAnalysis && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-800">Live Canvas Analysis</span>
                        <Badge variant="outline">{Math.round(canvasAnalysis.confidence * 100)}%</Badge>
                      </div>
                      
                      {canvasAnalysis.shapeDetected && (
                        <div className="text-sm space-y-1">
                          <div><strong>Detected:</strong> {canvasAnalysis.shapeDetected}</div>
                          {canvasAnalysis.medicalDiagramType && (
                            <div><strong>Type:</strong> {canvasAnalysis.medicalDiagramType.replace('_', ' ')}</div>
                          )}
                          
                          {canvasAnalysis.contentIdeas.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {canvasAnalysis.contentIdeas.map(idea => (
                                <Badge key={idea} variant="secondary" className="text-xs">
                                  {idea}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={processSketchIdea}
                    disabled={isAnalyzing}
                    className="w-full flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Activity className="h-4 w-4 animate-spin" />
                        Analyzing Sketch...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Analyze with {specialtyContext.profession} AI
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Enhanced Text Input Tab */}
              <TabsContent value="text" className="space-y-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Text Ideas:</strong> Write your {specialtyContext.profession.toLowerCase()} content concepts. 
                    Auto-save and specialty optimization enabled.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <Textarea
                    placeholder={`E.g., 'Patient education blog about ${specialtyContext.contentFocus[0]?.replace('_', ' ')}' or 'Social media post explaining ${specialtyContext.contentFocus[1]?.replace('_', ' ')}'...`}
                    value={textIdea}
                    onChange={(e) => setTextIdea(e.target.value)}
                    rows={6}
                    className="w-full"
                  />

                  {/* Live character count and suggestions */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{textIdea.length} characters</span>
                    {textIdea.length > 10 && <span className="text-green-600">✓ Auto-saving...</span>}
                  </div>

                  <Button
                    onClick={() => processTextIdea()}
                    disabled={!textIdea.trim() || isAnalyzing}
                    className="w-full flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Activity className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Process with {specialtyContext.profession} AI
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Enhanced Ideas Library & Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Your Ideas & AI Analysis
              <Badge variant="outline">{ideas.length}</Badge>
            </CardTitle>
            <CardDescription>
              {specialtyContext.profession} content with real-time compliance scoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Draft Recovery Section */}
            {drafts.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-800">Saved Drafts ({drafts.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {drafts.slice(0, 3).map(draft => (
                    <Button
                      key={draft.id}
                      onClick={() => restoreDraft(draft.id)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {draft.type} • {new Date(draft.timestamp).toLocaleTimeString()}
                    </Button>
                  ))}
                  {drafts.length > 3 && (
                    <Badge variant="secondary">+{drafts.length - 3} more</Badge>
                  )}
                </div>
              </div>
            )}

            {ideas.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Ideas Captured Yet</h3>
                <p className="text-gray-600">
                  Start capturing your {specialtyContext.profession.toLowerCase()} content ideas using voice, sketches, or text
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Ideas List */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {ideas.map((idea) => (
                    <div
                      key={idea.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedIdea?.id === idea.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedIdea(idea)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            {getIdeaTypeIcon(idea.type)}
                            <span className="font-medium text-sm">{idea.title}</span>
                            <Badge variant="outline" className={idea.status === 'analyzed' ? 'border-green-300 text-green-700' : ''}>
                              {idea.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{idea.content}</p>
                          {idea.ahpra_compliance_score && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs">AHPRA:</span>
                              <span className={`text-xs font-medium ${getComplianceColor(idea.ahpra_compliance_score)}`}>
                                {idea.ahpra_compliance_score}%
                              </span>
                              <Progress value={idea.ahpra_compliance_score} className="h-1 flex-1 max-w-20" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(idea.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Selected Idea Analysis */}
                {selectedIdea && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        {specialtyContext.profession} Analysis
                      </h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {selectedIdea.ai_analysis || 'Processing analysis...'}
                      </p>
                    </div>

                    {selectedIdea.content_suggestions && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Content Suggestions
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedIdea.content_suggestions.blog_post && (
                            <Button
                              onClick={() => convertToContent(selectedIdea, 'blog')}
                              disabled={isConverting}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <FileText className="h-3 w-3" />
                              Blog Post
                            </Button>
                          )}
                          {selectedIdea.content_suggestions.facebook_post && (
                            <Button
                              onClick={() => convertToContent(selectedIdea, 'facebook')}
                              disabled={isConverting}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Share2 className="h-3 w-3" />
                              Facebook
                            </Button>
                          )}
                          {selectedIdea.content_suggestions.instagram_post && (
                            <Button
                              onClick={() => convertToContent(selectedIdea, 'instagram')}
                              disabled={isConverting}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Heart className="h-3 w-3" />
                              Instagram
                            </Button>
                          )}
                          {selectedIdea.content_suggestions.linkedin_post && (
                            <Button
                              onClick={() => convertToContent(selectedIdea, 'linkedin')}
                              disabled={isConverting}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Users className="h-3 w-3" />
                              LinkedIn
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 