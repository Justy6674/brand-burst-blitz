import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { GlobalErrorBoundary } from "@/components/error/GlobalErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { EmailConfirmationGuard } from "@/components/auth/EmailConfirmationGuard";
import AuthPage from "@/components/auth/AuthPage";
import AppLayout from "@/components/layout/AppLayout";
import { BusinessProfileProvider } from '@/contexts/BusinessProfileContext';
import { BusinessThemeProvider } from '@/contexts/BusinessThemeContext';
import Index from "@/pages/Index";
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { LoadingSpinner } from "@/components/ui/loading";

// Loading component for lazy loaded routes
const PageLoader = ({ page }: { page: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground">Loading {page}...</p>
    </div>
  </div>
);

// DEPLOYMENT VERSION: 22-JUL-2025-00:45 - VERCEL BUILD FIX

// Lazy load all major components to reduce initial bundle size
const CreateContent = lazy(() => import("./pages/CreateContent").then(module => ({ default: module.CreateContent })));
const Blog = lazy(() => import("./pages/Blog").then(module => ({ default: module.Blog })));
const Competitors = lazy(() => import("./pages/Competitors"));
const Templates = lazy(() => import("./pages/Templates"));
const Posts = lazy(() => import("./pages/Posts"));
const SocialMedia = lazy(() => import("./pages/SocialMedia"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Diary = lazy(() => import("./pages/Diary"));
const BusinessSettings = lazy(() => import("./pages/BusinessSettings"));
const CrossBusinessFeatures = lazy(() => import("./pages/CrossBusinessFeatures"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const PromptsPage = lazy(() => import("./pages/PromptsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogAdmin = lazy(() => import("./pages/BlogAdmin"));
const AustralianSetupService = lazy(() => import("./pages/AustralianSetupService"));
const AustralianServices = lazy(() => import("./pages/AustralianServices"));
const AllServices = lazy(() => import("./pages/AllServices"));
const Discover = lazy(() => import("./pages/Discover"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
const PublishingPipelinePage = lazy(() => import('./pages/PublishingPipeline'));
const BusinessQuestionnaire = lazy(() => import("./components/questionnaire/BusinessQuestionnaire"));
const PublicBlog = lazy(() => import("./pages/PublicBlog").then(module => ({ default: module.PublicBlog })));

// MISSING PUBLIC PAGES - CRITICAL FIX
const Pricing = lazy(() => import("./pages/Pricing"));
const Features = lazy(() => import("./pages/Features"));
const CommonQuestions = lazy(() => import("./pages/CommonQuestions"));

// Lazy load complex components
const BlogPost = lazy(() => import("./components/blog/BlogPost"));
const EmbeddableBlog = lazy(() => import('./components/blog/EmbeddableBlog').then(module => ({ default: module.EmbeddableBlog })));
const BlogEmbedWizard = lazy(() => import('./components/blog/BlogEmbedWizard').then(module => ({ default: module.BlogEmbedWizard })));
const ComprehensiveContentStudio = lazy(() => import('./components/studio/ComprehensiveContentStudio').then(module => ({ default: module.ComprehensiveContentStudio })));
const HealthcareBlogEmbed = lazy(() => import('./pages/HealthcareBlogEmbed').then(module => ({ default: module.HealthcareBlogEmbed })));
const HealthcareValidationDashboard = lazy(() => import('./components/validation/HealthcareValidationDashboard').then(module => ({ default: module.HealthcareValidationDashboard })));
const HealthcareCopyPasteWorkflow = lazy(() => import('./components/social/HealthcareCopyPasteWorkflow').then(module => ({ default: module.HealthcareCopyPasteWorkflow })));

const queryClient = new QueryClient();

// High-order component for lazy loading with error boundary
const withLazyLoading = (Component: React.LazyExoticComponent<React.ComponentType<any>>, pageName: string) => {
  return (props: any) => (
    <Suspense fallback={<PageLoader page={pageName} />}>
      <Component {...props} />
    </Suspense>
  );
};

// Create lazy loaded components with error boundaries
const LazyCreateContent = withLazyLoading(CreateContent, 'Content Creator');
const LazyBlog = withLazyLoading(Blog, 'Blog Manager');
const LazyCompetitors = withLazyLoading(Competitors, 'Competitors');
const LazyTemplates = withLazyLoading(Templates, 'Templates');
const LazyPosts = withLazyLoading(Posts, 'Posts');
const LazySocialMedia = withLazyLoading(SocialMedia, 'Social Media');
const LazyCalendar = withLazyLoading(Calendar, 'Calendar');
const LazyAnalytics = withLazyLoading(Analytics, 'Analytics');
const LazyDiary = withLazyLoading(Diary, 'Diary');
const LazyBusinessSettings = withLazyLoading(BusinessSettings, 'Settings');
const LazyCrossBusinessFeatures = withLazyLoading(CrossBusinessFeatures, 'Business Features');
const LazyAdminPanel = withLazyLoading(AdminPanel, 'Admin Panel');
const LazyPromptsPage = withLazyLoading(PromptsPage, 'Prompts');
const LazyBlogPage = withLazyLoading(BlogPage, 'Blog');
const LazyBlogAdmin = withLazyLoading(BlogAdmin, 'Blog Admin');
const LazyAustralianSetupService = withLazyLoading(AustralianSetupService, 'Setup Service');
const LazyAustralianServices = withLazyLoading(AustralianServices, 'Australian Services');
const LazyAllServices = withLazyLoading(AllServices, 'All Services');
const LazyDiscover = withLazyLoading(Discover, 'Discover');
const LazyOnboarding = withLazyLoading(Onboarding, 'Onboarding');
const LazyPrivacyPolicy = withLazyLoading(PrivacyPolicy, 'Privacy Policy');
const LazyOAuthCallback = withLazyLoading(OAuthCallback, 'Authentication');
const LazyPublishingPipelinePage = withLazyLoading(PublishingPipelinePage, 'Publishing');
const LazyNotFound = withLazyLoading(NotFound, '404');
const LazyHealthcareValidationDashboard = withLazyLoading(HealthcareValidationDashboard, 'Healthcare Validation Dashboard');
const LazyComprehensiveContentStudio = withLazyLoading(ComprehensiveContentStudio, 'Comprehensive Content Studio');
const LazyHealthcareCopyPasteWorkflow = withLazyLoading(HealthcareCopyPasteWorkflow, 'Healthcare Copy Paste Workflow');
const LazyHealthcareBlogEmbed = withLazyLoading(HealthcareBlogEmbed, 'Healthcare Blog Embed');
const LazyBlogPost = withLazyLoading(BlogPost, 'Blog Post');
const LazyEmbeddableBlog = withLazyLoading(EmbeddableBlog, 'Embeddable Blog');
const LazyBusinessQuestionnaire = withLazyLoading(BusinessQuestionnaire, 'Business Questionnaire');

// MISSING PUBLIC PAGE COMPONENTS - CRITICAL FIX
const LazyPricing = withLazyLoading(Pricing, 'Pricing');
const LazyFeatures = withLazyLoading(Features, 'Features');
const LazyCommonQuestions = withLazyLoading(CommonQuestions, 'FAQ');
const LazyPublicBlog = withLazyLoading(PublicBlog, 'Blog');

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GlobalErrorBoundary>
          <AuthProvider>
            <UserProfileProvider>
              <BusinessProfileProvider>
                <BusinessThemeProvider>
                  <AuthErrorBoundary>
                    <Routes>
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/oauth/callback" element={<LazyOAuthCallback />} />
                      
                      {/* PUBLIC HEALTHCARE LANDING PAGE */}
                      <Route path="/" element={<Index />} />
                      
                      {/* PUBLIC PAGES - CRITICAL MISSING ROUTES */}
                      <Route path="/pricing" element={<LazyPricing />} />
                      <Route path="/features" element={<LazyFeatures />} />
                      <Route path="/faq" element={<LazyCommonQuestions />} />
                      <Route path="/questions" element={<LazyCommonQuestions />} />
                      <Route path="/common-questions" element={<LazyCommonQuestions />} />
                      
                      {/* PUBLIC BLOG PAGES - NO LOGIN REQUIRED */}
                      <Route path="/blog-post/:id" element={<LazyBlogPost />} />
                      <Route path="/embeddable-blog" element={<LazyEmbeddableBlog />} />
                      <Route path="/blog-public" element={<LazyBlogPage />} />
                      
                      {/* PUBLIC SERVICES */}
                      <Route path="/australian-setup-service" element={<LazyAustralianSetupService />} />
                      <Route path="/australian-services" element={<LazyAustralianServices />} />
                      <Route path="/services" element={<LazyAllServices />} />
                      <Route path="/all-services" element={<LazyAllServices />} />
                      <Route path="/privacy" element={<LazyPrivacyPolicy />} />
                      <Route path="/publishing" element={<LazyPublishingPipelinePage />} />
                      
                      {/* PROTECTED MEMBERS DASHBOARD */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyDiscover />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/analytics" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyAnalytics />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/onboarding" element={
                        <ProtectedRoute>
                          <LazyOnboarding />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/questionnaire" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <LazyBusinessQuestionnaire />
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/create-content" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyCreateContent />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/calendar" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyCalendar />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/diary" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyDiary />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/social-media" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazySocialMedia />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      {/* PUBLIC BLOG ROUTE - NO LOGIN REQUIRED */}
                      <Route path="/blog" element={<LazyPublicBlog />} />
                      
                      {/* PROTECTED BLOG MANAGER FOR AUTHENTICATED USERS */}
                      <Route path="/blog-manager/*" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyBlog />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/templates" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyTemplates />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/prompts" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyPromptsPage />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/competitors" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyCompetitors />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyBusinessSettings />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/admin" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <LazyAdminPanel />
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/cross-business-features" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyCrossBusinessFeatures />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/healthcare-validation-dashboard" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyHealthcareValidationDashboard />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/comprehensive-content-studio" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyComprehensiveContentStudio />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/healthcare-copy-paste-workflow" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyHealthcareCopyPasteWorkflow />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/healthcare-blog-embed" element={
                        <ProtectedRoute>
                          <EmailConfirmationGuard>
                            <AppLayout>
                              <LazyHealthcareBlogEmbed />
                            </AppLayout>
                          </EmailConfirmationGuard>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="*" element={<LazyNotFound />} />
                    </Routes>
                    <Toaster />
                    <Sonner />
                  </AuthErrorBoundary>
                </BusinessThemeProvider>
              </BusinessProfileProvider>
            </UserProfileProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
