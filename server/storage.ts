import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
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

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Business profiles
  async getBusinessProfile(id: string): Promise<BusinessProfile | undefined> {
    const result = await db.select().from(businessProfiles).where(eq(businessProfiles.id, id)).limit(1);
    return result[0];
  }

  async getUserBusinessProfiles(userId: string): Promise<BusinessProfile[]> {
    return await db.select().from(businessProfiles).where(eq(businessProfiles.userId, userId));
  }

  async createBusinessProfile(profile: InsertBusinessProfile & { userId: string }): Promise<BusinessProfile> {
    const result = await db.insert(businessProfiles).values(profile).returning();
    return result[0];
  }

  async updateBusinessProfile(id: string, updates: Partial<BusinessProfile>): Promise<BusinessProfile | undefined> {
    const result = await db.update(businessProfiles).set(updates).where(eq(businessProfiles.id, id)).returning();
    return result[0];
  }

  // Posts/Content
  async getPost(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async getUserPosts(userId: string, limit = 50): Promise<Post[]> {
    return await db.select().from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getBusinessPosts(businessProfileId: string, limit = 50): Promise<Post[]> {
    return await db.select().from(posts)
      .where(eq(posts.businessProfileId, businessProfileId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async createPost(post: InsertPost & { userId: string }): Promise<Post> {
    const result = await db.insert(posts).values(post).returning();
    return result[0];
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
    const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return result[0];
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return result[0];
  }

  async getBlogPosts(published?: boolean, limit = 50): Promise<BlogPost[]> {
    let query = db.select().from(blogPosts);
    
    if (published !== undefined) {
      query = query.where(eq(blogPosts.published, published));
    }
    
    return await query.orderBy(desc(blogPosts.createdAt)).limit(limit);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(post).returning();
    return result[0];
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const result = await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id)).returning();
    return result[0];
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return result.rowCount > 0;
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

export const storage = new DatabaseStorage();
