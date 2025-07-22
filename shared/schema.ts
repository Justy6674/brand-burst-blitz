import { pgTable, text, serial, integer, boolean, timestamp, uuid, json, numeric, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business profiles
export const businessProfiles = pgTable("business_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  businessName: text("business_name").notNull(),
  industry: text("industry"),
  website: text("website_url"),
  logoUrl: text("logo_url"),
  brandColors: json("brand_colors"),
  defaultAiTone: text("default_ai_tone"),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Posts/Content
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  businessProfileId: uuid("business_profile_id").references(() => businessProfiles.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").default("draft"), // draft, published, scheduled
  platform: text("platform"), // facebook, twitter, linkedin, etc
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at"),
  mediaUrls: json("media_urls"),
  hashtags: text("hashtags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics
export const analytics = pgTable("analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id),
  userId: uuid("user_id").references(() => users.id),
  platform: text("platform"),
  metrics: json("metrics"), // likes, shares, comments, reach, etc
  collectedAt: timestamp("collected_at").defaultNow(),
});

// Calendar events
export const calendarEvents = pgTable("calendar_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  businessProfileId: uuid("business_profile_id").references(() => businessProfiles.id),
  title: text("title").notNull(),
  description: text("description"),
  startDatetime: timestamp("start_datetime").notNull(),
  endDatetime: timestamp("end_datetime").notNull(),
  allDay: boolean("all_day").default(false),
  location: text("location"),
  eventType: text("event_type"),
  attendees: json("attendees"),
  isRecurring: boolean("is_recurring").default(false),
  recurrenceRule: json("recurrence_rule"),
  status: text("status").default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog posts
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  author: text("author"),
  category: text("category"),
  tags: text("tags").array(),
  featuredImage: text("featured_image"),
  metaDescription: text("meta_description"),
  published: boolean("published").default(false),
  featured: boolean("featured").default(false),
  scheduledPublishAt: timestamp("scheduled_publish_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Competitor data
export const competitorData = pgTable("competitor_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  competitorName: text("competitor_name").notNull(),
  website: text("website"),
  industry: text("industry"),
  socialProfiles: json("social_profiles"),
  businessModel: text("business_model"),
  targetAudience: json("target_audience"),
  lastAnalyzed: timestamp("last_analyzed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Competitive analysis results
export const competitiveAnalysisResults = pgTable("competitive_analysis_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  businessProfileId: uuid("business_profile_id").references(() => businessProfiles.id),
  competitorId: uuid("competitor_id").references(() => competitorData.id),
  analysisType: text("analysis_type").notNull(), // content_gap, sentiment, strategy, etc
  analysisResults: json("analysis_results").notNull(),
  confidenceScore: numeric("confidence_score"),
  status: text("status").default("completed"),
  processingTimeMs: integer("processing_time_ms"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content ideas
export const contentIdeas = pgTable("content_ideas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  businessProfileId: uuid("business_profile_id").references(() => businessProfiles.id),
  title: text("title").notNull(),
  description: text("description"),
  ideaType: text("idea_type"), // text, sketch, voice, seo
  sourceData: json("source_data"),
  platforms: text("platforms").array(),
  aiInsights: json("ai_insights"),
  status: text("status").default("pending"), // pending, approved, rejected, generated
  priority: text("priority").default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content generation requests
export const contentGenerationRequests = pgTable("content_generation_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  businessProfileId: uuid("business_profile_id").references(() => businessProfiles.id),
  contentIdeaId: uuid("content_idea_id").references(() => contentIdeas.id),
  platform: text("platform").notNull(),
  tone: text("tone"),
  targetAudience: text("target_audience"),
  additionalContext: text("additional_context"),
  generatedContent: json("generated_content"),
  status: text("status").default("pending"), // pending, generating, completed, failed
  processingTimeMs: integer("processing_time_ms"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export const insertBusinessProfileSchema = createInsertSchema(businessProfiles).pick({
  businessName: true,
  industry: true,
  website: true,
  logoUrl: true,
  brandColors: true,
  defaultAiTone: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  title: true,
  content: true,
  platform: true,
  scheduledFor: true,
  mediaUrls: true,
  hashtags: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).pick({
  title: true,
  description: true,
  startDatetime: true,
  endDatetime: true,
  allDay: true,
  location: true,
  eventType: true,
  attendees: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  content: true,
  excerpt: true,
  author: true,
  category: true,
  tags: true,
  featuredImage: true,
  metaDescription: true,
  published: true,
});

export const insertContentIdeaSchema = createInsertSchema(contentIdeas).pick({
  title: true,
  description: true,
  ideaType: true,
  sourceData: true,
  platforms: true,
  priority: true,
});

export const insertContentGenerationRequestSchema = createInsertSchema(contentGenerationRequests).pick({
  contentIdeaId: true,
  platform: true,
  tone: true,
  targetAudience: true,
  additionalContext: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type ContentIdea = typeof contentIdeas.$inferSelect;
export type InsertContentIdea = z.infer<typeof insertContentIdeaSchema>;

export type ContentGenerationRequest = typeof contentGenerationRequests.$inferSelect;
export type InsertContentGenerationRequest = z.infer<typeof insertContentGenerationRequestSchema>;
