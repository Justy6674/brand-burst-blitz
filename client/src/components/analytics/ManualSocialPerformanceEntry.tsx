import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/use-toast';
import { useHealthcareAuth } from '../../hooks/useHealthcareAuth';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageSquare, 
  Share2, 
  Eye,
  Facebook,
  Instagram,
  Linkedin,
  Calendar,
  Edit3,
  Save,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';

interface SocialPostPerformance {
  id: string;
  content: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'other';
  date_posted: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  patient_inquiries: number;
  content_type: 'patient_education' | 'practice_info' | 'health_tips' | 'community_engagement' | 'service_promotion';
  ahpra_compliance_score: number;
  created_at: string;
  practice_id: string;
}

interface AnalyticsSummary {
  total_posts: number;
  total_engagement: number;
  avg_compliance_score: number;
  patient_inquiries: number;
  top_performing_platform: string;
  best_content_type: string;
  monthly_growth: number;
}

interface ManualSocialPerformanceEntryProps {
  practiceId?: string;
  onDataUpdate?: (summary: AnalyticsSummary) => void;
}

export function ManualSocialPerformanceEntry({ practiceId, onDataUpdate }: ManualSocialPerformanceEntryProps) {
  const { user, profile } = useHealthcareAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<SocialPostPerformance[]>([]);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  
  const [newPost, setNewPost] = useState({
    content: '',
    platform: 'facebook' as const,
    date_posted: new Date().toISOString().split('T')[0],
    likes: 0,
    comments: 0,
    shares: 0,
    reach: 0,
    patient_inquiries: 0,
    content_type: 'patient_education' as const
  });

  useEffect(() => {
    loadPostPerformanceData();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      calculateAnalyticsSummary();
    }
  }, [posts]);

  const loadPostPerformanceData = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('social_post_performance')
        .select('*')
        .eq('user_id', user?.id)
        .order('date_posted', { ascending: false });

      if (error) throw error;

      setPosts(data || []);

    } catch (error) {
      console.error('Error loading post performance data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load your social media performance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const calculateAnalyticsSummary = useCallback(() => {
    if (posts.length === 0) return;

    const totalEngagement = posts.reduce((sum, post) => 
      sum + post.likes + post.comments + post.shares, 0
    );

    const totalInquiries = posts.reduce((sum, post) => sum + post.patient_inquiries, 0);
    
    const avgCompliance = posts.reduce((sum, post) => 
      sum + post.ahpra_compliance_score, 0
    ) / posts.length;

    // Calculate top performing platform
    const platformStats = posts.reduce((acc, post) => {
      const engagement = post.likes + post.comments + post.shares;
      acc[post.platform] = (acc[post.platform] || 0) + engagement;
      return acc;
    }, {} as Record<string, number>);

    const topPlatform = Object.entries(platformStats).reduce((a, b) => 
      platformStats[a[0]] > platformStats[b[0]] ? a : b
    )[0];

    // Calculate best content type
    const contentStats = posts.reduce((acc, post) => {
      const engagement = post.likes + post.comments + post.shares;
      acc[post.content_type] = (acc[post.content_type] || 0) + engagement;
      return acc;
    }, {} as Record<string, number>);

    const bestContentType = Object.entries(contentStats).reduce((a, b) => 
      contentStats[a[0]] > contentStats[b[0]] ? a : b
    )[0];

    // Calculate monthly growth (simplified)
    const thisMonth = new Date();
    const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1);
    
    const thisMonthPosts = posts.filter(post => 
      new Date(post.date_posted) >= lastMonth
    ).length;
    
    const monthlyGrowth = thisMonthPosts > 0 ? 
      (thisMonthPosts / posts.length) * 100 : 0;

    const analyticsSummary: AnalyticsSummary = {
      total_posts: posts.length,
      total_engagement: totalEngagement,
      avg_compliance_score: Math.round(avgCompliance),
      patient_inquiries: totalInquiries,
      top_performing_platform: topPlatform,
      best_content_type: bestContentType,
      monthly_growth: Math.round(monthlyGrowth)
    };

    setSummary(analyticsSummary);
    onDataUpdate?.(analyticsSummary);

  }, [posts, onDataUpdate]);

  const addPostPerformance = useCallback(async () => {
    try {
      if (!newPost.content.trim()) {
        toast({
          title: "Content Required",
          description: "Please provide post content summary",
          variant: "destructive"
        });
        return;
      }

      // Calculate AHPRA compliance score based on content
      const complianceScore = calculateAHPRAComplianceScore(newPost.content, newPost.content_type);

      const postData: Omit<SocialPostPerformance, 'id' | 'created_at'> = {
        ...newPost,
        ahpra_compliance_score: complianceScore,
        practice_id: practiceId || user?.id || '',
        user_id: user?.id || ''
      };

      const { data, error } = await supabase
        .from('social_post_performance')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;

      setPosts(prev => [data, ...prev]);

      // Reset form
      setNewPost({
        content: '',
        platform: 'facebook',
        date_posted: new Date().toISOString().split('T')[0],
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
        patient_inquiries: 0,
        content_type: 'patient_education'
      });

      setIsAddingPost(false);

      toast({
        title: "Post Performance Added",
        description: "Your social media performance data has been recorded",
      });

    } catch (error) {
      console.error('Error adding post performance:', error);
      toast({
        title: "Error Adding Performance",
        description: "Failed to save post performance data",
        variant: "destructive"
      });
    }
  }, [newPost, practiceId, user?.id, toast]);

  const calculateAHPRAComplianceScore = (content: string, contentType: string): number => {
    let score = 100;

    // Check for prohibited content
    const prohibitedTerms = [
      'miracle', 'cure', 'guaranteed', 'amazing results', 'incredible',
      'testimonial', 'patient says', 'before and after', 'painless',
      'totally safe', 'no side effects', 'instant relief'
    ];

    const contentLower = content.toLowerCase();
    prohibitedTerms.forEach(term => {
      if (contentLower.includes(term)) {
        score -= 15;
      }
    });

    // Bonus for educational content
    if (contentType === 'patient_education') {
      score += 5;
    }

    // Check for appropriate disclaimers
    if (contentLower.includes('consult') || contentLower.includes('speak to your doctor')) {
      score += 10;
    }

    return Math.max(50, Math.min(100, score));
  };

  const deletePost = useCallback(async (postId: string) => {
    try {
      const { error } = await supabase
        .from('social_post_performance')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== postId));

      toast({
        title: "Post Deleted",
        description: "Post performance data has been removed",
      });

    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error Deleting Post",
        description: "Failed to delete post performance data",
        variant: "destructive"
      });
    }
  }, [toast]);

  const exportData = useCallback(() => {
    const csvData = [
      ['Date', 'Platform', 'Content Type', 'Likes', 'Comments', 'Shares', 'Reach', 'Patient Inquiries', 'Compliance Score'],
      ...posts.map(post => [
        post.date_posted,
        post.platform,
        post.content_type,
        post.likes,
        post.comments,
        post.shares,
        post.reach,
        post.patient_inquiries,
        post.ahpra_compliance_score
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthcare-social-performance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your social media performance data has been exported",
    });
  }, [posts, toast]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'linkedin': return <Linkedin className="h-4 w-4 text-blue-700" />;
      default: return <Share2 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getContentTypeBadge = (type: string) => {
    const colors = {
      patient_education: 'bg-blue-100 text-blue-800',
      practice_info: 'bg-green-100 text-green-800',
      health_tips: 'bg-purple-100 text-purple-800',
      community_engagement: 'bg-orange-100 text-orange-800',
      service_promotion: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Manual Social Media Performance
          </h2>
          <p className="text-gray-600">
            Enter your real social media performance data to replace mock analytics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddingPost(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Post Performance
          </Button>
          
          {posts.length > 0 && (
            <Button
              onClick={exportData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          )}
        </div>
      </div>

      {/* Analytics Summary */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold">{summary.total_posts}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Real performance data entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Engagement</p>
                  <p className="text-2xl font-bold">{summary.total_engagement.toLocaleString()}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Likes, comments, shares combined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Patient Inquiries</p>
                  <p className="text-2xl font-bold">{summary.patient_inquiries}</p>
                </div>
                <Phone className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Direct patient contact from posts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AHPRA Compliance</p>
                  <p className={`text-2xl font-bold ${getComplianceColor(summary.avg_compliance_score)}`}>
                    {summary.avg_compliance_score}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average compliance score
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Post Form */}
      {isAddingPost && (
        <Card>
          <CardHeader>
            <CardTitle>Add Post Performance Data</CardTitle>
            <CardDescription>
              Enter the actual performance metrics from your social media posts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={newPost.platform}
                  onValueChange={(value: any) => 
                    setNewPost(prev => ({ ...prev, platform: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content_type">Content Type</Label>
                <Select
                  value={newPost.content_type}
                  onValueChange={(value: any) => 
                    setNewPost(prev => ({ ...prev, content_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient_education">Patient Education</SelectItem>
                    <SelectItem value="practice_info">Practice Information</SelectItem>
                    <SelectItem value="health_tips">Health Tips</SelectItem>
                    <SelectItem value="community_engagement">Community Engagement</SelectItem>
                    <SelectItem value="service_promotion">Service Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Post Content Summary</Label>
              <Textarea
                id="content"
                placeholder="Brief summary of your post content..."
                value={newPost.content}
                onChange={(e) => 
                  setNewPost(prev => ({ ...prev, content: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_posted">Date Posted</Label>
                <Input
                  id="date_posted"
                  type="date"
                  value={newPost.date_posted}
                  onChange={(e) => 
                    setNewPost(prev => ({ ...prev, date_posted: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="likes">Likes</Label>
                <Input
                  id="likes"
                  type="number"
                  min="0"
                  value={newPost.likes}
                  onChange={(e) => 
                    setNewPost(prev => ({ ...prev, likes: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Input
                  id="comments"
                  type="number"
                  min="0"
                  value={newPost.comments}
                  onChange={(e) => 
                    setNewPost(prev => ({ ...prev, comments: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shares">Shares</Label>
                <Input
                  id="shares"
                  type="number"
                  min="0"
                  value={newPost.shares}
                  onChange={(e) => 
                    setNewPost(prev => ({ ...prev, shares: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reach">Reach</Label>
                <Input
                  id="reach"
                  type="number"
                  min="0"
                  value={newPost.reach}
                  onChange={(e) => 
                    setNewPost(prev => ({ ...prev, reach: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_inquiries">Patient Inquiries</Label>
                <Input
                  id="patient_inquiries"
                  type="number"
                  min="0"
                  value={newPost.patient_inquiries}
                  onChange={(e) => 
                    setNewPost(prev => ({ ...prev, patient_inquiries: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>AHPRA Compliance:</strong> Content will be automatically scored for compliance. 
                Avoid prohibited terms like "miracle cure", patient testimonials, or guaranteed results.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setIsAddingPost(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={addPostPerformance}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Performance Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Social Media Performance History</CardTitle>
          <CardDescription>
            Real performance data replacing mock analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Performance Data Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start adding your real social media performance data to replace mock analytics
              </p>
              <Button
                onClick={() => setIsAddingPost(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(post.platform)}
                        <span className="font-medium">{post.platform}</span>
                        {getContentTypeBadge(post.content_type)}
                        <Badge 
                          variant="outline" 
                          className={getComplianceColor(post.ahpra_compliance_score)}
                        >
                          {post.ahpra_compliance_score}% AHPRA
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.date_posted).toLocaleDateString()}
                      </div>
                    </div>

                    <Button
                      onClick={() => deletePost(post.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>{post.likes} likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span>{post.comments} comments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-green-500" />
                      <span>{post.shares} shares</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <span>{post.reach} reach</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-orange-500" />
                      <span>{post.patient_inquiries} inquiries</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">
                        {post.likes + post.comments + post.shares} total engagement
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 