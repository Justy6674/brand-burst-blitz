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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const socialAccountSchema = z.object({
  account_name: z.string().min(1, 'Account name is required'),
  account_id: z.string().min(1, 'Account ID is required'),
  access_token: z.string().min(1, 'Access token is required'),
  refresh_token: z.string().optional(),
  page_id: z.string().optional(),
});

type SocialAccountFormData = z.infer<typeof socialAccountSchema>;

interface SocialAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platformId: string;
  onConnect: (platform: string, accountData: any) => Promise<boolean>;
}

export const SocialAccountDialog = ({ 
  open, 
  onOpenChange, 
  platformId, 
  onConnect 
}: SocialAccountDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SocialAccountFormData>({
    resolver: zodResolver(socialAccountSchema),
    defaultValues: {
      account_name: '',
      account_id: '',
      access_token: '',
      refresh_token: '',
      page_id: '',
    },
  });

  const platformNames: { [key: string]: string } = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    twitter: 'Twitter/X',
  };

  const getInstructions = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'Get your Facebook access token from the Facebook Developer Console. You\'ll need a page access token to post to your Facebook page.';
      case 'instagram':
        return 'Instagram Business accounts can be connected through Facebook\'s Graph API. You\'ll need a Facebook page connected to your Instagram account.';
      case 'linkedin':
        return 'Create a LinkedIn app and get your access token. You\'ll need permissions for sharing content on LinkedIn.';
      case 'twitter':
        return 'Generate Twitter API keys from the Twitter Developer Portal. You\'ll need both API keys and access tokens.';
      default:
        return 'Follow the platform\'s developer documentation to get your API credentials.';
    }
  };

  const onSubmit = async (data: SocialAccountFormData) => {
    setIsLoading(true);
    try {
      const success = await onConnect(platformId, {
        ...data,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      });
      
      if (success) {
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connect {platformNames[platformId] || platformId}</DialogTitle>
          <DialogDescription>
            Add your {platformNames[platformId] || platformId} account credentials to enable automated posting.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            {getInstructions(platformId)}
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="account_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My Business Page" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name to identify this account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="Your account/page ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    The unique identifier for your account or page
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="access_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Token *</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Your API access token" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The access token from your platform's developer console
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refresh_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refresh Token</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Your refresh token (if available)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Used to automatically refresh expired access tokens
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(platformId === 'facebook' || platformId === 'instagram') && (
              <FormField
                control={form.control}
                name="page_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Facebook page ID" {...field} />
                    </FormControl>
                    <FormDescription>
                      Required for posting to Facebook pages or Instagram business accounts
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Connecting...' : 'Connect Account'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};