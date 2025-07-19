import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthCallback {
  code: string;
  state: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
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

    const { code, state, platform }: OAuthCallback = await req.json();

    // Verify OAuth state
    const { data: oauthState, error: stateError } = await supabaseClient
      .from('oauth_states')
      .select('*')
      .eq('state_token', state)
      .eq('platform', platform)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !oauthState) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OAuth state' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark state as used
    await supabaseClient
      .from('oauth_states')
      .update({ used: true })
      .eq('id', oauthState.id);

    // Exchange code for access token
    let tokenResponse;
    
    switch (platform) {
      case 'facebook':
      case 'instagram':
        tokenResponse = await exchangeFacebookToken(code, oauthState.redirect_uri);
        break;
      case 'linkedin':
        tokenResponse = await exchangeLinkedInToken(code, oauthState.redirect_uri);
        break;
      case 'twitter':
        tokenResponse = await exchangeTwitterToken(code, oauthState.redirect_uri, oauthState.code_verifier);
        break;
      default:
        throw new Error('Unsupported platform');
    }

    if (!tokenResponse.access_token) {
      throw new Error('Failed to obtain access token');
    }

    // Get user profile information from the platform
    const userProfile = await getUserProfile(platform, tokenResponse.access_token);
    
    // Store social account in database
    const { error: accountError } = await supabaseClient
      .from('social_accounts')
      .upsert({
        user_id: oauthState.user_id,
        platform,
        account_id: userProfile.id,
        account_name: userProfile.name,
        account_username: userProfile.username,
        account_avatar: userProfile.avatar,
        access_token: tokenResponse.access_token,
        oauth_refresh_token: tokenResponse.refresh_token,
        oauth_scope: tokenResponse.scope,
        expires_at: tokenResponse.expires_in ? 
          new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString() : null,
        last_sync_at: new Date().toISOString(),
        is_active: true,
      }, {
        onConflict: 'user_id,platform,account_id'
      });

    if (accountError) {
      console.error('Error storing social account:', accountError);
      throw new Error('Failed to store account information');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        account: {
          platform,
          name: userProfile.name,
          username: userProfile.username,
          avatar: userProfile.avatar,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Authentication failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function exchangeFacebookToken(code: string, redirectUri: string) {
  const clientId = Deno.env.get('FACEBOOK_APP_ID');
  const clientSecret = Deno.env.get('FACEBOOK_APP_SECRET');
  
  const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
  tokenUrl.searchParams.set('client_id', clientId!);
  tokenUrl.searchParams.set('client_secret', clientSecret!);
  tokenUrl.searchParams.set('redirect_uri', redirectUri);
  tokenUrl.searchParams.set('code', code);

  const response = await fetch(tokenUrl.toString());
  return await response.json();
}

async function exchangeLinkedInToken(code: string, redirectUri: string) {
  const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
  const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
  
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId!,
      client_secret: clientSecret!,
    }),
  });

  return await response.json();
}

async function exchangeTwitterToken(code: string, redirectUri: string, codeVerifier: string) {
  const clientId = Deno.env.get('TWITTER_CLIENT_ID');
  
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  return await response.json();
}

async function getUserProfile(platform: string, accessToken: string) {
  switch (platform) {
    case 'facebook':
      const fbResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,picture&access_token=${accessToken}`);
      const fbData = await fbResponse.json();
      return {
        id: fbData.id,
        name: fbData.name,
        username: fbData.name,
        avatar: fbData.picture?.data?.url,
      };

    case 'instagram':
      const igResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,username&access_token=${accessToken}`);
      const igData = await igResponse.json();
      return {
        id: igData.id,
        name: igData.username,
        username: igData.username,
        avatar: null,
      };

    case 'linkedin':
      const liResponse = await fetch('https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const liData = await liResponse.json();
      return {
        id: liData.id,
        name: `${liData.firstName?.localized?.en_US || ''} ${liData.lastName?.localized?.en_US || ''}`.trim(),
        username: liData.id,
        avatar: liData.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier,
      };

    case 'twitter':
      const twitterResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const twitterData = await twitterResponse.json();
      const user = twitterData.data;
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.profile_image_url,
      };

    default:
      throw new Error('Unsupported platform');
  }
}