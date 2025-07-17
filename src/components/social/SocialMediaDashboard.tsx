import { useState } from 'react';
import { Calendar, Clock, Users, Send, Settings, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSocialMedia } from '@/hooks/useSocialMedia';
import { SocialAccountDialog } from './SocialAccountDialog';
import { PublishingDialog } from './PublishingDialog';

export const SocialMediaDashboard = () => {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const { 
    platforms, 
    publishingQueue, 
    isLoading, 
    error,
    connectPlatform,
    disconnectPlatform,
    refetch 
  } = useSocialMedia();

  const connectedPlatforms = platforms.filter(p => p.isConnected);
  const pendingPosts = publishingQueue.filter(q => q.status === 'scheduled');
  const publishedPosts = publishingQueue.filter(q => q.status === 'published');
  const failedPosts = publishingQueue.filter(q => q.status === 'failed');

  const handleConnectPlatform = (platformId: string) => {
    setSelectedPlatform(platformId);
    setShowConnectDialog(true);
  };

  const handleDisconnectPlatform = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform?.account) {
      await disconnectPlatform(platform.account.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Social Media Publishing</h1>
          <p className="text-muted-foreground">Connect platforms and manage your content distribution</p>
        </div>
        <Button onClick={() => setShowPublishDialog(true)}>
          <Send className="h-4 w-4 mr-2" />
          Publish Content
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Platforms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedPlatforms.length}</div>
            <p className="text-xs text-muted-foreground">
              of {platforms.length} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPosts.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to publish
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Today</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {publishedPosts.filter(p => 
                new Date(p.scheduled_for).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {publishedPosts.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Posts</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedPosts.length}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="queue">Publishing Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platforms.map((platform) => (
              <Card key={platform.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{platform.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <CardDescription>
                          {platform.isConnected ? 'Connected' : 'Not connected'}
                        </CardDescription>
                      </div>
                    </div>
                    {platform.isConnected ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {platform.isConnected ? (
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Account:</strong> {platform.account?.account_name || 'Connected'}</p>
                        <p><strong>Connected:</strong> {platform.account?.created_at ? 
                          new Date(platform.account.created_at).toLocaleDateString() : 'Recently'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Settings
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDisconnectPlatform(platform.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Connect your {platform.name} account to start publishing content automatically.
                      </p>
                      <Button 
                        className="w-full" 
                        onClick={() => handleConnectPlatform(platform.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Connect {platform.name}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          {publishingQueue.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts in queue</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Schedule your first post to see it here.
                </p>
                <Button onClick={() => setShowPublishDialog(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  Publish Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {publishingQueue.map((queueItem) => (
                <Card key={queueItem.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Post #{queueItem.post_id?.slice(-8)}
                        </CardTitle>
                        <CardDescription>
                          Scheduled for {formatDate(queueItem.scheduled_for)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(queueItem.status || 'unknown')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2"><strong>Platform:</strong></p>
                        <p className="text-sm">Social Platform</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2"><strong>Attempts:</strong></p>
                        <p className="text-sm">{queueItem.attempt_count || 0}</p>
                      </div>
                    </div>
                    
                    {queueItem.last_error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Error:</strong> {queueItem.last_error}
                        </p>
                      </div>
                    )}

                    {queueItem.published_post_id && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Published ID:</strong> {queueItem.published_post_id}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publishing Analytics</CardTitle>
              <CardDescription>Performance metrics across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Analytics will be available after publishing content to connected platforms.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SocialAccountDialog
        open={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        platformId={selectedPlatform}
        onConnect={connectPlatform}
      />

      <PublishingDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        platforms={connectedPlatforms}
      />
    </div>
  );
};