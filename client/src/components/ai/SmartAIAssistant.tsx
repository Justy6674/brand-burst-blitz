import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Minimize2, 
  Maximize2, 
  X,
  Lightbulb,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useLocation, useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    action: () => void;
    icon?: React.ReactNode;
  }>;
}

interface AIContext {
  page: string;
  userRole?: string;
  businessType?: string;
  connectedPlatforms?: string[];
  recentActivity?: string[];
  currentFeature?: string;
}

export const SmartAIAssistant = () => {
  const { toast } = useToast();
  const { profile } = useBusinessProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [context, setContext] = useState<AIContext>({ page: location.pathname });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Contextual suggestions based on current page and user state
  const getContextualSuggestions = () => {
    const page = location.pathname;
    const suggestions = [];

    switch (page) {
      case '/social-setup':
        suggestions.push(
          'Help me set up Facebook Business Manager',
          'What permissions do I need for Instagram?',
          'Guide me through LinkedIn company page creation'
        );
        break;
      case '/create-content':
        suggestions.push(
          'Generate content for my industry',
          'Create a week of social media posts',
          'Help me with trending hashtags'
        );
        break;
      case '/calendar':
        suggestions.push(
          'Plan my content calendar for next month',
          'What\'s the best posting schedule?',
          'Help me batch create content'
        );
        break;
      case '/analytics':
        suggestions.push(
          'Analyze my content performance',
          'What metrics should I focus on?',
          'Create a performance report'
        );
        break;
      default:
        suggestions.push(
          'What should I focus on today?',
          'Help me optimize my business profile',
          'Show me quick wins for my social media'
        );
    }

    return suggestions;
  };

  const generateInitialMessage = () => {
    const page = location.pathname;
    const businessName = profile?.business_name || 'your business';
    
    let greeting = `Hi! I'm your AI assistant for ${businessName}. `;
    
    switch (page) {
      case '/social-setup':
        greeting += "I can help you navigate the complex world of social media business setup. Whether you need help with Facebook Business Manager, Instagram Business accounts, or LinkedIn company pages, I'll guide you step by step.";
        break;
      case '/create-content':
        greeting += "Ready to create amazing content? I can help you generate posts, captions, hashtags, and even suggest the best times to post based on your audience.";
        break;
      case '/calendar':
        greeting += "Let's organize your content strategy! I can help you plan campaigns, schedule posts, and ensure consistent posting across all platforms.";
        break;
      case '/analytics':
        greeting += "Time to dive into your data! I can help you understand your metrics, identify trends, and optimize your content strategy for better results.";
        break;
      default:
        greeting += "I'm here to help you succeed with your social media marketing. What would you like to work on today?";
    }

    return {
      id: Date.now().toString(),
      type: 'assistant' as const,
      content: greeting,
      timestamp: new Date(),
      suggestions: getContextualSuggestions()
    };
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([generateInitialMessage()]);
    }
  }, [isOpen, location.pathname, profile]);

  useEffect(() => {
    setContext({
      page: location.pathname,
      businessType: profile?.industry,
      currentFeature: getCurrentFeature()
    });
  }, [location.pathname, profile]);

  const getCurrentFeature = () => {
    const page = location.pathname;
    if (page.includes('social')) return 'social_media_setup';
    if (page.includes('content')) return 'content_creation';
    if (page.includes('calendar')) return 'content_planning';
    if (page.includes('analytics')) return 'performance_analysis';
    return 'general_assistance';
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: `Context: User is on ${context.page} page, business type: ${context.businessType || 'general'}, current feature: ${context.currentFeature}.
          
          User question: ${content}
          
          Provide helpful, specific advice related to their current context. If they're asking about social media setup, provide step-by-step guidance. If they're asking about content creation, offer specific examples and suggestions. Be concise but comprehensive.
          
          Also suggest 2-3 relevant follow-up actions they could take.`,
          tone: 'helpful',
          type: 'assistant_response'
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.content,
        timestamp: new Date(),
        suggestions: getContextualSuggestions(),
        actions: getContextualActions(content)
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getContextualActions = (userQuery: string) => {
    const actions = [];
    
    if (userQuery.toLowerCase().includes('content') || userQuery.toLowerCase().includes('post')) {
      actions.push({
        label: 'Create Content',
        action: () => navigate('/create-content'),
        icon: <Zap className="h-4 w-4" />
      });
    }
    
    if (userQuery.toLowerCase().includes('calendar') || userQuery.toLowerCase().includes('schedule')) {
      actions.push({
        label: 'Open Calendar',
        action: () => navigate('/calendar'),
        icon: <Calendar className="h-4 w-4" />
      });
    }
    
    if (userQuery.toLowerCase().includes('setup') || userQuery.toLowerCase().includes('connect')) {
      actions.push({
        label: 'Social Setup',
        action: () => navigate('/social-setup'),
        icon: <Settings className="h-4 w-4" />
      });
    }
    
    if (userQuery.toLowerCase().includes('analytics') || userQuery.toLowerCase().includes('performance')) {
      actions.push({
        label: 'View Analytics',
        action: () => navigate('/analytics'),
        icon: <BarChart3 className="h-4 w-4" />
      });
    }

    return actions;
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: "Could not process voice input. Please try typing instead.",
          variant: "destructive"
        });
      };
      
      recognition.start();
    } else {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input. Please type your message.",
        variant: "destructive"
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg animate-pulse"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-80' : 'w-96'} ${isMinimized ? 'h-16' : 'h-[600px]'} transition-all duration-300`}>
      <Card className="h-full shadow-2xl border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {getCurrentFeature().replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-[calc(100%-80px)] p-4">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-muted text-foreground'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {message.suggestions && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs opacity-75">Suggestions:</p>
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="h-auto p-2 text-xs w-full justify-start"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              <Lightbulb className="h-3 w-3 mr-2" />
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}

                      {message.actions && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs opacity-75">Quick Actions:</p>
                          <div className="flex flex-wrap gap-2">
                            {message.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant="secondary"
                                size="sm"
                                className="h-auto p-2 text-xs"
                                onClick={action.action}
                              >
                                {action.icon}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 animate-pulse" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <Separator className="my-4" />

            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={startVoiceInput}
                disabled={isListening}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};