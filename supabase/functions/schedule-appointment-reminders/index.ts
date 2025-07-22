import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReminderRequest {
  eventId: string;
  eventTime: string;
  attendees: Array<{
    email: string;
    phone?: string;
    name: string;
    role: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { eventId, eventTime, attendees }: ReminderRequest = await req.json();

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('unified_calendar_events')
      .select(`
        *,
        business_profiles(business_name, practice_name, website_url)
      `)
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    // Get business reminder settings
    const { data: businessSettings, error: settingsError } = await supabase
      .from('business_calendar_settings')
      .select('reminder_settings')
      .eq('business_id', event.business_id)
      .single();

    if (settingsError) {
      console.warn('Business settings not found, using defaults');
    }

    const reminderSettings = businessSettings?.reminder_settings || {
      defaultReminders: [
        { method: 'email', minutesBefore: 1440 }, // 24 hours
        { method: 'sms', minutesBefore: 60 }      // 1 hour
      ],
      customMessages: {
        email: 'You have an appointment scheduled for {datetime} with {practice}. Please arrive 10 minutes early.',
        sms: 'Appointment reminder: {datetime} at {practice}. Reply CONFIRM or CANCEL.'
      }
    };

    const appointmentDateTime = new Date(eventTime);
    const remindersScheduled = [];

    // Schedule reminders for each attendee
    for (const attendee of attendees) {
      if (attendee.role !== 'patient') continue; // Only send reminders to patients

      for (const defaultReminder of reminderSettings.defaultReminders) {
        const reminderTime = new Date(appointmentDateTime.getTime() - (defaultReminder.minutesBefore * 60 * 1000));
        
        // Don't schedule reminders in the past
        if (reminderTime <= new Date()) continue;

        // Generate AHPRA-compliant message
        const messageTemplate = generateAHPRACompliantMessage(
          defaultReminder.method,
          event,
          reminderSettings.customMessages[defaultReminder.method]
        );

        const reminderData = {
          event_id: eventId,
          reminder_type: 'appointment_reminder',
          scheduled_for: reminderTime.toISOString(),
          message_template: messageTemplate,
          recipient_email: attendee.email,
          recipient_phone: attendee.phone,
          delivery_method: defaultReminder.method,
          status: 'scheduled'
        };

        const { data: scheduledReminder, error: reminderError } = await supabase
          .from('automated_reminder_schedule')
          .insert(reminderData)
          .select()
          .single();

        if (reminderError) {
          console.error('Error scheduling reminder:', reminderError);
          continue;
        }

        remindersScheduled.push(scheduledReminder);

        // Schedule immediate confirmation email if it's a new appointment
        if (defaultReminder.method === 'email' && defaultReminder.minutesBefore === 1440) {
          await scheduleConfirmationEmail(supabase, eventId, attendee, event);
        }
      }
    }

    // Schedule follow-up reminder if appointment requires follow-up
    if (event.follow_up?.required) {
      await scheduleFollowUpReminder(supabase, eventId, appointmentDateTime, attendees);
    }

    // Log reminder scheduling
    await supabase
      .from('calendar_analytics')
      .upsert({
        business_id: event.business_id,
        metric_date: new Date().toISOString().split('T')[0],
        reminders_sent: supabase.sql`COALESCE(reminders_sent, 0) + ${remindersScheduled.length}`
      }, {
        onConflict: 'business_id, metric_date'
      });

    return new Response(JSON.stringify({
      success: true,
      remindersScheduled: remindersScheduled.length,
      reminders: remindersScheduled.map(r => ({
        id: r.id,
        type: r.reminder_type,
        scheduledFor: r.scheduled_for,
        method: r.delivery_method,
        recipient: r.recipient_email || r.recipient_phone
      }))
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Reminder scheduling error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to schedule reminders',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateAHPRACompliantMessage(
  method: string,
  event: any,
  template: string
): string {
  const practiceName = event.business_profiles?.practice_name || event.business_profiles?.business_name || 'Healthcare Practice';
  const appointmentDate = new Date(event.start_time).toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const appointmentTime = new Date(event.start_time).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  let message = template
    .replace('{datetime}', `${appointmentDate} at ${appointmentTime}`)
    .replace('{practice}', practiceName)
    .replace('{date}', appointmentDate)
    .replace('{time}', appointmentTime);

  // Add AHPRA compliance footer
  const complianceFooter = method === 'email' 
    ? `\n\nThis appointment confirmation is sent in accordance with AHPRA guidelines. If you have any concerns about your upcoming appointment, please contact our practice directly. For urgent medical concerns, please call 000 or visit your nearest emergency department.`
    : ` For urgent concerns call 000.`;

  message += complianceFooter;

  // Add practice contact information
  if (event.business_profiles?.website_url) {
    const contactInfo = method === 'email'
      ? `\n\nPractice Website: ${event.business_profiles.website_url}`
      : ` Visit ${event.business_profiles.website_url}`;
    message += contactInfo;
  }

  return message;
}

async function scheduleConfirmationEmail(
  supabase: any,
  eventId: string,
  attendee: any,
  event: any
): Promise<void> {
  const confirmationMessage = `
Dear ${attendee.name},

Your appointment has been confirmed:

Date: ${new Date(event.start_time).toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
Time: ${new Date(event.start_time).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })}
Location: ${event.location || 'Practice Location'}
Type: ${event.appointment_type || 'Consultation'}

Please arrive 10 minutes early for your appointment. If you need to reschedule or cancel, please contact us at least 24 hours in advance.

${event.preparation?.patientInstructions ? `Preparation Instructions:\n${event.preparation.patientInstructions}\n` : ''}

This confirmation is sent in accordance with AHPRA professional standards. For any questions or concerns, please contact our practice directly.

Best regards,
${event.business_profiles?.practice_name || 'Healthcare Team'}
`;

  await supabase
    .from('automated_reminder_schedule')
    .insert({
      event_id: eventId,
      reminder_type: 'appointment_confirmation',
      scheduled_for: new Date().toISOString(), // Send immediately
      message_template: confirmationMessage,
      recipient_email: attendee.email,
      delivery_method: 'email',
      status: 'scheduled'
    });
}

async function scheduleFollowUpReminder(
  supabase: any,
  eventId: string,
  appointmentDateTime: Date,
  attendees: any[]
): Promise<void> {
  // Schedule follow-up reminder 1 day after appointment
  const followUpTime = new Date(appointmentDateTime.getTime() + (24 * 60 * 60 * 1000));
  
  for (const attendee of attendees) {
    if (attendee.role !== 'patient') continue;

    const followUpMessage = `
Dear ${attendee.name},

We hope your recent appointment went well. As part of our commitment to your ongoing care, we wanted to follow up with you.

If you have any questions about your treatment, medications, or next steps, please don't hesitate to contact our practice.

${attendee.email ? 'You can reply to this email or call our practice directly.' : 'Please call our practice directly if you have any concerns.'}

This follow-up is provided in accordance with AHPRA guidelines for continuity of care.

Best regards,
Healthcare Team
`;

    await supabase
      .from('automated_reminder_schedule')
      .insert({
        event_id: eventId,
        reminder_type: 'follow_up',
        scheduled_for: followUpTime.toISOString(),
        message_template: followUpMessage,
        recipient_email: attendee.email,
        delivery_method: 'email',
        status: 'scheduled'
      });
  }
} 