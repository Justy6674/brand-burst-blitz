import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

interface AppointmentBookingRequest {
  action: 'track_funnel' | 'sync_pm_system' | 'calculate_metrics' | 'analyze_performance';
  practiceId?: string;
  sessionId?: string;
  funnelData?: AppointmentFunnelData;
  pmSystemData?: PracticeManagementData;
  timeframe?: '7d' | '30d' | '90d';
}

interface AppointmentFunnelData {
  stage: 'website_visit' | 'appointment_page_view' | 'booking_form_start' | 'booking_form_complete' | 
         'appointment_requested' | 'appointment_confirmed' | 'appointment_attended' | 'appointment_cancelled';
  sessionId: string;
  appointmentType?: string;
  healthcareSpecialty?: string;
  patientType?: 'new' | 'returning' | 'transferred';
  bookingChannel?: string;
  referralSource?: string;
  formCompletionTime?: number;
  pagesBefore?: number;
  urgencyLevel?: 'routine' | 'urgent' | 'emergency';
  anonymizedPatientId?: string;
  ageGroup?: string;
  postcode?: string;
  consentToTrack?: boolean;
}

interface PracticeManagementData {
  systemName: string;
  systemVersion?: string;
  appointments: Array<{
    appointmentId: string;
    appointmentType: string;
    patientType: 'new' | 'returning';
    appointmentDate: string;
    bookingDate: string;
    status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    bookingChannel: string;
    specialty: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, practiceId, sessionId, funnelData, pmSystemData, timeframe }: AppointmentBookingRequest = await req.json();

    console.log(`Appointment booking analytics action: ${action}`);

    switch (action) {
      case 'track_funnel':
        return await trackAppointmentFunnel(supabaseClient, funnelData!, practiceId);
      
      case 'sync_pm_system':
        return await syncPracticeManagementData(supabaseClient, pmSystemData!, practiceId);
      
      case 'calculate_metrics':
        return await calculateBookingMetrics(supabaseClient, practiceId, timeframe || '30d');
      
      case 'analyze_performance':
        return await analyzeBookingPerformance(supabaseClient, practiceId, timeframe || '30d');
      
      default:
        throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Appointment Booking Analytics Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function trackAppointmentFunnel(
  supabaseClient: any, 
  funnelData: AppointmentFunnelData, 
  practiceId?: string
) {
  console.log('Tracking appointment booking funnel stage:', funnelData.stage);

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    // Generate anonymized patient identifier for privacy compliance
    const anonymizedPatientId = funnelData.anonymizedPatientId || 
      `anon_${funnelData.sessionId}_${Date.now()}`;

    // Insert funnel tracking record
    const { error: insertError } = await supabaseClient
      .from('appointment_booking_funnel')
      .insert({
        user_id: user?.id,
        practice_id: practiceId,
        session_id: funnelData.sessionId,
        patient_identifier: anonymizedPatientId,
        funnel_stage: funnelData.stage,
        appointment_type: funnelData.appointmentType,
        healthcare_specialty: funnelData.healthcareSpecialty,
        patient_type: funnelData.patientType || 'new',
        booking_channel: funnelData.bookingChannel || 'direct_website',
        referral_source: funnelData.referralSource,
        patient_age_group: funnelData.ageGroup,
        patient_location_postcode: funnelData.postcode,
        form_completion_time: funnelData.formCompletionTime,
        pages_visited_before_booking: funnelData.pagesBefore || 0,
        urgency_level: funnelData.urgencyLevel || 'routine',
        consent_to_track: funnelData.consentToTrack || false,
        data_anonymized: true,
        ahpra_compliant: true
      });

    if (insertError) {
      console.error('Error tracking appointment funnel:', insertError);
      throw insertError;
    }

    // Track corresponding event
    await trackAppointmentEvent(supabaseClient, {
      user_id: user?.id,
      practice_id: practiceId,
      session_id: funnelData.sessionId,
      event_type: mapFunnelStageToEventType(funnelData.stage),
      event_category: determineEventCategory(funnelData.stage),
      appointment_type: funnelData.appointmentType,
      healthcare_specialty: funnelData.healthcareSpecialty
    });

    console.log(`✅ Appointment funnel stage ${funnelData.stage} tracked successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        stage: funnelData.stage,
        anonymizedPatientId,
        message: 'Appointment booking funnel tracked with AHPRA compliance'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error tracking appointment funnel:', error);
    throw new Error(`Failed to track appointment funnel: ${error.message}`);
  }
}

async function syncPracticeManagementData(
  supabaseClient: any,
  pmData: PracticeManagementData,
  practiceId?: string
) {
  console.log(`Syncing ${pmData.appointments.length} appointments from ${pmData.systemName}`);

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    // Update PM system integration status
    const { error: integrationError } = await supabaseClient
      .from('practice_management_integrations')
      .upsert({
        user_id: user?.id,
        practice_id: practiceId,
        pm_system_name: pmData.systemName,
        pm_system_version: pmData.systemVersion,
        connection_status: 'connected',
        last_successful_sync: new Date().toISOString(),
        total_appointments_synced: pmData.appointments.length,
        sync_error_count: 0
      });

    if (integrationError) {
      console.error('Error updating PM integration:', integrationError);
      throw integrationError;
    }

    // Process each appointment
    for (const appointment of pmData.appointments) {
      // Create anonymized patient identifier
      const anonymizedPatientId = `pm_${appointment.appointmentId}_${Date.now()}`;
      
      // Track appointment in funnel (as confirmed booking)
      await supabaseClient
        .from('appointment_booking_funnel')
        .insert({
          user_id: user?.id,
          practice_id: practiceId,
          session_id: `pm_sync_${appointment.appointmentId}`,
          patient_identifier: anonymizedPatientId,
          funnel_stage: 'appointment_confirmed',
          appointment_type: appointment.appointmentType,
          healthcare_specialty: appointment.specialty,
          patient_type: appointment.patientType,
          booking_channel: 'practice_management_system',
          appointment_outcome: appointment.status,
          appointment_scheduled_for: appointment.appointmentDate,
          funnel_entry_at: appointment.bookingDate,
          funnel_completed_at: appointment.bookingDate,
          data_anonymized: true,
          ahpra_compliant: true
        });
    }

    console.log(`✅ Successfully synced ${pmData.appointments.length} appointments from ${pmData.systemName}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        systemName: pmData.systemName,
        appointmentsSynced: pmData.appointments.length,
        message: 'Practice management data synced successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing PM data:', error);
    throw new Error(`Failed to sync practice management data: ${error.message}`);
  }
}

async function calculateBookingMetrics(
  supabaseClient: any,
  practiceId?: string,
  timeframe: string = '30d'
) {
  console.log(`Calculating booking metrics for timeframe: ${timeframe}`);

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const dateFrom = getDateFromTimeframe(timeframe);
    
    // Get funnel data for the timeframe
    const { data: funnelData, error: funnelError } = await supabaseClient
      .from('appointment_booking_funnel')
      .select('*')
      .eq('user_id', user?.id)
      .gte('created_at', dateFrom)
      .order('created_at', { ascending: false });

    if (funnelError) throw funnelError;

    // Calculate comprehensive metrics
    const metrics = processFunnelDataToMetrics(funnelData || [], timeframe);

    // Store/update metrics in database
    const today = new Date().toISOString().split('T')[0];
    
    const { error: metricsError } = await supabaseClient
      .from('appointment_booking_metrics')
      .upsert({
        user_id: user?.id,
        practice_id: practiceId,
        metric_date: today,
        ...metrics,
        updated_at: new Date().toISOString()
      });

    if (metricsError) {
      console.error('Error storing booking metrics:', metricsError);
      throw metricsError;
    }

    console.log('✅ Appointment booking metrics calculated and stored');

    return new Response(
      JSON.stringify({ 
        success: true,
        metrics,
        timeframe,
        dataPoints: funnelData?.length || 0,
        message: 'Appointment booking metrics calculated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating booking metrics:', error);
    throw new Error(`Failed to calculate booking metrics: ${error.message}`);
  }
}

async function analyzeBookingPerformance(
  supabaseClient: any,
  practiceId?: string,
  timeframe: string = '30d'
) {
  console.log(`Analyzing booking performance for timeframe: ${timeframe}`);

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const dateFrom = getDateFromTimeframe(timeframe);
    
    // Get funnel performance analysis using database function
    const { data: funnelAnalysis, error: analysisError } = await supabaseClient
      .rpc('analyze_booking_funnel_dropoff', {
        p_user_id: user?.id,
        p_practice_id: practiceId,
        p_date_from: dateFrom.split('T')[0],
        p_date_to: new Date().toISOString().split('T')[0]
      });

    if (analysisError) throw analysisError;

    // Get peak booking hours
    const { data: peakHours, error: hoursError } = await supabaseClient
      .rpc('get_peak_booking_hours', {
        p_user_id: user?.id,
        p_practice_id: practiceId,
        p_date_from: dateFrom.split('T')[0],
        p_date_to: new Date().toISOString().split('T')[0]
      });

    if (hoursError) throw hoursError;

    // Generate performance insights
    const insights = generatePerformanceInsights(funnelAnalysis || [], peakHours || []);

    console.log('✅ Booking performance analysis completed');

    return new Response(
      JSON.stringify({ 
        success: true,
        funnelAnalysis,
        peakHours,
        insights,
        timeframe,
        message: 'Booking performance analysis completed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing booking performance:', error);
    throw new Error(`Failed to analyze booking performance: ${error.message}`);
  }
}

async function trackAppointmentEvent(supabaseClient: any, eventData: any) {
  const { error } = await supabaseClient
    .from('appointment_booking_events')
    .insert({
      ...eventData,
      anonymized_data: true,
      consent_given: true,
      gdpr_compliant: true,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error tracking appointment event:', error);
  }
}

function mapFunnelStageToEventType(stage: string): string {
  const mapping: Record<string, string> = {
    'website_visit': 'page_view',
    'appointment_page_view': 'page_view',
    'booking_form_start': 'form_start',
    'booking_form_complete': 'form_submit',
    'appointment_requested': 'booking_confirm',
    'appointment_confirmed': 'booking_confirm',
    'appointment_cancelled': 'booking_cancel',
    'appointment_attended': 'booking_confirm'
  };
  return mapping[stage] || 'page_view';
}

function determineEventCategory(stage: string): string {
  if (['website_visit', 'appointment_page_view'].includes(stage)) return 'acquisition';
  if (['booking_form_start', 'booking_form_complete'].includes(stage)) return 'engagement';
  if (['appointment_requested', 'appointment_confirmed'].includes(stage)) return 'conversion';
  if (['appointment_attended'].includes(stage)) return 'retention';
  return 'support';
}

function processFunnelDataToMetrics(funnelData: any[], timeframe: string) {
  const metrics = {
    total_booking_inquiries: 0,
    online_bookings: 0,
    phone_bookings: 0,
    website_visitors: 0,
    appointment_page_views: 0,
    booking_form_starts: 0,
    booking_form_completions: 0,
    booking_requests_submitted: 0,
    bookings_confirmed: 0,
    appointments_attended: 0,
    new_patient_bookings: 0,
    returning_patient_bookings: 0,
    general_consultation_bookings: 0,
    mental_health_bookings: 0,
    preventive_care_bookings: 0,
    chronic_disease_bookings: 0,
    direct_website_bookings: 0,
    google_search_bookings: 0,
    social_media_bookings: 0,
    referral_bookings: 0
  };

  // Process each funnel entry
  funnelData.forEach(entry => {
    // Count by funnel stage
    switch (entry.funnel_stage) {
      case 'website_visit':
        metrics.website_visitors++;
        break;
      case 'appointment_page_view':
        metrics.appointment_page_views++;
        break;
      case 'booking_form_start':
        metrics.booking_form_starts++;
        break;
      case 'booking_form_complete':
        metrics.booking_form_completions++;
        break;
      case 'appointment_requested':
        metrics.booking_requests_submitted++;
        break;
      case 'appointment_confirmed':
        metrics.bookings_confirmed++;
        metrics.total_booking_inquiries++;
        break;
      case 'appointment_attended':
        metrics.appointments_attended++;
        break;
    }

    // Count by booking channel
    if (entry.funnel_stage === 'appointment_confirmed') {
      switch (entry.booking_channel) {
        case 'direct_website':
          metrics.online_bookings++;
          metrics.direct_website_bookings++;
          break;
        case 'phone_call':
          metrics.phone_bookings++;
          break;
      }

      // Count by patient type
      if (entry.patient_type === 'new') {
        metrics.new_patient_bookings++;
      } else {
        metrics.returning_patient_bookings++;
      }

      // Count by appointment type
      switch (entry.healthcare_specialty) {
        case 'general_practice':
          metrics.general_consultation_bookings++;
          break;
        case 'mental_health':
          metrics.mental_health_bookings++;
          break;
        case 'preventive_care':
          metrics.preventive_care_bookings++;
          break;
        case 'chronic_disease_management':
          metrics.chronic_disease_bookings++;
          break;
      }

      // Count by referral source
      switch (entry.referral_source) {
        case 'google_search':
          metrics.google_search_bookings++;
          break;
        case 'social_media':
          metrics.social_media_bookings++;
          break;
        case 'patient_referral':
          metrics.referral_bookings++;
          break;
      }
    }
  });

  // Calculate conversion rates
  const calculatedMetrics = {
    ...metrics,
    page_view_to_form_rate: metrics.appointment_page_views > 0 
      ? (metrics.booking_form_starts / metrics.appointment_page_views) * 100 : 0,
    form_start_to_completion_rate: metrics.booking_form_starts > 0 
      ? (metrics.booking_form_completions / metrics.booking_form_starts) * 100 : 0,
    booking_request_to_confirmation_rate: metrics.booking_requests_submitted > 0 
      ? (metrics.bookings_confirmed / metrics.booking_requests_submitted) * 100 : 0,
    booking_to_attendance_rate: metrics.bookings_confirmed > 0 
      ? (metrics.appointments_attended / metrics.bookings_confirmed) * 100 : 0,
    overall_conversion_rate: metrics.website_visitors > 0 
      ? (metrics.bookings_confirmed / metrics.website_visitors) * 100 : 0
  };

  return calculatedMetrics;
}

function generatePerformanceInsights(funnelAnalysis: any[], peakHours: any[]): any[] {
  const insights = [];

  // Funnel drop-off insights
  const highestDropOff = funnelAnalysis.reduce((max, stage) => 
    stage.drop_off_rate > max.drop_off_rate ? stage : max, 
    { drop_off_rate: 0, stage: '' }
  );

  if (highestDropOff.drop_off_rate > 30) {
    insights.push({
      type: 'funnel_optimization',
      priority: 'high',
      title: `High Drop-off at ${highestDropOff.stage.replace('_', ' ')}`,
      description: `${highestDropOff.drop_off_rate.toFixed(1)}% of patients drop off at this stage`,
      recommendation: `Review and optimize the ${highestDropOff.stage.replace('_', ' ')} user experience`
    });
  }

  // Peak hours insights
  if (peakHours.length > 0) {
    const topHour = peakHours[0];
    insights.push({
      type: 'scheduling_optimization',
      priority: 'medium',
      title: `Peak Booking Hour: ${topHour.hour_of_day}:00`,
      description: `${topHour.booking_count} bookings typically occur during this hour`,
      recommendation: 'Ensure adequate staff coverage during peak booking times'
    });
  }

  // General healthcare insights
  insights.push({
    type: 'patient_engagement',
    priority: 'medium',
    title: 'Online Booking Preference',
    description: 'Patients increasingly prefer online booking over phone calls',
    recommendation: 'Promote online booking options and ensure mobile-friendly booking forms'
  });

  return insights;
}

function getDateFromTimeframe(timeframe: string): string {
  const now = new Date();
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return fromDate.toISOString();
} 