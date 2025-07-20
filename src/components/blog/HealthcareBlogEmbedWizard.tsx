import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useBlogEmbedSSR } from '@/hooks/useBlogEmbedSSR';
import { useHealthcareAuth } from '@/hooks/useHealthcareAuth';
import { 
  Copy, CheckCircle, AlertTriangle, Eye, Palette, Code, 
  Smartphone, Monitor, Globe, Shield, ChevronRight, ChevronLeft,
  Zap, FileText, Settings, Star, Play, Download
} from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const wizardSteps: WizardStep[] = [
  {
    id: 'practice-info',
    title: 'Practice Information',
    description: 'Enter your healthcare practice details',
    completed: false
  },
  {
    id: 'content-selection',
    title: 'Content Selection',
    description: 'Choose blog posts to display',
    completed: false
  },
  {
    id: 'style-customization',
    title: 'Style Customization',
    description: 'Customize appearance for your website',
    completed: false
  },
  {
    id: 'seo-optimization',
    title: 'SEO Optimization',
    description: 'Configure search engine optimization',
    completed: false
  },
  {
    id: 'compliance-settings',
    title: 'AHPRA Compliance',
    description: 'Configure healthcare compliance display',
    completed: false
  },
  {
    id: 'code-generation',
    title: 'Get Your Code',
    description: 'Copy and paste into your website',
    completed: false
  }
];

const WEBSITE_PLATFORMS = [
  { value: 'wordpress', label: 'WordPress', icon: '🔌', instructions: 'Paste in HTML widget or custom HTML block' },
  { value: 'wix', label: 'Wix', icon: '🎨', instructions: 'Add HTML component and paste code' },
  { value: 'godaddy', label: 'GoDaddy Website Builder', icon: '🏗️', instructions: 'Use HTML/Embed section' },
  { value: 'squarespace', label: 'Squarespace', icon: '⬜', instructions: 'Add Code Block element' },
  { value: 'shopify', label: 'Shopify', icon: '🛒', instructions: 'Add Custom HTML section' },
  { value: 'weebly', label: 'Weebly', icon: '🔧', instructions: 'Insert HTML code element' },
  { value: 'other', label: 'Other Website', icon: '🌐', instructions: 'Paste in any HTML area' }
];

const COLOR_THEMES = [
  { name: 'Professional Blue', primary: '#2563eb', accent: '#7c3aed', bg: '#ffffff' },
  { name: 'Healthcare Green', primary: '#059669', accent: '#7c2d12', bg: '#ffffff' },
  { name: 'Medical Red', primary: '#dc2626', accent: '#7c3aed', bg: '#ffffff' },
  { name: 'Clean Minimal', primary: '#374151', accent: '#6366f1', bg: '#ffffff' },
  { name: 'Dark Professional', primary: '#1e40af', accent: '#c026d3', bg: '#f9fafb' }
];

export const HealthcareBlogEmbedWizard = () => {
  const { user } = useHealthcareAuth();
  const {
    generateSSRHTML,
    generateEmbedScript,
    isGenerating,
    HEALTHCARE_CATEGORIES
  } = useBlogEmbedSSR();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [generatedHTML, setGeneratedHTML] = useState<any>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Practice Information
    practice_name: user?.practice_name || '',
    website_url: '',
    practice_phone: '',
    practice_address: {
      street: '',
      city: '',
      state: 'NSW',
      postal_code: '',
    },
    ahpra_registration: user?.ahpra_registration || '',
    specialty: user?.profession_type?.replace('_', ' ') || '',

    // Content Selection
    selected_categories: [] as string[],
    posts_per_page: 6,
    content_focus: 'patient_education' as 'patient_education' | 'practice_marketing' | 'mixed',

    // Style Customization
    theme: 'professional' as 'professional' | 'modern' | 'minimal' | 'healthcare',
    color_theme: COLOR_THEMES[0],
    font_family: 'Inter',
    layout: 'grid' as 'grid' | 'list' | 'card',
    show_images: true,
    show_excerpts: true,
    show_author: true,
    show_date: true,
    show_categories: true,
    show_reading_time: true,

    // SEO Settings
    seo_site_name: '',
    seo_description: '',
    enable_schema: true,
    enable_open_graph: true,

    // Compliance Settings
    show_ahpra_disclaimers: true,
    show_medical_disclaimers: true,
    auto_add_disclaimers: true,
    show_practice_registration: true
  });

  // Mock blog posts for preview
  const mockBlogPosts = [
    {
      id: '1',
      title: 'Understanding Heart Health: A Patient Guide',
      slug: 'understanding-heart-health-patient-guide',
      excerpt: 'Learn about maintaining cardiovascular health through lifestyle choices and regular check-ups.',
      content: 'Heart health is fundamental to overall wellbeing...',
      featured_image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
      categories: ['Patient Education', 'General Health'],
      tags: ['heart health', 'prevention'],
      author: {
        name: user?.practice_name || 'Healthcare Professional',
        ahpra_registration: user?.ahpra_registration,
        specialty: user?.profession_type?.replace('_', ' ') || 'Healthcare'
      },
      published_date: new Date().toISOString(),
      seo_meta: {
        title: 'Understanding Heart Health: A Patient Guide',
        description: 'Learn about maintaining cardiovascular health through lifestyle choices and regular check-ups.',
        keywords: ['heart health', 'cardiovascular', 'prevention', 'patient education'],
        canonical_url: `${formData.website_url}/blog/understanding-heart-health-patient-guide`
      },
      compliance_status: {
        ahpra_compliant: true,
        tga_compliant: true,
        compliance_score: 98,
        disclaimers: ['This information is for educational purposes only. Consult your healthcare provider for medical advice.']
      },
      healthcare_metadata: {
        target_audience: 'patients' as const,
        medical_accuracy_verified: true,
        evidence_based: true,
        specialty_specific: ['General Practice', 'Cardiology']
      }
    },
    {
      id: '2',
      title: 'Mental Health Support: When to Seek Help',
      slug: 'mental-health-support-when-to-seek-help',
      excerpt: 'Recognising the signs when professional mental health support may be beneficial.',
      content: 'Mental health is just as important as physical health...',
      featured_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      categories: ['Mental Health', 'Patient Education'],
      tags: ['mental health', 'support', 'wellbeing'],
      author: {
        name: user?.practice_name || 'Healthcare Professional',
        ahpra_registration: user?.ahpra_registration,
        specialty: user?.profession_type?.replace('_', ' ') || 'Healthcare'
      },
      published_date: new Date(Date.now() - 86400000).toISOString(),
      seo_meta: {
        title: 'Mental Health Support: When to Seek Help',
        description: 'Recognising the signs when professional mental health support may be beneficial.',
        keywords: ['mental health', 'psychology', 'support', 'wellbeing'],
        canonical_url: `${formData.website_url}/blog/mental-health-support-when-to-seek-help`
      },
      compliance_status: {
        ahpra_compliant: true,
        tga_compliant: true,
        compliance_score: 96,
        disclaimers: ['This information is for educational purposes only. Consult your healthcare provider for mental health concerns.']
      },
      healthcare_metadata: {
        target_audience: 'patients' as const,
        medical_accuracy_verified: true,
        evidence_based: true,
        specialty_specific: ['Psychology', 'Mental Health']
      }
    }
  ];

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const canProceedToNext = () => {
    return completedSteps.has(wizardSteps[currentStep].id);
  };

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateBlogEmbed = async () => {
    try {
      const config = {
        practice_id: user?.id || 'demo',
        widget_id: `widget_${Date.now()}`,
        style: {
          theme: formData.theme,
          primary_color: formData.color_theme.primary,
          accent_color: formData.color_theme.accent,
          font_family: formData.font_family,
          layout: formData.layout
        },
        seo_settings: {
          site_name: formData.seo_site_name || formData.practice_name,
          base_url: formData.website_url,
          organization_schema: {
            name: formData.practice_name,
            type: 'MedicalOrganization' as const,
            address: {
              street: formData.practice_address.street,
              city: formData.practice_address.city,
              state: formData.practice_address.state,
              postal_code: formData.practice_address.postal_code,
              country: 'AU' as const
            },
            phone: formData.practice_phone,
            website: formData.website_url,
            ahpra_registration: formData.ahpra_registration
          }
        },
        display_options: {
          posts_per_page: formData.posts_per_page,
          show_featured_image: formData.show_images,
          show_excerpt: formData.show_excerpts,
          show_author: formData.show_author,
          show_date: formData.show_date,
          show_categories: formData.show_categories,
          show_reading_time: formData.show_reading_time,
          enable_pagination: true,
          enable_search: false,
          enable_categories_filter: formData.selected_categories.length > 1
        },
        compliance_settings: {
          show_ahpra_disclaimers: formData.show_ahpra_disclaimers,
          show_medical_disclaimers: formData.show_medical_disclaimers,
          auto_add_disclaimers: formData.auto_add_disclaimers,
          practice_registration_display: formData.show_practice_registration
        }
      };

      const filteredPosts = mockBlogPosts.filter(post => 
        formData.selected_categories.length === 0 || 
        post.categories.some(cat => formData.selected_categories.includes(cat))
      );

      const result = await generateSSRHTML(filteredPosts, config);
      setGeneratedHTML(result);

      // Generate the embed script
      const embedScript = `<!-- JBSAAS Healthcare Blog Embed -->
<div id="jbsaas-healthcare-blog"></div>
<script>
  document.getElementById('jbsaas-healthcare-blog').innerHTML = \`${result.html.replace(/`/g, '\\`')}\`;
</script>
<!-- End JBSAAS Healthcare Blog Embed -->`;

      setGeneratedCode(embedScript);
      markStepComplete('code-generation');

    } catch (error) {
      console.error('Failed to generate blog embed:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const renderCurrentStep = () => {
    switch (wizardSteps[currentStep].id) {
      case 'practice-info':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Practice Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="practice_name">Practice Name *</Label>
                  <Input
                    id="practice_name"
                    value={formData.practice_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, practice_name: e.target.value }))}
                    placeholder="Your Medical Practice"
                  />
                </div>
                <div>
                  <Label htmlFor="website_url">Website URL *</Label>
                  <Input
                    id="website_url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://yourpractice.com.au"
                  />
                </div>
                <div>
                  <Label htmlFor="practice_phone">Phone Number</Label>
                  <Input
                    id="practice_phone"
                    value={formData.practice_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, practice_phone: e.target.value }))}
                    placeholder="(02) 1234 5678"
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Healthcare Specialty</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    placeholder="General Practice"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Practice Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.practice_address.street}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      practice_address: { ...prev.practice_address, street: e.target.value }
                    }))}
                    placeholder="123 Health Street"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.practice_address.city}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      practice_address: { ...prev.practice_address, city: e.target.value }
                    }))}
                    placeholder="Sydney"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select 
                    value={formData.practice_address.state} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      practice_address: { ...prev.practice_address, state: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NSW">NSW</SelectItem>
                      <SelectItem value="VIC">VIC</SelectItem>
                      <SelectItem value="QLD">QLD</SelectItem>
                      <SelectItem value="WA">WA</SelectItem>
                      <SelectItem value="SA">SA</SelectItem>
                      <SelectItem value="TAS">TAS</SelectItem>
                      <SelectItem value="ACT">ACT</SelectItem>
                      <SelectItem value="NT">NT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => markStepComplete('practice-info')}
              disabled={!formData.practice_name || !formData.website_url}
              className="w-full"
            >
              Continue to Content Selection
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'content-selection':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Content Categories</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose the types of healthcare content you want to display on your website
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {HEALTHCARE_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={formData.selected_categories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            selected_categories: [...prev.selected_categories, category]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            selected_categories: prev.selected_categories.filter(c => c !== category)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={category} className="text-sm">{category}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="posts_per_page">Posts per Page</Label>
                <Select 
                  value={formData.posts_per_page.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, posts_per_page: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 posts</SelectItem>
                    <SelectItem value="6">6 posts</SelectItem>
                    <SelectItem value="9">9 posts</SelectItem>
                    <SelectItem value="12">12 posts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content_focus">Content Focus</Label>
                <Select 
                  value={formData.content_focus} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, content_focus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient_education">Patient Education</SelectItem>
                    <SelectItem value="practice_marketing">Practice Marketing</SelectItem>
                    <SelectItem value="mixed">Mixed Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={() => markStepComplete('content-selection')}
              className="w-full"
            >
              Continue to Style Customization
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'style-customization':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Customize Appearance</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Color Theme</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {COLOR_THEMES.map((theme) => (
                      <div
                        key={theme.name}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.color_theme.name === theme.name 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, color_theme: theme }))}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: theme.primary }}
                            />
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: theme.accent }}
                            />
                          </div>
                          <span className="text-sm font-medium">{theme.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="layout">Layout Style</Label>
                    <Select 
                      value={formData.layout} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, layout: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid Layout</SelectItem>
                        <SelectItem value="list">List Layout</SelectItem>
                        <SelectItem value="card">Card Layout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="font_family">Font Family</Label>
                    <Select 
                      value={formData.font_family} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, font_family: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter (Modern)</SelectItem>
                        <SelectItem value="Georgia">Georgia (Classic)</SelectItem>
                        <SelectItem value="Arial">Arial (Simple)</SelectItem>
                        <SelectItem value="Roboto">Roboto (Clean)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Display Options</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {[
                      { key: 'show_images', label: 'Show Images' },
                      { key: 'show_excerpts', label: 'Show Excerpts' },
                      { key: 'show_author', label: 'Show Author' },
                      { key: 'show_date', label: 'Show Date' },
                      { key: 'show_categories', label: 'Show Categories' },
                      { key: 'show_reading_time', label: 'Show Reading Time' }
                    ].map((option) => (
                      <div key={option.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.key}
                          checked={formData[option.key as keyof typeof formData] as boolean}
                          onCheckedChange={(checked) => {
                            setFormData(prev => ({ ...prev, [option.key]: checked }));
                          }}
                        />
                        <Label htmlFor={option.key} className="text-sm">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => markStepComplete('style-customization')}
              className="w-full"
            >
              Continue to SEO Settings
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'seo-optimization':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">SEO Optimization</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure search engine optimization for better Google visibility
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="seo_site_name">Site Name for Search Results</Label>
                  <Input
                    id="seo_site_name"
                    value={formData.seo_site_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_site_name: e.target.value }))}
                    placeholder={formData.practice_name}
                  />
                </div>

                <div>
                  <Label htmlFor="seo_description">Practice Description for Search</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="Healthcare practice providing quality medical care in [your location]"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">SEO Features</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enable_schema"
                        checked={formData.enable_schema}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_schema: checked as boolean }))}
                      />
                      <Label htmlFor="enable_schema" className="text-sm">
                        Enable Schema.org markup for better search results
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enable_open_graph"
                        checked={formData.enable_open_graph}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_open_graph: checked as boolean }))}
                      />
                      <Label htmlFor="enable_open_graph" className="text-sm">
                        Enable social media sharing optimization
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Globe className="h-4 w-4" />
              <AlertDescription>
                <strong>SEO Benefits:</strong> Your blog content will automatically include proper meta tags, 
                structured data, and healthcare-specific SEO optimization to help patients find your practice online.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => markStepComplete('seo-optimization')}
              className="w-full"
            >
              Continue to Compliance Settings
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'compliance-settings':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">AHPRA Compliance Settings</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure how compliance information is displayed with your content
              </p>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show_ahpra_disclaimers"
                      checked={formData.show_ahpra_disclaimers}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_ahpra_disclaimers: checked as boolean }))}
                    />
                    <Label htmlFor="show_ahpra_disclaimers" className="text-sm">
                      Show AHPRA compliance disclaimers
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show_medical_disclaimers"
                      checked={formData.show_medical_disclaimers}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_medical_disclaimers: checked as boolean }))}
                    />
                    <Label htmlFor="show_medical_disclaimers" className="text-sm">
                      Show medical disclaimers for patient safety
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show_practice_registration"
                      checked={formData.show_practice_registration}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_practice_registration: checked as boolean }))}
                    />
                    <Label htmlFor="show_practice_registration" className="text-sm">
                      Display AHPRA registration number
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto_add_disclaimers"
                      checked={formData.auto_add_disclaimers}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_add_disclaimers: checked as boolean }))}
                    />
                    <Label htmlFor="auto_add_disclaimers" className="text-sm">
                      Automatically add required disclaimers to all content
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Compliance Protection:</strong> All your blog content will automatically follow AHPRA advertising 
                guidelines and include appropriate disclaimers to protect your professional standing.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => markStepComplete('compliance-settings')}
              className="w-full"
            >
              Generate Your Blog Code
              <Zap className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'code-generation':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Blog Embed Code</h3>
              <p className="text-sm text-gray-600 mb-4">
                Copy the code below and paste it into your website where you want the blog to appear
              </p>

              {!generatedCode && (
                <Button 
                  onClick={generateBlogEmbed}
                  disabled={isGenerating}
                  className="w-full mb-4"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Your Code...
                    </>
                  ) : (
                    <>
                      <Code className="mr-2 h-4 w-4" />
                      Generate Healthcare Blog Code
                    </>
                  )}
                </Button>
              )}

              {generatedCode && (
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      value={generatedCode}
                      readOnly
                      rows={10}
                      className="font-mono text-sm bg-gray-50"
                    />
                    <Button
                      onClick={copyToClipboard}
                      className="absolute top-2 right-2"
                      size="sm"
                    >
                      {copiedCode ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Platform-specific instructions */}
                  <div>
                    <Label htmlFor="platform">Your Website Platform</Label>
                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your website platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEBSITE_PLATFORMS.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            <span className="flex items-center gap-2">
                              <span>{platform.icon}</span>
                              {platform.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPlatform && (
                    <Alert className="border-green-200 bg-green-50">
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        <strong>
                          {WEBSITE_PLATFORMS.find(p => p.value === selectedPlatform)?.label} Instructions:
                        </strong>
                        <br />
                        {WEBSITE_PLATFORMS.find(p => p.value === selectedPlatform)?.instructions}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Performance metrics */}
                  {generatedHTML && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(generatedHTML.performance_metrics.total_size / 1024)}KB
                        </div>
                        <div className="text-xs text-gray-600">Total Size</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">SEO</div>
                        <div className="text-xs text-gray-600">Optimized</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">Mobile</div>
                        <div className="text-xs text-gray-600">Responsive</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">AHPRA</div>
                        <div className="text-xs text-gray-600">Compliant</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  const progress = ((currentStep + 1) / wizardSteps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Globe className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Healthcare Blog Setup Wizard</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Create a professional, AHPRA-compliant blog for your website in minutes. 
          No technical skills required - just copy and paste!
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {wizardSteps[currentStep].title}
          </span>
          <span className="text-sm text-gray-500">
            {currentStep + 1} of {wizardSteps.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(
              currentStep === 0 ? FileText :
              currentStep === 1 ? Eye :
              currentStep === 2 ? Palette :
              currentStep === 3 ? Globe :
              currentStep === 4 ? Shield : Code,
              { className: "h-5 w-5" }
            )}
            {wizardSteps[currentStep].title}
          </CardTitle>
          <CardDescription>
            {wizardSteps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        {currentStep < wizardSteps.length - 1 && (
          <Button
            onClick={handleNext}
            disabled={!canProceedToNext()}
          >
            Next Step
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        {currentStep === wizardSteps.length - 1 && generatedCode && (
          <Button
            onClick={() => {
              // Could trigger a completion callback here
              alert('Blog embed setup complete! Your code is ready to use.');
            }}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Setup Complete
          </Button>
        )}
      </div>
    </div>
  );
}; 