import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, AlertCircle, Play, Pause } from 'lucide-react';

interface QueueItem {
  id: string;
  post_id: string;
  social_account_id: string;
  scheduled_for: string;
  status: 'scheduled' | 'publishing' | 'published' | 'failed' | 'draft';
  post: {
    title: string;
    content: string;
    target_platforms: string[];
  };
  social_account: {
    platform: string;
    account_name: string;
  };
  attempt_count: number;
  last_error?: string;
}

export function PublishingPipeline() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const fetchQueue = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('publishing_queue')
        .select(`
          *,
          posts:post_id (
            title,
            content,
            target_platforms
          ),
          social_accounts:social_account_id (
            platform,
            account_name
          )
        `)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;

      const mappedData = data?.map(item => ({
        ...item,
        post: item.posts,
        social_account: item.social_accounts
      })) || [];
      setQueueItems(mappedData);
    } catch (error) {
      console.error('Error fetching queue:', error);
      toast({
        title: "Queue Error",
        description: "Failed to fetch publishing queue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processQueue = async () => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('publishing-queue-processor', {
        body: { userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "Queue Processed",
        description: `Processed ${data.processed} items from the queue`
      });

      // Refresh queue
      await fetchQueue();
    } catch (error: any) {
      console.error('Error processing queue:', error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process queue",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const retryItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('publishing_queue')
        .update({ 
          status: 'scheduled',
          attempt_count: 0,
          last_error: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Item Queued",
        description: "Item has been queued for retry"
      });

      await fetchQueue();
    } catch (error: any) {
      console.error('Error retrying item:', error);
      toast({
        title: "Retry Failed",
        description: error.message || "Failed to retry item",
        variant: "destructive"
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('publishing_queue')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Item Removed",
        description: "Item has been removed from the queue"
      });

      await fetchQueue();
    } catch (error: any) {
      console.error('Error removing item:', error);
      toast({
        title: "Remove Failed",
        description: error.message || "Failed to remove item",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchQueue();
    
    // Refresh queue every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'publishing':
        return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'publishing':
        return <Badge className="bg-yellow-100 text-yellow-800">Publishing</Badge>;
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const scheduledItems = queueItems.filter(item => item.status === 'scheduled');
  const publishingItems = queueItems.filter(item => item.status === 'publishing');
  const publishedItems = queueItems.filter(item => item.status === 'published');
  const failedItems = queueItems.filter(item => item.status === 'failed');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Publishing Pipeline</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={fetchQueue}
                variant="outline"
                size="sm"
              >
                Refresh
              </Button>
              <Button
                onClick={processQueue}
                disabled={processing}
                size="sm"
              >
                {processing ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {processing ? 'Processing...' : 'Process Queue'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{scheduledItems.length}</div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{publishingItems.length}</div>
                <div className="text-sm text-muted-foreground">Publishing</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{publishedItems.length}</div>
                <div className="text-sm text-muted-foreground">Published</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{failedItems.length}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </CardContent>
            </Card>
          </div>

          {queueItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No items in the publishing queue.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create and schedule posts to see them here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {queueItems.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(item.status)}
                          <h4 className="font-medium">{item.post.title || 'Untitled Post'}</h4>
                          {getStatusBadge(item.status)}
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          <p><strong>Platform:</strong> {item.social_account.platform}</p>
                          <p><strong>Account:</strong> {item.social_account.account_name}</p>
                          <p><strong>Scheduled:</strong> {new Date(item.scheduled_for).toLocaleString()}</p>
                          {item.attempt_count > 0 && (
                            <p><strong>Attempts:</strong> {item.attempt_count}</p>
                          )}
                        </div>

                        <div className="text-sm bg-muted p-2 rounded max-w-md">
                          {item.post.content.substring(0, 150)}
                          {item.post.content.length > 150 && '...'}
                        </div>

                        {item.last_error && (
                          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                            <strong>Error:</strong> {item.last_error}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {item.status === 'failed' && (
                          <Button
                            onClick={() => retryItem(item.id)}
                            variant="outline"
                            size="sm"
                          >
                            Retry
                          </Button>
                        )}
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}