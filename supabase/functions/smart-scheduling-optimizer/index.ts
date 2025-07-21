import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OptimizationRequest {
  duration: number;
  businessId: string;
  preferredDates: string[];
  attendeeEmails?: string[];
  existingEvents: any[];
  appointmentType?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      duration,
      businessId,
      preferredDates,
      attendeeEmails = [],
      existingEvents,
      appointmentType = 'consultation',
      priority = 'medium'
    }: OptimizationRequest = await req.json();

    // Get business calendar settings
    const { data: businessSettings, error: settingsError } = await supabase
      .from('business_calendar_settings')
      .select('*')
      .eq('business_id', businessId)
      .single();

    if (settingsError || !businessSettings) {
      throw new Error('Business calendar settings not found');
    }

    const workingHours = businessSettings.working_hours;
    const bufferTime = businessSettings.buffer_time_minutes || 10;

    // Find optimal time slots
    const optimalSlots = [];
    
    for (const dateStr of preferredDates.slice(0, 7)) { // Limit to 7 days for performance
      const date = new Date(dateStr);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
      
      if (!workingHours[dayName]?.isWorkingDay) continue;
      
      const dayStart = new Date(date);
      const [startHour, startMinute] = workingHours[dayName].start.split(':').map(Number);
      dayStart.setHours(startHour, startMinute, 0, 0);
      
      const dayEnd = new Date(date);
      const [endHour, endMinute] = workingHours[dayName].end.split(':').map(Number);
      dayEnd.setHours(endHour, endMinute, 0, 0);
      
      // Get existing appointments for this day
      const dayEvents = existingEvents.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.toDateString() === date.toDateString();
      });
      
      // Find available slots
      const availableSlots = findAvailableSlots(
        dayStart,
        dayEnd,
        duration,
        bufferTime,
        dayEvents
      );
      
      // Score slots based on various factors
      const scoredSlots = availableSlots.map(slot => ({
        time: slot,
        score: calculateSlotScore(slot, appointmentType, priority, businessSettings)
      }));
      
      // Add top 3 slots for this day
      optimalSlots.push(...scoredSlots.sort((a, b) => b.score - a.score).slice(0, 3));
    }

    // Sort all slots by score and return top 10
    const topSlots = optimalSlots
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(slot => slot.time.toISOString());

    // Log optimization request
    await supabase
      .from('calendar_analytics')
      .upsert({
        business_id: businessId,
        metric_date: new Date().toISOString().split('T')[0],
        optimization_requests: supabase.sql`COALESCE(optimization_requests, 0) + 1`
      }, {
        onConflict: 'business_id, metric_date'
      });

    return new Response(JSON.stringify({
      success: true,
      optimalSlots: topSlots,
      totalSlotsFound: optimalSlots.length,
      recommendedSlot: topSlots[0],
      optimizationFactors: {
        workingHours: workingHours,
        bufferTime: bufferTime,
        appointmentType: appointmentType,
        priority: priority
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Smart scheduling error:', error);
    return new Response(JSON.stringify({ 
      error: 'Scheduling optimization failed',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function findAvailableSlots(
  dayStart: Date,
  dayEnd: Date,
  duration: number,
  bufferTime: number,
  existingEvents: any[]
): Date[] {
  const slots = [];
  const slotInterval = 15; // 15-minute intervals
  
  let currentTime = new Date(dayStart);
  
  while (currentTime.getTime() + (duration * 60 * 1000) <= dayEnd.getTime()) {
    const slotEnd = new Date(currentTime.getTime() + (duration * 60 * 1000));
    
    // Check if slot conflicts with existing events
    const hasConflict = existingEvents.some(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      const bufferStart = new Date(eventStart.getTime() - (bufferTime * 60 * 1000));
      const bufferEnd = new Date(eventEnd.getTime() + (bufferTime * 60 * 1000));
      
      return (
        (currentTime >= bufferStart && currentTime < bufferEnd) ||
        (slotEnd > bufferStart && slotEnd <= bufferEnd) ||
        (currentTime <= bufferStart && slotEnd >= bufferEnd)
      );
    });
    
    if (!hasConflict) {
      slots.push(new Date(currentTime));
    }
    
    currentTime = new Date(currentTime.getTime() + (slotInterval * 60 * 1000));
  }
  
  return slots;
}

function calculateSlotScore(
  slot: Date,
  appointmentType: string,
  priority: string,
  businessSettings: any
): number {
  let score = 100; // Base score
  
  const hour = slot.getHours();
  const minute = slot.getMinutes();
  
  // Time preferences based on appointment type
  if (appointmentType === 'consultation') {
    // Prefer morning slots for consultations
    if (hour >= 9 && hour <= 11) score += 20;
    else if (hour >= 14 && hour <= 16) score += 10;
  } else if (appointmentType === 'follow_up') {
    // Prefer afternoon for follow-ups
    if (hour >= 14 && hour <= 17) score += 15;
  } else if (appointmentType === 'procedure') {
    // Prefer mid-morning for procedures
    if (hour >= 10 && hour <= 12) score += 25;
  }
  
  // Priority adjustments
  if (priority === 'urgent') {
    // Urgent appointments prefer earliest available
    const now = new Date();
    const hoursFromNow = (slot.getTime() - now.getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 50 - hoursFromNow); // Higher score for sooner slots
  }
  
  // Prefer round hours and half hours
  if (minute === 0) score += 5;
  else if (minute === 30) score += 3;
  
  // Avoid very early or very late slots
  if (hour < 8 || hour > 18) score -= 20;
  
  // Friday afternoon penalty (people prefer other times)
  if (slot.getDay() === 5 && hour >= 15) score -= 10;
  
  // Monday morning boost (fresh start of week)
  if (slot.getDay() === 1 && hour >= 9 && hour <= 11) score += 10;
  
  return score;
} 