import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  Eye, 
  Search,
  Filter,
  ArrowRight,
  FileText,
  Shield,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  published: boolean;
  created_at: string;
  seo_title?: string;
  seo_description?: string;
  featured_image?: string;
  tags?: string[];
  metadata?: {
    word_count?: number;
    read_time?: number;
    ahpra_compliant?: boolean;
  };
}

export function PublicBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  useEffect(() => {
    loadPublicPosts();
  }, []);

  const loadPublicPosts = async () => {
    try {
      setIsLoading(true);
      
      // Load only published blog posts (no authentication required)
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error loading posts:', postsError);
        // Don't throw error - just show empty state
        setPosts([]);
        return;
      }

      const blogPosts: BlogPost[] = (postsData || []).map(post => ({
        id: post.id,
        title: post.title,
        content: post.content || '',
        excerpt: post.excerpt || post.content?.substring(0, 200) + '...' || '',
        published: post.published || false,
        created_at: post.created_at,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        featured_image: post.featured_image,
        tags: post.tags || [],
        metadata: {
          word_count: post.content?.split(' ').length || 0,
          read_time: Math.ceil((post.content?.split(' ').length || 0) / 200),
          ahpra_compliant: true
        }
      }));

      setPosts(blogPosts);

    } catch (error) {
      console.error('Error loading blog data:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || post.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags || [])));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading blog posts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Healthcare Blog
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              AHPRA-compliant healthcare content, expert insights, and professional guidance
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>AHPRA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Professional Content</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>{posts.length} Articles</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedTag === '' ? 'default' : 'outline'}
              onClick={() => setSelectedTag('')}
              size="sm"
            >
              All Topics
            </Button>
            {allTags.slice(0, 3).map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                onClick={() => setSelectedTag(tag)}
                size="sm"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts */}
        {filteredPosts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                {post.featured_image && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img 
                      src={post.featured_image} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{post.metadata?.read_time || 3} min read</span>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                  <p className="text-muted-foreground line-clamp-3 text-sm">
                    {post.excerpt}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {post.tags?.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">Compliant</span>
                      </div>
                    </div>
                    <Link to={`/blog-post/${post.id}`}>
                      <Button variant="ghost" size="sm" className="group">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                {searchTerm || selectedTag ? 'No matching articles found' : 'No blog posts available'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedTag 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Check back soon for professional healthcare content and insights.'
                }
              </p>
              {(searchTerm || selectedTag) && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedTag('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Want to create your own AHPRA-compliant blog?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of healthcare professionals who trust our platform to create 
                compliant, professional content that engages patients and builds trust.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="min-w-[200px]">
                    Start Creating Content
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" size="lg" className="min-w-[200px]">
                    Learn More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}