import { useState, useEffect, useCallback } from 'react';
import { useHealthcareAuth } from './useHealthcareAuth';
import { useToast } from './use-toast';

// Major Australian Practice Management Systems
interface PracticeManagementSystem {
  id: string;
  name: string;
  provider: string;
  logo: string;
  description: string;
  market_share: number;
  integration_complexity: 'simple' | 'moderate' | 'complex';
  supported_features: string[];
  api_available: boolean;
  webhook_support: boolean;
  data_sync_capabilities: string[];
  compliance_features: string[];
  pricing_model: string;
  australian_focus: boolean;
}

interface IntegrationStatus {
  system_id: string;
  status: 'connected' | 'pending' | 'failed' | 'not_configured';
  last_sync: string | null;
  sync_frequency: 'real-time' | 'hourly' | 'daily' | 'manual';
  data_types_synced: string[];
  errors: string[];
  patient_count?: number;
  appointment_count?: number;
  last_error?: string;
}

interface PatientData {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other' | 'not_specified';
  phone?: string;
  email?: string;
  address?: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  medicare_number?: string;
  private_health_fund?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medical_alerts?: string[];
  last_visit?: string;
  next_appointment?: string;
  consent_preferences: {
    marketing_emails: boolean;
    sms_reminders: boolean;
    educational_content: boolean;
    surveys: boolean;
  };
}

interface AppointmentData {
  id: string;
  patient_id: string;
  practitioner_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: string;
  status: 'scheduled' | 'confirmed' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  location: string;
  notes?: string;
  billing_code?: string;
  follow_up_required?: boolean;
  patient_education_provided?: boolean;
  content_recommendations?: string[];
}

interface ContentSyncData {
  content_id: string;
  patient_ids: string[];
  content_type: 'educational_material' | 'appointment_reminder' | 'follow_up_care' | 'health_tips';
  delivery_method: 'email' | 'sms' | 'patient_portal' | 'print';
  scheduled_date?: string;
  tracking_enabled: boolean;
  compliance_approved: boolean;
}

// Mock Australian practice management systems
const practiceManagementSystems: PracticeManagementSystem[] = [
  {
    id: 'best_practice',
    name: 'Best Practice',
    provider: 'Best Practice Software',
    logo: 'best-practice-logo.png',
    description: 'Leading Australian practice management software for medical practices',
    market_share: 35,
    integration_complexity: 'moderate',
    supported_features: [
      'Patient Management',
      'Appointment Scheduling',
      'Billing & Medicare',
      'Clinical Notes',
      'Prescriptions',
      'Recalls & Reminders',
      'Reporting'
    ],
    api_available: true,
    webhook_support: true,
    data_sync_capabilities: [
      'Patient Demographics',
      'Appointment History',
      'Visit Summaries',
      'Communication Preferences'
    ],
    compliance_features: [
      'Privacy Act compliance',
      'My Health Record integration',
      'RACGP standards',
      'Medicare compliance'
    ],
    pricing_model: 'Per practitioner monthly',
    australian_focus: true
  },
  {
    id: 'medical_director',
    name: 'Medical Director',
    provider: 'CliniStrat',
    logo: 'medical-director-logo.png',
    description: 'Comprehensive practice management for Australian healthcare providers',
    market_share: 28,
    integration_complexity: 'complex',
    supported_features: [
      'Electronic Health Records',
      'Practice Management',
      'Clinical Decision Support',
      'Document Management',
      'Pathology Integration',
      'Imaging Integration',
      'Telehealth'
    ],
    api_available: true,
    webhook_support: false,
    data_sync_capabilities: [
      'Comprehensive Patient Records',
      'Clinical Data',
      'Medication History',
      'Diagnostic Results'
    ],
    compliance_features: [
      'TGA compliance',
      'PBS integration',
      'My Health Record',
      'SNOMED CT coding'
    ],
    pricing_model: 'Enterprise licensing',
    australian_focus: true
  },
  {
    id: 'genie_solutions',
    name: 'Genie Solutions',
    provider: 'Genie Solutions',
    logo: 'genie-solutions-logo.png',
    description: 'Cloud-based practice management for modern Australian practices',
    market_share: 18,
    integration_complexity: 'simple',
    supported_features: [
      'Cloud-based Access',
      'Patient Portal',
      'Online Bookings',
      'Digital Forms',
      'Automated Reminders',
      'Financial Reporting',
      'Staff Management'
    ],
    api_available: true,
    webhook_support: true,
    data_sync_capabilities: [
      'Patient Contact Details',
      'Appointment Schedules',
      'Communication History',
      'Billing Information'
    ],
    compliance_features: [
      'Australian Privacy Laws',
      'Secure data hosting',
      'Audit trails',
      'Access controls'
    ],
    pricing_model: 'Monthly subscription',
    australian_focus: true
  },
  {
    id: 'zedmed',
    name: 'ZedMed',
    provider: 'ZedMed',
    logo: 'zedmed-logo.png',
    description: 'User-friendly practice management for Australian medical practices',
    market_share: 12,
    integration_complexity: 'simple',
    supported_features: [
      'Patient Records',
      'Appointment Booking',
      'Billing',
      'Recalls',
      'Reports',
      'Document Scanning',
      'Online Services'
    ],
    api_available: true,
    webhook_support: true,
    data_sync_capabilities: [
      'Basic Patient Data',
      'Appointment Information',
      'Contact Preferences'
    ],
    compliance_features: [
      'Privacy compliance',
      'Secure communications',
      'Data encryption'
    ],
    pricing_model: 'Per doctor monthly',
    australian_focus: true
  },
  {
    id: 'pracsoft',
    name: 'PracSoft',
    provider: 'PracSoft',
    logo: 'pracsoft-logo.png',
    description: 'Established practice management solution for Australian healthcare',
    market_share: 7,
    integration_complexity: 'moderate',
    supported_features: [
      'Patient Management',
      'Appointments',
      'Billing',
      'Clinical Records',
      'Pathology Links',
      'Medicare Online',
      'Backup Services'
    ],
    api_available: false,
    webhook_support: false,
    data_sync_capabilities: [
      'Patient Demographics',
      'Appointment Data'
    ],
    compliance_features: [
      'Medicare standards',
      'Privacy compliance'
    ],
    pricing_model: 'One-time purchase + support',
    australian_focus: true
  }
];

export const usePracticeManagementIntegration = () => {
  const { user } = useHealthcareAuth();
  const { toast } = useToast();

  const [systems] = useState<PracticeManagementSystem[]>(practiceManagementSystems);
  const [integrationStatuses, setIntegrationStatuses] = useState<IntegrationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<PracticeManagementSystem | null>(null);
  const [connectionData, setConnectionData] = useState<Record<string, any>>({});

  // Connect to a practice management system
  const connectSystem = useCallback(async (systemId: string, credentials: Record<string, string>) => {
    setIsLoading(true);
    try {
      const system = systems.find(s => s.id === systemId);
      if (!system) throw new Error('System not found');

      // Simulate API connection process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock successful connection
      const newStatus: IntegrationStatus = {
        system_id: systemId,
        status: 'connected',
        last_sync: new Date().toISOString(),
        sync_frequency: 'daily',
        data_types_synced: system.data_sync_capabilities,
        errors: [],
        patient_count: Math.floor(Math.random() * 1000) + 100,
        appointment_count: Math.floor(Math.random() * 500) + 50
      };

      setIntegrationStatuses(prev => {
        const filtered = prev.filter(status => status.system_id !== systemId);
        return [...filtered, newStatus];
      });

      setConnectionData(prev => ({
        ...prev,
        [systemId]: {
          connected_at: new Date().toISOString(),
          credentials_valid: true,
          last_test: new Date().toISOString()
        }
      }));

      toast({
        title: "Integration Successful",
        description: `Successfully connected to ${system.name}. Data sync will begin shortly.`,
      });

      return { success: true, status: newStatus };
    } catch (error: any) {
      const errorStatus: IntegrationStatus = {
        system_id: systemId,
        status: 'failed',
        last_sync: null,
        sync_frequency: 'manual',
        data_types_synced: [],
        errors: [error.message],
        last_error: error.message
      };

      setIntegrationStatuses(prev => {
        const filtered = prev.filter(status => status.system_id !== systemId);
        return [...filtered, errorStatus];
      });

      toast({
        title: "Integration Failed",
        description: error.message,
        variant: "destructive"
      });

      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [systems, toast]);

  // Disconnect from a practice management system
  const disconnectSystem = useCallback(async (systemId: string) => {
    try {
      const system = systems.find(s => s.id === systemId);
      if (!system) throw new Error('System not found');

      setIntegrationStatuses(prev => prev.filter(status => status.system_id !== systemId));
      
      setConnectionData(prev => {
        const newData = { ...prev };
        delete newData[systemId];
        return newData;
      });

      toast({
        title: "Integration Disconnected",
        description: `Successfully disconnected from ${system.name}.`,
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Disconnection Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  }, [systems, toast]);

  // Sync data from connected practice management system
  const syncData = useCallback(async (systemId: string, dataTypes: string[] = []) => {
    setIsLoading(true);
    try {
      const system = systems.find(s => s.id === systemId);
      const status = integrationStatuses.find(s => s.system_id === systemId);
      
      if (!system || !status || status.status !== 'connected') {
        throw new Error('System not connected');
      }

      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update sync status
      setIntegrationStatuses(prev => prev.map(s => 
        s.system_id === systemId 
          ? { ...s, last_sync: new Date().toISOString(), errors: [] }
          : s
      ));

      toast({
        title: "Data Sync Complete",
        description: `Successfully synced data from ${system.name}.`,
      });

      return { 
        success: true, 
        synced_records: {
          patients: Math.floor(Math.random() * 100) + 10,
          appointments: Math.floor(Math.random() * 50) + 5
        }
      };
    } catch (error: any) {
      setIntegrationStatuses(prev => prev.map(s => 
        s.system_id === systemId 
          ? { ...s, errors: [...s.errors, error.message], last_error: error.message }
          : s
      ));

      toast({
        title: "Data Sync Failed",
        description: error.message,
        variant: "destructive"
      });

      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [systems, integrationStatuses, toast]);

  // Send content to practice management system
  const syncContentToPractice = useCallback(async (
    systemId: string, 
    contentData: ContentSyncData
  ) => {
    try {
      const system = systems.find(s => s.id === systemId);
      const status = integrationStatuses.find(s => s.system_id === systemId);
      
      if (!system || !status || status.status !== 'connected') {
        throw new Error('System not connected');
      }

      if (!contentData.compliance_approved) {
        throw new Error('Content must be AHPRA compliance approved before syncing');
      }

      // Simulate content sync to practice system
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Content Synced",
        description: `Successfully sent content to ${contentData.patient_ids.length} patients via ${system.name}.`,
      });

      return { 
        success: true, 
        sync_id: `sync_${Date.now()}`,
        patients_notified: contentData.patient_ids.length
      };
    } catch (error: any) {
      toast({
        title: "Content Sync Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  }, [systems, integrationStatuses, toast]);

  // Get integration recommendations based on practice type
  const getIntegrationRecommendations = useCallback(() => {
    if (!user) return [];

    const recommendations = [];

    // Recommend based on practice type and profession
    if (user.practice_type === 'solo') {
      recommendations.push({
        system_id: 'genie_solutions',
        reason: 'Best suited for solo practices with simple setup and cloud access',
        priority: 'high'
      });
      recommendations.push({
        system_id: 'zedmed',
        reason: 'User-friendly interface ideal for smaller practices',
        priority: 'medium'
      });
    } else if (user.practice_type === 'group') {
      recommendations.push({
        system_id: 'best_practice',
        reason: 'Most popular choice for group practices in Australia',
        priority: 'high'
      });
      recommendations.push({
        system_id: 'medical_director',
        reason: 'Comprehensive features for multi-practitioner environments',
        priority: 'medium'
      });
    } else if (user.practice_type === 'network') {
      recommendations.push({
        system_id: 'medical_director',
        reason: 'Enterprise-grade solution for healthcare networks',
        priority: 'high'
      });
      recommendations.push({
        system_id: 'best_practice',
        reason: 'Scalable solution with strong Australian market presence',
        priority: 'medium'
      });
    }

    // Special recommendations for specific professions
    if (user.profession_type === 'psychology') {
      recommendations.push({
        system_id: 'genie_solutions',
        reason: 'Strong patient portal features beneficial for mental health practices',
        priority: 'medium'
      });
    }

    return recommendations;
  }, [user]);

  // Test connection to practice management system
  const testConnection = useCallback(async (systemId: string) => {
    setIsLoading(true);
    try {
      const system = systems.find(s => s.id === systemId);
      if (!system) throw new Error('System not found');

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Connection Test Successful",
        description: `Successfully connected to ${system.name} API.`,
      });

      return { success: true, latency: Math.floor(Math.random() * 200) + 50 };
    } catch (error: any) {
      toast({
        title: "Connection Test Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [systems, toast]);

  // Get connected systems
  const getConnectedSystems = useCallback(() => {
    return integrationStatuses
      .filter(status => status.status === 'connected')
      .map(status => {
        const system = systems.find(s => s.id === status.system_id);
        return { ...status, system };
      });
  }, [integrationStatuses, systems]);

  // Get integration status for a specific system
  const getIntegrationStatus = useCallback((systemId: string) => {
    return integrationStatuses.find(status => status.system_id === systemId) || null;
  }, [integrationStatuses]);

  // Initialize with mock data for demonstration
  useEffect(() => {
    if (user && integrationStatuses.length === 0) {
      // Mock some existing integrations for demo
      const mockStatuses: IntegrationStatus[] = [
        {
          system_id: 'best_practice',
          status: 'connected',
          last_sync: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          sync_frequency: 'daily',
          data_types_synced: ['Patient Demographics', 'Appointment History'],
          errors: [],
          patient_count: 847,
          appointment_count: 156
        }
      ];
      setIntegrationStatuses(mockStatuses);
    }
  }, [user, integrationStatuses.length]);

  return {
    systems,
    integrationStatuses,
    selectedSystem,
    connectionData,
    isLoading,
    connectSystem,
    disconnectSystem,
    syncData,
    syncContentToPractice,
    testConnection,
    getIntegrationRecommendations,
    getConnectedSystems,
    getIntegrationStatus,
    setSelectedSystem
  };
}; 