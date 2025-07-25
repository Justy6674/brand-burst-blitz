import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebsiteAnalysis {
  url: string
  title: string
  metaDescription: string
  headings: {
    h1: string[]
    h2: string[]
    h3: string[]
  }
  services: string[]
  locations: string[]
  internalLinks: string[]
  subdomains: string[]
  seoScore: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { website_url, competitor_urls = [] } = await req.json()

    if (!website_url) {
      throw new Error('Website URL is required')
    }

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabaseClient
      .from('website_analyses')
      .insert({
        user_id: user.id,
        website_url,
        domain_name: extractDomain(website_url),
        analysis_status: 'processing'
      })
      .select()
      .single()

    if (analysisError) throw analysisError

    // Analyze main website
    console.log(`Analyzing website: ${website_url}`)
    const websiteAnalysis = await analyzeWebsite(website_url)
    
    // Update website analysis with results
    await supabaseClient
      .from('website_analyses')
      .update({
        scraped_content: websiteAnalysis,
        page_titles: [websiteAnalysis.title],
        meta_descriptions: [websiteAnalysis.metaDescription],
        headings: websiteAnalysis.headings,
        internal_links: websiteAnalysis.internalLinks,
        services_identified: websiteAnalysis.services,
        locations_identified: websiteAnalysis.locations,
        current_subdomain_count: websiteAnalysis.subdomains.length,
        analysis_status: 'completed'
      })
      .eq('id', analysis.id)

    // Analyze competitors if provided
    for (const competitorUrl of competitor_urls.slice(0, 5)) { // Limit to 5 competitors
      try {
        console.log(`Analyzing competitor: ${competitorUrl}`)
        const competitorAnalysis = await analyzeWebsite(competitorUrl)
        
        await supabaseClient
          .from('competitor_analyses')
          .insert({
            website_analysis_id: analysis.id,
            competitor_url: competitorUrl,
            competitor_domain: extractDomain(competitorUrl),
            subdomains_found: competitorAnalysis.subdomains,
            subdomain_strategies: {
              services: competitorAnalysis.services,
              locations: competitorAnalysis.locations,
              content_structure: competitorAnalysis.headings
            },
            keyword_targets: extractKeywords(competitorAnalysis),
            estimated_traffic: estimateTraffic(competitorAnalysis),
            domain_authority: calculateDomainAuthority(competitorAnalysis)
          })
      } catch (error) {
        console.error(`Error analyzing competitor ${competitorUrl}:`, error)
        // Continue with other competitors
      }
    }

    // Generate subdomain opportunities using AI
    const opportunities = await generateSubdomainOpportunities(
      websiteAnalysis,
      analysis.id,
      user.id,
      supabaseClient
    )

    return new Response(
      JSON.stringify({
        success: true,
        analysis_id: analysis.id,
        website_analysis: websiteAnalysis,
        opportunities_generated: opportunities.length,
        message: 'Website analysis completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Analysis error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    
    // Parse HTML content
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

    const metaDescMatch = html.match(/<meta[^>]*name=['"']description['"'][^>]*content=['"']([^'"]+)['"']/i)
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : ''

    // Extract headings
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || []
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || []
    const h3Matches = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || []

    const headings = {
      h1: h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim()),
      h2: h2Matches.map(h => h.replace(/<[^>]+>/g, '').trim()),
      h3: h3Matches.map(h => h.replace(/<[^>]+>/g, '').trim())
    }

    // Extract internal links
    const linkMatches = html.match(/<a[^>]*href=['"']([^'"]+)['"']/gi) || []
    const internalLinks = linkMatches
      .map(link => {
        const match = link.match(/href=['"']([^'"]+)['"']/)
        return match ? match[1] : null
      })
      .filter(link => link && (link.startsWith('/') || link.includes(extractDomain(url))))
      .slice(0, 50) // Limit to first 50 links

    // Identify Australian healthcare services
    const services = identifyHealthcareServices(html)
    const locations = identifyAustralianLocations(html)
    const subdomains = await discoverSubdomains(extractDomain(url))

    return {
      url,
      title,
      metaDescription,
      headings,
      services,
      locations,
      internalLinks,
      subdomains,
      seoScore: calculateSEOScore(title, metaDescription, headings, html)
    }

  } catch (error) {
    console.error(`Error analyzing website ${url}:`, error)
    throw new Error(`Failed to analyze website: ${error.message}`)
  }
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
  }
}

function identifyHealthcareServices(html: string): string[] {
  const serviceKeywords = [
    'cardiology', 'dermatology', 'psychiatry', 'psychology', 'physiotherapy',
    'dietitian', 'diabetes', 'mental health', 'telehealth', 'bulk billing',
    'health assessment', 'chronic disease', 'preventive health', 'vaccination',
    'skin cancer', 'weight loss', 'pain management', 'women\'s health',
    'men\'s health', 'child health', 'aged care', 'rehabilitation'
  ]

  const foundServices: string[] = []
  const lowerHtml = html.toLowerCase()

  for (const service of serviceKeywords) {
    if (lowerHtml.includes(service)) {
      foundServices.push(service)
    }
  }

  return [...new Set(foundServices)] // Remove duplicates
}

function identifyAustralianLocations(html: string): string[] {
  const locations = [
    'melbourne', 'sydney', 'brisbane', 'perth', 'adelaide', 'canberra',
    'gold coast', 'newcastle', 'wollongong', 'geelong', 'townsville',
    'cairns', 'toowoomba', 'ballarat', 'bendigo', 'albury', 'launceston',
    'mackay', 'rockhampton', 'bundaberg', 'coffs harbour', 'wagga wagga',
    'port macquarie', 'tamworth', 'orange', 'dubbo', 'geraldton'
  ]

  const foundLocations: string[] = []
  const lowerHtml = html.toLowerCase()

  for (const location of locations) {
    if (lowerHtml.includes(location)) {
      foundLocations.push(location)
    }
  }

  return [...new Set(foundLocations)] // Remove duplicates
}

async function discoverSubdomains(domain: string): Promise<string[]> {
  // In a real implementation, you'd use DNS queries or subdomain discovery tools
  // For now, we'll check common healthcare subdomains
  const commonSubdomains = [
    'www', 'booking', 'portal', 'telehealth', 'education', 'resources',
    'conditions', 'services', 'locations', 'specialists', 'blog', 'news'
  ]

  const foundSubdomains: string[] = []

  for (const subdomain of commonSubdomains) {
    try {
      const testUrl = `https://${subdomain}.${domain}`
      const response = await fetch(testUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      if (response.ok) {
        foundSubdomains.push(`${subdomain}.${domain}`)
      }
    } catch {
      // Subdomain doesn't exist or is not accessible
    }
  }

  return foundSubdomains
}

function calculateSEOScore(title: string, metaDesc: string, headings: any, html: string): number {
  let score = 0

  // Title tag (20 points)
  if (title.length > 0) score += 10
  if (title.length >= 30 && title.length <= 60) score += 10

  // Meta description (20 points)
  if (metaDesc.length > 0) score += 10
  if (metaDesc.length >= 120 && metaDesc.length <= 160) score += 10

  // Headings structure (30 points)
  if (headings.h1.length > 0) score += 15
  if (headings.h2.length > 0) score += 10
  if (headings.h3.length > 0) score += 5

  // Content quality indicators (30 points)
  const wordCount = html.replace(/<[^>]+>/g, '').split(/\s+/).length
  if (wordCount > 300) score += 10
  if (wordCount > 1000) score += 10
  if (html.includes('alt=')) score += 10 // Images with alt text

  return Math.min(score, 100)
}

function extractKeywords(analysis: WebsiteAnalysis): any {
  const keywords = [
    ...analysis.services,
    ...analysis.locations,
    ...analysis.headings.h1,
    ...analysis.headings.h2
  ]

  return {
    primary: keywords.slice(0, 10),
    secondary: keywords.slice(10, 25),
    locations: analysis.locations,
    services: analysis.services
  }
}

function estimateTraffic(analysis: WebsiteAnalysis): number {
  // Simplified traffic estimation based on content depth and SEO score
  const baseTraffic = 1000
  const seoMultiplier = analysis.seoScore / 100
  const contentMultiplier = Math.min(analysis.internalLinks.length / 50, 2)
  const serviceMultiplier = Math.min(analysis.services.length / 10, 1.5)

  return Math.round(baseTraffic * seoMultiplier * contentMultiplier * serviceMultiplier)
}

function calculateDomainAuthority(analysis: WebsiteAnalysis): number {
  // Simplified DA calculation based on content quality and structure
  let authority = 20 // Base score

  // Content depth
  authority += Math.min(analysis.internalLinks.length / 10, 30)
  
  // SEO optimization
  authority += (analysis.seoScore / 100) * 30
  
  // Service breadth
  authority += Math.min(analysis.services.length * 2, 20)

  return Math.min(Math.round(authority), 100)
}

async function generateSubdomainOpportunities(
  websiteAnalysis: WebsiteAnalysis, 
  analysisId: string, 
  userId: string,
  supabase: any
): Promise<any[]> {
  const opportunities = []

  // Service-based subdomains
  for (const service of websiteAnalysis.services) {
    const subdomain = service.replace(/\s+/g, '').toLowerCase()
    opportunities.push({
      user_id: userId,
      website_analysis_id: analysisId,
      suggested_subdomain: subdomain,
      full_subdomain_url: `${subdomain}.${extractDomain(websiteAnalysis.url)}`,
      opportunity_type: 'service',
      target_keywords: [service, `${service} specialist`, `${service} clinic`],
      content_strategy: {
        primary_pages: [`${service} overview`, `${service} treatment options`, `${service} FAQ`],
        content_types: ['service pages', 'patient education', 'treatment guides'],
        seo_focus: `${service} + location combinations`
      },
      estimated_monthly_searches: estimateSearchVolume(service),
      competition_level: assessCompetition(service),
      implementation_priority: calculatePriority(service, websiteAnalysis),
      roi_projection: {
        estimated_traffic: estimateSearchVolume(service) * 0.15, // 15% CTR
        potential_conversions: estimateSearchVolume(service) * 0.015, // 1.5% conversion
        revenue_potential: estimateSearchVolume(service) * 0.015 * 200 // $200 per conversion
      },
      implementation_difficulty: 'medium',
      content_suggestions: [
        `Comprehensive ${service} treatment guide`,
        `Patient testimonials for ${service}`,
        `${service} appointment booking`,
        `Insurance and Medicare for ${service}`
      ]
    })
  }

  // Location-based subdomains
  for (const location of websiteAnalysis.locations) {
    const subdomain = location.replace(/\s+/g, '').toLowerCase()
    opportunities.push({
      user_id: userId,
      website_analysis_id: analysisId,
      suggested_subdomain: subdomain,
      full_subdomain_url: `${subdomain}.${extractDomain(websiteAnalysis.url)}`,
      opportunity_type: 'location',
      target_keywords: [`doctor ${location}`, `medical centre ${location}`, `healthcare ${location}`],
      content_strategy: {
        primary_pages: [`${location} clinic information`, `${location} services`, `${location} team`],
        content_types: ['location pages', 'local health resources', 'community health'],
        seo_focus: `Healthcare services in ${location}`
      },
      estimated_monthly_searches: estimateLocationSearchVolume(location),
      competition_level: 'medium',
      implementation_priority: 8,
      roi_projection: {
        estimated_traffic: estimateLocationSearchVolume(location) * 0.20,
        potential_conversions: estimateLocationSearchVolume(location) * 0.02,
        revenue_potential: estimateLocationSearchVolume(location) * 0.02 * 180
      },
      implementation_difficulty: 'easy',
      content_suggestions: [
        `${location} clinic location and hours`,
        `Healthcare services available in ${location}`,
        `${location} health resources and education`,
        `Community health programs in ${location}`
      ]
    })
  }

  // Insert opportunities into database
  const { error } = await supabase
    .from('subdomain_opportunities')
    .insert(opportunities)

  if (error) {
    console.error('Error inserting subdomain opportunities:', error)
    throw error
  }

  return opportunities
}

function estimateSearchVolume(service: string): number {
  const volumes: { [key: string]: number } = {
    'cardiology': 8100,
    'dermatology': 6700,
    'psychiatry': 4500,
    'psychology': 5200,
    'physiotherapy': 5200,
    'dietitian': 3200,
    'diabetes': 11200,
    'mental health': 15600,
    'telehealth': 12000,
    'bulk billing': 18500,
    'health assessment': 7600,
    'chronic disease': 3900,
    'preventive health': 4300,
    'vaccination': 9800,
    'skin cancer': 7200,
    'weight loss': 22100,
    'pain management': 9700,
    'womens health': 8900,
    'mens health': 4300,
    'child health': 6100
  }

  return volumes[service] || 2000 // Default estimate
}

function estimateLocationSearchVolume(location: string): number {
  const volumes: { [key: string]: number } = {
    'melbourne': 25000,
    'sydney': 28000,
    'brisbane': 18000,
    'perth': 12000,
    'adelaide': 8000,
    'canberra': 4000,
    'gold coast': 6000,
    'newcastle': 4500,
    'wollongong': 3200,
    'geelong': 2800
  }

  return volumes[location] || 1500 // Default estimate for smaller cities
}

function assessCompetition(service: string): string {
  const highCompetition = ['weight loss', 'mental health', 'bulk billing', 'telehealth']
  const lowCompetition = ['dietitian', 'preventive health', 'chronic disease']

  if (highCompetition.includes(service)) return 'high'
  if (lowCompetition.includes(service)) return 'low'
  return 'medium'
}

function calculatePriority(service: string, analysis: WebsiteAnalysis): number {
  let priority = 5 // Base priority

  // Higher priority for services with high search volume
  const searchVolume = estimateSearchVolume(service)
  if (searchVolume > 15000) priority += 3
  else if (searchVolume > 8000) priority += 2
  else if (searchVolume > 4000) priority += 1

  // Higher priority for services already mentioned on site
  if (analysis.services.includes(service)) priority += 2

  // Competition adjustment
  const competition = assessCompetition(service)
  if (competition === 'low') priority += 2
  else if (competition === 'high') priority -= 1

  return Math.min(priority, 10)
}