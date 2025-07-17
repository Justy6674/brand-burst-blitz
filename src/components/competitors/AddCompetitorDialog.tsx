import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCompetitorData } from '@/hooks/useCompetitorData';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';

const competitorSchema = z.object({
  competitor_name: z.string().min(1, 'Competitor name is required'),
  competitor_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  competitor_description: z.string().optional(),
  analysis_frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
});

type CompetitorFormData = z.infer<typeof competitorSchema>;

interface AddCompetitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddCompetitorDialog = ({ open, onOpenChange }: AddCompetitorDialogProps) => {
  const { toast } = useToast();
  const { addCompetitor } = useCompetitorData();
  const { profile } = useBusinessProfile();

  const form = useForm<CompetitorFormData>({
    resolver: zodResolver(competitorSchema),
    defaultValues: {
      competitor_name: '',
      competitor_url: '',
      industry: '',
      competitor_description: '',
      analysis_frequency: 'weekly',
    },
  });

  const onSubmit = async (data: CompetitorFormData) => {
    try {
      const result = await addCompetitor({
        competitor_name: data.competitor_name,
        business_profile_id: profile?.id,
        competitor_url: data.competitor_url || null,
        industry: data.industry || null,
        competitor_description: data.competitor_description || null,
        analysis_frequency: data.analysis_frequency,
      });

      if (result) {
        toast({
          title: 'Competitor added',
          description: `${data.competitor_name} has been added to your watchlist.`,
        });
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add competitor. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Competitor</DialogTitle>
          <DialogDescription>
            Add a competitor to start tracking their content strategy and performance.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="competitor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Competitor Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="competitor_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://competitor.com" {...field} />
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
                  <FormControl>
                    <Input placeholder="e.g., Technology, Healthcare" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="competitor_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the competitor and what makes them relevant to track..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="analysis_frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Analysis Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="How often to analyze" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Adding...' : 'Add Competitor'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};