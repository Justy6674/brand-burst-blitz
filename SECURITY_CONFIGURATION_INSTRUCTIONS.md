# Security Configuration Instructions

## Supabase Authentication Settings

To complete the security hardening, you need to update these settings in your Supabase dashboard:

### 1. Update OTP Settings
1. Go to Supabase Dashboard > Authentication > Settings
2. In the "Email OTP" section:
   - Change **OTP expiry** from current setting to **900 seconds (15 minutes)**
   - Previously was set to more than 1 hour which is too long

### 2. Enable Password Protection
1. In the same Authentication Settings page
2. Find the "Password Settings" section:
   - Enable **"Check for leaked passwords"** 
   - Set **Minimum password length** to at least **8 characters**
   - Enable **"Require uppercase letters"**
   - Enable **"Require lowercase letters"** 
   - Enable **"Require numbers"**

### 3. Additional Security Measures
1. In the "Security" section:
   - Enable **"Enable RLS for all tables"** (if not already enabled)
   - Set **"Maximum concurrent connections"** to a reasonable limit (e.g., 100)

### 4. Environment Variables
For the TOTP encryption to work properly, add this environment variable:
- **Variable Name**: `TOTP_ENCRYPTION_KEY`
- **Value**: Generate a secure 32+ character random string
- **Location**: Supabase Dashboard > Settings > Environment Variables

Example secure key generation:
```bash
openssl rand -base64 32
```

## Deployment Steps
1. Apply the database migration: `20250724000001_fix_privilege_escalation.sql`
2. Deploy the updated edge functions with encryption support
3. Update the Supabase dashboard settings as described above
4. Test MFA enrollment with new encryption
5. Verify XSS protection is working on blog posts

## Security Verification Checklist
- [ ] Privilege escalation fix deployed and tested
- [ ] XSS protection implemented with DOMPurify
- [ ] TOTP secrets encrypted in database
- [ ] OTP expiry reduced to 15 minutes
- [ ] Password strength requirements enabled
- [ ] Leaked password protection enabled
- [ ] TOTP encryption key set in environment

## Critical Security Notes
1. **Do not commit the TOTP_ENCRYPTION_KEY to git**
2. **Test role assignment to ensure admins can still assign roles**
3. **Verify existing TOTP secrets are migrated to encrypted format**
4. **Monitor authentication logs for suspicious activity**

All critical vulnerabilities have been addressed in the code. The remaining steps require configuration changes in the Supabase dashboard.