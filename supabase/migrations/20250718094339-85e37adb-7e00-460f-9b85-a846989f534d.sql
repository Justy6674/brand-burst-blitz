-- Create admin_sessions table for secure admin authentication
CREATE TABLE public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage admin sessions
CREATE POLICY "Only admins can manage admin sessions"
ON public.admin_sessions
FOR ALL 
USING (is_admin(auth.uid()));

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view their own admin sessions"
ON public.admin_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Create admin_credentials table for secure password storage
CREATE TABLE public.admin_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  last_changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_credentials
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Only system can access admin credentials (no user access)
CREATE POLICY "System only access to admin credentials"
ON public.admin_credentials
FOR ALL
USING (false);

-- Create function to verify admin password
CREATE OR REPLACE FUNCTION public.verify_admin_password(
  input_password TEXT
) RETURNS TABLE(is_valid BOOLEAN, user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  stored_hash TEXT;
  stored_salt TEXT;
  admin_user_id UUID;
  computed_hash TEXT;
BEGIN
  -- Get admin credentials (for now, we'll create a default admin)
  SELECT ac.password_hash, ac.salt, ac.user_id
  INTO stored_hash, stored_salt, admin_user_id
  FROM public.admin_credentials ac
  WHERE ac.user_id = (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'admin' 
    AND ur.is_active = true 
    LIMIT 1
  );
  
  IF stored_hash IS NULL THEN
    RETURN QUERY SELECT false::BOOLEAN, NULL::UUID;
    RETURN;
  END IF;
  
  -- Compute hash of input password with stored salt
  computed_hash := encode(digest(stored_salt || input_password, 'sha256'), 'hex');
  
  -- Return result
  IF computed_hash = stored_hash THEN
    RETURN QUERY SELECT true::BOOLEAN, admin_user_id;
  ELSE
    RETURN QUERY SELECT false::BOOLEAN, NULL::UUID;
  END IF;
END;
$$;

-- Create function to create admin session
CREATE OR REPLACE FUNCTION public.create_admin_session(
  admin_user_id UUID,
  ip_addr TEXT DEFAULT NULL,
  user_agent_str TEXT DEFAULT NULL
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  session_token TEXT;
  expires_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate secure session token
  session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Set expiration to 24 hours from now
  expires_time := now() + INTERVAL '24 hours';
  
  -- Insert session
  INSERT INTO public.admin_sessions (
    user_id, 
    session_token, 
    expires_at, 
    ip_address, 
    user_agent
  ) VALUES (
    admin_user_id, 
    session_token, 
    expires_time, 
    ip_addr, 
    user_agent_str
  );
  
  RETURN session_token;
END;
$$;

-- Create function to validate admin session
CREATE OR REPLACE FUNCTION public.validate_admin_session(
  token TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  session_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM public.admin_sessions 
    WHERE session_token = token 
    AND expires_at > now()
  ) INTO session_exists;
  
  RETURN session_exists;
END;
$$;

-- Insert default admin credentials (temporary - should be changed)
-- Password will be "AdminJB2025!" with proper hashing
DO $$
DECLARE
  admin_user_id UUID;
  password_salt TEXT;
  password_hash TEXT;
BEGIN
  -- Get or create admin user
  SELECT ur.user_id INTO admin_user_id
  FROM public.user_roles ur
  WHERE ur.role = 'admin' AND ur.is_active = true
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Generate salt and hash for password "AdminJB2025!"
    password_salt := encode(gen_random_bytes(16), 'hex');
    password_hash := encode(digest(password_salt || 'AdminJB2025!', 'sha256'), 'hex');
    
    -- Insert admin credentials
    INSERT INTO public.admin_credentials (user_id, password_hash, salt)
    VALUES (admin_user_id, password_hash, password_salt)
    ON CONFLICT (user_id) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      salt = EXCLUDED.salt,
      last_changed_at = now();
  END IF;
END;
$$;