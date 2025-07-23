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
            
          case 'slack':
            // Send Slack notification
            notificationSent = await sendSlackNotification(supabase, notification);
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

async function sendSlackNotification(supabase: any, notification: any): Promise<boolean> {
  try {
    // Get practice Slack configuration
    const { data: practiceData, error: practiceError } = await supabase
      .from('business_profiles')
      .select('slack_webhook_url, slack_settings')
      .eq('user_id', notification.user_id)
      .single();

    if (practiceError || !practiceData?.slack_webhook_url) {
      console.log('No Slack webhook configured for user:', notification.user_id);
      return false;
    }

    const messageData = notification.message_data;
    const slackMessage = formatSlackMessage(messageData, notification);

    // Send to Slack webhook
    const response = await fetch(practiceData.slack_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage)
    });

    if (response.ok) {
      console.log('Slack notification sent successfully');
      return true;
    } else {
      console.error('Slack API error:', response.status, await response.text());
      return false;
    }
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    return false;
  }
}

function formatSlackMessage(messageData: any, notification: any) {
  const baseMessage = {
    username: "Healthcare Assistant",
    icon_emoji: ":hospital:",
    channel: messageData.channel || "#general"
  };

  switch (messageData.type) {
    case 'content_approval':
      return {
        ...baseMessage,
        attachments: [{
          color: "warning",
          title: "🏥 Content Requires AHPRA Review",
          text: messageData.message,
          fields: [
            {
              title: "Content Type",
              value: messageData.content_type || "Blog Post",
              short: true
            },
            {
              title: "Compliance Score",
              value: `${messageData.compliance_score || 'N/A'}/100`,
              short: true
            }
          ],
          actions: messageData.approval_link ? [{
            type: "button",
            text: "Review Content",
            url: messageData.approval_link,
            style: "primary"
          }] : undefined
        }]
      };

    case 'compliance_alert':
      return {
        ...baseMessage,
        attachments: [{
          color: "danger",
          title: "⚠️ AHPRA Compliance Alert",
          text: messageData.message,
          fields: [
            {
              title: "Violation Type",
              value: messageData.violation_type || "Content Review Required",
              short: true
            },
            {
              title: "Severity",
              value: messageData.severity || "Medium",
              short: true
            }
          ]
        }]
      };

    case 'content_approved':
      return {
        ...baseMessage,
        attachments: [{
          color: "good",
          title: "✅ Content Approved - Ready to Copy/Paste",
          text: messageData.message,
          fields: [
            {
              title: "Platform",
              value: messageData.platform || "Multiple",
              short: true
            },
            {
              title: "Final Compliance Score",
              value: `${messageData.compliance_score || 'N/A'}/100`,
              short: true
            }
          ]
        }]
      };

    case 'weekly_report':
      return {
        ...baseMessage,
        attachments: [{
          color: "#36a64f",
          title: "📊 Weekly Healthcare Marketing Report",
          text: messageData.message,
          fields: [
            {
              title: "Content Created",
              value: messageData.content_count || "0",
              short: true
            },
            {
              title: "Avg Compliance Score",
              value: `${messageData.avg_compliance || 'N/A'}/100`,
              short: true
            }
          ]
        }]
      };

    default:
      return {
        ...baseMessage,
        text: messageData.message || messageData.title
      };
  }
}

serve(handler);