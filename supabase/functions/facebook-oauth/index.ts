import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const facebookAppId = Deno.env.get('FACEBOOK_APP_ID');
    const facebookAppSecret = Deno.env.get('FACEBOOK_APP_SECRET');
    
    if (!facebookAppId || !facebookAppSecret) {
      throw new Error('Facebook app credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'init') {
      // Initialize OAuth flow
      const { userId } = await req.json();
      
      if (!userId) {
        throw new Error('User ID required');
      }

      const state = crypto.randomUUID();
      const redirectUri = `${url.origin}/api/functions/facebook-oauth/callback`;
      
      // Store OAuth state
      await supabase.from('oauth_states').insert({
        user_id: userId,
        platform: 'facebook',
        state_token: state,
        redirect_uri: redirectUri,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      });

      const scope = 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,pages_show_list';
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${facebookAppId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${state}&` +
        `response_type=code`;

      return new Response(JSON.stringify({ authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'callback') {
      // Handle OAuth callback
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        throw new Error(`Facebook OAuth error: ${error}`);
      }

      if (!code || !state) {
        throw new Error('Missing authorization code or state');
      }

      // Verify state
      const { data: oauthState, error: stateError } = await supabase
        .from('oauth_states')
        .select('*')
        .eq('state_token', state)
        .eq('platform', 'facebook')
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (stateError || !oauthState) {
        throw new Error('Invalid or expired OAuth state');
      }

      // Mark state as used
      await supabase
        .from('oauth_states')
        .update({ used: true })
        .eq('id', oauthState.id);

      const redirectUri = `${url.origin}/api/functions/facebook-oauth/callback`;

      // Exchange code for access token
      const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: facebookAppId,
          client_secret: facebookAppSecret,
          redirect_uri: redirectUri,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(`Token exchange failed: ${errorData.error?.message || tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Get user info
      const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${accessToken}`);
      const userData = await userResponse.json();

      // Get user's pages
      const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
      const pagesData = await pagesResponse.json();

      // Store Facebook account connection
      if (pagesData.data && pagesData.data.length > 0) {
        for (const page of pagesData.data) {
          await supabase.from('social_accounts').upsert({
            user_id: oauthState.user_id,
            platform: 'facebook',
            account_id: page.id,
            account_name: page.name,
            access_token: page.access_token, // Page access token
            page_id: page.id,
            is_active: true,
            oauth_scope: 'pages_manage_posts,pages_read_engagement'
          });

          // Check for connected Instagram account
          const igResponse = await fetch(`https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`);
          const igData = await igResponse.json();

          if (igData.instagram_business_account) {
            await supabase.from('social_accounts').upsert({
              user_id: oauthState.user_id,
              platform: 'instagram',
              account_id: igData.instagram_business_account.id,
              account_name: `${page.name} Instagram`,
              access_token: page.access_token,
              page_id: page.id,
              is_active: true,
              oauth_scope: 'instagram_basic,instagram_content_publish'
            });
          }
        }
      }

      // Redirect back to app
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${url.origin}/social-media?connected=facebook`
        }
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in facebook-oauth function:', error);
    
    // Redirect to app with error
    const url = new URL(req.url);
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `${url.origin}/social-media?error=${encodeURIComponent(error.message)}`
      }
    });
  }
});