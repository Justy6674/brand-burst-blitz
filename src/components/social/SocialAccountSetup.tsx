
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { RedditBusinessScout } from './RedditBusinessScout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Linkedin, Instagram } from 'lucide-react';

const RedditIcon = ({ className }: { className?: string }) => (
  <div className={`${className} text-orange-600 font-bold`}>r/</div>
);

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  connected: boolean;
  accountData?: any;
  setupType: 'copy-paste' | 'scout';
}

export function SocialAccountSetup() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      connected: false,
      setupType: 'copy-paste'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-pink-600',
      connected: false,
      setupType: 'copy-paste'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700',
      connected: false,
      setupType: 'copy-paste'
    },
    {
      id: 'reddit',
      name: 'Reddit',
      icon: RedditIcon,
      color: 'bg-orange-600',
      connected: false,
      setupType: 'scout'
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSetup = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    if (platform.setupType === 'copy-paste') {
      // Mark as "set up" for copy-paste platforms
      setPlatforms(prev => prev.map(p => 
        p.id === platformId 
          ? { ...p, connected: true, accountData: { name: `${platform.name} Account` } }
          : p
      ));
      
      toast({
        title: "Platform Setup Complete",
        description: `${platform.name} is now ready for copy-paste content publishing`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Media Platform Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="platforms" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="platforms">Platform Setup</TabsTrigger>
              <TabsTrigger value="reddit-scout">Reddit Business Scout</TabsTrigger>
            </TabsList>
            
            <TabsContent value="platforms" className="space-y-4">
              <div className="grid gap-4">
                {platforms.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <Card key={platform.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{platform.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {platform.setupType === 'copy-paste' 
                                ? 'Copy-paste content publishing' 
                                : 'Business opportunity scouting'
                              }
                            </p>
                          </div>
                          {platform.connected && (
                            <Badge variant="secondary" className="ml-2">
                              {platform.setupType === 'copy-paste' ? 'Ready' : 'Active'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {platform.connected ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setPlatforms(prev => prev.map(p => 
                                  p.id === platform.id 
                                    ? { ...p, connected: false, accountData: undefined }
                                    : p
                                ));
                              }}
                            >
                              Reset
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleSetup(platform.id)}
                              disabled={loading}
                              size="sm"
                            >
                              {platform.setupType === 'copy-paste' ? 'Set Up' : 'Configure'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="reddit-scout">
              <RedditBusinessScout />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
