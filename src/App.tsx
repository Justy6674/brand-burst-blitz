import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { EmailConfirmationGuard } from "@/components/auth/EmailConfirmationGuard";
import AuthPage from "@/components/auth/AuthPage";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import CommonQuestions from "./pages/CommonQuestions";
import Dashboard from "./pages/Dashboard";
import { CreateContent } from "./pages/CreateContent";
import { Blog } from "./pages/Blog";
import Competitors from "./pages/Competitors";
import Templates from "./pages/Templates";
import Posts from "./pages/Posts";
import SocialMedia from "./pages/SocialMedia";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Diary from "./pages/Diary";
import BusinessSettings from "./pages/BusinessSettings";
import CrossBusinessFeatures from "./pages/CrossBusinessFeatures";
import AdminPanel from "./pages/AdminPanel";
import PromptsPage from "./pages/PromptsPage";
import NotFound from "./pages/NotFound";
import BlogPage from "./pages/BlogPage";
import BlogAdmin from "./pages/BlogAdmin";
import BlogPost from "./components/blog/BlogPost";
import AustralianSetupService from "./pages/AustralianSetupService";
import AustralianServices from "./pages/AustralianServices";
import AllServices from "./pages/AllServices";
import BusinessQuestionnaire from "./components/questionnaire/BusinessQuestionnaire";
import Discover from "./pages/Discover";
import Onboarding from "./pages/Onboarding";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { EmbeddableBlog } from './components/blog/EmbeddableBlog';
import { BlogEmbedWizard } from './components/blog/BlogEmbedWizard';
import { ComprehensiveContentStudio } from './components/studio/ComprehensiveContentStudio';
import { HealthcareBlogEmbed } from './pages/HealthcareBlogEmbed';
import OAuthCallback from './pages/OAuthCallback';
import PublishingPipelinePage from './pages/PublishingPipeline';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <UserProfileProvider>
          <ErrorBoundary>
          <Toaster />
          <Sonner />
          <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/all-services" element={<AllServices />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/common-questions" element={<CommonQuestions />} />
              <Route path="/australian-setup-service" element={<AustralianSetupService />} />
              <Route path="/australian-services" element={<AustralianServices />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/embed/blog" element={<EmbeddableBlog />} />
              <Route path="/auth" element={
                <ProtectedRoute requireAuth={false}>
                  <AuthPage />
                </ProtectedRoute>
              } />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route path="/questionnaire" element={
                <ProtectedRoute>
                  <BusinessQuestionnaire />
                </ProtectedRoute>
              } />
              <Route path="/questionnaire-required" element={
                <ProtectedRoute>
                  <BusinessQuestionnaire />
                </ProtectedRoute>
              } />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <EmailConfirmationGuard>
                    <AppLayout />
                  </EmailConfirmationGuard>
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="create" element={<CreateContent />} />
                <Route path="posts" element={<Posts />} />
                <Route path="competitors" element={<Competitors />} />
                <Route path="templates" element={<Templates />} />
                <Route path="social" element={<SocialMedia />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="diary" element={<Diary />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="business-settings" element={<BusinessSettings />} />
                <Route path="cross-business" element={<CrossBusinessFeatures />} />
                <Route path="blog-admin" element={<BlogAdmin />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="prompts" element={<PromptsPage />} />
                <Route path="content-studio" element={<ComprehensiveContentStudio />} />
                <Route path="blog-embed" element={<HealthcareBlogEmbed />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </UserProfileProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
