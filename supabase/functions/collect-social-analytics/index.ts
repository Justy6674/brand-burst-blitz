import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

interface AnalyticsCollectionRequest {
  platforms?: string[];
  forceSync?: boolean;
  practiceId?: string;
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

    const { platforms, forceSync, practiceId }: AnalyticsCollectionRequest = await req.json();

    console.log('Starting enhanced healthcare analytics collection');

    // Get all connected social accounts
    let query = supabaseClient
      .from('social_accounts')
      .select('*')
      .eq('is_active', true);

    if (platforms && platforms.length > 0) {
      query = query.in('platform', platforms);
    }

    const { data: socialAccounts, error: accountsError } = await query;

    if (accountsError) {
      console.error('Error fetching social accounts:', accountsError);
      throw new Error('Failed to fetch social accounts');
    }

    if (!socialAccounts || socialAccounts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No connected social accounts found', accountsProcessed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Collecting healthcare analytics for ${socialAccounts.length} social accounts`);

    const results = [];
    let totalMetricsCollected = 0;

    for (const account of socialAccounts) {
      try {
        console.log(`Collecting analytics for ${account.platform} account: ${account.account_name}`);

        // Check if we should skip recent syncs (unless forced)
        if (!forceSync && account.last_sync_at) {
          const lastSync = new Date(account.last_sync_at);
          const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceSync < 4) { // Skip if synced within last 4 hours for healthcare accounts
            console.log(`Skipping ${account.platform} - synced ${hoursSinceSync.toFixed(1)} hours ago`);
            continue;
          }
        }

        // Collect enhanced platform-specific analytics
        const analyticsData = await collectEnhancedPlatformAnalytics(account, practiceId);
        
        if (analyticsData.length > 0) {
          // Store analytics data with healthcare-specific metrics
          const { error: insertError } = await supabaseClient
            .from('analytics')
            .insert(
              analyticsData.map(metric => ({
                user_id: account.user_id,
                platform: account.platform,
                metrics: metric,
                collected_at: new Date().toISOString(),
                practice_id: practiceId || null
              }))
            );

          if (insertError) {
            console.error(`Error storing analytics for ${account.platform}:`, insertError);
            throw new Error(`Failed to store analytics for ${account.platform}`);
          }

          // Update last sync time
          await supabaseClient
            .from('social_accounts')
            .update({ last_sync_at: new Date().toISOString() })
            .eq('id', account.id);

          totalMetricsCollected += analyticsData.length;
          console.log(`✅ Collected ${analyticsData.length} healthcare metrics for ${account.platform}`);
          
          results.push({
            platform: account.platform,
            account: account.account_name,
            metricsCollected: analyticsData.length,
            status: 'success'
          });
        } else {
          console.log(`⚠️ No analytics data available for ${account.platform}`);
          results.push({
            platform: account.platform,
            account: account.account_name,
            metricsCollected: 0,
            status: 'no_data'
          });
        }

      } catch (error) {
        console.error(`Error collecting analytics for ${account.platform}:`, error);
        results.push({
          platform: account.platform,
          account: account.account_name || 'Unknown',
          metricsCollected: 0,
          status: 'error',
          error: error.message
        });
      }
    }

    const response = {
      message: `Healthcare analytics collection completed`,
      accountsProcessed: socialAccounts.length,
      totalMetricsCollected,
      results,
      practiceId
    };

    console.log('Analytics collection summary:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analytics collection error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Enhanced platform analytics collection with healthcare-specific metrics
async function collectEnhancedPlatformAnalytics(account: any, practiceId?: string): Promise<any[]> {
  switch (account.platform) {
    case 'facebook':
      return await collectEnhancedFacebookAnalytics(account, practiceId);
    case 'instagram':
      return await collectEnhancedInstagramAnalytics(account, practiceId);
    case 'linkedin':
      return await collectLinkedInAnalytics(account);
    case 'twitter':
      return await collectTwitterAnalytics(account);
    default:
      console.log(`Enhanced analytics collection not implemented for ${account.platform}`);
      return [];
  }
}

// Enhanced Facebook analytics with healthcare practice focus
async function collectEnhancedFacebookAnalytics(account: any, practiceId?: string): Promise<any[]> {
  try {
    const accessToken = account.access_token;
    const pageId = account.account_id;
    
    // Enhanced Facebook metrics for healthcare practices
    const insightsUrl = `https://graph.facebook.com/v18.0/${pageId}/insights`;
    const metrics = [
      'page_fans', // Total followers
      'page_fan_adds', // New followers
      'page_fan_removes', // Unfollows
      'page_impressions', // Total reach
      'page_impressions_unique', // Unique reach
      'page_post_engagements', // Total engagement
      'page_posts_impressions', // Post reach
      'page_video_views', // Video views
      'page_actions_post_reactions_total', // Reactions
      'page_content_activity', // Content interactions
      'page_places_checkin_total', // Check-ins (for practices)
      'page_tab_views_login_top', // Page tab views
      'page_cta_clicks_logged_in', // Call-to-action clicks
    ];

    const now = new Date();
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    
    const url = new URL(insightsUrl);
    url.searchParams.set('metric', metrics.join(','));
    url.searchParams.set('period', 'day');
    url.searchParams.set('since', since.toISOString().split('T')[0]);
    url.searchParams.set('until', now.toISOString().split('T')[0]);
    url.searchParams.set('access_token', accessToken);

    console.log('Fetching Facebook Insights:', url.toString());
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      console.error('Facebook Insights API error:', data);
      throw new Error(data.error?.message || 'Facebook Insights API error');
    }

    // Get page info for additional context
    const pageInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=name,category,followers_count,location,phone,website&access_token=${accessToken}`
    );
    const pageInfo = await pageInfoResponse.json();

    // Get recent posts for engagement analysis
    const postsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,created_time,reactions.summary(true),comments.summary(true),shares&limit=10&access_token=${accessToken}`
    );
    const postsData = await postsResponse.json();

    // Process insights data into healthcare-relevant metrics
    const processedMetrics = [];
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((insight: any) => {
        if (insight.values && insight.values.length > 0) {
          const latestValue = insight.values[insight.values.length - 1];
          
          // Calculate healthcare-specific derived metrics
          let healthcareMetric = {
            metric_name: insight.name,
            metric_value: latestValue.value || 0,
            period: insight.period,
            collected_date: new Date().toISOString().split('T')[0],
            platform_data: {
              page_info: pageInfo,
              metric_description: getHealthcareMetricDescription(insight.name),
              healthcare_context: getHealthcareContext(insight.name)
            }
          };

          // Add patient engagement context
          if (insight.name === 'page_post_engagements') {
            healthcareMetric.platform_data.patient_engagement_score = calculatePatientEngagementScore(latestValue.value, pageInfo.followers_count);
          }

          // Add practice visibility metrics
          if (insight.name === 'page_impressions_unique') {
            healthcareMetric.platform_data.practice_visibility_score = calculatePracticeVisibility(latestValue.value, pageInfo.followers_count);
          }

          processedMetrics.push(healthcareMetric);
        }
      });
    }

    // Add post-level analytics with healthcare context
    if (postsData.data && Array.isArray(postsData.data)) {
      postsData.data.forEach((post: any, index: number) => {
        const totalEngagement = (post.reactions?.summary?.total_count || 0) + 
                               (post.comments?.summary?.total_count || 0) + 
                               (post.shares?.count || 0);

        processedMetrics.push({
          metric_name: `post_engagement_${index}`,
          metric_value: totalEngagement,
          period: 'lifetime',
          collected_date: new Date().toISOString().split('T')[0],
          platform_data: {
            post_id: post.id,
            post_message: post.message?.substring(0, 100) + '...' || 'No message',
            created_time: post.created_time,
            healthcare_content_type: classifyHealthcareContent(post.message || ''),
            patient_education_value: assessPatientEducationValue(post.message || ''),
            compliance_score: assessContentCompliance(post.message || '')
          }
        });
      });
    }

    // Add summary healthcare metrics
    const summaryMetric = {
      metric_name: 'healthcare_practice_summary',
      metric_value: processedMetrics.length,
      period: 'summary',
      collected_date: new Date().toISOString().split('T')[0],
      platform_data: {
        total_followers: pageInfo.followers_count || 0,
        practice_name: pageInfo.name,
        practice_category: pageInfo.category,
        location: pageInfo.location,
        website: pageInfo.website,
        phone: pageInfo.phone,
        practice_id: practiceId,
        healthcare_metrics_collected: processedMetrics.length,
        last_sync_timestamp: new Date().toISOString()
      }
    };

    processedMetrics.push(summaryMetric);

    console.log(`Processed ${processedMetrics.length} enhanced Facebook metrics for healthcare practice`);
    return processedMetrics;

  } catch (error) {
    console.error('Enhanced Facebook analytics error:', error);
    return [];
  }
}

// Enhanced Instagram analytics for healthcare practices
async function collectEnhancedInstagramAnalytics(account: any, practiceId?: string): Promise<any[]> {
  try {
    const accessToken = account.access_token;
    const instagramAccountId = account.account_id;
    
    // Enhanced Instagram Business Account insights for healthcare
    const insightsUrl = `https://graph.facebook.com/v18.0/${instagramAccountId}/insights`;
    const metrics = [
      'follower_count',
      'impressions',
      'reach',
      'profile_views',
      'website_clicks',
      'email_contacts',
      'phone_call_clicks',
      'text_message_clicks',
      'get_directions_clicks' // Important for healthcare practices
    ];

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const until = new Date();
    
    const url = new URL(insightsUrl);
    url.searchParams.set('metric', metrics.join(','));
    url.searchParams.set('period', 'day');
    url.searchParams.set('since', since.toISOString().split('T')[0]);
    url.searchParams.set('until', until.toISOString().split('T')[0]);
    url.searchParams.set('access_token', accessToken);

    console.log('Fetching Instagram Insights:', url.toString());
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      console.error('Instagram Insights API error:', data);
      throw new Error(data.error?.message || 'Instagram Insights API error');
    }

    // Get Instagram account info
    const accountInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=name,username,followers_count,media_count,biography&access_token=${accessToken}`
    );
    const accountInfo = await accountInfoResponse.json();

    // Get recent media for content analysis
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media?fields=id,caption,media_type,like_count,comments_count,timestamp&limit=10&access_token=${accessToken}`
    );
    const mediaData = await mediaResponse.json();

    const processedMetrics = [];
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((insight: any) => {
        if (insight.values && insight.values.length > 0) {
          const latestValue = insight.values[insight.values.length - 1];
          
          processedMetrics.push({
            metric_name: insight.name,
            metric_value: latestValue.value || 0,
            period: insight.period,
            collected_date: new Date().toISOString().split('T')[0],
            platform_data: {
              account_info: accountInfo,
              healthcare_context: getInstagramHealthcareContext(insight.name),
              patient_engagement_potential: calculateInstagramPatientEngagement(insight.name, latestValue.value)
            }
          });
        }
      });
    }

    // Analyze recent media for healthcare content performance
    if (mediaData.data && Array.isArray(mediaData.data)) {
      mediaData.data.forEach((media: any, index: number) => {
        const engagementRate = accountInfo.followers_count > 0 ? 
          ((media.like_count + media.comments_count) / accountInfo.followers_count) * 100 : 0;

        processedMetrics.push({
          metric_name: `media_engagement_${index}`,
          metric_value: media.like_count + media.comments_count,
          period: 'lifetime',
          collected_date: new Date().toISOString().split('T')[0],
          platform_data: {
            media_id: media.id,
            media_type: media.media_type,
            caption_preview: media.caption?.substring(0, 100) + '...' || 'No caption',
            engagement_rate: Math.round(engagementRate * 100) / 100,
            healthcare_content_category: classifyInstagramHealthcareContent(media.caption || '', media.media_type),
            patient_education_score: assessInstagramEducationalValue(media.caption || ''),
            timestamp: media.timestamp
          }
        });
      });
    }

    console.log(`Processed ${processedMetrics.length} enhanced Instagram metrics for healthcare practice`);
    return processedMetrics;

  } catch (error) {
    console.error('Enhanced Instagram analytics error:', error);
    return [];
  }
}

// Existing LinkedIn and Twitter functions (unchanged for now)
async function collectLinkedInAnalytics(account: any): Promise<any[]> {
  // LinkedIn analytics collection (to be enhanced similarly)
  console.log('LinkedIn analytics collection - using basic implementation');
  return [];
}

async function collectTwitterAnalytics(account: any): Promise<any[]> {
  // Twitter analytics collection (to be enhanced similarly)
  console.log('Twitter analytics collection - using basic implementation');
  return [];
}

// Healthcare-specific helper functions
function getHealthcareMetricDescription(metricName: string): string {
  const descriptions = {
    'page_fans': 'Total patients and community members following your practice',
    'page_fan_adds': 'New followers interested in your healthcare services',
    'page_impressions': 'Total reach of your healthcare content',
    'page_post_engagements': 'Patient interactions with your educational content',
    'page_places_checkin_total': 'Patients checking in at your practice location',
    'page_cta_clicks_logged_in': 'Clicks on appointment booking or contact buttons'
  };
  return descriptions[metricName] || 'Healthcare practice metric';
}

function getHealthcareContext(metricName: string): string {
  const contexts = {
    'page_fans': 'community_building',
    'page_fan_adds': 'practice_growth',
    'page_impressions': 'content_reach',
    'page_post_engagements': 'patient_engagement',
    'page_places_checkin_total': 'practice_visits',
    'page_cta_clicks_logged_in': 'appointment_interest'
  };
  return contexts[metricName] || 'general_healthcare';
}

function calculatePatientEngagementScore(engagements: number, followers: number): number {
  if (followers === 0) return 0;
  const rate = (engagements / followers) * 100;
  return Math.round(rate * 100) / 100;
}

function calculatePracticeVisibility(impressions: number, followers: number): number {
  if (followers === 0) return impressions;
  const amplification = impressions / followers;
  return Math.round(amplification * 100) / 100;
}

function classifyHealthcareContent(content: string): string {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('appointment') || lowerContent.includes('booking')) return 'appointment_promotion';
  if (lowerContent.includes('education') || lowerContent.includes('tips') || lowerContent.includes('advice')) return 'patient_education';
  if (lowerContent.includes('service') || lowerContent.includes('treatment')) return 'service_promotion';
  if (lowerContent.includes('health') || lowerContent.includes('wellness')) return 'health_awareness';
  return 'general_practice_content';
}

function assessPatientEducationValue(content: string): number {
  const educationalIndicators = ['learn', 'understand', 'know', 'important', 'advice', 'tips', 'guide', 'help'];
  const lowerContent = content.toLowerCase();
  const score = educationalIndicators.reduce((count, indicator) => {
    return count + (lowerContent.includes(indicator) ? 1 : 0);
  }, 0);
  return Math.min(score * 10, 100); // Scale to 0-100
}

function assessContentCompliance(content: string): number {
  const nonCompliantTerms = ['guarantee', 'cure', 'best', 'miracle', 'amazing results'];
  const lowerContent = content.toLowerCase();
  const violations = nonCompliantTerms.reduce((count, term) => {
    return count + (lowerContent.includes(term) ? 1 : 0);
  }, 0);
  return Math.max(100 - (violations * 20), 0); // Reduce score for each violation
}

function getInstagramHealthcareContext(metricName: string): string {
  const contexts = {
    'follower_count': 'practice_community_size',
    'impressions': 'content_visibility',
    'reach': 'patient_awareness',
    'profile_views': 'practice_interest',
    'website_clicks': 'appointment_intent',
    'phone_call_clicks': 'direct_patient_contact',
    'get_directions_clicks': 'practice_visit_intent'
  };
  return contexts[metricName] || 'general_instagram_healthcare';
}

function calculateInstagramPatientEngagement(metricName: string, value: number): number {
  const engagementWeights = {
    'website_clicks': 10,
    'phone_call_clicks': 15,
    'email_contacts': 12,
    'get_directions_clicks': 20,
    'profile_views': 5
  };
  const weight = engagementWeights[metricName] || 1;
  return value * weight;
}

function classifyInstagramHealthcareContent(caption: string, mediaType: string): string {
  const lowerCaption = caption.toLowerCase();
  if (mediaType === 'VIDEO' && lowerCaption.includes('exercise')) return 'exercise_education';
  if (lowerCaption.includes('before') && lowerCaption.includes('after')) return 'treatment_results';
  if (lowerCaption.includes('tip') || lowerCaption.includes('advice')) return 'health_tips';
  if (lowerCaption.includes('team') || lowerCaption.includes('staff')) return 'practice_introduction';
  return 'general_health_content';
}

function assessInstagramEducationalValue(caption: string): number {
  const educationalKeywords = ['health', 'tips', 'learn', 'education', 'awareness', 'prevention', 'care', 'wellness'];
  const lowerCaption = caption.toLowerCase();
  const matches = educationalKeywords.filter(keyword => lowerCaption.includes(keyword)).length;
  return Math.min(matches * 12.5, 100); // Scale to 0-100
}