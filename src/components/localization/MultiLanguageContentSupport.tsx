import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Languages, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  Plus, 
  Edit, 
  Eye,
  Download,
  Upload,
  RefreshCw,
  Users,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TranslationProject {
  id: string;
  name: string;
  description: string;
  sourceLanguage: string;
  targetLanguages: string[];
  status: 'draft' | 'translating' | 'review' | 'completed';
  contentType: 'post' | 'campaign' | 'website' | 'email';
  totalWords: number;
  completedWords: number;
  translatedContent: Record<string, any>;
  originalContent: any;
  createdAt: Date;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
}

interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  isEnabled: boolean;
  autoTranslate: boolean;
  qualityScore: number;
}

export const MultiLanguageContentSupport: React.FC = () => {
  const [projects, setProjects] = useState<TranslationProject[]>([]);
  const [languages, setLanguages] = useState<LanguageConfig[]>([]);
  const [selectedProject, setSelectedProject] = useState<TranslationProject | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    sourceLanguage: 'en',
    targetLanguages: [] as string[],
    contentType: 'post' as const,
    content: {
      title: '',
      body: '',
      tags: '',
      meta: ''
    },
    priority: 'medium' as const
  });

  useEffect(() => {
    loadProjects();
    loadLanguageConfigs();
  }, []);

  const loadProjects = async () => {
    try {
      // Generate mock translation projects
      const mockProjects: TranslationProject[] = [
        {
          id: '1',
          name: 'Summer Campaign 2024',
          description: 'Social media campaign for summer product launch',
          sourceLanguage: 'en',
          targetLanguages: ['es', 'fr', 'de', 'it'],
          status: 'completed',
          contentType: 'campaign',
          totalWords: 450,
          completedWords: 450,
          originalContent: {
            title: 'Transform Your Summer with Our Latest Collection',
            body: 'Discover the perfect blend of style and comfort...',
            cta: 'Shop Now'
          },
          translatedContent: {
            es: {
              title: 'Transforma tu Verano con Nuestra Última Colección',
              body: 'Descubre la combinación perfecta de estilo y comodidad...',
              cta: 'Comprar Ahora'
            },
            fr: {
              title: 'Transformez Votre Été avec Notre Dernière Collection',
              body: 'Découvrez le mélange parfait de style et de confort...',
              cta: 'Acheter Maintenant'
            }
          },
          createdAt: new Date('2024-01-15'),
          priority: 'high'
        },
        {
          id: '2',
          name: 'Product Feature Announcement',
          description: 'Announcement post for new AI features',
          sourceLanguage: 'en',
          targetLanguages: ['ja', 'ko', 'zh'],
          status: 'translating',
          contentType: 'post',
          totalWords: 180,
          completedWords: 120,
          originalContent: {
            title: 'Introducing AI-Powered Content Generation',
            body: 'Our latest AI features will revolutionize how you create content...'
          },
          translatedContent: {
            ja: {
              title: 'AI駆動コンテンツ生成機能のご紹介',
              body: '最新のAI機能により、コンテンツ作成が革命的に変わります...'
            }
          },
          createdAt: new Date('2024-01-20'),
          priority: 'medium'
        },
        {
          id: '3',
          name: 'Customer Newsletter',
          description: 'Monthly newsletter with product updates',
          sourceLanguage: 'en',
          targetLanguages: ['es', 'pt'],
          status: 'review',
          contentType: 'email',
          totalWords: 320,
          completedWords: 320,
          originalContent: {
            subject: 'Your Monthly Update from JBSAAS',
            body: 'This month we have exciting updates to share...'
          },
          translatedContent: {
            es: {
              subject: 'Tu Actualización Mensual de JBSAAS',
              body: 'Este mes tenemos actualizaciones emocionantes que compartir...'
            },
            pt: {
              subject: 'Sua Atualização Mensal do JBSAAS',
              body: 'Este mês temos atualizações empolgantes para compartilhar...'
            }
          },
          createdAt: new Date('2024-01-22'),
          priority: 'low'
        }
      ];

      setProjects(mockProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error Loading Projects",
        description: "Failed to load translation projects",
        variant: "destructive"
      });
    }
  };

  const loadLanguageConfigs = async () => {
    try {
      const mockLanguages: LanguageConfig[] = [
        { code: 'en', name: 'English', nativeName: 'English', region: 'Global', isEnabled: true, autoTranslate: false, qualityScore: 100 },
        { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'Spain/LATAM', isEnabled: true, autoTranslate: true, qualityScore: 95 },
        { code: 'fr', name: 'French', nativeName: 'Français', region: 'France', isEnabled: true, autoTranslate: true, qualityScore: 92 },
        { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'Germany', isEnabled: true, autoTranslate: true, qualityScore: 90 },
        { code: 'it', name: 'Italian', nativeName: 'Italiano', region: 'Italy', isEnabled: true, autoTranslate: true, qualityScore: 88 },
        { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: 'Brazil/Portugal', isEnabled: true, autoTranslate: true, qualityScore: 87 },
        { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'Japan', isEnabled: true, autoTranslate: true, qualityScore: 85 },
        { code: 'ko', name: 'Korean', nativeName: '한국어', region: 'South Korea', isEnabled: true, autoTranslate: true, qualityScore: 83 },
        { code: 'zh', name: 'Chinese', nativeName: '中文', region: 'China', isEnabled: true, autoTranslate: true, qualityScore: 82 },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'Middle East', isEnabled: false, autoTranslate: true, qualityScore: 78 }
      ];

      setLanguages(mockLanguages);
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const createTranslationProject = async () => {
    try {
      setIsTranslating(true);

      const project: TranslationProject = {
        id: Date.now().toString(),
        name: newProject.name,
        description: newProject.description,
        sourceLanguage: newProject.sourceLanguage,
        targetLanguages: newProject.targetLanguages,
        status: 'draft',
        contentType: newProject.contentType,
        totalWords: newProject.content.body.split(' ').length,
        completedWords: 0,
        originalContent: newProject.content,
        translatedContent: {},
        createdAt: new Date(),
        priority: newProject.priority
      };

      // Simulate auto-translation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock translated content
      const mockTranslations: Record<string, any> = {};
      newProject.targetLanguages.forEach(langCode => {
        const lang = languages.find(l => l.code === langCode);
        if (lang) {
          mockTranslations[langCode] = {
            title: `[${lang.nativeName}] ${newProject.content.title}`,
            body: `[${lang.nativeName}] ${newProject.content.body}`,
            tags: newProject.content.tags
          };
        }
      });

      project.translatedContent = mockTranslations;
      project.completedWords = project.totalWords;
      project.status = 'review';

      setProjects(prev => [project, ...prev]);
      setIsCreateDialogOpen(false);
      resetNewProject();

      toast({
        title: "Translation Project Created",
        description: "Auto-translation completed. Ready for review."
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create translation project",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const resetNewProject = () => {
    setNewProject({
      name: '',
      description: '',
      sourceLanguage: 'en',
      targetLanguages: [],
      contentType: 'post',
      content: {
        title: '',
        body: '',
        tags: '',
        meta: ''
      },
      priority: 'medium'
    });
  };

  const approveTranslation = async (projectId: string) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { ...project, status: 'completed' as const } 
          : project
      )
    );

    toast({
      title: "Translation Approved",
      description: "Content is ready for publishing"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'translating': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'review': return <Eye className="w-4 h-4" />;
      case 'translating': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getLanguageFlag = (code: string) => {
    const flags: Record<string, string> = {
      'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹',
      'pt': '🇧🇷', 'ja': '🇯🇵', 'ko': '🇰🇷', 'zh': '🇨🇳', 'ar': '🇸🇦'
    };
    return flags[code] || '🌐';
  };

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status !== 'completed').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalLanguages = [...new Set(projects.flatMap(p => p.targetLanguages))].length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Multi-Language Content Support</h1>
          <p className="text-muted-foreground">
            Translate and localize your content for global audiences with AI-powered translations
          </p>
        </div>
        
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Translation Project
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{totalProjects}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-yellow-600">{activeProjects}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedProjects}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Languages</p>
                <p className="text-2xl font-bold text-purple-600">{totalLanguages}</p>
              </div>
              <Languages className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Translation Projects</TabsTrigger>
          <TabsTrigger value="languages">Language Settings</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-6">
            {projects.map(project => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        {project.name}
                        <Badge className={`ml-2 ${getPriorityColor(project.priority)}`} variant="outline">
                          {project.priority}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm">
                          <span className="font-medium">Source:</span> {getLanguageFlag(project.sourceLanguage)} {languages.find(l => l.code === project.sourceLanguage)?.name}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="flex gap-1">
                          {project.targetLanguages.map(langCode => (
                            <span key={langCode} className="text-sm">
                              {getLanguageFlag(langCode)}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({project.targetLanguages.length} languages)
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {project.completedWords}/{project.totalWords} words
                      </div>
                    </div>
                    
                    <Progress value={(project.completedWords / project.totalWords) * 100} />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="outline">{project.contentType}</Badge>
                        <Badge variant="outline">{project.createdAt.toLocaleDateString()}</Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        {project.status === 'review' && (
                          <Button 
                            size="sm" 
                            onClick={() => approveTranslation(project.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedProject(project)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="languages" className="space-y-6">
          <div className="grid gap-4">
            {languages.map(lang => (
              <Card key={lang.code}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getLanguageFlag(lang.code)}</span>
                      <div>
                        <h3 className="font-medium">{lang.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {lang.nativeName} • {lang.region}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Quality Score</div>
                        <div className={`text-sm ${lang.qualityScore >= 90 ? 'text-green-600' : lang.qualityScore >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {lang.qualityScore}%
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Badge variant={lang.isEnabled ? 'default' : 'secondary'}>
                          {lang.isEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Badge variant={lang.autoTranslate ? 'outline' : 'secondary'}>
                          {lang.autoTranslate ? 'Auto-translate' : 'Manual'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Translation Quality</CardTitle>
                <CardDescription>
                  Quality metrics across all languages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Quality Score</span>
                    <span className="font-medium">87.2%</span>
                  </div>
                  <Progress value={87.2} />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Excellent (90%+)</span>
                      <span>4 languages</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-600">Good (80-89%)</span>
                      <span>5 languages</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Needs Improvement (&lt;80%)</span>
                      <span>1 language</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Practices</CardTitle>
                <CardDescription>
                  Tips for better translations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Use simple, clear language in source content</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Avoid idioms and cultural references</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Review translations before publishing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Consider cultural context and local preferences</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Quality Reminder:</strong> While AI translations are fast and convenient, 
              consider human review for important content, especially for languages with lower quality scores.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Translation Project</DialogTitle>
            <DialogDescription>
              Set up a new project to translate your content into multiple languages
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Project Name</label>
              <Input
                placeholder="e.g., Summer Campaign 2024"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Describe your translation project"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Source Language</label>
                <Select 
                  value={newProject.sourceLanguage} 
                  onValueChange={(value) => setNewProject(prev => ({ ...prev, sourceLanguage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.filter(l => l.isEnabled).map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {getLanguageFlag(lang.code)} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Content Type</label>
                <Select 
                  value={newProject.contentType} 
                  onValueChange={(value: any) => setNewProject(prev => ({ ...prev, contentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Social Media Post</SelectItem>
                    <SelectItem value="campaign">Marketing Campaign</SelectItem>
                    <SelectItem value="email">Email Newsletter</SelectItem>
                    <SelectItem value="website">Website Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Content Title</label>
              <Input
                placeholder="Enter the title of your content"
                value={newProject.content.title}
                onChange={(e) => setNewProject(prev => ({ 
                  ...prev, 
                  content: { ...prev.content, title: e.target.value }
                }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Content Body</label>
              <Textarea
                placeholder="Enter your content that needs to be translated"
                value={newProject.content.body}
                onChange={(e) => setNewProject(prev => ({ 
                  ...prev, 
                  content: { ...prev.content, body: e.target.value }
                }))}
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createTranslationProject} disabled={isTranslating}>
                {isTranslating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Create & Translate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};