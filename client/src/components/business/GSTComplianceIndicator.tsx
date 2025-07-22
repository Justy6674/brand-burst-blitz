import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, DollarSign, FileText, AlertCircle } from 'lucide-react';

interface GSTComplianceIndicatorProps {
  isGSTRegistered?: boolean;
  businessName?: string;
  abn?: string;
  pricingAmount?: number;
  showFullCard?: boolean;
}

export const GSTComplianceIndicator: React.FC<GSTComplianceIndicatorProps> = ({
  isGSTRegistered,
  businessName,
  abn,
  pricingAmount = 149,
  showFullCard = false
}) => {
  const gstAmount = pricingAmount * 0.1;
  const totalWithGST = pricingAmount + gstAmount;

  if (!showFullCard) {
    return (
      <div className="flex items-center space-x-2">
        {isGSTRegistered ? (
          <>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
              <Shield className="w-3 h-3 mr-1" />
              GST Registered
            </Badge>
            <span className="text-sm text-muted-foreground">
              ${pricingAmount} + ${gstAmount.toFixed(2)} GST = ${totalWithGST.toFixed(2)}
            </span>
          </>
        ) : (
          <>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
              <DollarSign className="w-3 h-3 mr-1" />
              GST-Free
            </Badge>
            <span className="text-sm text-muted-foreground">
              ${pricingAmount} (No GST applicable)
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <FileText className="w-5 h-5 mr-2 text-primary" />
          Australian GST Compliance
        </CardTitle>
        <CardDescription>
          Automatic GST handling for Australian businesses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {businessName && abn && (
          <div className="bg-muted/30 rounded-lg p-4 border">
            <h4 className="font-semibold mb-2">Business Details</h4>
            <p className="text-sm text-muted-foreground">
              <strong>Business:</strong> {businessName}<br />
              <strong>ABN:</strong> {abn}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
            <span className="font-medium">Subscription Fee</span>
            <span className="font-mono">${pricingAmount.toFixed(2)}</span>
          </div>

          {isGSTRegistered ? (
            <>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 dark:bg-green-950/20 dark:border-green-800">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">GST (10%)</span>
                </div>
                <span className="font-mono text-green-800 dark:text-green-200">+${gstAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                <span className="font-semibold">Total (inc. GST)</span>
                <span className="font-mono font-bold">${totalWithGST.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
              <AlertCircle className="w-4 h-4 mr-2 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">GST-Free</p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  Your business is not GST registered, so no GST applies
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-muted/20 rounded-lg p-4 border">
          <h4 className="font-semibold mb-2 flex items-center">
            <Shield className="w-4 h-4 mr-2 text-primary" />
            Australian Compliance Features
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Automatic GST calculation based on your ABN registration status</li>
            <li>• Tax invoices with Australian compliance requirements</li>
            <li>• AUD pricing with clear GST breakdown</li>
            <li>• Business registration verification</li>
            <li>• Local Australian support and billing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};