-- Create Paddle subscriptions table
CREATE TABLE IF NOT EXISTS paddle_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paddle_subscription_id TEXT UNIQUE NOT NULL,
  paddle_customer_id TEXT NOT NULL,
  product_id TEXT NOT NULL, -- healthcare_starter_monthly, etc.
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Paddle transactions table
CREATE TABLE IF NOT EXISTS paddle_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  paddle_transaction_id TEXT UNIQUE NOT NULL,
  paddle_subscription_id TEXT REFERENCES paddle_subscriptions(paddle_subscription_id),
  amount TEXT, -- Stored as string to preserve precision
  currency TEXT NOT NULL DEFAULT 'AUD',
  status TEXT NOT NULL, -- completed, failed, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Paddle checkout sessions table
CREATE TABLE IF NOT EXISTS paddle_checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkout_id TEXT,
  plan_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, abandoned
  checkout_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create Paddle webhook logs table for debugging
CREATE TABLE IF NOT EXISTS paddle_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE paddle_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paddle_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paddle_checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paddle_webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for paddle_subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON paddle_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
ON paddle_subscriptions FOR ALL
USING (auth.role() = 'service_role');

-- RLS Policies for paddle_transactions
CREATE POLICY "Users can view their own transactions"
ON paddle_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions"
ON paddle_transactions FOR ALL
USING (auth.role() = 'service_role');

-- RLS Policies for paddle_checkout_sessions
CREATE POLICY "Users can view their own checkout sessions"
ON paddle_checkout_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all checkout sessions"
ON paddle_checkout_sessions FOR ALL
USING (auth.role() = 'service_role');

-- RLS Policies for paddle_webhook_logs (service role only)
CREATE POLICY "Service role can manage webhook logs"
ON paddle_webhook_logs FOR ALL
USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_paddle_subscriptions_user_id ON paddle_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_paddle_subscriptions_status ON paddle_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_paddle_subscriptions_paddle_id ON paddle_subscriptions(paddle_subscription_id);

CREATE INDEX IF NOT EXISTS idx_paddle_transactions_user_id ON paddle_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_paddle_transactions_subscription_id ON paddle_transactions(paddle_subscription_id);
CREATE INDEX IF NOT EXISTS idx_paddle_transactions_created_at ON paddle_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_paddle_checkout_sessions_user_id ON paddle_checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_paddle_checkout_sessions_status ON paddle_checkout_sessions(status);

CREATE INDEX IF NOT EXISTS idx_paddle_webhook_logs_event_type ON paddle_webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_paddle_webhook_logs_processed_at ON paddle_webhook_logs(processed_at DESC);

-- Function to get user's current subscription with plan details
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  paddle_subscription_id TEXT,
  product_id TEXT,
  status TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  plan_name TEXT,
  plan_price NUMERIC,
  days_until_renewal INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id as subscription_id,
    ps.paddle_subscription_id,
    ps.product_id,
    ps.status,
    ps.current_period_start,
    ps.current_period_end,
    ps.trial_end,
    CASE 
      WHEN ps.product_id = 'healthcare_starter_monthly' THEN 'Healthcare Starter'
      WHEN ps.product_id = 'healthcare_professional_monthly' THEN 'Healthcare Professional'
      WHEN ps.product_id = 'healthcare_enterprise_monthly' THEN 'Healthcare Enterprise'
      ELSE 'Unknown Plan'
    END as plan_name,
    CASE 
      WHEN ps.product_id = 'healthcare_starter_monthly' THEN 49.00
      WHEN ps.product_id = 'healthcare_professional_monthly' THEN 99.00
      WHEN ps.product_id = 'healthcare_enterprise_monthly' THEN 199.00
      ELSE 0.00
    END as plan_price,
    CASE 
      WHEN ps.current_period_end IS NOT NULL THEN 
        EXTRACT(DAY FROM ps.current_period_end - NOW())::INTEGER
      ELSE NULL
    END as days_until_renewal
  FROM paddle_subscriptions ps
  WHERE ps.user_id = p_user_id 
    AND ps.status IN ('active', 'trialing')
  ORDER BY ps.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to get billing history with plan details
CREATE OR REPLACE FUNCTION get_user_billing_history(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  transaction_id UUID,
  paddle_transaction_id TEXT,
  amount TEXT,
  currency TEXT,
  status TEXT,
  plan_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.id as transaction_id,
    pt.paddle_transaction_id,
    pt.amount,
    pt.currency,
    pt.status,
    CASE 
      WHEN ps.product_id = 'healthcare_starter_monthly' THEN 'Healthcare Starter'
      WHEN ps.product_id = 'healthcare_professional_monthly' THEN 'Healthcare Professional'
      WHEN ps.product_id = 'healthcare_enterprise_monthly' THEN 'Healthcare Enterprise'
      ELSE 'Unknown Plan'
    END as plan_name,
    pt.created_at
  FROM paddle_transactions pt
  LEFT JOIN paddle_subscriptions ps ON pt.paddle_subscription_id = ps.paddle_subscription_id
  WHERE pt.user_id = p_user_id
  ORDER BY pt.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_paddle_subscriptions_updated_at 
    BEFORE UPDATE ON paddle_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON paddle_subscriptions TO authenticated;
GRANT SELECT ON paddle_transactions TO authenticated;
GRANT SELECT ON paddle_checkout_sessions TO authenticated;

GRANT EXECUTE ON FUNCTION get_user_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_billing_history(UUID, INTEGER) TO authenticated;

-- Service role permissions for webhook processing
GRANT ALL ON paddle_subscriptions TO service_role;
GRANT ALL ON paddle_transactions TO service_role;
GRANT ALL ON paddle_checkout_sessions TO service_role;
GRANT ALL ON paddle_webhook_logs TO service_role;