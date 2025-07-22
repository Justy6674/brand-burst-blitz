import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  MapPin, 
  Globe, 
  Copy, 
  Download,
  Zap,
  CheckCircle,
  Code,
  Smartphone,
  Star,
  TrendingUp,
  Building,
  Clock
} from 'lucide-react';

interface SEOMetadata {
  id: string;
  business_name: string;
  industry: string;
  location: string;
  service_keywords: string[];
  meta_title: string;
  meta_description: string;
  schema_markup: string;
  local_keywords: string[];
  h1_suggestions: string[];
  created_at: string;
}

const AUSTRALIAN_LOCATIONS = [
  { value: 'sydney-nsw', label: 'Sydney, NSW', state: 'NSW' },
  { value: 'melbourne-vic', label: 'Melbourne, VIC', state: 'VIC' },
  { value: 'brisbane-qld', label: 'Brisbane, QLD', state: 'QLD' },
  { value: 'perth-wa', label: 'Perth, WA', state: 'WA' },
  { value: 'adelaide-sa', label: 'Adelaide, SA', state: 'SA' },
  { value: 'gold-coast-qld', label: 'Gold Coast, QLD', state: 'QLD' },
  { value: 'newcastle-nsw', label: 'Newcastle, NSW', state: 'NSW' },
  { value: 'canberra-act', label: 'Canberra, ACT', state: 'ACT' },
  { value: 'sunshine-coast-qld', label: 'Sunshine Coast, QLD', state: 'QLD' },
  { value: 'wollongong-nsw', label: 'Wollongong, NSW', state: 'NSW' }
];

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurant', schema: 'Restaurant' },
  { value: 'dental', label: 'Dental Practice', schema: 'DentistOffice' },
  { value: 'plumber', label: 'Plumber', schema: 'PlumbingService' },
  { value: 'electrician', label: 'Electrician', schema: 'ElectricalService' },
  { value: 'lawyer', label: 'Law Firm', schema: 'LegalService' },
  { value: 'accountant', label: 'Accountant', schema: 'AccountingService' },
  { value: 'gym', label: 'Gym/Fitness', schema: 'ExerciseGym' },
  { value: 'real_estate', label: 'Real Estate', schema: 'RealEstateAgent' },
  { value: 'automotive', label: 'Auto Repair', schema: 'AutoRepair' },
  { value: 'beauty', label: 'Beauty Salon', schema: 'BeautySalon' }
];

export default function LocalSEOMetadataCreator() {
  const [metadata, setMetadata] = useState<SEOMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: '',
    industry: '',
    location: '',
    services: '',
    target_keywords: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .eq('user_id', user.id)
        .ilike('name', '%SEO Metadata%')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMetadata(data?.map(item => ({
        ...JSON.parse(item.template_content),
        id: item.id,
        created_at: item.created_at
      })) || []);

    } catch (error) {
      console.error('Error loading metadata:', error);
      toast({
        title: "Error",
        description: "Failed to load SEO metadata",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSEOMetadata = async () => {
    if (!formData.business_name || !formData.industry || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in business name, industry, and location",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const location = AUSTRALIAN_LOCATIONS.find(l => l.value === formData.location);
      const businessType = BUSINESS_TYPES.find(b => b.value === formData.industry);

      // Generate SEO metadata
      const services = formData.services.split(',').map(s => s.trim());
      const keywords = formData.target_keywords.split(',').map(k => k.trim());

      const metaTitle = `${formData.business_name} | ${businessType?.label} in ${location?.label} | Expert ${services[0] || 'Services'}`;
      const metaDescription = `Looking for ${businessType?.label.toLowerCase()} in ${location?.label}? ${formData.business_name} provides expert ${services.slice(0, 2).join(' and ')} services. Call today for a free consultation!`;

      const localKeywords = [
        `${businessType?.label.toLowerCase()} ${location?.label.toLowerCase()}`,
        `${services[0]?.toLowerCase()} ${location?.state}`,
        `best ${businessType?.label.toLowerCase()} ${location?.label}`,
        `${formData.business_name.toLowerCase()} ${location?.label.toLowerCase()}`,
        `${businessType?.label.toLowerCase()} near me`
      ];

      const h1Suggestions = [
        `Expert ${businessType?.label} Services in ${location?.label}`,
        `${formData.business_name} - Your Local ${businessType?.label}`,
        `Professional ${services[0]} in ${location?.label}`
      ];

      const schemaMarkup = generateSchemaMarkup(formData, location, businessType);

      const newMetadata: SEOMetadata = {
        id: crypto.randomUUID(),
        business_name: formData.business_name,
        industry: formData.industry,
        location: formData.location,
        service_keywords: services,
        meta_title: metaTitle,
        meta_description: metaDescription,
        schema_markup: schemaMarkup,
        local_keywords: localKeywords,
        h1_suggestions: h1Suggestions,
        created_at: new Date().toISOString()
      };

      // Save to database
      const { error } = await supabase
        .from('content_templates')
        .insert({
          user_id: user.id,
          name: `SEO Metadata - ${formData.business_name}`,
          type: 'blog',
          template_content: JSON.stringify(newMetadata),
          tags: [formData.industry, formData.location]
        });

      if (error) throw error;

      toast({
        title: "SEO Metadata Generated",
        description: "Local SEO metadata created successfully"
      });

      setFormData({
        business_name: '',
        industry: '',
        location: '',
        services: '',
        target_keywords: ''
      });

      await loadMetadata();

    } catch (error) {
      console.error('Error generating metadata:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate SEO metadata",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSchemaMarkup = (data: any, location: any, businessType: any) => {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": businessType?.schema || "LocalBusiness",
      "name": data.business_name,
      "description": `Professional ${businessType?.label.toLowerCase()} services in ${location?.label}`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": location?.label.split(',')[0],
        "addressRegion": location?.state,
        "addressCountry": "AU"
      },
      "telephone": "+61-XXX-XXX-XXX",
      "url": "https://yourbusiness.com.au",
      "areaServed": {
        "@type": "City",
        "name": location?.label
      },
      "openingHours": "Mo-Fr 09:00-17:00",
      "priceRange": "$$"
    }, null, 2);
  };

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Search className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading SEO metadata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Search className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Local SEO Metadata Creator</h1>
          <p className="text-muted-foreground">Generate optimized SEO metadata for Australian local businesses</p>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Generate Metadata</TabsTrigger>
          <TabsTrigger value="library">Metadata Library</TabsTrigger>
          <TabsTrigger value="tools">SEO Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Generate Local SEO Metadata
              </CardTitle>
              <CardDescription>
                Create optimized meta titles, descriptions, and schema markup for Australian businesses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name *</label>
                  <Input
                    value={formData.business_name}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                    placeholder="Smith & Associates Dental"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Type *</label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => setFormData({...formData, industry: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location *</label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({...formData, location: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {AUSTRALIAN_LOCATIONS.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Main Services</label>
                  <Input
                    value={formData.services}
                    onChange={(e) => setFormData({...formData, services: e.target.value})}
                    placeholder="dental cleanings, teeth whitening, implants"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Keywords</label>
                <Textarea
                  value={formData.target_keywords}
                  onChange={(e) => setFormData({...formData, target_keywords: e.target.value})}
                  placeholder="dentist melbourne, teeth cleaning, dental implants"
                  rows={2}
                />
              </div>

              <Button 
                onClick={generateSEOMetadata}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-pulse" />
                    Generating SEO Metadata...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Local SEO Metadata
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          {metadata.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No SEO Metadata Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first local SEO metadata to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {metadata.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{item.business_name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {AUSTRALIAN_LOCATIONS.find(l => l.value === item.location)?.label}
                          <span className="text-muted-foreground">•</span>
                          {BUSINESS_TYPES.find(b => b.value === item.industry)?.label}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {new Date(item.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs defaultValue="meta" className="space-y-3">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="meta">Meta Tags</TabsTrigger>
                        <TabsTrigger value="schema">Schema</TabsTrigger>
                        <TabsTrigger value="keywords">Keywords</TabsTrigger>
                        <TabsTrigger value="headings">Headings</TabsTrigger>
                      </TabsList>

                      <TabsContent value="meta" className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">Meta Title</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(item.meta_title)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="bg-muted p-3 rounded text-sm">
                            {item.meta_title}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">Meta Description</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(item.meta_description)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="bg-muted p-3 rounded text-sm">
                            {item.meta_description}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="schema" className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">JSON-LD Schema Markup</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(item.schema_markup)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-64">
                          <pre>{item.schema_markup}</pre>
                        </div>
                      </TabsContent>

                      <TabsContent value="keywords" className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Local Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.local_keywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="headings" className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">H1 Tag Suggestions</h4>
                          <div className="space-y-2">
                            {item.h1_suggestions.map((heading, index) => (
                              <div key={index} className="flex items-center justify-between bg-muted p-3 rounded">
                                <span className="text-sm">{heading}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(heading)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  SEO Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Meta Title Guidelines</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• 50-60 characters optimal length</li>
                    <li>• Include primary keyword near beginning</li>
                    <li>• Add location for local businesses</li>
                    <li>• Make it compelling and clickable</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Meta Description Tips</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• 150-160 characters for full display</li>
                    <li>• Include call-to-action</li>
                    <li>• Mention unique selling points</li>
                    <li>• Use action-oriented language</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Local SEO Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Essential Elements</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Google My Business optimization</li>
                    <li>• NAP consistency across web</li>
                    <li>• Local schema markup</li>
                    <li>• Location-specific content</li>
                    <li>• Local keyword targeting</li>
                    <li>• Customer reviews management</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}