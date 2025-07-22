import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, Trash2, Copy, Calendar, Edit } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { toast } from 'sonner';

export interface BulkActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEventIds: string[];
  onBulkComplete: (results: { success: number; errors: number }) => void;
}

const BULK_ACTIONS = [
  { id: 'delete', label: 'Delete Events', icon: Trash2, variant: 'destructive' as const },
  { id: 'duplicate', label: 'Duplicate Events', icon: Copy, variant: 'default' as const },
  { id: 'reschedule', label: 'Reschedule Events', icon: Calendar, variant: 'default' as const },
  { id: 'update_status', label: 'Update Status', icon: Edit, variant: 'default' as const },
  { id: 'update_platform', label: 'Update Platform', icon: Edit, variant: 'default' as const },
];

const STATUS_OPTIONS = ['confirmed', 'tentative', 'cancelled', 'draft'];
const PLATFORM_OPTIONS = ['instagram', 'facebook', 'tiktok', 'linkedin', 'reddit', 'blog', 'email', 'youtube', 'twitter'];

export const BulkActionsDialog: React.FC<BulkActionsDialogProps> = ({
  open,
  onOpenChange,
  selectedEventIds,
  onBulkComplete
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionParams, setActionParams] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const { events, bulkOperations } = useCalendarEvents();

  const selectedEvents = events.filter(event => selectedEventIds.includes(event.id!));

  const handleExecuteAction = async () => {
    if (!selectedAction) {
      toast.error('Please select an action');
      return;
    }

    setIsProcessing(true);

    try {
      const operations: Array<{
        operation: 'create' | 'update' | 'delete';
        id?: string;
        data?: any;
      }> = [];

      switch (selectedAction) {
        case 'delete':
          operations.push(...selectedEventIds.map(id => ({
            operation: 'delete' as const,
            id
          })));
          break;

        case 'duplicate':
          operations.push(...selectedEvents.map(event => {
            const newStartDate = new Date(event.start_datetime);
            newStartDate.setDate(newStartDate.getDate() + (actionParams.dayOffset || 1));
            
            const newEndDate = new Date(event.end_datetime);
            newEndDate.setDate(newEndDate.getDate() + (actionParams.dayOffset || 1));

            return {
              operation: 'create' as const,
              data: {
                ...event,
                id: undefined,
                title: `${event.title} (Copy)`,
                start_datetime: newStartDate.toISOString(),
                end_datetime: newEndDate.toISOString()
              }
            };
          }));
          break;

        case 'reschedule':
          operations.push(...selectedEventIds.map(id => {
            const event = selectedEvents.find(e => e.id === id);
            if (!event) return null;

            const newStartDate = new Date(event.start_datetime);
            const newEndDate = new Date(event.end_datetime);
            
            if (actionParams.dayOffset) {
              newStartDate.setDate(newStartDate.getDate() + actionParams.dayOffset);
              newEndDate.setDate(newEndDate.getDate() + actionParams.dayOffset);
            }
            
            if (actionParams.hourOffset) {
              newStartDate.setHours(newStartDate.getHours() + actionParams.hourOffset);
              newEndDate.setHours(newEndDate.getHours() + actionParams.hourOffset);
            }

            return {
              operation: 'update' as const,
              id,
              data: {
                start_datetime: newStartDate.toISOString(),
                end_datetime: newEndDate.toISOString()
              }
            };
          }).filter(Boolean) as any[]);
          break;

        case 'update_status':
          if (!actionParams.status) {
            toast.error('Please select a status');
            return;
          }
          operations.push(...selectedEventIds.map(id => ({
            operation: 'update' as const,
            id,
            data: { status: actionParams.status }
          })));
          break;

        case 'update_platform':
          if (!actionParams.platform) {
            toast.error('Please select a platform');
            return;
          }
          operations.push(...selectedEventIds.map(id => ({
            operation: 'update' as const,
            id,
            data: { platform: actionParams.platform }
          })));
          break;

        default:
          toast.error('Invalid action selected');
          return;
      }

      const results = await bulkOperations(operations);
      onBulkComplete(results);

    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to execute bulk action');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderActionParams = () => {
    switch (selectedAction) {
      case 'duplicate':
        return (
          <div>
            <Label htmlFor="dayOffset">Days to add to duplicated events</Label>
            <Select
              value={actionParams.dayOffset?.toString() || '1'}
              onValueChange={(value) => setActionParams(prev => ({ ...prev, dayOffset: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day later</SelectItem>
                <SelectItem value="7">1 week later</SelectItem>
                <SelectItem value="30">1 month later</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'reschedule':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="dayOffset">Day offset</Label>
              <Select
                value={actionParams.dayOffset?.toString() || '0'}
                onValueChange={(value) => setActionParams(prev => ({ ...prev, dayOffset: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-7">1 week earlier</SelectItem>
                  <SelectItem value="-1">1 day earlier</SelectItem>
                  <SelectItem value="0">Same day</SelectItem>
                  <SelectItem value="1">1 day later</SelectItem>
                  <SelectItem value="7">1 week later</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="hourOffset">Hour offset</Label>
              <Select
                value={actionParams.hourOffset?.toString() || '0'}
                onValueChange={(value) => setActionParams(prev => ({ ...prev, hourOffset: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-2">2 hours earlier</SelectItem>
                  <SelectItem value="-1">1 hour earlier</SelectItem>
                  <SelectItem value="0">Same time</SelectItem>
                  <SelectItem value="1">1 hour later</SelectItem>
                  <SelectItem value="2">2 hours later</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'update_status':
        return (
          <div>
            <Label htmlFor="status">New Status</Label>
            <Select
              value={actionParams.status || ''}
              onValueChange={(value) => setActionParams(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'update_platform':
        return (
          <div>
            <Label htmlFor="platform">New Platform</Label>
            <Select
              value={actionParams.platform || ''}
              onValueChange={(value) => setActionParams(prev => ({ ...prev, platform: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map(platform => (
                  <SelectItem key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Actions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Events Summary */}
          <div>
            <Label>Selected Events</Label>
            <div className="mt-2 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{selectedEventIds.length} events selected</p>
              <div className="mt-2 space-y-1">
                {selectedEvents.slice(0, 3).map(event => (
                  <p key={event.id} className="text-xs text-muted-foreground truncate">
                    • {event.title}
                  </p>
                ))}
                {selectedEvents.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    + {selectedEvents.length - 3} more events
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Selection */}
          <div>
            <Label htmlFor="action">Select Action</Label>
            <Select
              value={selectedAction}
              onValueChange={(value) => {
                setSelectedAction(value);
                setActionParams({});
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an action" />
              </SelectTrigger>
              <SelectContent>
                {BULK_ACTIONS.map(action => {
                  const Icon = action.icon;
                  return (
                    <SelectItem key={action.id} value={action.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {action.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Action Parameters */}
          {selectedAction && renderActionParams()}

          {/* Warning for destructive actions */}
          {selectedAction === 'delete' && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                ⚠️ This action cannot be undone. All selected events will be permanently deleted.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExecuteAction}
              disabled={!selectedAction || isProcessing}
              variant={selectedAction === 'delete' ? 'destructive' : 'default'}
            >
              {isProcessing ? 'Processing...' : 'Execute Action'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};