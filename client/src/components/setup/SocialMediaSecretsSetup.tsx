import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Facebook, Instagram, Linkedin, Twitter, Shield, ExternalLink, Key } from 'lucide-react';

export const SocialMediaSecretsSetup = () => {
  const platforms = [
    {
      name: 'Facebook & Instagram',
      icon: Facebook,
      secretName: 'FACEBOOK_APP_ID',
      description: 'Required for Facebook Business Manager and Instagram Business integration',
      setupSteps: [
        'Go to Facebook Developers (https://developers.facebook.com)',
        'Create a new App or use existing one',
        'Add Facebook Login and Instagram Graph API products',
        'Copy your App ID from App Settings → Basic',
        'Configure OAuth redirect URIs',
        'Set up App Review for business features'
      ],
      permissions: 'pages_show_list, pages_read_engagement, pages_manage_posts, instagram_basic, instagram_content_publish',
      compliance: 'Must comply with Meta Business Terms and have verified business account'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin, 
      secretName: 'LINKEDIN_CLIENT_ID',
      description: 'Required for LinkedIn Business page management and posting',
      setupSteps: [
        'Go to LinkedIn Developers (https://developer.linkedin.com)',
        'Create a new LinkedIn App',
        'Add required products: Share on LinkedIn, Marketing Developer Platform',
        'Copy your Client ID from Auth tab',
        'Configure authorized redirect URLs',
        'Submit for Partner Program if needed'
      ],
      permissions: 'w_member_social, r_liteprofile, r_emailaddress, w_organization_social',
      compliance: 'Must follow LinkedIn API Terms of Use and Marketing API policies'
    },
    {
      name: 'Twitter/X',
      icon: Twitter,
      secretName: 'TWITTER_CLIENT_ID', 
      description: 'Required for Twitter/X posting and engagement features',
      setupSteps: [
        'Go to Twitter Developer Portal (https://developer.twitter.com)',
        'Create a new Project and App',
        'Enable OAuth 2.0 with PKCE',
        'Copy your Client ID from App settings',
        'Configure callback URLs',
        'Apply for Elevated access if needed'
      ],
      permissions: 'tweet.read, tweet.write, users.read, offline.access',
      compliance: 'Must comply with Twitter Developer Agreement and X API Terms'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Key className="h-8 w-8 text-primary" />
            Social Media Platform Setup
          </h2>
          <p className="text-muted-foreground">
            Configure OAuth credentials for social media integrations to enable revenue-generating features
          </p>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <Shield className="h-3 w-3 mr-1" />
          Configuration Required
        </Badge>
      </div>

      <Alert className="border-yellow-200 bg-yellow-50">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-yellow-800">
          <strong>Critical for Revenue:</strong> These OAuth integrations are essential for the social media publishing features that generate subscription revenue. Without proper setup, members cannot publish content to their social platforms.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {platforms.map((platform, index) => {
          const IconComponent = platform.icon;
          
          return (
            <Card key={index} className="border-2 hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{platform.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {platform.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {platform.secretName}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                    Setup Instructions:
                  </h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    {platform.setupSteps.map((step, idx) => (
                      <li key={idx} className="text-muted-foreground">{step}</li>
                    ))}
                  </ol>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Required Permissions:</h4>
                  <p className="text-sm text-blue-800 font-mono">{platform.permissions}</p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Compliance Requirements:</h4>
                  <p className="text-sm text-amber-800">{platform.compliance}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Add <code className="bg-muted px-2 py-1 rounded">{platform.secretName}</code> to Supabase Edge Function Secrets
                  </div>
                  <div className="flex gap-2">
                    {platform.name === 'Facebook & Instagram' && (
                      <a 
                        href="https://developers.facebook.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm flex items-center gap-1"
                      >
                        Facebook Developers <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {platform.name === 'LinkedIn' && (
                      <a 
                        href="https://developer.linkedin.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm flex items-center gap-1"
                      >
                        LinkedIn Developers <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {platform.name === 'Twitter/X' && (
                      <a 
                        href="https://developer.twitter.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm flex items-center gap-1"
                      >
                        Twitter Developer Portal <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-green-700">
            <li>• Store all API keys in Supabase Edge Function Secrets, never in code</li>
            <li>• Use environment-specific apps (development vs production)</li>
            <li>• Regularly rotate API credentials for security</li>
            <li>• Monitor API usage and rate limits</li>
            <li>• Implement proper error handling for API failures</li>
            <li>• Follow each platform's terms of service strictly</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800">Revenue Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-700">
            These integrations enable core revenue-generating features including social media publishing, 
            multi-platform content distribution, and automated posting schedules. Without proper OAuth setup, 
            members cannot access these premium features, directly impacting subscription retention and revenue.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};