import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wand2, Download, Copy, Share2, Image, FileText, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContentPackage {
  blogPost: {
    title: string;
    content: string;
    excerpt: string;
    metaDescription: string;
    keywords: string[];
  };
  images: {
    heroImage: string;
    socialImage: string;
    quoteCard: string;
  };
  socialPosts: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
  };
  seoData: {
    schema: string;
    metaTags: string;
    altTexts: string[];
  };
}

const INDUSTRIES = [
  "Trades & Construction", "Retail & Ecommerce", "Hospitality & Food", 
  "Professional Services", "Health & Wellness", "Education & Training",
  "Real Estate", "Automotive", "Beauty & Personal Care", "Technology"
];

const CONTENT_TYPES = [
  "How-To Guide", "Industry News", "Customer Success Story", "Seasonal Promotion",
  "Behind the Scenes", "Tips & Tricks", "Product Showcase", "Local Community",
  "Compliance Update", "Business Insight"
];

const AUSTRALIAN_LOCATIONS = [
  "Sydney, NSW", "Melbourne, VIC", "Brisbane, QLD", "Perth, WA", 
  "Adelaide, SA", "Gold Coast, QLD", "Newcastle, NSW", "Canberra, ACT",
  "Sunshine Coast, QLD", "Geelong, VIC"
];

export function CompleteContentGenerator() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentPackage, setContentPackage] = useState<ContentPackage | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [contentType, setContentType] = useState("");
  const [topicIdea, setTopicIdea] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const generateCompletePackage = async () => {
    if (!businessName || !industry || !contentType) {
      toast({
        title: "Missing Information",
        description: "Please fill in business name, industry, and content type",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate content using AI
      const contentPrompt = `Create a comprehensive blog post for a ${industry} business called "${businessName}" located in ${location}. 
      Content type: ${contentType}
      Topic: ${topicIdea || "industry-relevant topic"}
      Target audience: ${targetAudience || "local customers"}
      
      Make it Australian-focused with local insights, compliance considerations, and seasonal relevance.
      Include practical tips, industry expertise, and local market data.
      Write in a professional but approachable tone.`;

      const { data: contentData, error: contentError } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: contentPrompt,
          type: 'blog_post',
          industry,
          location
        }
      });

      if (contentError) throw contentError;

      // Generate images using OpenAI
      const imagePrompts = {
        hero: `Professional hero image for ${industry} business blog post about ${topicIdea || contentType}. Australian business context. Clean, modern, high-quality.`,
        social: `Social media image for ${businessName} - ${industry} business. Include space for text overlay. Professional Australian business style.`,
        quote: `Quote card background for customer testimonial. ${industry} themed. Professional design with space for text and logo.`
      };

      const imagePromises = Object.entries(imagePrompts).map(async ([type, prompt]) => {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt,
            size: '1024x1024',
            quality: 'high',
            output_format: 'png'
          })
        });
        
        const imageData = await response.json();
        return [type, imageData.data[0].url];
      });

      const images = Object.fromEntries(await Promise.all(imagePromises));

      // Generate social media posts
      const socialPrompt = `Create social media posts for ${businessName} (${industry}) promoting the blog post: "${contentData.title}".
      Location: ${location}
      Include relevant hashtags, local references, and call-to-actions.
      Adapt tone for each platform.`;

      const { data: socialData } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: socialPrompt,
          type: 'social_posts',
          platforms: ['facebook', 'instagram', 'linkedin', 'twitter']
        }
      });

      // Generate SEO metadata
      const seoSchema = generateLocalBusinessSchema(businessName, industry, location);
      const metaTags = generateMetaTags(contentData.title, contentData.metaDescription, images.hero);

      const completePackage: ContentPackage = {
        blogPost: {
          title: contentData.title,
          content: contentData.content,
          excerpt: contentData.excerpt,
          metaDescription: contentData.metaDescription,
          keywords: contentData.keywords || []
        },
        images: {
          heroImage: images.hero,
          socialImage: images.social,
          quoteCard: images.quote
        },
        socialPosts: {
          facebook: socialData?.facebook || "",
          instagram: socialData?.instagram || "",
          linkedin: socialData?.linkedin || "",
          twitter: socialData?.twitter || ""
        },
        seoData: {
          schema: seoSchema,
          metaTags,
          altTexts: [
            `${businessName} - ${contentType} hero image`,
            `${businessName} social media graphic`,
            `Customer testimonial quote card for ${businessName}`
          ]
        }
      };

      setContentPackage(completePackage);
      
      toast({
        title: "Complete Content Package Generated!",
        description: "Blog post, images, social posts, and SEO metadata ready",
      });

    } catch (error) {
      console.error('Error generating content package:', error);
      toast({
        title: "Generation Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLocalBusinessSchema = (name: string, industry: string, location: string) => {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": name,
      "description": `Professional ${industry} services in ${location}`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": location.split(',')[0],
        "addressRegion": location.split(',')[1]?.trim(),
        "addressCountry": "AU"
      },
      "url": "https://yourbusiness.com",
      "telephone": "+61-xxx-xxx-xxx",
      "priceRange": "$$",
      "image": contentPackage?.images.heroImage,
      "openingHours": "Mo-Fr 09:00-17:00"
    }, null, 2);
  };

  const generateMetaTags = (title: string, description: string, image: string) => {
    return `<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete AI Content Generator</h1>
        <p className="text-muted-foreground">
          Generate blog post + SEO + images + social posts in one click
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            Tell us about your business and we'll create a complete content package
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business Name"
              />
            </div>
            
            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your location" />
                </SelectTrigger>
                <SelectContent>
                  {AUSTRALIAN_LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contentType">Content Type *</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="What type of content?" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="topicIdea">Topic Idea (Optional)</Label>
            <Input
              id="topicIdea"
              value={topicIdea}
              onChange={(e) => setTopicIdea(e.target.value)}
              placeholder="Specific topic or leave blank for AI suggestion"
            />
          </div>

          <div>
            <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
            <Input
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Who are you writing for?"
            />
          </div>

          <div>
            <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
            <Input
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://yoursite.com/logo.png"
            />
          </div>

          <Button 
            onClick={generateCompletePackage} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Complete Package...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Complete Content Package
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {contentPackage && (
        <Card>
          <CardHeader>
            <CardTitle>Your Complete Content Package</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Blog Post</Badge>
              <Badge variant="secondary">3 Images</Badge>
              <Badge variant="secondary">4 Social Posts</Badge>
              <Badge variant="secondary">SEO Optimized</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="blog" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="blog" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Blog Post
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Images
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Social Posts
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  SEO Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="blog" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">Blog Post Title</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(contentPackage.blogPost.title, "Title")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="p-3 bg-muted rounded">{contentPackage.blogPost.title}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">Blog Content</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(contentPackage.blogPost.content, "Content")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadAsFile(contentPackage.blogPost.content, "blog-post.txt")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={contentPackage.blogPost.content}
                      readOnly
                      className="min-h-[300px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Meta Description</h4>
                      <p className="text-sm p-3 bg-muted rounded">{contentPackage.blogPost.metaDescription}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {contentPackage.blogPost.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="images" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Hero Image</h4>
                    <img src={contentPackage.images.heroImage} alt="Hero" className="w-full rounded" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(contentPackage.images.heroImage, '_blank')}
                    >
                      Download
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Social Image</h4>
                    <img src={contentPackage.images.socialImage} alt="Social" className="w-full rounded" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(contentPackage.images.socialImage, '_blank')}
                    >
                      Download
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Quote Card</h4>
                    <img src={contentPackage.images.quoteCard} alt="Quote" className="w-full rounded" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(contentPackage.images.quoteCard, '_blank')}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="social" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(contentPackage.socialPosts).map(([platform, post]) => (
                    <div key={platform} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize">{platform}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(post, platform)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea value={post} readOnly className="min-h-[120px]" />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="seo" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Meta Tags</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(contentPackage.seoData.metaTags, "Meta Tags")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={contentPackage.seoData.metaTags}
                      readOnly
                      className="min-h-[150px] font-mono text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">JSON-LD Schema</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(contentPackage.seoData.schema, "Schema")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={contentPackage.seoData.schema}
                      readOnly
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}