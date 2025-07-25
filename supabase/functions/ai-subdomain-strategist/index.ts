import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdvancedSubdomainStrategy {
  subdomain: string
  strategy_type: 'content_hub' | 'service_portal' | 'location_gateway' | 'specialty_centre' | 'patient_education'
  target_audience: string[]
  content_pillars: string[]
  seo_strategy: {
    primary_keywords: string[]
    long_tail_opportunities: string[]
    content_gaps: string[]
    competitive_advantages: string[]
  }
  implementation_roadmap: {
    phase: number
    timeline: string
    tasks: string[]
    resources_needed: string[]
  }[]
  roi_projection: {
    month_1_traffic: number
    month_6_traffic: number
    month_12_traffic: number
    conversion_potential: number
    revenue_projection: number
  }
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

    const { analysis_id, enhancement_level = 'advanced' } = await req.json()

    if (!analysis_id) {
      throw new Error('Analysis ID is required')
    }

    // Get website analysis data
    const { data: websiteAnalysis, error: analysisError } = await supabaseClient
      .from('website_analyses')
      .select(`
        *,
        competitor_analyses(*),
        subdomain_opportunities(*)
      `)
      .eq('id', analysis_id)
      .eq('user_id', user.id)
      .single()

    if (analysisError) throw analysisError

    // Get Australian healthcare keywords for context
    const { data: healthcareKeywords } = await supabaseClient
      .from('australian_healthcare_keywords')
      .select('*')
      .order('monthly_searches', { ascending: false })
      .limit(100)

    // Generate advanced strategies using AI
    const advancedStrategies = await generateAdvancedStrategies(
      websiteAnalysis,
      healthcareKeywords || [],
      enhancement_level
    )

    // Create enhanced subdomain opportunities
    const enhancedOpportunities = []
    
    for (const strategy of advancedStrategies) {
      enhancedOpportunities.push({
        user_id: user.id,
        website_analysis_id: analysis_id,
        suggested_subdomain: strategy.subdomain,
        full_subdomain_url: `${strategy.subdomain}.${websiteAnalysis.domain_name}`,
        opportunity_type: strategy.strategy_type,
        target_keywords: strategy.seo_strategy.primary_keywords,
        content_strategy: {
          strategy_type: strategy.strategy_type,
          target_audience: strategy.target_audience,
          content_pillars: strategy.content_pillars,
          seo_strategy: strategy.seo_strategy,
          implementation_roadmap: strategy.implementation_roadmap
        },
        estimated_monthly_searches: calculateTotalSearchVolume(strategy.seo_strategy.primary_keywords, healthcareKeywords || []),
        competition_level: assessAdvancedCompetition(strategy, websiteAnalysis.competitor_analyses || []),
        implementation_priority: calculateAdvancedPriority(strategy, websiteAnalysis),
        roi_projection: strategy.roi_projection,
        implementation_difficulty: assessImplementationDifficulty(strategy),
        content_suggestions: generateContentSuggestions(strategy)
      })
    }

    // Update or insert enhanced opportunities
    const { error: opportunityError } = await supabaseClient
      .from('subdomain_opportunities')
      .upsert(enhancedOpportunities, { 
        onConflict: 'user_id,website_analysis_id,suggested_subdomain' 
      })

    if (opportunityError) throw opportunityError

    // Generate SEO opportunity score
    const seoScore = await calculateSEOOpportunityScore(
      websiteAnalysis,
      advancedStrategies,
      healthcareKeywords || []
    )

    await supabaseClient
      .from('seo_opportunity_scores')
      .upsert({
        user_id: user.id,
        website_analysis_id: analysis_id,
        current_seo_score: websiteAnalysis.scraped_content?.seoScore || 50,
        potential_seo_score: seoScore.potential_score,
        missed_opportunities_count: seoScore.missed_opportunities,
        estimated_additional_traffic: seoScore.additional_traffic,
        competitive_gap_score: seoScore.competitive_gap,
        implementation_complexity_score: seoScore.complexity_score,
        roi_confidence_score: seoScore.confidence_score
      }, { onConflict: 'user_id,website_analysis_id' })

    return new Response(
      JSON.stringify({
        success: true,
        analysis_id,
        strategies_generated: advancedStrategies.length,
        enhanced_opportunities: enhancedOpportunities.length,
        seo_opportunity_score: seoScore,
        message: 'Advanced subdomain strategies generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('AI strategy generation error:', error)
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

async function generateAdvancedStrategies(
  websiteAnalysis: any,
  healthcareKeywords: any[],
  enhancementLevel: string
): Promise<AdvancedSubdomainStrategy[]> {
  const strategies: AdvancedSubdomainStrategy[] = []
  
  const services = websiteAnalysis.services_identified || []
  const locations = websiteAnalysis.locations_identified || []
  const competitorData = websiteAnalysis.competitor_analyses || []

  // Strategy 1: Comprehensive Patient Education Hub
  strategies.push({
    subdomain: 'education',
    strategy_type: 'patient_education',
    target_audience: ['patients seeking health information', 'family members', 'health-conscious individuals'],
    content_pillars: [
      'condition explanations',
      'treatment options',
      'prevention strategies',
      'wellness tips',
      'healthcare navigation'
    ],
    seo_strategy: {
      primary_keywords: ['health education', 'patient resources', 'medical information', 'healthcare guide'],
      long_tail_opportunities: [
        'what is [condition] explained simply',
        'how to prepare for [procedure]',
        '[condition] treatment options australia',
        'understanding [medical term] for patients'
      ],
      content_gaps: identifyEducationContentGaps(services, healthcareKeywords),
      competitive_advantages: [
        'TGA/AHPRA compliant content',
        'Australian healthcare focus',
        'Plain English explanations',
        'Interactive health tools'
      ]
    },
    implementation_roadmap: [
      {
        phase: 1,
        timeline: '0-2 weeks',
        tasks: [
          'Set up subdomain DNS',
          'Install WordPress/CMS',
          'Create content template library',
          'Develop content approval workflow'
        ],
        resources_needed: ['web developer', 'content writer', 'medical reviewer']
      },
      {
        phase: 2,
        timeline: '2-8 weeks',
        tasks: [
          'Create 20+ foundational education articles',
          'Develop interactive health calculators',
          'Build symptom checker tool',
          'Implement search functionality'
        ],
        resources_needed: ['content team', 'UI/UX designer', 'medical consultant']
      },
      {
        phase: 3,
        timeline: '8-16 weeks',
        tasks: [
          'Launch patient portal integration',
          'Add video content library',
          'Implement AI chatbot for health questions',
          'Create mobile app integration'
        ],
        resources_needed: ['developer team', 'video production', 'AI specialist']
      }
    ],
    roi_projection: {
      month_1_traffic: 1200,
      month_6_traffic: 8500,
      month_12_traffic: 18000,
      conversion_potential: 0.025,
      revenue_projection: 54000
    }
  })

  // Strategy 2: Service-Specific Specialty Centres
  for (const service of services.slice(0, 3)) { // Top 3 services
    const serviceSubdomain = service.replace(/\s+/g, '').toLowerCase()
    
    strategies.push({
      subdomain: serviceSubdomain,
      strategy_type: 'specialty_centre',
      target_audience: [`${service} patients`, 'referring doctors', 'patients with related conditions'],
      content_pillars: [
        `${service} expertise`,
        'treatment approaches',
        'patient success stories',
        'research and innovation',
        'team credentials'
      ],
      seo_strategy: {
        primary_keywords: [
          `${service} specialist`,
          `${service} clinic`,
          `${service} treatment`,
          `best ${service} doctor`
        ],
        long_tail_opportunities: [
          `${service} specialist near me`,
          `${service} treatment options australia`,
          `private ${service} clinic`,
          `${service} consultation cost`
        ],
        content_gaps: identifyServiceContentGaps(service, competitorData),
        competitive_advantages: [
          'Specialised expertise focus',
          'Comprehensive service information',
          'Patient journey mapping',
          'Evidence-based treatment approaches'
        ]
      },
      implementation_roadmap: [
        {
          phase: 1,
          timeline: '0-1 week',
          tasks: [
            'Domain setup and SSL',
            'Service-specific branding',
            'Content strategy development',
            'SEO keyword research'
          ],
          resources_needed: ['web developer', 'brand designer', 'SEO specialist']
        },
        {
          phase: 2,
          timeline: '1-4 weeks',
          tasks: [
            'Create service landing pages',
            'Develop treatment information pages',
            'Build appointment booking system',
            'Implement patient testimonial system'
          ],
          resources_needed: ['content writer', 'developer', 'medical reviewer']
        }
      ],
      roi_projection: {
        month_1_traffic: estimateServiceTraffic(service, 'month_1'),
        month_6_traffic: estimateServiceTraffic(service, 'month_6'),
        month_12_traffic: estimateServiceTraffic(service, 'month_12'),
        conversion_potential: 0.035,
        revenue_projection: estimateServiceRevenue(service)
      }
    })
  }

  // Strategy 3: Location-Based Portals
  for (const location of locations.slice(0, 2)) { // Top 2 locations
    const locationSubdomain = location.replace(/\s+/g, '').toLowerCase()
    
    strategies.push({
      subdomain: locationSubdomain,
      strategy_type: 'location_gateway',
      target_audience: [`residents of ${location}`, 'local businesses', 'visiting patients'],
      content_pillars: [
        'local healthcare services',
        'community health programs',
        'clinic information',
        'local health resources',
        'emergency information'
      ],
      seo_strategy: {
        primary_keywords: [
          `doctor ${location}`,
          `medical centre ${location}`,
          `healthcare ${location}`,
          `clinic ${location}`
        ],
        long_tail_opportunities: [
          `bulk billing doctor ${location}`,
          `after hours clinic ${location}`,
          `specialist ${location}`,
          `medical centre ${location} open saturday`
        ],
        content_gaps: identifyLocationContentGaps(location, competitorData),
        competitive_advantages: [
          'Local community focus',
          'Neighbourhood health insights',
          'Local healthcare directory',
          'Community health partnerships'
        ]
      },
      implementation_roadmap: [
        {
          phase: 1,
          timeline: '0-1 week',
          tasks: [
            'Location subdomain setup',
            'Local SEO optimisation',
            'Google My Business integration',
            'Local directory submissions'
          ],
          resources_needed: ['local SEO specialist', 'web developer']
        }
      ],
      roi_projection: {
        month_1_traffic: estimateLocationTraffic(location, 'month_1'),
        month_6_traffic: estimateLocationTraffic(location, 'month_6'),
        month_12_traffic: estimateLocationTraffic(location, 'month_12'),
        conversion_potential: 0.042,
        revenue_projection: estimateLocationRevenue(location)
      }
    })
  }

  // Strategy 4: Telehealth & Digital Health Portal
  strategies.push({
    subdomain: 'telehealth',
    strategy_type: 'service_portal',
    target_audience: ['remote patients', 'busy professionals', 'mobility-limited patients'],
    content_pillars: [
      'virtual consultation process',
      'technology requirements',
      'remote monitoring',
      'digital health tools',
      'Medicare telehealth guide'
    ],
    seo_strategy: {
      primary_keywords: ['telehealth consultation', 'online doctor', 'virtual appointment', 'remote healthcare'],
      long_tail_opportunities: [
        'telehealth bulk billing australia',
        'online doctor consultation medicare',
        'virtual specialist appointment',
        'remote health monitoring'
      ],
      content_gaps: ['telehealth setup guides', 'technology troubleshooting', 'privacy and security'],
      competitive_advantages: [
        'Comprehensive telehealth education',
        'Technical support resources',
        'Medicare compliance guidance',
        'Multi-device compatibility'
      ]
    },
    implementation_roadmap: [
      {
        phase: 1,
        timeline: '0-2 weeks',
        tasks: [
          'Telehealth platform integration',
          'Patient onboarding system',
          'Technology compatibility checker',
          'Privacy compliance implementation'
        ],
        resources_needed: ['healthcare IT specialist', 'compliance officer', 'UX designer']
      }
    ],
    roi_projection: {
      month_1_traffic: 2400,
      month_6_traffic: 12000,
      month_12_traffic: 25000,
      conversion_potential: 0.028,
      revenue_projection: 84000
    }
  })

  return strategies
}

function calculateTotalSearchVolume(keywords: string[], healthcareKeywords: any[]): number {
  let totalVolume = 0
  
  for (const keyword of keywords) {
    const matchingKeyword = healthcareKeywords.find(hk => 
      hk.keyword.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(hk.keyword.toLowerCase())
    )
    
    if (matchingKeyword) {
      totalVolume += matchingKeyword.monthly_searches
    } else {
      // Estimate based on keyword type
      totalVolume += estimateKeywordVolume(keyword)
    }
  }
  
  return totalVolume
}

function estimateKeywordVolume(keyword: string): number {
  const keywordVolumes: { [key: string]: number } = {
    'health education': 8900,
    'patient resources': 3200,
    'medical information': 12500,
    'healthcare guide': 4800,
    'telehealth consultation': 12000,
    'online doctor': 15600,
    'virtual appointment': 8200,
    'remote healthcare': 5400
  }
  
  return keywordVolumes[keyword.toLowerCase()] || 2500
}

function assessAdvancedCompetition(strategy: AdvancedSubdomainStrategy, competitorData: any[]): string {
  // Analyse competitor subdomain strategies
  const competitorSubdomains = competitorData.flatMap(comp => comp.subdomains_found || [])
  const hasCompetitorSubdomain = competitorSubdomains.some(sub => 
    sub.includes(strategy.subdomain) || strategy.subdomain.includes(sub.split('.')[0])
  )
  
  if (hasCompetitorSubdomain && strategy.strategy_type === 'specialty_centre') return 'high'
  if (strategy.strategy_type === 'patient_education') return 'medium'
  if (strategy.strategy_type === 'location_gateway') return 'low'
  
  return 'medium'
}

function calculateAdvancedPriority(strategy: AdvancedSubdomainStrategy, websiteAnalysis: any): number {
  let priority = 5
  
  // ROI potential
  if (strategy.roi_projection.revenue_projection > 80000) priority += 3
  else if (strategy.roi_projection.revenue_projection > 50000) priority += 2
  else if (strategy.roi_projection.revenue_projection > 30000) priority += 1
  
  // Implementation difficulty
  if (strategy.implementation_roadmap.length === 1) priority += 1
  else if (strategy.implementation_roadmap.length > 2) priority -= 1
  
  // Strategic fit
  if (strategy.strategy_type === 'patient_education') priority += 2 // High value for healthcare
  if (strategy.strategy_type === 'service_portal' && strategy.subdomain === 'telehealth') priority += 2
  
  return Math.min(priority, 10)
}

function assessImplementationDifficulty(strategy: AdvancedSubdomainStrategy): string {
  const totalTasks = strategy.implementation_roadmap.reduce((sum, phase) => sum + phase.tasks.length, 0)
  const totalPhases = strategy.implementation_roadmap.length
  
  if (totalTasks > 15 || totalPhases > 3) return 'complex'
  if (totalTasks > 8 || totalPhases > 2) return 'medium'
  return 'easy'
}

function generateContentSuggestions(strategy: AdvancedSubdomainStrategy): string[] {
  const baseSuggestions = [
    `${strategy.subdomain} landing page with clear value proposition`,
    `FAQ section addressing common patient questions`,
    `Contact and appointment booking integration`,
    `Mobile-optimised user experience`
  ]
  
  const pillarsToSuggestions = strategy.content_pillars.map(pillar => 
    `Comprehensive ${pillar} resource section`
  )
  
  return [...baseSuggestions, ...pillarsToSuggestions].slice(0, 8)
}

function identifyEducationContentGaps(services: string[], keywords: any[]): string[] {
  const commonGaps = [
    'plain english medical explanations',
    'pre-appointment preparation guides',
    'insurance and medicare navigation',
    'health condition comparison tools',
    'interactive symptom assessments'
  ]
  
  // Add service-specific gaps
  const serviceGaps = services.map(service => `${service} patient education materials`)
  
  return [...commonGaps, ...serviceGaps].slice(0, 6)
}

function identifyServiceContentGaps(service: string, competitorData: any[]): string[] {
  return [
    `advanced ${service} treatment options`,
    `${service} cost and insurance information`,
    `${service} specialist team profiles`,
    `${service} patient journey timeline`,
    `${service} recovery and aftercare guides`
  ]
}

function identifyLocationContentGaps(location: string, competitorData: any[]): string[] {
  return [
    `${location} healthcare directory`,
    `${location} emergency services guide`,
    `${location} community health programs`,
    `${location} specialist referral network`,
    `${location} health and wellness events`
  ]
}

function estimateServiceTraffic(service: string, period: string): number {
  const serviceMultipliers = {
    'cardiology': { month_1: 800, month_6: 4200, month_12: 9500 },
    'dermatology': { month_1: 650, month_6: 3800, month_12: 8200 },
    'psychology': { month_1: 720, month_6: 4100, month_12: 8900 },
    'physiotherapy': { month_1: 680, month_6: 3900, month_12: 8400 }
  }
  
  return serviceMultipliers[service]?.[period] || { month_1: 500, month_6: 2800, month_12: 6200 }[period]
}

function estimateLocationTraffic(location: string, period: string): number {
  const locationMultipliers = {
    'melbourne': { month_1: 1200, month_6: 6800, month_12: 14500 },
    'sydney': { month_1: 1350, month_6: 7200, month_12: 15800 },
    'brisbane': { month_1: 980, month_6: 5400, month_12: 11200 }
  }
  
  return locationMultipliers[location]?.[period] || { month_1: 600, month_6: 3200, month_12: 7100 }[period]
}

function estimateServiceRevenue(service: string): number {
  const revenueMultipliers = {
    'cardiology': 95000,
    'dermatology': 78000,
    'psychology': 68000,
    'physiotherapy': 54000
  }
  
  return revenueMultipliers[service] || 45000
}

function estimateLocationRevenue(location: string): number {
  const locationRevenue = {
    'melbourne': 89000,
    'sydney': 94000,
    'brisbane': 72000,
    'perth': 65000,
    'adelaide': 58000
  }
  
  return locationRevenue[location] || 48000
}

async function calculateSEOOpportunityScore(
  websiteAnalysis: any,
  strategies: AdvancedSubdomainStrategy[],
  keywords: any[]
): Promise<any> {
  const currentScore = websiteAnalysis.scraped_content?.seoScore || 50
  const potentialTraffic = strategies.reduce((sum, strategy) => sum + strategy.roi_projection.month_12_traffic, 0)
  const totalRevenue = strategies.reduce((sum, strategy) => sum + strategy.roi_projection.revenue_projection, 0)
  
  return {
    potential_score: Math.min(currentScore + 35, 95), // Significant improvement potential
    missed_opportunities: strategies.length,
    additional_traffic: potentialTraffic,
    competitive_gap: 25, // Average gap vs competitors
    complexity_score: Math.ceil(strategies.length / 2), // Implementation complexity
    confidence_score: 8 // High confidence in Australian healthcare market
  }
}