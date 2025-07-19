import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Palette, Type, Mic, Upload, Eye, Save, RotateCcw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useBusinessProfileContext } from '@/contexts/BusinessProfileContext';
import { useToast } from '@/hooks/use-toast';

interface BrandingFormData {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  font_size: string;
  brand_voice: string;
  brand_personality: string[];
  content_tone: string;
  logo_position: string;
  watermark_opacity: number;
  compliance_level: string;
}

interface BrandingSetupProps {
  businessId?: string;
  onSave?: (data: BrandingFormData) => void;
}

const INDUSTRY_COLOR_SCHEMES = {
  health: {
    primary: '#10B981', // Medical green
    secondary: '#6B7280', // Professional gray
    accent: '#3B82F6', // Trust blue
    background: '#FFFFFF',
    text: '#1F2937'
  },
  finance: {
    primary: '#1E40AF', // Professional blue
    secondary: '#374151', // Charcoal
    accent: '#F59E0B', // Gold accent
    background: '#FFFFFF',
    text: '#111827'
  },
  tech: {
    primary: '#7C3AED', // Tech purple
    secondary: '#4B5563', // Modern gray
    accent: '#06B6D4', // Cyan accent
    background: '#FFFFFF',
    text: '#1F2937'
  },
  beauty: {
    primary: '#EC4899', // Beauty pink
    secondary: '#9CA3AF', // Soft gray
    accent: '#F97316', // Warm orange
    background: '#FFFBFF',
    text: '#1F2937'
  },
  fitness: {
    primary: '#DC2626', // Energy red
    secondary: '#6B7280', // Neutral gray
    accent: '#16A34A', // Success green
    background: '#FFFFFF',
    text: '#1F2937'
  },
  legal: {
    primary: '#1F2937', // Professional dark
    secondary: '#6B7280', // Medium gray
    accent: '#B91C1C', // Authority red
    background: '#FFFFFF',
    text: '#111827'
  },
  general: {
    primary: '#3B82F6', // Universal blue
    secondary: '#6B7280', // Neutral gray
    accent: '#F59E0B', // Friendly orange
    background: '#FFFFFF',
    text: '#1F2937'
  }
};

const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter (Modern)', category: 'Sans-serif' },
  { value: 'Roboto, sans-serif', label: 'Roboto (Clean)', category: 'Sans-serif' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans (Friendly)', category: 'Sans-serif' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat (Elegant)', category: 'Sans-serif' },
  { value: 'Playfair Display, serif', label: 'Playfair (Luxury)', category: 'Serif' },
  { value: 'Merriweather, serif', label: 'Merriweather (Traditional)', category: 'Serif' },
  { value: 'Source Sans Pro, sans-serif', label: 'Source Sans (Professional)', category: 'Sans-serif' },
];

const BRAND_PERSONALITIES = [
  'Professional', 'Friendly', 'Innovative', 'Trustworthy', 'Creative',
  'Authoritative', 'Approachable', 'Sophisticated', 'Energetic', 'Reliable'
];

const CONTENT_TONES = {
  professional: {
    label: 'Professional',
    description: 'Formal, authoritative, industry-focused',
    industries: ['finance', 'legal', 'health']
  },
  friendly: {
    label: 'Friendly',
    description: 'Conversational, approachable, warm',
    industries: ['beauty', 'fitness', 'general']
  },
  innovative: {
    label: 'Innovative',
    description: 'Forward-thinking, cutting-edge, creative',
    industries: ['tech', 'general']
  },
  educational: {
    label: 'Educational',
    description: 'Informative, helpful, detailed',
    industries: ['health', 'tech', 'finance']
  },
  inspiring: {
    label: 'Inspiring',
    description: 'Motivational, uplifting, aspirational',
    industries: ['fitness', 'beauty', 'general']
  }
};

export const BusinessBrandingSetup: React.FC<BrandingSetupProps> = ({
  businessId,
  onSave
}) => {
  const { activeProfile, updateProfile } = useBusinessProfileContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const currentBusiness = businessId 
    ? activeProfile?.id === businessId ? activeProfile : null 
    : activeProfile;

  const form = useForm<BrandingFormData>({
    defaultValues: {
      primary_color: '#3B82F6',
      secondary_color: '#6B7280',
      accent_color: '#F59E0B',
      background_color: '#FFFFFF',
      text_color: '#1F2937',
      font_family: 'Inter, sans-serif',
      font_size: '16',
      brand_voice: 'professional',
      brand_personality: ['Professional', 'Trustworthy'],
      content_tone: 'professional',
      logo_position: 'header',
      watermark_opacity: 20,
      compliance_level: 'standard'
    }
  });

  // Load existing brand settings
  useEffect(() => {
    if (currentBusiness?.brand_colors) {
      try {
        const brandData = typeof currentBusiness.brand_colors === 'string' 
          ? JSON.parse(currentBusiness.brand_colors)
          : currentBusiness.brand_colors;
        
        if (brandData) {
          Object.keys(brandData).forEach(key => {
            if (form.getValues(key as keyof BrandingFormData) !== undefined) {
              form.setValue(key as keyof BrandingFormData, brandData[key]);
            }
          });
        }
      } catch (error) {
        console.error('Error loading brand settings:', error);
      }
    }
  }, [currentBusiness, form]);

  const applyIndustryDefaults = () => {
    if (!currentBusiness?.industry) return;

    const industryScheme = INDUSTRY_COLOR_SCHEMES[currentBusiness.industry as keyof typeof INDUSTRY_COLOR_SCHEMES];
    if (industryScheme) {
      form.setValue('primary_color', industryScheme.primary);
      form.setValue('secondary_color', industryScheme.secondary);
      form.setValue('accent_color', industryScheme.accent);
      form.setValue('background_color', industryScheme.background);
      form.setValue('text_color', industryScheme.text);

      // Set industry-appropriate defaults
      const industryTone = Object.entries(CONTENT_TONES).find(([_, tone]) => 
        tone.industries.includes(currentBusiness.industry!)
      );
      if (industryTone) {
        form.setValue('content_tone', industryTone[0]);
      }

      toast({
        title: 'Industry Defaults Applied',
        description: `Applied ${currentBusiness.industry} industry color scheme and settings.`,
      });
    }
  };

  const onSubmit = async (data: BrandingFormData) => {
    if (!currentBusiness) return;

    setIsLoading(true);
    try {
      const brandSettings = {
        ...data,
        updated_at: new Date().toISOString()
      };

      await updateProfile(currentBusiness.id, {
        brand_colors: JSON.stringify(brandSettings)
      });

      toast({
        title: 'Branding Saved',
        description: 'Your brand settings have been saved successfully.',
      });

      onSave?.(data);
    } catch (error) {
      console.error('Error saving brand settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save brand settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ColorPicker: React.FC<{ value: string; onChange: (color: string) => void; label: string }> = ({
    value, onChange, label
  }) => (
    <div className="flex items-center gap-2">
      <div 
        className="w-8 h-8 rounded border cursor-pointer"
        style={{ backgroundColor: value }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'color';
          input.value = value;
          input.onchange = (e) => onChange((e.target as HTMLInputElement).value);
          input.click();
        }}
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1"
      />
      <span className="text-sm text-muted-foreground min-w-16">{label}</span>
    </div>
  );

  if (!currentBusiness) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Palette className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Business Selected</h3>
            <p className="text-muted-foreground">
              Please select a business profile to configure branding settings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brand Settings</h2>
          <p className="text-muted-foreground">
            Customize the visual identity and content tone for {currentBusiness.business_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={applyIndustryDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Industry Defaults
          </Button>
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'Exit Preview' : 'Preview'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Scheme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Color Scheme
              </CardTitle>
              <CardDescription>
                Define your brand colors for consistent visual identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="primary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <FormControl>
                      <ColorPicker
                        value={field.value}
                        onChange={field.onChange}
                        label="Main"
                      />
                    </FormControl>
                    <FormDescription>Your main brand color</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color</FormLabel>
                    <FormControl>
                      <ColorPicker
                        value={field.value}
                        onChange={field.onChange}
                        label="Support"
                      />
                    </FormControl>
                    <FormDescription>Supporting color for accents</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accent_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accent Color</FormLabel>
                    <FormControl>
                      <ColorPicker
                        value={field.value}
                        onChange={field.onChange}
                        label="Accent"
                      />
                    </FormControl>
                    <FormDescription>Highlight color for call-to-actions</FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Typography
              </CardTitle>
              <CardDescription>
                Choose fonts that reflect your brand personality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="font_family"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Family</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <div className="flex items-center gap-2">
                              <span style={{ fontFamily: font.value }}>
                                {font.label}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {font.category}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="font_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Font Size</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="12"
                          max="24"
                          {...field}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">px</span>
                      </div>
                    </FormControl>
                    <FormDescription>Base text size for content</FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Brand Voice & Personality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Brand Voice
              </CardTitle>
              <CardDescription>
                Define how your brand communicates with your audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="content_tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Tone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CONTENT_TONES).map(([key, tone]) => (
                          <SelectItem key={key} value={key}>
                            <div>
                              <div className="font-medium">{tone.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {tone.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand_personality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Personality (Select multiple)</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {BRAND_PERSONALITIES.map((personality) => (
                          <Button
                            key={personality}
                            type="button"
                            variant={field.value.includes(personality) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const current = field.value;
                              if (current.includes(personality)) {
                                field.onChange(current.filter(p => p !== personality));
                              } else {
                                field.onChange([...current, personality]);
                              }
                            }}
                            className="text-xs"
                          >
                            {personality}
                          </Button>
                        ))}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Choose traits that describe your brand personality
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Logo & Watermark Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Logo & Watermark
              </CardTitle>
              <CardDescription>
                Configure how your logo appears in content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="logo_position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo Position</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                        <SelectItem value="corner">Corner Watermark</SelectItem>
                        <SelectItem value="none">No Logo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="watermark_opacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Watermark Opacity</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium min-w-12">
                          {field.value}%
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Opacity level for logo watermarks
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="lg:col-span-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full lg:w-auto flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Brand Settings'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};