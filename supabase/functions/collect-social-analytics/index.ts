import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsCollectionRequest {
  platforms?: string[];
  forceSync?: boolean;
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

    const { platforms, forceSync }: AnalyticsCollectionRequest = await req.json();

    console.log('Starting analytics collection process');

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
        JSON.stringify({ message: 'No connected social accounts found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Collecting analytics for ${socialAccounts.length} social accounts`);

    const results = [];

    for (const account of socialAccounts) {
      try {
        console.log(`Collecting analytics for ${account.platform} account: ${account.account_name}`);

        // Check if we should skip recent syncs (unless forced)
        if (!forceSync && account.last_sync_at) {
          const lastSync = new Date(account.last_sync_at);
          const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceSync < 6) { // Skip if synced within last 6 hours
            console.log(`Skipping ${account.platform} - synced ${hoursSinceSync.toFixed(1)} hours ago`);
            continue;
          }
        }

        // Collect platform-specific analytics
        const analyticsData = await collectPlatformAnalytics(account);
        
        if (analyticsData.length > 0) {
          // Store analytics data
          const { error: insertError } = await supabaseClient
            .from('analytics')
            .insert(
              analyticsData.map(metric => ({
                user_id: account.user_id,
                platform: account.platform,
                metrics: metric,
                collected_at: new Date().toISOString()
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

          console.log(`✅ Collected ${analyticsData.length} metrics for ${account.platform}`);
          results.push({
            platform: account.platform,
            account: account.account_name,
            metricsCollected: analyticsData.length,
            status: 'success'
          });
        } else {
          console.log(`No new analytics data for ${account.platform}`);
          results.push({
            platform: account.platform,
            account: account.account_name,
            metricsCollected: 0,
            status: 'no_new_data'
          });
        }

      } catch (error) {
        console.error(`Failed to collect analytics for ${account.platform}:`, error);
        results.push({
          platform: account.platform,
          account: account.account_name,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log(`Analytics collection completed. Processed ${results.length} accounts`);

    return new Response(
      JSON.stringify({ 
        message: 'Analytics collection completed',
        accounts: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analytics collection error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Analytics collection failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function collectPlatformAnalytics(account: any): Promise<any[]> {
  switch (account.platform) {
    case 'facebook':
      return await collectFacebookAnalytics(account);
    case 'instagram':
      return await collectInstagramAnalytics(account);
    case 'linkedin':
      return await collectLinkedInAnalytics(account);
    case 'twitter':
      return await collectTwitterAnalytics(account);
    default:
      console.log(`Analytics collection not implemented for ${account.platform}`);
      return [];
  }
}

async function collectFacebookAnalytics(account: any): Promise<any[]> {
  try {
    // Get page insights
    const insightsUrl = `https://graph.facebook.com/v18.0/${account.account_id}/insights`;
    const metrics = [
      'page_fans',
      'page_fan_adds',
      'page_fan_removes',
      'page_impressions',
      'page_post_engagements',
      'page_posts_impressions'
    ];

    const url = new URL(insightsUrl);
    url.searchParams.set('metric', metrics.join(','));
    url.searchParams.set('period', 'day');
    url.searchParams.set('since', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    url.searchParams.set('until', new Date().toISOString().split('T')[0]);
    url.searchParams.set('access_token', account.access_token);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Facebook Insights API error');
    }

    return data.data.map((insight: any) => ({
      metric_name: insight.name,
      metric_value: insight.values[insight.values.length - 1]?.value || 0,
      period: insight.period,
      collected_date: new Date().toISOString().split('T')[0]
    }));

  } catch (error) {
    console.error('Facebook analytics error:', error);
    return [];
  }
}

async function collectInstagramAnalytics(account: any): Promise<any[]> {
  try {
    // Get Instagram Business Account insights
    const insightsUrl = `https://graph.facebook.com/v18.0/${account.account_id}/insights`;
    const metrics = [
      'follower_count',
      'impressions',
      'reach',
      'profile_views'
    ];

    const url = new URL(insightsUrl);
    url.searchParams.set('metric', metrics.join(','));
    url.searchParams.set('period', 'day');
    url.searchParams.set('since', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    url.searchParams.set('until', new Date().toISOString().split('T')[0]);
    url.searchParams.set('access_token', account.access_token);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Instagram Insights API error');
    }

    return data.data.map((insight: any) => ({
      metric_name: insight.name,
      metric_value: insight.values[insight.values.length - 1]?.value || 0,
      period: insight.period,
      collected_date: new Date().toISOString().split('T')[0]
    }));

  } catch (error) {
    console.error('Instagram analytics error:', error);
    return [];
  }
}

async function collectLinkedInAnalytics(account: any): Promise<any[]> {
  try {
    // LinkedIn analytics are more complex and require organization access
    // For now, return basic metrics that can be obtained
    const profileUrl = 'https://api.linkedin.com/v2/people/~:(id,numConnections)';
    
    const response = await fetch(profileUrl, {
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'LinkedIn API error');
    }

    return [{
      metric_name: 'connections',
      metric_value: data.numConnections || 0,
      period: 'lifetime',
      collected_date: new Date().toISOString().split('T')[0]
    }];

  } catch (error) {
    console.error('LinkedIn analytics error:', error);
    return [];
  }
}

async function collectTwitterAnalytics(account: any): Promise<any[]> {
  try {
    // Get user metrics
    const userUrl = `https://api.twitter.com/2/users/me?user.fields=public_metrics`;
    
    const response = await fetch(userUrl, {
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.title || 'Twitter API error');
    }

    const metrics = data.data.public_metrics;
    const analyticsData = [];

    for (const [metricName, value] of Object.entries(metrics)) {
      analyticsData.push({
        metric_name: metricName,
        metric_value: value,
        period: 'lifetime',
        collected_date: new Date().toISOString().split('T')[0]
      });
    }

    return analyticsData;

  } catch (error) {
    console.error('Twitter analytics error:', error);
    return [];
  }
}