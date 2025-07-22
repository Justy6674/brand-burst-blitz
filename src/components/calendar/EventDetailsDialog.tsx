import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  ExternalLink,
  Copy,
  Share
} from 'lucide-react';
import { useCalendar } from '@/hooks/useCalendar';

interface EventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
}

export const EventDetailsDialog = ({ 
  open, 
  onOpenChange,
  event
}: EventDetailsDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { reschedulePost, unschedulePost } = useCalendar();

  if (!event) return null;

  const handleReschedule = async () => {
    // This would open a reschedule dialog
    // For now, just a placeholder
    console.log('Reschedule event:', event.id);
  };

  const handleUnschedule = async () => {
    if (!event.queueItem) return;
    
    setIsLoading(true);
    try {
      const success = await unschedulePost(event.queueItem.id);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error unscheduling post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = () => {
    // This would create a duplicate post
    console.log('Duplicate event:', event.id);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">{event.title}</DialogTitle>
              <DialogDescription className="mt-2">
                {event.type === 'post' ? 'Content Post' : 'Scheduled Publishing'}
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(event.status)}>
              {event.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Time</p>
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatDateTime(event.start)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Time</p>
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatDateTime(event.end)}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="capitalize">{event.type}</p>
              </div>
            </CardContent>
          </Card>

          {/* Post Content */}
          {event.post && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Title</p>
                  <p>{event.post.title || 'Untitled'}</p>
                </div>
                
                {event.post.excerpt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Excerpt</p>
                    <p className="text-sm">{event.post.excerpt}</p>
                  </div>
                )}
                
                {event.post.content && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Content Preview</p>
                    <div className="bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">
                        {event.post.content.slice(0, 200)}
                        {event.post.content.length > 200 && '...'}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p className="capitalize">{event.post.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">AI Tone</p>
                    <p className="capitalize">{event.post.ai_tone || 'Not specified'}</p>
                  </div>
                </div>
                
                {event.post.tags && event.post.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {event.post.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Publishing Details */}
          {event.queueItem && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Publishing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Attempt Count</p>
                    <p>{event.queueItem.attempt_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(event.queueItem.status)}>
                      {event.queueItem.status}
                    </Badge>
                  </div>
                </div>
                
                {event.queueItem.published_post_id && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Published Post ID</p>
                    <p className="font-mono text-sm">{event.queueItem.published_post_id}</p>
                  </div>
                )}
                
                {event.queueItem.last_error && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Error</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{event.queueItem.last_error}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            
            <div className="flex space-x-2">
              {event.queueItem && event.status === 'scheduled' && (
                <>
                  <Button variant="outline" size="sm" onClick={handleReschedule}>
                    <Edit className="h-4 w-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUnschedule}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isLoading ? 'Removing...' : 'Unschedule'}
                  </Button>
                </>
              )}
              
              {event.queueItem?.published_post_id && (
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Post
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};