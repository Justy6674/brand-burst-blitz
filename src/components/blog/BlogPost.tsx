import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
  meta_description?: string;
}

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Post not found');
          } else {
            throw error;
          }
          return;
        }

        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'The requested post could not be found.'}</p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  const readingTime = Math.ceil(post.content.split(' ').length / 200);

  return (
    <div className="min-h-screen relative">
      {/* SEO Meta Tags */}
      <title>{post.title} | JBSAAS Blog</title>
      <meta name="description" content={post.meta_description || post.excerpt} />
      
      {/* Fixed Background Image with Parallax */}
      {post.featured_image && (
        <div 
          className="fixed inset-0 w-full h-full z-0"
          style={{
            backgroundImage: `url(${post.featured_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        >
          {/* Gradient overlay that gets stronger towards bottom */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/80"
            style={{
              background: `linear-gradient(
                to bottom,
                rgba(0,0,0,0.2) 0%,
                rgba(0,0,0,0.4) 30%,
                rgba(0,0,0,0.6) 60%,
                rgba(0,0,0,0.8) 85%,
                rgba(0,0,0,0.95) 100%
              )`
            }}
          ></div>
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/blog')}
            className="bg-white/90 hover:bg-white text-foreground backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>

        {/* Hero Content */}
        <div className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            <article itemScope itemType="https://schema.org/Article">
              <meta itemProp="headline" content={post.title} />
              <meta itemProp="description" content={post.meta_description || post.excerpt} />
              <meta itemProp="datePublished" content={post.created_at} />
              <meta itemProp="dateModified" content={post.updated_at} />
              <meta itemProp="author" content={post.author} />
              {post.featured_image && <meta itemProp="image" content={post.featured_image} />}

              {/* Tags and category for SEO */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {post.category}
                </Badge>
                {post.tags?.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-white/30 text-white backdrop-blur-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {/* Main heading for SEO */}
              <h1 
                itemProp="headline"
                className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-2xl"
              >
                {post.title}
              </h1>
              
              {/* Article excerpt */}
              {post.excerpt && (
                <p 
                  itemProp="description"
                  className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed mb-8 max-w-3xl mx-auto drop-shadow-lg"
                >
                  {post.excerpt}
                </p>
              )}
              
              {/* Article meta for SEO */}
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm md:text-base text-white/80 mb-12">
                <div className="flex items-center gap-1" itemProp="author" itemScope itemType="https://schema.org/Person">
                  <User className="w-4 h-4" />
                  <span itemProp="name">{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <time itemProp="datePublished" dateTime={post.created_at}>
                    {format(new Date(post.created_at), 'MMM dd, yyyy')}
                  </time>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {readingTime} min read
                </div>
              </div>
            </article>
          </div>
        </div>

        {/* Article Content with Glass-morphism Effect */}
        <div className="bg-white/10 backdrop-blur-xl border-t border-white/20 shadow-2xl">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto">
              {/* Content optimized for SEO */}
              <div 
                itemProp="articleBody"
                className="prose prose-lg md:prose-xl max-w-none 
                         prose-headings:text-white prose-headings:font-bold prose-headings:drop-shadow-lg
                         prose-p:text-white/90 prose-p:leading-relaxed prose-p:drop-shadow-md
                         prose-strong:text-white prose-strong:drop-shadow-md
                         prose-a:text-blue-200 prose-a:no-underline hover:prose-a:underline prose-a:drop-shadow-md
                         prose-blockquote:border-l-white/50 prose-blockquote:text-white/80 prose-blockquote:bg-black/20 prose-blockquote:backdrop-blur-sm prose-blockquote:p-4 prose-blockquote:rounded-r-lg
                         prose-img:rounded-lg prose-img:shadow-2xl prose-img:border prose-img:border-white/20
                         prose-h1:text-3xl prose-h1:mb-6 prose-h1:text-white
                         prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-white
                         prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-white
                         prose-code:bg-black/30 prose-code:text-blue-200 prose-code:backdrop-blur-sm
                         prose-pre:bg-black/40 prose-pre:backdrop-blur-sm prose-pre:border prose-pre:border-white/20"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Article footer for SEO */}
              <footer className="mt-12 pt-8 border-t border-white/30">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-sm text-white/80 font-medium">Tags:</span>
                  {post.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-white/30 text-white/90 bg-black/20 backdrop-blur-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-white/70 drop-shadow-md">
                  <p>Published by {post.author} on {format(new Date(post.created_at), 'MMMM dd, yyyy')}</p>
                  {post.updated_at !== post.created_at && (
                    <p>Last updated: {format(new Date(post.updated_at), 'MMMM dd, yyyy')}</p>
                  )}
                </div>
              </footer>
            </div>
          </div>
        </div>

        {/* Call to action section with glass effect */}
        <div className="bg-black/20 backdrop-blur-xl border-t border-white/20">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
                Ready to Transform Your Content Strategy?
              </h2>
              <p className="text-white/90 mb-6 drop-shadow-md">
                Join JBSAAS and create professional content with AI-powered tools.
              </p>
              <Button
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm drop-shadow-lg"
              >
                Get Started Today
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;