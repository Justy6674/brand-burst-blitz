import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Calendar, FileText, DollarSign, CheckCircle, AlertCircle, MapPin, Building, Clock } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useToast } from '@/hooks/use-toast';

interface BillingPreferences {
  gstRegistered: boolean;
  billingCycle: 'monthly' | 'quarterly' | 'eofy-aligned' | 'custom';
  paymentMethod: 'card' | 'bpay' | 'bank-transfer' | 'net30';
  invoiceFrequency: 'immediate' | 'monthly' | 'quarterly';
  australianAddress: boolean;
  abnVerified: boolean;
  eofyOptimization: boolean;
  automaticGstCalculation: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  processingTime: string;
  fees: string;
  australianOnly: boolean;
  recommended: boolean;
}

const AUSTRALIAN_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Instant processing with Australian bank cards',
    processingTime: 'Immediate',
    fees: '2.9% + 30¢',
    australianOnly: false,
    recommended: true
  },
  {
    id: 'bpay',
    name: 'BPAY',
    description: 'Popular Australian payment system',
    processingTime: '1-3 business days',
    fees: 'Free',
    australianOnly: true,
    recommended: true
  },
  {
    id: 'bank-transfer',
    name: 'Direct Bank Transfer',
    description: 'Australian bank account transfers',
    processingTime: '1-2 business days',
    fees: 'Free',
    australianOnly: true,
    recommended: false
  },
  {
    id: 'net30',
    name: 'Net 30 Terms',
    description: 'Enterprise payment terms (requires ABN verification)',
    processingTime: '30 days',
    fees: 'Free',
    australianOnly: true,
    recommended: false
  }
];

const BILLING_CYCLES = [
  {
    id: 'monthly',
    name: 'Monthly',
    description: 'Standard monthly billing cycle',
    savings: 0,
    gstBenefit: false
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    description: 'Billed every 3 months',
    savings: 5,
    gstBenefit: true
  },
  {
    id: 'eofy-aligned',
    name: 'EOFY Aligned',
    description: 'Billing aligned with Australian financial year',
    savings: 10,
    gstBenefit: true
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Set your own billing schedule',
    savings: 0,
    gstBenefit: true
  }
];

const AustralianBillingOptimization: React.FC = () => {
  const { businessProfiles } = useBusinessProfile();
  const currentProfile = businessProfiles?.find(p => p.is_primary) || businessProfiles?.[0];
  const { toast } = useToast();
  
  const [billingPrefs, setBillingPrefs] = useState<BillingPreferences>({
    gstRegistered: false,
    billingCycle: 'monthly',
    paymentMethod: 'card',
    invoiceFrequency: 'immediate',
    australianAddress: true,
    abnVerified: false,
    eofyOptimization: false,
    automaticGstCalculation: true
  });

  const [loading, setLoading] = useState(false);
  const [gstRate, setGstRate] = useState(10);
  const [estimatedSavings, setEstimatedSavings] = useState(0);

  useEffect(() => {
    // Calculate estimated savings based on preferences
    let savings = 0;
    const selectedCycle = BILLING_CYCLES.find(c => c.id === billingPrefs.billingCycle);
    if (selectedCycle) {
      savings += selectedCycle.savings;
    }
    if (billingPrefs.eofyOptimization) {
      savings += 5;
    }
    if (billingPrefs.paymentMethod === 'bpay' || billingPrefs.paymentMethod === 'bank-transfer') {
      savings += 3;
    }
    setEstimatedSavings(savings);
  }, [billingPrefs]);

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      // Simulate saving preferences
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Billing Preferences Saved",
        description: "Your Australian billing optimization settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateGstAmount = (amount: number) => {
    return billingPrefs.gstRegistered ? amount * (gstRate / 100) : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Australian Billing Optimization</h2>
          <p className="text-muted-foreground">
            Optimize your billing for Australian tax compliance and business cycles
          </p>
        </div>
        <Button onClick={handleSavePreferences} disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preferences">Billing Preferences</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="gst">GST Management</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Australian Business Settings</CardTitle>
                <CardDescription>Configure your Australian business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Australian Business Address</Label>
                    <p className="text-sm text-muted-foreground">Required for GST compliance</p>
                  </div>
                  <Switch
                    checked={billingPrefs.australianAddress}
                    onCheckedChange={(checked) =>
                      setBillingPrefs(prev => ({ ...prev, australianAddress: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>ABN Verified</Label>
                    <p className="text-sm text-muted-foreground">Unlock enterprise features</p>
                  </div>
                  <Switch
                    checked={billingPrefs.abnVerified}
                    onCheckedChange={(checked) =>
                      setBillingPrefs(prev => ({ ...prev, abnVerified: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>GST Registered</Label>
                    <p className="text-sm text-muted-foreground">Automatic GST calculation</p>
                  </div>
                  <Switch
                    checked={billingPrefs.gstRegistered}
                    onCheckedChange={(checked) =>
                      setBillingPrefs(prev => ({ ...prev, gstRegistered: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>EOFY Optimization</Label>
                    <p className="text-sm text-muted-foreground">Align billing with financial year</p>
                  </div>
                  <Switch
                    checked={billingPrefs.eofyOptimization}
                    onCheckedChange={(checked) =>
                      setBillingPrefs(prev => ({ ...prev, eofyOptimization: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Configuration</CardTitle>
                <CardDescription>Set your preferred billing schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Billing Cycle</Label>
                  <Select
                    value={billingPrefs.billingCycle}
                    onValueChange={(value: any) =>
                      setBillingPrefs(prev => ({ ...prev, billingCycle: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BILLING_CYCLES.map((cycle) => (
                        <SelectItem key={cycle.id} value={cycle.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{cycle.name}</span>
                            {cycle.savings > 0 && (
                              <Badge variant="secondary" className="ml-2">
                                {cycle.savings}% off
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Invoice Frequency</Label>
                  <Select
                    value={billingPrefs.invoiceFrequency}
                    onValueChange={(value: any) =>
                      setBillingPrefs(prev => ({ ...prev, invoiceFrequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="monthly">Monthly Summary</SelectItem>
                      <SelectItem value="quarterly">Quarterly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {estimatedSavings > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Estimated Savings: {estimatedSavings}% per year
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4">
            {AUSTRALIAN_PAYMENT_METHODS.map((method) => (
              <Card 
                key={method.id}
                className={`cursor-pointer transition-colors ${
                  billingPrefs.paymentMethod === method.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setBillingPrefs(prev => ({ ...prev, paymentMethod: method.id as any }))}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        billingPrefs.paymentMethod === method.id 
                          ? 'border-primary bg-primary' 
                          : 'border-gray-300'
                      }`} />
                      <CardTitle className="text-lg">{method.name}</CardTitle>
                      {method.recommended && (
                        <Badge>Recommended</Badge>
                      )}
                      {method.australianOnly && (
                        <Badge variant="outline">🇦🇺 AU Only</Badge>
                      )}
                    </div>
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Processing: {method.processingTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Fees: {method.fees}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {billingPrefs.paymentMethod === 'net30' && !billingPrefs.abnVerified && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Net 30 payment terms require ABN verification. Please verify your ABN to enable this option.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gst" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GST Management</CardTitle>
              <CardDescription>
                Automatic GST calculation and compliance for Australian businesses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic GST Calculation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically calculate and display GST on invoices
                  </p>
                </div>
                <Switch
                  checked={billingPrefs.automaticGstCalculation}
                  onCheckedChange={(checked) =>
                    setBillingPrefs(prev => ({ ...prev, automaticGstCalculation: checked }))
                  }
                />
              </div>

              {billingPrefs.gstRegistered && (
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium">GST Calculation Preview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Service Amount:</span>
                      <span>{formatCurrency(149)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>GST ({gstRate}%):</span>
                      <span>{formatCurrency(calculateGstAmount(149))}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total (AUD inc. GST):</span>
                      <span>{formatCurrency(149 + calculateGstAmount(149))}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">GST Compliance Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Automatic GST calculation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Tax invoice formatting</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">ABN validation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">BAS reporting support</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tax Invoice Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Business name and ABN</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Invoice date and number</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">GST amount breakdown</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Customer details</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>EOFY Optimization</CardTitle>
                <CardDescription>
                  Align your billing with the Australian financial year
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Benefits of EOFY Alignment</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Simplified tax reporting and BAS preparation</li>
                    <li>• Better cash flow management for tax time</li>
                    <li>• Aligned with Australian business cycles</li>
                    <li>• Potential early payment discounts</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Next EOFY: June 30, 2025
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Switch to EOFY billing to save 10% annually
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Optimization</CardTitle>
                <CardDescription>
                  Reduce costs and improve cash flow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Current Method: {billingPrefs.paymentMethod}</span>
                    <Badge variant="outline">
                      {AUSTRALIAN_PAYMENT_METHODS.find(m => m.id === billingPrefs.paymentMethod)?.fees}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">BPAY Alternative</span>
                    <Badge variant="outline">Free</Badge>
                  </div>
                  
                  {billingPrefs.paymentMethod === 'card' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 Switch to BPAY to save on transaction fees
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Savings Summary</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Billing Cycle Optimization:</span>
                      <span className="font-medium">{estimatedSavings}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Annual Estimated Savings:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency((149 * 12 * estimatedSavings) / 100)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise Features</CardTitle>
              <CardDescription>
                Advanced billing options for verified Australian businesses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Net 30 Terms</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Extended payment terms for established businesses
                  </p>
                  {!billingPrefs.abnVerified && (
                    <Badge variant="outline" className="mt-2">ABN verification required</Badge>
                  )}
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Custom Invoicing</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tailored invoice formats and PO number support
                  </p>
                  <Badge variant="outline" className="mt-2">Available now</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Multi-Location Billing</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Separate billing for different business locations
                  </p>
                  <Badge variant="outline" className="mt-2">Enterprise only</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AustralianBillingOptimization;