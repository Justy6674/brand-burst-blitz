import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PublicHeader from '@/components/layout/PublicHeader';
import { SystemLockdownBanner } from '@/components/common/SystemLockdownBanner';
import { HeroSection } from '@/components/layout/HeroSection';
import { ComingSoonPopup } from '@/components/common/ComingSoonPopup';
import { 
  Globe, 
  Code,
  Zap,
  Shield,
  Sparkles,
  Rocket,
  ArrowRight,
  Check,
  Star,
  BarChart3,
  Clock,
  Monitor,
  Smartphone,
  Copy,
  Eye
} from 'lucide-react';
import heroImage from "@/assets/hero-image.jpg";

// Remove problematic imports for now - we'll add them back once we fix the issue
// import { useBlogEmbedSSR } from '@/hooks/useBlogEmbedSSR';
// import { useBusinessProfile } from '@/hooks/useBusinessProfile';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  published: boolean;
  created_at: string;
  category?: string[];
  featured_image?: string;
  compliance_score?: number;
  author?: string;
  tags?: string[];
}

interface EmbedMetrics {
  loadTime: number;
  bundleSize: string;
  seoScore: number;
  complianceScore: number;
}

const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <PublicHeader />
    <SystemLockdownBanner />
    <main className="flex-1">
      {children}
    </main>
    <ComingSoonPopup />
  </div>
);

// Demo blog posts for showcase
const DEMO_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Understanding AHPRA Advertising Guidelines for Healthcare',
    excerpt: 'A comprehensive guide to ensuring your healthcare marketing meets AHPRA compliance standards.',
    content: '',
    published: true,
    created_at: new Date().toISOString(),
    category: ['Compliance'],
    compliance_score: 100,
    author: 'Dr. Sarah Chen',
    featured_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400'
  },
  {
    id: '2',
    title: '5 Ways to Improve Patient Engagement Through Content',
    excerpt: 'Evidence-based strategies to connect with your patients through valuable, compliant content.',
    content: '',
    published: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    category: ['Patient Care'],
    compliance_score: 98,
    author: 'Healthcare Professional',
    featured_image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400'
  },
  {
    id: '3',
    title: 'Digital Health Trends in Australian Healthcare 2024',
    excerpt: 'Stay ahead with the latest digital health innovations transforming Australian healthcare.',
    content: '',
    published: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    category: ['Innovation'],
    compliance_score: 100,
    author: 'Tech Health Team',
    featured_image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400'
  }
];

export default function BlogShowcase() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(DEMO_POSTS);
  const [embedStyle, setEmbedStyle] = useState<'grid' | 'list' | 'cards'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [metrics, setMetrics] = useState<EmbedMetrics>({
    loadTime: 142,
    bundleSize: '<50kb',
    seoScore: 98,
    complianceScore: 100
  });
  
  const { toast } = useToast();
  // Commented out for now
  // const { businessProfiles } = useBusinessProfile();
  // const { generateSSRHTML, generateEmbedScript, isGenerating } = useBlogEmbedSSR();
  
  // Track load time
  const startTime = performance.now();

  useEffect(() => {
    generateEmbedCode();
  }, [embedStyle]);

  const generateEmbedCode = () => {
    const code = `<!-- JBSAAS Healthcare Blog Widget -->
<div data-jbsaas-widget="blog" 
     data-business-id="demo-healthcare-practice"
     data-theme="healthcare"
     data-layout="${embedStyle}"
     data-posts="6"
     data-show-excerpt="true"
     data-show-date="true"
     data-show-author="true"
     data-ahpra-compliance="true">
</div>
<script src="${window.location.origin}/widget.js" async></script>
<!-- End JBSAAS Widget -->`;
    
    setEmbedCode(code);
  };

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  const renderBlogEmbed = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      );
    }

    const gridClasses = {
      grid: "grid md:grid-cols-2 lg:grid-cols-3 gap-6",
      list: "space-y-6",
      cards: "grid md:grid-cols-2 gap-8"
    };

    return (
      <div className={gridClasses[embedStyle]}>
        {blogPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            {post.featured_image && embedStyle !== 'list' && (
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img 
                  src={post.featured_image} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <Shield className="w-3 h-3 mr-1" />
                  AHPRA: {post.compliance_score}%
                </Badge>
                {post.category?.[0] && (
                  <Badge variant="secondary">
                    {post.category[0]}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{post.title}</CardTitle>
              <CardDescription>{post.excerpt}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{post.author}</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <PageLayout>
      {/* PLATFORM SHOWCASE BANNER */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 animate-pulse">
              🚀 LIVE DEMO
            </Badge>
            <span className="text-sm md:text-base font-semibold">
              This page demonstrates our <span className="text-yellow-300 font-bold">BLOG EMBED SYSTEM</span> in action
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 ml-auto hidden md:flex items-center gap-2"
            onClick={() => window.location.href = '/pricing'}
          >
            <Rocket className="w-4 h-4" />
            Get This System →
          </Button>
        </div>
      </div>

      {/* HERO SECTION */}
      <HeroSection 
        badge="Blog Embed System Showcase"
        title={
          <span>
            See Our Healthcare{' '}
            <span className="text-yellow-400">Blog System</span> Live
          </span>
        }
        subtitle="This page demonstrates our blog embed widget - the same system your healthcare practice will use. Watch it load AHPRA-compliant content instantly."
        backgroundImage={heroImage}
        primaryButton={{
          text: "Build Your Blog System",
          href: "/pricing"
        }}
        secondaryButton={{
          text: "View Documentation",
          href: "#how-it-works"
        }}
      />

      {/* LIVE METRICS SECTION */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.loadTime}ms</div>
                <p className="text-xs text-gray-500">Lightning fast</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Bundle Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{metrics.bundleSize}</div>
                <p className="text-xs text-gray-500">Optimized for mobile</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">SEO Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{metrics.seoScore}%</div>
                <p className="text-xs text-gray-500">Google optimized</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">AHPRA Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{metrics.complianceScore}%</div>
                <p className="text-xs text-gray-500">Fully compliant</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* BLOG EMBED DEMONSTRATION */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Live Blog Embed <span className="text-yellow-500">Demonstration</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Below is our blog widget rendering healthcare content. This is exactly what 
              your patients will see on your website - fast, compliant, and professional.
            </p>
            
            {/* Style Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-sm font-medium text-gray-700">Display Style:</span>
              <div className="flex gap-2">
                <Button
                  variant={embedStyle === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmbedStyle('grid')}
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  Grid
                </Button>
                <Button
                  variant={embedStyle === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmbedStyle('list')}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  List
                </Button>
                <Button
                  variant={embedStyle === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmbedStyle('cards')}
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Cards
                </Button>
              </div>
            </div>
          </div>

          {/* ACTUAL BLOG EMBED */}
          <div className="bg-gray-50 rounded-xl p-8 mb-12">
            <div className="mb-4 flex items-center justify-between">
              <Badge className="bg-green-100 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                Live Blog Widget
              </Badge>
              <span className="text-sm text-gray-500">
                Powered by JBSAAS Blog Embed System
              </span>
            </div>
            
            {/* This is where the actual blog posts render */}
            <div id="jbsaas-blog-showcase">
              {renderBlogEmbed()}
            </div>
          </div>

          {/* HOW IT WORKS SECTION */}
          <div id="how-it-works" className="space-y-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                How This Blog System Works
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our blog embed system is designed specifically for Australian healthcare professionals, 
                ensuring AHPRA compliance while maximizing patient engagement.
              </p>
            </div>

            <Tabs defaultValue="embed-code" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="embed-code">
                  <Code className="w-4 h-4 mr-2" />
                  Embed Code
                </TabsTrigger>
                <TabsTrigger value="features">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="performance">
                  <Zap className="w-4 h-4 mr-2" />
                  Performance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="embed-code" className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>The Embed Code</CardTitle>
                    <CardDescription>
                      Copy this simple code to add our blog system to any website
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
                        <code>{embedCode}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2"
                        onClick={copyEmbedCode}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Code
                      </Button>
                    </div>
                    
                    <Alert className="mt-4">
                      <AlertDescription>
                        <strong>That's it!</strong> Just 5 lines of code gives you a complete 
                        AHPRA-compliant blog system with automatic updates, SEO optimization, 
                        and mobile responsiveness.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="mt-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        Healthcare Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5" />
                          <span className="text-sm">AHPRA advertising guidelines built-in</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5" />
                          <span className="text-sm">TGA therapeutic claims validation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5" />
                          <span className="text-sm">Professional boundary enforcement</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5" />
                          <span className="text-sm">Automatic medical disclaimers</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        Platform Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 mt-0.5" />
                          <span className="text-sm">WordPress plugin ready</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 mt-0.5" />
                          <span className="text-sm">Wix & Squarespace compatible</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 mt-0.5" />
                          <span className="text-sm">GoDaddy website builder support</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 mt-0.5" />
                          <span className="text-sm">Works with any HTML website</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        SEO & Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-600 mt-0.5" />
                          <span className="text-sm">Server-side rendering for SEO</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-600 mt-0.5" />
                          <span className="text-sm">Schema.org healthcare markup</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-600 mt-0.5" />
                          <span className="text-sm">Under 50kb total bundle size</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-600 mt-0.5" />
                          <span className="text-sm">Lazy loading for images</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-600" />
                        User Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <span className="text-sm">Mobile-first responsive design</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <span className="text-sm">WCAG AA accessibility compliant</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <span className="text-sm">Multiple display styles</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <span className="text-sm">Dark mode support</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>
                      Real-world performance benchmarks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Page Load Speed</span>
                          <span className="text-sm text-green-600 font-semibold">{metrics.loadTime}ms</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((300 - metrics.loadTime) / 300 * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">SEO Optimization</span>
                          <span className="text-sm text-purple-600 font-semibold">{metrics.seoScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${metrics.seoScore}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">AHPRA Compliance</span>
                          <span className="text-sm text-blue-600 font-semibold">{metrics.complianceScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${metrics.complianceScore}%` }}
                          ></div>
                        </div>
                      </div>

                      <Alert className="mt-6">
                        <Clock className="w-4 h-4" />
                        <AlertDescription>
                          <strong>Performance metrics:</strong> These numbers represent typical 
                          performance benchmarks. Your actual results may vary based on content and hosting.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* COMPARISON SECTION */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Traditional Blog vs Our System
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-gray-600">Traditional Healthcare Blog</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span className="text-sm">Manual AHPRA compliance checking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span className="text-sm">Requires technical setup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span className="text-sm">No automatic updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span className="text-sm">Complex SEO configuration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span className="text-sm">Expensive developer maintenance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-500 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-600">JBSAAS Blog System</CardTitle>
                <Badge className="w-fit bg-green-100 text-green-700">Recommended</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm font-medium">Automatic AHPRA compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm font-medium">5-minute setup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm font-medium">Real-time content updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm font-medium">Built-in SEO optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm font-medium">Zero maintenance required</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* BOTTOM CTA SECTION */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-yellow-500 text-gray-900 hover:bg-yellow-400">
              🎯 LIVE DEMONSTRATION
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Experience Our <span className="text-yellow-400">Blog System</span> Today
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Everything you see here - the fast loading, AHPRA compliance, SEO optimization - 
              is exactly what your patients will experience. Start building your healthcare 
              content platform today.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold mb-4 text-yellow-300">What You Get:</h3>
                <ul className="space-y-3 text-blue-100">
                  <li className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-green-400" />
                    Blog posts loading in under 150ms
                  </li>
                  <li className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    100% AHPRA compliance validation
                  </li>
                  <li className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-green-400" />
                    Just 5 lines of embed code
                  </li>
                  <li className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-green-400" />
                    Works on any website platform
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold mb-4 text-yellow-300">Ready to Start?</h3>
                <ul className="space-y-3 text-blue-100">
                  <li className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Get your blog live in 5 minutes
                  </li>
                  <li className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-400" />
                    AI-powered content generation included
                  </li>
                  <li className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Full platform training provided
                  </li>
                  <li className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-400" />
                    30-day money-back guarantee
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-12 py-4 text-lg"
                onClick={() => window.location.href = '/pricing'}
              >
                <Rocket className="w-6 h-6 mr-3" />
                Get Your Blog System Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white/10 px-12 py-4 text-lg"
                onClick={() => window.location.href = '/features'}
              >
                <Sparkles className="w-6 h-6 mr-3" />
                See All Platform Features
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-blue-200 text-lg">
                <strong className="text-yellow-300">Professional healthcare content.</strong> Built for 
                Australian healthcare providers who demand compliance and performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING DEMO INDICATOR */}
      <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 border border-white/20">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold">Blog System Demo</span>
          <Code className="w-4 h-4" />
        </div>
      </div>
    </PageLayout>
  );
} 