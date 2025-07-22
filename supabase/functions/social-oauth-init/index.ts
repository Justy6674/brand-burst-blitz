import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthRequest {
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  redirectUri: string;
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
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { platform, redirectUri }: OAuthRequest = await req.json();

    // Generate secure state token
    const stateToken = crypto.randomUUID();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store OAuth state in database
    const { error: stateError } = await supabaseClient
      .from('oauth_states')
      .insert({
        user_id: user.id,
        platform,
        state_token: stateToken,
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
      });

    if (stateError) {
      console.error('Error storing OAuth state:', stateError);
      return new Response(
        JSON.stringify({ error: 'Failed to initialize OAuth flow' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's credentials for this platform
    const { data: credentialsData, error: credentialsError } = await supabaseClient
      .from('user_social_credentials')
      .select('app_id, app_secret')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .single();

    if (credentialsError || !credentialsData) {
      return new Response(
        JSON.stringify({ error: `No ${platform} credentials found. Please add your API credentials first.` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { app_id: clientId, app_secret: clientSecret } = credentialsData;

    // Build OAuth URLs based on platform
    let authUrl: string;
    
    switch (platform) {
      case 'facebook':
        authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('state', stateToken);
        authUrl.searchParams.set('scope', 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish');
        authUrl.searchParams.set('response_type', 'code');
        break;

      case 'instagram':
        // Instagram uses Facebook's OAuth since it's owned by Meta
        authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('state', stateToken);
        authUrl.searchParams.set('scope', 'instagram_basic,instagram_content_publish');
        authUrl.searchParams.set('response_type', 'code');
        break;

      case 'linkedin':
        authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('state', stateToken);
        authUrl.searchParams.set('scope', 'w_member_social,r_liteprofile,r_emailaddress');
        authUrl.searchParams.set('response_type', 'code');
        break;

      case 'twitter':
        // Twitter OAuth 2.0 with PKCE
        authUrl = new URL('https://twitter.com/i/oauth2/authorize');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('state', stateToken);
        authUrl.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access');
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported platform' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ 
        authUrl: authUrl.toString(),
        state: stateToken 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OAuth initialization error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions for PKCE
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}