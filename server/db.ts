import { createClient } from '@supabase/supabase-js';

// Check for Replit environment variable names first, then fallback to standard names
const supabaseUrl = process.env.VITE_NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase environment variables must be set. Found URL: " + !!supabaseUrl + ", Found Key: " + !!supabaseServiceKey);
}

export const supabaseAdmin = createClient(
  supabaseUrl!,
  supabaseServiceKey!
);
