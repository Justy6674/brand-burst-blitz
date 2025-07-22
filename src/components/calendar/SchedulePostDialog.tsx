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
import { Label } from '@/components/ui/label';
import { usePosts } from '@/hooks/usePosts';
import { useSocialMedia } from '@/hooks/useSocialMedia';
import { useCalendar } from '@/hooks/useCalendar';

const scheduleSchema = z.object({
  postId: z.string().min(1, 'Please select a post'),
  scheduledDate: z.string().min(1, 'Please select a date and time'),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  repeatWeekly: z.boolean().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface SchedulePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  selectedPost?: string;
}

export const SchedulePostDialog = ({ 
  open, 
  onOpenChange,
  selectedDate,
  selectedPost
}: SchedulePostDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { posts } = usePosts();
  const { platforms } = useSocialMedia();
  const { schedulePost } = useCalendar();

  const connectedPlatforms = platforms.filter(p => p.isConnected);
  const publishablePosts = posts.filter(post => 
    post.status === 'published' || post.status === 'draft'
  );

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      postId: selectedPost || '',
      scheduledDate: selectedDate ? 
        new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16) : '',
      platforms: [],
      repeatWeekly: false,
    },
  });

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Minimum 5 minutes from now
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const onSubmit = async (data: ScheduleFormData) => {
    setIsLoading(true);
    try {
      const scheduledDate = new Date(data.scheduledDate);
      
      // Schedule for each selected platform
      const promises = data.platforms.map(platformId => 
        schedulePost(data.postId, scheduledDate, [platformId])
      );

      const results = await Promise.all(promises);
      const allSuccessful = results.every(result => result);

      if (allSuccessful) {
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule Post</DialogTitle>
          <DialogDescription>
            Schedule a post to be published on your selected platforms.
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
                        <SelectValue placeholder="Choose a post to schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {publishablePosts.map((post) => (
                        <SelectItem key={post.id} value={post.id}>
                          <div className="flex flex-col">
                            <span>{post.title || 'Untitled Post'}</span>
                            <span className="text-xs text-muted-foreground">
                              {post.type} • {post.status}
                              {post.excerpt && ` • ${post.excerpt.slice(0, 50)}...`}
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
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Date & Time *</FormLabel>
                  <FormControl>
                    <input
                      type="datetime-local"
                      min={getMinDateTime()}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose when you want this post to be published
                  </FormDescription>
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
                    {connectedPlatforms.map((platform) => (
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
              name="repeatWeekly"
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
                      Repeat Weekly
                    </FormLabel>
                    <FormDescription>
                      Schedule this post to repeat every week at the same time
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || connectedPlatforms.length === 0}
              >
                {isLoading ? 'Scheduling...' : 'Schedule Post'}
              </Button>
            </div>
          </form>
        </Form>

        {connectedPlatforms.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You need to connect at least one social media platform before scheduling posts.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};