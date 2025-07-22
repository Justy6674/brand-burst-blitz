import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestRequest {
  platform: 'facebook' | 'linkedin' | 'twitter';
  testType: 'oauth_init' | 'oauth_callback' | 'publishing' | 'analytics';
  data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required for testing' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { platform, testType, data }: TestRequest = await req.json();

    const results: any = {
      testType,
      platform,
      timestamp: new Date().toISOString(),
      userId: user.id,
      tests: {}
    };

    // Test 1: Check if user has credentials for platform
    console.log(`Testing credentials for ${platform}...`);
    const { data: credentialsData, error: credentialsError } = await supabaseClient
      .from('user_social_credentials')
      .select('app_id, app_secret')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .single();

    results.tests.credentials = {
      hasCredentials: !credentialsError && !!credentialsData,
      error: credentialsError?.message || null,
      appIdPresent: !!credentialsData?.app_id,
      appSecretPresent: !!credentialsData?.app_secret
    };

    if (!credentialsData) {
      results.tests.credentials.recommendation = `Add ${platform} API credentials in the Social Credentials Manager`;
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Test 2: Test OAuth initialization
    if (testType === 'oauth_init' || testType === 'oauth_callback') {
      console.log(`Testing OAuth init for ${platform}...`);
      
      try {
        const { data: oauthData, error: oauthError } = await supabaseClient.functions.invoke('social-oauth-init', {
          body: {
            platform,
            redirectUri: `${data?.redirectUri || 'https://test.com'}/auth/callback`
          }
        });

        results.tests.oauth_init = {
          success: !oauthError && !!oauthData?.authUrl,
          error: oauthError?.message || null,
          authUrl: oauthData?.authUrl ? 'Generated successfully' : 'Failed to generate',
          state: oauthData?.state ? 'Generated' : 'Missing'
        };

        if (oauthError) {
          results.tests.oauth_init.recommendation = `Fix OAuth initialization: ${oauthError.message}`;
        }
      } catch (error) {
        results.tests.oauth_init = {
          success: false,
          error: error.message,
          recommendation: 'OAuth init function may not be deployed or configured correctly'
        };
      }
    }

    // Test 3: Test social account connection status
    console.log(`Checking social account status for ${platform}...`);
    const { data: socialAccounts, error: socialError } = await supabaseClient
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .eq('is_active', true);

    results.tests.social_accounts = {
      connectedAccounts: socialAccounts?.length || 0,
      error: socialError?.message || null,
      isConnected: (socialAccounts?.length || 0) > 0
    };

    // Test 4: Test publishing capability (if connected)
    if (results.tests.social_accounts.isConnected && testType === 'publishing') {
      console.log(`Testing publishing capability for ${platform}...`);
      
      try {
        // Create a test post
        const { data: testPost, error: postError } = await supabaseClient
          .from('posts')
          .insert({
            user_id: user.id,
            type: 'social_media',
            title: 'System Test Post',
            content: 'This is a test post to verify publishing functionality.',
            status: 'draft',
            target_platforms: [platform]
          })
          .select()
          .single();

        if (postError) {
          results.tests.publishing = {
            success: false,
            error: `Failed to create test post: ${postError.message}`,
            recommendation: 'Check posts table permissions and schema'
          };
        } else {
          results.tests.publishing = {
            success: true,
            testPostId: testPost.id,
            status: 'Test post created successfully',
            recommendation: 'Ready for publishing queue integration'
          };
        }
      } catch (error) {
        results.tests.publishing = {
          success: false,
          error: error.message,
          recommendation: 'Fix publishing pipeline configuration'
        };
      }
    }

    // Test 5: Test analytics capability
    if (testType === 'analytics') {
      console.log(`Testing analytics for ${platform}...`);
      
      const { data: analyticsData, error: analyticsError } = await supabaseClient
        .from('analytics')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .limit(1);

      results.tests.analytics = {
        hasAnalytics: !analyticsError && (analyticsData?.length || 0) > 0,
        error: analyticsError?.message || null,
        dataPoints: analyticsData?.length || 0,
        recommendation: analyticsData?.length > 0 ? 'Analytics data available' : 'No analytics data - implement real data collection'
      };
    }

    // Overall system health check
    results.systemHealth = {
      credentialsConfigured: results.tests.credentials.hasCredentials,
      oauthWorking: results.tests.oauth_init?.success ?? 'Not tested',
      accountsConnected: results.tests.social_accounts.isConnected,
      publishingReady: results.tests.publishing?.success ?? 'Not tested',
      analyticsReady: results.tests.analytics?.hasAnalytics ?? 'Not tested'
    };

    // Calculate overall readiness score
    let readinessScore = 0;
    if (results.tests.credentials.hasCredentials) readinessScore += 20;
    if (results.tests.oauth_init?.success) readinessScore += 30;
    if (results.tests.social_accounts.isConnected) readinessScore += 25;
    if (results.tests.publishing?.success) readinessScore += 15;
    if (results.tests.analytics?.hasAnalytics) readinessScore += 10;

    results.readinessScore = `${readinessScore}%`;
    results.status = readinessScore >= 90 ? 'PRODUCTION_READY' : 
                     readinessScore >= 70 ? 'MOSTLY_FUNCTIONAL' : 
                     readinessScore >= 40 ? 'PARTIALLY_WORKING' : 'NEEDS_MAJOR_FIXES';

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('System test error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'System test failed', 
        details: error.message,
        recommendation: 'Check system configuration and edge function deployment'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});