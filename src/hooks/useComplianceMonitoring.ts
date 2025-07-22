import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from './useErrorHandler';

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  industry: string;
  regulation: string; // GDPR, CCPA, HIPAA, etc.
  rule_type: 'content_scanning' | 'data_handling' | 'user_consent' | 'retention_policy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  auto_enforce: boolean;
  patterns: string[];
  actions: ComplianceAction[];
  created_at: string;
  updated_at: string;
}

interface ComplianceAction {
  type: 'block' | 'warn' | 'flag' | 'require_approval';
  message: string;
  notify_admin: boolean;
}

interface ComplianceViolation {
  id: string;
  rule_id: string;
  content_id?: string;
  user_id: string;
  violation_type: string;
  severity: string;
  description: string;
  auto_resolved: boolean;
  resolution_notes?: string;
  detected_at: string;
  resolved_at?: string;
}

interface ComplianceReport {
  period: string;
  total_scans: number;
  violations_detected: number;
  violations_resolved: number;
  compliance_score: number;
  high_risk_areas: string[];
  recommendations: string[];
}

export const useComplianceMonitoring = () => {
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { handleAsyncError } = useErrorHandler();

  const loadComplianceRules = useCallback(async (industry?: string) => {
    return handleAsyncError(async () => {
      setIsLoading(true);
      
      // Mock compliance rules based on industry
      const mockRules: ComplianceRule[] = [
        {
          id: '1',
          name: 'GDPR Personal Data Detection',
          description: 'Scans content for personal data that requires GDPR compliance',
          industry: 'all',
          regulation: 'GDPR',
          rule_type: 'content_scanning',
          severity: 'high',
          auto_enforce: true,
          patterns: [
            'email addresses',
            'phone numbers',
            'IP addresses',
            'social security numbers'
          ],
          actions: [
            {
              type: 'flag',
              message: 'Content contains personal data - GDPR compliance required',
              notify_admin: true
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'HIPAA Health Information Protection',
          description: 'Ensures health information is properly protected',
          industry: 'health',
          regulation: 'HIPAA',
          rule_type: 'content_scanning',
          severity: 'critical',
          auto_enforce: true,
          patterns: [
            'medical records',
            'patient names',
            'diagnosis information',
            'treatment plans'
          ],
          actions: [
            {
              type: 'block',
              message: 'Content blocked - Contains protected health information',
              notify_admin: true
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Financial Data Protection',
          description: 'Protects sensitive financial information',
          industry: 'finance',
          regulation: 'SOX',
          rule_type: 'content_scanning',
          severity: 'high',
          auto_enforce: true,
          patterns: [
            'account numbers',
            'credit card information',
            'financial statements',
            'insider information'
          ],
          actions: [
            {
              type: 'require_approval',
              message: 'Financial content requires compliance review',
              notify_admin: true
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const filteredRules = industry 
        ? mockRules.filter(rule => rule.industry === industry || rule.industry === 'all')
        : mockRules;

      setRules(filteredRules);
      return filteredRules;
    }, {
      function_name: 'loadComplianceRules',
      user_message: 'Failed to load compliance rules'
    }).finally(() => {
      setIsLoading(false);
    });
  }, [handleAsyncError]);

  const scanContent = useCallback(async (content: string, contentType: string = 'post'): Promise<{
    compliant: boolean;
    violations: string[];
    warnings: string[];
    blocked: boolean;
  }> => {
    return handleAsyncError(async () => {
      const violations: string[] = [];
      const warnings: string[] = [];
      let blocked = false;

      // Simple pattern matching for demonstration
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const phoneRegex = /\b\d{3}-\d{3}-\d{4}\b/g;
      const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;

      if (emailRegex.test(content)) {
        warnings.push('Email address detected - ensure GDPR compliance');
      }
      
      if (phoneRegex.test(content)) {
        warnings.push('Phone number detected - verify consent for collection');
      }
      
      if (ssnRegex.test(content)) {
        violations.push('Social Security Number detected - content blocked');
        blocked = true;
      }

      // Check for health-related terms
      const healthTerms = ['patient', 'diagnosis', 'treatment', 'medical record', 'prescription'];
      const hasHealthInfo = healthTerms.some(term => 
        content.toLowerCase().includes(term)
      );
      
      if (hasHealthInfo) {
        violations.push('Protected health information detected');
        blocked = true;
      }

      // Log compliance check
      if (violations.length > 0 || warnings.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('compliance_logs').insert({
          user_id: user?.id,
          action: 'content_scan',
          content_preview: content.substring(0, 100),
          compliance_check_results: {
            violations,
            warnings,
            blocked,
            scan_timestamp: new Date().toISOString()
          }
        });
      }

      return {
        compliant: violations.length === 0,
        violations,
        warnings,
        blocked
      };
    }, {
      function_name: 'scanContent',
      user_message: 'Failed to scan content for compliance'
    }) || {
      compliant: true,
      violations: [],
      warnings: [],
      blocked: false
    };
  }, [handleAsyncError]);

  const generateComplianceReport = useCallback(async (startDate: string, endDate: string): Promise<ComplianceReport | null> => {
    return handleAsyncError(async () => {
      // Mock report generation
      const report: ComplianceReport = {
        period: `${startDate} to ${endDate}`,
        total_scans: 1250,
        violations_detected: 23,
        violations_resolved: 20,
        compliance_score: 98.2,
        high_risk_areas: [
          'User-generated content',
          'Email templates',
          'Social media posts'
        ],
        recommendations: [
          'Implement automated PII detection',
          'Update privacy policy templates',
          'Provide additional staff training on data handling'
        ]
      };

      return report;
    }, {
      function_name: 'generateComplianceReport',
      user_message: 'Failed to generate compliance report'
    });
  }, [handleAsyncError]);

  const createComplianceRule = useCallback(async (ruleData: Partial<ComplianceRule>) => {
    return handleAsyncError(async () => {
      const newRule: ComplianceRule = {
        id: Date.now().toString(),
        name: ruleData.name || 'New Rule',
        description: ruleData.description || '',
        industry: ruleData.industry || 'general',
        regulation: ruleData.regulation || 'Custom',
        rule_type: ruleData.rule_type || 'content_scanning',
        severity: ruleData.severity || 'medium',
        auto_enforce: ruleData.auto_enforce || false,
        patterns: ruleData.patterns || [],
        actions: ruleData.actions || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setRules(prev => [...prev, newRule]);
      
      toast({
        title: "Compliance Rule Created",
        description: "New compliance rule has been added"
      });

      return newRule;
    }, {
      function_name: 'createComplianceRule',
      user_message: 'Failed to create compliance rule'
    });
  }, [handleAsyncError, toast]);

  return {
    rules,
    violations,
    isLoading,
    loadComplianceRules,
    scanContent,
    generateComplianceReport,
    createComplianceRule
  };
};