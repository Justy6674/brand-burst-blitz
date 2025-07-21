import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useHealthcareContentApproval } from '@/hooks/useHealthcareContentApproval';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  RefreshCw,
  Play,
  Pause,
  User,
  Award,
  Flag,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';

interface HealthcareContentApprovalWorkflowProps {
  practiceId?: string;
  showSubmissionForm?: boolean;
  userRole?: 'practitioner' | 'practice_manager' | 'senior_practitioner' | 'admin';
}

export const HealthcareContentApprovalWorkflow: React.FC<HealthcareContentApprovalWorkflowProps> = ({
  practiceId,
  showSubmissionForm = false,
  userRole = 'practitioner'
}) => {
  const { toast } = useToast();
  const {
    loading,
    approvalQueue,
    workflowSettings,
    approvalStats,
    loadApprovalQueue,
    submitForApproval,
    startReview,
    completeReview,
    calculateApprovalStats
  } = useHealthcareContentApproval();

  const [activeTab, setActiveTab] = useState<'queue' | 'review' | 'stats' | 'settings'>('queue');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected' | 'requires_changes'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [complianceScores, setComplianceScores] = useState({
    overall_score: 95,
    ahpra_compliant: true,
    tga_compliant: true,
    professional_boundaries_checked: true,
    cultural_safety_verified: true
  });

  useEffect(() => {
    if (practiceId) {
      loadApprovalQueue(practiceId);
    }
  }, [practiceId, loadApprovalQueue]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'requires_changes': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'published': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApprovalLevelIcon = (level: string) => {
    switch (level) {
      case 'junior_review': return <Eye className="h-4 w-4" />;
      case 'senior_review': return <Award className="h-4 w-4" />;
      case 'manager_approval': return <Shield className="h-4 w-4" />;
      case 'final_approval': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const handleStartReview = async (item: any) => {
    await startReview(item.id);
    setSelectedItem(item);
    setShowReviewDialog(true);
  };

  const handleCompleteReview = async () => {
    if (!selectedItem) return;

    await completeReview(
      selectedItem.id,
      reviewDecision,
      reviewNotes,
      complianceScores
    );

    setShowReviewDialog(false);
    setSelectedItem(null);
    setReviewNotes('');
  };

  const renderApprovalQueue = () => (
    <div className="space-y-4">
      {approvalQueue.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Content in Queue</h3>
            <p className="text-gray-600">
              {userRole === 'practitioner' 
                ? "You haven't submitted any content for approval yet."
                : "There's no content waiting for review at the moment."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        approvalQueue.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{item.content_title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>by {item.created_by_name}</span>
                    <span>•</span>
                    <Clock className="h-4 w-4" />
                    <span>{formatTimeAgo(item.submitted_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(item.approval_status)}>
                    {item.approval_status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getApprovalLevelIcon(item.approval_level)}
                    {item.approval_level.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Content Preview */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {item.content_text}
                  </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>
                    <div className="text-gray-600 capitalize">{item.content_type.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <span className="font-medium">Specialty:</span>
                    <div className="text-gray-600 capitalize">{item.specialty}</div>
                  </div>
                  <div>
                    <span className="font-medium">Platforms:</span>
                    <div className="text-gray-600">{item.content_platform.join(', ')}</div>
                  </div>
                  <div>
                    <span className="font-medium">Audience:</span>
                    <div className="text-gray-600 capitalize">{item.target_audience}</div>
                  </div>
                </div>

                {/* Compliance Indicators */}
                {item.approval_status !== 'pending' && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      <span>Compliance Score: {item.compliance_score}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.ahpra_compliant ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>AHPRA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.tga_compliant ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>TGA</span>
                    </div>
                  </div>
                )}

                {/* Review Notes */}
                {item.review_notes && (
                  <Alert>
                    <MessageSquare className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Review Notes:</strong> {item.review_notes}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {userRole !== 'practitioner' && item.approval_status === 'pending' && (
                    <Button 
                      onClick={() => handleStartReview(item)}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Review
                    </Button>
                  )}
                  
                  {userRole !== 'practitioner' && item.approval_status === 'under_review' && 
                   item.assigned_reviewer_id && (
                    <Button 
                      onClick={() => {
                        setSelectedItem(item);
                        setShowReviewDialog(true);
                      }}
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Review
                    </Button>
                  )}

                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>

                  {item.approval_status === 'approved' && (
                    <Button variant="outline" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Publish Now
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderApprovalStats = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="font-medium">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">{approvalStats?.total_pending || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Under Review</h3>
              <p className="text-2xl font-bold text-blue-600">{approvalStats?.total_under_review || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Approved</h3>
              <p className="text-2xl font-bold text-green-600">{approvalStats?.total_approved || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium">Avg. Score</h3>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(approvalStats?.compliance_score_average || 0)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Performance</CardTitle>
          <CardDescription>Key metrics for content approval workflow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Average Approval Time</h4>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(approvalStats?.average_approval_time_hours || 0)} hours
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Backlog Items</h4>
              <div className="text-2xl font-bold text-orange-600">
                {approvalStats?.backlog_items || 0}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Approval Rate</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Approved vs Total Reviewed</span>
                <span>
                  {approvalStats ? 
                    Math.round((approvalStats.total_approved / (approvalStats.total_approved + approvalStats.total_rejected)) * 100) || 0
                    : 0}%
                </span>
              </div>
              <Progress 
                value={approvalStats ? 
                  (approvalStats.total_approved / (approvalStats.total_approved + approvalStats.total_rejected)) * 100 || 0
                  : 0} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReviewDialog = () => (
    <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Healthcare Content</DialogTitle>
          <DialogDescription>
            Evaluate this content for AHPRA compliance and professional standards
          </DialogDescription>
        </DialogHeader>

        {selectedItem && (
          <div className="space-y-6">
            {/* Content Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedItem.content_title}</CardTitle>
                <CardDescription>
                  {selectedItem.content_type} • {selectedItem.specialty} • 
                  Created by {selectedItem.created_by_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedItem.content_text}</p>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Evaluation */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Evaluation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Overall Compliance Score</label>
                    <Select 
                      value={complianceScores.overall_score.toString()} 
                      onValueChange={(value) => setComplianceScores(prev => ({ ...prev, overall_score: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100% - Fully Compliant</SelectItem>
                        <SelectItem value="95">95% - Minor Issues</SelectItem>
                        <SelectItem value="90">90% - Some Concerns</SelectItem>
                        <SelectItem value="85">85% - Needs Attention</SelectItem>
                        <SelectItem value="75">75% - Significant Issues</SelectItem>
                        <SelectItem value="60">60% - Major Problems</SelectItem>
                        <SelectItem value="40">40% - Poor Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review Decision</label>
                    <Select value={reviewDecision} onValueChange={setReviewDecision}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Approve for Publication</SelectItem>
                        <SelectItem value="requires_changes">Requires Changes</SelectItem>
                        <SelectItem value="rejected">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ahpra_compliant"
                      checked={complianceScores.ahpra_compliant}
                      onChange={(e) => setComplianceScores(prev => ({ ...prev, ahpra_compliant: e.target.checked }))}
                    />
                    <label htmlFor="ahpra_compliant" className="text-sm">AHPRA Guidelines Met</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="tga_compliant"
                      checked={complianceScores.tga_compliant}
                      onChange={(e) => setComplianceScores(prev => ({ ...prev, tga_compliant: e.target.checked }))}
                    />
                    <label htmlFor="tga_compliant" className="text-sm">TGA Requirements Met</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="professional_boundaries"
                      checked={complianceScores.professional_boundaries_checked}
                      onChange={(e) => setComplianceScores(prev => ({ ...prev, professional_boundaries_checked: e.target.checked }))}
                    />
                    <label htmlFor="professional_boundaries" className="text-sm">Professional Boundaries Maintained</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cultural_safety"
                      checked={complianceScores.cultural_safety_verified}
                      onChange={(e) => setComplianceScores(prev => ({ ...prev, cultural_safety_verified: e.target.checked }))}
                    />
                    <label htmlFor="cultural_safety" className="text-sm">Cultural Safety Verified</label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="review_notes" className="text-sm font-medium">Review Notes</label>
                  <Textarea
                    id="review_notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Provide detailed feedback on compliance issues, suggestions for improvement, or approval rationale..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCompleteReview}>
                    Complete Review
                  </Button>
                  <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Healthcare Content Approval Workflow
          </CardTitle>
          <CardDescription>
            AHPRA-compliant content review and approval system for practice management oversight
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue">Approval Queue</TabsTrigger>
          <TabsTrigger value="review">Active Reviews</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Content Awaiting Approval</h3>
            <Button onClick={() => loadApprovalQueue(practiceId)} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          {renderApprovalQueue()}
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <h3 className="text-lg font-medium">Active Reviews</h3>
          {renderApprovalQueue()}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <h3 className="text-lg font-medium">Approval Statistics</h3>
          {renderApprovalStats()}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <h3 className="text-lg font-medium">Workflow Settings</h3>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">
                Workflow configuration will be available here for practice managers.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      {renderReviewDialog()}
    </div>
  );
}; 