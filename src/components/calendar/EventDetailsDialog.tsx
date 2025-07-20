import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { AddToCalendarButton } from '@/components/common/AddToCalendarButton';
import { Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface EventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onEventUpdated: () => void;
  onEventDeleted: () => void;
}

export const EventDetailsDialog = ({ 
  open, 
  onOpenChange, 
  eventId,
  onEventUpdated,
  onEventDeleted 
}: EventDetailsDialogProps) => {
  const { events, updateEvent, deleteEvent } = useCalendarEvents();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    allDay: false,
    eventType: 'general'
  });

  const event = events.find(e => e.id === eventId);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        allDay: event.all_day || false,
        eventType: event.event_type || 'general'
      });
    }
  }, [event]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) return;

    try {
      const updatedEvent = await updateEvent(eventId, {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        all_day: formData.allDay,
        event_type: formData.eventType
      });

      if (updatedEvent) {
        setIsEditing(false);
        onEventUpdated();
      }
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(eventId);
      onEventDeleted();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Event Details
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="allDay"
                checked={formData.allDay}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allDay: checked }))}
              />
              <Label htmlFor="allDay">All day event</Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <p className="text-sm font-medium">{event.title}</p>
            </div>
            
            {event.description && (
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            )}
            
            {event.location && (
              <div>
                <Label>Location</Label>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            )}
            
            <div>
              <Label>Date & Time</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(event.start_datetime).toLocaleString()}
                {!event.all_day && ` - ${new Date(event.end_datetime).toLocaleString()}`}
              </p>
            </div>

            <AddToCalendarButton
              title={event.title}
              description={event.description || ''}
              startDate={new Date(event.start_datetime)}
              endDate={new Date(event.end_datetime)}
              location={event.location || ''}
              className="w-full"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};