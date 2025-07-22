import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  MessageCircle, 
  Code, 
  Download, 
  Copy,
  Lightbulb,
  Settings,
  HelpCircle,
  Zap,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  tags: string[];
  priority: number;
}

interface FAQCollection {
  id: string;
  name: string;
  template_content: string;
  metadata: any;
  created_at: string;
}

export function AIFAQChatbotGenerator() {
  const [collections, setCollections] = useState<FAQCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('retail');
  const [faqCount, setFaqCount] = useState(10);
  const [selectedCollection, setSelectedCollection] = useState<FAQCollection | null>(null);
  const { toast } = useToast();

  const industries = [
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'hospitality', label: 'Hospitality & Food Service' },
    { value: 'trades', label: 'Trades & Construction' },
    { value: 'professional', label: 'Professional Services' },
    { value: 'wellness', label: 'Health & Wellness' },
    { value: 'education', label: 'Education & Training' }
  ];

  const fetchCollections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .eq('user_id', user.id)
        .ilike('name', '%FAQ%')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCollections((data || []) as unknown as FAQCollection[]);
      if (data && data.length > 0) {
        setSelectedCollection(data[0] as unknown as FAQCollection);
      }
    } catch (error) {
      console.error('Error fetching FAQ collections:', error);
      toast({
        title: "Fetch Error",
        description: "Failed to load FAQ collections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateFAQChatbot = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-faq-chatbot', {
        body: {
          userId: user.id,
          industry: selectedIndustry,
          faqCount: faqCount
        }
      });

      if (error) throw error;

      toast({
        title: "FAQ & Chatbot Generated",
        description: `Generated ${data.faq.faqs.length} FAQs and chatbot training data`,
      });

      await fetchCollections();
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate FAQ and chatbot",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyWidgetCode = async () => {
    if (!selectedCollection?.metadata?.widget_code) return;
    
    await navigator.clipboard.writeText(selectedCollection.metadata.widget_code);
    toast({
      title: "Widget Code Copied",
      description: "Embed code has been copied to clipboard"
    });
  };

  const copyFAQContent = async (faq: FAQItem) => {
    const content = `Q: ${faq.question}\nA: ${faq.answer}`;
    await navigator.clipboard.writeText(content);
    toast({
      title: "FAQ Copied",
      description: "FAQ content copied to clipboard"
    });
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const selectedFAQs: FAQItem[] = selectedCollection 
    ? JSON.parse(selectedCollection.template_content || '{"faqs": []}').faqs || []
    : [];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI-Powered FAQ & Chatbot Generator</h2>
          <p className="text-muted-foreground">Create industry-specific FAQs and embeddable chatbots</p>
        </div>
      </div>

      {/* Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate FAQ & Chatbot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Number of FAQs</label>
              <Select value={faqCount.toString()} onValueChange={(value) => setFaqCount(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 FAQs</SelectItem>
                  <SelectItem value="10">10 FAQs</SelectItem>
                  <SelectItem value="15">15 FAQs</SelectItem>
                  <SelectItem value="20">20 FAQs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generateFAQChatbot} 
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Bot className="h-4 w-4 mr-2 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate FAQ & Chatbot
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections */}
      {collections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {collections.map((collection) => (
            <Card 
              key={collection.id} 
              className={`cursor-pointer transition-colors ${
                selectedCollection?.id === collection.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedCollection(collection)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{collection.name}</h4>
                  <Badge variant="secondary" className="capitalize">
                    {collection.metadata.industry}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {collection.metadata.faq_count} FAQs • {new Date(collection.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* FAQ & Chatbot Details */}
      {selectedCollection && (
        <Tabs defaultValue="faqs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="faqs">FAQ Collection</TabsTrigger>
            <TabsTrigger value="chatbot">Chatbot Training</TabsTrigger>
            <TabsTrigger value="widget">Embed Widget</TabsTrigger>
          </TabsList>

          <TabsContent value="faqs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Generated FAQs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFAQs.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No FAQs available in this collection.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedFAQs.map((faq, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{faq.question}</h4>
                                <Badge variant="outline" className="capitalize">
                                  {faq.category}
                                </Badge>
                                <Badge variant="secondary">
                                  Priority {faq.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{faq.answer}</p>
                              <div className="flex flex-wrap gap-1">
                                {faq.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button
                              onClick={() => copyFAQContent(faq)}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chatbot">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Chatbot Training Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCollection.metadata?.chatbot_training ? (
                  <div className="space-y-4">
                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>
                        This chatbot training data includes intent patterns, responses, and conversation flows 
                        specific to your {selectedCollection.metadata.industry} industry.
                      </AlertDescription>
                    </Alert>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Training Data Preview</h4>
                      <pre className="text-xs bg-background p-3 rounded overflow-auto max-h-64">
                        {JSON.stringify(selectedCollection.metadata.chatbot_training, null, 2)}
                      </pre>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Training Data
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Integration Guide
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No chatbot training data available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="widget">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Embeddable Widget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <MessageCircle className="h-4 w-4" />
                  <AlertDescription>
                    Copy and paste this code into your website to add an AI-powered FAQ chatbot widget.
                    The widget will appear as a floating chat button in the bottom-right corner.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Widget Embed Code</label>
                    <div className="relative">
                      <Textarea
                        value={selectedCollection.metadata?.widget_code || ''}
                        readOnly
                        rows={10}
                        className="font-mono text-xs"
                      />
                      <Button
                        onClick={copyWidgetCode}
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Features</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Responsive design</li>
                        <li>• Industry-specific responses</li>
                        <li>• Easy integration</li>
                        <li>• Mobile-friendly</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Setup Instructions</h4>
                      <ol className="text-sm text-blue-700 space-y-1">
                        <li>1. Copy the embed code above</li>
                        <li>2. Paste before closing &lt;/body&gt; tag</li>
                        <li>3. Test the widget on your site</li>
                        <li>4. Customize styling if needed</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {collections.length === 0 && !generating && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No FAQ Collections Yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate your first industry-specific FAQ collection and chatbot training data.
            </p>
            <Button onClick={generateFAQChatbot}>
              <Sparkles className="h-4 w-4 mr-2" />
              Create Your First FAQ Collection
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}