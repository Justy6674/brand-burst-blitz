import React from 'react';
import { Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddToCalendarButtonProps {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  platform?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({
  title,
  description = '',
  startDate,
  endDate,
  location = '',
  platform = '',
  size = 'sm',
  variant = 'outline',
  className
}) => {
  const generateICSFile = () => {
    const end = endDate || new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JBSAAS//Smart Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@jbsaas.com`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}${platform ? `\\n\\nPlatform: ${platform}` : ''}`,
      `LOCATION:${location}`,
      `CREATED:${formatDate(new Date())}`,
      `LAST-MODIFIED:${formatDate(new Date())}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    // Create and download the file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Calendar event downloaded! Import into your calendar app.');
  };

  const generateGoogleCalendarUrl = () => {
    const end = endDate || new Date(startDate.getTime() + 60 * 60 * 1000);
    
    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(end)}`,
      details: `${description}${platform ? `\n\nPlatform: ${platform}` : ''}`,
      location: location,
      trp: 'false'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Try to open Google Calendar first, then fallback to ICS download
    const googleUrl = generateGoogleCalendarUrl();
    
    // Open Google Calendar in new tab
    const googleWindow = window.open(googleUrl, '_blank');
    
    // Also generate ICS file as backup
    setTimeout(() => {
      generateICSFile();
    }, 500);

    // If popup was blocked, show toast with manual instructions
    if (!googleWindow || googleWindow.closed || typeof googleWindow.closed === 'undefined') {
      toast.info('Calendar file downloaded. You can also manually add to Google Calendar.');
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleAddToCalendar}
      className={cn(
        "transition-all hover:scale-105",
        variant === 'outline' && "border-primary/30 hover:bg-primary/10 hover:border-primary/50",
        className
      )}
      title="Add to Calendar (Google Calendar + .ics download)"
    >
      <Calendar className={cn(
        "mr-2",
        size === 'sm' && "h-3 w-3",
        size === 'default' && "h-4 w-4",
        size === 'lg' && "h-5 w-5"
      )} />
      Add to Calendar
      <Download className={cn(
        "ml-1 opacity-60",
        size === 'sm' && "h-2 w-2",
        size === 'default' && "h-3 w-3",
        size === 'lg' && "h-4 w-4"
      )} />
    </Button>
  );
};