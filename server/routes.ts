import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertBusinessProfileSchema, 
  insertPostSchema, 
  insertCalendarEventSchema,
  insertBlogPostSchema,
  insertContentIdeaSchema,
  insertContentGenerationRequestSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication & User Management
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Business Profiles
  app.get("/api/business-profiles/:userId", async (req, res) => {
    try {
      const profiles = await storage.getUserBusinessProfiles(req.params.userId);
      res.json(profiles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/business-profiles", async (req, res) => {
    try {
      const profileData = insertBusinessProfileSchema.parse(req.body);
      const { userId } = req.body;
      const profile = await storage.createBusinessProfile({ ...profileData, userId });
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Posts/Content Management
  app.get("/api/posts/:userId", async (req, res) => {
    try {
      const { limit } = req.query;
      const posts = await storage.getUserPosts(req.params.userId, limit ? parseInt(limit as string) : undefined);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const { userId } = req.body;
      const post = await storage.createPost({ ...postData, userId });
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/posts/:id", async (req, res) => {
    try {
      const updates = req.body;
      const post = await storage.updatePost(req.params.id, updates);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const success = await storage.deletePost(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Calendar Events
  app.get("/api/calendar-events/:userId", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const events = await storage.getUserCalendarEvents(
        req.params.userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/calendar-events", async (req, res) => {
    try {
      const eventData = insertCalendarEventSchema.parse(req.body);
      const { userId } = req.body;
      const event = await storage.createCalendarEvent({ ...eventData, userId });
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/calendar-events/:id", async (req, res) => {
    try {
      const updates = req.body;
      const event = await storage.updateCalendarEvent(req.params.id, updates);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Blog Management - Public Read-Only API (Google Crawlable)
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const { published, limit, category, featured } = req.query;
      
      // For external frontends, default to published posts only
      const shouldShowPublished = published === 'false' ? false : true;
      
      const posts = await storage.getBlogPosts(
        shouldShowPublished,
        limit ? parseInt(limit as string) : 50
      );
      
      // Add SEO-friendly metadata for crawlers
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutes cache
        'Content-Type': 'application/json; charset=utf-8'
      });
      
      res.json({
        posts,
        meta: {
          total: posts.length,
          published_only: shouldShowPublished,
          crawlable: true,
          api_version: '1.0'
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/blog-posts/slug/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      // Only serve published posts to external frontends
      if (!post.published) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      // SEO-friendly headers for individual posts
      res.set({
        'Cache-Control': 'public, max-age=600', // 10 minutes cache
        'Content-Type': 'application/json; charset=utf-8',
        'X-Content-Type': 'blog-post'
      });
      
      res.json({
        ...post,
        meta: {
          crawlable: true,
          canonical_url: `/blog/${post.slug}`,
          api_version: '1.0'
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUBLIC API - For External Frontends (Simple URLs)
  app.get("/api/public/blog", async (req, res) => {
    try {
      const { limit = 10, category, featured } = req.query;
      
      // Only published posts for public API
      const posts = await storage.getBlogPosts(true, parseInt(limit as string));
      
      // Filter by category or featured if specified
      let filteredPosts = posts;
      if (category) {
        filteredPosts = posts.filter(post => post.category === category);
      }
      if (featured === 'true') {
        filteredPosts = posts.filter(post => post.featured);
      }
      
      // SEO and cache headers
      res.set({
        'Cache-Control': 'public, max-age=300',
        'Content-Type': 'application/json; charset=utf-8',
        'X-API-Version': '1.0',
        'X-Crawlable': 'true'
      });
      
      res.json({
        success: true,
        data: filteredPosts.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          author: post.author,
          category: post.category,
          tags: post.tags,
          featuredImage: post.featuredImage,
          publishedAt: post.createdAt,
          url: `/blog/${post.slug}`
        })),
        meta: {
          total: filteredPosts.length,
          limit: parseInt(limit as string),
          api_type: 'public_read_only',
          crawlable: true
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/public/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post || !post.published) {
        return res.status(404).json({ error: "Article not found" });
      }
      
      // SEO headers for individual posts
      res.set({
        'Cache-Control': 'public, max-age=600',
        'Content-Type': 'application/json; charset=utf-8',
        'X-Content-Type': 'healthcare-blog-post'
      });
      
      res.json({
        success: true,
        data: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          author: post.author,
          category: post.category,
          tags: post.tags,
          featuredImage: post.featuredImage,
          metaDescription: post.metaDescription,
          publishedAt: post.createdAt,
          featured: post.featured
        },
        meta: {
          canonical_url: `/blog/${post.slug}`,
          crawlable: true,
          api_type: 'public_read_only'
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PROTECTED: Blog creation (requires future authentication)
  app.post("/api/blog-posts", async (req, res) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(postData);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Content Ideas
  app.get("/api/content-ideas/:userId", async (req, res) => {
    try {
      const { limit } = req.query;
      const ideas = await storage.getUserContentIdeas(req.params.userId, limit ? parseInt(limit as string) : undefined);
      res.json(ideas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/content-ideas", async (req, res) => {
    try {
      const ideaData = insertContentIdeaSchema.parse(req.body);
      const { userId } = req.body;
      const idea = await storage.createContentIdea({ ...ideaData, userId });
      res.json(idea);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Content Generation - Replacement for Supabase Edge Functions
  app.post("/api/generate-content", async (req, res) => {
    try {
      const requestData = insertContentGenerationRequestSchema.parse(req.body);
      const { userId } = req.body;
      
      // Create the generation request
      const request = await storage.createContentGenerationRequest({ ...requestData, userId });
      
      // For now, return a placeholder response
      // In a real implementation, this would integrate with AI services
      const generatedContent = {
        text: `Generated content for ${requestData.platform} platform`,
        hashtags: ["#generated", "#content"],
        suggestions: ["Consider adding more visuals", "Engage with your audience"]
      };
      
      // Update the request with generated content
      await storage.updateContentGenerationRequest(request.id, {
        generatedContent,
        status: "completed",
        processingTimeMs: 1000
      });
      
      res.json({ success: true, content: generatedContent, requestId: request.id });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Analytics - Replacement for analytics functions
  app.get("/api/analytics/:userId", async (req, res) => {
    try {
      const { platform } = req.query;
      const analytics = await storage.getUserAnalytics(req.params.userId, platform as string);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/analytics", async (req, res) => {
    try {
      const { postId, userId, platform, metrics } = req.body;
      const analytics = await storage.recordAnalytics({ postId, userId, platform, metrics });
      res.json(analytics);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Competitor Analysis - Simplified version of analyze-competitor function
  app.post("/api/analyze-competitor", async (req, res) => {
    try {
      const { competitorId, analysisType, userId } = req.body;
      
      // Simplified competitor analysis - in production this would be more sophisticated
      const analysisResults = {
        competitor_name: "Sample Competitor",
        analysis_type: analysisType,
        insights: [
          "Competitor posts 3-4 times per week",
          "High engagement on educational content",
          "Strong presence on LinkedIn and Twitter"
        ],
        recommendations: [
          "Increase posting frequency",
          "Focus more on educational content",
          "Expand LinkedIn presence"
        ],
        confidence_score: 0.85
      };
      
      res.json({ success: true, results: analysisResults });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
