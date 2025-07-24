import React from 'react';
import { supabase } from '@/integrations/supabase/client';

// Paddle Types
export interface PaddleProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
}

export interface PaddleSubscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  product_id: string;
  customer_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
}

export interface PaddleCustomer {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

// Healthcare-specific subscription plans
export const HEALTHCARE_PLANS = {
  starter: {
    id: 'healthcare_starter_monthly', // You'll get this from Paddle
    name: 'Healthcare Starter',
    description: 'Perfect for solo practitioners and small clinics',
    price: 49,
    currency: 'AUD',
    billing_cycle: 'monthly' as const,
    features: [
      'AI Content Generation with AHPRA Compliance',
      'Copy/Paste Social Media Content',
      'Basic Slack Notifications',
      'Blog Integration for 1 Website',
      'Up to 50 Posts per Month',
      'Email Support'
    ]
  },
  professional: {
    id: 'healthcare_professional_monthly',
    name: 'Healthcare Professional', 
    description: 'Ideal for growing practices and multi-location clinics',
    price: 99,
    currency: 'AUD',
    billing_cycle: 'monthly' as const,
    features: [
      'Everything in Starter',
      'Advanced Slack Integration with Custom Channels',
      'Voice-to-Content AI ("Hey JB" activation)',
      'Blog Integration for 5 Websites',
      'Up to 200 Posts per Month',
      'Team Management for up to 10 Staff',
      'Priority Support',
      'Weekly Performance Reports'
    ]
  },
  enterprise: {
    id: 'healthcare_enterprise_monthly',
    name: 'Healthcare Enterprise',
    description: 'For large practices, hospital groups, and healthcare networks',
    price: 199,
    currency: 'AUD', 
    billing_cycle: 'monthly' as const,
    features: [
      'Everything in Professional',
      'Unlimited Posts and Websites',
      'Custom AHPRA Compliance Rules',
      'Advanced Analytics with Google Analytics Integration',
      'Unlimited Team Members',
      'Custom Branding and White-label Options',
      'Dedicated Account Manager',
      'Phone Support',
      'API Access for Custom Integrations'
    ]
  }
};

class PaddleService {
  private apiKey: string;
  private environment: 'sandbox' | 'production';
  private baseUrl: string;

  constructor() {
    // These will be set via environment variables
    this.apiKey = import.meta.env.VITE_PADDLE_API_KEY || '';
    this.environment = (import.meta.env.VITE_PADDLE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.paddle.com' 
      : 'https://sandbox-api.paddle.com';
  }

  /**
   * Initialize Paddle checkout for healthcare subscription
   */
  async initiateCheckout(planId: string, customerEmail: string, customData?: Record<string, any>) {
    try {
      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const plan = Object.values(HEALTHCARE_PLANS).find(p => p.id === planId);
      if (!plan) throw new Error('Invalid plan selected');

      // Create checkout session via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('paddle-checkout', {
        body: {
          plan_id: planId,
          customer_email: customerEmail,
          user_id: user.user.id,
          custom_data: {
            user_id: user.user.id,
            plan_name: plan.name,
            ...customData
          },
          success_url: `${window.location.origin}/dashboard?payment=success`,
          cancel_url: `${window.location.origin}/pricing?payment=canceled`
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Paddle checkout error:', error);
      throw error;
    }
  }

  /**
   * Get current user's subscription status
   */
  async getSubscription(): Promise<PaddleSubscription | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('paddle_subscriptions')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as PaddleSubscription | null;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(subscriptionId: string) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('paddle-cancel-subscription', {
        body: {
          subscription_id: subscriptionId,
          user_id: user.user.id
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription plan
   */
  async updateSubscription(subscriptionId: string, newPlanId: string) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('paddle-update-subscription', {
        body: {
          subscription_id: subscriptionId,
          new_plan_id: newPlanId,
          user_id: user.user.id
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Get billing history
   */
  async getBillingHistory() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('paddle_transactions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching billing history:', error);
      return [];
    }
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    const subscription = await this.getSubscription();
    return subscription?.status === 'active';
  }

  /**
   * Get plan details by ID
   */
  getPlanDetails(planId: string): PaddleProduct | null {
    return Object.values(HEALTHCARE_PLANS).find(plan => plan.id === planId) || null;
  }

  /**
   * Get all available plans
   */
  getAllPlans(): PaddleProduct[] {
    return Object.values(HEALTHCARE_PLANS);
  }

  /**
   * Calculate savings for yearly plans
   */
  getYearlySavings(monthlyPrice: number): { yearlyPrice: number; savings: number; savingsPercent: number } {
    const yearlyPrice = Math.floor(monthlyPrice * 10); // 2 months free
    const savings = (monthlyPrice * 12) - yearlyPrice;
    const savingsPercent = Math.round((savings / (monthlyPrice * 12)) * 100);
    
    return {
      yearlyPrice,
      savings,
      savingsPercent
    };
  }
}

// Export singleton instance
export const paddleService = new PaddleService();

// Helper hook for React components
export function usePaddleSubscription() {
  const [subscription, setSubscription] = React.useState<PaddleSubscription | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await paddleService.getSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  return {
    subscription,
    loading,
    hasActiveSubscription: subscription?.status === 'active',
    planDetails: subscription ? paddleService.getPlanDetails(subscription.product_id) : null,
    refresh: async () => {
      setLoading(true);
      try {
        const sub = await paddleService.getSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('Error refreshing subscription:', error);
      } finally {
        setLoading(false);
      }
    }
  };
}

export default PaddleService;