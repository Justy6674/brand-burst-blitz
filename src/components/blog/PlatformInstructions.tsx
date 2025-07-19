import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ExternalLink, Video, FileText } from 'lucide-react';
import type { PlatformCapability } from '@/lib/platformCapabilities';

interface PlatformInstructionsProps {
  platform: PlatformCapability;
  businessId: string;
  onComplete?: () => void;
}

export const PlatformInstructions: React.FC<PlatformInstructionsProps> = ({
  platform,
  businessId,
  onComplete
}) => {
  const getVideoTutorialUrl = () => {
    // In real implementation, these would be actual tutorial URLs
    return `https://tutorials.jbsaas.com/${platform.id}-integration`;
  };

  const getHelpDocUrl = () => {
    return `https://docs.jbsaas.com/platforms/${platform.id}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            🎉 Ready to Integrate with {platform.name}!
          </CardTitle>
          <CardDescription>
            Follow these {platform.name}-specific instructions to get your blog up and running
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="outline">Market Share: {platform.marketShare}</Badge>
            <Badge variant="secondary">
              {Object.values(platform.capabilities).filter(Boolean).length} Integration Methods
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Available Integration Methods */}
      <div className="grid gap-4">
        {platform.capabilities.embed && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🔗 Embed Widget Integration
                <Badge variant="default">Recommended</Badge>
              </CardTitle>
              <CardDescription>
                Add a live, updating blog widget to your {platform.name} website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">✅ Why Choose Embed?</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Automatically updates when you publish new content</li>
                    <li>• Matches your website's design</li>
                    <li>• No manual work required after setup</li>
                    <li>• SEO-friendly and fast loading</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Step-by-Step Instructions:</h4>
                  <ol className="space-y-2">
                    {platform.instructions.embed?.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {platform.capabilities.api && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                ⚡ API Integration
                <Badge variant="secondary">Advanced</Badge>
              </CardTitle>
              <CardDescription>
                Direct connection for automatic publishing to your {platform.name} blog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">⚡ Why Choose API?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Publish directly from JBSAAS to your website</li>
                    <li>• Schedule posts for automatic publishing</li>
                    <li>• Update existing posts remotely</li>
                    <li>• Full integration with {platform.name} features</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Setup Steps:</h4>
                  <ol className="space-y-2">
                    {platform.instructions.api?.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Always Available */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              📋 Copy & Paste Method
              <Badge variant="outline">Always Works</Badge>
            </CardTitle>
            <CardDescription>
              Simple copy and paste - perfect for any {platform.name} setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">📋 Why Choose Manual?</h4>
                <ul className="text-sm text-gray-800 space-y-1">
                  <li>• Works with any {platform.name} plan or setup</li>
                  <li>• No technical configuration required</li>
                  <li>• Complete control over formatting</li>
                  <li>• Pre-optimized for {platform.name}</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">How It Works:</h4>
                <ol className="space-y-2">
                  {platform.instructions.manual.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Limitations (if any) */}
      {platform.limitations.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg text-amber-900">
              ⚠️ {platform.name} Platform Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {platform.limitations.map((limitation, index) => (
                <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  {limitation}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Help Resources */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Additional Resources</CardTitle>
          <CardDescription>
            Get extra help with your {platform.name} integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Video className="w-6 h-6" />
              <span className="font-medium">Video Tutorial</span>
              <span className="text-xs text-muted-foreground">Watch step-by-step setup</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FileText className="w-6 h-6" />
              <span className="font-medium">Documentation</span>
              <span className="text-xs text-muted-foreground">Detailed setup guide</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <ExternalLink className="w-6 h-6" />
              <span className="font-medium">Live Support</span>
              <span className="text-xs text-muted-foreground">Get personal help</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-green-900">
                Your {platform.name} Integration is Ready!
              </h3>
              <p className="text-sm text-green-800 mt-1">
                You now have everything needed to connect your blog to {platform.name}.
                Choose the integration method that works best for your setup.
              </p>
            </div>
            {onComplete && (
              <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};