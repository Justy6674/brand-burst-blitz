import { useCallback, useRef, useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { supabase } from '../integrations/supabase/client';

interface StreamingAnalysisResult {
  transcript?: string;
  confidence: number;
  isInterim: boolean;
  analysis?: {
    contentType: 'patient_education' | 'practice_marketing' | 'professional_communication';
    ahpraCompliance: number;
    suggestions: string[];
    detectedTopics: string[];
    targetAudience: string;
  };
  timestamp: number;
}

interface CanvasAnalysisResult {
  shapeDetected?: string;
  medicalDiagramType?: 'anatomy' | 'workflow' | 'concept_map' | 'unknown';
  confidence: number;
  suggestions: string[];
  contentIdeas: string[];
  timestamp: number;
}

interface StreamingOptions {
  enabled: boolean;
  voiceStreamingEnabled: boolean;
  canvasStreamingEnabled: boolean;
  analysisInterval: number; // milliseconds
  confidenceThreshold: number;
  practiceType?: string;
}

export function useRealtimeStreamingAnalysis({
  enabled = true,
  voiceStreamingEnabled = true,
  canvasStreamingEnabled = true,
  analysisInterval = 1000,
  confidenceThreshold = 0.7,
  practiceType = 'general_practice'
}: StreamingOptions) {
  const { toast } = useToast();
  
  // Voice streaming state
  const [isVoiceStreaming, setIsVoiceStreaming] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [voiceAnalysis, setVoiceAnalysis] = useState<StreamingAnalysisResult | null>(null);
  const recognitionRef = useRef<any>(null);
  const voiceStreamRef = useRef<string>('');
  
  // Canvas streaming state
  const [isCanvasStreaming, setIsCanvasStreaming] = useState(false);
  const [canvasAnalysis, setCanvasAnalysis] = useState<CanvasAnalysisResult | null>(null);
  const canvasDataRef = useRef<string>('');
  const strokeCountRef = useRef<number>(0);
  
  // Analysis timing
  const lastVoiceAnalysisRef = useRef<number>(0);
  const lastCanvasAnalysisRef = useRef<number>(0);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // WebSocket connection for real-time processing
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize WebSocket connection for real-time analysis
  useEffect(() => {
    if (!enabled) return;

    initializeWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [enabled]);

  const initializeWebSocket = useCallback(() => {
    try {
      // Create WebSocket connection to Supabase realtime
      const wsUrl = `wss://${process.env.REACT_APP_SUPABASE_URL?.replace('https://', '')}/realtime/v1/websocket`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('Real-time analysis WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('Real-time analysis WebSocket disconnected');
        
        // Attempt reconnection after 3 seconds
        setTimeout(() => {
          if (enabled) {
            initializeWebSocket();
          }
        }, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setIsConnected(false);
    }
  }, [enabled]);

  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === 'voice_analysis') {
      setVoiceAnalysis(data.result);
    } else if (data.type === 'canvas_analysis') {
      setCanvasAnalysis(data.result);
    }
  }, []);

  // Initialize continuous voice recognition
  const startVoiceStreaming = useCallback(() => {
    if (!voiceStreamingEnabled || isVoiceStreaming) return;

    try {
      if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported');
      }

      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-AU';
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsVoiceStreaming(true);
        console.log('Voice streaming started');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence || 0.8;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }

          // Real-time processing for interim results
          if (confidence >= confidenceThreshold) {
            processVoiceStream(transcript, confidence, !result.isFinal);
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setCurrentTranscript(fullTranscript);
        voiceStreamRef.current = fullTranscript;
      };

      recognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        setIsVoiceStreaming(false);
        
        if (event.error !== 'aborted') {
          toast({
            title: "Voice Streaming Error",
            description: "Voice analysis temporarily unavailable",
            variant: "destructive"
          });
        }
      };

      recognition.onend = () => {
        setIsVoiceStreaming(false);
        
        // Auto-restart if streaming should continue
        if (voiceStreamingEnabled) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (error) {
              console.log('Voice streaming auto-restart failed');
            }
          }, 1000);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error('Error starting voice streaming:', error);
      toast({
        title: "Voice Streaming Failed",
        description: "Could not start real-time voice analysis",
        variant: "destructive"
      });
    }
  }, [voiceStreamingEnabled, isVoiceStreaming, confidenceThreshold, toast]);

  const stopVoiceStreaming = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsVoiceStreaming(false);
    setCurrentTranscript('');
    voiceStreamRef.current = '';
  }, []);

  // Process voice stream in real-time
  const processVoiceStream = useCallback(async (
    transcript: string,
    confidence: number,
    isInterim: boolean
  ) => {
    const now = Date.now();
    
    // Throttle analysis to prevent overwhelming the system
    if (now - lastVoiceAnalysisRef.current < analysisInterval) {
      return;
    }
    lastVoiceAnalysisRef.current = now;

    try {
      // Local rapid analysis for immediate feedback
      const rapidAnalysis = performRapidVoiceAnalysis(transcript);
      
      setVoiceAnalysis({
        transcript,
        confidence,
        isInterim,
        analysis: rapidAnalysis,
        timestamp: now
      });

      // Send to WebSocket for advanced analysis if connected
      if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'analyze_voice_stream',
          data: {
            transcript,
            confidence,
            isInterim,
            practiceType,
            timestamp: now
          }
        }));
      } else {
        // Fallback to Edge Function for detailed analysis
        if (!isInterim && transcript.split(' ').length >= 5) {
          performDetailedVoiceAnalysis(transcript);
        }
      }
    } catch (error) {
      console.error('Error processing voice stream:', error);
    }
  }, [analysisInterval, isConnected, practiceType]);

  // Rapid local voice analysis for immediate feedback
  const performRapidVoiceAnalysis = useCallback((transcript: string) => {
    const words = transcript.toLowerCase().split(' ');
    const wordCount = words.length;
    
    // Detect content type
    let contentType: 'patient_education' | 'practice_marketing' | 'professional_communication' = 'patient_education';
    if (words.some(w => ['market', 'promote', 'advertise', 'business'].includes(w))) {
      contentType = 'practice_marketing';
    } else if (words.some(w => ['refer', 'colleague', 'professional', 'specialist'].includes(w))) {
      contentType = 'professional_communication';
    }

    // AHPRA compliance quick check
    const prohibitedWords = ['cure', 'miracle', 'guaranteed', 'best', 'perfect', 'amazing'];
    const complianceIssues = words.filter(w => prohibitedWords.includes(w));
    const ahpraCompliance = Math.max(50, 100 - (complianceIssues.length * 15));

    // Detect topics
    const healthTopics = ['diabetes', 'heart', 'mental', 'health', 'exercise', 'nutrition', 'pain', 'medicine'];
    const detectedTopics = healthTopics.filter(topic => 
      transcript.toLowerCase().includes(topic)
    );

    // Generate suggestions
    const suggestions: string[] = [];
    if (wordCount < 10) {
      suggestions.push('Consider adding more detail to your idea');
    }
    if (complianceIssues.length > 0) {
      suggestions.push('Replace compliance-sensitive terms');
    }
    if (detectedTopics.length === 0) {
      suggestions.push('Consider adding specific health topics');
    }
    if (!transcript.toLowerCase().includes('consult')) {
      suggestions.push('Consider adding "consult your healthcare provider"');
    }

    // Determine target audience
    let targetAudience = 'general_public';
    if (words.some(w => ['patient', 'patients'].includes(w))) {
      targetAudience = 'patients';
    } else if (words.some(w => ['professional', 'colleague', 'doctor'].includes(w))) {
      targetAudience = 'healthcare_professionals';
    }

    return {
      contentType,
      ahpraCompliance,
      suggestions: suggestions.slice(0, 3),
      detectedTopics,
      targetAudience
    };
  }, []);

  // Detailed voice analysis via Edge Function
  const performDetailedVoiceAnalysis = useCallback(async (transcript: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-voice-stream', {
        body: {
          transcript,
          practiceType,
          streamingMode: true
        }
      });

      if (error) throw error;

      setVoiceAnalysis(prev => prev ? {
        ...prev,
        analysis: data.analysis
      } : null);
    } catch (error) {
      console.error('Error in detailed voice analysis:', error);
    }
  }, [practiceType]);

  // Start canvas streaming analysis
  const startCanvasStreaming = useCallback((canvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (!canvasStreamingEnabled || isCanvasStreaming) return;

    setIsCanvasStreaming(true);
    strokeCountRef.current = 0;

    // Start monitoring canvas changes
    const monitorCanvas = () => {
      if (!canvasRef.current) return;

      try {
        const canvas = canvasRef.current;
        const currentData = canvas.toDataURL('image/png', 0.3); // Low quality for speed
        
        if (currentData !== canvasDataRef.current) {
          canvasDataRef.current = currentData;
          strokeCountRef.current++;
          
          // Analyze every few strokes
          if (strokeCountRef.current % 5 === 0) {
            processCanvasStream(currentData);
          }
        }
      } catch (error) {
        console.error('Error monitoring canvas:', error);
      }

      if (isCanvasStreaming) {
        requestAnimationFrame(monitorCanvas);
      }
    };

    requestAnimationFrame(monitorCanvas);
  }, [canvasStreamingEnabled, isCanvasStreaming]);

  const stopCanvasStreaming = useCallback(() => {
    setIsCanvasStreaming(false);
    setCanvasAnalysis(null);
    canvasDataRef.current = '';
    strokeCountRef.current = 0;
  }, []);

  // Process canvas stream in real-time
  const processCanvasStream = useCallback(async (canvasData: string) => {
    const now = Date.now();
    
    if (now - lastCanvasAnalysisRef.current < analysisInterval * 2) {
      return; // Canvas analysis is more expensive, so throttle more
    }
    lastCanvasAnalysisRef.current = now;

    try {
      // Rapid local analysis
      const rapidAnalysis = performRapidCanvasAnalysis(canvasData);
      setCanvasAnalysis(rapidAnalysis);

      // Send for detailed analysis if significant drawing detected
      if (strokeCountRef.current >= 10) {
        if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'analyze_canvas_stream',
            data: {
              canvasData,
              strokeCount: strokeCountRef.current,
              practiceType,
              timestamp: now
            }
          }));
        } else {
          performDetailedCanvasAnalysis(canvasData);
        }
      }
    } catch (error) {
      console.error('Error processing canvas stream:', error);
    }
  }, [analysisInterval, isConnected, practiceType]);

  // Rapid canvas analysis
  const performRapidCanvasAnalysis = useCallback((canvasData: string): CanvasAnalysisResult => {
    // Simple heuristics based on canvas data size and patterns
    const dataSize = canvasData.length;
    let confidence = Math.min(0.8, dataSize / 50000); // Rough estimate
    
    let shapeDetected = 'unknown';
    let medicalDiagramType: CanvasAnalysisResult['medicalDiagramType'] = 'unknown';
    
    // Basic shape detection based on stroke count
    if (strokeCountRef.current < 5) {
      shapeDetected = 'simple_shape';
    } else if (strokeCountRef.current < 15) {
      shapeDetected = 'diagram';
      medicalDiagramType = 'concept_map';
    } else {
      shapeDetected = 'complex_diagram';
      medicalDiagramType = 'anatomy';
    }

    const suggestions = [
      'Continue drawing to improve analysis accuracy',
      'Add labels or text to clarify your diagram',
      'Consider the target audience for your visual content'
    ];

    const contentIdeas = [
      'Patient education infographic',
      'Process flow diagram',
      'Anatomy explanation',
      'Exercise instruction guide'
    ];

    return {
      shapeDetected,
      medicalDiagramType,
      confidence,
      suggestions: suggestions.slice(0, 2),
      contentIdeas: contentIdeas.slice(0, 3),
      timestamp: Date.now()
    };
  }, []);

  // Detailed canvas analysis
  const performDetailedCanvasAnalysis = useCallback(async (canvasData: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-canvas-stream', {
        body: {
          canvasData,
          strokeCount: strokeCountRef.current,
          practiceType,
          streamingMode: true
        }
      });

      if (error) throw error;

      setCanvasAnalysis(prev => ({
        ...prev,
        ...data.analysis,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error in detailed canvas analysis:', error);
    }
  }, [practiceType]);

  // Clear all streaming data
  const clearStreamingData = useCallback(() => {
    setCurrentTranscript('');
    setVoiceAnalysis(null);
    setCanvasAnalysis(null);
    voiceStreamRef.current = '';
    canvasDataRef.current = '';
    strokeCountRef.current = 0;
  }, []);

  // Get real-time suggestions based on current state
  const getRealtimeSuggestions = useCallback((): string[] => {
    const suggestions: string[] = [];
    
    if (voiceAnalysis?.analysis) {
      suggestions.push(...voiceAnalysis.analysis.suggestions);
    }
    
    if (canvasAnalysis) {
      suggestions.push(...canvasAnalysis.suggestions);
    }
    
    // Add general streaming suggestions
    if (isVoiceStreaming && currentTranscript.split(' ').length < 5) {
      suggestions.push('Keep speaking to improve analysis accuracy');
    }
    
    if (isCanvasStreaming && strokeCountRef.current < 10) {
      suggestions.push('Continue drawing for better shape recognition');
    }

    return [...new Set(suggestions)].slice(0, 5); // Remove duplicates and limit
  }, [voiceAnalysis, canvasAnalysis, isVoiceStreaming, currentTranscript, isCanvasStreaming]);

  return {
    // Voice streaming
    isVoiceStreaming,
    currentTranscript,
    voiceAnalysis,
    startVoiceStreaming,
    stopVoiceStreaming,
    
    // Canvas streaming
    isCanvasStreaming,
    canvasAnalysis,
    startCanvasStreaming,
    stopCanvasStreaming,
    
    // General
    isConnected,
    clearStreamingData,
    getRealtimeSuggestions
  };
} 