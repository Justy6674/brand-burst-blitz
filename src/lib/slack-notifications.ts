import { supabase } from '@/integrations/supabase/client';

export interface SlackNotificationData {
  type: 'content_approval' | 'compliance_alert' | 'content_approved' | 'weekly_report' | 'general';
  message: string;
  channel?: string;
  content_type?: string;
  compliance_score?: number;
  violation_type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  platform?: string;
  approval_link?: string;
  content_count?: number;
  avg_compliance?: number;
}

/**
 * Send a Slack notification for healthcare-related events
 * This function integrates with your existing notification system
 */
export async function sendSlackNotification(
  userId: string,
  notificationData: SlackNotificationData,
  scheduledFor?: Date
): Promise<boolean> {
  try {
    // Add notification to the queue - your existing notification processor will handle it
    const { error } = await supabase
      .from('notification_queue')
      .insert({
        user_id: userId,
        notification_type: 'slack',
        message_data: notificationData,
        scheduled_for: scheduledFor ? scheduledFor.toISOString() : new Date().toISOString(),
        status: 'pending',
        attempts: 0
      });

    if (error) {
      console.error('Failed to queue Slack notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}

/**
 * Predefined notification helpers for common healthcare scenarios
 */
export const HealthcareSlackNotifications = {
  /**
   * Notify when AI-generated content needs owner approval
   */
  contentNeedsApproval: async (
    userId: string, 
    contentType: string, 
    complianceScore: number,
    approvalLink?: string
  ) => {
    return sendSlackNotification(userId, {
      type: 'content_approval',
      message: `New ${contentType.toLowerCase()} content has been generated and requires your review before publishing.`,
      content_type: contentType,
      compliance_score: complianceScore,
      approval_link: approvalLink,
      channel: '#content-approvals'
    });
  },

  /**
   * Alert about AHPRA compliance violations
   */
  complianceViolation: async (
    userId: string,
    violationType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string
  ) => {
    return sendSlackNotification(userId, {
      type: 'compliance_alert',
      message,
      violation_type: violationType,
      severity,
      channel: '#compliance-alerts'
    });
  },

  /**
   * Confirm content has been approved and is ready to copy/paste
   */
  contentApproved: async (
    userId: string,
    platform: string,
    complianceScore: number
  ) => {
    return sendSlackNotification(userId, {
      type: 'content_approved',
      message: `Content approved with ${complianceScore}/100 compliance score. Ready to copy and paste to ${platform}.`,
      platform,
      compliance_score: complianceScore,
      channel: '#content-approvals'
    });
  },

  /**
   * Send weekly performance report
   */
  weeklyReport: async (
    userId: string,
    contentCount: number,
    avgCompliance: number,
    additionalMetrics?: Record<string, any>
  ) => {
    return sendSlackNotification(userId, {
      type: 'weekly_report',
      message: `Your weekly healthcare marketing summary is ready.`,
      content_count: contentCount,
      avg_compliance: avgCompliance,
      channel: '#marketing-reports'
    });
  },

  /**
   * General healthcare practice notification
   */
  general: async (
    userId: string,
    message: string,
    channel?: string
  ) => {
    return sendSlackNotification(userId, {
      type: 'general',
      message,
      channel: channel || '#general'
    });
  }
};

/**
 * Check if user has Slack configured
 */
export async function hasSlackConfigured(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('slack_webhook_url')
      .eq('user_id', userId)
      .single();

    if (error) return false;
    return !!(data?.slack_webhook_url);
  } catch (error) {
    return false;
  }
}

/**
 * Get user's Slack configuration
 */
export async function getSlackConfiguration(userId: string) {
  try {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('slack_webhook_url, slack_settings')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Test Slack webhook connectivity
 */
export async function testSlackWebhook(webhookUrl: string): Promise<boolean> {
  try {
    const testMessage = {
      username: "Healthcare Assistant",
      icon_emoji: ":hospital:",
      text: "🧪 Testing Slack integration for your healthcare practice",
      attachments: [{
        color: "good",
        title: "✅ Connection Test",
        text: "If you can see this message, your Slack integration is working correctly!",
        fields: [
          {
            title: "Status",
            value: "Connected",
            short: true
          },
          {
            title: "Date",
            value: new Date().toLocaleDateString(),
            short: true
          }
        ]
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    return response.ok;
  } catch (error) {
    console.error('Slack webhook test failed:', error);
    return false;
  }
}