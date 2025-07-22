import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface MedicalDevice {
  id: string;
  device_name: string;
  tga_registration_number?: string;
  classification: 'Class I' | 'Class IIa' | 'Class IIb' | 'Class III' | 'AIMD';
  sponsor_name: string;
  intended_purpose: string;
  therapeutic_claims: string[];
  contraindications: string[];
  adverse_event_reporting: boolean;
  listing_status: 'Listed' | 'Registered' | 'Exempt' | 'Under Review' | 'Cancelled';
  advertising_restrictions: string[];
  created_at: string;
  updated_at: string;
}

interface DevicePromotion {
  id: string;
  user_id: string;
  device_id: string;
  content_type: 'social_post' | 'blog_article' | 'website_content' | 'advertisement' | 'brochure';
  content_text: string;
  content_images: string[];
  target_audience: 'healthcare_professionals' | 'consumers' | 'patients' | 'mixed';
  promotional_claims: string[];
  tga_compliant: boolean;
  compliance_score: number;
  compliance_notes: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'requires_changes';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

interface TGAComplianceCheck {
  isCompliant: boolean;
  violations: string[];
  warnings: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceScore: number; // 0-100
  requiredDisclosures: string[];
  prohibitedClaims: string[];
}

interface TGARule {
  id: string;
  rule_code: string;
  rule_category: 'device_classification' | 'advertising' | 'claims' | 'disclosure' | 'safety';
  rule_description: string;
  applicable_classes: string[];
  severity: 'info' | 'warning' | 'error' | 'critical';
  penalty_score: number;
  rule_conditions: any;
  active: boolean;
}

export const useTGAMedicalDeviceCompliance = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<MedicalDevice[]>([]);
  const [promotions, setPromotions] = useState<DevicePromotion[]>([]);
  const [tgaRules, setTgaRules] = useState<TGARule[]>([]);
  const [currentPromotion, setCurrentPromotion] = useState<DevicePromotion | null>(null);

  // Load TGA-registered medical devices
  const loadMedicalDevices = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tga_medical_devices')
        .select('*')
        .eq('listing_status', 'Listed')
        .order('device_name');

      if (error) throw error;
      setDevices(data || []);

    } catch (error) {
      console.error('Error loading medical devices:', error);
      toast({
        title: "Error Loading Devices",
        description: "Could not load TGA medical devices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load TGA compliance rules
  const loadTGARules = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tga_compliance_rules')
        .select('*')
        .eq('active', true)
        .order('rule_category');

      if (error) throw error;
      setTgaRules(data || []);

    } catch (error) {
      console.error('Error loading TGA rules:', error);
    }
  }, []);

  // Load user's device promotions
  const loadPromotions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tga_device_promotions')
        .select(`
          *,
          tga_medical_devices(device_name, classification, sponsor_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);

    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  }, []);

  // Validate TGA compliance for medical device promotion
  const validateTGACompliance = useCallback((
    promotion: DevicePromotion,
    device: MedicalDevice
  ): TGAComplianceCheck => {
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const requiredDisclosures: string[] = [];
    const prohibitedClaims: string[] = [];
    let riskLevel: TGAComplianceCheck['riskLevel'] = 'low';
    let complianceScore = 100;

    // Device Registration Check
    if (!device.tga_registration_number && device.classification !== 'Class I') {
      violations.push('Device must be TGA registered for Class II/III/AIMD devices');
      riskLevel = 'critical';
      complianceScore -= 50;
    }

    if (device.listing_status !== 'Listed' && device.listing_status !== 'Registered') {
      violations.push(`Device listing status is "${device.listing_status}" - not valid for promotion`);
      riskLevel = 'critical';
      complianceScore -= 40;
    }

    // Classification-Specific Requirements
    switch (device.classification) {
      case 'Class III':
      case 'AIMD':
        // Highest risk devices - strictest requirements
        if (promotion.target_audience === 'consumers') {
          violations.push('Class III/AIMD devices cannot be advertised directly to consumers');
          riskLevel = 'critical';
          complianceScore -= 60;
        }
        
        requiredDisclosures.push('This is a Class III/AIMD medical device requiring specialist consultation');
        requiredDisclosures.push('Serious adverse events must be reported to TGA');
        
        if (!promotion.content_text.toLowerCase().includes('specialist')) {
          warnings.push('Content should reference specialist consultation requirement');
          complianceScore -= 15;
        }
        break;

      case 'Class IIb':
        // High risk devices
        if (promotion.target_audience === 'consumers') {
          warnings.push('Class IIb devices require careful consumer advertising compliance');
          complianceScore -= 10;
        }
        
        requiredDisclosures.push('This is a Class IIb medical device - consult healthcare professional');
        break;

      case 'Class IIa':
        // Medium risk devices
        requiredDisclosures.push('This is a medical device - read instructions before use');
        break;

      case 'Class I':
        // Lower risk devices - fewer restrictions
        if (device.listing_status === 'Exempt') {
          warnings.push('Exempt devices still subject to general advertising requirements');
        }
        break;
    }

    // Therapeutic Claims Validation
    const prohibitedTerms = [
      'cure', 'cures', 'curing',
      'miracle', 'miraculous',
      'guaranteed', 'guarantee',
      'completely safe', 'no side effects',
      'FDA approved' // Wrong regulator for Australia
    ];

    const contentLower = promotion.content_text.toLowerCase();
    prohibitedTerms.forEach(term => {
      if (contentLower.includes(term)) {
        violations.push(`Prohibited claim detected: "${term}"`);
        prohibitedClaims.push(term);
        complianceScore -= 25;
        if (riskLevel !== 'critical') riskLevel = 'high';
      }
    });

    // Claims must be substantiated
    promotion.promotional_claims.forEach(claim => {
      if (!device.therapeutic_claims.some(approved => 
        claim.toLowerCase().includes(approved.toLowerCase()))) {
        violations.push(`Unsubstantiated claim: "${claim}"`);
        complianceScore -= 20;
        if (riskLevel !== 'critical') riskLevel = 'high';
      }
    });

    // Required Disclosures Check
    const requiredPhrases = [
      'medical device',
      'read instructions',
      'consult healthcare professional'
    ];

    if (device.classification !== 'Class I') {
      requiredPhrases.forEach(phrase => {
        if (!contentLower.includes(phrase.toLowerCase())) {
          warnings.push(`Missing recommended disclosure: "${phrase}"`);
          complianceScore -= 10;
        }
      });
    }

    // Sponsor Identification
    if (!contentLower.includes(device.sponsor_name.toLowerCase())) {
      warnings.push('Device sponsor should be identified in promotional material');
      complianceScore -= 5;
    }

    // Contraindications and Warnings
    if (device.contraindications.length > 0) {
      requiredDisclosures.push('See product information for contraindications and warnings');
      
      const hasContraindicationReference = 
        contentLower.includes('contraindication') ||
        contentLower.includes('warnings') ||
        contentLower.includes('precautions');
      
      if (!hasContraindicationReference) {
        warnings.push('Consider referencing contraindications/warnings for this device');
        complianceScore -= 10;
      }
    }

    // Target Audience Appropriateness
    if (promotion.target_audience === 'mixed' && device.classification === 'Class III') {
      violations.push('Class III devices require targeted professional audience only');
      complianceScore -= 30;
      if (riskLevel !== 'critical') riskLevel = 'high';
    }

    // Content Type Specific Requirements
    if (promotion.content_type === 'advertisement') {
      requiredDisclosures.push('TGA medical device advertising compliance');
      
      if (device.classification !== 'Class I') {
        requiredDisclosures.push(`${device.classification} medical device - healthcare professional guidance recommended`);
      }
    }

    // Adverse Event Reporting
    if (device.adverse_event_reporting) {
      requiredDisclosures.push('Report adverse events to TGA and device sponsor');
    }

    // Evidence and Substantiation
    const evidenceClaims = [
      'clinically proven',
      'studies show',
      'research demonstrates',
      'clinical trials'
    ];

    const hasEvidenceClaim = evidenceClaims.some(claim => 
      contentLower.includes(claim.toLowerCase())
    );

    if (hasEvidenceClaim) {
      recommendations.push('Ensure all evidence-based claims are substantiated with appropriate studies');
      recommendations.push('Consider providing references to supporting clinical evidence');
    }

    // Final Risk Assessment
    if (violations.length >= 3) riskLevel = 'critical';
    else if (violations.length >= 2) riskLevel = 'high';
    else if (violations.length >= 1 || warnings.length >= 4) riskLevel = 'medium';

    // Additional recommendations
    recommendations.push('Include TGA registration/listing number where appropriate');
    recommendations.push('Ensure all imagery accurately represents device and outcomes');
    recommendations.push('Consider peer review by regulatory affairs specialist');

    const isCompliant = violations.length === 0 && complianceScore >= 80;

    return {
      isCompliant,
      violations,
      warnings,
      recommendations,
      riskLevel,
      complianceScore: Math.max(0, complianceScore),
      requiredDisclosures,
      prohibitedClaims
    };
  }, []);

  // Search TGA database for medical devices
  const searchTGADevices = useCallback(async (searchTerm: string) => {
    try {
      // In a real implementation, this would query the actual TGA ARTG database
      const { data, error } = await supabase
        .from('tga_medical_devices')
        .select('*')
        .or(`device_name.ilike.%${searchTerm}%,sponsor_name.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error searching TGA devices:', error);
      return [];
    }
  }, []);

  // Create device promotion with compliance checking
  const createDevicePromotion = useCallback(async (
    deviceId: string,
    contentType: DevicePromotion['content_type'],
    contentText: string,
    contentImages: string[],
    targetAudience: DevicePromotion['target_audience'],
    promotionalClaims: string[]
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get device details
      const device = devices.find(d => d.id === deviceId);
      if (!device) throw new Error('Device not found');

      // Create promotion record
      const promotionData = {
        user_id: user.id,
        device_id: deviceId,
        content_type: contentType,
        content_text: contentText,
        content_images: contentImages,
        target_audience: targetAudience,
        promotional_claims: promotionalClaims,
        tga_compliant: false, // Will be set after compliance check
        compliance_score: 0,
        compliance_notes: '',
        approval_status: 'pending' as const
      };

      // Perform compliance check
      const complianceCheck = validateTGACompliance(promotionData as DevicePromotion, device);

      // Update with compliance results
      const finalPromotionData = {
        ...promotionData,
        tga_compliant: complianceCheck.isCompliant,
        compliance_score: complianceCheck.complianceScore,
        compliance_notes: JSON.stringify(complianceCheck)
      };

      const { data, error } = await supabase
        .from('tga_device_promotions')
        .insert(finalPromotionData)
        .select()
        .single();

      if (error) throw error;

      await loadPromotions();

      // Log promotion creation for compliance
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: null,
          performed_by: user.id,
          action: 'TGA device promotion created',
          action_type: 'content',
          details: {
            promotion_id: data.id,
            device_name: device.device_name,
            device_classification: device.classification,
            target_audience: targetAudience,
            compliance_score: complianceCheck.complianceScore,
            risk_level: complianceCheck.riskLevel,
            violations_count: complianceCheck.violations.length
          },
          compliance_impact: true
        });

      toast({
        title: "Promotion Created",
        description: `TGA device promotion created. Compliance score: ${complianceCheck.complianceScore}%`,
      });

      if (!complianceCheck.isCompliant) {
        toast({
          title: "TGA Compliance Issues",
          description: `${complianceCheck.violations.length} violations detected. Review required before publication.`,
          variant: "destructive",
        });
      }

      return data;

    } catch (error) {
      console.error('Error creating promotion:', error);
      toast({
        title: "Creation Failed",
        description: "Could not create device promotion. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [devices, validateTGACompliance, loadPromotions, toast]);

  // Generate TGA-compliant device disclosure
  const generateTGADisclosure = useCallback((
    device: MedicalDevice,
    contentType: DevicePromotion['content_type']
  ): string => {
    let disclosure = '';

    // Base device identification
    disclosure += `${device.device_name} is a ${device.classification} medical device`;
    
    if (device.tga_registration_number) {
      disclosure += ` (TGA: ${device.tga_registration_number})`;
    }
    
    disclosure += ` sponsored by ${device.sponsor_name}. `;

    // Classification-specific disclosures
    switch (device.classification) {
      case 'Class III':
      case 'AIMD':
        disclosure += 'This is a high-risk medical device requiring specialist medical supervision. ';
        disclosure += 'Consult your specialist before use. ';
        break;
      case 'Class IIb':
        disclosure += 'This medical device requires healthcare professional guidance. ';
        break;
      case 'Class IIa':
        disclosure += 'Consult your healthcare professional before use. ';
        break;
      case 'Class I':
        disclosure += 'Read all instructions before use. ';
        break;
    }

    // General medical device warnings
    disclosure += 'Individual results may vary. ';
    disclosure += 'This device is intended for the stated purpose only. ';

    // Contraindications reference
    if (device.contraindications.length > 0) {
      disclosure += 'See product information for contraindications, warnings and precautions. ';
    }

    // Adverse event reporting
    if (device.adverse_event_reporting) {
      disclosure += 'Report any adverse events to TGA and the device sponsor. ';
    }

    // Content type specific additions
    if (contentType === 'advertisement') {
      disclosure += 'This material is for informational purposes and does not replace professional medical advice. ';
    }

    disclosure += 'For more information, consult your healthcare professional.';

    return disclosure;
  }, []);

  // Review and approve promotion
  const reviewPromotion = useCallback(async (
    promotionId: string,
    approved: boolean,
    reviewNotes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('tga_device_promotions')
        .update({
          approval_status: approved ? 'approved' : 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', promotionId);

      if (error) throw error;

      await loadPromotions();

      // Log review for compliance
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: null,
          performed_by: user.id,
          action: `TGA promotion ${approved ? 'approved' : 'rejected'}`,
          action_type: 'compliance',
          details: {
            promotion_id: promotionId,
            approved,
            review_notes: reviewNotes
          },
          compliance_impact: true
        });

      toast({
        title: approved ? "Promotion Approved" : "Promotion Rejected",
        description: approved 
          ? "TGA device promotion approved for publication."
          : "Promotion rejected. Please address TGA compliance issues.",
        variant: approved ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Error reviewing promotion:', error);
      toast({
        title: "Review Failed",
        description: "Could not complete promotion review.",
        variant: "destructive",
      });
    }
  }, [loadPromotions, toast]);

  // Get compliance summary
  const getComplianceSummary = useCallback(() => {
    const totalPromotions = promotions.length;
    const compliantPromotions = promotions.filter(p => p.tga_compliant).length;
    const approvedPromotions = promotions.filter(p => p.approval_status === 'approved').length;
    const pendingPromotions = promotions.filter(p => p.approval_status === 'pending').length;
    const rejectedPromotions = promotions.filter(p => p.approval_status === 'rejected').length;

    const averageComplianceScore = promotions.length > 0 
      ? promotions.reduce((sum, p) => sum + p.compliance_score, 0) / promotions.length
      : 0;

    const highRiskPromotions = promotions.filter(p => {
      try {
        const compliance = JSON.parse(p.compliance_notes);
        return compliance.riskLevel === 'high' || compliance.riskLevel === 'critical';
      } catch {
        return false;
      }
    }).length;

    return {
      totalPromotions,
      compliantPromotions,
      approvedPromotions,
      pendingPromotions,
      rejectedPromotions,
      highRiskPromotions,
      complianceRate: totalPromotions > 0 ? (compliantPromotions / totalPromotions) * 100 : 0,
      averageComplianceScore
    };
  }, [promotions]);

  // Initialize data loading
  useEffect(() => {
    loadMedicalDevices();
    loadTGARules();
    loadPromotions();
  }, [loadMedicalDevices, loadTGARules, loadPromotions]);

  return {
    // State
    loading,
    devices,
    promotions,
    tgaRules,
    currentPromotion,

    // Actions
    loadMedicalDevices,
    loadPromotions,
    searchTGADevices,
    createDevicePromotion,
    reviewPromotion,

    // Analysis
    validateTGACompliance,
    generateTGADisclosure,
    getComplianceSummary,

    // Setters
    setCurrentPromotion
  };
}; 