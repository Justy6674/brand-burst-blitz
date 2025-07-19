import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  AlertCircle, 
  ExternalLink,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  status: 'not_connected' | 'connecting' | 'connected' | 'error';
  features: string[];
  limitations?: string[];
}

export const SocialAccountSetup: React.FC = () => {
  const { toast } = useToast();
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const platforms: SocialPlatform[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      description: 'Connect your Facebook Page to publish posts and stories',
      status: 'not_connected',
      features: [
        'Post text, images, and videos',
        'Schedule posts for optimal timing',
        'Track engagement metrics',
        'Manage multiple pages'
      ],
      limitations: [
        'Requires Facebook Page (not personal profile)',
        'Business verification may be required'
      ]
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-pink-600',
      description: 'Connect your Instagram Business account for posts and stories',
      status: 'not_connected',
      features: [
        'Post photos and videos',
        'Instagram Stories',
        'Reels publishing',
        'Hashtag optimization'
      ],
      limitations: [
        'Requires Instagram Business account',
        'Must be linked to Facebook Page'
      ]
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700',
      description: 'Connect your LinkedIn profile or company page',
      status: 'not_connected',
      features: [
        'Professional content publishing',
        'Company page management',
        'Industry-specific targeting',
        'B2B analytics'
      ],
      limitations: [
        'Different limits for personal vs company pages',
        'Professional content guidelines apply'
      ]
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: Twitter,
      color: 'bg-gray-900',
      description: 'Connect your Twitter/X account for real-time updates',
      status: 'not_connected',
      features: [
        'Tweet publishing',
        'Thread creation',
        'Media attachments',
        'Real-time engagement'
      ],
      limitations: [
        'Character limits apply',
        'API access requirements',
        'Rate limiting may apply'
      ]
    }
  ];

  const handleConnect = async (platformId: string) => {
    setConnectingPlatform(platformId);
    
    try {
      // Simulate OAuth flow - In real implementation, this would redirect to platform OAuth
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Coming Soon",
        description: `${platforms.find(p => p.id === platformId)?.name} integration is currently being developed. You'll be notified when it's ready!`,
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'connecting':
        return <Clock className="w-5 h-5 text-orange-500 animate-spin" />;
      case 'error':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-orange-100 text-orange-800">Connecting...</Badge>;
      case 'error':
        return <Badge variant="destructive">Connection Error</Badge>;
      default:
        return <Badge variant="secondary">Not Connected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Connect Social Media Accounts</h2>
        <p className="text-muted-foreground">
          Connect your social media accounts to start publishing and tracking your content performance.
        </p>
      </div>

      {/* Important Notice */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Development Notice:</strong> Social media integrations are currently being implemented. 
          You can review the setup process, but actual connections will be available soon.
          <a 
            href="mailto:support@jbsaas.com.au" 
            className="inline-flex items-center ml-2 text-orange-600 hover:text-orange-800"
          >
            Contact us for updates <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </AlertDescription>
      </Alert>

      {/* Platform Cards */}
      <div className="grid gap-6">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isConnecting = connectingPlatform === platform.id;
          
          return (
            <Card key={platform.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{platform.name}</CardTitle>
                      <CardDescription>{platform.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(isConnecting ? 'connecting' : platform.status)}
                    {getStatusBadge(isConnecting ? 'connecting' : platform.status)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-700">Features Available:</h4>
                    <ul className="text-sm space-y-1">
                      {platform.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {platform.limitations && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-orange-700">Requirements:</h4>
                      <ul className="text-sm space-y-1">
                        {platform.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <AlertCircle className="w-3 h-3 text-orange-600 flex-shrink-0" />
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {platform.status === 'connected' 
                      ? 'Account connected and ready to use'
                      : 'Connect to start publishing content'
                    }
                  </div>
                  
                  <Button
                    onClick={() => handleConnect(platform.id)}
                    disabled={isConnecting || platform.status === 'connected'}
                    className={platform.status === 'connected' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {isConnecting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : platform.status === 'connected' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Connected
                      </>
                    ) : (
                      <>
                        Connect {platform.name}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Section */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Need Help Setting Up?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Before Connecting:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Ensure you have admin access to your accounts</li>
                <li>• Verify your business accounts are set up properly</li>
                <li>• Have your account usernames/IDs ready</li>
                <li>• Check that your accounts comply with platform policies</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">After Connecting:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Test posting to ensure everything works</li>
                <li>• Set up your posting schedule preferences</li>
                <li>• Configure content approval workflows</li>
                <li>• Review analytics and reporting settings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};