import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  created_at: string;
  featured_image?: string;
  tags?: string[];
  category?: string;
}

export const EmbeddableBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  const style = searchParams.get('style') || 'modern';
  const source = searchParams.get('source') || '';

  useEffect(() => {
    fetchBlogPosts();
  }, [source]);

  const fetchBlogPosts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch published blog posts
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStyleClasses = () => {
    const baseClasses = "font-sans";
    
    switch (style) {
      case 'modern':
        return `${baseClasses} bg-white`;
      case 'classic':
        return `${baseClasses} bg-gray-50`;
      case 'cards':
        return `${baseClasses} bg-gray-100`;
      case 'minimal':
        return `${baseClasses} bg-white`;
      case 'magazine':
        return `${baseClasses} bg-white`;
      default:
        return `${baseClasses} bg-white`;
    }
  };

  const renderModernStyle = () => (
    <div className="space-y-8">
      {posts.map((post) => (
        <article key={post.id} className="border-b border-gray-200 pb-8 last:border-b-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {post.author}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(post.created_at)}
                </span>
                {post.category && (
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                )}
              </div>
            </div>
            
            {post.featured_image && (
              <img 
                src={post.featured_image} 
                alt={post.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            
            <p className="text-gray-600 leading-relaxed">{post.excerpt}</p>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <a 
              href={`${source || window.location.origin}/blog/${post.id}`}
              target="_parent"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Read more <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );

  const renderCardsStyle = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          {post.featured_image && (
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-32 object-cover"
            />
          )}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-lg text-gray-900">{post.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-3">{post.excerpt}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{post.author}</span>
              <span>{formatDate(post.created_at)}</span>
            </div>
            <a 
              href={`${source || window.location.origin}/blog/${post.id}`}
              target="_parent"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Read more <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMinimalStyle = () => (
    <div className="space-y-6">
      {posts.map((post) => (
        <article key={post.id} className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            <a 
              href={`${source || window.location.origin}/blog/${post.id}`}
              target="_parent"
              className="hover:text-blue-600 transition-colors"
            >
              {post.title}
            </a>
          </h2>
          <div className="text-sm text-gray-500">
            {post.author} • {formatDate(post.created_at)}
          </div>
          <p className="text-gray-700">{post.excerpt}</p>
        </article>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (style) {
      case 'cards':
        return renderCardsStyle();
      case 'minimal':
        return renderMinimalStyle();
      case 'classic':
      case 'magazine':
      case 'modern':
      default:
        return renderModernStyle();
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${getStyleClasses()}`}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${getStyleClasses()}`}>
      <div className="max-w-4xl mx-auto">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts found</h3>
            <p className="text-gray-600">Check back soon for new content!</p>
          </div>
        ) : (
          renderContent()
        )}
        
        {/* Powered by JBSAAS footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Powered by{' '}
            <a 
              href="https://jbsaas.com" 
              target="_parent"
              className="text-blue-600 hover:text-blue-800"
            >
              JBSAAS
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};