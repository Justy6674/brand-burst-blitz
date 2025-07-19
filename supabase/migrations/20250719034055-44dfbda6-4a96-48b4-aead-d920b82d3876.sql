-- Create OAuth state tracking table for secure OAuth flows
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  state_token TEXT NOT NULL,
  code_verifier TEXT,
  redirect_uri TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '10 minutes'),
  used BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can manage their OAuth states" ON public.oauth_states
FOR ALL USING (auth.uid() = user_id);

-- Update social_accounts table for proper OAuth storage
ALTER TABLE public.social_accounts 
ADD COLUMN IF NOT EXISTS oauth_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS oauth_scope TEXT,
ADD COLUMN IF NOT EXISTS account_username TEXT,
ADD COLUMN IF NOT EXISTS account_avatar TEXT,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

-- Create publishing queue worker status tracking
CREATE TABLE IF NOT EXISTS public.publishing_queue_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_item_id UUID NOT NULL REFERENCES public.publishing_queue(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  platform_response JSONB,
  published_url TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for queue status
ALTER TABLE public.publishing_queue_status ENABLE ROW LEVEL SECURITY;

-- Policy for queue status
CREATE POLICY "Users can view their publishing status" ON public.publishing_queue_status
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.publishing_queue pq
    JOIN public.posts p ON p.id = pq.post_id
    WHERE pq.id = publishing_queue_status.queue_item_id
    AND p.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_platform ON public.oauth_states(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON public.oauth_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_publishing_queue_status_queue_item ON public.publishing_queue_status(queue_item_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_platform ON public.social_accounts(user_id, platform);