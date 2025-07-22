import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Eye, 
  Download, 
  Settings, 
  FileText, 
  Globe, 
  Sparkles,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlogTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  layout: 'modern' | 'classic' | 'minimal' | 'magazine';
  sampleContent: {
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
  }[];
  features: string[];
  previewImage: string;
  isPublic: boolean;
  created_at: string;
  usage_count: number;
}

interface TemplateEngineProps {
  onTemplateSelect?: (template: BlogTemplate) => void;
  selectedIndustry?: string;
}

const BlogTemplateEngine: React.FC<TemplateEngineProps> = ({
  onTemplateSelect,
  selectedIndustry
}) => {
  const [templates, setTemplates] = useState<BlogTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<BlogTemplate | null>(null);
  const [customization, setCustomization] = useState({
    businessName: '',
    primaryColor: '#6366f1',
    secondaryColor: '#10b981',
    industry: selectedIndustry || 'general'
  });
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const { toast } = useToast();

  // Industry-specific templates
  const industryTemplates: BlogTemplate[] = [
    {
      id: 'health-professional',
      name: 'Health Professional',
      description: 'Clean, trustworthy design for healthcare practitioners',
      industry: 'health',
      colorScheme: {
        primary: '#2563eb',
        secondary: '#059669',
        accent: '#7c3aed',
        background: '#f8fafc'
      },
      layout: 'modern',
      sampleContent: [
        {
          title: 'Patient Care Excellence in Modern Healthcare',
          excerpt: 'Delivering exceptional patient outcomes through evidence-based practice and compassionate care.',
          content: 'Healthcare professionals today face unique challenges...',
          tags: ['healthcare', 'patient care', 'medical practice']
        },
        {
          title: 'Telehealth: The Future of Medical Consultations',
          excerpt: 'How digital health solutions are transforming patient-doctor relationships.',
          content: 'The rise of telehealth has revolutionized...',
          tags: ['telehealth', 'digital health', 'innovation']
        }
      ],
      features: ['Patient portal integration', 'Appointment booking', 'Medical disclaimer templates'],
      previewImage: '/api/placeholder/400/250',
      isPublic: true,
      created_at: new Date().toISOString(),
      usage_count: 145
    },
    {
      id: 'finance-advisor',
      name: 'Financial Services',
      description: 'Professional template for financial advisors and firms',
      industry: 'finance',
      colorScheme: {
        primary: '#1e40af',
        secondary: '#059669',
        accent: '#dc2626',
        background: '#fefefe'
      },
      layout: 'classic',
      sampleContent: [
        {
          title: 'Investment Strategies for 2025',
          excerpt: 'Navigate market volatility with proven investment approaches.',
          content: 'As we look ahead to 2025, investors face...',
          tags: ['investment', 'finance', 'market analysis']
        },
        {
          title: 'Tax Planning for Small Business Owners',
          excerpt: 'Maximize deductions and optimize your tax strategy.',
          content: 'Small business owners have unique tax considerations...',
          tags: ['tax planning', 'small business', 'deductions']
        }
      ],
      features: ['Market data widgets', 'Calculator tools', 'Compliance disclaimers'],
      previewImage: '/api/placeholder/400/250',
      isPublic: true,
      created_at: new Date().toISOString(),
      usage_count: 89
    },
    {
      id: 'legal-practice',
      name: 'Legal Practice',
      description: 'Authoritative design for law firms and legal professionals',
      industry: 'legal',
      colorScheme: {
        primary: '#1f2937',
        secondary: '#b91c1c',
        accent: '#92400e',
        background: '#f9fafb'
      },
      layout: 'classic',
      sampleContent: [
        {
          title: 'Understanding Your Legal Rights',
          excerpt: 'A comprehensive guide to legal protections and obligations.',
          content: 'Legal rights form the foundation of our society...',
          tags: ['legal rights', 'law', 'legal advice']
        },
        {
          title: 'Recent Changes in Business Law',
          excerpt: 'Key updates affecting business operations and compliance.',
          content: 'The legal landscape for businesses continues to evolve...',
          tags: ['business law', 'compliance', 'regulations']
        }
      ],
      features: ['Case study templates', 'Legal document library', 'Practice area sections'],
      previewImage: '/api/placeholder/400/250',
      isPublic: true,
      created_at: new Date().toISOString(),
      usage_count: 67
    },
    {
      id: 'tech-startup',
      name: 'Technology & Startup',
      description: 'Modern, innovative design for tech companies and startups',
      industry: 'tech',
      colorScheme: {
        primary: '#6366f1',
        secondary: '#06b6d4',
        accent: '#f59e0b',
        background: '#fafafa'
      },
      layout: 'modern',
      sampleContent: [
        {
          title: 'The Future of AI in Business',
          excerpt: 'How artificial intelligence is transforming industries.',
          content: 'Artificial intelligence is no longer science fiction...',
          tags: ['AI', 'technology', 'business transformation']
        },
        {
          title: 'Building Scalable SaaS Products',
          excerpt: 'Best practices for creating software that grows with your business.',
          content: 'Scalability is crucial for SaaS success...',
          tags: ['SaaS', 'scalability', 'software development']
        }
      ],
      features: ['API documentation', 'Product showcase', 'Developer resources'],
      previewImage: '/api/placeholder/400/250',
      isPublic: true,
      created_at: new Date().toISOString(),
      usage_count: 203
    },
    {
      id: 'fitness-wellness',
      name: 'Fitness & Wellness',
      description: 'Energetic design for fitness professionals and wellness coaches',
      industry: 'fitness',
      colorScheme: {
        primary: '#059669',
        secondary: '#dc2626',
        accent: '#7c3aed',
        background: '#f0fdfa'
      },
      layout: 'modern',
      sampleContent: [
        {
          title: 'Nutrition Tips for Peak Performance',
          excerpt: 'Fuel your body for optimal health and fitness results.',
          content: 'Proper nutrition is the foundation of fitness...',
          tags: ['nutrition', 'fitness', 'health']
        },
        {
          title: 'Home Workout Essentials',
          excerpt: 'Create an effective fitness routine without a gym membership.',
          content: 'You don\'t need expensive equipment to stay fit...',
          tags: ['home workout', 'fitness', 'exercise']
        }
      ],
      features: ['Workout plans', 'Nutrition tracking', 'Progress galleries'],
      previewImage: '/api/placeholder/400/250',
      isPublic: true,
      created_at: new Date().toISOString(),
      usage_count: 156
    },
    {
      id: 'beauty-lifestyle',
      name: 'Beauty & Lifestyle',
      description: 'Elegant design for beauty professionals and lifestyle brands',
      industry: 'beauty',
      colorScheme: {
        primary: '#be185d',
        secondary: '#7c3aed',
        accent: '#f59e0b',
        background: '#fef7ff'
      },
      layout: 'magazine',
      sampleContent: [
        {
          title: 'Skincare Routine for Every Season',
          excerpt: 'Adapt your skincare regimen to changing weather and conditions.',
          content: 'Your skin\'s needs change with the seasons...',
          tags: ['skincare', 'beauty', 'seasonal care']
        },
        {
          title: 'Sustainable Beauty Practices',
          excerpt: 'Eco-friendly approaches to beauty and personal care.',
          content: 'The beauty industry is embracing sustainability...',
          tags: ['sustainable beauty', 'eco-friendly', 'green beauty']
        }
      ],
      features: ['Product galleries', 'Before/after showcases', 'Beauty tips library'],
      previewImage: '/api/placeholder/400/250',
      isPublic: true,
      created_at: new Date().toISOString(),
      usage_count: 134
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, [selectedIndustry]);

  const loadTemplates = async () => {
    try {
      // In a real implementation, this would load from the database
      // For now, we'll use the predefined templates
      let filteredTemplates = industryTemplates;
      
      if (selectedIndustry && selectedIndustry !== 'all') {
        filteredTemplates = industryTemplates.filter(
          template => template.industry === selectedIndustry
        );
      }
      
      setTemplates(filteredTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error Loading Templates",
        description: "Unable to load blog templates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: BlogTemplate) => {
    setSelectedTemplate(template);
    setCustomization(prev => ({
      ...prev,
      industry: template.industry,
      primaryColor: template.colorScheme.primary,
      secondaryColor: template.colorScheme.secondary
    }));
    
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const handleCustomization = (field: string, value: string) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCustomTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const customTemplate = {
        ...selectedTemplate,
        id: `custom-${Date.now()}`,
        name: `${customization.businessName} Blog`,
        colorScheme: {
          ...selectedTemplate.colorScheme,
          primary: customization.primaryColor,
          secondary: customization.secondaryColor
        },
        isPublic: false
      };

      // In a real implementation, this would save to the database
      toast({
        title: "Template Generated!",
        description: "Your custom blog template has been created successfully.",
      });

      return customTemplate;
    } catch (error) {
      console.error('Error generating template:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate custom template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const industries = [
    { value: 'all', label: 'All Industries' },
    { value: 'health', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'legal', label: 'Legal' },
    { value: 'tech', label: 'Technology' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'general', label: 'General Business' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gradient-primary">
          Blog Template Engine
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose from industry-specific templates and customize them for your business.
          Professional designs with built-in SEO optimization and content suggestions.
        </p>
      </div>

      {/* Industry Filter */}
      <div className="flex justify-center">
        <div className="w-64">
          <Label htmlFor="industry-filter">Filter by Industry</Label>
          <Select
            value={customization.industry}
            onValueChange={(value) => handleCustomization('industry', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">{template.industry}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Color Scheme Preview */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Colors:</span>
                      <div className="flex gap-1">
                        <div 
                          className="w-6 h-6 rounded-full border" 
                          style={{ backgroundColor: template.colorScheme.primary }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full border" 
                          style={{ backgroundColor: template.colorScheme.secondary }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full border" 
                          style={{ backgroundColor: template.colorScheme.accent }}
                        />
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <span className="text-sm font-medium">Features:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.features.slice(0, 2).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {template.features.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.features.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Used {template.usage_count} times</span>
                      <span className="capitalize">{template.layout} layout</span>
                    </div>

                    {/* Selection Indicator */}
                    {selectedTemplate?.id === template.id && (
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="customize" className="space-y-6">
          {selectedTemplate ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customization Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Customize Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input
                      id="business-name"
                      placeholder="Enter your business name"
                      value={customization.businessName}
                      onChange={(e) => handleCustomization('businessName', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={customization.primaryColor}
                        onChange={(e) => handleCustomization('primaryColor', e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={customization.primaryColor}
                        onChange={(e) => handleCustomization('primaryColor', e.target.value)}
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={customization.secondaryColor}
                        onChange={(e) => handleCustomization('secondaryColor', e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={customization.secondaryColor}
                        onChange={(e) => handleCustomization('secondaryColor', e.target.value)}
                        placeholder="#10b981"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Template Features</h4>
                    {selectedTemplate.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={generateCustomTemplate}
                    className="w-full"
                    disabled={!customization.businessName}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Custom Template
                  </Button>
                </CardContent>
              </Card>

              {/* Sample Content Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Sample Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTemplate.sampleContent.map((content, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/30">
                        <h4 className="font-medium mb-2">{content.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {content.excerpt}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {content.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Template First</h3>
              <p className="text-muted-foreground">
                Choose a template from the Templates tab to begin customization.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {selectedTemplate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Template Preview</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    Desktop
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    Mobile
                  </Button>
                </div>
              </div>

              <div className={`mx-auto border rounded-lg overflow-hidden ${
                previewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
              }`}>
                <div 
                  className="h-96 bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${customization.primaryColor}10, ${customization.secondaryColor}10)` 
                  }}
                >
                  <div className="text-center space-y-4">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: customization.primaryColor }}
                    >
                      {customization.businessName ? customization.businessName[0] : 'B'}
                    </div>
                    <h2 className="text-2xl font-bold">
                      {customization.businessName || 'Your Business Name'}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedTemplate.description}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {selectedTemplate.sampleContent[0]?.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Preview shows how your blog will look with the selected template and customizations.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Template Selected</h3>
              <p className="text-muted-foreground">
                Select and customize a template to see the preview.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogTemplateEngine;