import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthCallback {
  code: string;
  state: string;
  platform: string;
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

    const { code, state, platform }: OAuthCallback = await req.json();

    console.log(`Processing OAuth callback for ${platform}`);

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
      console.error('Invalid OAuth state:', stateError);
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

    // Exchange code for access token and process account data
    let accountData;
    
    switch (platform) {
      case 'facebook':
      case 'instagram':
        accountData = await processFacebookOAuth(code, oauthState, supabaseClient);
        break;
      case 'linkedin':
        accountData = await processLinkedInOAuth(code, oauthState, supabaseClient);
        break;
      case 'twitter':
        accountData = await processTwitterOAuth(code, oauthState, supabaseClient);
        break;
      default:
        throw new Error('Unsupported platform');
    }

    console.log(`Successfully processed ${platform} OAuth for user ${oauthState.user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        platform,
        accounts: accountData.accounts,
        message: accountData.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'OAuth processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processFacebookOAuth(code: string, oauthState: any, supabaseClient: any) {
  console.log('Processing Facebook OAuth...');
  
  // Get user's Facebook credentials
  const { data: credentialsData, error: credentialsError } = await supabaseClient
    .from('user_social_credentials')
    .select('app_id, app_secret')
    .eq('user_id', oauthState.user_id)
    .eq('platform', 'facebook')
    .single();

  if (credentialsError || !credentialsData) {
    throw new Error('Facebook credentials not found. Please add your app credentials first.');
  }

  // Exchange authorization code for access token
  const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
  tokenUrl.searchParams.set('client_id', credentialsData.app_id);
  tokenUrl.searchParams.set('client_secret', credentialsData.app_secret);
  tokenUrl.searchParams.set('redirect_uri', oauthState.redirect_uri);
  tokenUrl.searchParams.set('code', code);

  const tokenResponse = await fetch(tokenUrl.toString());
  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error('Token exchange failed:', tokenData);
    throw new Error(tokenData.error?.message || 'Failed to exchange authorization code for access token');
  }

  const accessToken = tokenData.access_token;

  // Get user's Facebook pages (for business accounts)
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,category,access_token,instagram_business_account&access_token=${accessToken}`
  );
  const pagesData = await pagesResponse.json();

  if (!pagesResponse.ok) {
    console.error('Failed to fetch user pages:', pagesData);
    throw new Error('Failed to retrieve Facebook pages');
  }

  const connectedAccounts = [];
  let instagramAccountsFound = 0;

  // Process each Facebook page
  if (pagesData.data && pagesData.data.length > 0) {
    for (const page of pagesData.data) {
      console.log(`Processing Facebook page: ${page.name} (${page.id})`);
      
      // Store Facebook page account
      const { error: fbError } = await supabaseClient
        .from('social_accounts')
        .upsert({
          user_id: oauthState.user_id,
          platform: 'facebook',
          account_id: page.id,
          account_name: page.name,
          access_token: page.access_token, // Page access token for posting
          page_id: page.id,
          category: page.category || 'Healthcare',
          is_active: true,
          oauth_scope: 'pages_manage_posts,pages_read_engagement,pages_show_list',
          last_sync_at: new Date().toISOString(),
          connected_at: new Date().toISOString()
        });

      if (fbError) {
        console.error('Error storing Facebook account:', fbError);
        throw new Error(`Failed to store Facebook page: ${page.name}`);
      }

      connectedAccounts.push({
        platform: 'facebook',
        id: page.id,
        name: page.name,
        category: page.category
      });

      // Check for connected Instagram business account
      if (page.instagram_business_account) {
        console.log(`Found Instagram business account for page: ${page.name}`);
        
        // Get Instagram account details
        const igResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.instagram_business_account.id}?fields=id,username,name,biography,followers_count,media_count&access_token=${page.access_token}`
        );
        const igData = await igResponse.json();

        if (igResponse.ok) {
          // Store Instagram business account
          const { error: igError } = await supabaseClient
            .from('social_accounts')
            .upsert({
              user_id: oauthState.user_id,
              platform: 'instagram',
              account_id: page.instagram_business_account.id,
              account_name: igData.username || `${page.name} Instagram`,
              access_token: page.access_token, // Use page token for Instagram API
              page_id: page.id, // Link to parent Facebook page
              category: page.category || 'Healthcare',
              is_active: true,
              oauth_scope: 'instagram_basic,instagram_content_publish',
              last_sync_at: new Date().toISOString(),
              connected_at: new Date().toISOString(),
              account_metadata: {
                username: igData.username,
                biography: igData.biography,
                followers_count: igData.followers_count,
                media_count: igData.media_count
              }
            });

          if (igError) {
            console.error('Error storing Instagram account:', igError);
          } else {
            instagramAccountsFound++;
            connectedAccounts.push({
              platform: 'instagram',
              id: page.instagram_business_account.id,
              name: igData.username || `${page.name} Instagram`,
              username: igData.username
            });
          }
        }
      }
    }
  } else {
    throw new Error('No Facebook pages found. Please create a Facebook page for your healthcare practice first.');
  }

  // Create initial analytics collection job
  try {
    await supabaseClient.functions.invoke('collect-social-analytics', {
      body: { 
        platforms: ['facebook', 'instagram'],
        forceSync: true,
        userId: oauthState.user_id
      }
    });
    console.log('Initial analytics collection started');
  } catch (analyticsError) {
    console.warn('Failed to start initial analytics collection:', analyticsError);
  }

  const message = instagramAccountsFound > 0 
    ? `Connected ${pagesData.data.length} Facebook page(s) and ${instagramAccountsFound} Instagram business account(s)`
    : `Connected ${pagesData.data.length} Facebook page(s). Instagram business accounts can be connected through Facebook Business Manager.`;

  return {
    accounts: connectedAccounts,
    message
  };
}

async function processLinkedInOAuth(code: string, oauthState: any, supabaseClient: any) {
  console.log('Processing LinkedIn OAuth...');
  
  // Get user's LinkedIn credentials
  const { data: credentialsData, error: credentialsError } = await supabaseClient
    .from('user_social_credentials')
    .select('app_id, app_secret')
    .eq('user_id', oauthState.user_id)
    .eq('platform', 'linkedin')
    .single();

  if (credentialsError || !credentialsData) {
    throw new Error('LinkedIn credentials not found');
  }

  // Exchange code for access token
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: credentialsData.app_id,
      client_secret: credentialsData.app_secret,
      redirect_uri: oauthState.redirect_uri,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    throw new Error(tokenData.error_description || 'LinkedIn token exchange failed');
  }

  // Get user profile
  const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
    },
  });

  const profileData = await profileResponse.json();

  if (!profileResponse.ok) {
    throw new Error('Failed to get LinkedIn profile');
  }

  // Store LinkedIn account
  const { error } = await supabaseClient
    .from('social_accounts')
    .upsert({
      user_id: oauthState.user_id,
      platform: 'linkedin',
      account_id: profileData.sub,
      account_name: profileData.name || profileData.given_name + ' ' + profileData.family_name,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      is_active: true,
      oauth_scope: 'w_member_social,r_liteprofile,r_emailaddress',
      last_sync_at: new Date().toISOString(),
      connected_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    });

  if (error) {
    throw new Error('Failed to store LinkedIn account');
  }

  return {
    accounts: [{
      platform: 'linkedin',
      id: profileData.sub,
      name: profileData.name
    }],
    message: 'LinkedIn account connected successfully'
  };
}

async function processTwitterOAuth(code: string, oauthState: any, supabaseClient: any) {
  console.log('Processing Twitter OAuth...');
  
  // Twitter OAuth 2.0 implementation would go here
  // This is a placeholder for future implementation
  throw new Error('Twitter OAuth integration coming soon');
}