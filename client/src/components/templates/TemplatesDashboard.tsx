import React, { useState } from 'react';
import { Plus, Search, Filter, Globe, Lock, Copy, Edit, Trash2, FileText, MessageSquare, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useContentTemplates } from '@/hooks/useContentTemplates';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { EditTemplateDialog } from './EditTemplateDialog';
import type { Tables } from '@/integrations/supabase/types';

type ContentTemplate = Tables<'content_templates'>;

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'blog': return FileText;
    case 'social': return MessageSquare;
    case 'ad': return Megaphone;
    default: return FileText;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'blog': return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'social': return 'bg-green-500/10 text-green-700 border-green-200';
    case 'ad': return 'bg-purple-500/10 text-purple-700 border-purple-200';
    default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
};

export const TemplatesDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContentTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { toast } = useToast();
  const { 
    templates, 
    publicTemplates, 
    isLoading, 
    error, 
    deleteTemplate, 
    duplicateTemplate 
  } = useContentTemplates();

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.template_content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    return matchesSearch && matchesType;
  });

  const filteredPublicTemplates = publicTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.template_content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    const success = await deleteTemplate(id);
    if (success) {
      toast({
        title: 'Template deleted',
        description: 'The template has been successfully deleted.',
      });
    }
    setDeleteConfirm(null);
  };

  const handleDuplicate = async (id: string, name: string) => {
    const result = await duplicateTemplate(id);
    if (result) {
      toast({
        title: 'Template duplicated',
        description: `"${name}" has been copied to your templates.`,
      });
    }
  };

  const TemplateCard = ({ template, isPublic = false }: { template: ContentTemplate; isPublic?: boolean }) => {
    const TypeIcon = getTypeIcon(template.type);
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <TypeIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className={getTypeColor(template.type)}>
                    {template.type}
                  </Badge>
                  {template.is_public && (
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  )}
                  {!template.is_public && !isPublic && (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {template.template_content.substring(0, 150)}...
            </p>
            
            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-muted-foreground">
                {template.usage_count || 0} uses
              </div>
              
              <div className="flex space-x-1">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleDuplicate(template.id, template.name)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                
                {!isPublic && (
                  <>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setDeleteConfirm(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Templates</h2>
          <p className="text-muted-foreground">
            Create and manage reusable content templates
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Types</option>
            <option value="blog">Blog Posts</option>
            <option value="social">Social Media</option>
            <option value="ad">Advertisements</option>
          </select>
        </div>
      </div>

      {/* Templates Tabs */}
      <Tabs defaultValue="my-templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-templates">
            My Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="public-templates">
            Public Templates ({publicTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-templates" className="space-y-6">
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No templates found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Try adjusting your search criteria' : 'Create your first template to get started'}
                    </p>
                  </div>
                  {!searchQuery && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Template
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public-templates" className="space-y-6">
          {filteredPublicTemplates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Globe className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No public templates found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPublicTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} isPublic={true} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateTemplateDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />

      {editingTemplate && (
        <EditTemplateDialog 
          template={editingTemplate}
          open={!!editingTemplate} 
          onOpenChange={(open) => !open && setEditingTemplate(null)}
        />
      )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};