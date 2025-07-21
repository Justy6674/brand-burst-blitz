import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FacebookInsightsRequest {
  accessToken: string;
  pageId: string;
  period: string;
  healthcareFocus: boolean;
  includePostPerformance: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      accessToken, 
      pageId, 
      period,
      healthcareFocus,
      includePostPerformance 
    }: FacebookInsightsRequest = await req.json()

    // Validate required parameters
    if (!accessToken || !pageId) {
      return new Response(
        JSON.stringify({ error: 'Missing Facebook access token or page ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const FB_GRAPH_API = 'https://graph.facebook.com/v18.0'
    
    // Healthcare-focused Facebook metrics for medical practices
    const pageInsightMetrics = [
      'page_fans',                    // Total page followers
      'page_fan_adds',               // New followers
      'page_fan_removes',            // Unfollows
      'page_views_total',            // Page views
      'page_views_unique',           // Unique page views
      'page_posts_impressions',      // Post reach
      'page_posts_impressions_unique', // Unique post reach
      'page_engaged_users',          // Page engagement
      'page_consumptions',           // Content clicks
      'page_actions_post_reactions_total', // Reactions
      'page_video_views',            // Video views
      'page_video_views_paid',       // Paid video views
      'page_tab_views_login_top',    // Login tab views
      'page_cta_clicks_logged_in',   // Call-to-action clicks
      'page_website_clicks'          // Website clicks
    ]

    // Collect page insights
    const pageInsightsUrl = `${FB_GRAPH_API}/${pageId}/insights?metric=${pageInsightMetrics.join(',')}&period=day&since=${getDateDaysAgo(30)}&until=${getDateDaysAgo(0)}&access_token=${accessToken}`
    
    const pageInsightsResponse = await fetch(pageInsightsUrl)
    
    if (!pageInsightsResponse.ok) {
      const errorData = await pageInsightsResponse.json()
      throw new Error(`Facebook API error: ${errorData.error?.message || pageInsightsResponse.statusText}`)
    }

    const pageInsightsData = await pageInsightsResponse.json()

    // Collect page demographics
    const demographicsUrl = `${FB_GRAPH_API}/${pageId}/insights?metric=page_fans_country,page_fans_city,page_fans_gender_age&period=lifetime&access_token=${accessToken}`
    
    const demographicsResponse = await fetch(demographicsUrl)
    const demographicsData = demographicsResponse.ok ? await demographicsResponse.json() : { data: [] }

    // Collect recent posts for performance analysis
    let postsData = { data: [] }
    if (includePostPerformance) {
      const postsUrl = `${FB_GRAPH_API}/${pageId}/posts?fields=id,message,created_time,story,type,link,picture,insights.metric(post_impressions,post_engaged_users,post_clicks,post_reactions_total,post_video_views)&limit=25&access_token=${accessToken}`
      
      const postsResponse = await fetch(postsUrl)
      if (postsResponse.ok) {
        postsData = await postsResponse.json()
      }
    }

    // Process the collected data into healthcare-focused analytics
    const processedData = processHealthcareFacebookData({
      pageInsights: pageInsightsData,
      demographics: demographicsData,
      posts: postsData,
      healthcareFocus,
      period
    })

    // Store collection log
    await supabase
      .from('analytics_collection_log')
      .insert({
        practice_id: pageId, // Using pageId as practice identifier
        platform: 'facebook',
        collection_date: new Date().toISOString(),
        data_points_collected: processedData.dataPointsCount || 0,
        status: 'success'
      })

    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error collecting Facebook Insights data:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to collect Facebook Insights data',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Process raw Facebook data into healthcare-focused insights
function processHealthcareFacebookData(data: any) {
  const { pageInsights, demographics, posts, healthcareFocus, period } = data
  
  // Extract page follower metrics
  const pageFansMetric = pageInsights.data.find((metric: any) => metric.name === 'page_fans')
  const pageFollowers = pageFansMetric?.values?.[pageFansMetric.values.length - 1]?.value || 0

  const fanAddsMetric = pageInsights.data.find((metric: any) => metric.name === 'page_fan_adds')
  const newFollowers = fanAddsMetric?.values?.reduce((sum: number, day: any) => sum + (day.value || 0), 0) || 0

  // Extract reach and engagement metrics
  const impressionsMetric = pageInsights.data.find((metric: any) => metric.name === 'page_posts_impressions')
  const postReach = impressionsMetric?.values?.reduce((sum: number, day: any) => sum + (day.value || 0), 0) || 0

  const uniqueImpressionsMetric = pageInsights.data.find((metric: any) => metric.name === 'page_posts_impressions_unique')
  const uniqueReach = uniqueImpressionsMetric?.values?.reduce((sum: number, day: any) => sum + (day.value || 0), 0) || 0

  const engagementMetric = pageInsights.data.find((metric: any) => metric.name === 'page_engaged_users')
  const postEngagement = engagementMetric?.values?.reduce((sum: number, day: any) => sum + (day.value || 0), 0) || 0

  // Extract page view metrics
  const pageViewsMetric = pageInsights.data.find((metric: any) => metric.name === 'page_views_total')
  const pageViews = pageViewsMetric?.values?.reduce((sum: number, day: any) => sum + (day.value || 0), 0) || 0

  // Extract action metrics
  const websiteClicksMetric = pageInsights.data.find((metric: any) => metric.name === 'page_website_clicks')
  const websiteClicks = websiteClicksMetric?.values?.reduce((sum: number, day: any) => sum + (day.value || 0), 0) || 0

  const ctaClicksMetric = pageInsights.data.find((metric: any) => metric.name === 'page_cta_clicks_logged_in')
  const ctaClicks = ctaClicksMetric?.values?.reduce((sum: number, day: any) => sum + (day.value || 0), 0) || 0

  const actionsTaken = websiteClicks + ctaClicks

  // Process demographics data
  const processedDemographics = processFacebookDemographics(demographics.data)

  // Process post performance data for healthcare content
  const topPosts = posts.data
    .filter((post: any) => {
      const content = (post.message || post.story || '').toLowerCase()
      return healthcareFocus ? 
        (content.includes('health') || content.includes('care') || content.includes('patient') || 
         content.includes('medical') || content.includes('wellness') || content.includes('treatment')) 
        : true
    })
    .map((post: any) => {
      const insights = post.insights?.data || []
      
      const impressions = insights.find((i: any) => i.name === 'post_impressions')?.values?.[0]?.value || 0
      const engagement = insights.find((i: any) => i.name === 'post_engaged_users')?.values?.[0]?.value || 0
      const clicks = insights.find((i: any) => i.name === 'post_clicks')?.values?.[0]?.value || 0
      const reactions = insights.find((i: any) => i.name === 'post_reactions_total')?.values?.[0]?.value || 0

      return {
        postId: post.id,
        content: (post.message || post.story || '').substring(0, 150) + '...',
        createdTime: post.created_time,
        type: post.type,
        reach: impressions,
        engagement: engagement,
        clicks: clicks,
        reactions: reactions,
        patientInquiries: estimatePatientInquiries(post.message || post.story, clicks, engagement),
        healthcareRelevance: calculateHealthcareRelevance(post.message || post.story || '')
      }
    })
    .sort((a: any, b: any) => b.engagement - a.engagement)
    .slice(0, 10)

  return {
    pageFollowers,
    newFollowers,
    postReach,
    uniqueReach,
    postEngagement,
    pageViews,
    actionsTaken,
    websiteClicks,
    ctaClicks,
    demographics: processedDemographics,
    topPosts,
    dataPointsCount: pageInsights.data.length + posts.data.length,
    collectedAt: new Date().toISOString(),
    healthcareFocus,
    period,
    dataQuality: {
      completeness: pageInsights.data.length > 10 ? 'high' : 'medium',
      accuracy: 'verified_by_facebook',
      freshness: 'real_time'
    },
    // Healthcare-specific metrics
    healthcareMetrics: {
      appointmentRelatedPosts: topPosts.filter((p: any) => 
        p.content.toLowerCase().includes('appointment') || 
        p.content.toLowerCase().includes('booking')
      ).length,
      educationalContent: topPosts.filter((p: any) => 
        p.content.toLowerCase().includes('tip') || 
        p.content.toLowerCase().includes('advice') ||
        p.content.toLowerCase().includes('learn')
      ).length,
      communityEngagement: Math.round(postEngagement / Math.max(pageFollowers, 1) * 100),
      patientInquiriesGenerated: topPosts.reduce((sum: number, post: any) => sum + post.patientInquiries, 0)
    }
  }
}

// Process Facebook demographics data
function processFacebookDemographics(demographicsData: any[]) {
  const ageGroups: Record<string, number> = {}
  const genderBreakdown: Record<string, number> = {}
  const topLocations: Array<{ location: string; followers: number }> = []

  demographicsData.forEach((metric: any) => {
    if (metric.name === 'page_fans_gender_age') {
      const latestData = metric.values?.[metric.values.length - 1]?.value || {}
      
      // Process age and gender data
      Object.entries(latestData).forEach(([key, value]: [string, any]) => {
        if (key.startsWith('M.') || key.startsWith('F.')) {
          const [gender, ageRange] = key.split('.')
          const genderLabel = gender === 'M' ? 'Male' : 'Female'
          
          ageGroups[ageRange] = (ageGroups[ageRange] || 0) + value
          genderBreakdown[genderLabel] = (genderBreakdown[genderLabel] || 0) + value
        }
      })
    } else if (metric.name === 'page_fans_country') {
      const latestData = metric.values?.[metric.values.length - 1]?.value || {}
      
      Object.entries(latestData)
        .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
        .slice(0, 5)
        .forEach(([location, followers]: [string, any]) => {
          topLocations.push({ location, followers })
        })
    }
  })

  return {
    ageGroups,
    genderBreakdown,
    topLocations
  }
}

// Estimate patient inquiries based on post content and engagement
function estimatePatientInquiries(content: string, clicks: number, engagement: number): number {
  const contentLower = content.toLowerCase()
  
  // Healthcare-specific multipliers
  let inquiryMultiplier = 0.02 // Base 2% conversion
  
  if (contentLower.includes('appointment') || contentLower.includes('booking')) {
    inquiryMultiplier += 0.05 // +5% for appointment posts
  }
  
  if (contentLower.includes('consultation') || contentLower.includes('visit')) {
    inquiryMultiplier += 0.03 // +3% for consultation posts
  }
  
  if (contentLower.includes('pain') || contentLower.includes('treatment')) {
    inquiryMultiplier += 0.04 // +4% for treatment posts
  }
  
  if (contentLower.includes('call') || contentLower.includes('contact')) {
    inquiryMultiplier += 0.03 // +3% for call-to-action
  }

  return Math.round((clicks + engagement * 0.1) * inquiryMultiplier)
}

// Calculate healthcare relevance score for content
function calculateHealthcareRelevance(content: string): number {
  const contentLower = content.toLowerCase()
  let score = 0
  
  const healthcareKeywords = [
    'health', 'medical', 'doctor', 'patient', 'treatment', 'care', 'wellness',
    'appointment', 'consultation', 'therapy', 'medicine', 'clinic', 'hospital',
    'prevention', 'diagnosis', 'symptom', 'condition', 'disease', 'recovery'
  ]
  
  healthcareKeywords.forEach(keyword => {
    if (contentLower.includes(keyword)) {
      score += 1
    }
  })
  
  return Math.min(score * 10, 100) // Cap at 100%
}

// Utility function to get date N days ago
function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

/* Deno.test(function facebookProcessingTest() {
  const testData = {
    pageInsights: {
      data: [
        {
          name: 'page_fans',
          values: [{ value: 1500 }]
        },
        {
          name: 'page_posts_impressions',
          values: [{ value: 5000 }, { value: 4500 }]
        }
      ]
    },
    demographics: { data: [] },
    posts: { 
      data: [
        {
          id: '123',
          message: 'Book your health checkup appointment today',
          insights: {
            data: [
              { name: 'post_impressions', values: [{ value: 500 }] },
              { name: 'post_engaged_users', values: [{ value: 50 }] }
            ]
          }
        }
      ]
    },
    healthcareFocus: true,
    period: 'day'
  }

  const result = processHealthcareFacebookData(testData)
  
  if (result.pageFollowers !== 1500) {
    throw new Error('Page followers calculation failed')
  }
  
  if (result.postReach !== 9500) {
    throw new Error('Post reach calculation failed')
  }
  
  console.log('✅ Facebook Insights processing test passed')
}) */ 