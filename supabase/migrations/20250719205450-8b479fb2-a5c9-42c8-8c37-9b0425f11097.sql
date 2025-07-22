-- Update the handle_new_user_role function to ensure it creates a user role properly
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Insert user role record
  INSERT INTO public.user_roles (user_id, role, assigned_at, is_active)
  VALUES (NEW.id, 'trial', now(), true)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Insert user record in users table
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 
    'trial',
    now(), 
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = now();
  
  RETURN NEW;
END;
$$;