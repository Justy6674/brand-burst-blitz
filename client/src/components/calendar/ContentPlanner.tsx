import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Clock,
  Target,
  Tag,
  FileText,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, isToday, isTomorrow, isYesterday, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface ContentPlan {
  id: string;
  date: Date;
  title: string;
  description: string;
  contentType: 'blog' | 'social' | 'newsletter' | 'video' | 'other';
  status: 'planned' | 'in-progress' | 'draft' | 'scheduled' | 'published';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  assignedTo?: string;
  targetPlatforms: string[];
  notes?: string;
  estimatedTime?: number; // in hours
}

interface ContentPlannerProps {
  businessId: string;
  onPlanCreated?: (plan: ContentPlan) => void;
}

export const ContentPlanner: React.FC<ContentPlannerProps> = ({
  businessId,
  onPlanCreated
}) => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ContentPlan | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const [newPlan, setNewPlan] = useState<Partial<ContentPlan>>({
    title: '',
    description: '',
    contentType: 'blog',
    status: 'planned',
    priority: 'medium',
    tags: [],
    targetPlatforms: [],
    notes: '',
    estimatedTime: 2
  });

  // Mock data - in real implementation, fetch from database
  useEffect(() => {
    const mockPlans: ContentPlan[] = [
      {
        id: '1',
        date: new Date(),
        title: 'AI in Small Business: Complete Guide',
        description: 'Comprehensive blog post about implementing AI solutions in small businesses',
        contentType: 'blog',
        status: 'in-progress',
        priority: 'high',
        tags: ['AI', 'Small Business', 'Technology'],
        targetPlatforms: ['Website', 'LinkedIn'],
        notes: 'Include case studies and practical examples',
        estimatedTime: 4
      },
      {
        id: '2',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        title: 'Weekly Social Media Update',
        description: 'Weekly roundup of industry news and tips',
        contentType: 'social',
        status: 'planned',
        priority: 'medium',
        tags: ['Social Media', 'Weekly'],
        targetPlatforms: ['Facebook', 'Instagram', 'Twitter'],
        estimatedTime: 1
      },
      {
        id: '3',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        title: 'Customer Success Stories Video',
        description: 'Interview with successful customers about their experience',
        contentType: 'video',
        status: 'planned',
        priority: 'high',
        tags: ['Customer Stories', 'Video', 'Testimonials'],
        targetPlatforms: ['YouTube', 'Website'],
        estimatedTime: 6
      }
    ];

    setPlans(mockPlans);
  }, [businessId]);

  const createPlan = () => {
    if (!newPlan.title || !newPlan.description) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and description for your content plan.",
        variant: "destructive"
      });
      return;
    }

    const plan: ContentPlan = {
      id: Date.now().toString(),
      date: selectedDate,
      title: newPlan.title!,
      description: newPlan.description!,
      contentType: newPlan.contentType!,
      status: newPlan.status!,
      priority: newPlan.priority!,
      tags: newPlan.tags!,
      targetPlatforms: newPlan.targetPlatforms!,
      notes: newPlan.notes,
      estimatedTime: newPlan.estimatedTime
    };

    setPlans(prev => [...prev, plan]);
    onPlanCreated?.(plan);
    setShowCreateDialog(false);
    resetNewPlan();

    toast({
      title: "Plan Created",
      description: `Content plan "${plan.title}" has been added to your calendar.`
    });
  };

  const updatePlan = () => {
    if (!editingPlan || !newPlan.title || !newPlan.description) return;

    const updatedPlan: ContentPlan = {
      ...editingPlan,
      title: newPlan.title!,
      description: newPlan.description!,
      contentType: newPlan.contentType!,
      status: newPlan.status!,
      priority: newPlan.priority!,
      tags: newPlan.tags!,
      targetPlatforms: newPlan.targetPlatforms!,
      notes: newPlan.notes,
      estimatedTime: newPlan.estimatedTime
    };

    setPlans(prev => prev.map(p => p.id === editingPlan.id ? updatedPlan : p));
    setEditingPlan(null);
    setShowCreateDialog(false);
    resetNewPlan();

    toast({
      title: "Plan Updated",
      description: `Content plan "${updatedPlan.title}" has been updated.`
    });
  };

  const deletePlan = (planId: string) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
    toast({
      title: "Plan Deleted",
      description: "Content plan has been removed from your calendar."
    });
  };

  const resetNewPlan = () => {
    setNewPlan({
      title: '',
      description: '',
      contentType: 'blog',
      status: 'planned',
      priority: 'medium',
      tags: [],
      targetPlatforms: [],
      notes: '',
      estimatedTime: 2
    });
  };

  const openEditDialog = (plan: ContentPlan) => {
    setEditingPlan(plan);
    setNewPlan({
      title: plan.title,
      description: plan.description,
      contentType: plan.contentType,
      status: plan.status,
      priority: plan.priority,
      tags: plan.tags,
      targetPlatforms: plan.targetPlatforms,
      notes: plan.notes,
      estimatedTime: plan.estimatedTime
    });
    setShowCreateDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'in-progress':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'scheduled':
        return <CalendarIcon className="h-4 w-4 text-orange-600" />;
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'newsletter': return <Target className="h-4 w-4" />;
      case 'video': return <TrendingUp className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDateRelative = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  const getPlansForDate = (date: Date) => {
    return plans.filter(plan => 
      format(plan.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const filteredPlans = plans.filter(plan => {
    if (filterStatus !== 'all' && plan.status !== filterStatus) return false;
    if (filterType !== 'all' && plan.contentType !== filterType) return false;
    return true;
  });

  const addTag = (tag: string) => {
    if (tag && !newPlan.tags?.includes(tag)) {
      setNewPlan(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setNewPlan(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const addPlatform = (platform: string) => {
    if (platform && !newPlan.targetPlatforms?.includes(platform)) {
      setNewPlan(prev => ({
        ...prev,
        targetPlatforms: [...(prev.targetPlatforms || []), platform]
      }));
    }
  };

  const removePlatform = (platform: string) => {
    setNewPlan(prev => ({
      ...prev,
      targetPlatforms: prev.targetPlatforms?.filter(p => p !== platform) || []
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Content Planner</h2>
            <p className="text-muted-foreground">
              Plan and schedule your content across all channels
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <FileText className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button onClick={() => {
            resetNewPlan();
            setEditingPlan(null);
            setShowCreateDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                modifiers={{
                  hasPlans: (date) => getPlansForDate(date).length > 0
                }}
                modifiersStyles={{
                  hasPlans: { backgroundColor: '#dbeafe', color: '#1e40af' }
                }}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                Plans for {formatDateRelative(selectedDate)}
              </CardTitle>
              <CardDescription>
                {getPlansForDate(selectedDate).length} content plan(s) scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getPlansForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No plans for this date</h3>
                    <p className="text-muted-foreground mb-4">
                      Create a new content plan to get started
                    </p>
                    <Button onClick={() => {
                      resetNewPlan();
                      setEditingPlan(null);
                      setShowCreateDialog(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Plan
                    </Button>
                  </div>
                ) : (
                  getPlansForDate(selectedDate).map((plan) => (
                    <Card key={plan.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getTypeIcon(plan.contentType)}
                              <h4 className="font-semibold">{plan.title}</h4>
                              <Badge className={getPriorityColor(plan.priority)}>
                                {plan.priority}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {plan.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                {getStatusIcon(plan.status)}
                                {plan.status}
                              </div>
                              {plan.estimatedTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {plan.estimatedTime}h
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1 mb-2">
                              {plan.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {plan.targetPlatforms.map(platform => (
                                <Badge key={platform} variant="outline" className="text-xs">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(plan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deletePlan(plan.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Content Plans</CardTitle>
            <CardDescription>
              {filteredPlans.length} content plan(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(plan.contentType)}
                          <h4 className="font-semibold">{plan.title}</h4>
                          <Badge className={getPriorityColor(plan.priority)}>
                            {plan.priority}
                          </Badge>
                          <Badge variant="outline">
                            {formatDateRelative(plan.date)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {plan.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(plan.status)}
                            {plan.status}
                          </div>
                          {plan.estimatedTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {plan.estimatedTime}h
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {plan.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {plan.targetPlatforms.map(platform => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePlan(plan.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Content Plan' : 'Create Content Plan'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={newPlan.title || ''}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Content title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content Type</label>
                <Select value={newPlan.contentType} onValueChange={(value) => 
                  setNewPlan(prev => ({ ...prev, contentType: value as ContentPlan['contentType'] }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blog">Blog Post</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={newPlan.description || ''}
                onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this content will cover"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={newPlan.status} onValueChange={(value) => 
                  setNewPlan(prev => ({ ...prev, status: value as ContentPlan['status'] }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={newPlan.priority} onValueChange={(value) => 
                  setNewPlan(prev => ({ ...prev, priority: value as ContentPlan['priority'] }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Time (hours)</label>
                <Input
                  type="number"
                  value={newPlan.estimatedTime || ''}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                  placeholder="2"
                  min="0"
                  max="24"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newPlan.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer"
                         onClick={() => removeTag(tag)}>
                    {tag} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tags (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Platforms</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newPlan.targetPlatforms?.map(platform => (
                  <Badge key={platform} variant="outline" className="cursor-pointer"
                         onClick={() => removePlatform(platform)}>
                    {platform} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Add platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newPlan.notes || ''}
                onChange={(e) => setNewPlan(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or ideas"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={editingPlan ? updatePlan : createPlan}>
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};