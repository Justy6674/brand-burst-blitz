import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Share2, Star, Building2, Plus, Search, Filter, Globe } from "lucide-react";
import { useBusinessProfileContext } from '@/contexts/BusinessProfileContext';
import { useContentTemplates } from '@/hooks/useContentTemplates';
import { useToast } from '@/hooks/use-toast';

export const CrossBusinessTemplates = () => {
  const { allProfiles, activeProfile } = useBusinessProfileContext();
  const { templates, isLoading, createTemplate, updateTemplate } = useContentTemplates();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('');
  const [selectedBusiness, setSelectedBusiness] = React.useState('');
  const [showGlobalOnly, setShowGlobalOnly] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // Template creation form state
  const [newTemplate, setNewTemplate] = React.useState({
    name: '',
    type: 'social' as const,
    template_content: '',
    ai_prompt_template: '',
    tags: [] as string[],
    is_global: false,
    source_business_id: '',
  });

  // Filter templates based on search, type, and business
  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.template_content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || template.type === selectedType;
    const matchesBusiness = !selectedBusiness || template.business_profile_id === selectedBusiness;
    const matchesGlobal = !showGlobalOnly || (template.business_profile_id === null && template.is_public);
    
    return matchesSearch && matchesType && matchesBusiness && matchesGlobal;
  }) || [];

  // Get templates that can be shared across businesses (global templates)
  const globalTemplates = templates?.filter(template => 
    template.business_profile_id === null && template.is_public
  ) || [];

  // Get most popular templates across all businesses
  const popularTemplates = templates?.filter(template => 
    template.usage_count && template.usage_count > 0
  ).sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0)).slice(0, 5) || [];

  const handleCreateGlobalTemplate = async () => {
    try {
      await createTemplate({
        ...newTemplate,
        business_profile_id: newTemplate.is_global ? null : activeProfile?.id || null,
        is_public: newTemplate.is_global,
        tags: newTemplate.tags.filter(tag => tag.trim() !== ''),
      });

      toast({
        title: "Template Created",
        description: newTemplate.is_global 
          ? "Global template created and available to all businesses" 
          : "Template created for current business",
      });

      setCreateDialogOpen(false);
      setNewTemplate({
        name: '',
        type: 'social',
        template_content: '',
        ai_prompt_template: '',
        tags: [],
        is_global: false,
        source_business_id: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    }
  };

  const handleCloneTemplate = async (template: any) => {
    try {
      await createTemplate({
        name: `${template.name} (Copy)`,
        type: template.type,
        template_content: template.template_content,
        ai_prompt_template: template.ai_prompt_template,
        tags: template.tags || [],
        business_profile_id: activeProfile?.id || null,
        is_public: false,
      });

      toast({
        title: "Template Cloned",
        description: "Template copied to your current business",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clone template",
        variant: "destructive",
      });
    }
  };

  const handleMakeGlobal = async (template: any) => {
    try {
      await updateTemplate(template.id, {
        business_profile_id: null,
        is_public: true,
      });

      toast({
        title: "Template Made Global",
        description: "Template is now available to all businesses",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to make template global",
        variant: "destructive",
      });
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !newTemplate.tags.includes(tag.trim())) {
      setNewTemplate(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewTemplate(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getBusinessName = (businessId: string | null) => {
    if (!businessId) return 'Global';
    return allProfiles?.find(p => p.id === businessId)?.business_name || 'Unknown Business';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Cross-Business Templates</h3>
          <p className="text-muted-foreground">Share and manage templates across all your businesses</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Global Templates Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Global Templates</p>
                <p className="text-2xl font-bold">{globalTemplates.length}</p>
              </div>
              <Globe className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{templates?.length || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Most Used</p>
                <p className="text-2xl font-bold">{popularTemplates[0]?.usage_count || 0}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="ad">Ad</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All businesses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All businesses</SelectItem>
                <SelectItem value="null">Global templates</SelectItem>
                {allProfiles?.map(business => (
                  <SelectItem key={business.id} value={business.id}>
                    {business.business_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Switch 
                id="global-only" 
                checked={showGlobalOnly}
                onCheckedChange={setShowGlobalOnly}
              />
              <Label htmlFor="global-only">Global only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Templates */}
      {popularTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Most Popular Templates
            </CardTitle>
            <CardDescription>Templates with the highest usage across all businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {popularTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {template.usage_count} uses
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {template.template_content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {template.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getBusinessName(template.business_profile_id)}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCloneTemplate(template)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Templates */}
      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>
            {filteredTemplates.length} of {templates?.length || 0} templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{template.name}</h4>
                      {template.business_profile_id === null && template.is_public && (
                        <Badge variant="default" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Global
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {template.template_content}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {template.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getBusinessName(template.business_profile_id)}
                      </Badge>
                      {template.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.usage_count && template.usage_count > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {template.usage_count} uses
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCloneTemplate(template)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Clone
                    </Button>
                    {template.business_profile_id === activeProfile?.id && !template.is_public && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMakeGlobal(template)}
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Template Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a template for your current business or make it global for all businesses
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newTemplate.type} onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="ad">Ad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="content">Template Content</Label>
              <Textarea
                id="content"
                value={newTemplate.template_content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, template_content: e.target.value }))}
                placeholder="Enter your template content..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="prompt">AI Prompt Template (Optional)</Label>
              <Textarea
                id="prompt"
                value={newTemplate.ai_prompt_template}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, ai_prompt_template: e.target.value }))}
                placeholder="Enter AI prompt template..."
                rows={3}
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newTemplate.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tag and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="is-global" 
                checked={newTemplate.is_global}
                onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, is_global: checked }))}
              />
              <Label htmlFor="is-global">Make this template available to all businesses</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGlobalTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};