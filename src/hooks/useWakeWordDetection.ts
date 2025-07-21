import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface WakeWordDetectionOptions {
  enabled: boolean;
  onWakeWordDetected: () => void;
  onVoiceCommand: (transcript: string) => void;
  sensitivity?: number;
}

export function useWakeWordDetection({
  enabled,
  onWakeWordDetected,
  onVoiceCommand,
  sensitivity = 0.8
}: WakeWordDetectionOptions) {
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastWakeTime, setLastWakeTime] = useState(0);

  // Initialize wake word detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      console.log('Speech recognition not supported');
      return;
    }

    setIsSupported(true);

    if (!enabled) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-AU'; // Australian English
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Wake word detection started');
    };

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.toLowerCase().trim();
        
        console.log('Wake word detection heard:', transcript);

        // Check for wake word "Hey JB" with fuzzy matching
        if (isWakeWord(transcript)) {
          const now = Date.now();
          
          // Prevent duplicate triggers within 3 seconds
          if (now - lastWakeTime > 3000) {
            setLastWakeTime(now);
            handleWakeWordDetected(transcript);
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Wake word detection error:', event.error);
      
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Permission Required",
          description: "Please allow microphone access for 'Hey JB' wake word detection",
          variant: "destructive"
        });
        return;
      }

      // Auto-restart on recoverable errors
      if (event.error === 'network' || event.error === 'audio-capture') {
        setTimeout(() => {
          if (enabled && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.log('Wake word detection restart failed:', error);
            }
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Wake word detection ended');
      
      // Auto-restart if still enabled
      if (enabled) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.log('Wake word detection auto-restart failed:', error);
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;

    // Start wake word detection
    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start wake word detection:', error);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [enabled, toast]);

  // Check if transcript contains wake word
  const isWakeWord = useCallback((transcript: string): boolean => {
    const wakeWords = [
      'hey jb',
      'hey j b',
      'hi jb',
      'jb',
      'hey jbsaas',
      'hey jay b',
      'okay jb'
    ];

    return wakeWords.some(wakeWord => {
      const similarity = calculateSimilarity(transcript, wakeWord);
      return similarity >= sensitivity;
    });
  }, [sensitivity]);

  // Calculate string similarity for fuzzy matching
  const calculateSimilarity = useCallback((str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }, []);

  // Levenshtein distance calculation
  const levenshteinDistance = useCallback((str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }, []);

  // Handle wake word detection
  const handleWakeWordDetected = useCallback((transcript: string) => {
    console.log('Wake word detected:', transcript);
    
    // Stop wake word detection temporarily
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Trigger wake word callback
    onWakeWordDetected();

    // Extract command after wake word
    const command = extractCommand(transcript);
    if (command) {
      onVoiceCommand(command);
    }

    // Show user feedback
    toast({
      title: "🎯 Hey JB Activated!",
      description: "Voice command detected - processing your healthcare idea...",
    });

    // Restart wake word detection after 5 seconds
    setTimeout(() => {
      if (enabled && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.log('Wake word detection restart failed:', error);
        }
      }
    }, 5000);
  }, [onWakeWordDetected, onVoiceCommand, enabled, toast]);

  // Extract command from transcript
  const extractCommand = useCallback((transcript: string): string => {
    const wakePatterns = [
      /hey jb,?\s*(.*)/i,
      /hi jb,?\s*(.*)/i,
      /okay jb,?\s*(.*)/i,
      /jb,?\s*(.*)/i
    ];

    for (const pattern of wakePatterns) {
      const match = transcript.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }, []);

  // Manually start/stop wake word detection
  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return false;
    
    try {
      recognitionRef.current.start();
      return true;
    } catch (error) {
      console.error('Failed to start wake word detection:', error);
      return false;
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isSupported,
    isListening,
    startListening,
    stopListening
  };
} 