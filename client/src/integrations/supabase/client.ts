import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://qdjscrevewcuqotkzcrm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkanNjcmV2ZXdjdXFvdGt6Y3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTA1MzcsImV4cCI6MjA2ODI4NjUzN30.UUC8Ngu7MHca25Ol73q53d2sM_dvrLKCbDrLYIeo_90";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});