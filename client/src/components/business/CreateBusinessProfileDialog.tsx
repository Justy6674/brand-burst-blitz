import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Globe, Palette, Upload, X } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

interface FaviconUpload {
  file: File | null;
  preview: string | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faviconUpload, setFaviconUpload] = useState<FaviconUpload>({ file: null, preview: null });
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      business_name: '',
      industry: 'general',
      website_url: '',
      default_ai_tone: 'professional',
      is_primary: allProfiles.length === 0, // First business is primary by default
    },
  });

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file (PNG, JPG, ICO, etc.)',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 1MB',
          variant: 'destructive',
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconUpload({
          file,
          preview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFavicon = () => {
    setFaviconUpload({ file: null, preview: null });
  };

  const uploadFavicon = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `favicons/${fileName}`;

      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading favicon:', error);
      return null;
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      let faviconUrl = null;
      
      // Upload favicon if provided
      if (faviconUpload.file) {
        faviconUrl = await uploadFavicon(faviconUpload.file);
        if (!faviconUrl) {
          toast({
            title: 'Upload failed',
            description: 'Failed to upload favicon. Creating profile without favicon.',
            variant: 'destructive',
          });
        }
      }

      await createProfile({
        business_name: data.business_name,
        industry: data.industry as any,
        website_url: data.website_url || null,
        favicon_url: faviconUrl,
        default_ai_tone: data.default_ai_tone as any,
        is_primary: data.is_primary,
      });
      
      form.reset();
      setFaviconUpload({ file: null, preview: null });
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

            {/* Favicon Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Favicon (Optional)
              </label>
              <div className="flex items-center gap-4">
                {faviconUpload.preview ? (
                  <div className="relative">
                    <img 
                      src={faviconUpload.preview} 
                      alt="Favicon preview" 
                      className="w-8 h-8 rounded border"
                    />
                    <button
                      type="button"
                      onClick={removeFavicon}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </div>
                ) : (
                  <div className="w-8 h-8 border-2 border-dashed border-muted rounded flex items-center justify-center">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    className="hidden"
                    id="favicon-upload"
                  />
                  <label 
                    htmlFor="favicon-upload"
                    className="inline-flex items-center gap-2 px-3 py-1 text-sm border rounded cursor-pointer hover:bg-muted/50"
                  >
                    <Upload className="w-4 h-4" />
                    {faviconUpload.file ? 'Change Favicon' : 'Upload Favicon'}
                  </label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a small icon (16x16 or 32x32 pixels) for easy business identification
              </p>
            </div>

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