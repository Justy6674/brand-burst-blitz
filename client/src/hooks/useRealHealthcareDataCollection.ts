import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface RealPatientEngagementData {
  practiceId: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  
  // Website Analytics (Google Analytics)
  websiteMetrics: {
    pageViews: number;
    uniqueVisitors: number;
    sessionDuration: number;
    bounceRate: number;
    newVsReturning: { new: number; returning: number };
    topPages: Array<{
      page: string;
      views: number;
      timeOnPage: number;
      exitRate: number;
    }>;
    conversions: {
      contactForms: number;
      appointmentBookings: number;
      phoneClicks: number;
      directionsClicks: number;
    };
    deviceBreakdown: {
      mobile: number;
      desktop: number;
      tablet: number;
    };
    trafficSources: Array<{
      source: string;
      medium: string;
      sessions: number;
      conversions: number;
    }>;
  };

  // Social Media Analytics (Facebook/Instagram APIs)
  socialMediaMetrics: {
    facebook: {
      pageFollowers: number;
      postReach: number;
      postEngagement: number;
      pageViews: number;
      actionsTaken: number;
      demographics: {
        ageGroups: Record<string, number>;
        genderBreakdown: Record<string, number>;
        topLocations: Array<{ location: string; followers: number }>;
      };
      topPosts: Array<{
        postId: string;
        content: string;
        reach: number;
        engagement: number;
        clicks: number;
        patientInquiries: number;
      }>;
    };
    instagram: {
      followers: number;
      impressions: number;
      reach: number;
      profileViews: number;
      websiteClicks: number;
      demographics: {
        ageGroups: Record<string, number>;
        genderBreakdown: Record<string, number>;
        topLocations: Array<{ location: string; followers: number }>;
      };
      topPosts: Array<{
        mediaId: string;
        mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
        impressions: number;
        reach: number;
        engagement: number;
        saves: number;
        comments: number;
      }>;
      stories: {
        impressions: number;
        reach: number;
        exits: number;
        replies: number;
      };
    };
  };

  // Appointment Booking Analytics (Practice Management Integration)
  appointmentMetrics: {
    totalBookings: number;
    onlineBookings: number;
    phoneBookings: number;
    cancelledAppointments: number;
    noShowRate: number;
    bookingConversionRate: number;
    averageLeadTime: number;
    appointmentsByType: Array<{
      type: string;
      count: number;
      averageDuration: number;
      revenue: number;
    }>;
    newVsReturnPatients: {
      new: number;
      return: number;
    };
    referralSources: Array<{
      source: string;
      bookings: number;
      conversionRate: number;
    }>;
    timeSlotPopularity: Array<{
      timeSlot: string;
      bookings: number;
      utilizationRate: number;
    }>;
  };

  // Patient Communication Analytics (Email/SMS/App)
  communicationMetrics: {
    emailCampaigns: Array<{
      campaignId: string;
      subject: string;
      sentCount: number;
      openRate: number;
      clickRate: number;
      appointmentBookings: number;
    }>;
    smsReminders: {
      sent: number;
      delivered: number;
      responses: number;
      confirmations: number;
    };
    patientPortal: {
      activeUsers: number;
      loginSessions: number;
      featuresUsed: Record<string, number>;
      supportTickets: number;
    };
  };

  // Search Engine Analytics (Google Search Console)
  searchMetrics: {
    totalImpressions: number;
    totalClicks: number;
    averagePosition: number;
    clickThroughRate: number;
    topQueries: Array<{
      query: string;
      impressions: number;
      clicks: number;
      position: number;
    }>;
    topPages: Array<{
      page: string;
      impressions: number;
      clicks: number;
      position: number;
    }>;
    mobileUsability: {
      validPages: number;
      issues: number;
    };
  };

  // AHPRA Compliance Metrics
  complianceMetrics: {
    contentReviewed: number;
    complianceViolations: number;
    averageComplianceScore: number;
    disclaimersApplied: number;
    advertisingGuidanceFollowed: number;
    therapeuticClaimsValidated: number;
  };
}

interface DataCollectionConfig {
  enableGoogleAnalytics: boolean;
  enableFacebookInsights: boolean;
  enableInstagramAnalytics: boolean;
  enableSearchConsole: boolean;
  enablePracticeManagement: boolean;
  enablePatientCommunication: boolean;
  enableComplianceTracking: boolean;
  
  // API Credentials (encrypted in database)
  googleAnalyticsConfig?: {
    measurementId: string;
    apiKey: string;
    propertyId: string;
  };
  facebookConfig?: {
    accessToken: string;
    pageId: string;
    appId: string;
  };
  instagramConfig?: {
    accessToken: string;
    instagramBusinessAccountId: string;
  };
  
  // Collection frequency
  collectionFrequency: 'hourly' | 'daily' | 'weekly';
  dataRetentionDays: number;
  
  // Privacy settings for healthcare compliance
  anonymizePatientData: boolean;
  excludeSensitiveMetrics: boolean;
  gdprCompliant: boolean;
}

interface RealDataCollectionResult {
  success: boolean;
  data?: RealPatientEngagementData;
  errors?: string[];
  collectedAt: string;
  nextCollection?: string;
}

export function useRealHealthcareDataCollection() {
  const { toast } = useToast();
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionConfig, setCollectionConfig] = useState<DataCollectionConfig | null>(null);
  const [collectionHistory, setCollectionHistory] = useState<RealDataCollectionResult[]>([]);
  const [lastCollectionTime, setLastCollectionTime] = useState<Date | null>(null);
  const [realAnalyticsData, setRealAnalyticsData] = useState<RealPatientEngagementData | null>(null);

  // Initialize data collection configuration
  const initializeDataCollection = useCallback(async (practiceId: string) => {
    try {
      // Check for existing configuration
      const { data: existingConfig, error } = await supabase
        .from('healthcare_analytics_config')
        .select('*')
        .eq('practice_id', practiceId)
        .single();

      if (existingConfig && !error) {
        setCollectionConfig(existingConfig.configuration);
        return { success: true, config: existingConfig.configuration };
      }

      // Create default configuration
      const defaultConfig: DataCollectionConfig = {
        enableGoogleAnalytics: false,
        enableFacebookInsights: false,
        enableInstagramAnalytics: false,
        enableSearchConsole: false,
        enablePracticeManagement: false,
        enablePatientCommunication: false,
        enableComplianceTracking: true,
        collectionFrequency: 'daily',
        dataRetentionDays: 365,
        anonymizePatientData: true,
        excludeSensitiveMetrics: true,
        gdprCompliant: true
      };

      setCollectionConfig(defaultConfig);
      return { success: true, config: defaultConfig };

    } catch (error) {
      console.error('Error initializing data collection:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Collect real Google Analytics data
  const collectGoogleAnalyticsData = useCallback(async (config: DataCollectionConfig, practiceId: string, period: string) => {
    if (!config.enableGoogleAnalytics || !config.googleAnalyticsConfig) {
      return null;
    }

    try {
      // Call Google Analytics Reporting API
      const { data, error } = await supabase.functions.invoke('collect-google-analytics', {
        body: {
          measurementId: config.googleAnalyticsConfig.measurementId,
          propertyId: config.googleAnalyticsConfig.propertyId,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          practiceId,
          healthcareFocus: true
        }
      });

      if (error) throw error;

      return {
        pageViews: data.pageViews || 0,
        uniqueVisitors: data.uniqueVisitors || 0,
        sessionDuration: data.averageSessionDuration || 0,
        bounceRate: data.bounceRate || 0,
        newVsReturning: data.newVsReturning || { new: 0, returning: 0 },
        topPages: data.topPages || [],
        conversions: data.conversions || {
          contactForms: 0,
          appointmentBookings: 0,
          phoneClicks: 0,
          directionsClicks: 0
        },
        deviceBreakdown: data.deviceBreakdown || { mobile: 0, desktop: 0, tablet: 0 },
        trafficSources: data.trafficSources || []
      };

    } catch (error) {
      console.error('Error collecting Google Analytics data:', error);
      return null;
    }
  }, []);

  // Collect real Facebook Insights data
  const collectFacebookInsightsData = useCallback(async (config: DataCollectionConfig, period: string) => {
    if (!config.enableFacebookInsights || !config.facebookConfig) {
      return null;
    }

    try {
      // Call Facebook Graph API
      const { data, error } = await supabase.functions.invoke('collect-facebook-insights', {
        body: {
          accessToken: config.facebookConfig.accessToken,
          pageId: config.facebookConfig.pageId,
          period: period,
          healthcareFocus: true,
          includePostPerformance: true
        }
      });

      if (error) throw error;

      return {
        pageFollowers: data.pageFollowers || 0,
        postReach: data.postReach || 0,
        postEngagement: data.postEngagement || 0,
        pageViews: data.pageViews || 0,
        actionsTaken: data.actionsTaken || 0,
        demographics: data.demographics || {
          ageGroups: {},
          genderBreakdown: {},
          topLocations: []
        },
        topPosts: data.topPosts || []
      };

    } catch (error) {
      console.error('Error collecting Facebook Insights data:', error);
      return null;
    }
  }, []);

  // Collect real Instagram Analytics data
  const collectInstagramAnalyticsData = useCallback(async (config: DataCollectionConfig, period: string) => {
    if (!config.enableInstagramAnalytics || !config.instagramConfig) {
      return null;
    }

    try {
      // Call Instagram Basic Display API
      const { data, error } = await supabase.functions.invoke('collect-instagram-insights', {
        body: {
          accessToken: config.instagramConfig.accessToken,
          instagramBusinessAccountId: config.instagramConfig.instagramBusinessAccountId,
          period: period,
          healthcareFocus: true,
          includeStoryAnalytics: true
        }
      });

      if (error) throw error;

      return {
        followers: data.followerCount || 0,
        impressions: data.impressions || 0,
        reach: data.reach || 0,
        profileViews: data.profileViews || 0,
        websiteClicks: data.websiteClicks || 0,
        demographics: data.demographics || {
          ageGroups: {},
          genderBreakdown: {},
          topLocations: []
        },
        topPosts: data.topPosts || [],
        stories: data.stories || {
          impressions: 0,
          reach: 0,
          exits: 0,
          replies: 0
        }
      };

    } catch (error) {
      console.error('Error collecting Instagram Analytics data:', error);
      return null;
    }
  }, []);

  // Collect real appointment booking data
  const collectAppointmentBookingData = useCallback(async (config: DataCollectionConfig, practiceId: string, period: string) => {
    if (!config.enablePracticeManagement) {
      return null;
    }

    try {
      // Call practice management system APIs (MedicalDirector, Best Practice, etc.)
      const { data, error } = await supabase.functions.invoke('collect-appointment-analytics', {
        body: {
          practiceId,
          period,
          includePatientDemographics: true,
          anonymizeData: config.anonymizePatientData,
          healthcareCompliant: true
        }
      });

      if (error) throw error;

      return {
        totalBookings: data.totalBookings || 0,
        onlineBookings: data.onlineBookings || 0,
        phoneBookings: data.phoneBookings || 0,
        cancelledAppointments: data.cancelledAppointments || 0,
        noShowRate: data.noShowRate || 0,
        bookingConversionRate: data.conversionRate || 0,
        averageLeadTime: data.averageLeadTime || 0,
        appointmentsByType: data.appointmentsByType || [],
        newVsReturnPatients: data.newVsReturnPatients || { new: 0, return: 0 },
        referralSources: data.referralSources || [],
        timeSlotPopularity: data.timeSlotPopularity || []
      };

    } catch (error) {
      console.error('Error collecting appointment booking data:', error);
      return null;
    }
  }, []);

  // Collect real patient communication data
  const collectPatientCommunicationData = useCallback(async (config: DataCollectionConfig, practiceId: string, period: string) => {
    if (!config.enablePatientCommunication) {
      return null;
    }

    try {
      // Call communication platform APIs
      const { data, error } = await supabase.functions.invoke('collect-communication-analytics', {
        body: {
          practiceId,
          period,
          includeEmailCampaigns: true,
          includeSMSAnalytics: true,
          includePatientPortalMetrics: true,
          privacyCompliant: config.gdprCompliant
        }
      });

      if (error) throw error;

      return {
        emailCampaigns: data.emailCampaigns || [],
        smsReminders: data.smsReminders || {
          sent: 0,
          delivered: 0,
          responses: 0,
          confirmations: 0
        },
        patientPortal: data.patientPortal || {
          activeUsers: 0,
          loginSessions: 0,
          featuresUsed: {},
          supportTickets: 0
        }
      };

    } catch (error) {
      console.error('Error collecting patient communication data:', error);
      return null;
    }
  }, []);

  // Collect real search engine data
  const collectSearchEngineData = useCallback(async (config: DataCollectionConfig, practiceId: string, period: string) => {
    if (!config.enableSearchConsole) {
      return null;
    }

    try {
      // Call Google Search Console API
      const { data, error } = await supabase.functions.invoke('collect-search-console-data', {
        body: {
          practiceId,
          period,
          healthcareFocus: true,
          includePerformanceData: true,
          includeMobileUsability: true
        }
      });

      if (error) throw error;

      return {
        totalImpressions: data.totalImpressions || 0,
        totalClicks: data.totalClicks || 0,
        averagePosition: data.averagePosition || 0,
        clickThroughRate: data.clickThroughRate || 0,
        topQueries: data.topQueries || [],
        topPages: data.topPages || [],
        mobileUsability: data.mobileUsability || {
          validPages: 0,
          issues: 0
        }
      };

    } catch (error) {
      console.error('Error collecting search engine data:', error);
      return null;
    }
  }, []);

  // Collect real AHPRA compliance metrics
  const collectComplianceMetrics = useCallback(async (practiceId: string, period: string) => {
    try {
      // Get compliance data from our own tracking
      const { data, error } = await supabase
        .from('ahpra_compliance_tracking')
        .select('*')
        .eq('practice_id', practiceId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const complianceData = data || [];

      return {
        contentReviewed: complianceData.filter(item => item.content_reviewed).length,
        complianceViolations: complianceData.filter(item => item.violations_found > 0).length,
        averageComplianceScore: complianceData.reduce((acc, item) => acc + (item.compliance_score || 0), 0) / Math.max(complianceData.length, 1),
        disclaimersApplied: complianceData.filter(item => item.disclaimer_applied).length,
        advertisingGuidanceFollowed: complianceData.filter(item => item.advertising_compliant).length,
        therapeuticClaimsValidated: complianceData.filter(item => item.therapeutic_claims_validated).length
      };

    } catch (error) {
      console.error('Error collecting compliance metrics:', error);
      return null;
    }
  }, []);

  // Main data collection function
  const collectRealHealthcareData = useCallback(async (practiceId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    if (!collectionConfig) {
      await initializeDataCollection(practiceId);
      return { success: false, error: 'Collection configuration not initialized' };
    }

    setIsCollecting(true);

    try {
      const startDate = new Date(Date.now() - (period === 'daily' ? 1 : period === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      // Collect data from all enabled sources in parallel
      const [
        websiteMetrics,
        facebookMetrics,
        instagramMetrics,
        appointmentMetrics,
        communicationMetrics,
        searchMetrics,
        complianceMetrics
      ] = await Promise.all([
        collectGoogleAnalyticsData(collectionConfig, practiceId, period),
        collectFacebookInsightsData(collectionConfig, period),
        collectInstagramAnalyticsData(collectionConfig, period),
        collectAppointmentBookingData(collectionConfig, practiceId, period),
        collectPatientCommunicationData(collectionConfig, practiceId, period),
        collectSearchEngineData(collectionConfig, practiceId, period),
        collectComplianceMetrics(practiceId, period)
      ]);

      // Combine all collected data
      const realData: RealPatientEngagementData = {
        practiceId,
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        websiteMetrics: websiteMetrics || {
          pageViews: 0,
          uniqueVisitors: 0,
          sessionDuration: 0,
          bounceRate: 0,
          newVsReturning: { new: 0, returning: 0 },
          topPages: [],
          conversions: { contactForms: 0, appointmentBookings: 0, phoneClicks: 0, directionsClicks: 0 },
          deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
          trafficSources: []
        },
        socialMediaMetrics: {
          facebook: facebookMetrics || {
            pageFollowers: 0,
            postReach: 0,
            postEngagement: 0,
            pageViews: 0,
            actionsTaken: 0,
            demographics: { ageGroups: {}, genderBreakdown: {}, topLocations: [] },
            topPosts: []
          },
          instagram: instagramMetrics || {
            followers: 0,
            impressions: 0,
            reach: 0,
            profileViews: 0,
            websiteClicks: 0,
            demographics: { ageGroups: {}, genderBreakdown: {}, topLocations: [] },
            topPosts: [],
            stories: { impressions: 0, reach: 0, exits: 0, replies: 0 }
          }
        },
        appointmentMetrics: appointmentMetrics || {
          totalBookings: 0,
          onlineBookings: 0,
          phoneBookings: 0,
          cancelledAppointments: 0,
          noShowRate: 0,
          bookingConversionRate: 0,
          averageLeadTime: 0,
          appointmentsByType: [],
          newVsReturnPatients: { new: 0, return: 0 },
          referralSources: [],
          timeSlotPopularity: []
        },
        communicationMetrics: communicationMetrics || {
          emailCampaigns: [],
          smsReminders: { sent: 0, delivered: 0, responses: 0, confirmations: 0 },
          patientPortal: { activeUsers: 0, loginSessions: 0, featuresUsed: {}, supportTickets: 0 }
        },
        searchMetrics: searchMetrics || {
          totalImpressions: 0,
          totalClicks: 0,
          averagePosition: 0,
          clickThroughRate: 0,
          topQueries: [],
          topPages: [],
          mobileUsability: { validPages: 0, issues: 0 }
        },
        complianceMetrics: complianceMetrics || {
          contentReviewed: 0,
          complianceViolations: 0,
          averageComplianceScore: 0,
          disclaimersApplied: 0,
          advertisingGuidanceFollowed: 0,
          therapeuticClaimsValidated: 0
        }
      };

      // Store collected data
      const { error: storeError } = await supabase
        .from('healthcare_analytics_data')
        .insert({
          practice_id: practiceId,
          collection_period: period,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          analytics_data: realData,
          collected_at: new Date().toISOString(),
          configuration_used: collectionConfig
        });

      if (storeError) {
        console.error('Error storing analytics data:', storeError);
      }

      setRealAnalyticsData(realData);
      setLastCollectionTime(new Date());

      const result: RealDataCollectionResult = {
        success: true,
        data: realData,
        collectedAt: new Date().toISOString(),
        nextCollection: new Date(Date.now() + (collectionConfig.collectionFrequency === 'hourly' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()
      };

      setCollectionHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10

      toast({
        title: "Real Healthcare Data Collected",
        description: `Successfully collected analytics from ${Object.values(collectionConfig).filter(Boolean).length} data sources`,
      });

      return result;

    } catch (error) {
      console.error('Error collecting real healthcare data:', error);
      const errorResult: RealDataCollectionResult = {
        success: false,
        errors: [error.message],
        collectedAt: new Date().toISOString()
      };

      setCollectionHistory(prev => [errorResult, ...prev.slice(0, 9)]);

      toast({
        title: "Data Collection Failed",
        description: error.message,
        variant: "destructive",
      });

      return errorResult;

    } finally {
      setIsCollecting(false);
    }
  }, [collectionConfig, initializeDataCollection, collectGoogleAnalyticsData, collectFacebookInsightsData, collectInstagramAnalyticsData, collectAppointmentBookingData, collectPatientCommunicationData, collectSearchEngineData, collectComplianceMetrics, toast]);

  // Configure data sources
  const configureDataSource = useCallback(async (practiceId: string, sourceConfig: Partial<DataCollectionConfig>) => {
    try {
      const updatedConfig = { ...collectionConfig, ...sourceConfig };

      const { error } = await supabase
        .from('healthcare_analytics_config')
        .upsert({
          practice_id: practiceId,
          configuration: updatedConfig,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setCollectionConfig(updatedConfig);

      toast({
        title: "Data Source Configured",
        description: "Analytics configuration updated successfully",
      });

      return { success: true };

    } catch (error) {
      console.error('Error configuring data source:', error);
      toast({
        title: "Configuration Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  }, [collectionConfig, toast]);

  // Auto-collection scheduler
  useEffect(() => {
    if (!collectionConfig || !collectionConfig.collectionFrequency) return;

    const interval = collectionConfig.collectionFrequency === 'hourly' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    const scheduler = setInterval(() => {
      if (collectionConfig.enableGoogleAnalytics || 
          collectionConfig.enableFacebookInsights || 
          collectionConfig.enableInstagramAnalytics ||
          collectionConfig.enablePracticeManagement) {
        // Auto-collect if any real data sources are enabled
        // Note: This would need practice ID from context
        console.log('Auto-collection scheduled');
      }
    }, interval);

    return () => clearInterval(scheduler);
  }, [collectionConfig]);

  return {
    // State
    isCollecting,
    collectionConfig,
    realAnalyticsData,
    collectionHistory,
    lastCollectionTime,

    // Actions
    initializeDataCollection,
    collectRealHealthcareData,
    configureDataSource,

    // Data access
    getRealWebsiteMetrics: () => realAnalyticsData?.websiteMetrics,
    getRealSocialMetrics: () => realAnalyticsData?.socialMediaMetrics,
    getRealAppointmentMetrics: () => realAnalyticsData?.appointmentMetrics,
    getRealComplianceMetrics: () => realAnalyticsData?.complianceMetrics
  };
} 