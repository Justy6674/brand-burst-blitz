import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, ArrowRight, Search, Filter, Star, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import PublicHeader from '@/components/layout/PublicHeader';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  tags: string[];
  author: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  user_id?: string;
  business_profile_id?: string;
}

interface BusinessProfile {
  id: string;
  business_name: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
}

const EmbeddedBlogPage = () => {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get parameters for embedded blog display
  const userId = searchParams.get('user');
  const businessId = searchParams.get('business');
  const embedStyle = searchParams.get('style') || 'default';
  const maxPosts = parseInt(searchParams.get('max') || '10');
  const showHeader = searchParams.get('header') !== 'false';

  const categories = ['All', 'Healthcare', 'Patient Education', 'Practice Management', 'AHPRA Compliance', 'Industry Updates'];

  useEffect(() => {
    fetchEmbeddedContent();
  }, [userId, businessId]);

  const fetchEmbeddedContent = async () => {
    try {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          business_profiles(
            id,
            business_name,
            logo_url,
            website_url,
            description
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      // Filter by user or business if specified
      if (userId) {
        query = (query as any).eq('user_id', userId);
      } else if (businessId) {
        query = (query as any).eq('business_profile_id', businessId);
      }

      const { data, error } = await query.limit(maxPosts);

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      const allPosts = (data as any[]) || [];
      setPosts(allPosts);
      setFeaturedPosts(allPosts.filter(post => post.featured).slice(0, 3));

      // Get business profile info if available
      if (allPosts.length > 0 && (allPosts[0] as any).business_profiles) {
        setBusinessProfile((allPosts[0] as any).business_profiles);
      }
    } catch (error) {
      console.error('Error fetching embedded posts:', error);
      // Fallback to demo data
      setDemoContent();
    } finally {
      setLoading(false);
    }
  };

  const setDemoContent = () => {
    const demoPosts = [
      {
        id: '1',
        title: 'Understanding AHPRA Guidelines for Digital Marketing',
        slug: 'ahpra-digital-marketing-guidelines',
        excerpt: 'A comprehensive guide to staying compliant with AHPRA regulations while effectively marketing your healthcare practice online.',
        content: 'Healthcare marketing in Australia requires careful attention to AHPRA guidelines...',
        featured_image: '/src/assets/healthcare-marketing.jpg',
        category: 'AHPRA Compliance',
        tags: ['AHPRA', 'Digital Marketing', 'Compliance'],
        author: 'Dr. Sarah Johnson',
        published: true,
        featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Patient Communication Best Practices',
        slug: 'patient-communication-best-practices',
        excerpt: 'Learn effective strategies for communicating with patients across digital channels while maintaining professional standards.',
        content: 'Effective patient communication is crucial for healthcare providers...',
        featured_image: '/src/assets/patient-communication.jpg',
        category: 'Patient Education',
        tags: ['Communication', 'Patient Care', 'Best Practices'],
        author: 'Dr. Michael Chen',
        published: true,
        featured: false,
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      }
    ];

    setPosts(demoPosts);
    setFeaturedPosts(demoPosts.filter(post => post.featured));
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory && !post.featured;
  });

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {showHeader && <PublicHeader />}
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showHeader && <PublicHeader />}
      
      {/* Business Profile Header - Only show if we have business info */}
      {businessProfile && (
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-6">
              {businessProfile.logo_url && (
                <img 
                  src={businessProfile.logo_url} 
                  alt={businessProfile.business_name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-primary mb-2">
                  {businessProfile.business_name} Blog
                </h1>
                {businessProfile.description && (
                  <p className="text-muted-foreground mb-2">
                    {businessProfile.description}
                  </p>
                )}
                {businessProfile.website_url && (
                  <a 
                    href={businessProfile.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm"
                  >
                    Visit Website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section - Adapted for embedded content */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
          style={{
            backgroundImage: "url('/src/assets/healthcare-hero.jpg')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/95" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient-hero fade-in">
            {businessProfile ? `${businessProfile.business_name} Insights` : 'Healthcare Insights'}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 fade-in-delayed">
            Professional healthcare insights, patient education, and industry updates from trusted practitioners
          </p>
          
          {/* Powered by JBSAAS badge */}
          <div className="fade-in-delayed-2">
            <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
              <span className="text-xs">Powered by</span>
              <Separator orientation="vertical" className="mx-2 h-3" />
              <span className="font-semibold text-primary">JBSAAS</span>
            </Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="text-3xl font-bold">Featured Articles</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="card-dark hover-lift group">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {post.featured_image && (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-primary-foreground">
                        Featured
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {calculateReadingTime(post.content)} min read
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{post.category}</Badge>
                      <Link to={`/embedded-blog/${post.slug}?${searchParams.toString()}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          Read More <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Search and Filter */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Latest Articles</h2>
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="card-dark hover-lift group">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {post.featured_image && (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {calculateReadingTime(post.content)} min read
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{post.category}</Badge>
                      <Link to={`/embedded-blog/${post.slug}?${searchParams.toString()}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          Read More <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    {post.author && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                          By {post.author}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section - Embedded version */}
        <section className="mb-16">
          <Card className="glass-strong p-8 text-center">
            <h3 className="text-3xl font-bold mb-4 text-gradient-primary">
              Want Your Own Professional Blog?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Create and embed professional blogs for your healthcare practice with JBSAAS. 
              AHPRA-compliant content generation and seamless integration with your website.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-primary" asChild>
                <Link to="/signup">
                  Start Free Trial
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/demo">
                  View Demo
                </Link>
              </Button>
            </div>
          </Card>
        </section>

        {/* Footer Attribution */}
        <section className="text-center border-t border-border/50 pt-8">
          <p className="text-sm text-muted-foreground mb-2">
            This blog is powered by
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold">
            JBSAAS Healthcare Platform
            <ExternalLink className="h-4 w-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-2">
            Professional content management for Australian healthcare providers
          </p>
        </section>
      </div>
    </div>
  );
};

export default EmbeddedBlogPage;