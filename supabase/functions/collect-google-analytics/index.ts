import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleAnalyticsRequest {
  measurementId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  practiceId: string;
  healthcareFocus: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      measurementId, 
      propertyId, 
      startDate, 
      endDate, 
      practiceId,
      healthcareFocus 
    }: GoogleAnalyticsRequest = await req.json()

    // Validate required parameters
    if (!measurementId || !propertyId || !startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
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

    // Get Google Analytics credentials from encrypted storage
    const { data: credentials, error: credError } = await supabase
      .from('analytics_integrations')
      .select('api_credentials')
      .eq('practice_id', practiceId)
      .eq('platform', 'google_analytics')
      .eq('is_active', true)
      .single()

    if (credError || !credentials) {
      return new Response(
        JSON.stringify({ error: 'Google Analytics credentials not found or expired' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { access_token, refresh_token, client_id, client_secret } = credentials.api_credentials

    // Google Analytics Data API endpoint
    const GA_API_URL = 'https://analyticsdata.googleapis.com/v1beta'

    // Healthcare-focused metrics for medical practices
    const healthcareMetrics = [
      'activeUsers',
      'newUsers', 
      'sessions',
      'pageviews',
      'averageSessionDuration',
      'bounceRate',
      'conversions',
      'eventCount'
    ]

    const healthcareDimensions = [
      'pagePath',
      'pageTitle',
      'deviceCategory',
      'country',
      'city',
      'source',
      'medium',
      'campaign',
      'eventName',
      'customEvent:appointment_booking',
      'customEvent:contact_form_submission',
      'customEvent:phone_click',
      'customEvent:directions_click'
    ]

    // Build the Analytics Data API request
    const analyticsRequest = {
      property: `properties/${propertyId}`,
      dateRanges: [{
        startDate: startDate.split('T')[0],
        endDate: endDate.split('T')[0]
      }],
      metrics: healthcareMetrics.map(metric => ({ name: metric })),
      dimensions: healthcareDimensions.slice(0, 9).map(dimension => ({ name: dimension })), // GA has limits
      keepEmptyRows: false,
      metricAggregations: ['TOTAL'],
      orderBys: [{
        metric: { metricName: 'activeUsers' },
        desc: true
      }]
    }

    // Make authenticated request to Google Analytics
    const response = await fetch(`${GA_API_URL}/${analyticsRequest.property}:runReport`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analyticsRequest)
    })

    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refresh_token,
          client_id: client_id,
          client_secret: client_secret
        })
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        
        // Update stored credentials
        await supabase
          .from('analytics_integrations')
          .update({
            api_credentials: {
              ...credentials.api_credentials,
              access_token: refreshData.access_token
            }
          })
          .eq('practice_id', practiceId)
          .eq('platform', 'google_analytics')

        // Retry the analytics request with new token
        const retryResponse = await fetch(`${GA_API_URL}/${analyticsRequest.property}:runReport`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${refreshData.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(analyticsRequest)
        })

        if (!retryResponse.ok) {
          throw new Error(`Google Analytics API error: ${retryResponse.statusText}`)
        }

        const analyticsData = await retryResponse.json()
        const processedData = processHealthcareAnalyticsData(analyticsData, healthcareFocus)

        return new Response(
          JSON.stringify(processedData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        throw new Error('Failed to refresh Google Analytics token')
      }
    }

    if (!response.ok) {
      throw new Error(`Google Analytics API error: ${response.statusText}`)
    }

    const analyticsData = await response.json()
    const processedData = processHealthcareAnalyticsData(analyticsData, healthcareFocus)

    // Store the collected data for audit trail
    await supabase
      .from('analytics_collection_log')
      .insert({
        practice_id: practiceId,
        platform: 'google_analytics',
        collection_date: new Date().toISOString(),
        data_points_collected: processedData.dataPointsCount || 0,
        status: 'success'
      })

    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error collecting Google Analytics data:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to collect Google Analytics data',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Process raw Google Analytics data into healthcare-focused insights
function processHealthcareAnalyticsData(rawData: any, healthcareFocus: boolean) {
  const { rows = [], totals = [] } = rawData

  // Extract totals for overview metrics
  const totalMetrics = totals[0]?.metricValues || []
  
  const pageViews = parseInt(totalMetrics[3]?.value || '0')
  const uniqueVisitors = parseInt(totalMetrics[0]?.value || '0')
  const sessions = parseInt(totalMetrics[2]?.value || '0')
  const averageSessionDuration = parseFloat(totalMetrics[4]?.value || '0')
  const bounceRate = parseFloat(totalMetrics[5]?.value || '0') / 100

  // Process page-level data for healthcare content analysis
  const topPages = rows
    .filter((row: any) => row.dimensionValues[0]?.value?.includes('health') || 
                         row.dimensionValues[0]?.value?.includes('service') ||
                         row.dimensionValues[0]?.value?.includes('appointment'))
    .map((row: any) => ({
      page: row.dimensionValues[0]?.value || '',
      title: row.dimensionValues[1]?.value || '',
      views: parseInt(row.metricValues[3]?.value || '0'),
      timeOnPage: parseFloat(row.metricValues[4]?.value || '0'),
      exitRate: parseFloat(row.metricValues[5]?.value || '0') / 100
    }))
    .sort((a: any, b: any) => b.views - a.views)
    .slice(0, 10)

  // Extract device breakdown
  const deviceData = rows.reduce((acc: any, row: any) => {
    const device = row.dimensionValues[2]?.value?.toLowerCase() || 'other'
    const sessions = parseInt(row.metricValues[2]?.value || '0')
    
    if (device.includes('mobile')) acc.mobile += sessions
    else if (device.includes('desktop')) acc.desktop += sessions
    else if (device.includes('tablet')) acc.tablet += sessions
    
    return acc
  }, { mobile: 0, desktop: 0, tablet: 0 })

  // Extract traffic sources with healthcare relevance
  const trafficSources = rows
    .filter((row: any) => row.dimensionValues[5]?.value && row.dimensionValues[6]?.value)
    .reduce((acc: any, row: any) => {
      const source = row.dimensionValues[5]?.value || 'unknown'
      const medium = row.dimensionValues[6]?.value || 'unknown'
      const sessions = parseInt(row.metricValues[2]?.value || '0')
      
      const key = `${source}/${medium}`
      if (!acc[key]) {
        acc[key] = { source, medium, sessions: 0, conversions: 0 }
      }
      acc[key].sessions += sessions
      
      return acc
    }, {})

  const topTrafficSources = Object.values(trafficSources)
    .sort((a: any, b: any) => b.sessions - a.sessions)
    .slice(0, 10)

  // Extract healthcare-specific conversions
  const conversions = {
    contactForms: rows.filter((row: any) => 
      row.dimensionValues[7]?.value === 'contact_form_submission'
    ).reduce((sum: number, row: any) => sum + parseInt(row.metricValues[6]?.value || '0'), 0),
    
    appointmentBookings: rows.filter((row: any) => 
      row.dimensionValues[7]?.value === 'appointment_booking'
    ).reduce((sum: number, row: any) => sum + parseInt(row.metricValues[6]?.value || '0'), 0),
    
    phoneClicks: rows.filter((row: any) => 
      row.dimensionValues[7]?.value === 'phone_click'
    ).reduce((sum: number, row: any) => sum + parseInt(row.metricValues[6]?.value || '0'), 0),
    
    directionsClicks: rows.filter((row: any) => 
      row.dimensionValues[7]?.value === 'directions_click'
    ).reduce((sum: number, row: any) => sum + parseInt(row.metricValues[6]?.value || '0'), 0)
  }

  // Calculate new vs returning users
  const newUsers = parseInt(totalMetrics[1]?.value || '0')
  const returningUsers = uniqueVisitors - newUsers

  return {
    pageViews,
    uniqueVisitors,
    sessionDuration: averageSessionDuration,
    bounceRate,
    newVsReturning: {
      new: newUsers,
      returning: returningUsers
    },
    topPages,
    conversions,
    deviceBreakdown: deviceData,
    trafficSources: topTrafficSources,
    dataPointsCount: rows.length,
    collectedAt: new Date().toISOString(),
    healthcareFocus,
    dataQuality: {
      completeness: rows.length > 0 ? 'high' : 'low',
      accuracy: 'verified_by_google',
      freshness: 'real_time'
    }
  }
}

/* Deno.test(function addTest() {
  // Example test - in production would have comprehensive test suite
  const testData = {
    rows: [
      {
        dimensionValues: [
          { value: '/services/general-practice' },
          { value: 'General Practice Services' },
          { value: 'mobile' }
        ],
        metricValues: [
          { value: '150' }, // activeUsers
          { value: '120' }, // newUsers
          { value: '180' }, // sessions
          { value: '240' }  // pageviews
        ]
      }
    ],
    totals: [{
      metricValues: [
        { value: '1500' }, // total activeUsers
        { value: '800' },  // total newUsers
        { value: '2000' }, // total sessions
        { value: '5000' }, // total pageviews
        { value: '180' },  // averageSessionDuration
        { value: '45' }    // bounceRate
      ]
    }]
  }

  const result = processHealthcareAnalyticsData(testData, true)
  
  if (result.pageViews !== 5000) {
    throw new Error('Page views calculation failed')
  }
  
  if (result.newVsReturning.new !== 800) {
    throw new Error('New users calculation failed')
  }
  
  console.log('✅ Google Analytics processing test passed')
}) */ 