import { useEffect, useCallback, useRef, useState } from 'react';
import { useToast } from './use-toast';
import { useHealthcareAuth } from './useHealthcareAuth';
import { supabase } from '../integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  user_id: string;
  practice_id: string;
  status: string;
  event_type: string;
  updated_at: string;
  [key: string]: any;
}

interface SyncStatus {
  connected: boolean;
  lastSyncTime: Date;
  pendingChanges: number;
  errorCount: number;
  retryCount: number;
}

interface ConflictResolution {
  eventId: string;
  localVersion: CalendarEvent;
  remoteVersion: CalendarEvent;
  strategy: 'local' | 'remote' | 'merge' | 'manual';
}

interface RealTimeSyncOptions {
  enabled: boolean;
  autoReconnect: boolean;
  conflictResolution: 'local' | 'remote' | 'merge' | 'manual';
  batchUpdates: boolean;
  debounceMs: number;
  heartbeatInterval: number;
  maxRetries: number;
}

export function useRealTimeCalendarSync(
  events: CalendarEvent[],
  updateEvents: (events: CalendarEvent[]) => void,
  options: RealTimeSyncOptions = {
    enabled: true,
    autoReconnect: true,
    conflictResolution: 'merge',
    batchUpdates: true,
    debounceMs: 500,
    heartbeatInterval: 30000,
    maxRetries: 5
  }
) {
  const { user } = useHealthcareAuth();
  const { toast } = useToast();

  // Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    connected: false,
    lastSyncTime: new Date(),
    pendingChanges: 0,
    errorCount: 0,
    retryCount: 0
  });

  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [isResolvingConflicts, setIsResolvingConflicts] = useState(false);

  // Real-time connection
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Set<string>>(new Set());

  // Conflict resolution queue
  const conflictQueueRef = useRef<ConflictResolution[]>([]);
  const lastSyncTimeRef = useRef<Date>(new Date());

  // Connection management
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Initialize real-time sync
  useEffect(() => {
    if (options.enabled && user?.id) {
      initializeRealTimeSync();
    }

    return () => {
      cleanup();
    };
  }, [options.enabled, user?.id]);

  // Heartbeat for connection monitoring
  useEffect(() => {
    if (syncStatus.connected && options.enabled) {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }

    return () => stopHeartbeat();
  }, [syncStatus.connected, options.enabled]);

  const initializeRealTimeSync = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, connected: false }));

      // Create real-time channel for calendar events
      const channel = supabase
        .channel(`healthcare_calendar_events:user_id=${user?.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'healthcare_calendar_events',
            filter: `user_id=eq.${user?.id}`
          },
          handleRealtimeChange
        )
        .on('presence', { event: 'sync' }, () => {
          console.log('Real-time presence synced');
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
        .subscribe((status) => {
          handleConnectionStatus(status);
        });

      channelRef.current = channel;

      // Track user presence
      await channel.track({
        user_id: user?.id,
        online_at: new Date().toISOString(),
        last_seen: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to initialize real-time sync:', error);
      handleConnectionError(error);
    }
  };

  const handleConnectionStatus = (status: string) => {
    console.log('Real-time connection status:', status);

    switch (status) {
      case 'SUBSCRIBED':
        setSyncStatus(prev => ({
          ...prev,
          connected: true,
          lastSyncTime: new Date(),
          errorCount: 0,
          retryCount: 0
        }));
        setConnectionAttempts(0);
        setIsReconnecting(false);
        
        toast({
          title: "🔄 Real-time Sync Active",
          description: "Calendar events will sync automatically across all devices.",
        });
        break;

      case 'TIMED_OUT':
      case 'CLOSED':
        setSyncStatus(prev => ({
          ...prev,
          connected: false,
          errorCount: prev.errorCount + 1
        }));
        
        if (options.autoReconnect && connectionAttempts < options.maxRetries) {
          attemptReconnection();
        }
        break;

      case 'CHANNEL_ERROR':
        handleConnectionError(new Error('Channel error'));
        break;
    }
  };

  const handleRealtimeChange = async (payload: RealtimePostgresChangesPayload<CalendarEvent>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    try {
      console.log('Real-time change received:', eventType, newRecord?.id || oldRecord?.id);

      // Check for conflicts
      if (eventType === 'UPDATE' && newRecord) {
        const conflict = await detectConflict(newRecord);
        if (conflict) {
          conflictQueueRef.current.push(conflict);
          setConflicts(prev => [...prev, conflict]);
          
          if (options.conflictResolution === 'manual') {
            showConflictResolutionDialog(conflict);
            return;
          }
        }
      }

      // Apply change based on event type
      switch (eventType) {
        case 'INSERT':
          if (newRecord) {
            await handleEventInsert(newRecord);
          }
          break;

        case 'UPDATE':
          if (newRecord) {
            await handleEventUpdate(newRecord);
          }
          break;

        case 'DELETE':
          if (oldRecord) {
            await handleEventDelete(oldRecord);
          }
          break;
      }

      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        pendingChanges: Math.max(0, prev.pendingChanges - 1)
      }));

    } catch (error) {
      console.error('Error handling real-time change:', error);
      setSyncStatus(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
    }
  };

  const handleEventInsert = async (newEvent: CalendarEvent) => {
    // Check if event already exists (prevent duplicates)
    const existingEvent = events.find(e => e.id === newEvent.id);
    if (existingEvent) {
      console.log('Event already exists, skipping insert');
      return;
    }

    // Add to pending updates to prevent echo
    pendingUpdatesRef.current.add(newEvent.id);

    if (options.batchUpdates) {
      debouncedUpdateEvents(() => {
        updateEvents([...events, newEvent]);
        pendingUpdatesRef.current.delete(newEvent.id);
      });
    } else {
      updateEvents([...events, newEvent]);
      pendingUpdatesRef.current.delete(newEvent.id);
    }

    // Show notification for external changes
    if (!pendingUpdatesRef.current.has(newEvent.id)) {
      toast({
        title: "📅 New Event Added",
        description: `${newEvent.title} was added to your calendar.`,
      });
    }
  };

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    // Skip if this update originated from this client
    if (pendingUpdatesRef.current.has(updatedEvent.id)) {
      pendingUpdatesRef.current.delete(updatedEvent.id);
      return;
    }

    const existingIndex = events.findIndex(e => e.id === updatedEvent.id);
    if (existingIndex === -1) {
      console.log('Event not found for update, treating as insert');
      await handleEventInsert(updatedEvent);
      return;
    }

    const updatedEvents = [...events];
    updatedEvents[existingIndex] = updatedEvent;

    if (options.batchUpdates) {
      debouncedUpdateEvents(() => {
        updateEvents(updatedEvents);
      });
    } else {
      updateEvents(updatedEvents);
    }

    toast({
      title: "📝 Event Updated",
      description: `${updatedEvent.title} was updated.`,
    });
  };

  const handleEventDelete = async (deletedEvent: CalendarEvent) => {
    // Skip if this delete originated from this client
    if (pendingUpdatesRef.current.has(deletedEvent.id)) {
      pendingUpdatesRef.current.delete(deletedEvent.id);
      return;
    }

    const filteredEvents = events.filter(e => e.id !== deletedEvent.id);

    if (options.batchUpdates) {
      debouncedUpdateEvents(() => {
        updateEvents(filteredEvents);
      });
    } else {
      updateEvents(filteredEvents);
    }

    toast({
      title: "🗑️ Event Deleted",
      description: `${deletedEvent.title} was deleted.`,
      variant: "destructive"
    });
  };

  const detectConflict = async (remoteEvent: CalendarEvent): Promise<ConflictResolution | null> => {
    const localEvent = events.find(e => e.id === remoteEvent.id);
    if (!localEvent) return null;

    // Check if local version is newer than last sync
    const localModified = new Date(localEvent.updated_at);
    const remoteModified = new Date(remoteEvent.updated_at);
    const lastSync = lastSyncTimeRef.current;

    // Conflict detected if both versions were modified after last sync
    if (localModified > lastSync && remoteModified > lastSync) {
      return {
        eventId: remoteEvent.id,
        localVersion: localEvent,
        remoteVersion: remoteEvent,
        strategy: options.conflictResolution
      };
    }

    return null;
  };

  const resolveConflict = async (conflict: ConflictResolution) => {
    setIsResolvingConflicts(true);

    try {
      let resolvedEvent: CalendarEvent;

      switch (conflict.strategy) {
        case 'local':
          resolvedEvent = conflict.localVersion;
          break;

        case 'remote':
          resolvedEvent = conflict.remoteVersion;
          break;

        case 'merge':
          resolvedEvent = mergeEvents(conflict.localVersion, conflict.remoteVersion);
          break;

        default:
          console.log('Manual conflict resolution required');
          return;
      }

      // Update the event with resolved version
      const updatedEvents = events.map(e => 
        e.id === conflict.eventId ? resolvedEvent : e
      );
      updateEvents(updatedEvents);

      // Remove from conflicts list
      setConflicts(prev => prev.filter(c => c.eventId !== conflict.eventId));

      toast({
        title: "🔄 Conflict Resolved",
        description: `Event "${resolvedEvent.title}" conflict resolved using ${conflict.strategy} version.`,
      });

    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast({
        title: "Conflict Resolution Failed",
        description: "Could not resolve the conflict. Manual intervention required.",
        variant: "destructive"
      });
    } finally {
      setIsResolvingConflicts(false);
    }
  };

  const mergeEvents = (localEvent: CalendarEvent, remoteEvent: CalendarEvent): CalendarEvent => {
    // Intelligent merge strategy - favor more recent changes for specific fields
    return {
      ...localEvent,
      ...remoteEvent,
      // Use the most recent title
      title: new Date(localEvent.updated_at) > new Date(remoteEvent.updated_at) 
        ? localEvent.title 
        : remoteEvent.title,
      
      // Merge tags and attendees
      tags: Array.from(new Set([
        ...(localEvent.tags || []),
        ...(remoteEvent.tags || [])
      ])),
      
      attendees: Array.from(new Set([
        ...(localEvent.attendees || []),
        ...(remoteEvent.attendees || [])
      ])),
      
      // Use most recent timestamp
      updated_at: new Date(Math.max(
        new Date(localEvent.updated_at).getTime(),
        new Date(remoteEvent.updated_at).getTime()
      )).toISOString()
    };
  };

  const showConflictResolutionDialog = (conflict: ConflictResolution) => {
    // This would trigger a modal dialog in the UI
    toast({
      title: "⚠️ Sync Conflict Detected",
      description: `Event "${conflict.localVersion.title}" has conflicting changes. Please resolve manually.`,
      variant: "destructive"
    });
  };

  const debouncedUpdateEvents = useCallback((updateFn: () => void) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      updateFn();
      debounceRef.current = null;
    }, options.debounceMs);
  }, [options.debounceMs]);

  const startHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    heartbeatRef.current = setInterval(async () => {
      try {
        const { error } = await supabase
          .from('healthcare_calendar_events')
          .select('count')
          .limit(1);

        if (error) {
          throw error;
        }

        setSyncStatus(prev => ({
          ...prev,
          lastSyncTime: new Date(),
          errorCount: 0
        }));

      } catch (error) {
        console.error('Heartbeat failed:', error);
        setSyncStatus(prev => ({
          ...prev,
          errorCount: prev.errorCount + 1
        }));

        if (syncStatus.errorCount > 3) {
          handleConnectionError(error);
        }
      }
    }, options.heartbeatInterval);
  };

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const attemptReconnection = async () => {
    if (isReconnecting) return;

    setIsReconnecting(true);
    setConnectionAttempts(prev => prev + 1);

    const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000); // Exponential backoff, max 30s

    setTimeout(async () => {
      try {
        await cleanup();
        await initializeRealTimeSync();
      } catch (error) {
        console.error('Reconnection failed:', error);
        
        if (connectionAttempts >= options.maxRetries) {
          toast({
            title: "🔌 Sync Disconnected",
            description: "Real-time sync failed. Working in offline mode.",
            variant: "destructive"
          });
        }
      } finally {
        setIsReconnecting(false);
      }
    }, delay);
  };

  const handleConnectionError = (error: any) => {
    console.error('Real-time sync error:', error);

    setSyncStatus(prev => ({
      ...prev,
      connected: false,
      errorCount: prev.errorCount + 1
    }));

    if (options.autoReconnect && connectionAttempts < options.maxRetries) {
      attemptReconnection();
    } else {
      toast({
        title: "Sync Error",
        description: "Real-time sync encountered an error. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const cleanup = async () => {
    if (channelRef.current) {
      await channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    stopHeartbeat();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setSyncStatus(prev => ({
      ...prev,
      connected: false
    }));
  };

  // Manual sync functions
  const forceSyncNow = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));

      // Force a full sync by fetching all events
      const { data: latestEvents, error } = await supabase
        .from('healthcare_calendar_events')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      updateEvents(latestEvents || []);
      lastSyncTimeRef.current = new Date();

      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        pendingChanges: 0,
        errorCount: 0
      }));

      toast({
        title: "🔄 Sync Complete",
        description: "Calendar has been synchronized with the latest data.",
      });

    } catch (error) {
      console.error('Force sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
      
      toast({
        title: "Sync Failed",
        description: "Could not sync calendar data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const enableOfflineMode = () => {
    cleanup();
    
    toast({
      title: "📴 Offline Mode",
      description: "Real-time sync disabled. Changes will sync when you go back online.",
    });
  };

  const markEventForSync = (eventId: string) => {
    pendingUpdatesRef.current.add(eventId);
    setSyncStatus(prev => ({
      ...prev,
      pendingChanges: prev.pendingChanges + 1
    }));
  };

  return {
    // Status
    syncStatus,
    conflicts,
    isResolvingConflicts,
    isReconnecting,
    
    // Actions
    forceSyncNow,
    enableOfflineMode,
    markEventForSync,
    resolveConflict,
    
    // Conflict resolution
    resolveAllConflicts: async () => {
      for (const conflict of conflicts) {
        await resolveConflict(conflict);
      }
    },
    
    // Connection management
    reconnect: () => {
      if (!isReconnecting) {
        attemptReconnection();
      }
    }
  };
} 