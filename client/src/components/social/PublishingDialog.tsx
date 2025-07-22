import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { usePosts } from '@/hooks/usePosts';
import { useSocialMedia } from '@/hooks/useSocialMedia';

const publishingSchema = z.object({
  postId: z.string().min(1, 'Please select a post'),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  scheduledFor: z.string().optional(),
  publishNow: z.boolean(),
});

type PublishingFormData = z.infer<typeof publishingSchema>;

interface PublishingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platforms: any[];
}

export const PublishingDialog = ({ 
  open, 
  onOpenChange, 
  platforms 
}: PublishingDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { posts } = usePosts();
  const { schedulePost, publishNow } = useSocialMedia();

  const form = useForm<PublishingFormData>({
    resolver: zodResolver(publishingSchema),
    defaultValues: {
      postId: '',
      platforms: [],
      scheduledFor: '',
      publishNow: false,
    },
  });

  const publishableaPosts = posts.filter(post => 
    post.status === 'published' || post.status === 'draft'
  );

  const watchPublishNow = form.watch('publishNow');

  const onSubmit = async (data: PublishingFormData) => {
    setIsLoading(true);
    try {
      const promises = data.platforms.map(platformId => {
        if (data.publishNow) {
          return publishNow(data.postId, platformId);
        } else {
          const scheduledTime = data.scheduledFor || 
            new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
          return schedulePost(data.postId, platformId, scheduledTime);
        }
      });

      const results = await Promise.all(promises);
      const allSuccessful = results.every(result => result);

      if (allSuccessful) {
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error publishing/scheduling:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Minimum 5 minutes from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Publish Content</DialogTitle>
          <DialogDescription>
            Select a post and platforms to publish or schedule your content.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="postId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Post *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a post to publish" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {publishableaPosts.map((post) => (
                        <SelectItem key={post.id} value={post.id}>
                          <div className="flex flex-col">
                            <span>{post.title || 'Untitled Post'}</span>
                            <span className="text-xs text-muted-foreground">
                              {post.type} • {post.status}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platforms"
              render={() => (
                <FormItem>
                  <FormLabel>Select Platforms *</FormLabel>
                  <FormDescription>
                    Choose which platforms to publish to
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-4">
                    {platforms.map((platform) => (
                      <FormField
                        key={platform.id}
                        control={form.control}
                        name="platforms"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={platform.id}
                              className="flex flex-row items-start space-x-3 space-y-0 border rounded-lg p-4"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(platform.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, platform.id])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== platform.id)
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="grid gap-1.5 leading-none">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{platform.icon}</span>
                                  <span className="font-medium">{platform.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {platform.account?.account_name || 'Connected'}
                                </p>
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="publishNow"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Publish Immediately
                    </FormLabel>
                    <FormDescription>
                      Publish the content now instead of scheduling it
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {!watchPublishNow && (
              <FormField
                control={form.control}
                name="scheduledFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule For</FormLabel>
                    <FormControl>
                      <input
                        type="datetime-local"
                        min={getMinDateTime()}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to schedule 1 hour from now
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || platforms.length === 0}>
                {isLoading 
                  ? 'Processing...' 
                  : watchPublishNow 
                    ? 'Publish Now' 
                    : 'Schedule Post'
                }
              </Button>
            </div>
          </form>
        </Form>

        {platforms.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You need to connect at least one social media platform before publishing content.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};