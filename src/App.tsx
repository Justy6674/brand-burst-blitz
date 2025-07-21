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
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';

// DEPLOYMENT VERSION: 25-JUL-2025-15:30 - PLATFORM SHOWCASE READY

// Lazy load only existing pages
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
const HealthcareBlogEmbed = lazy(() => import('./pages/HealthcareBlogEmbed'));
const BusinessQuestionnaire = lazy(() => import('./components/questionnaire/BusinessQuestionnaire'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const NotFound = lazy(() => import('./pages/NotFound'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));

// Public pages
const Pricing = lazy(() => import('./pages/Pricing'));
const Features = lazy(() => import('./pages/Features'));
const CommonQuestions = lazy(() => import('./pages/CommonQuestions'));
const AllServices = lazy(() => import('./pages/AllServices'));
const AustralianServices = lazy(() => import('./pages/AustralianServices'));
const AustralianSetupService = lazy(() => import('./pages/AustralianSetupService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

const queryClient = new QueryClient();

// SEO Component for dynamic meta tags
const SEOHead = () => {
  const location = useLocation();
  
  useEffect(() => {
    const titles: { [key: string]: string } = {
      '/': 'Australian Healthcare Marketing Platform | AHPRA Compliant',
      '/pricing': 'Pricing - Healthcare Marketing Platform',
      '/features': 'Features - AHPRA Compliant Marketing Tools',
      '/blog': 'Healthcare Marketing Blog - Patient Education Content',
      '/common-questions': 'FAQ - Healthcare Marketing Questions',
      '/services': 'Healthcare Marketing Services - Australia'
    };

    const title = titles[location.pathname] || 'Australian Healthcare Marketing Platform';
    document.title = title;

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

                        {/* Members Routes */}
                        <Route path="/dashboard" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>}>
                            <Dashboard />
                          </Suspense>
                        } />
                        <Route path="/create-content" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading content creation...</div>}>
                            <CreateContent />
                          </Suspense>
                        } />
                        <Route path="/discover" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading discover...</div>}>
                            <Discover />
                          </Suspense>
                        } />

                        {/* Auth Routes */}
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

                        <Route path="*" element={
                          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                            <NotFound />
                          </Suspense>
                        } />
                      </Routes>
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
