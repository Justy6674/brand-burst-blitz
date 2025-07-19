import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PublishingJob {
  queueItemId: string;
  postId: string;
  platform: string;
  content: string;
  socialAccountId: string;
  scheduledFor: string;
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

    console.log('Publishing queue processor started');

    // Get pending publishing jobs
    const { data: pendingJobs, error: jobsError } = await supabaseClient
      .from('publishing_queue')
      .select(`
        id,
        post_id,
        scheduled_for,
        attempt_count,
        social_account_id,
        posts (
          id,
          content,
          title,
          image_urls,
          user_id
        ),
        social_accounts (
          id,
          platform,
          access_token,
          account_name,
          user_id
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempt_count', 3);

    if (jobsError) {
      console.error('Error fetching pending jobs:', jobsError);
      throw new Error('Failed to fetch publishing jobs');
    }

    if (!pendingJobs || pendingJobs.length === 0) {
      console.log('No pending publishing jobs found');
      return new Response(
        JSON.stringify({ message: 'No pending jobs', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pendingJobs.length} pending publishing jobs`);

    const results = [];
    
    for (const job of pendingJobs) {
      console.log(`Processing job ${job.id} for platform ${job.social_accounts.platform}`);
      
      try {
        // Update job status to processing
        await supabaseClient
          .from('publishing_queue')
          .update({ 
            status: 'processing',
            attempt_count: job.attempt_count + 1 
          })
          .eq('id', job.id);

        // Create status tracking record
        const { data: statusRecord } = await supabaseClient
          .from('publishing_queue_status')
          .insert({
            queue_item_id: job.id,
            status: 'processing',
            retry_count: job.attempt_count
          })
          .select()
          .single();

        // Publish to the specific platform
        const publishResult = await publishToSocialMedia({
          queueItemId: job.id,
          postId: job.post_id,
          platform: job.social_accounts.platform,
          content: job.posts.content || '',
          socialAccountId: job.social_account_id,
          scheduledFor: job.scheduled_for,
          accessToken: job.social_accounts.access_token,
          images: job.posts.image_urls || [],
          title: job.posts.title
        });

        if (publishResult.success) {
          // Update publishing queue as completed
          await supabaseClient
            .from('publishing_queue')
            .update({ 
              status: 'completed',
              published_post_id: publishResult.platformPostId
            })
            .eq('id', job.id);

          // Update status tracking
          await supabaseClient
            .from('publishing_queue_status')
            .update({
              status: 'completed',
              published_url: publishResult.url,
              platform_response: publishResult.response,
              processed_at: new Date().toISOString()
            })
            .eq('id', statusRecord.id);

          console.log(`✅ Successfully published job ${job.id} to ${job.social_accounts.platform}`);
          results.push({ jobId: job.id, status: 'success', platform: job.social_accounts.platform });

        } else {
          throw new Error(publishResult.error || 'Publishing failed');
        }

      } catch (error) {
        console.error(`❌ Failed to publish job ${job.id}:`, error);
        
        const shouldRetry = job.attempt_count < 2;
        const newStatus = shouldRetry ? 'scheduled' : 'failed';
        
        // Update job status
        await supabaseClient
          .from('publishing_queue')
          .update({ 
            status: newStatus,
            last_error: error.message
          })
          .eq('id', job.id);

        // Update status tracking
        const { data: statusRecord } = await supabaseClient
          .from('publishing_queue_status')
          .select('id')
          .eq('queue_item_id', job.id)
          .eq('status', 'processing')
          .single();

        if (statusRecord) {
          await supabaseClient
            .from('publishing_queue_status')
            .update({
              status: 'error',
              error_message: error.message,
              processed_at: new Date().toISOString()
            })
            .eq('id', statusRecord.id);
        }

        results.push({ 
          jobId: job.id, 
          status: 'error', 
          platform: job.social_accounts.platform,
          error: error.message,
          willRetry: shouldRetry
        });
      }
    }

    console.log(`Processed ${results.length} publishing jobs`);

    return new Response(
      JSON.stringify({ 
        message: 'Publishing jobs processed', 
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Publishing processor error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Publishing processor failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function publishToSocialMedia(job: {
  queueItemId: string;
  postId: string;
  platform: string;
  content: string;
  accessToken: string;
  images?: string[];
  title?: string;
  scheduledFor: string;
  socialAccountId: string;
}): Promise<{ success: boolean; platformPostId?: string; url?: string; response?: any; error?: string }> {
  
  switch (job.platform) {
    case 'facebook':
      return await publishToFacebook(job);
    case 'instagram':
      return await publishToInstagram(job);
    case 'linkedin':
      return await publishToLinkedIn(job);
    case 'twitter':
      return await publishToTwitter(job);
    default:
      return { success: false, error: 'Unsupported platform' };
  }
}

async function publishToFacebook(job: any) {
  try {
    const url = `https://graph.facebook.com/v18.0/me/feed`;
    
    const postData: any = {
      message: job.content,
      access_token: job.accessToken
    };

    // Add image if available
    if (job.images && job.images.length > 0) {
      postData.link = job.images[0]; // Facebook will fetch and display the image
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Facebook API error');
    }

    return {
      success: true,
      platformPostId: result.id,
      url: `https://facebook.com/${result.id}`,
      response: result
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function publishToInstagram(job: any) {
  try {
    // Instagram requires image for posts
    if (!job.images || job.images.length === 0) {
      throw new Error('Instagram posts require at least one image');
    }

    // Step 1: Create media container
    const containerUrl = `https://graph.facebook.com/v18.0/me/media`;
    const containerData = {
      image_url: job.images[0],
      caption: job.content,
      access_token: job.accessToken
    };

    const containerResponse = await fetch(containerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(containerData)
    });

    const containerResult = await containerResponse.json();
    
    if (!containerResponse.ok) {
      throw new Error(containerResult.error?.message || 'Instagram container creation failed');
    }

    // Step 2: Publish the media
    const publishUrl = `https://graph.facebook.com/v18.0/me/media_publish`;
    const publishData = {
      creation_id: containerResult.id,
      access_token: job.accessToken
    };

    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(publishData)
    });

    const publishResult = await publishResponse.json();
    
    if (!publishResponse.ok) {
      throw new Error(publishResult.error?.message || 'Instagram publish failed');
    }

    return {
      success: true,
      platformPostId: publishResult.id,
      url: `https://instagram.com/p/${publishResult.id}`,
      response: publishResult
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function publishToLinkedIn(job: any) {
  try {
    const url = 'https://api.linkedin.com/v2/ugcPosts';
    
    const postData = {
      author: `urn:li:person:${job.socialAccountId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: job.content
          },
          shareMediaCategory: job.images && job.images.length > 0 ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${job.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'LinkedIn API error');
    }

    return {
      success: true,
      platformPostId: result.id,
      url: `https://linkedin.com/feed/update/${result.id}`,
      response: result
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function publishToTwitter(job: any) {
  try {
    const url = 'https://api.twitter.com/2/tweets';
    
    const tweetData: any = {
      text: job.content
    };

    // Add media if available (requires media upload first)
    if (job.images && job.images.length > 0) {
      // For now, just post text. Media upload would require additional API calls
      console.log('Note: Twitter media upload not implemented yet');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${job.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tweetData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.detail || result.title || 'Twitter API error');
    }

    return {
      success: true,
      platformPostId: result.data.id,
      url: `https://twitter.com/user/status/${result.data.id}`,
      response: result
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}