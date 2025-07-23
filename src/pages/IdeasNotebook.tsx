import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen,
  Calendar,
  Mic,
  Type,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Star,
  Clock,
  Share,
  Brain,
  TrendingUp,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Idea {
  id: string;
  title: string;
  original_text: string;
  ai_analysis: any;
  content_generated: any;
  source_type: string;
  tags: string[];
  priority: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function IdeasNotebook() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Error loading ideas:', error);
      toast({
        title: "Error",
        description: "Failed to load ideas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCalendar = async (idea: Idea) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: userData.user.id,
          title: `Idea: ${idea.title}`,
          description: `AI Analysis: ${idea.ai_analysis?.summary || 'No analysis available'}\n\nOriginal Idea: ${idea.original_text}`,
          start_datetime: new Date().toISOString(),
          end_datetime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
          event_type: 'idea',
          color: '#9333ea',
          idea_id: idea.id,
          content_tags: ['IDEA', ...idea.tags],
          metadata: {
            source: 'ideas_notebook',
            priority: idea.priority,
            status: idea.status
          }
        });

      if (error) throw error;

      toast({
        title: "📅 Added to Calendar",
        description: "Idea scheduled for review",
      });
    } catch (error) {
      console.error('Error adding to calendar:', error);
      toast({
        title: "Error",
        description: "Failed to add to calendar",
        variant: "destructive",
      });
    }
  };

  const updateIdeaStatus = async (ideaId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .update({ status: newStatus })
        .eq('id', ideaId);

      if (error) throw error;
      
      await loadIdeas();
      toast({
        title: "Status Updated",
        description: `Idea marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.original_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'captured': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'developing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'implemented': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 4) return <Star className="h-4 w-4 text-red-500" />;
    if (priority >= 3) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto animate-pulse text-primary mb-4" />
          <p>Loading your ideas notebook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Ideas Notebook</h1>
            <p className="text-muted-foreground">Your captured innovations with AI insights</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {ideas.length} Ideas
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search ideas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="captured">Captured</SelectItem>
              <SelectItem value="developing">Developing</SelectItem>
              <SelectItem value="implemented">Implemented</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Notebook Layout */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Ideas List - Notebook Style */}
        <div className="lg:col-span-3">
          <Card className="min-h-[600px]">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Ideas Notebook
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Notebook Lines Background */}
              <div className="relative">
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      to bottom,
                      transparent,
                      transparent 31px,
                      #e2e8f0 32px
                    )`
                  }}
                />
                
                {/* Three Column Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b bg-slate-50/50 text-sm font-medium text-slate-600">
                  <div className="col-span-2">Date</div>
                  <div className="col-span-6">Idea</div>
                  <div className="col-span-4">AI Analysis & Status</div>
                </div>

                {/* Ideas Rows */}
                <div className="relative z-10">
                  {filteredIdeas.length === 0 ? (
                    <div className="p-12 text-center">
                      <Lightbulb className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Ideas Found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Try adjusting your search or filters'
                          : 'Start capturing your brilliant ideas using the Quick Add button'}
                      </p>
                    </div>
                  ) : (
                    filteredIdeas.map((idea, index) => (
                      <div 
                        key={idea.id}
                        className={`grid grid-cols-12 gap-4 p-4 border-b hover:bg-slate-50/50 transition-colors cursor-pointer relative ${
                          selectedIdea?.id === idea.id ? 'bg-primary/5 border-primary/20' : ''
                        }`}
                        onClick={() => setSelectedIdea(idea)}
                        style={{ minHeight: '48px' }}
                      >
                        {/* Date Column */}
                        <div className="col-span-2 text-sm text-slate-600 flex flex-col">
                          <span className="font-medium">
                            {new Date(idea.created_at).toLocaleDateString('en-AU')}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(idea.created_at).toLocaleTimeString('en-AU', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>

                        {/* Idea Column */}
                        <div className="col-span-6">
                          <div className="flex items-start gap-2">
                            <div className="mt-1">
                              {idea.source_type === 'voice' ? (
                                <Mic className="h-4 w-4 text-green-600" />
                              ) : (
                                <Type className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-900 mb-1 line-clamp-1">
                                {idea.title}
                              </h4>
                              <p className="text-sm text-slate-600 line-clamp-2">
                                {idea.original_text}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {idea.tags.map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* AI Analysis & Status Column */}
                        <div className="col-span-4">
                          <div className="flex items-start justify-between h-full">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getPriorityIcon(idea.priority)}
                                <Badge className={getStatusColor(idea.status)}>
                                  {idea.status}
                                </Badge>
                              </div>
                              {idea.ai_analysis?.viability_score && (
                                <div className="text-xs text-slate-600 mb-1">
                                  <Brain className="h-3 w-3 inline mr-1" />
                                  {idea.ai_analysis.viability_score}% viable
                                </div>
                              )}
                              {idea.ai_analysis?.market_potential && (
                                <p className="text-xs text-slate-500 line-clamp-2">
                                  {idea.ai_analysis.market_potential}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCalendar(idea);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Calendar className="h-3 w-3" />
                              </Button>
                              <Select onValueChange={(value) => updateIdeaStatus(idea.id, value)}>
                                <SelectTrigger className="h-8 w-8 p-0 border-none bg-transparent">
                                  <CheckCircle2 className="h-3 w-3" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="captured">Captured</SelectItem>
                                  <SelectItem value="developing">Developing</SelectItem>
                                  <SelectItem value="implemented">Implemented</SelectItem>
                                  <SelectItem value="archived">Archive</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Selected Idea Details */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedIdea ? (
                <>
                  <div className="space-y-3">
                    <h4 className="font-medium">{selectedIdea.title}</h4>
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addToCalendar(selectedIdea)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Add to Calendar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigator.clipboard.writeText(selectedIdea.original_text)}
                      >
                        <Type className="h-4 w-4 mr-2" />
                        Copy Text
                      </Button>
                      {selectedIdea.content_generated?.facebook_post && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => navigator.clipboard.writeText(selectedIdea.content_generated.facebook_post)}
                        >
                          <Share className="h-4 w-4 mr-2" />
                          Copy Social Content
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Status</p>
                    <Select 
                      value={selectedIdea.status} 
                      onValueChange={(value) => updateIdeaStatus(selectedIdea.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="captured">📝 Captured</SelectItem>
                        <SelectItem value="developing">🔄 Developing</SelectItem>
                        <SelectItem value="implemented">✅ Implemented</SelectItem>
                        <SelectItem value="archived">📦 Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select an idea to see quick actions
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}