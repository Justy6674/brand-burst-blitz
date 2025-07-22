import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  status: string;
  color: string;
}

interface CalendarGridProps {
  currentDate: Date;
  view: 'month' | 'week' | 'day';
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  view,
  events,
  onEventClick,
  onDateClick,
}) => {
  const renderMonthView = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startOfWeek = new Date(startOfMonth);
    startOfWeek.setDate(startOfMonth.getDate() - startOfMonth.getDay());
    
    const days = [];
    const currentDay = new Date(startOfWeek);
    
    // Generate 6 weeks (42 days) to ensure full month view
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

  return (
      <div className="p-6">
        {/* Header */}
        <div className="grid grid-cols-7 mb-6">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center font-semibold text-primary">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayEvents = events.filter(event => 
              event.start.toDateString() === day.toDateString()
            );
            
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === today.toDateString();
            const hasEvents = dayEvents.length > 0;
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[140px] p-3 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group relative overflow-hidden",
                  isCurrentMonth 
                    ? "bg-gradient-to-br from-background to-background/50 border-primary/20 hover:border-primary/40" 
                    : "bg-muted/10 border-muted/30 text-muted-foreground",
                  isToday && "ring-2 ring-primary/50 bg-gradient-to-br from-primary/5 to-primary-glow/5 border-primary/40",
                  hasEvents && "border-secondary/30 bg-gradient-to-br from-secondary/5 to-accent/5"
                )}
                onClick={() => onDateClick(day)}
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary-glow/0 group-hover:from-primary/5 group-hover:to-primary-glow/10 transition-all duration-300" />
                
                <div className="relative z-10">
                  <div className={cn(
                    "text-sm font-bold mb-3 transition-all duration-300",
                    isToday 
                      ? "bg-gradient-to-r from-primary to-primary-glow text-transparent bg-clip-text text-lg" 
                      : "text-foreground group-hover:text-primary",
                    !isCurrentMonth && "text-muted-foreground"
                  )}>
                    {day.getDate()}
                  </div>
                  
                  <div className="space-y-1.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/10"
                        style={{ 
                          backgroundColor: event.color + '20', 
                          color: event.color,
                          boxShadow: `0 2px 8px ${event.color}20`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div className="truncate font-semibold">{event.title}</div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground bg-muted/20 rounded p-1.5 text-center font-medium">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                    {dayEvents.length === 0 && isCurrentMonth && (
                      <div className="text-xs text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center pt-4">
                        Click to create content
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const today = new Date();

    return (
      <div className="p-4">
        {/* Header */}
        <div className="grid grid-cols-8 mb-4 border-b">
          <div className="p-2"></div> {/* Time column header */}
          {days.map((day) => {
            const isToday = day.toDateString() === today.toDateString();
            return (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "p-2 text-center cursor-pointer hover:bg-muted rounded",
                  isToday && "bg-primary/10 font-semibold"
                )}
                onClick={() => onDateClick(day)}
              >
                <div className="text-sm text-muted-foreground">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={cn(
                  "text-lg",
                  isToday && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                )}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-8 gap-px bg-border max-h-[600px] overflow-y-auto">
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="p-2 text-right text-sm text-muted-foreground bg-background">
                {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
              </div>
              {days.map((day) => {
                const dayEvents = events.filter(event => {
                  const eventDate = new Date(event.start);
                  return eventDate.toDateString() === day.toDateString() &&
                         eventDate.getHours() === hour;
                });

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="min-h-[60px] p-1 bg-background border-t border-muted hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => onDateClick(new Date(day.setHours(hour, 0, 0, 0)))}
                  >
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: event.color + '20', color: event.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div className="truncate font-medium">{event.title}</div>
                        <div className="truncate">
                          {event.start.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = events.filter(event => 
      event.start.toDateString() === currentDate.toDateString()
    );

    return (
      <div className="p-4">
        {/* Header */}
        <div className="mb-4 p-4 border-b">
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-2 gap-px bg-border max-h-[600px] overflow-y-auto">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter(event => 
              event.start.getHours() === hour
            );

            return (
              <React.Fragment key={hour}>
                <div className="p-2 text-right text-sm text-muted-foreground bg-background">
                  {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                </div>
                <div 
                  className="min-h-[60px] p-2 bg-background border-t border-muted hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onDateClick(new Date(currentDate.setHours(hour, 0, 0, 0)))}
                >
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-sm p-2 rounded mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: event.color + '20', color: event.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs">
                        {event.start.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })} - {event.end.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <Badge 
                        variant="outline" 
                        className="mt-1"
                        style={{ borderColor: event.color, color: event.color }}
                      >
                        {event.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </React.Fragment>
            );
          })}
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
    default:
      return renderMonthView();
  }
};