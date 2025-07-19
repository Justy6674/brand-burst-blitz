import React from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Globe, Palette } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useBusinessProfileContext } from '@/contexts/BusinessProfileContext';

interface CreateBusinessProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  business_name: string;
  industry: string;
  website_url: string;
  default_ai_tone: string;
  is_primary: boolean;
  favicon_url: string;
}

const industries = [
  { value: 'general', label: 'General', icon: Building2 },
  { value: 'tech', label: 'Technology', icon: Globe },
  { value: 'health', label: 'Healthcare', icon: Building2 },
  { value: 'finance', label: 'Finance', icon: Building2 },
  { value: 'legal', label: 'Legal', icon: Building2 },
  { value: 'fitness', label: 'Fitness', icon: Building2 },
  { value: 'beauty', label: 'Beauty', icon: Palette },
];

const aiTones = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'exciting', label: 'Exciting' },
];

export const CreateBusinessProfileDialog: React.FC<CreateBusinessProfileDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { createProfile, allProfiles } = useBusinessProfileContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      business_name: '',
      industry: 'general',
      website_url: '',
      default_ai_tone: 'professional',
      is_primary: allProfiles.length === 0, // First business is primary by default
      favicon_url: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await createProfile({
        business_name: data.business_name,
        industry: data.industry as any,
        website_url: data.website_url || null,
        favicon_url: data.favicon_url || null,
        default_ai_tone: data.default_ai_tone as any,
        is_primary: data.is_primary,
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create business profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Business Profile</DialogTitle>
          <DialogDescription>
            Set up a new business profile to manage content and social media accounts separately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="business_name"
              rules={{ required: 'Business name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industries.map((industry) => {
                        const Icon = industry.icon;
                        return (
                          <SelectItem key={industry.value} value={industry.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {industry.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com" 
                      type="url" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Used for competitor analysis and content optimization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="favicon_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favicon URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/favicon.png" 
                      type="url" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Small icon for easy business identification (16x16 or 32x32 pixels)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="default_ai_tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default AI Tone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {aiTones.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Default tone for AI-generated content
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {allProfiles.length > 0 && (
              <FormField
                control={form.control}
                name="is_primary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Primary Business</FormLabel>
                      <FormDescription>
                        Make this the main business profile
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Business'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};