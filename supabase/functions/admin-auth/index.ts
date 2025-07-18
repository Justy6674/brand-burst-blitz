import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, password, sessionToken } = await req.json()

    if (action === 'login') {
      // Verify admin password
      const { data: verifyResult, error: verifyError } = await supabase
        .rpc('verify_admin_password', { input_password: password })

      if (verifyError) {
        console.error('Password verification error:', verifyError)
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication failed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        )
      }

      const result = verifyResult?.[0]
      if (!result?.is_valid) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid password' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        )
      }

      // Create admin session
      const userAgent = req.headers.get('user-agent') || 'Unknown'
      const xForwardedFor = req.headers.get('x-forwarded-for')
      const ipAddress = xForwardedFor?.split(',')[0] || 'Unknown'

      const { data: sessionToken, error: sessionError } = await supabase
        .rpc('create_admin_session', { 
          admin_user_id: result.user_id,
          ip_addr: ipAddress,
          user_agent_str: userAgent
        })

      if (sessionError) {
        console.error('Session creation error:', sessionError)
        return new Response(
          JSON.stringify({ success: false, error: 'Session creation failed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          sessionToken,
          message: 'Admin authenticated successfully' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'validate') {
      // Validate admin session
      const { data: isValid, error: validateError } = await supabase
        .rpc('validate_admin_session', { token: sessionToken })

      if (validateError) {
        console.error('Session validation error:', validateError)
        return new Response(
          JSON.stringify({ success: false, error: 'Session validation failed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          isValid,
          message: isValid ? 'Session valid' : 'Session expired' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('Admin auth error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})