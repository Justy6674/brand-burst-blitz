import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VoiceIdeaRequest {
  audioData: string; // Base64 encoded audio
  practiceType: string;
  practiceId: string;
}

interface VoiceIdeaResponse {
  title: string;
  transcript: string;
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { audioData, practiceType, practiceId }: VoiceIdeaRequest = await req.json()

    console.log(`Processing voice idea for practice type: ${practiceType}`)

    // Step 1: Convert speech to text using OpenAI Whisper
    const transcript = await transcribeAudio(audioData)
    
    if (!transcript) {
      throw new Error('Failed to transcribe audio')
    }

    // Step 2: Analyze the transcript and generate content suggestions
    const analysis = await analyzeHealthcareIdea(transcript, practiceType)
    
    // Step 3: Generate platform-specific content suggestions
    const suggestions = await generateContentSuggestions(transcript, practiceType, analysis)
    
    // Step 4: Calculate AHPRA compliance score
    const complianceScore = calculateAHPRAComplianceScore(transcript, suggestions)

    // Step 5: Generate appropriate title
    const title = generateIdeaTitle(transcript)

    const response: VoiceIdeaResponse = {
      title,
      transcript,
      analysis,
      suggestions,
      complianceScore
    }

    console.log('Voice idea processed successfully')

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing voice idea:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function transcribeAudio(base64Audio: string): Promise<string> {
  try {
    // Convert base64 to blob
    const audioBuffer = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))
    
    // Create FormData for OpenAI Whisper API
    const formData = new FormData()
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' })
    formData.append('file', audioBlob, 'voice_idea.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'en')
    formData.append('prompt', 'Healthcare professional sharing content ideas about patient education, medical services, or practice information.')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`OpenAI Whisper API error: ${response.statusText}`)
    }

    const result = await response.json()
    return result.text || ''

  } catch (error) {
    console.error('Error transcribing audio:', error)
    throw new Error('Failed to transcribe audio')
  }
}

async function analyzeHealthcareIdea(transcript: string, practiceType: string): Promise<string> {
  const prompt = `You are an AI assistant specializing in Australian healthcare content analysis and AHPRA compliance.

Analyze this healthcare professional's voice idea:
"${transcript}"

Practice Type: ${practiceType}

Provide a comprehensive analysis that includes:
1. Content theme and target audience
2. Healthcare value proposition
3. Patient education potential
4. Professional boundaries considerations
5. AHPRA compliance opportunities
6. Potential content direction recommendations

Keep the analysis concise but thorough, focusing on how this idea can be developed into compliant healthcare content.`

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
        max_tokens: 500,
        temperature: 0.7
      })
    })

    const result = await response.json()
    return result.choices[0]?.message?.content || 'Analysis pending...'

  } catch (error) {
    console.error('Error analyzing idea:', error)
    return 'Analysis failed - please try again'
  }
}

async function generateContentSuggestions(transcript: string, practiceType: string, analysis: string) {
  const suggestions: any = {}

  // Generate different content types based on the idea
  const contentTypes = [
    { type: 'blog_post', platform: 'blog', description: 'educational blog post' },
    { type: 'facebook_post', platform: 'Facebook', description: 'Facebook post' },
    { type: 'instagram_post', platform: 'Instagram', description: 'Instagram post with hashtags' },
    { type: 'linkedin_post', platform: 'LinkedIn', description: 'professional LinkedIn post' }
  ]

  for (const contentType of contentTypes) {
    try {
      const prompt = `You are an expert Australian healthcare content creator specializing in AHPRA-compliant content.

Original idea: "${transcript}"
Practice type: ${practiceType}
Analysis: ${analysis}

Create a ${contentType.description} that:
1. Follows AHPRA advertising guidelines (no therapeutic claims, patient testimonials, or misleading statements)
2. Maintains professional boundaries
3. Provides patient education value
4. Is appropriate for ${contentType.platform}
5. Uses Australian English spelling
6. Includes appropriate medical disclaimers

${contentType.type === 'blog_post' ? 'Format as a complete blog post with title, introduction, main content, and conclusion.' : ''}
${contentType.type === 'instagram_post' ? 'Include AHPRA-compliant hashtags suitable for healthcare professionals.' : ''}
${contentType.type === 'linkedin_post' ? 'Focus on professional healthcare networking and education.' : ''}

Keep content professional, educational, and compliant.`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: contentType.type === 'blog_post' ? 1000 : 400,
          temperature: 0.7
        })
      })

      const result = await response.json()
      suggestions[contentType.type] = result.choices[0]?.message?.content || `${contentType.description} suggestion pending...`

    } catch (error) {
      console.error(`Error generating ${contentType.type}:`, error)
      suggestions[contentType.type] = `${contentType.description} generation failed`
    }
  }

  return suggestions
}

function calculateAHPRAComplianceScore(transcript: string, suggestions: any): number {
  let score = 100

  const transcriptLower = transcript.toLowerCase()
  const allContent = Object.values(suggestions).join(' ').toLowerCase()

  // Check for prohibited terms
  const prohibitedTerms = [
    'miracle', 'cure', 'guaranteed', 'amazing results', 'incredible',
    'testimonial', 'patient says', 'before and after', 'painless',
    'totally safe', 'no side effects', 'instant relief', 'breakthrough',
    'revolutionary', 'life-changing'
  ]

  prohibitedTerms.forEach(term => {
    if (transcriptLower.includes(term) || allContent.includes(term)) {
      score -= 15
    }
  })

  // Check for therapeutic claims
  const therapeuticClaims = [
    'treats', 'cures', 'heals', 'fixes', 'eliminates', 'removes',
    'prevents disease', 'stops pain', 'reverses condition'
  ]

  therapeuticClaims.forEach(claim => {
    if (transcriptLower.includes(claim) || allContent.includes(claim)) {
      score -= 20
    }
  })

  // Bonus for educational content
  const educationalTerms = [
    'education', 'learn', 'understand', 'awareness', 'information',
    'consult', 'speak to your doctor', 'seek medical advice'
  ]

  educationalTerms.forEach(term => {
    if (transcriptLower.includes(term) || allContent.includes(term)) {
      score += 5
    }
  })

  return Math.max(50, Math.min(100, score))
}

function generateIdeaTitle(transcript: string): string {
  // Extract key themes to create a descriptive title
  const words = transcript.toLowerCase().split(' ')
  
  // Common healthcare content themes
  if (words.includes('diabetes')) return 'Diabetes Education Content Idea'
  if (words.includes('heart') || words.includes('cardiac')) return 'Heart Health Content Idea'
  if (words.includes('mental') || words.includes('psychology')) return 'Mental Health Content Idea'
  if (words.includes('exercise') || words.includes('fitness')) return 'Exercise & Wellness Content Idea'
  if (words.includes('nutrition') || words.includes('diet')) return 'Nutrition Education Content Idea'
  if (words.includes('prevention') || words.includes('screening')) return 'Preventive Health Content Idea'
  if (words.includes('elderly') || words.includes('aged')) return 'Elderly Care Content Idea'
  if (words.includes('children') || words.includes('kids')) return 'Paediatric Health Content Idea'
  
  // Social media platform specific
  if (words.includes('facebook')) return 'Facebook Post Idea'
  if (words.includes('instagram')) return 'Instagram Content Idea'
  if (words.includes('blog')) return 'Blog Post Idea'
  if (words.includes('linkedin')) return 'LinkedIn Post Idea'
  
  // Default based on length
  if (transcript.length > 100) return 'Detailed Healthcare Content Idea'
  return 'Healthcare Content Idea'
} 