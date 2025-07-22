import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Star, 
  Copy, 
  Edit, 
  Trash2, 
  Share2, 
  Eye, 
  EyeOff, 
  GitBranch, 
  Clock, 
  TrendingUp,
  Filter,
  MoreVertical,
  History,
  Globe,
  Lock
} from "lucide-react";
import { usePromptLibrary } from '@/hooks/usePromptLibrary';
import { AdminGuard, PermissionGuard } from '@/components/auth/PermissionGuards';
import { format } from 'date-fns';

export const PromptLibrary = () => {
  const {
    prompts,
    isLoading,
    createPrompt,
    updatePrompt,
    deletePrompt,
    createVersion,
    togglePublicStatus,
    incrementUsage,
    getPromptVersions,
    getPopularPrompts,
    searchPrompts,
  } = usePromptLibrary();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('');
  const [selectedPlatform, setSelectedPlatform] = React.useState('');
  const [showPublicOnly, setShowPublicOnly] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editingPrompt, setEditingPrompt] = React.useState<any>(null);
  const [versionDialogOpen, setVersionDialogOpen] = React.useState(false);
  const [selectedPromptForVersion, setSelectedPromptForVersion] = React.useState<any>(null);

  // Form state for creating/editing prompts
  const [formData, setFormData] = React.useState({
    name: '',
    type: 'content',
    platform: '',
    category: '',
    prompt_text: '',
    variables: [] as string[],
    is_public: false,
  });

  const handleCreatePrompt = async () => {
    try {
      await createPrompt({
        ...formData,
        variables: formData.variables.length > 0 ? formData.variables : null,
      });
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create prompt:', error);
    }
  };

  const handleUpdatePrompt = async () => {
    if (!editingPrompt) return;
    
    try {
      await updatePrompt(editingPrompt.id, {
        name: formData.name,
        prompt_text: formData.prompt_text,
        category: formData.category || null,
        platform: formData.platform || null,
        variables: formData.variables.length > 0 ? formData.variables : null,
        is_public: formData.is_public,
      });
      setEditingPrompt(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update prompt:', error);
    }
  };

  const handleCreateVersion = async () => {
    if (!selectedPromptForVersion) return;
    
    try {
      await createVersion(selectedPromptForVersion.id, {
        prompt_text: formData.prompt_text,
        variables: formData.variables.length > 0 ? formData.variables : null,
      });
      setVersionDialogOpen(false);
      setSelectedPromptForVersion(null);
      resetForm();
    } catch (error) {
      console.error('Failed to create version:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'content',
      platform: '',
      category: '',
      prompt_text: '',
      variables: [],
      is_public: false,
    });
  };

  const startEdit = (prompt: any) => {
    setEditingPrompt(prompt);
    setFormData({
      name: prompt.name,
      type: prompt.type,
      platform: prompt.platform || '',
      category: prompt.category || '',
      prompt_text: prompt.prompt_text,
      variables: prompt.variables || [],
      is_public: prompt.is_public || false,
    });
  };

  const startVersionCreation = (prompt: any) => {
    setSelectedPromptForVersion(prompt);
    setFormData({
      name: prompt.name,
      type: prompt.type,
      platform: prompt.platform || '',
      category: prompt.category || '',
      prompt_text: prompt.prompt_text,
      variables: prompt.variables || [],
      is_public: prompt.is_public || false,
    });
    setVersionDialogOpen(true);
  };

  // Filter prompts based on search and filters
  const filteredPrompts = React.useMemo(() => {
    if (!prompts) return [];
    
    let filtered = searchTerm ? searchPrompts(searchTerm) : prompts;
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (selectedType) {
      filtered = filtered.filter(p => p.type === selectedType);
    }
    
    if (selectedPlatform) {
      filtered = filtered.filter(p => p.platform === selectedPlatform);
    }
    
    if (showPublicOnly) {
      filtered = filtered.filter(p => p.is_public);
    }
    
    return filtered;
  }, [prompts, searchTerm, selectedCategory, selectedType, selectedPlatform, showPublicOnly, searchPrompts]);

  const popularPrompts = getPopularPrompts();
  const categories = [...new Set(prompts?.map(p => p.category).filter(Boolean) || [])];
  const platforms = [...new Set(prompts?.map(p => p.platform).filter(Boolean) || [])];

  const addVariable = (variable: string) => {
    if (variable.trim() && !formData.variables.includes(variable.trim())) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, variable.trim()]
      }));
    }
  };

  const removeVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
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
          <h3 className="text-2xl font-bold">Prompt Library</h3>
          <p className="text-muted-foreground">Manage and version your AI prompts</p>
        </div>
        <PermissionGuard action="create" resource="prompts">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Prompt</DialogTitle>
                <DialogDescription>
                  Create a new prompt template for AI content generation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Prompt Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter prompt name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content">Content Generation</SelectItem>
                        <SelectItem value="analysis">Content Analysis</SelectItem>
                        <SelectItem value="optimization">SEO Optimization</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="email">Email Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="platform">Platform (Optional)</Label>
                    <Input
                      id="platform"
                      value={formData.platform}
                      onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                      placeholder="e.g., Facebook, LinkedIn"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category (Optional)</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Marketing, Education"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="prompt">Prompt Text</Label>
                  <Textarea
                    id="prompt"
                    value={formData.prompt_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, prompt_text: e.target.value }))}
                    placeholder="Enter your prompt template here..."
                    rows={6}
                  />
                </div>

                <div>
                  <Label>Variables (Optional)</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.variables.map(variable => (
                      <Badge key={variable} variant="secondary" className="cursor-pointer" onClick={() => removeVariable(variable)}>
                        {variable} ×
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add variable and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addVariable(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is-public" 
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                  />
                  <Label htmlFor="is-public">Make this prompt public</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePrompt}>
                  Create Prompt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      {/* Popular Prompts */}
      {popularPrompts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Prompts
            </CardTitle>
            <CardDescription>Most used prompts in the community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {popularPrompts.slice(0, 6).map((prompt) => (
                <div key={prompt.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{prompt.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {prompt.usage_count} uses
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {prompt.prompt_text}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {prompt.type}
                      </Badge>
                      {prompt.platform && (
                        <Badge variant="outline" className="text-xs">
                          {prompt.platform}
                        </Badge>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => incrementUsage(prompt.id)}
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Prompts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts..."
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
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
                <SelectItem value="optimization">Optimization</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>

            {categories.length > 0 && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category!}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center space-x-2">
              <Switch 
                id="public-only" 
                checked={showPublicOnly}
                onCheckedChange={setShowPublicOnly}
              />
              <Label htmlFor="public-only">Public only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Prompts</CardTitle>
          <CardDescription>
            {filteredPrompts.length} of {prompts?.length || 0} prompts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPrompts.map((prompt) => {
              const versions = getPromptVersions(prompt.id);
              return (
                <div key={prompt.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{prompt.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          v{prompt.version}
                        </Badge>
                        {prompt.is_public ? (
                          <Globe className="h-3 w-3 text-green-600" />
                        ) : (
                          <Lock className="h-3 w-3 text-gray-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {prompt.prompt_text}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {prompt.type}
                        </Badge>
                        {prompt.platform && (
                          <Badge variant="outline" className="text-xs">
                            {prompt.platform}
                          </Badge>
                        )}
                        {prompt.category && (
                          <Badge variant="outline" className="text-xs">
                            {prompt.category}
                          </Badge>
                        )}
                        {prompt.usage_count && prompt.usage_count > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {prompt.usage_count} uses
                          </Badge>
                        )}
                        {versions.length > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {versions.length} versions
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => incrementUsage(prompt.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Use Prompt
                        </DropdownMenuItem>
                        <PermissionGuard action="update" resource="prompts">
                          <DropdownMenuItem onClick={() => startEdit(prompt)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => startVersionCreation(prompt)}>
                            <GitBranch className="h-4 w-4 mr-2" />
                            New Version
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePublicStatus(prompt.id)}>
                            {prompt.is_public ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Make Private
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Make Public
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deletePrompt(prompt.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </PermissionGuard>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {prompt.created_at && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(prompt.created_at), 'MMM dd, yyyy')}
                      </span>
                      {versions.length > 1 && (
                        <span className="flex items-center gap-1">
                          <History className="h-3 w-3" />
                          {versions.length} versions
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>
              Update your prompt template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Prompt Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-prompt">Prompt Text</Label>
              <Textarea
                id="edit-prompt"
                value={formData.prompt_text}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt_text: e.target.value }))}
                rows={6}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-public" 
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
              />
              <Label htmlFor="edit-public">Make this prompt public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPrompt(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePrompt}>
              Update Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version Dialog */}
      <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Create a new version of "{selectedPromptForVersion?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="version-prompt">Updated Prompt Text</Label>
              <Textarea
                id="version-prompt"
                value={formData.prompt_text}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt_text: e.target.value }))}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVersionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateVersion}>
              Create Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};