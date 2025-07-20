import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, Calendar, Search, Star, Trash2, Clock, Zap, FileText, Users, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export default function Diary() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);

  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 'neutral'
  });

  const [showNewEntry, setShowNewEntry] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchScheduledPosts();
  }, [user]);

  const fetchPosts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchScheduledPosts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .not('scheduled_at', 'is', null)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      setScheduledPosts(data || []);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = () => {
    if (newEntry.title && newEntry.content) {
      const entry = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
        tags: [],
        type: 'diary'
      };
      setEntries([entry, ...entries]);
      setNewEntry({ title: '', content: '', mood: 'neutral' });
      setShowNewEntry(false);
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'creative': return 'bg-purple-100 text-purple-800';
      case 'productive': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const allContent = [
    ...entries.map(entry => ({ ...entry, type: 'diary' })),
    ...posts.map(post => ({ 
      ...post, 
      type: 'post',
      date: post.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
    })),
    ...scheduledPosts.map(post => ({ 
      ...post, 
      type: 'scheduled',
      date: post.scheduled_at?.split('T')[0] || new Date().toISOString().split('T')[0]
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
            Content Hub
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Your unified hub for content planning, posts, and business insights
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/create">
            <Button size="sm" variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              Create Content
            </Button>
          </Link>
          <Button 
            onClick={() => setShowNewEntry(!showNewEntry)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{scheduledPosts.length}</p>
              </div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Diary Entries</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{allContent.filter(item => 
                  new Date(item.date).getMonth() === new Date().getMonth()
                ).length}</p>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Entry Form */}
      {showNewEntry && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Write New Entry</CardTitle>
            <CardDescription>What's on your mind today?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Entry title..."
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
            />
            <Textarea
              placeholder="Write your thoughts here..."
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              className="min-h-32"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <select
                  value={newEntry.mood}
                  onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="positive">😊 Positive</option>
                  <option value="neutral">😐 Neutral</option>
                  <option value="creative">🎨 Creative</option>
                  <option value="productive">⚡ Productive</option>
                  <option value="negative">😔 Challenging</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowNewEntry(false)} size="sm">
                  Cancel
                </Button>
                <Button onClick={handleAddEntry} size="sm">
                  Save Entry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="posts">Published</TabsTrigger>
          <TabsTrigger value="diary">Diary</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search all content..."
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {allContent.map((item, index) => (
              <Card key={`${item.type}-${item.id || index}`} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {item.type === 'diary' && <BookOpen className="h-4 w-4" />}
                        {item.type === 'post' && <FileText className="h-4 w-4" />}
                        {item.type === 'scheduled' && <Clock className="h-4 w-4" />}
                        {item.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {item.type === 'scheduled' ? formatDate(item.scheduled_at) : item.date}
                        </span>
                        <Badge 
                          className={
                            item.type === 'diary' ? getMoodColor(item.mood || 'neutral') :
                            item.type === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          } 
                          variant="secondary"
                        >
                          {item.type === 'diary' ? item.mood || 'neutral' : 
                           item.type === 'scheduled' ? 'scheduled' : 'published'}
                        </Badge>
                        {item.target_platforms && (
                          <Badge variant="outline" className="text-xs">
                            {item.target_platforms.length} platforms
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Star className="h-4 w-4" />
                      </Button>
                      {item.type !== 'diary' && (
                        <Link to={`/dashboard/posts`}>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {item.content?.substring(0, 200)}
                    {item.content?.length > 200 && '...'}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="grid gap-4">
            {scheduledPosts.map((post) => (
              <Card key={post.id} className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      {post.title}
                    </CardTitle>
                    <Badge className="bg-blue-100 text-blue-800">
                      {formatDate(post.scheduled_at)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {post.content?.substring(0, 150)}...
                  </p>
                  {post.target_platforms && (
                    <div className="flex flex-wrap gap-1">
                      {post.target_platforms.map((platform, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {scheduledPosts.length === 0 && (
              <Card className="text-center py-8">
                <CardContent>
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No scheduled posts</p>
                  <Link to="/dashboard/create">
                    <Button className="mt-2" size="sm">Schedule Content</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <div className="grid gap-4">
            {posts.filter(post => post.status === 'published').map((post) => (
              <Card key={post.id} className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                    <Badge className="bg-green-100 text-green-800">Published</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {post.content?.substring(0, 150)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="diary" className="space-y-4">
          <div className="grid gap-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{entry.date}</span>
                        <Badge className={getMoodColor(entry.mood)} variant="secondary">
                          {entry.mood}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {entry.content}
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {entry.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {allContent.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Welcome to your Command Center</h3>
            <p className="text-muted-foreground mb-4">
              Start creating content and documenting your business journey
            </p>
            <div className="flex gap-2 justify-center">
              <Link to="/dashboard/create">
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setShowNewEntry(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Write Diary Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}