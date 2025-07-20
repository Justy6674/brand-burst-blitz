import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  published: boolean;
  featured?: boolean;
  featured_image?: string;
  author?: string;
  category?: string;
  tags?: string[];
  meta_description?: string;
  slug: string;
  created_at: string;
  updated_at: string;
  scheduled_publish_at?: string;
}

export interface BlogCustomization {
  id: string;
  business_id: string;
  layout_style: string;
  color_scheme: any;
  typography: any;
  branding: any;
  post_display: any;
  seo_settings: any;
  image_settings: any;
  created_at: string;
  updated_at: string;
}

export interface ContentGenerationRequest {
  topic: string;
  contentType: 'blog' | 'article' | 'guide' | 'listicle';
  tone: 'professional' | 'casual' | 'authoritative' | 'friendly';
  targetAudience: string;
  targetLength: 'short' | 'medium' | 'long';
  keywords: string[];
  businessId: string;
  industryContext?: string;
}

export interface GeneratedContent {
  title: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  outline?: {
    title: string;
    sections: Array<{
      heading: string;
      keyPoints: string[];
      wordCount: number;
    }>;
    seoKeywords: string[];
    estimatedReadTime: number;
  };
}

export interface PlatformIntegration {
  platform: 'wordpress' | 'shopify' | 'squarespace' | 'wix' | 'custom';
  method: 'embed' | 'api' | 'manual';
  configuration: Record<string, any>;
  isActive: boolean;
}

class BlogService {
  // Content Generation
  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-complete-content', {
        body: {
          topic: request.topic,
          content_type: request.contentType,
          tone: request.tone,
          target_audience: request.targetAudience,
          target_length: request.targetLength,
          keywords: request.keywords,
          business_id: request.businessId,
          industry_context: request.industryContext
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }

  // Blog Posts Management
  async createBlogPost(businessId: string, postData: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw new Error('Failed to create blog post');
    }
  }

  async getBlogPosts(businessId: string, filters?: {
    published?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.published !== undefined) {
        query = query.eq('published', filters.published);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw new Error('Failed to fetch blog posts');
    }
  }

  async updateBlogPost(postId: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw new Error('Failed to update blog post');
    }
  }

  async deleteBlogPost(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw new Error('Failed to delete blog post');
    }
  }

  // Blog Customization
  async getBlogCustomization(businessId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('blog_customizations')
        .select('*')
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching blog customization:', error);
      return null;
    }
  }

  async updateBlogCustomization(businessId: string, customization: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('blog_customizations')
        .upsert({
          business_id: businessId,
          ...customization
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating blog customization:', error);
      throw new Error('Failed to update blog customization');
    }
  }

  // Platform Integration Validation
  async validatePlatformIntegration(integration: PlatformIntegration): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      switch (integration.platform) {
        case 'wordpress':
          await this.validateWordPressIntegration(integration, errors, warnings);
          break;
        case 'shopify':
          await this.validateShopifyIntegration(integration, errors, warnings);
          break;
        case 'squarespace':
          await this.validateSquarespaceIntegration(integration, errors, warnings);
          break;
        case 'wix':
          await this.validateWixIntegration(integration, errors, warnings);
          break;
        case 'custom':
          await this.validateCustomIntegration(integration, errors, warnings);
          break;
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      console.error('Error validating platform integration:', error);
      return {
        isValid: false,
        errors: ['Validation failed due to system error'],
        warnings
      };
    }
  }

  private async validateWordPressIntegration(integration: PlatformIntegration, errors: string[], warnings: string[]): Promise<void> {
    const config = integration.configuration;

    if (integration.method === 'api') {
      if (!config.siteUrl) errors.push('WordPress site URL is required');
      if (!config.username || !config.applicationPassword) {
        errors.push('WordPress username and application password are required');
      }
      
      // Test connection if possible
      if (config.siteUrl && config.username && config.applicationPassword) {
        try {
          const response = await fetch(`${config.siteUrl}/wp-json/wp/v2/posts?per_page=1`, {
            headers: {
              'Authorization': `Basic ${btoa(`${config.username}:${config.applicationPassword}`)}`
            }
          });
          
          if (!response.ok) {
            errors.push('Failed to connect to WordPress API');
          }
        } catch (error) {
          warnings.push('Could not verify WordPress connection');
        }
      }
    }
  }

  private async validateShopifyIntegration(integration: PlatformIntegration, errors: string[], warnings: string[]): Promise<void> {
    const config = integration.configuration;

    if (integration.method === 'api') {
      if (!config.shopDomain) errors.push('Shopify shop domain is required');
      if (!config.accessToken) errors.push('Shopify access token is required');
      
      if (config.shopDomain && !config.shopDomain.includes('.myshopify.com')) {
        warnings.push('Shop domain should include .myshopify.com');
      }
    }
  }

  private async validateSquarespaceIntegration(integration: PlatformIntegration, errors: string[], warnings: string[]): Promise<void> {
    if (integration.method === 'embed') {
      warnings.push('Squarespace embed requires Business plan or higher');
    }
  }

  private async validateWixIntegration(integration: PlatformIntegration, errors: string[], warnings: string[]): Promise<void> {
    if (integration.method === 'embed') {
      warnings.push('Wix embed requires Premium plan');
    }
  }

  private async validateCustomIntegration(integration: PlatformIntegration, errors: string[], warnings: string[]): Promise<void> {
    const config = integration.configuration;

    if (integration.method === 'api') {
      if (!config.apiEndpoint) errors.push('API endpoint is required');
      if (!config.apiKey && !config.authToken) {
        warnings.push('No authentication provided - API may be publicly accessible');
      }
    }
  }

  // Publishing
  async publishContent(businessId: string, postId: string, platforms: string[]): Promise<{
    success: boolean;
    results: Array<{
      platform: string;
      success: boolean;
      error?: string;
      publishedUrl?: string;
    }>;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('multi-site-publisher', {
        body: {
          business_id: businessId,
          post_id: postId,
          platforms
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error publishing content:', error);
      throw new Error('Failed to publish content');
    }
  }

  // Blog Images
  async uploadBlogImage(businessId: string, file: File, options?: {
    folder?: string;
    altText?: string;
    tags?: string[];
  }): Promise<{
    id: string;
    url: string;
    filename: string;
  }> {
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = options?.folder ? `${options.folder}/${fileName}` : fileName;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      // Save metadata to database
      const { data: imageData, error: dbError } = await supabase
        .from('blog_images')
        .insert({
          business_id: businessId,
          filename: fileName,
          url: publicUrl,
          size: file.size,
          dimensions: { width: 0, height: 0 }, // TODO: Get actual dimensions
          alt_text: options?.altText,
          folder: options?.folder,
          tags: options?.tags || []
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return {
        id: imageData.id,
        url: publicUrl,
        filename: fileName
      };
    } catch (error) {
      console.error('Error uploading blog image:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Analytics and Insights
  async getBlogAnalytics(businessId: string, timeRange: '7d' | '30d' | '90d' = '30d'): Promise<{
    totalPosts: number;
    publishedPosts: number;
    totalViews: number;
    avgEngagement: number;
    topPosts: Array<{
      id: string;
      title: string;
      views: number;
      engagement: number;
    }>;
  }> {
    try {
      // This would typically call an analytics function
      // For now, return mock data structure
      return {
        totalPosts: 0,
        publishedPosts: 0,
        totalViews: 0,
        avgEngagement: 0,
        topPosts: []
      };
    } catch (error) {
      console.error('Error fetching blog analytics:', error);
      throw new Error('Failed to fetch analytics');
    }
  }
}

export const blogService = new BlogService();