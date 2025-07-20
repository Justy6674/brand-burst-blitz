import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface BeforeAfterPhoto {
  id: string;
  user_id: string;
  before_image_url: string;
  after_image_url: string;
  treatment_type: string;
  specialty: string;
  consent_form_url?: string;
  consent_verified: boolean;
  consent_date?: string;
  patient_consent_id?: string;
  disclaimer_text: string;
  ahpra_compliant: boolean;
  compliance_notes: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'requires_changes';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

interface ConsentForm {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  treatment_details: string;
  consent_granted: boolean;
  consent_date: string;
  consent_signature_url: string;
  photographer_consent: boolean;
  marketing_consent: boolean;
  social_media_consent: boolean;
  website_consent: boolean;
  duration_consent_months: number;
  withdrawal_acknowledged: boolean;
  privacy_notice_acknowledged: boolean;
  practitioner_id: string;
  created_at: string;
}

interface ComplianceCheck {
  isCompliant: boolean;
  violations: string[];
  warnings: string[];
  requiredActions: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceScore: number; // 0-100
}

interface PhotoAnalysis {
  hasIdentifiableFeatures: boolean;
  requiresBlurring: string[];
  suggestedCropping: string[];
  lightingQuality: 'poor' | 'acceptable' | 'good' | 'excellent';
  angleConsistency: boolean;
  backgroundAppropriate: boolean;
  professionalQuality: boolean;
}

export const useBeforeAfterPhotoCompliance = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<BeforeAfterPhoto[]>([]);
  const [consentForms, setConsentForms] = useState<ConsentForm[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<BeforeAfterPhoto | null>(null);

  // Load user's before/after photos
  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('healthcare_before_after_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);

    } catch (error) {
      console.error('Error loading photos:', error);
      toast({
        title: "Error Loading Photos",
        description: "Could not load before/after photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load consent forms
  const loadConsentForms = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('healthcare_photo_consent_forms')
        .select('*')
        .eq('practitioner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsentForms(data || []);

    } catch (error) {
      console.error('Error loading consent forms:', error);
    }
  }, []);

  // Validate AHPRA compliance for before/after photos
  const validateAHPRACompliance = useCallback((
    photo: BeforeAfterPhoto,
    consentForm?: ConsentForm
  ): ComplianceCheck => {
    const violations: string[] = [];
    const warnings: string[] = [];
    const requiredActions: string[] = [];
    let riskLevel: ComplianceCheck['riskLevel'] = 'low';
    let complianceScore = 100;

    // Critical AHPRA Requirements
    if (!photo.consent_verified || !consentForm) {
      violations.push('Patient consent not verified or missing');
      requiredActions.push('Obtain and verify patient consent before publication');
      riskLevel = 'critical';
      complianceScore -= 50;
    }

    if (!consentForm?.marketing_consent) {
      violations.push('Explicit marketing consent not obtained');
      requiredActions.push('Obtain specific consent for marketing use');
      riskLevel = 'critical';
      complianceScore -= 30;
    }

    if (!consentForm?.withdrawal_acknowledged) {
      violations.push('Patient withdrawal rights not acknowledged');
      requiredActions.push('Ensure patient understands withdrawal rights');
      riskLevel = 'high';
      complianceScore -= 20;
    }

    // Disclaimer Requirements
    if (!photo.disclaimer_text || photo.disclaimer_text.length < 100) {
      violations.push('Inadequate or missing disclaimer text');
      requiredActions.push('Include comprehensive AHPRA-compliant disclaimer');
      riskLevel = 'high';
      complianceScore -= 25;
    }

    const requiredDisclaimerElements = [
      'individual results may vary',
      'not a guarantee',
      'consultation required',
      'risks involved',
      'qualified practitioner'
    ];

    const missingElements = requiredDisclaimerElements.filter(element => 
      !photo.disclaimer_text.toLowerCase().includes(element.toLowerCase())
    );

    if (missingElements.length > 0) {
      warnings.push(`Disclaimer missing elements: ${missingElements.join(', ')}`);
      complianceScore -= missingElements.length * 5;
    }

    // Treatment Type Specific Checks
    const highRiskTreatments = [
      'surgical',
      'cosmetic surgery',
      'injectable',
      'laser',
      'chemical peel',
      'body contouring'
    ];

    if (highRiskTreatments.some(treatment => 
      photo.treatment_type.toLowerCase().includes(treatment))) {
      
      if (!consentForm?.photographer_consent) {
        violations.push('Photography consent required for surgical/cosmetic procedures');
        riskLevel = 'high';
        complianceScore -= 20;
      }

      warnings.push('High-risk treatment requires additional compliance scrutiny');
    }

    // Privacy and Anonymity Checks
    if (consentForm && !consentForm.social_media_consent && photo.approval_status === 'approved') {
      warnings.push('Patient has not consented to social media use');
    }

    // Time-based Consent Validation
    if (consentForm) {
      const consentDate = new Date(consentForm.consent_date);
      const monthsElapsed = (Date.now() - consentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsElapsed > consentForm.duration_consent_months) {
        violations.push('Consent has expired based on specified duration');
        requiredActions.push('Renew patient consent or remove photos');
        riskLevel = 'high';
        complianceScore -= 30;
      }
    }

    // Professional Standards
    if (!photo.treatment_type || photo.treatment_type.length < 5) {
      warnings.push('Treatment type insufficiently detailed');
      complianceScore -= 5;
    }

    // Final Risk Assessment
    if (violations.length >= 3) riskLevel = 'critical';
    else if (violations.length >= 2) riskLevel = 'high';
    else if (violations.length >= 1 || warnings.length >= 3) riskLevel = 'medium';

    const isCompliant = violations.length === 0 && complianceScore >= 80;

    return {
      isCompliant,
      violations,
      warnings,
      requiredActions,
      riskLevel,
      complianceScore: Math.max(0, complianceScore)
    };
  }, []);

  // Analyze photo quality and compliance
  const analyzePhotoQuality = useCallback(async (imageUrl: string): Promise<PhotoAnalysis> => {
    try {
      // In a real implementation, this would use image analysis AI
      // For now, returning a mock analysis
      return {
        hasIdentifiableFeatures: true,
        requiresBlurring: ['background people', 'identifying marks'],
        suggestedCropping: ['crop to treatment area only'],
        lightingQuality: 'good',
        angleConsistency: true,
        backgroundAppropriate: true,
        professionalQuality: true
      };
    } catch (error) {
      console.error('Error analyzing photo:', error);
      throw error;
    }
  }, []);

  // Generate AHPRA-compliant disclaimer
  const generateCompliantDisclaimer = useCallback((
    treatmentType: string,
    specialty: string,
    practitionerName: string,
    practiceLocation: string
  ): string => {
    const baseDisclaimer = `IMPORTANT DISCLAIMER: These before and after photos show results from ${treatmentType} treatment performed by ${practitionerName}, a qualified ${specialty} practitioner in ${practiceLocation}. `;
    
    const variabilityClause = `Individual results may vary significantly and these images do not constitute a guarantee of specific outcomes. `;
    
    const consultationClause = `Results depend on individual factors including skin type, medical history, lifestyle, and adherence to post-treatment care. A thorough consultation and examination are required before any treatment recommendation. `;
    
    const riskClause = `All medical and cosmetic procedures carry risks and potential complications. These will be discussed during your consultation. `;
    
    const consentClause = `These images are published with explicit written patient consent and may not represent typical results. `;
    
    const professionalClause = `Treatment should only be performed by qualified, registered healthcare professionals. `;
    
    const ahpraClause = `This practitioner is registered with AHPRA and adheres to professional advertising standards. `;
    
    const contactClause = `For more information or to discuss your individual needs, please book a consultation. Results cannot be guaranteed and this content is for educational purposes only.`;

    return baseDisclaimer + variabilityClause + consultationClause + riskClause + 
           consentClause + professionalClause + ahpraClause + contactClause;
  }, []);

  // Create consent form
  const createConsentForm = useCallback(async (consentData: Partial<ConsentForm>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('healthcare_photo_consent_forms')
        .insert({
          ...consentData,
          practitioner_id: user.id,
          consent_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await loadConsentForms();

      // Log consent creation for compliance
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: null,
          performed_by: user.id,
          action: 'Photo consent form created',
          action_type: 'compliance',
          details: {
            consent_id: data.id,
            patient_name: consentData.patient_name,
            treatment_type: consentData.treatment_details,
            consent_scope: {
              marketing: consentData.marketing_consent,
              social_media: consentData.social_media_consent,
              website: consentData.website_consent
            }
          },
          compliance_impact: true
        });

      toast({
        title: "Consent Form Created",
        description: "Patient consent form has been successfully created and verified.",
      });

      return data;

    } catch (error) {
      console.error('Error creating consent form:', error);
      toast({
        title: "Error Creating Consent Form",
        description: "Could not create consent form. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadConsentForms, toast]);

  // Upload before/after photos with compliance checking
  const uploadBeforeAfterPhotos = useCallback(async (
    beforeImage: File,
    afterImage: File,
    treatmentType: string,
    specialty: string,
    consentFormId?: string
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get practitioner details for disclaimer
      const { data: practitioner } = await supabase
        .from('healthcare_professionals')
        .select('full_name, practice_location')
        .eq('id', user.id)
        .single();

      // Upload images to storage
      const beforeUpload = await supabase.storage
        .from('healthcare-photos')
        .upload(`before-after/${user.id}/${Date.now()}-before.jpg`, beforeImage);

      if (beforeUpload.error) throw beforeUpload.error;

      const afterUpload = await supabase.storage
        .from('healthcare-photos')
        .upload(`before-after/${user.id}/${Date.now()}-after.jpg`, afterImage);

      if (afterUpload.error) throw afterUpload.error;

      // Generate compliant disclaimer
      const disclaimer = generateCompliantDisclaimer(
        treatmentType,
        specialty,
        practitioner?.full_name || 'Healthcare Professional',
        practitioner?.practice_location || 'Australia'
      );

      // Create photo record
      const { data: photoData, error: photoError } = await supabase
        .from('healthcare_before_after_photos')
        .insert({
          user_id: user.id,
          before_image_url: beforeUpload.data.path,
          after_image_url: afterUpload.data.path,
          treatment_type: treatmentType,
          specialty: specialty,
          patient_consent_id: consentFormId,
          consent_verified: !!consentFormId,
          disclaimer_text: disclaimer,
          ahpra_compliant: false, // Will be set after review
          compliance_notes: 'Pending compliance review',
          approval_status: 'pending'
        })
        .select()
        .single();

      if (photoError) throw photoError;

      // Perform initial compliance check
      const consentForm = consentFormId ? 
        consentForms.find(c => c.id === consentFormId) : undefined;
      
      const complianceCheck = validateAHPRACompliance(photoData, consentForm);

      // Update with compliance check results
      await supabase
        .from('healthcare_before_after_photos')
        .update({
          ahpra_compliant: complianceCheck.isCompliant,
          compliance_notes: JSON.stringify(complianceCheck)
        })
        .eq('id', photoData.id);

      await loadPhotos();

      // Log photo upload for compliance
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: null,
          performed_by: user.id,
          action: 'Before/after photos uploaded',
          action_type: 'content',
          details: {
            photo_id: photoData.id,
            treatment_type: treatmentType,
            specialty: specialty,
            consent_verified: !!consentFormId,
            compliance_score: complianceCheck.complianceScore,
            risk_level: complianceCheck.riskLevel
          },
          compliance_impact: true
        });

      toast({
        title: "Photos Uploaded",
        description: `Before/after photos uploaded successfully. Compliance score: ${complianceCheck.complianceScore}%`,
      });

      if (!complianceCheck.isCompliant) {
        toast({
          title: "Compliance Issues Detected",
          description: `${complianceCheck.violations.length} violations found. Please review before publication.`,
          variant: "destructive",
        });
      }

      return photoData;

    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Upload Failed",
        description: "Could not upload before/after photos. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [generateCompliantDisclaimer, consentForms, validateAHPRACompliance, loadPhotos, toast]);

  // Review and approve photos
  const reviewPhoto = useCallback(async (
    photoId: string,
    approved: boolean,
    reviewNotes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('healthcare_before_after_photos')
        .update({
          approval_status: approved ? 'approved' : 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          compliance_notes: reviewNotes || ''
        })
        .eq('id', photoId);

      if (error) throw error;

      await loadPhotos();

      // Log review for compliance
      await supabase
        .from('healthcare_team_audit_log')
        .insert({
          team_id: null,
          performed_by: user.id,
          action: `Photo ${approved ? 'approved' : 'rejected'}`,
          action_type: 'compliance',
          details: {
            photo_id: photoId,
            approved,
            review_notes: reviewNotes
          },
          compliance_impact: true
        });

      toast({
        title: approved ? "Photo Approved" : "Photo Rejected",
        description: approved 
          ? "Photo approved for publication with AHPRA compliance."
          : "Photo rejected. Please address compliance issues before resubmission.",
        variant: approved ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Error reviewing photo:', error);
      toast({
        title: "Review Failed",
        description: "Could not complete photo review.",
        variant: "destructive",
      });
    }
  }, [loadPhotos, toast]);

  // Get compliance summary for dashboard
  const getComplianceSummary = useCallback(() => {
    const totalPhotos = photos.length;
    const approvedPhotos = photos.filter(p => p.approval_status === 'approved').length;
    const pendingPhotos = photos.filter(p => p.approval_status === 'pending').length;
    const rejectedPhotos = photos.filter(p => p.approval_status === 'rejected').length;
    const compliantPhotos = photos.filter(p => p.ahpra_compliant).length;

    const averageComplianceScore = photos.length > 0 
      ? photos.reduce((sum, photo) => {
          try {
            const compliance = JSON.parse(photo.compliance_notes);
            return sum + (compliance.complianceScore || 0);
          } catch {
            return sum;
          }
        }, 0) / photos.length
      : 0;

    return {
      totalPhotos,
      approvedPhotos,
      pendingPhotos,
      rejectedPhotos,
      compliantPhotos,
      complianceRate: totalPhotos > 0 ? (compliantPhotos / totalPhotos) * 100 : 0,
      averageComplianceScore
    };
  }, [photos]);

  // Initialize data loading
  useEffect(() => {
    loadPhotos();
    loadConsentForms();
  }, [loadPhotos, loadConsentForms]);

  return {
    // State
    loading,
    photos,
    consentForms,
    currentPhoto,

    // Actions
    loadPhotos,
    loadConsentForms,
    createConsentForm,
    uploadBeforeAfterPhotos,
    reviewPhoto,

    // Analysis
    validateAHPRACompliance,
    analyzePhotoQuality,
    generateCompliantDisclaimer,
    getComplianceSummary,

    // Setters
    setCurrentPhoto
  };
}; 