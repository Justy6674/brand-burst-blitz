import { Suspense, lazy, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import { BusinessProfileProvider } from '@/contexts/BusinessProfileContext';
import { BusinessThemeProvider } from '@/contexts/BusinessThemeContext';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';
import { PerformanceMonitor } from '@/components/monitoring/PerformanceMonitor';

// DEPLOYMENT VERSION: 25-JUL-2025-14:30 - MEMBERS APP EMBED READY

// Lazy load components for better performance - ONLY EXISTING PAGES
const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateContent = lazy(() => import('./pages/CreateContent'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Analytics = lazy(() => import('./pages/Analytics'));
const SocialMedia = lazy(() => import('./pages/SocialMedia'));
const Templates = lazy(() => import('./pages/Templates'));
const Competitors = lazy(() => import('./pages/Competitors'));
const BlogPage = lazy(() => import('./pages/Blog'));
const Discover = lazy(() => import('./pages/Discover'));
const PromptsPage = lazy(() => import('./pages/PromptsPage'));
const BusinessSettings = lazy(() => import('./pages/BusinessSettings'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const PublishingPipeline = lazy(() => import('./pages/PublishingPipeline'));
const Diary = lazy(() => import('./pages/Diary'));
const Posts = lazy(() => import('./pages/Posts'));
const CrossBusinessFeatures = lazy(() => import('./pages/CrossBusinessFeatures'));
const BusinessQuestionnaire = lazy(() => import('./components/questionnaire/BusinessQuestionnaire'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const NotFound = lazy(() => import('./pages/NotFound'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
const EmbeddableBlog = lazy(() => import('./pages/EmbeddableBlog'));

// Public pages (for SEO and before login)
const Pricing = lazy(() => import('./pages/Pricing'));
const Features = lazy(() => import('./pages/Features'));
const CommonQuestions = lazy(() => import('./pages/CommonQuestions'));
const AllServices = lazy(() => import('./pages/AllServices'));
const AustralianServices = lazy(() => import('./pages/AustralianServices'));
const AustralianSetupService = lazy(() => import('./pages/AustralianSetupService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

const queryClient = new QueryClient();

// SEO Component for dynamic meta tags
const SEOHead = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Dynamic title and meta based on route
    const titles: { [key: string]: string } = {
      '/': 'Australian Healthcare Marketing Platform | AHPRA Compliant',
      '/pricing': 'Pricing - Healthcare Marketing Platform',
      '/features': 'Features - AHPRA Compliant Marketing Tools',
      '/blog': 'Healthcare Marketing Blog - Patient Education Content',
      '/common-questions': 'FAQ - Healthcare Marketing Questions',
      '/services': 'Healthcare Marketing Services - Australia',
      '/dashboard': 'Dashboard - Healthcare Practice Management',
      '/create-content': 'Content Creation - AHPRA Compliant Content',
      '/calendar': 'Smart Calendar - Healthcare Practice Management',
      '/analytics': 'Analytics - Healthcare Practice Performance'
    };

    const title = titles[location.pathname] || 'Australian Healthcare Marketing Platform';
    document.title = title;

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://brand-burst-blitz.lovableproject.com${location.pathname}`);

  }, [location]);

  return null;
};

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SEOHead />
            <AuthProvider>
              <UserProfileProvider>
                <BusinessProfileProvider>
                  <BusinessThemeProvider>
                    {/* Maintain header and UI style throughout */}
                    <div className="min-h-screen bg-background font-sans antialiased">
                      <Routes>
                        {/* Public Routes - SEO Optimized */}
                        <Route path="/" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <Index />
                          </Suspense>
                        } />
                        <Route path="/pricing" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <Pricing />
                          </Suspense>
                        } />
                        <Route path="/features" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <Features />
                          </Suspense>
                        } />
                        <Route path="/faq" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <CommonQuestions />
                          </Suspense>
                        } />
                        <Route path="/questions" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <CommonQuestions />
                          </Suspense>
                        } />
                        <Route path="/common-questions" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <CommonQuestions />
                          </Suspense>
                        } />
                        <Route path="/blog" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <BlogPage />
                          </Suspense>
                        } />
                        <Route path="/blog-public" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <BlogPage />
                          </Suspense>
                        } />
                        <Route path="/blog/:slug" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <BlogPost />
                          </Suspense>
                        } />
                        <Route path="/services" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <AllServices />
                          </Suspense>
                        } />
                        <Route path="/all-services" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <AllServices />
                          </Suspense>
                        } />
                        <Route path="/australian-services" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <AustralianServices />
                          </Suspense>
                        } />
                        <Route path="/australian-setup-service" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <AustralianSetupService />
                          </Suspense>
                        } />
                        <Route path="/privacy" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <PrivacyPolicy />
                          </Suspense>
                        } />
                        <Route path="/publishing" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <PublishingPipeline />
                          </Suspense>
                        } />

                        {/* Members App Routes - Protected with AppLayout (maintains header/UI) */}
                        <Route path="/dashboard" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading dashboard...</div>}>
                              <Dashboard />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/create-content" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading content creation...</div>}>
                              <CreateContent />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/calendar" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading calendar...</div>}>
                              <Calendar />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/analytics" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading analytics...</div>}>
                              <Analytics />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/social-media" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading social media...</div>}>
                              <SocialMedia />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/templates" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading templates...</div>}>
                              <Templates />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/competitors" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading competitors...</div>}>
                              <Competitors />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/blog-admin" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading blog...</div>}>
                              <BlogPage />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/discover" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading discover...</div>}>
                              <Discover />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/prompts" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading prompts...</div>}>
                              <PromptsPage />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/business-settings" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading settings...</div>}>
                              <BusinessSettings />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/admin" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading admin...</div>}>
                              <AdminPanel />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/publishing-pipeline" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading publishing...</div>}>
                              <PublishingPipeline />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/diary" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading diary...</div>}>
                              <Diary />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/posts" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading posts...</div>}>
                              <Posts />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/cross-business" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading cross-business...</div>}>
                              <CrossBusinessFeatures />
                            </Suspense>
                          </AppLayout>
                        } />
                        <Route path="/healthcare-blog-embed" element={
                          <AppLayout>
                            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading blog embed...</div>}>
                              <HealthcareBlogEmbed />
                            </Suspense>
                          </AppLayout>
                        } />

                        {/* Onboarding & Auth Routes */}
                        <Route path="/questionnaire" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading questionnaire...</div>}>
                            <BusinessQuestionnaire />
                          </Suspense>
                        } />
                        <Route path="/onboarding" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading onboarding...</div>}>
                            <Onboarding />
                          </Suspense>
                        } />
                        <Route path="/auth/callback" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Processing authentication...</div>}>
                            <OAuthCallback />
                          </Suspense>
                        } />

                        {/* Embeddable Components */}
                        <Route path="/embed/blog" element={
                          <Suspense fallback={<div className="flex items-center justify-center p-4">Loading blog...</div>}>
                            <EmbeddableBlog />
                          </Suspense>
                        } />

                        {/* 404 */}
                        <Route path="*" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <NotFound />
                          </Suspense>
                        } />
                      </Routes>

                      {/* Performance Monitoring for Members App */}
                      <PerformanceMonitor />
                    </div>
                  </BusinessThemeProvider>
                </BusinessProfileProvider>
              </UserProfileProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
