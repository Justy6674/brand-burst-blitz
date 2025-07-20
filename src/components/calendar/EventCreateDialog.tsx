import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { toast } from 'sonner';

interface EventCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  onEventCreated: (event: any) => void;
}

export const EventCreateDialog = ({ 
  open, 
  onOpenChange, 
  selectedDate,
  onEventCreated 
}: EventCreateDialogProps) => {
  const { createEvent } = useCalendarEvents();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    allDay: false,
    eventType: 'general'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const startDateTime = new Date(selectedDate);
      const endDateTime = new Date(selectedDate);
      
      if (!formData.allDay) {
        startDateTime.setHours(9, 0);
        endDateTime.setHours(10, 0);
      }

      const event = await createEvent({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        all_day: formData.allDay,
        event_type: formData.eventType
      });

      if (event) {
        onEventCreated(event);
        setFormData({
          title: '',
          description: '',
          location: '',
          allDay: false,
          eventType: 'general'
        });
      }
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};