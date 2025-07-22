import React, { useState, useEffect } from 'react';
import { Search, Filter, Tags, Sparkles, MapPin, Building2, TrendingUp, Calendar, Globe, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useContentTemplates } from '@/hooks/useContentTemplates';
import { AIContentGenerator } from '@/components/content/AIContentGenerator';
import type { Tables } from '@/integrations/supabase/types';

type ContentTemplate = Tables<'content_templates'>;

// Australian Industry Categories
const AUSTRALIAN_INDUSTRIES = [
  'retail', 'trades', 'hospitality', 'professional_services', 
  'wellness', 'education', 'non_profit', 'healthcare', 
  'real_estate', 'automotive', 'agriculture', 'technology'
];

// Use Case Categories
const USE_CASES = [
  'grand_opening', 'sale', 'testimonial', 'how_to', 
  'seasonal_offer', 'product_launch', 'recruitment', 
  'community_event', 'compliance_update', 'milestone'
];

// Pre-defined template library for Australian SMEs
const AUSTRALIAN_TEMPLATE_LIBRARY = [
  {
    name: "EOFY Sale Announcement",
    industry: "retail",
    useCase: "sale",
    tags: ["#EOFY", "#Sale", "#Retail", "#AustralianTax", "#June30"],
    content: `🔥 EOFY SALE NOW ON! 🔥

Before June 30th, grab massive savings across our entire range!

✅ Up to 50% off selected items
✅ Tax deductions available for business purchases
✅ Free shipping Australia-wide

Don't miss out on these EOFY specials - perfect for upgrading your [PRODUCT/SERVICE] before the financial year ends.

📍 Visit us in-store or shop online
⏰ Sale ends June 30th

#EOFY #Australian #Sale #SmallBusiness #[LOCATION]`,
    tone: "energetic"
  },
  {
    name: "Local Tradie Service Spotlight", 
    industry: "trades",
    useCase: "testimonial",
    tags: ["#Trades", "#Local", "#Testimonial", "#AustralianMade", "#Quality"],
    content: `⭐ CUSTOMER SPOTLIGHT ⭐

"[TRADIE NAME] transformed our [PROJECT TYPE] beyond expectations. Professional, on-time, and genuinely cares about quality work."
- [CUSTOMER NAME], [SUBURB]

🔧 Why choose us:
✅ Fully licensed & insured
✅ Local [SUBURB/REGION] specialists  
✅ 15+ years experience
✅ Fair dinkum pricing

Ready for your next project? Get your free quote today!

📞 [PHONE] | 🌐 [WEBSITE]
#[LOCATION]Trades #Australian #Quality #Local`,
    tone: "trustworthy"
  },
  {
    name: "Melbourne Cup Hospitality Special",
    industry: "hospitality", 
    useCase: "seasonal_offer",
    tags: ["#MelbourneCup", "#Hospitality", "#Spring", "#Racing", "#Event"],
    content: `🏇 MELBOURNE CUP CELEBRATIONS 🏇

Join us for the race that stops a nation!

🥂 What's on:
• Live race coverage on the big screen
• Cup Day lunch specials
• Sweepstakes & prizes
• Traditional Aussie fare
• Fascinator competition

📅 Tuesday, November 7th from 11am
📍 [VENUE ADDRESS]
📞 Book now: [PHONE]

Dress code: Smart casual (fascinators encouraged!)

#MelbourneCup #[LOCATION] #Racing #AustralianTradition`,
    tone: "festive"
  }
];

interface SearchFilters {
  industry: string;
  useCase: string;
  location: string;
  tags: string[];
}

export const AISearchableTemplateLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    industry: 'all',
    useCase: 'all', 
    location: '',
    tags: []
  });
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [customizedTemplates, setCustomizedTemplates] = useState<any[]>([]);

  const { toast } = useToast();
  const { createTemplate } = useContentTemplates();

  // Enhanced AI search with keyword matching
  const searchTemplates = (query: string, templates: any[]) => {
    if (!query.trim()) return templates;
    
    const searchTerms = query.toLowerCase().split(' ');
    return templates.filter(template => {
      const searchableText = [
        template.name,
        template.content,
        template.industry,
        template.useCase,
        ...(template.tags || [])
      ].join(' ').toLowerCase();
      
      return searchTerms.some(term => searchableText.includes(term));
    });
  };

  // Filter templates by industry, use case, and location
  const filteredTemplates = AUSTRALIAN_TEMPLATE_LIBRARY.filter(template => {
    const matchesIndustry = filters.industry === 'all' || template.industry === filters.industry;
    const matchesUseCase = filters.useCase === 'all' || template.useCase === filters.useCase;
    const matchesSearch = !searchQuery || searchTemplates(searchQuery, [template]).length > 0;
    
    return matchesIndustry && matchesUseCase && matchesSearch;
  });

  const handleUseTemplate = async (template: any) => {
    try {
      const newTemplate = await createTemplate({
        name: `${template.name} - Customized`,
        template_content: template.content,
        type: 'social',
        tags: template.tags,
        default_tone: template.tone as any,
        ai_prompt_template: `Create content similar to: ${template.name}. Industry: ${template.industry}. Use case: ${template.useCase}.`
      });

      if (newTemplate) {
        toast({
          title: "Template saved!",
          description: `"${template.name}" has been added to your templates for customization.`,
        });
        setCustomizedTemplates(prev => [...prev, newTemplate]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAICustomize = (template: any) => {
    setSelectedTemplate(template);
    setShowAIGenerator(true);
  };

  const TemplateCard = ({ template }: { template: any }) => (
    <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {template.name}
            </CardTitle>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {template.industry.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {template.useCase.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {template.tone}
              </Badge>
            </div>
          </div>
          <Star className="h-5 w-5 text-yellow-500" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
          {template.content.substring(0, 200)}...
        </p>
        
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 4).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{template.tags.length - 4}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={() => handleUseTemplate(template)}
            className="flex-1"
          >
            Use Template
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleAICustomize(template)}
            className="flex-1"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            AI Customize
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI-Searchable Template Library
          </h2>
          <p className="text-muted-foreground">
            Industry-tailored templates for Australian SMEs with AI-powered customization
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-yellow-50 text-green-800 border-green-200">
          <MapPin className="h-3 w-3 mr-1" />
          Australian Optimized
        </Badge>
      </div>

      {/* Enhanced Search & Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by keywords, hashtags, or describe your needs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowAIGenerator(true)}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate Custom
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {AUSTRALIAN_INDUSTRIES.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Use Case</label>
              <Select value={filters.useCase} onValueChange={(value) => setFilters(prev => ({ ...prev, useCase: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select use case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Use Cases</SelectItem>
                  {USE_CASES.map(useCase => (
                    <SelectItem key={useCase} value={useCase}>
                      {useCase.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Location Context</label>
              <Input
                placeholder="e.g., Melbourne, Sydney, Brisbane..."
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Templates ({filteredTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="customized" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            My Customized ({customizedTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No templates found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters, or create a custom template with AI
                    </p>
                  </div>
                  <Button onClick={() => setShowAIGenerator(true)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Custom Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template, index) => (
                <TemplateCard key={index} template={template} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="customized" className="space-y-6">
          {customizedTemplates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No customized templates yet</h3>
                    <p className="text-muted-foreground">
                      Start by using a template or creating a custom one with AI
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {customizedTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      {template.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.template_content.substring(0, 150)}...
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* AI Content Generator Dialog */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI Content Generator</h3>
              <Button variant="ghost" onClick={() => setShowAIGenerator(false)}>
                ×
              </Button>
            </div>
            <div className="p-6">
              <AIContentGenerator 
                onContentGenerated={(content, postId) => {
                  toast({
                    title: "Content generated!",
                    description: "Your AI-customized content is ready.",
                  });
                  setShowAIGenerator(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};