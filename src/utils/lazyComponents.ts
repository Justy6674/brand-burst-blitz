import { lazy } from 'react';

// Loading component for lazy loaded routes
export const PageLoader = ({ page }: { page: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground">Loading {page}...</p>
    </div>
  </div>
);

// Lazy load all major pages for code splitting
export const LazyPages = {
  // Public pages
  Index: lazy(() => import('@/pages/Index')),
  Features: lazy(() => import('@/pages/Features')),
  Pricing: lazy(() => import('@/pages/Pricing')),
  AllServices: lazy(() => import('@/pages/AllServices')),
  CommonQuestions: lazy(() => import('@/pages/CommonQuestions')),
  PrivacyPolicy: lazy(() => import('@/pages/PrivacyPolicy')),
  
  // Australian specific pages
  AustralianServices: lazy(() => import('@/pages/AustralianServices')),
  AustralianSetupService: lazy(() => import('@/pages/AustralianSetupService')),
  
  // App pages - high priority
  Dashboard: lazy(() => import('@/pages/Dashboard')),
  Onboarding: lazy(() => import('@/pages/Onboarding')),
  
  // Core features - medium priority
  Blog: lazy(() => import('@/pages/Blog').then(module => ({ default: module.Blog }))),
  BlogPage: lazy(() => import('@/pages/BlogPage')),
  BlogAdmin: lazy(() => import('@/pages/BlogAdmin')),
  Calendar: lazy(() => import('@/pages/Calendar')),
  SocialMedia: lazy(() => import('@/pages/SocialMedia')),
  SocialSetup: lazy(() => import('@/pages/SocialSetup')),
  
  // Analytics and insights
  Analytics: lazy(() => import('@/pages/Analytics')),
  
  // Content creation
  CreateContent: lazy(() => import('@/pages/CreateContent').then(module => ({ default: module.CreateContent }))),
  Templates: lazy(() => import('@/pages/Templates')),
  Posts: lazy(() => import('@/pages/Posts')),
  
  // Business tools
  Competitors: lazy(() => import('@/pages/Competitors')),
  BusinessSettings: lazy(() => import('@/pages/BusinessSettings')),
  Discover: lazy(() => import('@/pages/Discover')),
  Diary: lazy(() => import('@/pages/Diary')),
  CrossBusinessFeatures: lazy(() => import('@/pages/CrossBusinessFeatures')),
  
  // Admin and advanced features - low priority
  AdminPanel: lazy(() => import('@/pages/AdminPanel')),
  SystemHealth: lazy(() => import('@/pages/SystemHealth')),
  PublishingPipeline: lazy(() => import('@/pages/PublishingPipeline')),
  PromptsPage: lazy(() => import('@/pages/PromptsPage')),
  
  // Auth and utility
  OAuthCallback: lazy(() => import('@/pages/OAuthCallback')),
  NotFound: lazy(() => import('@/pages/NotFound')),
};

// Lazy load heavy components
export const LazyComponents = {
  // Blog components
  BlogPost: lazy(() => import('@/components/blog/BlogPost')),
  EmbeddableBlog: lazy(() => import('@/components/blog/EmbeddableBlog').then(module => ({ default: module.EmbeddableBlog }))),
  BlogEmbedWizard: lazy(() => import('@/components/blog/BlogEmbedWizard').then(module => ({ default: module.BlogEmbedWizard }))),
  
  // Content studio
  ComprehensiveContentStudio: lazy(() => import('@/components/studio/ComprehensiveContentStudio').then(module => ({ default: module.ComprehensiveContentStudio }))),
  
  // Healthcare specific
  HealthcareBlogEmbed: lazy(() => import('@/pages/HealthcareBlogEmbed').then(module => ({ default: module.HealthcareBlogEmbed }))),
  HealthcareValidationDashboard: lazy(() => import('@/components/validation/HealthcareValidationDashboard').then(module => ({ default: module.HealthcareValidationDashboard }))),
  HealthcareCopyPasteWorkflow: lazy(() => import('@/components/social/HealthcareCopyPasteWorkflow').then(module => ({ default: module.HealthcareCopyPasteWorkflow }))),
  
  // Complex dashboards and analytics
  AdvancedAnalyticsDashboard: lazy(() => import('@/components/analytics/AdvancedAnalyticsDashboard')),
  CompetitorIntelligence: lazy(() => import('@/components/intelligence/CompetitorIntelligence')),
  UnifiedGoogleAppleCalendar: lazy(() => import('@/components/calendar/UnifiedGoogleAppleCalendar')),
  SmartContentCreationWizard: lazy(() => import('@/components/social/SmartContentCreationWizard')),
  UnifiedComplianceEngine: lazy(() => import('@/components/compliance/UnifiedComplianceEngine')),
  AHPRAComplianceDashboard: lazy(() => import('@/components/compliance/AHPRAComplianceDashboard').then(module => ({ default: module.AHPRAComplianceDashboard }))),
  
  // Business tools
  BusinessQuestionnaire: lazy(() => import('@/components/questionnaire/BusinessQuestionnaire')),
  RealAustralianServicesValidator: lazy(() => import('@/components/business/RealAustralianServicesValidator').then(module => ({ default: module.RealAustralianServicesValidator }))),
  
  // Media and content
  ImageEditor: lazy(() => import('@/components/media/ImageEditor')),
  LogoOverlayTool: lazy(() => import('@/components/media/LogoOverlayTool')),
};

// Pre-load critical components after initial load
export const preloadCriticalComponents = () => {
  // Pre-load dashboard and core features after initial render
  setTimeout(() => {
    LazyPages.Dashboard;
    LazyPages.Blog;
    LazyPages.Calendar;
    LazyPages.SocialMedia;
    LazyPages.Analytics;
  }, 1000);
};

// Preload components based on user behavior
export const preloadOnUserInteraction = (route: string) => {
  const preloadMap: { [key: string]: (() => void)[] } = {
    '/dashboard': [
      () => LazyPages.Calendar,
      () => LazyPages.Analytics,
      () => LazyComponents.AdvancedAnalyticsDashboard,
    ],
    '/blog': [
      () => LazyPages.BlogAdmin,
      () => LazyComponents.BlogEmbedWizard,
      () => LazyComponents.EmbeddableBlog,
    ],
    '/calendar': [
      () => LazyComponents.UnifiedGoogleAppleCalendar,
    ],
    '/social': [
      () => LazyPages.SocialSetup,
      () => LazyComponents.SmartContentCreationWizard,
      () => LazyComponents.HealthcareCopyPasteWorkflow,
    ],
    '/create': [
      () => LazyPages.Templates,
      () => LazyComponents.ComprehensiveContentStudio,
    ],
    '/analytics': [
      () => LazyComponents.AdvancedAnalyticsDashboard,
      () => LazyComponents.CompetitorIntelligence,
    ],
    '/competitors': [
      () => LazyComponents.CompetitorIntelligence,
    ],
  };

  const preloaders = preloadMap[route];
  if (preloaders) {
    // Delay preloading to not interfere with current page load
    setTimeout(() => {
      preloaders.forEach(preload => preload());
    }, 500);
  }
}; 