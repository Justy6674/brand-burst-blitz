import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  MessageSquare, 
  Settings, 
  Users,
  AlertTriangle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface SlackSetupWizardProps {
  onComplete?: () => void;
}

const SlackSetupWizard: React.FC<SlackSetupWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTested, setWebhookTested] = useState(false);
  const { toast } = useToast();

  const steps = [
    {
      number: 1,
      title: "Create Slack App",
      description: "Set up your practice's Slack integration",
      icon: MessageSquare
    },
    {
      number: 2,
      title: "Configure Webhook",
      description: "Get your webhook URL from Slack",
      icon: Settings
    },
    {
      number: 3,
      title: "Test & Activate",
      description: "Test the connection and start receiving notifications",
      icon: CheckCircle
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard."
    });
  };

  const testWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingWebhook(true);
    
    try {
      // Test the webhook with a sample message
      const testMessage = {
        username: "Healthcare Assistant",
        icon_emoji: ":hospital:",
        text: "🎉 Great! Your Slack integration is working perfectly!",
        attachments: [{
          color: "good",
          title: "✅ Test Successful",
          text: "Your practice will now receive AHPRA compliance alerts, content approval notifications, and weekly reports directly in Slack.",
          fields: [
            {
              title: "Setup Complete",
              value: "Ready for healthcare notifications",
              short: true
            }
          ]
        }]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMessage)
      });

      if (response.ok) {
        setWebhookTested(true);
        toast({
          title: "Success!",
          description: "Test message sent to Slack. Check your channel!"
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: `Could not send test message: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const saveSlackConfiguration = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('business_profiles')
        .update({
          slack_webhook_url: webhookUrl,
          slack_settings: {
            enabled: true,
            channels: {
              general: "#general",
              content_approvals: "#content-approvals",
              compliance_alerts: "#compliance-alerts"
            },
            configured_at: new Date().toISOString()
          }
        })
        .eq('user_id', user.user.id);

      if (error) throw error;

      toast({
        title: "Configuration Saved",
        description: "Your Slack integration is now active!"
      });

      if (onComplete) onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save configuration: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          We'll create a Slack App for your healthcare practice to receive notifications about content approvals, AHPRA compliance alerts, and performance reports.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Step 1: Create Slack App
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
            <li>Go to <a href="https://api.slack.com/apps" target="_blank" className="text-blue-600 hover:underline">https://api.slack.com/apps</a></li>
            <li>Click "Create New App" → "From scratch"</li>
            <li>Name it "Healthcare Assistant" (or your practice name)</li>
            <li>Select your practice's Slack workspace</li>
            <li>Click "Create App"</li>
          </ol>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Recommended Slack Channels
          </h4>
          <div className="space-y-2">
            <Badge variant="outline">#content-approvals - For content that needs review</Badge>
            <Badge variant="outline">#compliance-alerts - For AHPRA/TGA notifications</Badge>
            <Badge variant="outline">#marketing-reports - For weekly performance updates</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Create these channels in your Slack workspace for organized notifications
          </p>
        </div>
      </div>

      <Button 
        onClick={() => setCurrentStep(2)} 
        className="w-full"
      >
        I've Created the Slack App
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          Now we'll get your webhook URL so your practice can receive notifications.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Step 2: Enable Incoming Webhooks</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
            <li>In your Slack App dashboard, click "Incoming Webhooks" in the left sidebar</li>
            <li>Toggle "Activate Incoming Webhooks" to <strong>On</strong></li>
            <li>Click "Add New Webhook to Workspace"</li>
            <li>Choose the channel for notifications (we recommend #content-approvals)</li>
            <li>Click "Allow"</li>
            <li>Copy the Webhook URL that appears</li>
          </ol>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Webhook URL</label>
          <div className="flex gap-2">
            <Input
              placeholder="https://hooks.slack.com/services/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(webhookUrl)}
              disabled={!webhookUrl}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Paste the webhook URL you copied from Slack
          </p>
        </div>

        {webhookUrl && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Keep this webhook URL secure! It allows sending messages to your Slack workspace.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep(3)} 
          className="flex-1"
          disabled={!webhookUrl}
        >
          Continue to Testing
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Let's test your webhook and activate notifications for your healthcare practice.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">What You'll Receive in Slack:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Content approval notifications when AI generates new posts
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              AHPRA compliance alerts for content violations
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Weekly performance reports with engagement metrics
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              TGA compliance updates affecting your content
            </li>
          </ul>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">Test Your Integration</h4>
          <p className="text-sm text-slate-600 mb-4">
            We'll send a test message to your Slack channel to ensure everything is working correctly.
          </p>
          
          <Button
            onClick={testWebhook}
            disabled={isTestingWebhook || !webhookUrl}
            className="w-full mb-4"
          >
            {isTestingWebhook ? 'Sending Test Message...' : 'Send Test Message'}
          </Button>

          {webhookTested && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Test successful! Check your Slack channel for the test message.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          Back
        </Button>
        <Button 
          onClick={saveSlackConfiguration}
          className="flex-1"
          disabled={!webhookTested}
        >
          Activate Slack Notifications
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Setup Slack for Your Healthcare Practice
          </CardTitle>
          <CardDescription>
            Get AHPRA compliance alerts, content approvals, and performance reports directly in Slack
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${currentStep >= step.number 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-slate-300 text-slate-400'
                  }
                `}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-0.5 mx-2
                    ${currentStep > step.number ? 'bg-primary' : 'bg-slate-300'}
                  `} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {steps[currentStep - 1].title}
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              {steps[currentStep - 1].description}
            </p>

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SlackSetupWizard;