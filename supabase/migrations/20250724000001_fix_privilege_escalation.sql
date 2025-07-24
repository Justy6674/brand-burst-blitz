-- Fix critical privilege escalation vulnerability
-- Users should NOT be able to update their own role field

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create a new restricted policy that excludes role updates
CREATE POLICY "Users can update their own profile (except role)" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent role changes by ensuring the role stays the same
  role = (SELECT role FROM public.users WHERE id = auth.uid())
);

-- Create a separate admin-only policy for role updates
CREATE POLICY "Admins can update user roles" 
ON public.users 
FOR UPDATE 
USING (
  -- Only allow if the current user is an admin
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  -- Admin can update any user's role
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add audit logging for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log role changes
  IF OLD.role != NEW.role THEN
    INSERT INTO public.compliance_logs (
      user_id,
      action,
      content_preview,
      compliance_check_results
    ) VALUES (
      NEW.id,
      'role_change',
      format('Role changed from %s to %s by %s', OLD.role, NEW.role, auth.uid()),
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid(),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role change auditing
DROP TRIGGER IF EXISTS audit_user_role_changes ON public.users;
CREATE TRIGGER audit_user_role_changes
  AFTER UPDATE ON public.users
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.audit_role_changes();

-- Create function to safely assign roles (to be used by admin functions)
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id UUID,
  new_role public.user_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role public.user_role;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role
  FROM public.users
  WHERE id = auth.uid();
  
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;
  
  -- Update the user's role
  UPDATE public.users
  SET role = new_role,
      updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users (admin check is inside function)
GRANT EXECUTE ON FUNCTION public.assign_user_role TO authenticated;