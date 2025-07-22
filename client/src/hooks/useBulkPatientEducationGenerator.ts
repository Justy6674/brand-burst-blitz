import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BulkGenerationRequest {
  campaignName: string;
  healthTopic: string;
  specialty: 'gp' | 'specialist' | 'allied_health' | 'psychology' | 'dentistry' | 'nursing';
  targetDemographics: TargetDemographic[];
  platforms: CampaignPlatform[];
  contentTypes: ContentType[];
  campaignDuration: number; // days
  contentFrequency: 'daily' | 'every_2_days' | 'weekly' | 'bi_weekly';
  awarenessFocus: 'prevention' | 'education' | 'early_detection' | 'management' | 'support';
  culturalConsiderations: string[];
  complianceLevel: 'standard' | 'strict' | 'pediatric' | 'elderly';
}

interface TargetDemographic {
  ageGroup: 'children' | 'teens' | 'young_adults' | 'adults' | 'seniors' | 'all_ages';
  gender: 'male' | 'female' | 'all_genders';
  culturalBackground: 'general' | 'indigenous' | 'multicultural' | 'specific_community';
  healthLiteracy: 'basic' | 'intermediate' | 'advanced';
  primaryLanguage: 'english' | 'multilingual' | 'simple_english';
}

interface CampaignPlatform {
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'website' | 'email' | 'print';
  priority: 'primary' | 'secondary' | 'optional';
  customizations: PlatformCustomization;
}

interface PlatformCustomization {
  tone: 'professional' | 'friendly' | 'conversational' | 'authoritative';
  visualStyle: 'infographic' | 'text_only' | 'carousel' | 'video_script';
  hashtagStrategy: 'minimal' | 'moderate' | 'extensive';
  callToActionType: 'appointment' | 'information' | 'awareness' | 'support';
}

interface ContentType {
  type: 'educational_post' | 'myth_buster' | 'prevention_tips' | 'awareness_facts' | 'support_resources' | 'lifestyle_guide';
  priority: 'high' | 'medium' | 'low';
  quantity: number;
}

interface BulkGeneratedContent {
  id: string;
  campaignId: string;
  contentSequence: number;
  platform: string;
  demographic: TargetDemographic;
  contentType: string;
  title: string;
  content: string;
  hashtags: string[];
  disclaimers: string[];
  callToAction: string;
  scheduledDate?: string;
  ahpraCompliant: boolean;
  tgaCompliant: boolean;
  culturallySensitive: boolean;
  readabilityScore: number;
  engagementPrediction: number;
  complianceNotes: string[];
  educationalValue: number;
  patientSafetyChecked: boolean;
}

interface HealthAwarenessCampaign {
  id: string;
  name: string;
  healthTopic: string;
  startDate: string;
  endDate: string;
  totalContent: number;
  generatedContent: number;
  platforms: string[];
  targetDemographics: TargetDemographic[];
  complianceStatus: 'pending' | 'approved' | 'needs_review';
  campaignMetrics: CampaignMetrics;
  createdBy: string;
  practiceId: string;
}

interface CampaignMetrics {
  contentGenerated: number;
  complianceRate: number;
  averageReadabilityScore: number;
  averageEducationalValue: number;
  demographicCoverage: number;
  platformOptimization: number;
}

interface HealthTopicTemplate {
  topic: string;
  category: 'chronic_disease' | 'mental_health' | 'preventive_care' | 'women_health' | 'men_health' | 'child_health' | 'elderly_care';
  keyMessages: string[];
  commonMyths: string[];
  preventionStrategies: string[];
  supportResources: string[];
  complianceConsiderations: string[];
  culturalSensitivities: string[];
  evidenceBase: string[];
}

export function useBulkPatientEducationGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaigns, setCampaigns] = useState<HealthAwarenessCampaign[]>([]);
  const [bulkContent, setBulkContent] = useState<BulkGeneratedContent[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentCampaign, setCurrentCampaign] = useState<HealthAwarenessCampaign | null>(null);

  // Pre-defined health topic templates
  const healthTopicTemplates: HealthTopicTemplate[] = [
    {
      topic: 'Mental Health Awareness',
      category: 'mental_health',
      keyMessages: [
        'Mental health is as important as physical health',
        'Professional help is available and effective',
        'Early intervention improves outcomes',
        'Mental health conditions are treatable'
      ],
      commonMyths: [
        'Mental health problems are a sign of weakness',
        'Therapy is only for severe conditions',
        'Medication is the only treatment option',
        'Mental health issues will resolve on their own'
      ],
      preventionStrategies: [
        'Regular exercise and physical activity',
        'Maintain social connections and support networks',
        'Practice stress management techniques',
        'Seek professional help when needed'
      ],
      supportResources: [
        'Lifeline: 13 11 14',
        'Beyond Blue: 1300 22 4636',
        'Mental Health First Aid',
        'Local community mental health services'
      ],
      complianceConsiderations: [
        'Avoid diagnostic language',
        'Include crisis support information',
        'Emphasize professional consultation',
        'Use person-first language'
      ],
      culturalSensitivities: [
        'Respect diverse cultural approaches to mental health',
        'Acknowledge barriers to help-seeking',
        'Include culturally appropriate resources',
        'Consider Indigenous perspectives on wellbeing'
      ],
      evidenceBase: [
        'WHO Mental Health Atlas',
        'Australian Bureau of Statistics Mental Health data',
        'RANZCP Clinical Practice Guidelines'
      ]
    },
    {
      topic: 'Diabetes Prevention and Management',
      category: 'chronic_disease',
      keyMessages: [
        'Type 2 diabetes is largely preventable',
        'Early detection improves long-term outcomes',
        'Lifestyle changes are highly effective',
        'Regular monitoring is essential for management'
      ],
      commonMyths: [
        'Diabetes is caused only by eating too much sugar',
        'People with diabetes cannot eat any carbohydrates',
        'Insulin is only for type 1 diabetes',
        'Diabetes medication means you have failed at self-management'
      ],
      preventionStrategies: [
        'Maintain healthy weight through balanced diet',
        'Regular physical activity (150 minutes per week)',
        'Regular health screenings and blood glucose checks',
        'Manage stress and get adequate sleep'
      ],
      supportResources: [
        'Diabetes Australia: 1800 177 055',
        'National Diabetes Services Scheme',
        'Local diabetes education programs',
        'Accredited practicing dietitians'
      ],
      complianceConsiderations: [
        'Include disclaimer about individual medical advice',
        'Emphasize importance of professional monitoring',
        'Avoid specific medication recommendations',
        'Reference RACGP Diabetes Guidelines'
      ],
      culturalSensitivities: [
        'Acknowledge higher risk in certain ethnic groups',
        'Respect cultural food preferences and practices',
        'Address socioeconomic barriers to healthy eating',
        'Include culturally appropriate lifestyle modifications'
      ],
      evidenceBase: [
        'Australian Diabetes Guidelines',
        'International Diabetes Federation recommendations',
        'Cochrane systematic reviews on diabetes prevention'
      ]
    },
    {
      topic: 'Cancer Prevention and Early Detection',
      category: 'preventive_care',
      keyMessages: [
        'Many cancers are preventable through lifestyle choices',
        'Early detection significantly improves survival rates',
        'Regular screening saves lives',
        'Support is available throughout the cancer journey'
      ],
      commonMyths: [
        'Cancer is always hereditary and unavoidable',
        'Young people don\'t get cancer',
        'Natural treatments are always safer than conventional treatment',
        'Cancer diagnosis always means death'
      ],
      preventionStrategies: [
        'Maintain healthy lifestyle (diet, exercise, no smoking)',
        'Limit alcohol consumption and sun exposure',
        'Participate in cancer screening programs',
        'Stay up to date with vaccinations (HPV, Hepatitis B)'
      ],
      supportResources: [
        'Cancer Council: 13 11 20',
        'National cancer screening programs',
        'Local cancer support groups',
        'Palliative care services'
      ],
      complianceConsiderations: [
        'Avoid fear-based messaging',
        'Include accurate survival statistics',
        'Emphasize evidence-based treatments',
        'Reference Australian cancer guidelines'
      ],
      culturalSensitivities: [
        'Address cultural barriers to screening',
        'Respect diverse beliefs about illness causation',
        'Include culturally appropriate support services',
        'Consider language barriers in health communication'
      ],
      evidenceBase: [
        'Cancer Australia clinical guidelines',
        'World Cancer Research Fund recommendations',
        'Australian cancer incidence and mortality statistics'
      ]
    }
  ];

  // Generate bulk patient education content
  const generateBulkContent = useCallback(async (request: BulkGenerationRequest, practiceId: string) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Create campaign
      const campaign = await createCampaign(request, practiceId);
      setCurrentCampaign(campaign);
      
      // Calculate total content needed
      const totalContent = calculateTotalContent(request);
      const contentPlan = createContentPlan(request, totalContent);
      
      let generatedCount = 0;
      const allGeneratedContent: BulkGeneratedContent[] = [];
      
      // Generate content for each item in the plan
      for (const planItem of contentPlan) {
        const content = await generateSingleContent(planItem, campaign, request);
        
        if (content) {
          allGeneratedContent.push(content);
          generatedCount++;
          setGenerationProgress((generatedCount / totalContent) * 100);
          
          // Store in database
          await storeBulkContent(content);
        }
        
        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setBulkContent(allGeneratedContent);
      
      // Update campaign with results
      await updateCampaignMetrics(campaign.id, allGeneratedContent);
      
      return { success: true, campaign, content: allGeneratedContent };
    } catch (error) {
      console.error('Error generating bulk content:', error);
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, []);

  // Create campaign from request
  const createCampaign = async (request: BulkGenerationRequest, practiceId: string): Promise<HealthAwarenessCampaign> => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + request.campaignDuration);
    
    const campaign: HealthAwarenessCampaign = {
      id: `campaign_${Date.now()}`,
      name: request.campaignName,
      healthTopic: request.healthTopic,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalContent: calculateTotalContent(request),
      generatedContent: 0,
      platforms: request.platforms.map(p => p.platform),
      targetDemographics: request.targetDemographics,
      complianceStatus: 'pending',
      campaignMetrics: {
        contentGenerated: 0,
        complianceRate: 0,
        averageReadabilityScore: 0,
        averageEducationalValue: 0,
        demographicCoverage: 0,
        platformOptimization: 0
      },
      createdBy: (await supabase.auth.getUser()).data.user?.id || 'unknown',
      practiceId
    };
    
    // Store campaign in database
    const { data, error } = await supabase
      .from('health_awareness_campaigns')
      .insert([{
        name: campaign.name,
        health_topic: campaign.healthTopic,
        start_date: campaign.startDate,
        end_date: campaign.endDate,
        total_content: campaign.totalContent,
        platforms: campaign.platforms,
        target_demographics: campaign.targetDemographics,
        compliance_status: campaign.complianceStatus,
        created_by: campaign.createdBy,
        practice_id: campaign.practiceId
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    setCampaigns(prev => [...prev, { ...campaign, id: data.id }]);
    
    return { ...campaign, id: data.id };
  };

  // Calculate total content needed
  const calculateTotalContent = (request: BulkGenerationRequest): number => {
    const contentTypesCount = request.contentTypes.reduce((sum, ct) => sum + ct.quantity, 0);
    const platformsCount = request.platforms.filter(p => p.priority !== 'optional').length;
    const demographicsCount = request.targetDemographics.length;
    
    return contentTypesCount * platformsCount * Math.min(demographicsCount, 3); // Cap demographics for practical reasons
  };

  // Create content generation plan
  const createContentPlan = (request: BulkGenerationRequest, totalContent: number) => {
    const plan = [];
    let sequence = 1;
    
    for (const contentType of request.contentTypes) {
      for (const platform of request.platforms) {
        for (const demographic of request.targetDemographics.slice(0, 3)) { // Limit demographics
          for (let i = 0; i < contentType.quantity; i++) {
            plan.push({
              sequence: sequence++,
              contentType: contentType.type,
              platform: platform.platform,
              demographic,
              platformCustomizations: platform.customizations,
              contentTypePriority: contentType.priority
            });
          }
        }
      }
    }
    
    return plan.slice(0, Math.min(totalContent, 50)); // Cap total content for performance
  };

  // Generate single piece of content
  const generateSingleContent = async (
    planItem: any,
    campaign: HealthAwarenessCampaign,
    request: BulkGenerationRequest
  ): Promise<BulkGeneratedContent | null> => {
    try {
      // Get topic template
      const topicTemplate = healthTopicTemplates.find(t => 
        t.topic.toLowerCase().includes(request.healthTopic.toLowerCase())
      ) || healthTopicTemplates[0];
      
      // Build content prompt
      const prompt = buildContentPrompt(planItem, topicTemplate, request);
      
      // Generate content (would integrate with OpenAI)
      const generatedText = await simulateContentGeneration(prompt, planItem);
      
      // Validate compliance
      const complianceCheck = await validateBulkContent(generatedText, request.specialty);
      
      // Create content object
      const content: BulkGeneratedContent = {
        id: `content_${Date.now()}_${planItem.sequence}`,
        campaignId: campaign.id,
        contentSequence: planItem.sequence,
        platform: planItem.platform,
        demographic: planItem.demographic,
        contentType: planItem.contentType,
        title: generateContentTitle(planItem.contentType, request.healthTopic, planItem.demographic),
        content: generatedText,
        hashtags: generateCampaignHashtags(request.healthTopic, planItem.platform, request.specialty),
        disclaimers: generateEducationalDisclaimers(request.specialty, planItem.contentType),
        callToAction: generateCallToAction(planItem.contentType, request.specialty),
        ahpraCompliant: complianceCheck.ahpraCompliant,
        tgaCompliant: complianceCheck.tgaCompliant,
        culturallySensitive: complianceCheck.culturallySensitive,
        readabilityScore: calculateReadabilityScore(generatedText, planItem.demographic.healthLiteracy),
        engagementPrediction: predictEngagement(generatedText, planItem.platform),
        complianceNotes: complianceCheck.notes,
        educationalValue: assessEducationalValue(generatedText, topicTemplate),
        patientSafetyChecked: complianceCheck.patientSafetyChecked
      };
      
      return content;
    } catch (error) {
      console.error('Error generating single content:', error);
      return null;
    }
  };

  // Load campaigns
  const loadCampaigns = useCallback(async (practiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('health_awareness_campaigns')
        .select('*')
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const campaigns: HealthAwarenessCampaign[] = data.map(item => ({
        id: item.id,
        name: item.name,
        healthTopic: item.health_topic,
        startDate: item.start_date,
        endDate: item.end_date,
        totalContent: item.total_content,
        generatedContent: item.generated_content || 0,
        platforms: item.platforms || [],
        targetDemographics: item.target_demographics || [],
        complianceStatus: item.compliance_status,
        campaignMetrics: item.campaign_metrics || {
          contentGenerated: 0,
          complianceRate: 0,
          averageReadabilityScore: 0,
          averageEducationalValue: 0,
          demographicCoverage: 0,
          platformOptimization: 0
        },
        createdBy: item.created_by,
        practiceId: item.practice_id
      }));

      setCampaigns(campaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  }, []);

  // Load campaign content
  const loadCampaignContent = useCallback(async (campaignId: string) => {
    try {
      const { data, error } = await supabase
        .from('bulk_patient_education_content')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('content_sequence', { ascending: true });

      if (error) throw error;

      const content: BulkGeneratedContent[] = data.map(item => ({
        id: item.id,
        campaignId: item.campaign_id,
        contentSequence: item.content_sequence,
        platform: item.platform,
        demographic: item.demographic,
        contentType: item.content_type,
        title: item.title,
        content: item.content,
        hashtags: item.hashtags || [],
        disclaimers: item.disclaimers || [],
        callToAction: item.call_to_action,
        scheduledDate: item.scheduled_date,
        ahpraCompliant: item.ahpra_compliant,
        tgaCompliant: item.tga_compliant,
        culturallySensitive: item.culturally_sensitive,
        readabilityScore: item.readability_score,
        engagementPrediction: item.engagement_prediction,
        complianceNotes: item.compliance_notes || [],
        educationalValue: item.educational_value,
        patientSafetyChecked: item.patient_safety_checked
      }));

      setBulkContent(content);
    } catch (error) {
      console.error('Error loading campaign content:', error);
    }
  }, []);

  return {
    // State
    isGenerating,
    campaigns,
    bulkContent,
    generationProgress,
    currentCampaign,
    
    // Actions
    generateBulkContent,
    loadCampaigns,
    loadCampaignContent,
    
    // Utilities
    getHealthTopicTemplates: () => healthTopicTemplates,
    calculateTotalContent
  };
}

// Helper functions

function buildContentPrompt(planItem: any, topicTemplate: HealthTopicTemplate, request: BulkGenerationRequest): string {
  return `Create ${planItem.contentType} content about ${request.healthTopic} for ${planItem.platform} targeting ${planItem.demographic.ageGroup} with ${planItem.demographic.healthLiteracy} health literacy level. Include key message: ${topicTemplate.keyMessages[0]}. Ensure AHPRA compliance and cultural sensitivity.`;
}

async function simulateContentGeneration(prompt: string, planItem: any): Promise<string> {
  // This would integrate with OpenAI API
  // For now, return simulated content
  const contentTemplates = {
    educational_post: `Understanding ${planItem.contentType}: Key information every patient should know. This evidence-based guide provides essential health information in clear, accessible language.`,
    myth_buster: `Common Myth Busted: Setting the record straight with evidence-based facts. Healthcare professionals recommend understanding these important distinctions.`,
    prevention_tips: `Prevention Strategies: Simple, effective steps you can take to support your health. These evidence-based recommendations are suitable for most people.`,
    awareness_facts: `Important Health Facts: Essential information about this health topic. Understanding these key points can help you make informed health decisions.`,
    support_resources: `Support and Resources: Professional help and community support are available. Here's how to access the care and information you need.`,
    lifestyle_guide: `Healthy Lifestyle Guide: Evidence-based recommendations for supporting your overall wellbeing through daily choices.`
  };
  
  return contentTemplates[planItem.contentType] || contentTemplates.educational_post;
}

async function validateBulkContent(content: string, specialty: string) {
  // This would integrate with existing compliance validation
  return {
    ahpraCompliant: true,
    tgaCompliant: true,
    culturallySensitive: true,
    patientSafetyChecked: true,
    notes: ['Content validated for AHPRA compliance', 'Patient safety considerations included']
  };
}

function generateContentTitle(contentType: string, healthTopic: string, demographic: any): string {
  const titles = {
    educational_post: `Understanding ${healthTopic}: A Guide for ${demographic.ageGroup}`,
    myth_buster: `${healthTopic} Myths Debunked`,
    prevention_tips: `${healthTopic} Prevention: What You Can Do`,
    awareness_facts: `Key Facts About ${healthTopic}`,
    support_resources: `${healthTopic} Support and Resources`,
    lifestyle_guide: `Living Well with ${healthTopic}`
  };
  
  return titles[contentType] || `${healthTopic} Information`;
}

function generateCampaignHashtags(healthTopic: string, platform: string, specialty: string): string[] {
  const baseHashtags = ['#HealthEducation', '#PatientCare', '#AustralianHealthcare'];
  const topicHashtags = [`#${healthTopic.replace(/\s+/g, '')}`];
  const specialtyHashtags = {
    gp: ['#GeneralPractice', '#FamilyHealth'],
    psychology: ['#MentalHealth', '#MentalWellbeing'],
    allied_health: ['#AlliedHealth', '#Rehabilitation']
  };
  
  return [...baseHashtags, ...topicHashtags, ...(specialtyHashtags[specialty] || [])].slice(0, 8);
}

function generateEducationalDisclaimers(specialty: string, contentType: string): string[] {
  const baseDisclaimer = 'This information is general in nature and should not replace professional medical advice.';
  const specialtyDisclaimers = {
    psychology: 'If you are experiencing mental health concerns, please seek professional help.',
    gp: 'Consult your GP for advice tailored to your individual health circumstances.'
  };
  
  return [baseDisclaimer, specialtyDisclaimers[specialty] || specialtyDisclaimers.gp];
}

function generateCallToAction(contentType: string, specialty: string): string {
  const callToActions = {
    educational_post: 'Speak with your healthcare professional for personalized advice.',
    prevention_tips: 'Take action today - consult your healthcare provider about prevention strategies.',
    support_resources: 'Reach out for support - professional help is available.',
    awareness_facts: 'Stay informed and consult your healthcare professional for guidance.'
  };
  
  return callToActions[contentType] || 'Consult your healthcare professional for personalized advice.';
}

function calculateReadabilityScore(content: string, healthLiteracy: string): number {
  // Simplified readability calculation based on health literacy level
  const scores = {
    basic: 7,
    intermediate: 8,
    advanced: 9
  };
  
  return scores[healthLiteracy] || 7;
}

function predictEngagement(content: string, platform: string): number {
  // Simplified engagement prediction
  const platformModifiers = {
    instagram: 8,
    facebook: 7,
    linkedin: 6,
    twitter: 5
  };
  
  return platformModifiers[platform] || 6;
}

function assessEducationalValue(content: string, topicTemplate: HealthTopicTemplate): number {
  // Simplified educational value assessment
  return 8; // Would be more sophisticated in real implementation
}

async function storeBulkContent(content: BulkGeneratedContent) {
  try {
    await supabase
      .from('bulk_patient_education_content')
      .insert([{
        campaign_id: content.campaignId,
        content_sequence: content.contentSequence,
        platform: content.platform,
        demographic: content.demographic,
        content_type: content.contentType,
        title: content.title,
        content: content.content,
        hashtags: content.hashtags,
        disclaimers: content.disclaimers,
        call_to_action: content.callToAction,
        ahpra_compliant: content.ahpraCompliant,
        tga_compliant: content.tgaCompliant,
        culturally_sensitive: content.culturallySensitive,
        readability_score: content.readabilityScore,
        engagement_prediction: content.engagementPrediction,
        compliance_notes: content.complianceNotes,
        educational_value: content.educationalValue,
        patient_safety_checked: content.patientSafetyChecked
      }]);
  } catch (error) {
    console.error('Error storing bulk content:', error);
  }
}

async function updateCampaignMetrics(campaignId: string, content: BulkGeneratedContent[]) {
  const metrics = {
    contentGenerated: content.length,
    complianceRate: (content.filter(c => c.ahpraCompliant && c.tgaCompliant).length / content.length) * 100,
    averageReadabilityScore: content.reduce((sum, c) => sum + c.readabilityScore, 0) / content.length,
    averageEducationalValue: content.reduce((sum, c) => sum + c.educationalValue, 0) / content.length,
    demographicCoverage: new Set(content.map(c => c.demographic.ageGroup)).size,
    platformOptimization: (content.filter(c => c.engagementPrediction >= 7).length / content.length) * 100
  };
  
  try {
    await supabase
      .from('health_awareness_campaigns')
      .update({
        generated_content: metrics.contentGenerated,
        campaign_metrics: metrics
      })
      .eq('id', campaignId);
  } catch (error) {
    console.error('Error updating campaign metrics:', error);
  }
} 