import { supabaseAdmin } from "./db";
import {
  users,
  businessProfiles,
  posts,
  calendarEvents,
  blogPosts,
  contentIdeas,
  contentGenerationRequests,
  competitorData,
  competitiveAnalysisResults,
  analytics,
  type User,
  type InsertUser,
  type BusinessProfile,
  type InsertBusinessProfile,
  type Post,
  type InsertPost,
  type CalendarEvent,
  type InsertCalendarEvent,
  type BlogPost,
  type InsertBlogPost,
  type ContentIdea,
  type InsertContentIdea,
  type ContentGenerationRequest,
  type InsertContentGenerationRequest,
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Business profiles
  getBusinessProfile(id: string): Promise<BusinessProfile | undefined>;
  getUserBusinessProfiles(userId: string): Promise<BusinessProfile[]>;
  createBusinessProfile(profile: InsertBusinessProfile & { userId: string }): Promise<BusinessProfile>;
  updateBusinessProfile(id: string, updates: Partial<BusinessProfile>): Promise<BusinessProfile | undefined>;
  
  // Posts/Content
  getPost(id: string): Promise<Post | undefined>;
  getUserPosts(userId: string, limit?: number): Promise<Post[]>;
  getBusinessPosts(businessProfileId: string, limit?: number): Promise<Post[]>;
  createPost(post: InsertPost & { userId: string }): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  
  // Calendar events
  getCalendarEvent(id: string): Promise<CalendarEvent | undefined>;
  getUserCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent & { userId: string }): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: string): Promise<boolean>;
  
  // Blog posts
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPosts(published?: boolean, limit?: number): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;
  
  // Content ideas
  getContentIdea(id: string): Promise<ContentIdea | undefined>;
  getUserContentIdeas(userId: string, limit?: number): Promise<ContentIdea[]>;
  createContentIdea(idea: InsertContentIdea & { userId: string }): Promise<ContentIdea>;
  updateContentIdea(id: string, updates: Partial<ContentIdea>): Promise<ContentIdea | undefined>;
  
  // Content generation
  getContentGenerationRequest(id: string): Promise<ContentGenerationRequest | undefined>;
  getUserContentGenerationRequests(userId: string, status?: string): Promise<ContentGenerationRequest[]>;
  createContentGenerationRequest(request: InsertContentGenerationRequest & { userId: string }): Promise<ContentGenerationRequest>;
  updateContentGenerationRequest(id: string, updates: Partial<ContentGenerationRequest>): Promise<ContentGenerationRequest | undefined>;
  
  // Analytics
  getPostAnalytics(postId: string): Promise<any[]>;
  getUserAnalytics(userId: string, platform?: string): Promise<any[]>;
  recordAnalytics(analytics: { postId: string; userId: string; platform: string; metrics: any }): Promise<any>;
}

export class SupabaseStorage implements IStorage {
  // User management
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to create user');
    return data as User;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  // Business profiles
  async getBusinessProfile(id: string): Promise<BusinessProfile | undefined> {
    const { data, error } = await supabaseAdmin
      .from('business_profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as BusinessProfile;
  }

  async getUserBusinessProfiles(userId: string): Promise<BusinessProfile[]> {
    const { data, error } = await supabaseAdmin
      .from('business_profiles')
      .select('*')
      .eq('user_id', userId);
    
    if (error || !data) return [];
    return data as BusinessProfile[];
  }

  async createBusinessProfile(profile: InsertBusinessProfile & { userId: string }): Promise<BusinessProfile> {
    const { data, error } = await supabaseAdmin
      .from('business_profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to create business profile');
    return data as BusinessProfile;
  }

  async updateBusinessProfile(id: string, updates: Partial<BusinessProfile>): Promise<BusinessProfile | undefined> {
    const { data, error } = await supabaseAdmin
      .from('business_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as BusinessProfile;
  }

  // Posts/Content
  async getPost(id: string): Promise<Post | undefined> {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Post;
  }

  async getUserPosts(userId: string, limit = 50): Promise<Post[]> {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error || !data) return [];
    return data as Post[];
  }

  async getBusinessPosts(businessProfileId: string, limit = 50): Promise<Post[]> {
    return await db.select().from(posts)
      .where(eq(posts.businessProfileId, businessProfileId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async createPost(post: InsertPost & { userId: string }): Promise<Post> {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert(post)
      .select()
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to create post');
    return data as Post;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const result = await db.update(posts).set(updates).where(eq(posts.id, id)).returning();
    return result[0];
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return result.rowCount > 0;
  }

  // Calendar events
  async getCalendarEvent(id: string): Promise<CalendarEvent | undefined> {
    const result = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id)).limit(1);
    return result[0];
  }

  async getUserCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    let query = db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId));
    
    if (startDate && endDate) {
      query = query.where(
        and(
          sql`${calendarEvents.startDatetime} >= ${startDate}`,
          sql`${calendarEvents.endDatetime} <= ${endDate}`
        )
      );
    }
    
    return await query.orderBy(calendarEvents.startDatetime);
  }

  async createCalendarEvent(event: InsertCalendarEvent & { userId: string }): Promise<CalendarEvent> {
    const result = await db.insert(calendarEvents).values(event).returning();
    return result[0];
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | undefined> {
    const result = await db.update(calendarEvents).set(updates).where(eq(calendarEvents.id, id)).returning();
    return result[0];
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    const result = await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
    return result.rowCount > 0;
  }

  // Blog posts
  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as BlogPost;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error || !data) return undefined;
    return data as BlogPost;
  }

  async getBlogPosts(published?: boolean, limit = 50): Promise<BlogPost[]> {
    let query = supabaseAdmin
      .from('blog_posts')
      .select('*');
    
    if (published !== undefined) {
      query = query.eq('published', published);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error || !data) return [];
    return data as BlogPost[];
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert(post)
      .select()
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to create blog post');
    return data as BlogPost;
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as BlogPost;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Content ideas
  async getContentIdea(id: string): Promise<ContentIdea | undefined> {
    const result = await db.select().from(contentIdeas).where(eq(contentIdeas.id, id)).limit(1);
    return result[0];
  }

  async getUserContentIdeas(userId: string, limit = 50): Promise<ContentIdea[]> {
    return await db.select().from(contentIdeas)
      .where(eq(contentIdeas.userId, userId))
      .orderBy(desc(contentIdeas.createdAt))
      .limit(limit);
  }

  async createContentIdea(idea: InsertContentIdea & { userId: string }): Promise<ContentIdea> {
    const result = await db.insert(contentIdeas).values(idea).returning();
    return result[0];
  }

  async updateContentIdea(id: string, updates: Partial<ContentIdea>): Promise<ContentIdea | undefined> {
    const result = await db.update(contentIdeas).set(updates).where(eq(contentIdeas.id, id)).returning();
    return result[0];
  }

  // Content generation
  async getContentGenerationRequest(id: string): Promise<ContentGenerationRequest | undefined> {
    const result = await db.select().from(contentGenerationRequests).where(eq(contentGenerationRequests.id, id)).limit(1);
    return result[0];
  }

  async getUserContentGenerationRequests(userId: string, status?: string): Promise<ContentGenerationRequest[]> {
    let query = db.select().from(contentGenerationRequests).where(eq(contentGenerationRequests.userId, userId));
    
    if (status) {
      query = query.where(eq(contentGenerationRequests.status, status));
    }
    
    return await query.orderBy(desc(contentGenerationRequests.createdAt));
  }

  async createContentGenerationRequest(request: InsertContentGenerationRequest & { userId: string }): Promise<ContentGenerationRequest> {
    const result = await db.insert(contentGenerationRequests).values(request).returning();
    return result[0];
  }

  async updateContentGenerationRequest(id: string, updates: Partial<ContentGenerationRequest>): Promise<ContentGenerationRequest | undefined> {
    const result = await db.update(contentGenerationRequests).set(updates).where(eq(contentGenerationRequests.id, id)).returning();
    return result[0];
  }

  // Analytics
  async getPostAnalytics(postId: string): Promise<any[]> {
    return await db.select().from(analytics)
      .where(eq(analytics.postId, postId))
      .orderBy(desc(analytics.collectedAt));
  }

  async getUserAnalytics(userId: string, platform?: string): Promise<any[]> {
    let query = db.select().from(analytics).where(eq(analytics.userId, userId));
    
    if (platform) {
      query = query.where(eq(analytics.platform, platform));
    }
    
    return await query.orderBy(desc(analytics.collectedAt));
  }

  async recordAnalytics(analyticsData: { postId: string; userId: string; platform: string; metrics: any }): Promise<any> {
    const result = await db.insert(analytics).values(analyticsData).returning();
    return result[0];
  }
}

export const storage = new SupabaseStorage();
