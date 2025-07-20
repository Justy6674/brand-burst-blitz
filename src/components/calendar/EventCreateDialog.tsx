import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Bell, 
  Palette,
  Plus,
  X,
  Flag,
  Repeat,
  Paperclip
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CreateEventData } from '@/hooks/useAdvancedCalendar';

interface EventCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateEvent: (data: CreateEventData) => Promise<any>;
  initialDate?: Date;
  initialTime?: string;
}

const EVENT_TYPES = [
  { value: 'meeting', label: 'Meeting', color: '#3b82f6', icon: Users },
  { value: 'content', label: 'Content', color: '#8b5cf6', icon: Calendar },
  { value: 'reminder', label: 'Reminder', color: '#f59e0b', icon: Bell },
  { value: 'deadline', label: 'Deadline', color: '#ef4444', icon: Flag },
  { value: 'general', label: 'General', color: '#6b7280', icon: Calendar },
];

const PRIORITY_LEVELS = [
  { value: 1, label: 'Critical', color: '#dc2626' },
  { value: 2, label: 'High', color: '#ea580c' },
  { value: 3, label: 'Medium', color: '#ca8a04' },
  { value: 4, label: 'Low', color: '#16a34a' },
  { value: 5, label: 'Very Low', color: '#64748b' },
];

const COLOR_OPTIONS = [
  '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981',
  '#06b6d4', '#8b5cf6', '#f97316', '#84cc16', '#6366f1'
];

export const EventCreateDialog: React.FC<EventCreateDialogProps> = ({
  open,
  onOpenChange,
  onCreateEvent,
  initialDate,
  initialTime,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form state
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    start_datetime: initialDate || new Date(),
    end_datetime: new Date((initialDate || new Date()).getTime() + 60 * 60 * 1000), // 1 hour later
    all_day: false,
    event_type: 'general',
    status: 'confirmed',
    priority: 3,
    location: '',
    attendees: [],
    color: '#3b82f6',
    is_recurring: false,
    notifications: [{ type: 'popup', minutes_before: 15 }],
    metadata: {},
  });

  const [newAttendee, setNewAttendee] = useState({ email: '', name: '', role: 'attendee' as const });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsCreating(true);
    try {
      await onCreateEvent(formData);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_datetime: initialDate || new Date(),
      end_datetime: new Date((initialDate || new Date()).getTime() + 60 * 60 * 1000),
      all_day: false,
      event_type: 'general',
      status: 'confirmed',
      priority: 3,
      location: '',
      attendees: [],
      color: '#3b82f6',
      is_recurring: false,
      notifications: [{ type: 'popup', minutes_before: 15 }],
      metadata: {},
    });
    setNewAttendee({ email: '', name: '', role: 'attendee' });
    setActiveTab('basic');
  };

  const addAttendee = () => {
    if (newAttendee.email.trim()) {
      setFormData(prev => ({
        ...prev,
        attendees: [...(prev.attendees || []), newAttendee]
      }));
      setNewAttendee({ email: '', name: '', role: 'attendee' });
    }
  };

  const removeAttendee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees?.filter((_, i) => i !== index) || []
    }));
  };

  const addNotification = () => {
    setFormData(prev => ({
      ...prev,
      notifications: [
        ...(prev.notifications || []),
        { type: 'popup', minutes_before: 15 }
      ]
    }));
  };

  const updateNotification = (index: number, field: 'type' | 'minutes_before', value: any) => {
    setFormData(prev => ({
      ...prev,
      notifications: prev.notifications?.map((notif, i) => 
        i === index ? { ...notif, [field]: value } : notif
      ) || []
    }));
  };

  const removeNotification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      notifications: prev.notifications?.filter((_, i) => i !== index) || []
    }));
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">Create New Event</div>
              <div className="text-sm text-muted-foreground font-normal">
                {initialDate ? format(initialDate, 'EEEE, MMMM d, yyyy') : 'Add to your calendar'}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[70vh]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="datetime">Date & Time</TabsTrigger>
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                  className="text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add event description, agenda, or notes..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {EVENT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all hover:scale-105",
                          formData.event_type === type.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => setFormData(prev => ({ ...prev, event_type: type.value as any }))}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="p-1 rounded"
                            style={{ backgroundColor: type.color + '20' }}
                          >
                            <type.icon className="h-4 w-4" style={{ color: type.color }} />
                          </div>
                          <span className="font-medium">{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <div className="space-y-2">
                    {PRIORITY_LEVELS.map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        className={cn(
                          "w-full p-2 rounded-lg border text-left transition-all hover:scale-105",
                          formData.priority === priority.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: priority.color }}
                          />
                          <span>{priority.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Add location or meeting link"
                    className="pl-10"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="datetime" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={format(formData.start_datetime, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value + 'T' + format(formData.start_datetime, 'HH:mm'));
                      setFormData(prev => ({ ...prev, start_datetime: newDate }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={format(formData.start_datetime, 'HH:mm')}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(formData.start_datetime);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setFormData(prev => ({ ...prev, start_datetime: newDate }));
                    }}
                    disabled={formData.all_day}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={format(formData.end_datetime, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value + 'T' + format(formData.end_datetime, 'HH:mm'));
                      setFormData(prev => ({ ...prev, end_datetime: newDate }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={format(formData.end_datetime, 'HH:mm')}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(formData.end_datetime);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setFormData(prev => ({ ...prev, end_datetime: newDate }));
                    }}
                    disabled={formData.all_day}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="all-day"
                  checked={formData.all_day}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, all_day: checked }))}
                />
                <Label htmlFor="all-day">All Day Event</Label>
              </div>

              <div className="space-y-2">
                <Label>Event Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                        formData.color === color ? "border-foreground shadow-lg" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="attendees" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Attendees
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Email address"
                      value={newAttendee.email}
                      onChange={(e) => setNewAttendee(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <Input
                      placeholder="Name (optional)"
                      value={newAttendee.name}
                      onChange={(e) => setNewAttendee(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <div className="flex gap-1">
                      <select
                        className="flex-1 p-2 rounded border"
                        value={newAttendee.role}
                        onChange={(e) => setNewAttendee(prev => ({ ...prev, role: e.target.value as any }))}
                      >
                        <option value="attendee">Attendee</option>
                        <option value="optional">Optional</option>
                        <option value="organizer">Organizer</option>
                      </select>
                      <Button type="button" size="sm" onClick={addAttendee}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {formData.attendees && formData.attendees.length > 0 && (
                    <div className="space-y-2">
                      {formData.attendees.map((attendee, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{attendee.name || attendee.email}</div>
                            {attendee.name && (
                              <div className="text-sm text-muted-foreground">{attendee.email}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{attendee.role}</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttendee(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.notifications?.map((notification, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        className="p-2 rounded border"
                        value={notification.type}
                        onChange={(e) => updateNotification(index, 'type', e.target.value)}
                      >
                        <option value="popup">Popup</option>
                        <option value="email">Email</option>
                        <option value="push">Push</option>
                      </select>
                      <Input
                        type="number"
                        value={notification.minutes_before}
                        onChange={(e) => updateNotification(index, 'minutes_before', parseInt(e.target.value))}
                        className="w-20"
                      />
                      <span>minutes before</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addNotification}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Notification
                  </Button>
                </CardContent>
              </Card>

              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
                />
                <Label htmlFor="recurring" className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Recurring Event
                </Label>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.title.trim() || isCreating}
              className="bg-gradient-to-r from-primary to-primary-glow"
            >
              {isCreating ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};