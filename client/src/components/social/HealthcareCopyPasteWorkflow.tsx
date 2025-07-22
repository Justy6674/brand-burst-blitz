import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/use-toast';
import { useAHPRACompliance } from '../../hooks/useAHPRACompliance';
import { 
  Copy, 
  CheckCircle, 
  AlertTriangle, 
  Facebook, 
  Instagram, 
  Linkedin,
  Hash,
  FileText,
  Shield,
  Sparkles,
  Clock
} from 'lucide-react';

interface PlatformContent {
  platform: 'facebook' | 'instagram' | 'linkedin';
  content: string;
  hashtags: string[];
  characterCount: number;
  complianceScore: number;
  warnings: string[];
}

interface HealthcareCopyPasteWorkflowProps {
  practiceType: string;
  specialty: string;
}

export function HealthcareCopyPasteWorkflow({ 
  practiceType, 
  specialty 
}: HealthcareCopyPasteWorkflowProps) {
  const { toast } = useToast();
  const { validateContent } = useAHPRACompliance();
  
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState<'patient_education' | 'practice_update' | 'health_tip'>('patient_education');
  const [generatedContent, setGeneratedContent] = useState<PlatformContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'facebook' | 'instagram' | 'linkedin'>('facebook');

  // Copy to clipboard functionality
  const copyToClipboard = useCallback(async (content: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Content Copied!",
        description: `${platform} content copied to clipboard`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please manually select and copy the content",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Generate AHPRA-compliant content for all platforms
  const generateContent = useCallback(async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for content generation",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call to generate content
      const baseContent = await generateAHPRACompliantContent(topic, contentType, practiceType, specialty);
      
      // Create platform-specific variations
      const platforms: PlatformContent[] = [
        {
          platform: 'facebook',
          content: formatForFacebook(baseContent),
          hashtags: generateHealthcareHashtags(topic, 'facebook'),
          characterCount: 0,
          complianceScore: 0,
          warnings: []
        },
        {
          platform: 'instagram',
          content: formatForInstagram(baseContent),
          hashtags: generateHealthcareHashtags(topic, 'instagram'),
          characterCount: 0,
          complianceScore: 0,
          warnings: []
        },
        {
          platform: 'linkedin',
          content: formatForLinkedIn(baseContent),
          hashtags: generateHealthcareHashtags(topic, 'linkedin'),
          characterCount: 0,
          complianceScore: 0,
          warnings: []
        }
      ];

      // Validate each platform's content for AHPRA compliance
      for (const platform of platforms) {
        const fullContent = `${platform.content}\n\n${platform.hashtags.join(' ')}`;
        platform.characterCount = fullContent.length;
        
        const validation = await validateContent(fullContent, practiceType, contentType);
        platform.complianceScore = validation.complianceScore || 0;
        platform.warnings = validation.warnings || [];
      }

      setGeneratedContent(platforms);
      
      toast({
        title: "Content Generated Successfully",
        description: "AHPRA-compliant content ready for all platforms",
      });
      
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [topic, contentType, practiceType, specialty, validateContent, toast]);

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Get compliance score color
  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const selectedContent = generatedContent.find(c => c.platform === selectedPlatform);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Healthcare Content Generator
          </h2>
          <p className="text-muted-foreground">
            Generate AHPRA-compliant content for Facebook, Instagram, and LinkedIn
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          AHPRA Compliant
        </Badge>
      </div>

      {/* Content Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Topic & Type
          </CardTitle>
          <CardDescription>
            Enter your content topic and select the appropriate type for healthcare-focused generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Topic</label>
            <Textarea
              placeholder="e.g., Managing diabetes during holiday season, Benefits of regular exercise for heart health, Preparing for your first physiotherapy appointment..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <select 
                value={contentType} 
                onChange={(e) => setContentType(e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                <option value="patient_education">Patient Education</option>
                <option value="practice_update">Practice Update</option>
                <option value="health_tip">Health Tip</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Practice Type</label>
              <div className="p-2 bg-muted rounded-md text-sm">{practiceType}</div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Specialty</label>
              <div className="p-2 bg-muted rounded-md text-sm">{specialty}</div>
            </div>
          </div>
          
          <Button 
            onClick={generateContent} 
            disabled={isGenerating || !topic.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Generating AHPRA-Compliant Content...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content for All Platforms
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content Display */}
      {generatedContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Generated Content - Ready to Copy & Paste
            </CardTitle>
            <CardDescription>
              Select a platform below and copy the optimized content to your clipboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                {generatedContent.map((content) => (
                  <TabsTrigger 
                    key={content.platform} 
                    value={content.platform}
                    className="flex items-center gap-2"
                  >
                    {getPlatformIcon(content.platform)}
                    {content.platform.charAt(0).toUpperCase() + content.platform.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {generatedContent.map((content) => (
                <TabsContent key={content.platform} value={content.platform} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center space-y-1">
                      <div className={`text-2xl font-bold ${getComplianceColor(content.complianceScore)}`}>
                        {content.complianceScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">AHPRA Compliance</div>
                      <Progress value={content.complianceScore} className="h-2" />
                    </div>
                    
                    <div className="text-center space-y-1">
                      <div className="text-2xl font-bold text-blue-600">
                        {content.characterCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Characters</div>
                    </div>
                    
                    <div className="text-center space-y-1">
                      <div className="text-2xl font-bold text-purple-600">
                        {content.hashtags.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Hashtags</div>
                    </div>
                  </div>

                  {content.warnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Compliance Warnings:</strong>
                        <ul className="mt-1 list-disc list-inside">
                          {content.warnings.map((warning, index) => (
                            <li key={index} className="text-sm">{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Content</label>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(content.content, content.platform)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Content
                        </Button>
                      </div>
                      <Textarea 
                        value={content.content}
                        readOnly
                        className="min-h-[120px] font-mono text-sm"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Hashtags</label>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(content.hashtags.join(' '), `${content.platform} hashtags`)}
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          Copy Hashtags
                        </Button>
                      </div>
                      <div className="p-3 bg-muted rounded-md text-sm font-mono">
                        {content.hashtags.join(' ')}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        onClick={() => copyToClipboard(
                          `${content.content}\n\n${content.hashtags.join(' ')}`, 
                          `Complete ${content.platform} post`
                        )}
                        className="w-full"
                        size="lg"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Complete {content.platform.charAt(0).toUpperCase() + content.platform.slice(1)} Post
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper functions for content generation
async function generateAHPRACompliantContent(
  topic: string, 
  contentType: string, 
  practiceType: string, 
  specialty: string
): Promise<string> {
  // This would call the actual AI content generation API
  // For now, returning a placeholder that follows AHPRA guidelines
  const disclaimers = {
    patient_education: "This information is general. Consult your healthcare provider for advice specific to your situation.",
    practice_update: "For appointments and specific medical advice, please contact our practice directly.",
    health_tip: "This is general health information. Individual circumstances may vary - consult your healthcare professional."
  };

  return `${getContentForTopic(topic, contentType, specialty)}\n\n${disclaimers[contentType as keyof typeof disclaimers]}`;
}

function formatForFacebook(content: string): string {
  // Facebook allows longer content, more educational
  return content + "\n\nWhat questions do you have about this topic? Feel free to book an appointment to discuss your individual needs.";
}

function formatForInstagram(content: string): string {
  // Instagram more visual, shorter, engaging
  const shortened = content.length > 1800 ? content.substring(0, 1800) + "..." : content;
  return shortened + "\n\n💡 Save this post for future reference!";
}

function formatForLinkedIn(content: string): string {
  // LinkedIn professional, educational focus
  return content + "\n\nAs healthcare professionals, we're committed to sharing evidence-based health information to support our community's wellbeing.";
}

function generateHealthcareHashtags(topic: string, platform: string): string[] {
  const baseHashtags = ['#HealthEducation', '#WellnessTips', '#HealthyLiving'];
  const topicHashtags = getTopicSpecificHashtags(topic);
  const platformHashtags = getPlatformSpecificHashtags(platform);
  
  return [...baseHashtags, ...topicHashtags, ...platformHashtags].slice(0, 8);
}

function getContentForTopic(topic: string, contentType: string, specialty: string): string {
  // This would use AI to generate appropriate content
  // Placeholder implementation
  return `Understanding ${topic} is important for your health. As ${specialty} professionals, we recommend evidence-based approaches to managing this aspect of your wellbeing.`;
}

function getTopicSpecificHashtags(topic: string): string[] {
  const topicLower = topic.toLowerCase();
  if (topicLower.includes('diabetes')) return ['#DiabetesCare', '#BloodSugar'];
  if (topicLower.includes('heart')) return ['#HeartHealth', '#Cardiology'];
  if (topicLower.includes('exercise')) return ['#ExerciseIsMedicine', '#PhysicalActivity'];
  return ['#HealthCare', '#Prevention'];
}

function getPlatformSpecificHashtags(platform: string): string[] {
  switch (platform) {
    case 'facebook':
      return ['#HealthAdvice', '#PatientEducation'];
    case 'instagram':
      return ['#HealthTips', '#Wellness', '#Healthcare'];
    case 'linkedin':
      return ['#HealthcareProfessionals', '#MedicalEducation'];
    default:
      return [];
  }
} 