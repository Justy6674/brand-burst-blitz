import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useHealthcareVideoTutorials } from '@/hooks/useHealthcareVideoTutorials';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Award, 
  BookOpen, 
  Shield, 
  Users,
  Star,
  FileText,
  PlayCircle,
  Pause,
  RotateCcw,
  Download,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoTutorialsProps {
  onTrainingComplete?: () => void;
}

export const HealthcareVideoTutorials: React.FC<VideoTutorialsProps> = ({
  onTrainingComplete
}) => {
  const { toast } = useToast();
  const {
    loading,
    tutorials,
    progress,
    currentTutorial,
    currentProgress,
    completionStats,
    startTutorial,
    updateProgress,
    submitQuiz,
    getRecommendedTutorials,
    getTutorialsByCategory,
    hasCompletedRequiredTraining
  } = useHealthcareVideoTutorials();

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'onboarding' | 'compliance' | 'platform' | 'content' | 'advanced'>('dashboard');
  const [videoPlayer, setVideoPlayer] = useState<{
    isPlaying: boolean;
    currentTime: number;
    duration: number;
  }>({
    isPlaying: false,
    currentTime: 0,
    duration: 0
  });
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const recommendations = getRecommendedTutorials();

  useEffect(() => {
    if (hasCompletedRequiredTraining()) {
      onTrainingComplete?.();
    }
  }, [hasCompletedRequiredTraining, onTrainingComplete]);

  const handleTutorialStart = async (tutorialId: string) => {
    await startTutorial(tutorialId);
    setCurrentTab('dashboard'); // Show video player
  };

  const handleVideoProgress = (currentTime: number, duration: number) => {
    setVideoPlayer(prev => ({ ...prev, currentTime, duration }));
    
    if (currentTutorial && currentTime > 0) {
      updateProgress(currentTutorial.id, currentTime, currentTime >= duration * 0.95);
    }
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleQuizSubmit = async () => {
    if (!currentTutorial) return;

    // Calculate score (simplified - would use actual quiz data)
    const totalQuestions = Object.keys(quizAnswers).length;
    const correctAnswers = totalQuestions; // Simplified calculation
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= 80;

    const answerArray = Object.values(quizAnswers);
    await submitQuiz(currentTutorial.id, answerArray, score, passed);
    
    setQuizSubmitted(true);
    setShowQuiz(false);
  };

  const getProgressPercentage = (tutorialId: string) => {
    const tutorialProgress = progress.find(p => p.tutorial_id === tutorialId);
    const tutorial = tutorials.find(t => t.id === tutorialId);
    
    if (!tutorialProgress || !tutorial) return 0;
    return Math.min((tutorialProgress.watched_duration / tutorial.duration) * 100, 100);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'onboarding': return <Users className="h-4 w-4" />;
      case 'compliance': return <Shield className="h-4 w-4" />;
      case 'platform_setup': return <PlayCircle className="h-4 w-4" />;
      case 'content_creation': return <FileText className="h-4 w-4" />;
      case 'advanced': return <Star className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const renderTutorialCard = (tutorial: any) => {
    const tutorialProgress = progress.find(p => p.tutorial_id === tutorial.id);
    const progressPercentage = getProgressPercentage(tutorial.id);
    const isCompleted = tutorialProgress?.completed || false;

    return (
      <Card key={tutorial.id} className={`cursor-pointer transition-all hover:shadow-md ${isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getCategoryIcon(tutorial.category)}
              <div>
                <CardTitle className="text-base">{tutorial.title}</CardTitle>
                <CardDescription className="text-sm">{tutorial.description}</CardDescription>
              </div>
            </div>
            {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-3">
            {/* Progress Bar */}
            {tutorialProgress && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}

            {/* Tutorial Details */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span>{formatDuration(tutorial.duration)}</span>
                </div>
                <Badge variant={tutorial.difficulty_level === 'beginner' ? 'secondary' : 
                              tutorial.difficulty_level === 'intermediate' ? 'default' : 'destructive'}>
                  {tutorial.difficulty_level}
                </Badge>
                {tutorial.is_required && (
                  <Badge variant="outline" className="text-red-700 border-red-200">
                    Required
                  </Badge>
                )}
              </div>
            </div>

            {/* Learning Outcomes */}
            {tutorial.learning_outcomes && tutorial.learning_outcomes.length > 0 && (
              <div className="text-xs text-gray-600">
                <span className="font-medium">You'll learn:</span> {tutorial.learning_outcomes.slice(0, 2).join(', ')}
                {tutorial.learning_outcomes.length > 2 && '...'}
              </div>
            )}

            {/* Compliance Topics */}
            {tutorial.compliance_topics && tutorial.compliance_topics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tutorial.compliance_topics.slice(0, 3).map((topic: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Button */}
            <Button 
              onClick={() => handleTutorialStart(tutorial.id)}
              className="w-full"
              variant={isCompleted ? "outline" : "default"}
              disabled={loading}
            >
              {isCompleted ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Review
                </>
              ) : tutorialProgress ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Continue
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Play className="h-4 w-4 animate-pulse" />
            <span>Loading video tutorials...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Healthcare Professional Training
          </CardTitle>
          <CardDescription>
            Complete your onboarding and compliance training to get the most out of the platform
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={currentTab} onValueChange={setCurrentTab as any}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="platform">Platform Setup</TabsTrigger>
          <TabsTrigger value="content">Content Creation</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Progress Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium">Total Tutorials</h3>
                  <p className="text-2xl font-bold text-blue-600">{completionStats.totalTutorials}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-medium">Completed</h3>
                  <p className="text-2xl font-bold text-green-600">{completionStats.completedTutorials}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-medium">Watch Time</h3>
                  <p className="text-2xl font-bold text-purple-600">{Math.round(completionStats.totalWatchTime / 60)}m</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                  <h3 className="font-medium">Certificates</h3>
                  <p className="text-2xl font-bold text-amber-600">{completionStats.certificatesEarned}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Video Player */}
          {currentTutorial && (
            <Card>
              <CardHeader>
                <CardTitle>{currentTutorial.title}</CardTitle>
                <CardDescription>{currentTutorial.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">Video Player Placeholder</p>
                    <p className="text-sm text-gray-500">Duration: {formatDuration(currentTutorial.duration)}</p>
                  </div>
                </div>
                
                {currentProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(getProgressPercentage(currentTutorial.id))}%</span>
                    </div>
                    <Progress value={getProgressPercentage(currentTutorial.id)} />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => setShowQuiz(true)} disabled={!currentProgress?.completed}>
                    <FileText className="h-4 w-4 mr-2" />
                    Take Quiz
                  </Button>
                  {currentProgress?.certificate_issued && (
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommended Tutorials */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recommended for You</h2>
            
            {recommendations.required.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-red-700">Required Training</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.required.map(renderTutorialCard)}
                </div>
              </div>
            )}

            {recommendations.recommended.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recommended</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.recommended.map(renderTutorialCard)}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {['onboarding', 'compliance', 'platform_setup', 'content_creation', 'advanced'].map(category => (
          <TabsContent key={category} value={category === 'platform_setup' ? 'platform' : category === 'content_creation' ? 'content' : category} className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTutorialsByCategory(category as any).map(renderTutorialCard)}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quiz Modal */}
      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tutorial Quiz: {currentTutorial?.title}</DialogTitle>
            <DialogDescription>
              Answer the following questions to complete this tutorial. You need 80% to pass.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Quiz questions would be loaded from the database */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">1. What is the primary purpose of AHPRA guidelines?</h4>
                <RadioGroup onValueChange={(value) => handleQuizAnswer('q1', parseInt(value))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="q1a" />
                    <Label htmlFor="q1a">To increase marketing effectiveness</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="q1b" />
                    <Label htmlFor="q1b">To protect public health and safety</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="q1c" />
                    <Label htmlFor="q1c">To reduce competition</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="q1d" />
                    <Label htmlFor="q1d">To increase healthcare costs</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowQuiz(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleQuizSubmit} 
                className="flex-1"
                disabled={Object.keys(quizAnswers).length === 0}
              >
                Submit Quiz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Training Complete Alert */}
      {hasCompletedRequiredTraining() && (
        <Alert className="border-green-200 bg-green-50">
          <Award className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Congratulations!</strong> You've completed all required healthcare training. 
            Your practice is now fully compliant and ready to use all platform features.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}; 