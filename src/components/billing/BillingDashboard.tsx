import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { paddleService, HEALTHCARE_PLANS } from '@/lib/paddle-service';

interface Subscription {
  subscription_id: string;
  paddle_subscription_id: string;
  product_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  plan_name: string;
  plan_price: number;
  days_until_renewal: number;
}

interface Transaction {
  transaction_id: string;
  paddle_transaction_id: string;
  amount: string;
  currency: string;
  status: string;
  plan_name: string;
  created_at: string;
}

const BillingDashboard: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Fetch current subscription directly from paddle_subscriptions table
      const { data: subData, error: subError } = await supabase
        .from('paddle_subscriptions')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError) {
        console.error('Error fetching subscription:', subError);
      } else if (subData) {
        // Transform data to match expected interface
        const transformedSub = {
          subscription_id: subData.subscription_id,
          paddle_subscription_id: subData.subscription_id,
          product_id: subData.product_id,
          status: subData.status,
          current_period_start: subData.current_period_start,
          current_period_end: subData.current_period_end,
          trial_end: undefined,
          plan_name: paddleService.getPlanDetails(subData.product_id)?.name || 'Unknown Plan',
          plan_price: paddleService.getPlanDetails(subData.product_id)?.price || 0,
          days_until_renewal: Math.ceil((new Date(subData.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        };
        setSubscription(transformedSub);
      }

      // Fetch billing history directly from paddle_transactions table
      const { data: transData, error: transError } = await supabase
        .from('paddle_transactions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transError) {
        console.error('Error fetching transactions:', transError);
      } else if (transData) {
        // Transform data to match expected interface
        const transformedTransactions = transData.map(trans => ({
          transaction_id: trans.id,
          paddle_transaction_id: trans.transaction_id,
          amount: trans.amount.toString(),
          currency: trans.currency,
          status: trans.status,
          plan_name: trans.product_name || 'Subscription',
          created_at: trans.created_at
        }));
        setTransactions(transformedTransactions);
      }

    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast({
        title: "Error",
        description: "Failed to load billing information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      setActionLoading('cancel');
      await paddleService.cancelSubscription(subscription.paddle_subscription_id);
      
      toast({
        title: "Subscription Canceled",
        description: "Your subscription will be canceled at the end of the current billing period."
      });

      await fetchBillingData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to cancel subscription: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgrade = async (newPlanId: string) => {
    if (!subscription) return;

    try {
      setActionLoading('upgrade');
      await paddleService.updateSubscription(subscription.paddle_subscription_id, newPlanId);
      
      toast({
        title: "Plan Updated",
        description: "Your subscription has been upgraded successfully!"
      });

      await fetchBillingData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to upgrade plan: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartTrial = async (planId: string) => {
    try {
      setActionLoading('trial');
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error('User email not found');

      const checkoutData = await paddleService.initiateCheckout(
        planId, 
        user.user.email,
        { source: 'billing_dashboard' }
      );

      // Redirect to Paddle checkout
      if (checkoutData.checkout_url) {
        window.location.href = checkoutData.checkout_url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to start trial: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: string, currency: string = 'AUD') => {
    const numAmount = parseFloat(amount) / 100; // Convert cents to dollars
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency
    }).format(numAmount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, color: 'bg-green-500', label: 'Active' },
      trialing: { variant: 'secondary' as const, color: 'bg-blue-500', label: 'Free Trial' },
      canceled: { variant: 'destructive' as const, color: 'bg-red-500', label: 'Canceled' },
      past_due: { variant: 'destructive' as const, color: 'bg-orange-500', label: 'Past Due' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {subscription ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Subscription
              </span>
              {getStatusBadge(subscription.status)}
            </CardTitle>
            <CardDescription>
              Manage your healthcare marketing platform subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{subscription.plan_name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${subscription.plan_price}/month
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">
                    {subscription.days_until_renewal} days left
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">AHPRA Compliant</p>
                  <p className="text-sm text-muted-foreground">
                    Australian healthcare ready
                  </p>
                </div>
              </div>
            </div>

            {subscription.trial_end && new Date(subscription.trial_end) > new Date() && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your free trial expires on {new Date(subscription.trial_end).toLocaleDateString()}. 
                  Billing will begin automatically unless you cancel.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-2">
              {subscription.status === 'active' && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelSubscription}
                    disabled={actionLoading === 'cancel'}
                  >
                    {actionLoading === 'cancel' ? 'Canceling...' : 'Cancel Subscription'}
                  </Button>
                  
                  {subscription.product_id !== 'healthcare_enterprise_monthly' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpgrade('healthcare_enterprise_monthly')}
                      disabled={actionLoading === 'upgrade'}
                    >
                      {actionLoading === 'upgrade' ? 'Upgrading...' : 'Upgrade Plan'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              No Active Subscription
            </CardTitle>
            <CardDescription>
              Start your healthcare marketing journey with a free trial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Object.values(HEALTHCARE_PLANS).map((plan) => (
                <Card key={plan.id} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleStartTrial(plan.id)}
                      disabled={actionLoading === 'trial'}
                      variant={plan.id === 'healthcare_professional_monthly' ? 'default' : 'outline'}
                    >
                      {actionLoading === 'trial' ? 'Starting...' : 'Start 14-Day Free Trial'}
                    </Button>
                    <ul className="text-sm space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Billing History
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
          <CardDescription>
            View your payment history and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.transaction_id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.plan_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()} • 
                        ID: {transaction.paddle_transaction_id.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No billing history available</p>
              <p className="text-sm">Transactions will appear here after your first payment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage & Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Healthcare Platform Features
          </CardTitle>
          <CardDescription>
            What's included in your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">🏥 Healthcare Compliance</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Real AHPRA registration validation</li>
                <li>• TGA therapeutic advertising compliance</li>
                <li>• Patient testimonial detection</li>
                <li>• Professional boundary enforcement</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">🤖 AI Content Generation</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Voice-to-content with "Hey JB" activation</li>
                <li>• Copy/paste ready social media posts</li>
                <li>• Blog integration for your website</li>
                <li>• Multi-platform content optimization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingDashboard;