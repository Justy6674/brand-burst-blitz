import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Zap, 
  CheckCircle, 
  Settings, 
  Server, 
  Shield, 
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Monitor,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DeploymentConfig {
  businessName: string;
  domain: string;
  subdomain: string;
  templateId: string;
  customization: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    favicon?: string;
  };
  features: string[];
  sslEnabled: boolean;
  analyticsEnabled: boolean;
  seoOptimized: boolean;
}

interface CustomerBlogDeploymentProps {
  selectedTemplate?: any;
  onDeploymentComplete?: (deploymentUrl: string) => void;
}

const CustomerBlogDeployment: React.FC<CustomerBlogDeploymentProps> = ({
  selectedTemplate,
  onDeploymentComplete
}) => {
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    businessName: '',
    domain: '',
    subdomain: '',
    templateId: selectedTemplate?.id || '',
    customization: {
      primaryColor: '#6366f1',
      secondaryColor: '#10b981'
    },
    features: ['seo-optimization', 'analytics', 'ssl'],
    sslEnabled: true,
    analyticsEnabled: true,
    seoOptimized: true
  });

  const [deploymentStep, setDeploymentStep] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [domainVerified, setDomainVerified] = useState(false);
  const { toast } = useToast();

  const deploymentSteps = [
    'Validating Configuration',
    'Setting Up Infrastructure',
    'Deploying Template',
    'Configuring Domain',
    'Enabling SSL',
    'Optimizing SEO',
    'Finalizing Deployment'
  ];

  const handleConfigChange = (field: string, value: any) => {
    setDeploymentConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomizationChange = (field: string, value: any) => {
    setDeploymentConfig(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [field]: value
      }
    }));
  };

  const validateDomain = async () => {
    const { domain, subdomain } = deploymentConfig;
    
    if (!domain) {
      toast({
        title: "Domain Required",
        description: "Please enter your domain name.",
        variant: "destructive"
      });
      return false;
    }

    // Basic domain validation
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast({
        title: "Invalid Domain",
        description: "Please enter a valid domain name.",
        variant: "destructive"
      });
      return false;
    }

    try {
      // In a real implementation, this would check DNS records
      // For now, we'll simulate validation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDomainVerified(true);
      
      toast({
        title: "Domain Verified",
        description: "Your domain is ready for deployment.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Domain Verification Failed",
        description: "Unable to verify domain. Please check your DNS settings.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deployBlog = async () => {
    if (!deploymentConfig.businessName || !deploymentConfig.domain) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentProgress(0);
    setDeploymentStep(0);

    try {
      // Simulate deployment process
      for (let i = 0; i < deploymentSteps.length; i++) {
        setDeploymentStep(i);
        setDeploymentProgress(((i + 1) / deploymentSteps.length) * 100);
        
        // Simulate processing time for each step
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Generate deployment URL
      const fullDomain = deploymentConfig.subdomain 
        ? `${deploymentConfig.subdomain}.${deploymentConfig.domain}`
        : deploymentConfig.domain;
      
      const deploymentUrl = `https://${fullDomain}`;
      setDeploymentUrl(deploymentUrl);

      // In a real implementation, this would:
      // 1. Create customer database tables
      // 2. Deploy template with customizations
      // 3. Configure DNS and SSL
      // 4. Set up analytics
      // 5. Optimize for SEO

      toast({
        title: "Deployment Successful!",
        description: "Your blog is now live and ready for content.",
      });

      if (onDeploymentComplete) {
        onDeploymentComplete(deploymentUrl);
      }

    } catch (error) {
      console.error('Deployment error:', error);
      toast({
        title: "Deployment Failed",
        description: "An error occurred during deployment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard.",
    });
  };

  const availableFeatures = [
    { id: 'seo-optimization', name: 'SEO Optimization', description: 'Automatic meta tags and structured data' },
    { id: 'analytics', name: 'Analytics Integration', description: 'Built-in traffic and engagement tracking' },
    { id: 'ssl', name: 'SSL Certificate', description: 'Secure HTTPS encryption' },
    { id: 'cdn', name: 'CDN Delivery', description: 'Fast global content delivery' },
    { id: 'backup', name: 'Automatic Backups', description: 'Daily automated backups' },
    { id: 'comments', name: 'Comment System', description: 'Built-in comment management' },
    { id: 'newsletter', name: 'Newsletter Integration', description: 'Email subscription forms' },
    { id: 'social-sharing', name: 'Social Sharing', description: 'One-click social media sharing' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gradient-primary">
          Deploy Your Blog
        </h2>
        <p className="text-muted-foreground">
          Set up your professional blog in minutes with automatic deployment and configuration.
        </p>
      </div>

      {!isDeploying && !deploymentUrl && (
        <Tabs defaultValue="configuration" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="domain">Domain Setup</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Blog Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business-name">Business Name *</Label>
                    <Input
                      id="business-name"
                      placeholder="Your Business Name"
                      value={deploymentConfig.businessName}
                      onChange={(e) => handleConfigChange('businessName', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="template-id">Selected Template</Label>
                    <Input
                      id="template-id"
                      value={selectedTemplate?.name || 'No template selected'}
                      disabled
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Brand Colors</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary-color"
                          type="color"
                          value={deploymentConfig.customization.primaryColor}
                          onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                          className="w-20"
                        />
                        <Input
                          value={deploymentConfig.customization.primaryColor}
                          onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                          placeholder="#6366f1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={deploymentConfig.customization.secondaryColor}
                          onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                          className="w-20"
                        />
                        <Input
                          value={deploymentConfig.customization.secondaryColor}
                          onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                          placeholder="#10b981"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="domain" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Domain Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="domain">Your Domain *</Label>
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={deploymentConfig.domain}
                    onChange={(e) => handleConfigChange('domain', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter your domain name without "www" or "https://"
                  </p>
                </div>

                <div>
                  <Label htmlFor="subdomain">Subdomain (Optional)</Label>
                  <Input
                    id="subdomain"
                    placeholder="blog"
                    value={deploymentConfig.subdomain}
                    onChange={(e) => handleConfigChange('subdomain', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Leave empty to use your main domain, or enter "blog" for blog.yourdomain.com
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>DNS Setup Required:</strong> You'll need to point your domain to our servers. 
                    We'll provide detailed instructions after deployment.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={validateDomain} 
                  disabled={!deploymentConfig.domain}
                  className="w-full"
                >
                  {domainVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Domain Verified
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Verify Domain
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Blog Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableFeatures.map((feature) => (
                    <div key={feature.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                      <Switch
                        id={feature.id}
                        checked={deploymentConfig.features.includes(feature.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleConfigChange('features', [...deploymentConfig.features, feature.id]);
                          } else {
                            handleConfigChange('features', deploymentConfig.features.filter(f => f !== feature.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <Label htmlFor={feature.id} className="font-medium cursor-pointer">
                          {feature.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Deployment Progress */}
      {isDeploying && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Deploying Your Blog
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={deploymentProgress} className="w-full" />
            <div className="text-center">
              <p className="font-medium">
                {deploymentSteps[deploymentStep]}
              </p>
              <p className="text-sm text-muted-foreground">
                {Math.round(deploymentProgress)}% complete
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {deploymentSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  {index < deploymentStep ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : index === deploymentStep ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted" />
                  )}
                  <span className={`text-sm ${index <= deploymentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment Success */}
      {deploymentUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              Deployment Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your blog has been successfully deployed and is now live at the URL below.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Your Blog URL</Label>
              <div className="flex items-center gap-2">
                <Input value={deploymentUrl} readOnly />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(deploymentUrl)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.open(deploymentUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Next Steps</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Configure your DNS settings</li>
                  <li>• Add your first blog post</li>
                  <li>• Customize your about page</li>
                  <li>• Set up analytics tracking</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Features Enabled</h4>
                <div className="flex flex-wrap gap-1">
                  {deploymentConfig.features.map((featureId) => {
                    const feature = availableFeatures.find(f => f.id === featureId);
                    return feature ? (
                      <Badge key={featureId} variant="secondary">
                        {feature.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deploy Button */}
      {!isDeploying && !deploymentUrl && (
        <div className="text-center">
          <Button 
            onClick={deployBlog}
            size="lg"
            className="bg-gradient-primary"
            disabled={!deploymentConfig.businessName || !deploymentConfig.domain}
          >
            <Server className="w-5 h-5 mr-2" />
            Deploy Blog Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomerBlogDeployment;