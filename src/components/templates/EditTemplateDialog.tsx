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
  FormDescription,
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContentTemplates } from '@/hooks/useContentTemplates';
import type { Tables } from '@/integrations/supabase/types';

type ContentTemplate = Tables<'content_templates'>;

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  type: z.enum(['blog', 'social', 'ad']),
  template_content: z.string().min(10, 'Template content must be at least 10 characters'),
  ai_prompt_template: z.string().optional(),
  default_tone: z.enum(['professional', 'friendly', 'casual', 'authoritative', 'empathetic', 'exciting']).optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().default(false),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface EditTemplateDialogProps {
  template: ContentTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditTemplateDialog = ({ template, open, onOpenChange }: EditTemplateDialogProps) => {
  const { toast } = useToast();
  const { updateTemplate } = useContentTemplates();
  const [tagInput, setTagInput] = React.useState('');

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template.name,
      type: template.type,
      template_content: template.template_content,
      ai_prompt_template: template.ai_prompt_template || '',
      default_tone: template.default_tone || 'professional',
      tags: template.tags || [],
      is_public: template.is_public || false,
    },
  });

  const watchedTags = form.watch('tags') || [];

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !watchedTags.includes(trimmedTag)) {
      form.setValue('tags', [...watchedTags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const onSubmit = async (data: TemplateFormData) => {
    try {
      const result = await updateTemplate(template.id, {
        name: data.name,
        type: data.type,
        template_content: data.template_content,
        ai_prompt_template: data.ai_prompt_template || null,
        default_tone: data.default_tone || null,
        tags: data.tags || null,
        is_public: data.is_public,
      });

      if (result) {
        toast({
          title: 'Template updated',
          description: `"${data.name}" has been updated successfully.`,
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
          <DialogDescription>
            Update your content template settings and content.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Product Launch Post" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="blog">Blog Post</SelectItem>
                        <SelectItem value="ad">Advertisement</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="template_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Content *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your template content here. Use variables like {product_name}, {date}, {call_to_action} for dynamic content..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use curly braces {} around variable names that can be replaced when using the template.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ai_prompt_template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Prompt Template</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Optional: Define how AI should generate content with this template..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This prompt will be used when generating AI content based on this template.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="default_tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Tone</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="empathetic">Empathetic</SelectItem>
                      <SelectItem value="exciting">Exciting</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder="Add tags (press Enter or comma to add)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        onBlur={() => tagInput && addTag(tagInput)}
                      />
                      {watchedTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {watchedTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => removeTag(tag)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Add tags to help organize and find your templates.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Make Public</FormLabel>
                    <FormDescription>
                      Allow other users to discover and use this template.
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Updating...' : 'Update Template'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};