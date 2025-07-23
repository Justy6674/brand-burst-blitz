import { useState } from 'react';
import { Send, Users, Clock, ExternalLink, Plus, Mic, PenTool, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentPublisher } from '@/components/content/ContentPublisher';
import { SocialAccountSetup } from './SocialAccountSetup';

export const SocialMediaDashboard = () => {
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Social Media Publishing</h1>
          <p className="text-muted-foreground">Generate content and copy-paste to your platforms</p>
        </div>
        <Button onClick={() => setShowPublishDialog(true)}>
          <Send className="h-4 w-4 mr-2" />
          Generate Content
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready Platforms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Facebook, Instagram, LinkedIn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ideas Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Captured today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Generated</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Ready to copy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Mic className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Voice Idea</h3>
            <p className="text-muted-foreground text-center text-sm">
              Record your idea quickly
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <PenTool className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quick Sketch</h3>
            <p className="text-muted-foreground text-center text-sm">
              Draw your concept
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Text Note</h3>
            <p className="text-muted-foreground text-center text-sm">
              Type your thoughts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generator">Content Generator</TabsTrigger>
          <TabsTrigger value="platforms">Platform Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Generator</CardTitle>
              <CardDescription>
                Generate platform-specific content that you can copy and paste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContentPublisher />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <SocialAccountSetup />
        </TabsContent>
      </Tabs>

      {showPublishDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4">
            <ContentPublisher />
            <Button 
              variant="outline" 
              onClick={() => setShowPublishDialog(false)}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};