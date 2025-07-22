import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PublishRequest {
  postId: string;
  userId: string;
  content: string;
  imageUrls?: string[];
  platforms: string[];
  scheduledFor?: string;
}

interface SocialAccount {
  id: string;
  platform: string;
  access_token: string;
  page_id?: string;
  account_id: string;
  is_active: boolean;
}

interface PublishResult {
  platform: string;
  success: boolean;
  publishedUrl?: string;
  error?: string;
  platformPostId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { postId, userId, content, imageUrls = [], platforms, scheduledFor }: PublishRequest = await req.json();
    
    console.log('Publishing to platforms:', platforms, 'for user:', userId);

    // Get user's connected social accounts
    const { data: socialAccounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .in('platform', platforms);

    if (accountsError) {
      throw new Error(`Failed to fetch social accounts: ${accountsError.message}`);
    }

    if (!socialAccounts || socialAccounts.length === 0) {
      throw new Error('No active social accounts found for the requested platforms');
    }

    const results: PublishResult[] = [];

    // Publish to each platform
    for (const account of socialAccounts) {
      try {
        console.log(`Publishing to ${account.platform} for account ${account.account_id}`);
        
        let publishResult: PublishResult;
        
        switch (account.platform) {
          case 'facebook':
            publishResult = await publishToFacebook(account, content, imageUrls);
            break;
          case 'instagram':
            publishResult = await publishToInstagram(account, content, imageUrls);
            break;
          case 'linkedin':
            publishResult = await publishToLinkedIn(account, content, imageUrls);
            break;
          case 'twitter':
            publishResult = await publishToTwitter(account, content, imageUrls);
            break;
          default:
            publishResult = {
              platform: account.platform,
              success: false,
              error: `Platform ${account.platform} not supported yet`
            };
        }

        results.push(publishResult);

        // Log the result to database
        await supabase.from('publishing_queue_status').insert({
          queue_item_id: postId,
          status: publishResult.success ? 'published' : 'failed',
          platform_response: publishResult,
          error_message: publishResult.error,
          published_url: publishResult.publishedUrl,
          processed_at: new Date().toISOString()
        });

      } catch (error) {
        console.error(`Error publishing to ${account.platform}:`, error);
        
        const errorResult: PublishResult = {
          platform: account.platform,
          success: false,
          error: error.message
        };
        
        results.push(errorResult);

        // Log the error
        await supabase.from('publishing_queue_status').insert({
          queue_item_id: postId,
          status: 'failed',
          error_message: error.message,
          processed_at: new Date().toISOString()
        });
      }
    }

    // Update the post status
    const overallSuccess = results.some(r => r.success);
    await supabase
      .from('posts')
      .update({ 
        status: overallSuccess ? 'published' : 'failed',
        published_at: overallSuccess ? new Date().toISOString() : null
      })
      .eq('id', postId);

    console.log('Publishing completed:', results);

    return new Response(JSON.stringify({
      success: overallSuccess,
      results,
      publishedCount: results.filter(r => r.success).length,
      totalRequested: platforms.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in social-media-publisher function:', error);
    return new Response(JSON.stringify({ 
      error: 'Publishing failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function publishToFacebook(account: SocialAccount, content: string, imageUrls: string[]): Promise<PublishResult> {
  try {
    const pageId = account.page_id || account.account_id;
    const accessToken = account.access_token;

    let attachments = null;
    
    // Handle image attachments
    if (imageUrls.length > 0) {
      // For simplicity, we'll just use the first image
      // In production, you'd handle multiple images properly
      const imageUrl = imageUrls[0];
      
      // Upload image to Facebook first
      const imageUploadResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: imageUrl,
          published: false, // Don't publish immediately, just upload
          access_token: accessToken
        })
      });

      if (imageUploadResponse.ok) {
        const imageData = await imageUploadResponse.json();
        attachments = {
          media: [{
            media_fbid: imageData.id
          }]
        };
      }
    }

    // Publish the post
    const postData: any = {
      message: content,
      access_token: accessToken
    };

    if (attachments) {
      postData.attached_media = JSON.stringify(attachments.media);
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        platform: 'facebook',
        success: true,
        platformPostId: data.id,
        publishedUrl: `https://facebook.com/${data.id}`
      };
    } else {
      const errorData = await response.json();
      return {
        platform: 'facebook',
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}`
      };
    }
  } catch (error) {
    return {
      platform: 'facebook',
      success: false,
      error: error.message
    };
  }
}

async function publishToInstagram(account: SocialAccount, content: string, imageUrls: string[]): Promise<PublishResult> {
  try {
    if (imageUrls.length === 0) {
      return {
        platform: 'instagram',
        success: false,
        error: 'Instagram posts require at least one image'
      };
    }

    const accessToken = account.access_token;
    const instagramAccountId = account.account_id;
    const imageUrl = imageUrls[0];

    // Step 1: Create media container
    const containerResponse = await fetch(`https://graph.facebook.com/v18.0/${instagramAccountId}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: content,
        access_token: accessToken
      })
    });

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json();
      return {
        platform: 'instagram',
        success: false,
        error: errorData.error?.message || `Container creation failed: HTTP ${containerResponse.status}`
      };
    }

    const containerData = await containerResponse.json();
    const containerId = containerData.id;

    // Step 2: Publish the media
    const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken
      })
    });

    if (publishResponse.ok) {
      const publishData = await publishResponse.json();
      return {
        platform: 'instagram',
        success: true,
        platformPostId: publishData.id,
        publishedUrl: `https://instagram.com/p/${publishData.id}`
      };
    } else {
      const errorData = await publishResponse.json();
      return {
        platform: 'instagram',
        success: false,
        error: errorData.error?.message || `Publishing failed: HTTP ${publishResponse.status}`
      };
    }
  } catch (error) {
    return {
      platform: 'instagram',
      success: false,
      error: error.message
    };
  }
}

async function publishToLinkedIn(account: SocialAccount, content: string, imageUrls: string[]): Promise<PublishResult> {
  try {
    const accessToken = account.access_token;
    const authorId = `urn:li:person:${account.account_id}`;

    let shareContent: any = {
      author: authorId,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: imageUrls.length > 0 ? "IMAGE" : "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };

    // Handle image attachments for LinkedIn
    if (imageUrls.length > 0) {
      // LinkedIn requires uploading assets first, then referencing them
      // For this implementation, we'll use a simpler approach
      shareContent.specificContent["com.linkedin.ugc.ShareContent"].media = [{
        status: "READY",
        description: {
          text: "Shared image"
        },
        media: imageUrls[0], // This is simplified - LinkedIn typically requires asset upload
        title: {
          text: "Image"
        }
      }];
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(shareContent)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        platform: 'linkedin',
        success: true,
        platformPostId: data.id,
        publishedUrl: `https://linkedin.com/feed/update/${data.id}`
      };
    } else {
      const errorData = await response.json();
      return {
        platform: 'linkedin',
        success: false,
        error: errorData.message || `HTTP ${response.status}`
      };
    }
  } catch (error) {
    return {
      platform: 'linkedin',
      success: false,
      error: error.message
    };
  }
}

async function publishToTwitter(account: SocialAccount, content: string, imageUrls: string[]): Promise<PublishResult> {
  try {
    // Note: Twitter/X API v2 requires OAuth 1.0a and has specific requirements
    // This is a simplified implementation - production would need proper OAuth 1.0a flow
    
    return {
      platform: 'twitter',
      success: false,
      error: 'Twitter integration requires OAuth 1.0a setup - coming soon'
    };
    
    // Placeholder for when Twitter integration is fully implemented
    // const accessToken = account.access_token;
    // ... Twitter API implementation
    
  } catch (error) {
    return {
      platform: 'twitter',
      success: false,
      error: error.message
    };
  }
}