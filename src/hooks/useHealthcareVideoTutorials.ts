import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number; // seconds
  category: 'onboarding' | 'compliance' | 'content_creation' | 'platform_setup' | 'advanced';
  practice_types: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  learning_outcomes: string[];
  compliance_topics: string[];
  created_at: string;
  updated_at: string;
  is_required: boolean;
  order_index: number;
}

interface VideoProgress {
  id: string;
  user_id: string;
  tutorial_id: string;
  watched_duration: number; // seconds
  completed: boolean;
  last_watched_at: string;
  completion_date?: string;
  notes?: string;
  quiz_score?: number;
  certificate_issued: boolean;
}

interface VideoQuiz {
  id: string;
  tutorial_id: string;
  questions: QuizQuestion[];
  passing_score: number;
  max_attempts: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  compliance_reference?: string;
}

interface VideoLibraryState {
  tutorials: VideoTutorial[];
  progress: VideoProgress[];
  currentTutorial: VideoTutorial | null;
  currentProgress: VideoProgress | null;
  completionStats: {
    totalTutorials: number;
    completedTutorials: number;
    totalWatchTime: number;
    certificatesEarned: number;
    averageQuizScore: number;
  };
}

export const useHealthcareVideoTutorials = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [libraryState, setLibraryState] = useState<VideoLibraryState>({
    tutorials: [],
    progress: [],
    currentTutorial: null,
    currentProgress: null,
    completionStats: {
      totalTutorials: 0,
      completedTutorials: 0,
      totalWatchTime: 0,
      certificatesEarned: 0,
      averageQuizScore: 0
    }
  });

  // Load video tutorials based on user's practice type
  const loadTutorials = useCallback(async (practiceType?: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's practice type if not provided
      let userPracticeType = practiceType;
      if (!userPracticeType) {
        const { data: professionalData } = await supabase
          .from('healthcare_professionals')
          .select('profession_type')
          .eq('id', user.id)
          .single();
        
        userPracticeType = professionalData?.profession_type || 'GP';
      }

      // Load tutorials for this practice type
      const { data: tutorials, error: tutorialsError } = await supabase
        .from('healthcare_video_tutorials')
        .select('*')
        .or(`practice_types.cs.{${userPracticeType}},practice_types.cs.{All}`)
        .order('category')
        .order('order_index');

      if (tutorialsError) throw tutorialsError;

      // Load user's progress
      const { data: progress, error: progressError } = await supabase
        .from('healthcare_video_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Calculate completion stats
      const completionStats = calculateCompletionStats(tutorials || [], progress || []);

      setLibraryState({
        tutorials: tutorials || [],
        progress: progress || [],
        currentTutorial: null,
        currentProgress: null,
        completionStats
      });

    } catch (error) {
      console.error('Error loading tutorials:', error);
      toast({
        title: "Error Loading Tutorials",
        description: "Could not load video tutorials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Start watching a tutorial
  const startTutorial = useCallback(async (tutorialId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tutorial = libraryState.tutorials.find(t => t.id === tutorialId);
      if (!tutorial) return;

      // Check if progress record exists
      let progress = libraryState.progress.find(p => p.tutorial_id === tutorialId);
      
      if (!progress) {
        // Create new progress record
        const { data: newProgress, error } = await supabase
          .from('healthcare_video_progress')
          .insert({
            user_id: user.id,
            tutorial_id: tutorialId,
            watched_duration: 0,
            completed: false,
            last_watched_at: new Date().toISOString(),
            certificate_issued: false
          })
          .select()
          .single();

        if (error) throw error;
        progress = newProgress;
      }

      setLibraryState(prev => ({
        ...prev,
        currentTutorial: tutorial,
        currentProgress: progress!
      }));

      // Log tutorial start for compliance
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: null,
          performed_by: user.id,
          action: `Started video tutorial - ${tutorial.title}`,
          action_type: 'training',
          details: {
            tutorial_id: tutorialId,
            tutorial_category: tutorial.category,
            compliance_topics: tutorial.compliance_topics,
            is_required: tutorial.is_required
          },
          compliance_impact: tutorial.compliance_topics.length > 0
        });

    } catch (error) {
      console.error('Error starting tutorial:', error);
      toast({
        title: "Error Starting Tutorial",
        description: "Could not start the tutorial. Please try again.",
        variant: "destructive",
      });
    }
  }, [libraryState.tutorials, libraryState.progress, toast]);

  // Update watch progress
  const updateProgress = useCallback(async (
    tutorialId: string, 
    watchedDuration: number,
    completed: boolean = false
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateData: any = {
        watched_duration: watchedDuration,
        last_watched_at: new Date().toISOString(),
        completed
      };

      if (completed && !libraryState.currentProgress?.completed) {
        updateData.completion_date = new Date().toISOString();
      }

      const { data: updatedProgress, error } = await supabase
        .from('healthcare_video_progress')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('tutorial_id', tutorialId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setLibraryState(prev => ({
        ...prev,
        progress: prev.progress.map(p => 
          p.tutorial_id === tutorialId ? updatedProgress : p
        ),
        currentProgress: prev.currentProgress?.tutorial_id === tutorialId 
          ? updatedProgress 
          : prev.currentProgress
      }));

      // Log completion for compliance
      if (completed && !libraryState.currentProgress?.completed) {
        const tutorial = libraryState.tutorials.find(t => t.id === tutorialId);
        
        await supabase
          .from('healthcare_team_audit_log')
          .insert({
            team_id: null,
            performed_by: user.id,
            action: `Completed video tutorial - ${tutorial?.title}`,
            action_type: 'training',
            details: {
              tutorial_id: tutorialId,
              tutorial_category: tutorial?.category,
              completion_date: updateData.completion_date,
              watch_duration: watchedDuration,
              compliance_topics: tutorial?.compliance_topics
            },
            compliance_impact: (tutorial?.compliance_topics.length || 0) > 0
          });

        toast({
          title: "Tutorial Completed!",
          description: `You've successfully completed "${tutorial?.title}". ${tutorial?.is_required ? 'Required training complete.' : ''}`,
        });
      }

    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [libraryState.currentProgress, libraryState.tutorials, toast]);

  // Submit quiz results
  const submitQuiz = useCallback(async (
    tutorialId: string,
    answers: number[],
    score: number,
    passed: boolean
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update progress with quiz score
      const { error: progressError } = await supabase
        .from('healthcare_video_progress')
        .update({
          quiz_score: score,
          completed: passed,
          completion_date: passed ? new Date().toISOString() : undefined
        })
        .eq('user_id', user.id)
        .eq('tutorial_id', tutorialId);

      if (progressError) throw progressError;

      // Log quiz attempt
      const tutorial = libraryState.tutorials.find(t => t.id === tutorialId);
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: null,
          performed_by: user.id,
          action: `Quiz ${passed ? 'passed' : 'failed'} - ${tutorial?.title}`,
          action_type: 'assessment',
          details: {
            tutorial_id: tutorialId,
            quiz_score: score,
            answers_submitted: answers,
            passed,
            compliance_topics: tutorial?.compliance_topics
          },
          compliance_impact: (tutorial?.compliance_topics.length || 0) > 0
        });

      if (passed) {
        toast({
          title: "Quiz Passed!",
          description: `Congratulations! You scored ${score}% on the quiz.`,
        });

        // Issue certificate if applicable
        if (tutorial?.is_required) {
          await issueCertificate(tutorialId);
        }
      } else {
        toast({
          title: "Quiz Not Passed",
          description: `You scored ${score}%. Please review the content and try again.`,
          variant: "destructive",
        });
      }

      // Reload progress
      await loadTutorials();

    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error Submitting Quiz",
        description: "Could not submit quiz results. Please try again.",
        variant: "destructive",
      });
    }
  }, [libraryState.tutorials, toast, loadTutorials]);

  // Issue completion certificate
  const issueCertificate = useCallback(async (tutorialId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tutorial = libraryState.tutorials.find(t => t.id === tutorialId);
      if (!tutorial) return;

      // Generate certificate
      const response = await supabase.functions.invoke('generate-healthcare-certificate', {
        body: {
          user_id: user.id,
          tutorial_id: tutorialId,
          tutorial_title: tutorial.title,
          completion_date: new Date().toISOString(),
          compliance_topics: tutorial.compliance_topics
        }
      });

      if (response.error) throw response.error;

      // Update progress with certificate flag
      await supabase
        .from('healthcare_video_progress')
        .update({ certificate_issued: true })
        .eq('user_id', user.id)
        .eq('tutorial_id', tutorialId);

      toast({
        title: "Certificate Issued!",
        description: `Your completion certificate for "${tutorial.title}" has been generated.`,
      });

    } catch (error) {
      console.error('Error issuing certificate:', error);
    }
  }, [libraryState.tutorials, toast]);

  // Get recommended tutorials based on role and progress
  const getRecommendedTutorials = useCallback(() => {
    const incompleteTutorials = libraryState.tutorials.filter(tutorial => {
      const progress = libraryState.progress.find(p => p.tutorial_id === tutorial.id);
      return !progress?.completed;
    });

    // Prioritize required tutorials
    const requiredTutorials = incompleteTutorials.filter(t => t.is_required);
    const optionalTutorials = incompleteTutorials.filter(t => !t.is_required);

    // Sort by category and order
    const sortedRequired = requiredTutorials.sort((a, b) => {
      if (a.category !== b.category) {
        const categoryOrder = ['onboarding', 'compliance', 'platform_setup', 'content_creation', 'advanced'];
        return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      }
      return a.order_index - b.order_index;
    });

    return {
      required: sortedRequired.slice(0, 3),
      recommended: optionalTutorials.slice(0, 2)
    };
  }, [libraryState.tutorials, libraryState.progress]);

  // Get tutorials by category
  const getTutorialsByCategory = useCallback((category: VideoTutorial['category']) => {
    return libraryState.tutorials
      .filter(t => t.category === category)
      .sort((a, b) => a.order_index - b.order_index);
  }, [libraryState.tutorials]);

  // Check if user has completed required training
  const hasCompletedRequiredTraining = useCallback(() => {
    const requiredTutorials = libraryState.tutorials.filter(t => t.is_required);
    const completedRequired = requiredTutorials.filter(tutorial => {
      const progress = libraryState.progress.find(p => p.tutorial_id === tutorial.id);
      return progress?.completed;
    });

    return completedRequired.length === requiredTutorials.length;
  }, [libraryState.tutorials, libraryState.progress]);

  // Initialize tutorials on component mount
  useEffect(() => {
    loadTutorials();
  }, [loadTutorials]);

  return {
    // State
    loading,
    tutorials: libraryState.tutorials,
    progress: libraryState.progress,
    currentTutorial: libraryState.currentTutorial,
    currentProgress: libraryState.currentProgress,
    completionStats: libraryState.completionStats,

    // Actions
    loadTutorials,
    startTutorial,
    updateProgress,
    submitQuiz,
    issueCertificate,

    // Utils
    getRecommendedTutorials,
    getTutorialsByCategory,
    hasCompletedRequiredTraining
  };
};

// Helper function to calculate completion stats
function calculateCompletionStats(
  tutorials: VideoTutorial[], 
  progress: VideoProgress[]
): VideoLibraryState['completionStats'] {
  const totalTutorials = tutorials.length;
  const completedTutorials = progress.filter(p => p.completed).length;
  const totalWatchTime = progress.reduce((sum, p) => sum + p.watched_duration, 0);
  const certificatesEarned = progress.filter(p => p.certificate_issued).length;
  
  const quizScores = progress
    .filter(p => p.quiz_score !== null && p.quiz_score !== undefined)
    .map(p => p.quiz_score!);
  
  const averageQuizScore = quizScores.length > 0 
    ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length 
    : 0;

  return {
    totalTutorials,
    completedTutorials,
    totalWatchTime,
    certificatesEarned,
    averageQuizScore
  };
} 