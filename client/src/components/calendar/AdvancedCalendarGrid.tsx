import React, { useState, useRef, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import type { CalendarEvent } from '@/hooks/useAdvancedCalendar';

interface AdvancedCalendarGridProps {
  events: CalendarEvent[];
  currentDate: Date;
  view: 'month' | 'week' | 'day' | 'agenda';
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  onEventMove?: (eventId: string, newStart: Date, newEnd: Date) => void;
  onCreateEvent?: (date: Date, time?: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AdvancedCalendarGrid: React.FC<AdvancedCalendarGridProps> = ({
  events,
  currentDate,
  view,
  onEventClick,
  onDateClick,
  onEventMove,
  onCreateEvent,
}) => {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [draggedOverDate, setDraggedOverDate] = useState<Date | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return isSameDay(eventDate, date);
    });
  }, [events]);

  const getEventsForHour = useCallback((date: Date, hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_datetime);
      return isSameDay(eventStart, date) && eventStart.getHours() === hour;
    });
  }, [events]);

  const handleEventDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleEventDragEnd = () => {
    setDraggedEvent(null);
    setDraggedOverDate(null);
  };

  const handleDateDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setDraggedOverDate(date);
  };

  const handleDateDrop = (e: React.DragEvent, date: Date, hour?: number) => {
    e.preventDefault();
    if (draggedEvent && onEventMove) {
      const originalStart = new Date(draggedEvent.start_datetime);
      const originalEnd = new Date(draggedEvent.end_datetime);
      const duration = originalEnd.getTime() - originalStart.getTime();

      const newStart = new Date(date);
      if (hour !== undefined) {
        newStart.setHours(hour, 0, 0, 0);
      }
      const newEnd = new Date(newStart.getTime() + duration);

      onEventMove(draggedEvent.id, newStart, newEnd);
    }
    setDraggedEvent(null);
    setDraggedOverDate(null);
  };

  const renderEventBlock = (event: CalendarEvent, compact = false) => {
    const startTime = format(new Date(event.start_datetime), 'HH:mm');
    const endTime = format(new Date(event.end_datetime), 'HH:mm');
    
    return (
      <div
        key={event.id}
        draggable
        onDragStart={(e) => handleEventDragStart(e, event)}
        onDragEnd={handleEventDragEnd}
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg rounded-lg p-2 border border-opacity-30",
          compact ? "text-xs" : "text-sm",
          draggedEvent?.id === event.id && "opacity-50"
        )}
        style={{
          backgroundColor: event.color + '20',
          borderColor: event.color,
          color: event.color,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick(event);
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{event.title}</div>
            {!compact && !event.all_day && (
              <div className="text-xs opacity-75">
                {startTime} - {endTime}
              </div>
            )}
            {!compact && event.location && (
              <div className="text-xs opacity-75 truncate">{event.location}</div>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge
              variant="outline"
              className="text-xs"
              style={{ borderColor: event.color, color: event.color }}
            >
              {event.event_type}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const today = new Date();

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-7 border-b bg-muted/20">
          {WEEK_DAYS.map(day => (
            <div key={day} className="p-4 text-center font-semibold text-primary">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, today);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isDraggedOver = draggedOverDate && isSameDay(day, draggedOverDate);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "border-r border-b p-2 min-h-[120px] transition-all duration-200 hover:bg-muted/30 cursor-pointer relative overflow-hidden",
                  !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                  isToday && "bg-primary/5 border-primary/30",
                  isDraggedOver && "bg-primary/10 border-primary border-2"
                )}
                onClick={() => onDateClick(day)}
                onDragOver={(e) => handleDateDragOver(e, day)}
                onDrop={(e) => handleDateDrop(e, day)}
              >
                {/* Date number */}
                <div className={cn(
                  "text-sm font-bold mb-2 transition-all duration-200",
                  isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                )}>
                  {day.getDate()}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => renderEventBlock(event, true))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center bg-muted/50 rounded p-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>

                {/* Quick Add Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute bottom-1 right-1 w-6 h-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateEvent?.(day);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(currentDate) });
    const today = new Date();

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-8 border-b bg-muted/20">
          <div className="p-4"></div> {/* Time column header */}
          {weekDays.map(day => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "p-4 text-center cursor-pointer hover:bg-muted rounded transition-all",
                  isToday && "bg-primary/10 font-semibold"
                )}
                onClick={() => onDateClick(day)}
              >
                <div className="text-sm text-muted-foreground">
                  {format(day, 'EEE')}
                </div>
                <div className={cn(
                  "text-lg",
                  isToday && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto text-sm"
                )}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-8 min-h-full">
            {/* Hours column */}
            <div className="border-r bg-muted/10">
              {HOURS.map(hour => (
                <div key={hour} className="h-16 p-2 text-right text-sm text-muted-foreground border-b">
                  {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                </div>
              ))}
            </div>

            {/* Days columns */}
            {weekDays.map(day => (
              <div key={day.toISOString()} className="border-r">
                {HOURS.map(hour => {
                  const hourEvents = getEventsForHour(day, hour);
                  const isDraggedOver = draggedOverDate && isSameDay(day, draggedOverDate);

                  return (
                    <div
                      key={hour}
                      className={cn(
                        "h-16 p-1 border-b hover:bg-muted/30 cursor-pointer transition-all relative",
                        isDraggedOver && "bg-primary/10"
                      )}
                      onClick={() => onCreateEvent?.(day, `${hour.toString().padStart(2, '0')}:00`)}
                      onDragOver={(e) => handleDateDragOver(e, day)}
                      onDrop={(e) => handleDateDrop(e, day, hour)}
                    >
                      <div className="space-y-1">
                        {hourEvents.map(event => renderEventBlock(event, true))}
                      </div>
                      
                      {/* Quick Add Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute bottom-1 right-1 w-5 h-5 p-0 opacity-0 hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateEvent?.(day, `${hour.toString().padStart(2, '0')}:00`);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const today = new Date();
    const isToday = isSameDay(currentDate, today);

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-muted/20">
          <h3 className="text-2xl font-bold">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          {isToday && (
            <p className="text-muted-foreground">Today</p>
          )}
        </div>

        {/* Day Schedule */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2">
            {/* Hours column */}
            <div className="border-r bg-muted/10">
              {HOURS.map(hour => (
                <div key={hour} className="h-20 p-3 text-right text-muted-foreground border-b">
                  <div className="text-lg font-medium">
                    {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                  </div>
                </div>
              ))}
            </div>

            {/* Events column */}
            <div>
              {HOURS.map(hour => {
                const hourEvents = getEventsForHour(currentDate, hour);

                return (
                  <div
                    key={hour}
                    className="h-20 p-2 border-b hover:bg-muted/30 cursor-pointer transition-all relative"
                    onClick={() => onCreateEvent?.(currentDate, `${hour.toString().padStart(2, '0')}:00`)}
                    onDragOver={(e) => handleDateDragOver(e, currentDate)}
                    onDrop={(e) => handleDateDrop(e, currentDate, hour)}
                  >
                    <div className="space-y-1">
                      {hourEvents.map(event => renderEventBlock(event))}
                    </div>

                    {/* Quick Add Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute bottom-1 right-1 w-6 h-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateEvent?.(currentDate, `${hour.toString().padStart(2, '0')}:00`);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    const upcomingEvents = events
      .filter(event => new Date(event.start_datetime) >= new Date())
      .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
      .slice(0, 50);

    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="space-y-6">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">No upcoming events</div>
            </div>
          ) : (
            upcomingEvents.map(event => (
              <div
                key={event.id}
                className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                onClick={() => onEventClick(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: event.color }}
                      />
                      <h4 className="font-semibold text-lg">{event.title}</h4>
                      <Badge variant="outline">{event.event_type}</Badge>
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {format(new Date(event.start_datetime), 'EEEE, MMMM d, yyyy')}
                      {!event.all_day && (
                        <span className="ml-2">
                          {format(new Date(event.start_datetime), 'h:mm a')} - {format(new Date(event.end_datetime), 'h:mm a')}
                        </span>
                      )}
                    </div>
                    {event.location && (
                      <div className="mt-1 text-sm text-muted-foreground">{event.location}</div>
                    )}
                    {event.description && (
                      <div className="mt-2 text-sm">{event.description}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  switch (view) {
    case 'month':
      return renderMonthView();
    case 'week':
      return renderWeekView();
    case 'day':
      return renderDayView();
    case 'agenda':
      return renderAgendaView();
    default:
      return renderMonthView();
  }
};