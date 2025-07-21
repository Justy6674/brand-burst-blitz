import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SketchIdeaRequest {
  sketchData: string; // Base64 data URL of the canvas
  practiceType: string;
  practiceId: string;
}

interface SketchIdeaResponse {
  title: string;
  description: string;
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
    const { sketchData, practiceType, practiceId }: SketchIdeaRequest = await req.json()

    console.log(`Analyzing sketch for practice type: ${practiceType}`)

    // Step 1: Analyze the sketch using OpenAI Vision
    const sketchAnalysis = await analyzeSketchWithVision(sketchData, practiceType)
    
    // Step 2: Generate content suggestions based on sketch interpretation
    const suggestions = await generateContentFromSketch(sketchAnalysis, practiceType)
    
    // Step 3: Calculate AHPRA compliance
    const complianceScore = calculateSketchComplianceScore(sketchAnalysis, suggestions)

    const response: SketchIdeaResponse = {
      title: sketchAnalysis.title,
      description: sketchAnalysis.description,
      analysis: sketchAnalysis.analysis,
      suggestions,
      complianceScore
    }

    console.log('Sketch analysis completed successfully')

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error analyzing sketch:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function analyzeSketchWithVision(sketchData: string, practiceType: string) {
  const prompt = `You are an AI assistant specializing in interpreting healthcare professional drawings and converting them to content ideas.

Analyze this sketch drawn by a ${practiceType} healthcare professional. The sketch may contain:
- Medical diagrams or anatomical drawings
- Mind maps of health topics
- Flow charts of patient processes
- Visual concepts for patient education
- Practice workflow diagrams
- Health awareness campaign ideas

Provide a structured analysis with:
1. Title: Brief descriptive title for the sketch concept
2. Description: What the sketch appears to show or represent
3. Healthcare Context: How this relates to patient care or education
4. Content Opportunities: What type of healthcare content this could become
5. AHPRA Considerations: How to make this compliant with healthcare advertising guidelines

Focus on the educational and professional value for healthcare content creation.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: sketchData } }
            ]
          }
        ],
        max_tokens: 600
      })
    })

    const result = await response.json()
    const analysisText = result.choices[0]?.message?.content || 'Unable to analyze sketch'

    // Parse the structured response
    return parseSketchAnalysis(analysisText)

  } catch (error) {
    console.error('Error with vision analysis:', error)
    return {
      title: 'Healthcare Sketch Idea',
      description: 'Unable to analyze sketch at this time',
      analysis: 'Sketch analysis failed - please try again or provide more context'
    }
  }
}

function parseSketchAnalysis(analysisText: string) {
  // Extract structured information from the AI response
  const lines = analysisText.split('\n')
  
  let title = 'Healthcare Sketch Idea'
  let description = 'Healthcare concept sketch'
  let analysis = analysisText

  // Look for structured elements
  for (const line of lines) {
    if (line.toLowerCase().includes('title:')) {
      title = line.replace(/title:/i, '').trim()
    } else if (line.toLowerCase().includes('description:')) {
      description = line.replace(/description:/i, '').trim()
    }
  }

  return { title, description, analysis }
}

async function generateContentFromSketch(sketchAnalysis: any, practiceType: string) {
  const suggestions: any = {}

  const contentTypes = [
    { type: 'blog_post', platform: 'blog' },
    { type: 'facebook_post', platform: 'Facebook' },
    { type: 'instagram_post', platform: 'Instagram' },
    { type: 'linkedin_post', platform: 'LinkedIn' }
  ]

  for (const contentType of contentTypes) {
    try {
      const prompt = `Based on this healthcare sketch analysis, create AHPRA-compliant content:

Sketch Title: ${sketchAnalysis.title}
Description: ${sketchAnalysis.description}
Analysis: ${sketchAnalysis.analysis}
Practice Type: ${practiceType}

Create a ${contentType.platform} post that:
1. Translates the visual concept into educational healthcare content
2. Follows AHPRA advertising guidelines
3. Maintains professional boundaries
4. Provides genuine patient education value
5. Uses Australian English
6. Includes appropriate disclaimers

${contentType.type === 'blog_post' ? 'Create a full blog post with title and structured content.' : 'Create an engaging social media post.'}
${contentType.type === 'instagram_post' ? 'Include relevant healthcare hashtags.' : ''}

Make it educational and professional.`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: contentType.type === 'blog_post' ? 800 : 300,
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

function calculateSketchComplianceScore(sketchAnalysis: any, suggestions: any): number {
  let score = 90 // Start higher for sketch-based content as it's typically more educational

  const analysisText = (sketchAnalysis.analysis || '').toLowerCase()
  const allContent = Object.values(suggestions).join(' ').toLowerCase()

  // Check for medical accuracy focus
  if (analysisText.includes('anatomical') || analysisText.includes('medical diagram')) {
    score += 5 // Bonus for educational medical content
  }

  // Check for patient education focus
  if (analysisText.includes('education') || analysisText.includes('awareness')) {
    score += 5
  }

  // Check for prohibited elements in generated content
  const prohibitedTerms = ['miracle', 'cure', 'guaranteed', 'amazing results']
  prohibitedTerms.forEach(term => {
    if (allContent.includes(term)) {
      score -= 10
    }
  })

  // Check for appropriate medical disclaimers
  if (allContent.includes('consult') || allContent.includes('medical advice')) {
    score += 5
  }

  return Math.max(75, Math.min(100, score))
} 