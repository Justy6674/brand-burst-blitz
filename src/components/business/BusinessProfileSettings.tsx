import React from 'react';
import { useForm } from 'react-hook-form';
import { Save, Trash2, Upload, Globe, Palette, Settings2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useBusinessProfileContext } from '@/contexts/BusinessProfileContext';
import { useToast } from '@/hooks/use-toast';

const industries = [
  { value: 'general', label: 'General' },
  { value: 'tech', label: 'Technology' },
  { value: 'health', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'legal', label: 'Legal' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'beauty', label: 'Beauty & Cosmetics' },
];

const aiTones = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'exciting', label: 'Exciting' },
];

export const BusinessProfileSettings: React.FC = () => {
  const { activeProfile, updateProfile, deleteProfile, allProfiles } = useBusinessProfileContext();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const form = useForm({
    defaultValues: {
      business_name: activeProfile?.business_name || '',
      industry: activeProfile?.industry || 'general',
      website_url: activeProfile?.website_url || '',
      default_ai_tone: activeProfile?.default_ai_tone || 'professional',
      is_primary: activeProfile?.is_primary || false,
      brand_colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#f59e0b',
      },
    },
  });

  React.useEffect(() => {
    if (activeProfile) {
      form.reset({
        business_name: activeProfile.business_name || '',
        industry: activeProfile.industry || 'general',
        website_url: activeProfile.website_url || '',
        default_ai_tone: activeProfile.default_ai_tone || 'professional',
        is_primary: activeProfile.is_primary || false,
        brand_colors: activeProfile.brand_colors || {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#f59e0b',
        },
      });
    }
  }, [activeProfile, form]);

  const onSubmit = async (data: any) => {
    if (!activeProfile) return;

    setIsUpdating(true);
    try {
      await updateProfile(activeProfile.id, {
        business_name: data.business_name,
        industry: data.industry,
        website_url: data.website_url || null,
        default_ai_tone: data.default_ai_tone,
        is_primary: data.is_primary,
        brand_colors: data.brand_colors,
      });
      
      toast({
        title: "Settings Updated",
        description: "Your business profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business profile settings.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!activeProfile) return;
    
    if (allProfiles.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one business profile.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProfile(activeProfile.id);
      toast({
        title: "Business Profile Deleted",
        description: "The business profile has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete business profile.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!activeProfile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Settings2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Business Profile Selected</h3>
          <p className="text-muted-foreground">Please select a business profile to view settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Business Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage settings for <span className="font-medium">{activeProfile.business_name}</span>
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="content">Content Settings</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                  <CardDescription>
                    Basic information about your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry.value} value={industry.value}>
                                {industry.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This helps optimize content for your industry
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
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
                    name="is_primary"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Primary Business</FormLabel>
                          <FormDescription>
                            Make this the default business profile
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Brand Colors
                  </CardTitle>
                  <CardDescription>
                    Customize your brand colors for consistent content theming
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="brand_colors.primary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input 
                                type="color" 
                                className="w-16 h-10 p-1 border rounded" 
                                {...field} 
                              />
                            </FormControl>
                            <Input 
                              placeholder="#3b82f6" 
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand_colors.secondary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Color</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input 
                                type="color" 
                                className="w-16 h-10 p-1 border rounded" 
                                {...field} 
                              />
                            </FormControl>
                            <Input 
                              placeholder="#64748b" 
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand_colors.accent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accent Color</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input 
                                type="color" 
                                className="w-16 h-10 p-1 border rounded" 
                                {...field} 
                              />
                            </FormControl>
                            <Input 
                              placeholder="#f59e0b" 
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Color Preview</h4>
                    <div className="flex gap-2">
                      <div 
                        className="w-16 h-16 rounded border"
                        style={{ backgroundColor: form.watch('brand_colors.primary') }}
                        title="Primary"
                      />
                      <div 
                        className="w-16 h-16 rounded border"
                        style={{ backgroundColor: form.watch('brand_colors.secondary') }}
                        title="Secondary"
                      />
                      <div 
                        className="w-16 h-16 rounded border"
                        style={{ backgroundColor: form.watch('brand_colors.accent') }}
                        title="Accent"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logo & Assets</CardTitle>
                  <CardDescription>
                    Upload your business logo and brand assets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">Upload Logo</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag & drop your logo or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Preferences</CardTitle>
                  <CardDescription>
                    Configure default settings for AI-generated content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="default_ai_tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default AI Tone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="danger" className="space-y-4">
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                      <div>
                        <h4 className="font-medium text-destructive">Delete Business Profile</h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete this business profile and all associated data.
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={allProfiles.length === 1}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the business profile
                              "{activeProfile.business_name}" and all associated content, social accounts, and analytics data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete Business Profile'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="submit" disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};