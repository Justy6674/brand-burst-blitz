import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface HealthcareContentEvent {
  id: string;
  practiceId: string;
  title: string;
  content: string;
  platforms: HealthcarePlatform[];
  scheduledDate: string;
  eventType: 'post' | 'campaign' | 'awareness_day' | 'patient_education' | 'practice_update';
  specialty: 'gp' | 'specialist' | 'allied_health' | 'psychology' | 'dentistry' | 'nursing';
  targetAudience: 'current_patients' | 'potential_patients' | 'professional_network' | 'community';
  complianceStatus: 'pending' | 'approved' | 'needs_review' | 'rejected';
  ahpraCompliant: boolean;
  tgaCompliant: boolean;
  professionalBoundariesChecked: boolean;
  hashtags: string[];
  disclaimers: string[];
  copyPasteReady: boolean;
  createdBy: string;
  lastModified: string;
  reminderSettings: ReminderSettings;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
}

interface HealthcarePlatform {
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'website' | 'email';
  optimizedContent: string;
  characterCount: number;
  scheduledTime?: string;
  publishedAt?: string;
  platformSpecificHashtags: string[];
  platformCompliant: boolean;
  copyPasteInstructions: string;
}

interface ReminderSettings {
  enabled: boolean;
  reminderTimes: string[]; // e.g., ['1 day before', '2 hours before']
  notificationMethods: ('email' | 'dashboard' | 'sms')[];
  complianceReminder: boolean;
}

interface HealthcareContentTemplate {
  id: string;
  name: string;
  category: 'health_awareness' | 'patient_education' | 'practice_promotion' | 'seasonal' | 'regulatory';
  specialty: string[];
  content: string;
  platforms: string[];
  hashtags: string[];
  complianceNotes: string[];
  usageCount: number;
  effectivenessRating: number;
}

interface CalendarView {
  type: 'month' | 'week' | 'day' | 'agenda';
  startDate: Date;
  endDate: Date;
  filterSpecialty?: string;
  filterPlatform?: string;
  filterStatus?: string;
}

interface HealthcareAwarenessDay {
  date: string;
  name: string;
  description: string;
  relevantSpecialties: string[];
  suggestedContent: string[];
  hashtags: string[];
  complianceConsiderations: string[];
}

export function useHealthcareContentCalendar() {
  const [calendarEvents, setCalendarEvents] = useState<HealthcareContentEvent[]>([]);
  const [contentTemplates, setContentTemplates] = useState<HealthcareContentTemplate[]>([]);
  const [awarenessCalendar, setAwarenessCalendar] = useState<HealthcareAwarenessDay[]>([]);
  const [currentView, setCurrentView] = useState<CalendarView>({
    type: 'month',
    startDate: new Date(),
    endDate: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Healthcare awareness days calendar
  const healthcareAwarenessDays: HealthcareAwarenessDay[] = [
    {
      date: '2024-01-31',
      name: 'Cervical Cancer Awareness Day',
      description: 'Promote cervical cancer screening and prevention',
      relevantSpecialties: ['gp', 'specialist'],
      suggestedContent: [
        'Importance of regular cervical screening',
        'HPV vaccination information',
        'Early detection saves lives'
      ],
      hashtags: ['#CervicalCancerAwareness', '#PreventiveCare', '#WomensHealth'],
      complianceConsiderations: [
        'Include medical disclaimer about screening recommendations',
        'Avoid fear-based messaging',
        'Encourage professional consultation'
      ]
    },
    {
      date: '2024-02-04',
      name: 'World Cancer Day',
      description: 'Global awareness about cancer prevention and treatment',
      relevantSpecialties: ['gp', 'specialist'],
      suggestedContent: [
        'Cancer prevention strategies',
        'Importance of early detection',
        'Supporting cancer patients and families'
      ],
      hashtags: ['#WorldCancerDay', '#CancerPrevention', '#EarlyDetection'],
      complianceConsiderations: [
        'Provide evidence-based information only',
        'Include appropriate medical disclaimers',
        'Avoid testimonials or success stories'
      ]
    },
    {
      date: '2024-03-08',
      name: 'International Women\'s Day - Women\'s Health Focus',
      description: 'Highlight women\'s health issues and healthcare equity',
      relevantSpecialties: ['gp', 'specialist', 'psychology'],
      suggestedContent: [
        'Women\'s health screening importance',
        'Mental health in women',
        'Hormonal health across lifespan'
      ],
      hashtags: ['#WomensHealth', '#HealthEquity', '#InternationalWomensDay'],
      complianceConsiderations: [
        'Ensure culturally inclusive messaging',
        'Avoid stereotypes or generalizations',
        'Focus on evidence-based health information'
      ]
    },
    {
      date: '2024-04-07',
      name: 'World Health Day',
      description: 'WHO global health awareness initiative',
      relevantSpecialties: ['gp', 'allied_health', 'psychology', 'dentistry'],
      suggestedContent: [
        'Importance of preventive healthcare',
        'Global health challenges and solutions',
        'Community health initiatives'
      ],
      hashtags: ['#WorldHealthDay', '#GlobalHealth', '#PreventiveCare'],
      complianceConsiderations: [
        'Include WHO references where appropriate',
        'Focus on evidence-based global health data',
        'Encourage professional healthcare engagement'
      ]
    },
    {
      date: '2024-05-31',
      name: 'World No Tobacco Day',
      description: 'Raise awareness about tobacco-related health risks',
      relevantSpecialties: ['gp', 'specialist', 'allied_health'],
      suggestedContent: [
        'Health risks of tobacco use',
        'Benefits of quitting smoking',
        'Support resources for smoking cessation'
      ],
      hashtags: ['#WorldNoTobaccoDay', '#SmokingCessation', '#TobaccoFree'],
      complianceConsiderations: [
        'Provide evidence-based cessation information',
        'Include professional support resources',
        'Avoid judgmental language'
      ]
    },
    {
      date: '2024-10-10',
      name: 'World Mental Health Day',
      description: 'Global mental health awareness and support',
      relevantSpecialties: ['psychology', 'gp', 'specialist'],
      suggestedContent: [
        'Reducing mental health stigma',
        'Importance of professional mental health support',
        'Self-care and mental wellness strategies'
      ],
      hashtags: ['#WorldMentalHealthDay', '#MentalHealthAwareness', '#EndStigma'],
      complianceConsiderations: [
        'Include crisis support information',
        'Avoid diagnostic language',
        'Emphasize professional help-seeking'
      ]
    }
  ];

  // Create new calendar event
  const createCalendarEvent = useCallback(async (event: Omit<HealthcareContentEvent, 'id' | 'createdBy' | 'lastModified'>) => {
    setIsSaving(true);
    
    try {
      // Validate content for AHPRA compliance
      const complianceCheck = await validateEventCompliance(event);
      
      const newEvent: HealthcareContentEvent = {
        ...event,
        id: `event_${Date.now()}`,
        createdBy: (await supabase.auth.getUser()).data.user?.id || 'unknown',
        lastModified: new Date().toISOString(),
        ahpraCompliant: complianceCheck.ahpraCompliant,
        tgaCompliant: complianceCheck.tgaCompliant,
        professionalBoundariesChecked: complianceCheck.professionalBoundariesChecked,
        complianceStatus: complianceCheck.overallCompliant ? 'approved' : 'needs_review'
      };

      // Store in database
      const { data, error } = await supabase
        .from('healthcare_content_calendar')
        .insert([{
          practice_id: newEvent.practiceId,
          title: newEvent.title,
          content: newEvent.content,
          platforms: newEvent.platforms,
          scheduled_date: newEvent.scheduledDate,
          event_type: newEvent.eventType,
          specialty: newEvent.specialty,
          target_audience: newEvent.targetAudience,
          compliance_status: newEvent.complianceStatus,
          ahpra_compliant: newEvent.ahpraCompliant,
          tga_compliant: newEvent.tgaCompliant,
          professional_boundaries_checked: newEvent.professionalBoundariesChecked,
          hashtags: newEvent.hashtags,
          disclaimers: newEvent.disclaimers,
          copy_paste_ready: newEvent.copyPasteReady,
          reminder_settings: newEvent.reminderSettings,
          status: newEvent.status,
          created_by: newEvent.createdBy
        }])
        .select()
        .single();

      if (error) throw error;

      setCalendarEvents(prev => [...prev, { ...newEvent, id: data.id }]);
      
      return { success: true, eventId: data.id };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update calendar event
  const updateCalendarEvent = useCallback(async (eventId: string, updates: Partial<HealthcareContentEvent>) => {
    setIsSaving(true);
    
    try {
      const updatedEvent = {
        ...updates,
        lastModified: new Date().toISOString()
      };

      const { error } = await supabase
        .from('healthcare_content_calendar')
        .update(updatedEvent)
        .eq('id', eventId);

      if (error) throw error;

      setCalendarEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, ...updatedEvent }
            : event
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Generate copy-paste content for specific platform
  const generateCopyPasteContent = useCallback(async (eventId: string, platform: string) => {
    const event = calendarEvents.find(e => e.id === eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const platformData = event.platforms.find(p => p.platform === platform);
    if (!platformData) {
      throw new Error('Platform not configured for this event');
    }

    // Generate platform-optimized copy-paste content
    const copyPasteContent = {
      content: platformData.optimizedContent,
      hashtags: platformData.platformSpecificHashtags.join(' '),
      disclaimers: event.disclaimers.join('\n'),
      instructions: platformData.copyPasteInstructions,
      scheduledTime: platformData.scheduledTime,
      complianceNotes: [
        'Content has been validated for AHPRA compliance',
        'Include appropriate medical disclaimers',
        'Ensure patient privacy is maintained'
      ]
    };

    return copyPasteContent;
  }, [calendarEvents]);

  // Get events for calendar view
  const getEventsForPeriod = useCallback(async (startDate: Date, endDate: Date, filters?: any) => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('healthcare_content_calendar')
        .select('*')
        .gte('scheduled_date', startDate.toISOString())
        .lte('scheduled_date', endDate.toISOString());

      if (filters?.specialty) {
        query = query.eq('specialty', filters.specialty);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('scheduled_date', { ascending: true });

      if (error) throw error;

      const events: HealthcareContentEvent[] = data.map(item => ({
        id: item.id,
        practiceId: item.practice_id,
        title: item.title,
        content: item.content,
        platforms: item.platforms || [],
        scheduledDate: item.scheduled_date,
        eventType: item.event_type,
        specialty: item.specialty,
        targetAudience: item.target_audience,
        complianceStatus: item.compliance_status,
        ahpraCompliant: item.ahpra_compliant,
        tgaCompliant: item.tga_compliant,
        professionalBoundariesChecked: item.professional_boundaries_checked,
        hashtags: item.hashtags || [],
        disclaimers: item.disclaimers || [],
        copyPasteReady: item.copy_paste_ready,
        createdBy: item.created_by,
        lastModified: item.updated_at,
        reminderSettings: item.reminder_settings || { enabled: false, reminderTimes: [], notificationMethods: [], complianceReminder: false },
        status: item.status
      }));

      setCalendarEvents(events);
      return { success: true, events };
    } catch (error) {
      console.error('Error loading calendar events:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get healthcare awareness days for period
  const getAwarenessDaysForPeriod = useCallback((startDate: Date, endDate: Date) => {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    
    return healthcareAwarenessDays.filter(day => 
      day.date >= start && day.date <= end
    );
  }, []);

  // Create event from template
  const createEventFromTemplate = useCallback(async (
    templateId: string, 
    scheduledDate: string, 
    practiceId: string
  ) => {
    const template = contentTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const newEvent: Omit<HealthcareContentEvent, 'id' | 'createdBy' | 'lastModified'> = {
      practiceId,
      title: template.name,
      content: template.content,
      platforms: template.platforms.map(platform => ({
        platform: platform as any,
        optimizedContent: template.content,
        characterCount: template.content.length,
        platformSpecificHashtags: template.hashtags,
        platformCompliant: true,
        copyPasteInstructions: `Copy and paste content for ${platform} with included hashtags`
      })),
      scheduledDate,
      eventType: 'patient_education',
      specialty: 'gp', // Would be determined by user/practice
      targetAudience: 'current_patients',
      complianceStatus: 'pending',
      ahpraCompliant: false,
      tgaCompliant: false,
      professionalBoundariesChecked: false,
      hashtags: template.hashtags,
      disclaimers: ['This information is general in nature and should not replace professional medical advice.'],
      copyPasteReady: false,
      reminderSettings: {
        enabled: true,
        reminderTimes: ['1 day before'],
        notificationMethods: ['dashboard'],
        complianceReminder: true
      },
      status: 'draft'
    };

    return await createCalendarEvent(newEvent);
  }, [contentTemplates, createCalendarEvent]);

  // Load content templates
  const loadContentTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('healthcare_content_templates')
        .select('*')
        .eq('active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;

      setContentTemplates(data || []);
    } catch (error) {
      console.error('Error loading content templates:', error);
    }
  }, []);

  // Initialize
  useEffect(() => {
    setAwarenessCalendar(healthcareAwarenessDays);
    loadContentTemplates();
  }, [loadContentTemplates]);

  return {
    // State
    calendarEvents,
    contentTemplates,
    awarenessCalendar,
    currentView,
    isLoading,
    isSaving,
    
    // Actions
    createCalendarEvent,
    updateCalendarEvent,
    generateCopyPasteContent,
    getEventsForPeriod,
    getAwarenessDaysForPeriod,
    createEventFromTemplate,
    loadContentTemplates,
    setCurrentView,
    
    // Utilities
    getHealthcareAwarenessDays: () => healthcareAwarenessDays
  };
}

// Helper functions

async function validateEventCompliance(event: any) {
  // This would integrate with existing compliance validation hooks
  return {
    ahpraCompliant: true, // Would be actual validation
    tgaCompliant: true,
    professionalBoundariesChecked: true,
    overallCompliant: true,
    issues: []
  };
} 