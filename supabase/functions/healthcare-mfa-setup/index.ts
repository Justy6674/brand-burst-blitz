import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as speakeasy from 'https://esm.sh/speakeasy@2.0.0'
import * as qrcode from 'https://esm.sh/qrcode@1.5.3'
import { createHash, randomBytes } from 'https://deno.land/std@0.168.0/node/crypto.ts'
import { encryptTOTPSecret, decryptTOTPSecret } from '../_shared/encryption.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MFASetupRequest {
  action: 'generate_totp_secret' | 'complete_totp_enrollment' | 'generate_backup_codes' | 'disable_mfa'
  user_id: string
  secret?: string
  verification_code?: string
  app_name?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const body: MFASetupRequest = await req.json()
    const { action, user_id, secret, verification_code, app_name = 'JBSAAS Healthcare' } = body

    // Verify user can only modify their own MFA settings
    if (user.id !== user_id) {
      throw new Error('Forbidden: Can only modify your own MFA settings')
    }

    switch (action) {
      case 'generate_totp_secret': {
        // Generate new TOTP secret
        const totpSecret = speakeasy.generateSecret({
          name: `${app_name} (${user.email})`,
          issuer: app_name,
          length: 32
        })

        // Generate QR code
        const qrCodeDataURL = await qrcode.toDataURL(totpSecret.otpauth_url!)

        // Generate initial backup codes
        const backupCodes = Array.from({ length: 10 }, () => 
          randomBytes(4).toString('hex').toUpperCase()
        )

        // Hash backup codes for storage
        const hashedBackupCodes = backupCodes.map(code => 
          createHash('sha256').update(code).digest('hex')
        )

        // Store encrypted secret and backup codes (not yet enabled)
        await supabaseClient
          .from('healthcare_mfa_settings')
          .upsert({
            user_id,
            totp_secret: encryptTOTPSecret(totpSecret.base32), // Now encrypted for security
            backup_codes: hashedBackupCodes,
            is_enabled: false,
            totp_enabled: false
          })

        return new Response(
          JSON.stringify({
            secret: totpSecret.base32,
            qr_code: qrCodeDataURL,
            backup_codes: backupCodes,
            enrollment_date: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'complete_totp_enrollment': {
        if (!verification_code) {
          throw new Error('Verification code required')
        }

        // Retrieve encrypted secret from database
        const { data: mfaSettings } = await supabaseClient
          .from('healthcare_mfa_settings')
          .select('totp_secret')
          .eq('user_id', user_id)
          .single()

        if (!mfaSettings?.totp_secret) {
          throw new Error('MFA setup not found')
        }

        // Decrypt the secret for verification
        const decryptedSecret = decryptTOTPSecret(mfaSettings.totp_secret)

        // Verify the TOTP code
        const verified = speakeasy.totp.verify({
          secret: decryptedSecret,
          encoding: 'base32',
          token: verification_code,
          window: 2
        })

        if (!verified) {
          // Log failed verification attempt
          await supabaseClient
            .from('healthcare_mfa_verification_attempts')
            .insert({
              user_id,
              method: 'totp',
              success: false,
              ip_address: req.headers.get('x-forwarded-for'),
              user_agent: req.headers.get('user-agent')
            })

          throw new Error('Invalid verification code')
        }

        // Enable MFA
        await supabaseClient
          .from('healthcare_mfa_settings')
          .update({
            is_enabled: true,
            totp_enabled: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user_id)

        // Log successful enrollment
        await supabaseClient
          .from('healthcare_mfa_verification_attempts')
          .insert({
            user_id,
            method: 'totp',
            success: true,
            ip_address: req.headers.get('x-forwarded-for'),
            user_agent: req.headers.get('user-agent')
          })

        return new Response(
          JSON.stringify({ success: true, message: 'MFA enrollment completed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'generate_backup_codes': {
        // Check if MFA is enabled
        const { data: mfaSettings } = await supabaseClient
          .from('healthcare_mfa_settings')
          .select('is_enabled')
          .eq('user_id', user_id)
          .single()

        if (!mfaSettings?.is_enabled) {
          throw new Error('MFA must be enabled to generate backup codes')
        }

        // Generate new backup codes
        const backupCodes = Array.from({ length: 10 }, () => 
          randomBytes(4).toString('hex').toUpperCase()
        )

        // Hash backup codes for storage
        const hashedBackupCodes = backupCodes.map(code => 
          createHash('sha256').update(code).digest('hex')
        )

        // Update backup codes
        await supabaseClient
          .from('healthcare_mfa_settings')
          .update({
            backup_codes: hashedBackupCodes,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user_id)

        // Log backup code generation
        await supabaseClient
          .from('healthcare_team_audit_log')
          .insert({
            team_id: null,
            performed_by: user_id,
            action: 'MFA backup codes regenerated',
            action_type: 'security',
            details: {
              codes_count: backupCodes.length,
              generation_date: new Date().toISOString()
            },
            compliance_impact: true
          })

        return new Response(
          JSON.stringify({ backup_codes: backupCodes }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'disable_mfa': {
        if (!verification_code) {
          throw new Error('Verification code required to disable MFA')
        }

        // Get current MFA settings
        const { data: mfaSettings } = await supabaseClient
          .from('healthcare_mfa_settings')
          .select('*')
          .eq('user_id', user_id)
          .single()

        if (!mfaSettings) {
          throw new Error('MFA not configured')
        }

        // Check if user is locked out
        const { data: lockStatus } = await supabaseClient
          .rpc('is_user_mfa_locked', { user_uuid: user_id })

        if (lockStatus) {
          throw new Error('Account locked due to failed MFA attempts')
        }

        let verified = false

        // Try TOTP verification first
        if (mfaSettings.totp_enabled && mfaSettings.totp_secret) {
          verified = speakeasy.totp.verify({
            secret: mfaSettings.totp_secret,
            encoding: 'base32',
            token: verification_code,
            window: 2
          })
        }

        // Try backup code if TOTP failed
        if (!verified && mfaSettings.backup_codes) {
          const codeHash = createHash('sha256').update(verification_code.toUpperCase()).digest('hex')
          verified = mfaSettings.backup_codes.includes(codeHash)

          if (verified) {
            // Remove used backup code
            const updatedCodes = mfaSettings.backup_codes.filter(code => code !== codeHash)
            await supabaseClient
              .from('healthcare_mfa_settings')
              .update({ backup_codes: updatedCodes })
              .eq('user_id', user_id)
          }
        }

        if (!verified) {
          // Log failed attempt
          await supabaseClient
            .rpc('log_mfa_verification_attempt', {
              user_uuid: user_id,
              method_type: 'disable_mfa',
              is_success: false,
              ip_addr: req.headers.get('x-forwarded-for'),
              user_agent_string: req.headers.get('user-agent')
            })

          throw new Error('Invalid verification code')
        }

        // Disable MFA
        await supabaseClient
          .from('healthcare_mfa_settings')
          .update({
            is_enabled: false,
            totp_enabled: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user_id)

        // Remove SMS backup
        await supabaseClient
          .from('healthcare_mfa_sms_backup')
          .delete()
          .eq('user_id', user_id)

        // Log successful disable
        await supabaseClient
          .rpc('log_mfa_verification_attempt', {
            user_uuid: user_id,
            method_type: 'disable_mfa',
            is_success: true,
            ip_addr: req.headers.get('x-forwarded-for'),
            user_agent_string: req.headers.get('user-agent')
          })

        return new Response(
          JSON.stringify({ success: true, message: 'MFA disabled successfully' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Healthcare MFA Setup Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'MFA setup operation failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

/* To deploy this function:
 * 1. supabase functions deploy healthcare-mfa-setup
 * 2. Set required environment variables in Supabase dashboard
 * 3. Grant necessary permissions for service role
 */ 