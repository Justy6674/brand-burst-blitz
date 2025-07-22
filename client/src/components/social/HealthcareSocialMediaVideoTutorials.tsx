import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Shield, 
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Video,
  PlayCircle,
  Pause,
  RotateCcw,
  Download,
  ExternalLink,
  Users,
  BookOpen,
  Award,
  FileText,
  Settings,
  Zap,
  Eye,
  Heart,
  Star
} from 'lucide-react';

interface SocialMediaTutorial {
  id: string;
  title: string;
  description: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'general';
  duration: number; // in seconds
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'setup' | 'compliance' | 'content' | 'optimization' | 'troubleshooting';
  videoUrl?: string; // Would be actual video URLs in production
  thumbnailUrl?: string;
  transcript?: string;
  learningObjectives: string[];
  complianceTopics: string[];
  prerequisites?: string[];
  relatedTutorials?: string[];
  isRequired: boolean;
  isCompleted: boolean;
  lastWatched?: Date;
  watchProgress: number; // 0-100
}

interface HealthcareSocialMediaVideoTutorialsProps {
  practiceType?: 'gp' | 'specialist' | 'allied_health' | 'psychology' | 'dentistry';
  onTutorialComplete?: (tutorialId: string) => void;
  onAllRequiredComplete?: () => void;
}

export const HealthcareSocialMediaVideoTutorials: React.FC<HealthcareSocialMediaVideoTutorialsProps> = ({
  practiceType = 'gp',
  onTutorialComplete,
  onAllRequiredComplete
}) => {
  const { toast } = useToast();
  const [tutorials, setTutorials] = useState<SocialMediaTutorial[]>([]);
  const [activeTutorial, setActiveTutorial] = useState<SocialMediaTutorial | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentTab, setCurrentTab] = useState<'overview' | 'facebook' | 'instagram' | 'linkedin' | 'compliance'>('overview');
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Healthcare Social Media Setup Tutorial Data
  const socialMediaTutorials: SocialMediaTutorial[] = [
    // Facebook Setup Tutorials
    {
      id: 'facebook_business_manager_setup',
      title: 'Facebook Business Manager Setup for Healthcare',
      description: 'Step-by-step guide to setting up Facebook Business Manager with AHPRA compliance',
      platform: 'facebook',
      duration: 480, // 8 minutes
      difficulty: 'beginner',
      category: 'setup',
      learningObjectives: [
        'Create and configure Facebook Business Manager account',
        'Set up healthcare practice Facebook Page',
        'Configure AHPRA-compliant page information',
        'Add team members with appropriate permissions',
        'Verify business for healthcare advertising'
      ],
      complianceTopics: [
        'AHPRA advertising guidelines',
        'Facebook healthcare advertising policies',
        'Business verification requirements',
        'Professional boundary maintenance'
      ],
      isRequired: true,
      isCompleted: false,
      watchProgress: 0
    },
    {
      id: 'facebook_content_compliance',
      title: 'Creating AHPRA-Compliant Facebook Content',
      description: 'Learn to create patient education content that meets AHPRA guidelines',
      platform: 'facebook',
      duration: 360, // 6 minutes
      difficulty: 'intermediate',
      category: 'compliance',
      learningObjectives: [
        'Understand AHPRA content requirements',
        'Create patient education posts',
        'Avoid prohibited claims and testimonials',
        'Use appropriate disclaimers and warnings',
        'Maintain professional boundaries'
      ],
      complianceTopics: [
        'AHPRA advertising standards',
        'TGA therapeutic claims restrictions',
        'Patient testimonial prohibitions',
        'Professional boundary enforcement'
      ],
      isRequired: true,
      isCompleted: false,
      watchProgress: 0
    },
    {
      id: 'facebook_crisis_management',
      title: 'Managing Facebook Comments and Complaints',
      description: 'Handle patient comments, complaints, and crisis situations professionally',
      platform: 'facebook',
      duration: 300, // 5 minutes
      difficulty: 'advanced',
      category: 'troubleshooting',
      learningObjectives: [
        'Respond professionally to patient comments',
        'Handle complaints and negative feedback',
        'Maintain patient privacy in responses',
        'Escalate serious issues appropriately',
        'Document interactions for compliance'
      ],
      complianceTopics: [
        'Patient privacy protection',
        'Professional communication standards',
        'Complaint handling procedures',
        'Crisis communication protocols'
      ],
      isRequired: false,
      isCompleted: false,
      watchProgress: 0
    },

    // Instagram Setup Tutorials
    {
      id: 'instagram_business_setup',
      title: 'Instagram Business Account for Healthcare Practices',
      description: 'Convert to Instagram Business and optimize for healthcare content',
      platform: 'instagram',
      duration: 420, // 7 minutes
      difficulty: 'beginner',
      category: 'setup',
      learningObjectives: [
        'Convert personal account to Instagram Business',
        'Connect Instagram to Facebook Business Manager',
        'Optimize profile for healthcare practice',
        'Set up Instagram Shopping (if applicable)',
        'Configure business contact information'
      ],
      complianceTopics: [
        'Instagram business policies',
        'Healthcare content guidelines',
        'Professional profile optimization',
        'Patient communication boundaries'
      ],
      isRequired: true,
      isCompleted: false,
      watchProgress: 0
    },
    {
      id: 'instagram_visual_compliance',
      title: 'AHPRA-Compliant Visual Content for Instagram',
      description: 'Create healthcare images and videos that meet AHPRA standards',
      platform: 'instagram',
      duration: 540, // 9 minutes
      difficulty: 'intermediate',
      category: 'content',
      learningObjectives: [
        'Design AHPRA-compliant healthcare graphics',
        'Create educational Instagram Stories',
        'Use appropriate healthcare hashtags',
        'Avoid before/after imagery violations',
        'Include required disclaimers in visuals'
      ],
      complianceTopics: [
        'Visual content compliance',
        'Before/after photo restrictions',
        'Educational vs promotional content',
        'Hashtag compliance requirements'
      ],
      isRequired: true,
      isCompleted: false,
      watchProgress: 0
    },

    // LinkedIn Setup Tutorials
    {
      id: 'linkedin_professional_setup',
      title: 'LinkedIn Company Page for Healthcare Professionals',
      description: 'Create professional LinkedIn presence for healthcare practice',
      platform: 'linkedin',
      duration: 360, // 6 minutes
      difficulty: 'beginner',
      category: 'setup',
      learningObjectives: [
        'Create LinkedIn Company Page',
        'Optimize for healthcare professional networking',
        'Add practice team members',
        'Configure professional messaging',
        'Set up content publishing permissions'
      ],
      complianceTopics: [
        'Professional networking guidelines',
        'B2B healthcare communication',
        'Professional referral protocols',
        'Industry networking compliance'
      ],
      isRequired: false,
      isCompleted: false,
      watchProgress: 0
    },

    // General Compliance Tutorials
    {
      id: 'social_media_compliance_overview',
      title: 'AHPRA Social Media Compliance Overview',
      description: 'Comprehensive overview of AHPRA guidelines for social media',
      platform: 'general',
      duration: 720, // 12 minutes
      difficulty: 'beginner',
      category: 'compliance',
      learningObjectives: [
        'Understand AHPRA social media guidelines',
        'Learn TGA therapeutic advertising requirements',
        'Identify prohibited content types',
        'Implement compliance checking processes',
        'Maintain ongoing compliance monitoring'
      ],
      complianceTopics: [
        'AHPRA advertising guidelines',
        'TGA therapeutic advertising code',
        'Patient testimonial restrictions',
        'Professional boundary requirements',
        'Cultural safety considerations'
      ],
      isRequired: true,
      isCompleted: false,
      watchProgress: 0
    },
    {
      id: 'copy_paste_workflow_training',
      title: 'Copy-Paste Social Media Workflow',
      description: 'Master the copy-paste workflow for compliant content distribution',
      platform: 'general',
      duration: 480, // 8 minutes
      difficulty: 'beginner',
      category: 'content',
      learningObjectives: [
        'Use platform-specific copy-paste buttons',
        'Adapt content for different platforms',
        'Maintain compliance across platforms',
        'Track performance manually',
        'Optimize posting schedules'
      ],
      complianceTopics: [
        'Cross-platform compliance',
        'Content adaptation requirements',
        'Manual analytics tracking',
        'Performance monitoring'
      ],
      isRequired: true,
      isCompleted: false,
      watchProgress: 0
    },
    {
      id: 'crisis_communication_training',
      title: 'Healthcare Crisis Communication on Social Media',
      description: 'Handle healthcare crises and sensitive situations on social platforms',
      platform: 'general',
      duration: 600, // 10 minutes
      difficulty: 'advanced',
      category: 'troubleshooting',
      learningObjectives: [
        'Develop crisis communication protocols',
        'Handle patient complaints publicly',
        'Manage negative reviews and feedback',
        'Coordinate with practice management',
        'Document crisis responses'
      ],
      complianceTopics: [
        'Crisis communication standards',
        'Patient privacy during crises',
        'Professional responsibility protocols',
        'Legal compliance requirements'
      ],
      isRequired: false,
      isCompleted: false,
      watchProgress: 0
    }
  ];

  useEffect(() => {
    // Initialize tutorials with saved progress
    const savedProgress = localStorage.getItem('healthcare_social_tutorials_progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        const updatedTutorials = socialMediaTutorials.map(tutorial => ({
          ...tutorial,
          ...progress[tutorial.id]
        }));
        setTutorials(updatedTutorials);
      } catch (error) {
        setTutorials(socialMediaTutorials);
      }
    } else {
      setTutorials(socialMediaTutorials);
    }
  }, []);

  const saveProgress = (tutorialId: string, progress: Partial<SocialMediaTutorial>) => {
    const savedProgress = localStorage.getItem('healthcare_social_tutorials_progress');
    const existingProgress = savedProgress ? JSON.parse(savedProgress) : {};
    const updatedProgress = {
      ...existingProgress,
      [tutorialId]: { ...existingProgress[tutorialId], ...progress }
    };
    localStorage.setItem('healthcare_social_tutorials_progress', JSON.stringify(updatedProgress));
  };

  const startTutorial = (tutorial: SocialMediaTutorial) => {
    setActiveTutorial(tutorial);
    setShowVideoPlayer(true);
    setVideoProgress(tutorial.watchProgress);
  };

  const completeTutorial = (tutorialId: string) => {
    setTutorials(prev => prev.map(t => 
      t.id === tutorialId 
        ? { ...t, isCompleted: true, watchProgress: 100, lastWatched: new Date() }
        : t
    ));
    
    saveProgress(tutorialId, { 
      isCompleted: true, 
      watchProgress: 100, 
      lastWatched: new Date() 
    });

    onTutorialComplete?.(tutorialId);

    toast({
      title: "Tutorial Completed!",
      description: "You've successfully completed this training module.",
      duration: 3000,
    });

    // Check if all required tutorials are complete
    const allRequired = tutorials.filter(t => t.isRequired);
    const completedRequired = allRequired.filter(t => t.isCompleted || t.id === tutorialId);
    
    if (completedRequired.length === allRequired.length) {
      onAllRequiredComplete?.();
    }
  };

  const updateWatchProgress = (tutorialId: string, progress: number) => {
    setVideoProgress(progress);
    setTutorials(prev => prev.map(t => 
      t.id === tutorialId ? { ...t, watchProgress: progress } : t
    ));
    saveProgress(tutorialId, { watchProgress: progress });

    // Auto-complete when 95% watched
    if (progress >= 95) {
      completeTutorial(tutorialId);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'linkedin': return <Linkedin className="h-4 w-4 text-blue-700" />;
      case 'twitter': return <Twitter className="h-4 w-4 text-gray-900" />;
      default: return <Video className="h-4 w-4 text-purple-600" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'setup': return <Settings className="h-4 w-4" />;
      case 'compliance': return <Shield className="h-4 w-4" />;
      case 'content': return <FileText className="h-4 w-4" />;
      case 'optimization': return <Zap className="h-4 w-4" />;
      case 'troubleshooting': return <ExternalLink className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const renderTutorialCard = (tutorial: SocialMediaTutorial) => (
    <Card key={tutorial.id} className={`cursor-pointer transition-all hover:shadow-md ${tutorial.isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getPlatformIcon(tutorial.platform)}
            <div>
              <CardTitle className="text-base leading-tight">{tutorial.title}</CardTitle>
              <CardDescription className="text-sm mt-1">{tutorial.description}</CardDescription>
            </div>
          </div>
          {tutorial.isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Progress Bar */}
          {tutorial.watchProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{Math.round(tutorial.watchProgress)}%</span>
              </div>
              <Progress value={tutorial.watchProgress} className="h-2" />
            </div>
          )}

          {/* Tutorial Details */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-500" />
                <span>{formatDuration(tutorial.duration)}</span>
              </div>
              <Badge className={getDifficultyColor(tutorial.difficulty)}>
                {tutorial.difficulty}
              </Badge>
              {tutorial.isRequired && (
                <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                  Required
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {getCategoryIcon(tutorial.category)}
              <span className="text-xs text-gray-600 capitalize">{tutorial.category}</span>
            </div>
          </div>

          {/* Learning Objectives Preview */}
          <div className="text-xs text-gray-600">
            <span className="font-medium">You'll learn:</span> {tutorial.learningObjectives.slice(0, 2).join(', ')}
            {tutorial.learningObjectives.length > 2 && '...'}
          </div>

          {/* Compliance Topics */}
          <div className="flex flex-wrap gap-1">
            {tutorial.complianceTopics.slice(0, 2).map((topic, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                {topic}
              </Badge>
            ))}
            {tutorial.complianceTopics.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tutorial.complianceTopics.length - 2} more
              </Badge>
            )}
          </div>

          {/* Action Button */}
          <Button 
            onClick={() => startTutorial(tutorial)}
            className="w-full"
            variant={tutorial.isCompleted ? "outline" : "default"}
          >
            {tutorial.isCompleted ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Review
              </>
            ) : tutorial.watchProgress > 0 ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Continue ({Math.round(tutorial.watchProgress)}%)
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Tutorial
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderVideoPlayer = () => {
    if (!activeTutorial) return null;

    return (
      <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getPlatformIcon(activeTutorial.platform)}
              {activeTutorial.title}
            </DialogTitle>
            <DialogDescription>
              {activeTutorial.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Video Player Placeholder */}
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Video Player</h3>
                <p className="text-gray-600 mb-2">Duration: {formatDuration(activeTutorial.duration)}</p>
                <p className="text-sm text-gray-500">
                  In production, this would be an embedded video player
                </p>
              </div>
            </div>

            {/* Progress Controls */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(videoProgress)}%</span>
              </div>
              <Progress value={videoProgress} className="h-2" />
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateWatchProgress(activeTutorial.id, 100)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-2">
              <h4 className="font-medium">Learning Objectives</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {activeTutorial.learningObjectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>

            {/* Compliance Topics */}
            <div className="space-y-2">
              <h4 className="font-medium">Compliance Topics Covered</h4>
              <div className="flex flex-wrap gap-1">
                {activeTutorial.complianceTopics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const getCompletionStats = () => {
    const total = tutorials.length;
    const completed = tutorials.filter(t => t.isCompleted).length;
    const required = tutorials.filter(t => t.isRequired).length;
    const requiredCompleted = tutorials.filter(t => t.isRequired && t.isCompleted).length;
    
    return { total, completed, required, requiredCompleted };
  };

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Healthcare Social Media Setup Video Tutorials
          </CardTitle>
          <CardDescription>
            Step-by-step video guides for setting up AHPRA-compliant social media presence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-lg font-semibold text-blue-900">{stats.total}</div>
              <div className="text-sm text-blue-700">Total Tutorials</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-lg font-semibold text-green-900">{stats.completed}</div>
              <div className="text-sm text-green-700">Completed</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <Shield className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <div className="text-lg font-semibold text-red-900">{stats.requiredCompleted}/{stats.required}</div>
              <div className="text-sm text-red-700">Required Done</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Award className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-lg font-semibold text-purple-900">
                {Math.round((stats.completed / stats.total) * 100)}%
              </div>
              <div className="text-sm text-purple-700">Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Alert */}
      {stats.requiredCompleted === stats.required && stats.required > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <Award className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Congratulations!</strong> You've completed all required social media setup training. 
            Your practice is now ready for AHPRA-compliant social media marketing.
          </AlertDescription>
        </Alert>
      )}

      {/* Tutorial Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab as any}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorials.filter(t => t.isRequired).map(renderTutorialCard)}
          </div>
          {tutorials.filter(t => !t.isRequired).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Optional Advanced Training</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutorials.filter(t => !t.isRequired).map(renderTutorialCard)}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="facebook" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorials.filter(t => t.platform === 'facebook').map(renderTutorialCard)}
          </div>
        </TabsContent>

        <TabsContent value="instagram" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorials.filter(t => t.platform === 'instagram').map(renderTutorialCard)}
          </div>
        </TabsContent>

        <TabsContent value="linkedin" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorials.filter(t => t.platform === 'linkedin').map(renderTutorialCard)}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorials.filter(t => t.platform === 'general' || t.category === 'compliance').map(renderTutorialCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Video Player Modal */}
      {renderVideoPlayer()}
    </div>
  );
}; 