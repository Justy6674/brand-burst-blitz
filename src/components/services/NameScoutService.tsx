import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, CheckCircle, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { NameScoutWizard } from './NameScoutWizard';

export const NameScoutService = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showWizard, setShowWizard] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Check if user has an existing request
  React.useEffect(() => {
    const checkExistingRequest = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('name_scout_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        
        if (data && data.length > 0) {
          setExistingRequest(data[0]);
        }
      } catch (error) {
        console.error('Error checking existing request:', error);
      }
    };

    checkExistingRequest();
  }, [user]);

  const handleStartWizard = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    // Refresh existing request data
    window.location.reload();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-warning animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'In Progress';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const formatPrice = (cents: number) => {
    return `AU$${(cents / 100).toFixed(0)}`;
  };

  if (showWizard) {
    return (
      <NameScoutWizard 
        onComplete={handleWizardComplete}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  // Show existing request status if user has one
  if (existingRequest) {
    return (
      <Card className="glass border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Australian Name & Domain Scout</CardTitle>
                <CardDescription>
                  Business name: "{existingRequest.requested_name}"
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(existingRequest.request_status)}
              <Badge variant="outline">
                {getStatusText(existingRequest.request_status)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Requested:</span>
              <p className="font-medium">
                {new Date(existingRequest.requested_at).toLocaleDateString('en-AU')}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Amount Paid:</span>
              <p className="font-medium">
                {formatPrice(existingRequest.amount_paid)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Domain Extensions:</span>
              <p className="font-medium">
                {existingRequest.domain_extensions.join(', ')}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Trademark Screening:</span>
              <p className="font-medium">
                {existingRequest.include_trademark_screening ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          {existingRequest.request_status === 'completed' && (
            <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="font-medium text-success">Research Complete!</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Your business name and domain research is ready for review.
              </p>
              <Button 
                className="w-full bg-gradient-primary"
                onClick={() => {
                  // TODO: Navigate to results page
                  toast({
                    title: "Results Ready",
                    description: "Your research results are ready for review.",
                  });
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                View Results
              </Button>
            </div>
          )}

          {existingRequest.request_status === 'processing' && (
            <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-warning animate-pulse" />
                <span className="font-medium text-warning">Research in Progress</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Our team is conducting your business name and domain research. 
                This typically takes 2-3 business days. We'll notify you when complete.
              </p>
            </div>
          )}

          {existingRequest.request_status === 'pending' && (
            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium text-primary">Request Received</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your request has been received and will be processed within 1 business day.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show service offering if no existing request
  return (
    <Card className="glass border-primary/20 hover:border-primary/40 transition-all group">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl text-gradient-primary">
              Australian Name & Domain Scout
            </CardTitle>
            <CardDescription>
              Professional business name and domain research service
            </CardDescription>
          </div>
          <Badge className="bg-gradient-primary text-white border-0">
            Australian Only
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="font-semibold">What's Included:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              ASIC business name availability check
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Domain availability across multiple extensions
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              AI-powered naming suggestions
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Trademark screening (optional)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Comprehensive PDF report
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 border border-muted rounded-lg">
            <p className="text-2xl font-bold text-muted-foreground">AU$99</p>
            <p className="text-xs text-muted-foreground">Starter Plan</p>
          </div>
          <div className="p-3 border border-primary rounded-lg bg-primary/5">
            <p className="text-2xl font-bold text-primary">AU$79</p>
            <p className="text-xs text-primary font-medium">Professional Plan</p>
          </div>
          <div className="p-3 border border-success rounded-lg bg-success/5">
            <p className="text-2xl font-bold text-success">FREE</p>
            <p className="text-xs text-success font-medium">Enterprise Plan</p>
          </div>
        </div>

        <Button 
          onClick={handleStartWizard}
          className="w-full bg-gradient-primary hover:scale-105 transition-all"
          disabled={loading}
        >
          <Search className="h-4 w-4 mr-2" />
          Start Name Scout
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Available for Australian businesses only. ABN verification required.
        </p>
      </CardContent>
    </Card>
  );
};