import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowRight, BookOpen, Stethoscope, Heart, Brain, Users, Shield } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  featured_image: string;
  published: boolean;
  created_at: string;
  slug: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setFeaturedPost(data[0]);
        setPosts(data.slice(1));
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  const healthcareFeatures = [
    {
      icon: <Stethoscope className="h-8 w-8 text-blue-600" />,
      title: "AHPRA Compliant",
      description: "All content automatically validated for Australian healthcare regulations"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Medical Accuracy",
      description: "Content reviewed by healthcare professionals for accuracy and compliance"
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "Patient-Focused",
      description: "Templates designed for patient education and engagement"
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      title: "AI-Powered",
      description: "Intelligent content generation with medical knowledge base"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading healthcare blog content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Healthcare Content Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              AHPRA-compliant content creation for Australian healthcare professionals
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
                Healthcare Professionals
              </Badge>
              <Badge variant="secondary" className="bg-green-500 hover:bg-green-400 text-white px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                AHPRA Compliant
              </Badge>
              <Badge variant="secondary" className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2">
                <Brain className="h-4 w-4 mr-2" />
                AI-Powered
              </Badge>
            </div>
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link to="/auth">
                Start Creating Content
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Australian Healthcare
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform ensures all content meets Australian healthcare standards and regulations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {healthcareFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Sample Content Section */}
      {(featuredPost || posts.length > 0) && (
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Sample Healthcare Content
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Examples of content created with our healthcare platform
              </p>
            </div>

            {/* Featured Post */}
            {featuredPost && (
              <Card className="mb-12 overflow-hidden">
                <div className="md:flex">
                  {featuredPost.featured_image && (
                    <div className="md:w-1/2">
                      <img 
                        src={featuredPost.featured_image} 
                        alt={featuredPost.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="md:w-1/2 p-8">
                    <div className="flex items-center mb-4">
                      <Badge variant="outline" className="mr-3">
                        {featuredPost.category}
                      </Badge>
                      <span className="text-sm text-gray-500">Featured</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{featuredPost.title}</h3>
                    <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-6">
                      <User className="h-4 w-4 mr-1" />
                      <span className="mr-4">{featuredPost.author}</span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="mr-4">{formatDate(featuredPost.created_at)}</span>
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{getReadingTime(featuredPost.content)} min read</span>
                    </div>
                    <Button asChild>
                      <Link to={`/blog/${featuredPost.slug}`}>
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Other Posts */}
            {posts.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    {post.featured_image && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={post.featured_image} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{post.category}</Badge>
                        <span className="text-sm text-gray-500">
                          {getReadingTime(post.content)} min read
                        </span>
                      </div>
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{post.excerpt}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <User className="h-4 w-4 mr-1" />
                        <span className="mr-4">{post.author}</span>
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/blog/${post.slug}`}>
                          Read More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Content State */}
      {!featuredPost && posts.length === 0 && (
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Create Healthcare Content?
              </h3>
              <p className="text-gray-600 mb-8">
                Start creating AHPRA-compliant content for your healthcare practice. 
                Our platform ensures all content meets Australian healthcare standards.
              </p>
              <Button asChild size="lg">
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Healthcare Content?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join Australian healthcare professionals using our AHPRA-compliant platform
          </p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
            <Link to="/auth">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Blog;
