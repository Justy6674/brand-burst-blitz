-- Add slack_webhook_url column to business_profiles table
ALTER TABLE public.business_profiles 
ADD COLUMN slack_webhook_url TEXT;

-- Create paddle_subscriptions table
CREATE TABLE public.paddle_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  customer_id TEXT NOT NULL,
  subscription_id TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create paddle_transactions table  
CREATE TABLE public.paddle_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id TEXT NOT NULL UNIQUE,
  subscription_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AUD',
  status TEXT NOT NULL,
  product_name TEXT,
  transaction_type TEXT NOT NULL DEFAULT 'subscription',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on new tables
ALTER TABLE public.paddle_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paddle_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for paddle_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.paddle_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.paddle_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage subscriptions" 
ON public.paddle_subscriptions 
FOR ALL 
USING (true);

-- Create RLS policies for paddle_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.paddle_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage transactions" 
ON public.paddle_transactions 
FOR ALL 
USING (true);

-- Create database functions for billing
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_id_param UUID)
RETURNS TABLE(
  id UUID,
  customer_id TEXT,
  subscription_id TEXT,
  product_id TEXT,
  status TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.customer_id,
    ps.subscription_id,
    ps.product_id,
    ps.status,
    ps.current_period_start,
    ps.current_period_end,
    ps.cancel_at_period_end
  FROM public.paddle_subscriptions ps
  WHERE ps.user_id = user_id_param
  AND ps.status = 'active'
  ORDER BY ps.created_at DESC
  LIMIT 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_billing_history(user_id_param UUID)
RETURNS TABLE(
  id UUID,
  transaction_id TEXT,
  amount INTEGER,
  currency TEXT,
  status TEXT,
  product_name TEXT,
  transaction_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pt.id,
    pt.transaction_id,
    pt.amount,
    pt.currency,
    pt.status,
    pt.product_name,
    pt.transaction_type,
    pt.created_at,
    pt.processed_at
  FROM public.paddle_transactions pt
  WHERE pt.user_id = user_id_param
  ORDER BY pt.created_at DESC;
END;
$function$;

-- Create update triggers
CREATE TRIGGER update_paddle_subscriptions_updated_at
BEFORE UPDATE ON public.paddle_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_paddle_transactions_updated_at
BEFORE UPDATE ON public.paddle_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();