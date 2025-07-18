import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthPage from "@/components/auth/AuthPage";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import CommonQuestions from "./pages/CommonQuestions";
import Dashboard from "./pages/Dashboard";
import { CreateContent } from "./pages/CreateContent";
import Competitors from "./pages/Competitors";
import Templates from "./pages/Templates";
import Posts from "./pages/Posts";
import SocialMedia from "./pages/SocialMedia";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
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
import BusinessQuestionnaire from "./components/questionnaire/BusinessQuestionnaire";
import Discover from "./pages/Discover";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/common-questions" element={<CommonQuestions />} />
              <Route path="/australian-setup-service" element={<AustralianSetupService />} />
              <Route path="/australian-services" element={<AustralianServices />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/auth" element={<AuthPage />} />
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
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="create" element={<CreateContent />} />
                <Route path="posts" element={<Posts />} />
                <Route path="competitors" element={<Competitors />} />
                <Route path="templates" element={<Templates />} />
                <Route path="social" element={<SocialMedia />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="business-settings" element={<BusinessSettings />} />
                <Route path="cross-business" element={<CrossBusinessFeatures />} />
                <Route path="blog-admin" element={<BlogAdmin />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="prompts" element={<PromptsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
