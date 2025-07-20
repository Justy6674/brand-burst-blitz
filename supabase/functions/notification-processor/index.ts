import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // This function runs on a schedule to process notifications
    console.log('Processing notification queue...');

    // Get pending notifications that are due
    const now = new Date().toISOString();
    const { data: pendingNotifications, error } = await supabase
      .from('notification_queue')
      .select(`
        *,
        calendar_events(title, description, start_datetime)
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .lt('attempts', 3)
      .order('scheduled_for', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching pending notifications:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch notifications' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processed = 0;
    let failed = 0;

    for (const notification of pendingNotifications || []) {
      try {
        let notificationSent = false;

        switch (notification.notification_type) {
          case 'email':
            // Send email notification
            notificationSent = await sendEmailNotification(notification);
            break;
            
          case 'push':
            // Send push notification
            notificationSent = await sendPushNotification(notification);
            break;
            
          case 'sms':
            // Send SMS notification
            notificationSent = await sendSMSNotification(notification);
            break;
            
          case 'in_app':
            // Create in-app notification
            notificationSent = await createInAppNotification(supabase, notification);
            break;
            
          default:
            console.error('Unknown notification type:', notification.notification_type);
        }

        // Update notification status
        const updateData = notificationSent 
          ? { status: 'sent', last_attempt_at: new Date().toISOString() }
          : { 
              attempts: notification.attempts + 1,
              last_attempt_at: new Date().toISOString(),
              status: notification.attempts >= 2 ? 'failed' : 'pending',
              error_message: 'Failed to send notification'
            };

        await supabase
          .from('notification_queue')
          .update(updateData)
          .eq('id', notification.id);

        if (notificationSent) {
          processed++;
        } else {
          failed++;
        }

      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        
        await supabase
          .from('notification_queue')
          .update({
            attempts: notification.attempts + 1,
            last_attempt_at: new Date().toISOString(),
            status: notification.attempts >= 2 ? 'failed' : 'pending',
            error_message: error.message
          })
          .eq('id', notification.id);
          
        failed++;
      }
    }

    console.log(`Notification processing complete. Processed: ${processed}, Failed: ${failed}`);

    return new Response(
      JSON.stringify({ 
        processed, 
        failed, 
        total: pendingNotifications?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Notification processor error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

async function sendEmailNotification(notification: any): Promise<boolean> {
  try {
    // This would integrate with your email service (Resend, SendGrid, etc.)
    console.log('Sending email notification:', notification.message_data);
    
    // For now, just log and return true
    // In production, implement actual email sending
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

async function sendPushNotification(notification: any): Promise<boolean> {
  try {
    // This would integrate with Web Push API
    console.log('Sending push notification:', notification.message_data);
    
    // For now, just log and return true
    // In production, implement actual push notifications
    return true;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return false;
  }
}

async function sendSMSNotification(notification: any): Promise<boolean> {
  try {
    // This would integrate with Twilio or similar SMS service
    console.log('Sending SMS notification:', notification.message_data);
    
    // For now, just log and return true
    // In production, implement actual SMS sending
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

async function createInAppNotification(supabase: any, notification: any): Promise<boolean> {
  try {
    // Create in-app notification record
    const { error } = await supabase
      .from('in_app_notifications')
      .insert({
        user_id: notification.user_id,
        title: notification.message_data.title,
        message: notification.message_data.message,
        type: 'calendar_reminder',
        read: false,
        metadata: {
          event_id: notification.event_id,
          notification_id: notification.id
        }
      });

    return !error;
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
    return false;
  }
}

serve(handler);