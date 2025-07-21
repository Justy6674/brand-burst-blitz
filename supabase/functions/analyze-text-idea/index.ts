import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TextIdeaRequest {
  textContent: string;
  practiceType: string;
  practiceId: string;
}

interface TextIdeaResponse {
  title: string;
  analysis: string;
  suggestions: {
    blog_post?: string;
    facebook_post?: string;
    instagram_post?: string;
    linkedin_post?: string;
  };
  complianceScore: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { textContent, practiceType, practiceId }: TextIdeaRequest = await req.json()

    console.log(`Analyzing text idea for practice type: ${practiceType}`)

    // Step 1: Analyze the text idea
    const analysis = await analyzeTextIdea(textContent, practiceType)
    
    // Step 2: Generate content suggestions
    const suggestions = await generateContentSuggestions(textContent, practiceType, analysis)
    
    // Step 3: Calculate AHPRA compliance score
    const complianceScore = calculateComplianceScore(textContent, suggestions)
    
    // Step 4: Generate title
    const title = generateTitle(textContent)

    const response: TextIdeaResponse = {
      title,
      analysis,
      suggestions,
      complianceScore
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error analyzing text idea:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function analyzeTextIdea(textContent: string, practiceType: string): Promise<string> {
  const prompt = `You are an AI assistant specializing in Australian healthcare content strategy and AHPRA compliance.

Analyze this healthcare professional's text idea:
"${textContent}"

Practice Type: ${practiceType}

Provide a comprehensive analysis covering:
1. Content theme and healthcare focus
2. Target patient audience
3. Educational value and patient benefit
4. AHPRA compliance considerations
5. Professional positioning opportunities
6. Platform suitability recommendations

Keep the analysis focused on how this idea can be developed into effective, compliant healthcare content.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.7
      })
    })

    const result = await response.json()
    return result.choices[0]?.message?.content || 'Analysis pending...'

  } catch (error) {
    console.error('Error analyzing text idea:', error)
    return 'Analysis failed - please try again'
  }
}

async function generateContentSuggestions(textContent: string, practiceType: string, analysis: string) {
  const suggestions: any = {}

  const contentTypes = [
    { type: 'blog_post', platform: 'blog', maxTokens: 1000 },
    { type: 'facebook_post', platform: 'Facebook', maxTokens: 300 },
    { type: 'instagram_post', platform: 'Instagram', maxTokens: 300 },
    { type: 'linkedin_post', platform: 'LinkedIn', maxTokens: 400 }
  ]

  for (const contentType of contentTypes) {
    try {
      const prompt = `Create AHPRA-compliant healthcare content based on this idea:

Original Text: "${textContent}"
Practice Type: ${practiceType}
Analysis: ${analysis}

Create a ${contentType.platform} post that:
1. Follows AHPRA advertising guidelines (no therapeutic claims, testimonials, or misleading statements)
2. Maintains professional boundaries and appropriate patient communication
3. Provides genuine educational value to patients
4. Uses Australian English spelling and medical terminology
5. Includes appropriate medical disclaimers where needed
6. Is suitable for ${contentType.platform} audience and format

${contentType.type === 'blog_post' ? 'Create a complete blog post with engaging title, introduction, main content sections, and conclusion.' : ''}
${contentType.type === 'instagram_post' ? 'Include relevant, AHPRA-compliant hashtags for healthcare professionals.' : ''}
${contentType.type === 'linkedin_post' ? 'Focus on professional healthcare networking and thought leadership.' : ''}
${contentType.type === 'facebook_post' ? 'Create engaging, educational content suitable for patient audiences.' : ''}

Make the content professional, educational, and compliant with Australian healthcare standards.`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: contentType.maxTokens,
          temperature: 0.7
        })
      })

      const result = await response.json()
      suggestions[contentType.type] = result.choices[0]?.message?.content || `${contentType.platform} content pending...`

    } catch (error) {
      console.error(`Error generating ${contentType.type}:`, error)
      suggestions[contentType.type] = `${contentType.platform} content generation failed`
    }
  }

  return suggestions
}

function calculateComplianceScore(textContent: string, suggestions: any): number {
  let score = 95 // Start high for text-based ideas as they tend to be more thoughtful

  const textLower = textContent.toLowerCase()
  const allContent = Object.values(suggestions).join(' ').toLowerCase()

  // Check for problematic terms
  const prohibitedTerms = [
    'miracle', 'cure', 'guaranteed', 'amazing results', 'incredible breakthrough',
    'testimonial', 'patient says', 'before and after', 'totally safe',
    'no side effects', 'instant relief', 'life-changing'
  ]

  prohibitedTerms.forEach(term => {
    if (textLower.includes(term) || allContent.includes(term)) {
      score -= 12
    }
  })

  // Check for therapeutic claims
  const therapeuticClaims = [
    'treats', 'cures', 'heals', 'fixes', 'eliminates disease',
    'prevents illness', 'stops pain', 'reverses condition'
  ]

  therapeuticClaims.forEach(claim => {
    if (textLower.includes(claim) || allContent.includes(claim)) {
      score -= 15
    }
  })

  // Bonus for educational indicators
  const educationalTerms = [
    'education', 'learn', 'understand', 'awareness', 'information',
    'consult your doctor', 'seek medical advice', 'speak to your healthcare provider'
  ]

  educationalTerms.forEach(term => {
    if (textLower.includes(term) || allContent.includes(term)) {
      score += 3
    }
  })

  // Bonus for professional language
  const professionalTerms = [
    'evidence-based', 'research shows', 'clinical studies', 'medical literature',
    'professional guidelines', 'best practice'
  ]

  professionalTerms.forEach(term => {
    if (textLower.includes(term) || allContent.includes(term)) {
      score += 2
    }
  })

  return Math.max(60, Math.min(100, score))
}

function generateTitle(textContent: string): string {
  const text = textContent.toLowerCase()
  
  // Healthcare topics
  if (text.includes('diabetes')) return 'Diabetes Education Content Idea'
  if (text.includes('heart') || text.includes('cardiovascular')) return 'Heart Health Content Idea'
  if (text.includes('mental health') || text.includes('depression') || text.includes('anxiety')) return 'Mental Health Content Idea'
  if (text.includes('exercise') || text.includes('fitness') || text.includes('physical activity')) return 'Exercise & Wellness Content Idea'
  if (text.includes('nutrition') || text.includes('diet') || text.includes('healthy eating')) return 'Nutrition Education Content Idea'
  if (text.includes('prevention') || text.includes('screening') || text.includes('check-up')) return 'Preventive Health Content Idea'
  if (text.includes('elderly') || text.includes('aged care') || text.includes('seniors')) return 'Elderly Care Content Idea'
  if (text.includes('children') || text.includes('paediatric') || text.includes('kids')) return 'Paediatric Health Content Idea'
  if (text.includes('women') || text.includes('pregnancy') || text.includes('maternal')) return 'Women\'s Health Content Idea'
  if (text.includes('pain') || text.includes('chronic') || text.includes('management')) return 'Pain Management Content Idea'
  
  // Content types
  if (text.includes('blog')) return 'Blog Post Idea'
  if (text.includes('facebook')) return 'Facebook Post Idea'
  if (text.includes('instagram')) return 'Instagram Content Idea'
  if (text.includes('linkedin')) return 'LinkedIn Post Idea'
  if (text.includes('social media')) return 'Social Media Content Idea'
  
  // Practice types
  if (text.includes('gp') || text.includes('general practice')) return 'General Practice Content Idea'
  if (text.includes('psychology') || text.includes('mental health')) return 'Psychology Content Idea'
  if (text.includes('physiotherapy') || text.includes('physio')) return 'Physiotherapy Content Idea'
  if (text.includes('dental') || text.includes('oral health')) return 'Dental Health Content Idea'
  
  // Default based on content length and complexity
  if (textContent.length > 200) return 'Comprehensive Healthcare Content Idea'
  if (textContent.length > 100) return 'Detailed Healthcare Content Idea'
  
  return 'Healthcare Content Idea'
} 