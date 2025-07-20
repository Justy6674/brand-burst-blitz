import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentTemplate, CONTENT_TEMPLATES, getTemplatesByIndustry, getTemplatesByType } from '@/data/contentTemplates';
import { FileText, Users, Mail, Megaphone, Package, Star } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: ContentTemplate | null;
  onTemplateSelect: (template: ContentTemplate) => void;
  onFilterChange?: (filter: { industry?: string; type?: string }) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
  onFilterChange
}) => {
  const [industryFilter, setIndustryFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'social_post': return <Users className="h-4 w-4" />;
      case 'blog_article': return <FileText className="h-4 w-4" />;
      case 'email_campaign': return <Mail className="h-4 w-4" />;
      case 'ad_copy': return <Megaphone className="h-4 w-4" />;
      case 'product_description': return <Package className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'social_post': return 'Social Media';
      case 'blog_article': return 'Blog Article';
      case 'email_campaign': return 'Email Campaign';
      case 'ad_copy': return 'Advertisement';
      case 'product_description': return 'Product Description';
      default: return type;
    }
  };

  const getFilteredTemplates = () => {
    let filtered = CONTENT_TEMPLATES;

    if (industryFilter !== 'all') {
      filtered = getTemplatesByIndustry(industryFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(template => template.type === typeFilter);
    }

    return filtered;
  };

  const handleIndustryChange = (industry: string) => {
    setIndustryFilter(industry);
    onFilterChange?.({ industry: industry === 'all' ? undefined : industry, type: typeFilter === 'all' ? undefined : typeFilter });
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    onFilterChange?.({ industry: industryFilter === 'all' ? undefined : industryFilter, type: type === 'all' ? undefined : type });
  };

  const uniqueIndustries = Array.from(
    new Set(CONTENT_TEMPLATES.flatMap(template => template.industry))
  ).sort();

  const uniqueTypes = Array.from(
    new Set(CONTENT_TEMPLATES.map(template => template.type))
  ).sort();

  const filteredTemplates = getFilteredTemplates();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Content Template</h3>
        <p className="text-muted-foreground">
          Select a template designed for Australian businesses in your industry
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Filter by Industry</label>
          <Select value={industryFilter} onValueChange={handleIndustryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {uniqueIndustries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry.charAt(0).toUpperCase() + industry.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Filter by Content Type</label>
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {getTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate?.id === template.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(template.type)}
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </div>
                {selectedTemplate?.id === template.id && (
                  <Star className="h-5 w-5 text-primary fill-primary" />
                )}
              </div>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Content Type Badge */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getTypeLabel(template.type)}
                </Badge>
              </div>

              {/* Industries */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Best for:
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.industry.slice(0, 3).map((industry) => (
                    <Badge key={industry} variant="outline" className="text-xs">
                      {industry.charAt(0).toUpperCase() + industry.slice(1)}
                    </Badge>
                  ))}
                  {template.industry.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.industry.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Example Output Preview */}
              {template.examples.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Example output:
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.examples[0].output.substring(0, 120)}...
                  </p>
                </div>
              )}

              {selectedTemplate?.id === template.id ? (
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Selected Template
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full hover:bg-primary hover:text-primary-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTemplateSelect(template);
                  }}
                >
                  Use This Template
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="font-semibold">No templates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to find relevant templates
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIndustryFilter('all');
                  setTypeFilter('all');
                  onFilterChange?.({});
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};