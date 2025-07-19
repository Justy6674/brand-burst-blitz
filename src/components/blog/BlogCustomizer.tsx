import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Palette, 
  Layout, 
  Image, 
  Type, 
  Eye, 
  Save,
  Upload,
  Grid,
  List,
  Square,
  Rows,
  RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BlogCustomizerProps {
  businessId: string;
  onSave?: (customization: BlogCustomization) => void;
}

interface BlogCustomization {
  id?: string;
  business_id: string;
  layout_style: 'grid' | 'list' | 'cards' | 'magazine' | 'minimal';
  color_scheme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  typography: {
    font_family: string;
    heading_size: string;
    body_size: string;
    line_height: string;
  };
  branding: {
    logo_url?: string;
    logo_position: 'top' | 'header' | 'footer' | 'watermark';
    show_powered_by: boolean;
    custom_footer?: string;
  };
  image_settings: {
    aspect_ratio: 'square' | '16:9' | '4:3' | '3:2' | 'auto';
    position: 'top' | 'left' | 'right' | 'background';
    overlay_text: boolean;
    auto_logo: boolean;
  };
  post_display: {
    show_author: boolean;
    show_date: boolean;
    show_tags: boolean;
    show_excerpt: boolean;
    excerpt_length: number;
    posts_per_page: number;
  };
  seo_settings: {
    meta_title_template: string;
    meta_description_template: string;
    og_image_template?: string;
  };
}

const DEFAULT_CUSTOMIZATION: BlogCustomization = {
  business_id: '',
  layout_style: 'cards',
  color_scheme: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#1e293b',
    accent: '#f59e0b'
  },
  typography: {
    font_family: 'Inter, sans-serif',
    heading_size: '1.5rem',
    body_size: '1rem',
    line_height: '1.6'
  },
  branding: {
    logo_position: 'header',
    show_powered_by: true
  },
  image_settings: {
    aspect_ratio: '16:9',
    position: 'top',
    overlay_text: false,
    auto_logo: false
  },
  post_display: {
    show_author: true,
    show_date: true,
    show_tags: true,
    show_excerpt: true,
    excerpt_length: 150,
    posts_per_page: 9
  },
  seo_settings: {
    meta_title_template: '{title} | {business_name}',
    meta_description_template: '{excerpt}'
  }
};

export const BlogCustomizer: React.FC<BlogCustomizerProps> = ({ businessId, onSave }) => {
  const [customization, setCustomization] = useState<BlogCustomization>({
    ...DEFAULT_CUSTOMIZATION,
    business_id: businessId
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadCustomization();
  }, [businessId]);

  const loadCustomization = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_customizations')
        .select('*')
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setCustomization(data);
      }
    } catch (error) {
      console.error('Error loading customization:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      let logoUrl = customization.branding.logo_url;
      
      // Upload logo if new file selected
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${businessId}/logo.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, logoFile, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);
          
        logoUrl = urlData.publicUrl;
      }

      const updatedCustomization = {
        ...customization,
        branding: {
          ...customization.branding,
          logo_url: logoUrl
        }
      };

      const { error } = await supabase
        .from('blog_customizations')
        .upsert(updatedCustomization, {
          onConflict: 'business_id'
        });

      if (error) throw error;

      setCustomization(updatedCustomization);
      onSave?.(updatedCustomization);
      
      toast({
        title: "Customization Saved",
        description: "Your blog design has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving customization:', error);
      toast({
        title: "Error",
        description: "Failed to save customization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateCustomization = (section: keyof BlogCustomization, updates: any) => {
    setCustomization(prev => ({
      ...prev,
      [section]: typeof updates === 'function' ? updates(prev[section]) : { ...prev[section], ...updates }
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        updateCustomization('branding', { logo_url: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToDefaults = () => {
    setCustomization({
      ...DEFAULT_CUSTOMIZATION,
      business_id: businessId
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Customization</h2>
          <p className="text-muted-foreground">Customize the look and feel of your blog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="layout">
            <Layout className="w-4 h-4 mr-2" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette className="w-4 h-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="w-4 h-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Image className="w-4 h-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="images">
            <Square className="w-4 h-4 mr-2" />
            Images
          </TabsTrigger>
          <TabsTrigger value="display">
            <Grid className="w-4 h-4 mr-2" />
            Display
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Style</CardTitle>
              <CardDescription>Choose how your blog posts are displayed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { value: 'grid', label: 'Grid', icon: Grid },
                  { value: 'list', label: 'List', icon: List },
                  { value: 'cards', label: 'Cards', icon: Square },
                  { value: 'magazine', label: 'Magazine', icon: Rows },
                  { value: 'minimal', label: 'Minimal', icon: Type }
                ].map(({ value, label, icon: Icon }) => (
                  <div
                    key={value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      customization.layout_style === value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => updateCustomization('layout_style', value)}
                  >
                    <Icon className="w-8 h-8 mb-2 mx-auto" />
                    <p className="text-center font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Customize the colors used in your blog</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={customization.color_scheme.primary}
                      onChange={(e) => updateCustomization('color_scheme', { primary: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={customization.color_scheme.primary}
                      onChange={(e) => updateCustomization('color_scheme', { primary: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={customization.color_scheme.secondary}
                      onChange={(e) => updateCustomization('color_scheme', { secondary: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={customization.color_scheme.secondary}
                      onChange={(e) => updateCustomization('color_scheme', { secondary: e.target.value })}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background-color"
                      type="color"
                      value={customization.color_scheme.background}
                      onChange={(e) => updateCustomization('color_scheme', { background: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={customization.color_scheme.background}
                      onChange={(e) => updateCustomization('color_scheme', { background: e.target.value })}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={customization.color_scheme.text}
                      onChange={(e) => updateCustomization('color_scheme', { text: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={customization.color_scheme.text}
                      onChange={(e) => updateCustomization('color_scheme', { text: e.target.value })}
                      placeholder="#1e293b"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography Settings</CardTitle>
              <CardDescription>Customize fonts and text styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={customization.typography.font_family}
                  onValueChange={(value) => updateCustomization('typography', { font_family: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                    <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                    <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                    <SelectItem value="Lato, sans-serif">Lato</SelectItem>
                    <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                    <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                    <SelectItem value="Georgia, serif">Georgia</SelectItem>
                    <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heading Size</Label>
                  <Select
                    value={customization.typography.heading_size}
                    onValueChange={(value) => updateCustomization('typography', { heading_size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.25rem">Small</SelectItem>
                      <SelectItem value="1.5rem">Medium</SelectItem>
                      <SelectItem value="1.875rem">Large</SelectItem>
                      <SelectItem value="2.25rem">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Body Size</Label>
                  <Select
                    value={customization.typography.body_size}
                    onValueChange={(value) => updateCustomization('typography', { body_size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.875rem">Small</SelectItem>
                      <SelectItem value="1rem">Medium</SelectItem>
                      <SelectItem value="1.125rem">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Logo</CardTitle>
              <CardDescription>Add your logo and branding elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo Upload</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {customization.branding.logo_url && (
                  <img
                    src={customization.branding.logo_url}
                    alt="Logo preview"
                    className="w-32 h-16 object-contain border rounded"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Logo Position</Label>
                <Select
                  value={customization.branding.logo_position}
                  onValueChange={(value) => updateCustomization('branding', { logo_position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top of page</SelectItem>
                    <SelectItem value="header">In header</SelectItem>
                    <SelectItem value="footer">In footer</SelectItem>
                    <SelectItem value="watermark">As watermark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={customization.branding.show_powered_by}
                  onCheckedChange={(checked) => updateCustomization('branding', { show_powered_by: checked })}
                />
                <Label>Show "Powered by JBSAAS"</Label>
              </div>

              <div className="space-y-2">
                <Label>Custom Footer Text</Label>
                <Textarea
                  value={customization.branding.custom_footer || ''}
                  onChange={(e) => updateCustomization('branding', { custom_footer: e.target.value })}
                  placeholder="Add custom footer text or links..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Image Settings</CardTitle>
              <CardDescription>Configure how images are displayed in posts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Image Aspect Ratio</Label>
                <Select
                  value={customization.image_settings.aspect_ratio}
                  onValueChange={(value) => updateCustomization('image_settings', { aspect_ratio: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square (1:1)</SelectItem>
                    <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                    <SelectItem value="4:3">Standard (4:3)</SelectItem>
                    <SelectItem value="3:2">Classic (3:2)</SelectItem>
                    <SelectItem value="auto">Auto (Original)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Image Position</Label>
                <Select
                  value={customization.image_settings.position}
                  onValueChange={(value) => updateCustomization('image_settings', { position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Above text</SelectItem>
                    <SelectItem value="left">Left of text</SelectItem>
                    <SelectItem value="right">Right of text</SelectItem>
                    <SelectItem value="background">As background</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={customization.image_settings.overlay_text}
                  onCheckedChange={(checked) => updateCustomization('image_settings', { overlay_text: checked })}
                />
                <Label>Overlay text on images</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={customization.image_settings.auto_logo}
                  onCheckedChange={(checked) => updateCustomization('image_settings', { auto_logo: checked })}
                />
                <Label>Automatically add logo to images</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Display Settings</CardTitle>
              <CardDescription>Configure what information to show in post listings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={customization.post_display.show_author}
                    onCheckedChange={(checked) => updateCustomization('post_display', { show_author: checked })}
                  />
                  <Label>Show author</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={customization.post_display.show_date}
                    onCheckedChange={(checked) => updateCustomization('post_display', { show_date: checked })}
                  />
                  <Label>Show date</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={customization.post_display.show_tags}
                    onCheckedChange={(checked) => updateCustomization('post_display', { show_tags: checked })}
                  />
                  <Label>Show tags</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={customization.post_display.show_excerpt}
                    onCheckedChange={(checked) => updateCustomization('post_display', { show_excerpt: checked })}
                  />
                  <Label>Show excerpt</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Excerpt Length (characters)</Label>
                  <Input
                    type="number"
                    value={customization.post_display.excerpt_length}
                    onChange={(e) => updateCustomization('post_display', { excerpt_length: parseInt(e.target.value) })}
                    min="50"
                    max="500"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Posts Per Page</Label>
                  <Input
                    type="number"
                    value={customization.post_display.posts_per_page}
                    onChange={(e) => updateCustomization('post_display', { posts_per_page: parseInt(e.target.value) })}
                    min="3"
                    max="50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};