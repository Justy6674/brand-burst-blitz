import React, { useState, useEffect } from 'react';
import { useBulkPatientEducationGenerator } from '../../hooks/useBulkPatientEducationGenerator';
import { useHealthcareAuth } from '../../hooks/useHealthcareAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { 
  Zap, 
  Users, 
  Calendar, 
  Target, 
  Shield, 
  BookOpen, 
  Copy, 
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Globe,
  Heart,
  Stethoscope,
  Brain,
  Eye,
  Hash,
  MessageSquare,
  FileText,
  Mail,
  Printer
} from 'lucide-react';

interface BulkPatientEducationGeneratorProps {
  practiceId: string;
  defaultSpecialty?: string;
}

interface BulkGenerationRequest {
  campaignName: string;
  healthTopic: string;
  specialty: 'gp' | 'specialist' | 'allied_health' | 'psychology' | 'dentistry' | 'nursing';
  targetDemographics: TargetDemographic[];
  platforms: CampaignPlatform[];
  contentTypes: ContentType[];
  campaignDuration: number;
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

export function BulkPatientEducationGenerator({ 
  practiceId, 
  defaultSpecialty = 'gp' 
}: BulkPatientEducationGeneratorProps) {
  const { user } = useHealthcareAuth();
  const {
    isGenerating,
    campaigns,
    bulkContent,
    generationProgress,
    currentCampaign,
    generateBulkContent,
    loadCampaigns,
    loadCampaignContent,
    getHealthTopicTemplates,
    calculateTotalContent
  } = useBulkPatientEducationGenerator();

  const [activeTab, setActiveTab] = useState('setup');
  const [campaignRequest, setCampaignRequest] = useState<BulkGenerationRequest>({
    campaignName: '',
    healthTopic: '',
    specialty: defaultSpecialty as any,
    targetDemographics: [],
    platforms: [],
    contentTypes: [],
    campaignDuration: 30,
    contentFrequency: 'weekly',
    awarenessFocus: 'education',
    culturalConsiderations: [],
    complianceLevel: 'standard'
  });

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [copiedContentId, setCopiedContentId] = useState<string | null>(null);

  const healthTopics = [
    'Mental Health Awareness',
    'Diabetes Prevention and Management',
    'Cancer Prevention and Early Detection',
    'Heart Health and Cardiovascular Disease',
    'Women\'s Health and Wellness',
    'Men\'s Health and Preventive Care',
    'Child Health and Development',
    'Aged Care and Healthy Aging',
    'Indigenous Health and Cultural Safety',
    'Chronic Pain Management',
    'Nutrition and Healthy Eating',
    'Exercise and Physical Activity',
    'Sleep Health and Hygiene',
    'Immunization and Vaccine Education',
    'Skin Health and Sun Safety'
  ];

  const specialties = [
    { value: 'gp', label: 'General Practice', icon: Stethoscope },
    { value: 'specialist', label: 'Specialist Medicine', icon: Target },
    { value: 'allied_health', label: 'Allied Health', icon: Users },
    { value: 'psychology', label: 'Psychology', icon: Brain },
    { value: 'dentistry', label: 'Dentistry', icon: Shield },
    { value: 'nursing', label: 'Nursing', icon: Heart }
  ];

  const ageGroups = [
    { value: 'children', label: 'Children (0-12)' },
    { value: 'teens', label: 'Teenagers (13-18)' },
    { value: 'young_adults', label: 'Young Adults (19-35)' },
    { value: 'adults', label: 'Adults (36-65)' },
    { value: 'seniors', label: 'Seniors (65+)' },
    { value: 'all_ages', label: 'All Ages' }
  ];

  const platforms = [
    { value: 'facebook', label: 'Facebook', icon: Globe },
    { value: 'instagram', label: 'Instagram', icon: Eye },
    { value: 'linkedin', label: 'LinkedIn', icon: Users },
    { value: 'twitter', label: 'Twitter', icon: MessageSquare },
    { value: 'website', label: 'Website', icon: Globe },
    { value: 'email', label: 'Email Newsletter', icon: Mail },
    { value: 'print', label: 'Print Materials', icon: Printer }
  ];

  const contentTypes = [
    { value: 'educational_post', label: 'Educational Posts', icon: BookOpen },
    { value: 'myth_buster', label: 'Myth Busters', icon: Shield },
    { value: 'prevention_tips', label: 'Prevention Tips', icon: CheckCircle },
    { value: 'awareness_facts', label: 'Awareness Facts', icon: TrendingUp },
    { value: 'support_resources', label: 'Support Resources', icon: Heart },
    { value: 'lifestyle_guide', label: 'Lifestyle Guides', icon: Users }
  ];

  const culturalConsiderations = [
    'Indigenous Australian perspectives',
    'Multicultural community needs',
    'Language accessibility',
    'Religious and cultural sensitivities',
    'Socioeconomic considerations',
    'LGBTQ+ inclusivity',
    'Disability accessibility',
    'Rural and remote communities'
  ];

  useEffect(() => {
    loadCampaigns(practiceId);
  }, [practiceId, loadCampaigns]);

  useEffect(() => {
    if (selectedCampaignId) {
      loadCampaignContent(selectedCampaignId);
    }
  }, [selectedCampaignId, loadCampaignContent]);

  const handleAddDemographic = () => {
    const newDemographic: TargetDemographic = {
      ageGroup: 'adults',
      gender: 'all_genders',
      culturalBackground: 'general',
      healthLiteracy: 'intermediate',
      primaryLanguage: 'english'
    };
    setCampaignRequest(prev => ({
      ...prev,
      targetDemographics: [...prev.targetDemographics, newDemographic]
    }));
  };

  const handleUpdateDemographic = (index: number, updates: Partial<TargetDemographic>) => {
    setCampaignRequest(prev => ({
      ...prev,
      targetDemographics: prev.targetDemographics.map((demo, i) => 
        i === index ? { ...demo, ...updates } : demo
      )
    }));
  };

  const handleRemoveDemographic = (index: number) => {
    setCampaignRequest(prev => ({
      ...prev,
      targetDemographics: prev.targetDemographics.filter((_, i) => i !== index)
    }));
  };

  const handleAddPlatform = (platformValue: string) => {
    if (!campaignRequest.platforms.find(p => p.platform === platformValue)) {
      const newPlatform: CampaignPlatform = {
        platform: platformValue as any,
        priority: 'primary',
        customizations: {
          tone: 'professional',
          visualStyle: 'text_only',
          hashtagStrategy: 'moderate',
          callToActionType: 'information'
        }
      };
      setCampaignRequest(prev => ({
        ...prev,
        platforms: [...prev.platforms, newPlatform]
      }));
    }
  };

  const handleUpdatePlatform = (index: number, updates: Partial<CampaignPlatform>) => {
    setCampaignRequest(prev => ({
      ...prev,
      platforms: prev.platforms.map((platform, i) => 
        i === index ? { ...platform, ...updates } : platform
      )
    }));
  };

  const handleRemovePlatform = (index: number) => {
    setCampaignRequest(prev => ({
      ...prev,
      platforms: prev.platforms.filter((_, i) => i !== index)
    }));
  };

  const handleAddContentType = (typeValue: string) => {
    if (!campaignRequest.contentTypes.find(ct => ct.type === typeValue)) {
      const newContentType: ContentType = {
        type: typeValue as any,
        priority: 'high',
        quantity: 5
      };
      setCampaignRequest(prev => ({
        ...prev,
        contentTypes: [...prev.contentTypes, newContentType]
      }));
    }
  };

  const handleUpdateContentType = (index: number, updates: Partial<ContentType>) => {
    setCampaignRequest(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.map((contentType, i) => 
        i === index ? { ...contentType, ...updates } : contentType
      )
    }));
  };

  const handleRemoveContentType = (index: number) => {
    setCampaignRequest(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateCampaign = async () => {
    if (!campaignRequest.campaignName || !campaignRequest.healthTopic) {
      alert('Please provide campaign name and health topic');
      return;
    }

    if (campaignRequest.targetDemographics.length === 0) {
      alert('Please add at least one target demographic');
      return;
    }

    if (campaignRequest.platforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    if (campaignRequest.contentTypes.length === 0) {
      alert('Please select at least one content type');
      return;
    }

    const result = await generateBulkContent(campaignRequest, practiceId);
    
    if (result.success) {
      setActiveTab('results');
      setSelectedCampaignId(result.campaign?.id || null);
    }
  };

  const handleCopyContent = async (content: string, contentId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedContentId(contentId);
      setTimeout(() => setCopiedContentId(null), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const renderCampaignSetup = () => (
    <div className="space-y-6">
      {/* Campaign Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campaign Overview
          </CardTitle>
          <CardDescription>
            Define your healthcare awareness campaign basics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaignName">Campaign Name</Label>
            <Input
              id="campaignName"
              placeholder="e.g., Mental Health Week 2024"
              value={campaignRequest.campaignName}
              onChange={(e) => setCampaignRequest(prev => ({ ...prev, campaignName: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="healthTopic">Health Topic</Label>
              <Select 
                value={campaignRequest.healthTopic} 
                onValueChange={(value) => setCampaignRequest(prev => ({ ...prev, healthTopic: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select health topic" />
                </SelectTrigger>
                <SelectContent>
                  {healthTopics.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Healthcare Specialty</Label>
              <Select 
                value={campaignRequest.specialty} 
                onValueChange={(value) => setCampaignRequest(prev => ({ ...prev, specialty: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map(specialty => {
                    const Icon = specialty.icon;
                    return (
                      <SelectItem key={specialty.value} value={specialty.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {specialty.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Campaign Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min="7"
                max="365"
                value={campaignRequest.campaignDuration}
                onChange={(e) => setCampaignRequest(prev => ({ ...prev, campaignDuration: parseInt(e.target.value) || 30 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Content Frequency</Label>
              <Select 
                value={campaignRequest.contentFrequency} 
                onValueChange={(value) => setCampaignRequest(prev => ({ ...prev, contentFrequency: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="every_2_days">Every 2 Days</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="awarenessFocus">Awareness Focus</Label>
              <Select 
                value={campaignRequest.awarenessFocus} 
                onValueChange={(value) => setCampaignRequest(prev => ({ ...prev, awarenessFocus: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prevention">Prevention</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="early_detection">Early Detection</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Target Demographics
          </CardTitle>
          <CardDescription>
            Define who your content will reach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaignRequest.targetDemographics.map((demographic, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Demographic Group {index + 1}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveDemographic(index)}
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Age Group</Label>
                  <Select 
                    value={demographic.ageGroup} 
                    onValueChange={(value) => handleUpdateDemographic(index, { ageGroup: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ageGroups.map(age => (
                        <SelectItem key={age.value} value={age.value}>{age.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Health Literacy</Label>
                  <Select 
                    value={demographic.healthLiteracy} 
                    onValueChange={(value) => handleUpdateDemographic(index, { healthLiteracy: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cultural Background</Label>
                  <Select 
                    value={demographic.culturalBackground} 
                    onValueChange={(value) => handleUpdateDemographic(index, { culturalBackground: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Population</SelectItem>
                      <SelectItem value="indigenous">Indigenous Australian</SelectItem>
                      <SelectItem value="multicultural">Multicultural</SelectItem>
                      <SelectItem value="specific_community">Specific Community</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={handleAddDemographic}
            className="w-full"
          >
            <Users className="h-4 w-4 mr-2" />
            Add Target Demographic
          </Button>
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Platform Selection
          </CardTitle>
          <CardDescription>
            Choose where your content will be published
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map(platform => {
              const Icon = platform.icon;
              const isSelected = campaignRequest.platforms.find(p => p.platform === platform.value);
              
              return (
                <Button
                  key={platform.value}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => isSelected ? 
                    handleRemovePlatform(campaignRequest.platforms.findIndex(p => p.platform === platform.value)) :
                    handleAddPlatform(platform.value)
                  }
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{platform.label}</span>
                </Button>
              );
            })}
          </div>

          {campaignRequest.platforms.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Platform Customizations</h4>
              {campaignRequest.platforms.map((platform, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium capitalize">{platform.platform}</h5>
                    <Select 
                      value={platform.priority} 
                      onValueChange={(value) => handleUpdatePlatform(index, { priority: value as any })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Content Tone</Label>
                      <Select 
                        value={platform.customizations.tone} 
                        onValueChange={(value) => handleUpdatePlatform(index, { 
                          customizations: { ...platform.customizations, tone: value as any }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                          <SelectItem value="authoritative">Authoritative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Call-to-Action Type</Label>
                      <Select 
                        value={platform.customizations.callToActionType} 
                        onValueChange={(value) => handleUpdatePlatform(index, { 
                          customizations: { ...platform.customizations, callToActionType: value as any }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appointment">Book Appointment</SelectItem>
                          <SelectItem value="information">Learn More</SelectItem>
                          <SelectItem value="awareness">Raise Awareness</SelectItem>
                          <SelectItem value="support">Get Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Types
          </CardTitle>
          <CardDescription>
            Select the types of educational content to generate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentTypes.map(contentType => {
              const Icon = contentType.icon;
              const isSelected = campaignRequest.contentTypes.find(ct => ct.type === contentType.value);
              
              return (
                <Button
                  key={contentType.value}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => isSelected ? 
                    handleRemoveContentType(campaignRequest.contentTypes.findIndex(ct => ct.type === contentType.value)) :
                    handleAddContentType(contentType.value)
                  }
                  className="h-16 flex items-center justify-start gap-3 p-4"
                >
                  <Icon className="h-5 w-5" />
                  <span>{contentType.label}</span>
                </Button>
              );
            })}
          </div>

          {campaignRequest.contentTypes.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Content Quantities</h4>
              {campaignRequest.contentTypes.map((contentType, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">
                      {contentType.type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-4">
                      <Label>Quantity:</Label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={contentType.quantity}
                        onChange={(e) => handleUpdateContentType(index, { quantity: parseInt(e.target.value) || 1 })}
                        className="w-20"
                      />
                      <Select 
                        value={contentType.priority} 
                        onValueChange={(value) => handleUpdateContentType(index, { priority: value as any })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cultural Considerations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Cultural Considerations
          </CardTitle>
          <CardDescription>
            Select cultural sensitivities to address in your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {culturalConsiderations.map(consideration => (
              <div key={consideration} className="flex items-center space-x-2">
                <Checkbox
                  id={consideration}
                  checked={campaignRequest.culturalConsiderations.includes(consideration)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setCampaignRequest(prev => ({
                        ...prev,
                        culturalConsiderations: [...prev.culturalConsiderations, consideration]
                      }));
                    } else {
                      setCampaignRequest(prev => ({
                        ...prev,
                        culturalConsiderations: prev.culturalConsiderations.filter(c => c !== consideration)
                      }));
                    }
                  }}
                />
                <Label htmlFor={consideration} className="text-sm">
                  {consideration}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generation Summary */}
      {campaignRequest.targetDemographics.length > 0 && campaignRequest.contentTypes.length > 0 && campaignRequest.platforms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Campaign Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{calculateTotalContent(campaignRequest)}</div>
                <div className="text-sm text-gray-600">Total Content Pieces</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{campaignRequest.platforms.length}</div>
                <div className="text-sm text-gray-600">Platforms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{campaignRequest.targetDemographics.length}</div>
                <div className="text-sm text-gray-600">Demographics</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{campaignRequest.campaignDuration}</div>
                <div className="text-sm text-gray-600">Days</div>
              </div>
            </div>

            <Button
              onClick={handleGenerateCampaign}
              disabled={isGenerating}
              className="w-full mt-6"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Campaign Content...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Bulk Patient Education Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderGenerationProgress = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Generating Campaign Content
        </CardTitle>
        <CardDescription>
          Creating AHPRA-compliant patient education content for your campaign
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Generation Progress</span>
            <span>{Math.round(generationProgress)}%</span>
          </div>
          <Progress value={generationProgress} className="w-full" />
        </div>

        {currentCampaign && (
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Campaign:</strong> {currentCampaign.name}<br />
                <strong>Topic:</strong> {currentCampaign.healthTopic}<br />
                <strong>Total Content:</strong> {currentCampaign.totalContent} pieces
              </AlertDescription>
            </Alert>

            <div className="text-sm text-gray-600">
              Generating content with AHPRA compliance, TGA therapeutic advertising validation, 
              and cultural sensitivity checks...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderCampaignResults = () => (
    <div className="space-y-6">
      {/* Campaign Overview */}
      {currentCampaign && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Campaign Generated Successfully
              </span>
              <Badge variant="secondary">{currentCampaign.complianceStatus}</Badge>
            </CardTitle>
            <CardDescription>
              {currentCampaign.name} - {currentCampaign.healthTopic}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentCampaign.generatedContent}</div>
                <div className="text-sm text-gray-600">Content Pieces</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentCampaign.platforms.length}</div>
                <div className="text-sm text-gray-600">Platforms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(currentCampaign.campaignMetrics.complianceRate)}%
                </div>
                <div className="text-sm text-gray-600">Compliance Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {currentCampaign.campaignMetrics.averageEducationalValue}/10
                </div>
                <div className="text-sm text-gray-600">Educational Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generated Content
          </CardTitle>
          <CardDescription>
            Your AHPRA-compliant patient education content is ready to use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bulkContent.map((content, index) => (
              <div key={content.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-medium">{content.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Badge variant="outline">{content.platform}</Badge>
                      <Badge variant="outline">{content.contentType.replace('_', ' ')}</Badge>
                      <Badge variant="outline">{content.demographic.ageGroup}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {content.ahpraCompliant && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {content.tgaCompliant && <Shield className="h-4 w-4 text-blue-600" />}
                      {content.culturallySensitive && <Heart className="h-4 w-4 text-purple-600" />}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyContent(content.content, content.id)}
                    >
                      {copiedContentId === content.id ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="text-sm bg-gray-50 p-3 rounded">
                  {content.content}
                </div>

                <div className="space-y-2">
                  {content.hashtags.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4" />
                      <span className="text-blue-600">{content.hashtags.join(' ')}</span>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <strong>Call to Action:</strong> {content.callToAction}
                  </div>

                  {content.disclaimers.length > 0 && (
                    <div className="text-xs text-gray-500 border-t pt-2">
                      <strong>Disclaimers:</strong> {content.disclaimers.join(' ')}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div>
                    Readability: {content.readabilityScore}/10 | 
                    Educational Value: {content.educationalValue}/10 | 
                    Engagement: {content.engagementPrediction}/10
                  </div>
                  <div>
                    Sequence: {content.contentSequence}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCampaignHistory = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Campaign History
        </CardTitle>
        <CardDescription>
          View and manage your previous campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map(campaign => (
            <div 
              key={campaign.id} 
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedCampaignId === campaign.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCampaignId(campaign.id)}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h4 className="font-medium">{campaign.name}</h4>
                  <div className="text-sm text-gray-600">{campaign.healthTopic}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{campaign.complianceStatus}</Badge>
                    <span className="text-xs text-gray-500">
                      {campaign.generatedContent} of {campaign.totalContent} content pieces
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
                  <div>to {new Date(campaign.endDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}

          {campaigns.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Campaigns Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first bulk patient education campaign to get started.
              </p>
              <Button onClick={() => setActiveTab('setup')}>
                <Zap className="h-4 w-4 mr-2" />
                Create First Campaign
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bulk Patient Education Generator</h2>
          <p className="text-gray-600">
            Create comprehensive healthcare awareness campaigns with AHPRA-compliant patient education content
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          AHPRA Compliant
        </Badge>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This tool generates bulk patient education content specifically designed for Australian healthcare professionals. 
          All content follows AHPRA advertising guidelines, TGA therapeutic advertising requirements, and includes 
          appropriate cultural sensitivity considerations.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Campaign Setup</TabsTrigger>
          <TabsTrigger value="results">Generated Content</TabsTrigger>
          <TabsTrigger value="history">Campaign History</TabsTrigger>
          <TabsTrigger value="templates">Health Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          {isGenerating ? renderGenerationProgress() : renderCampaignSetup()}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {bulkContent.length > 0 ? renderCampaignResults() : (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Content Generated Yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Set up and generate your first campaign to see results here.
                </p>
                <Button onClick={() => setActiveTab('setup')}>
                  <Zap className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {renderCampaignHistory()}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Health Topic Templates
              </CardTitle>
              <CardDescription>
                Evidence-based templates for common health topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getHealthTopicTemplates().map(template => (
                  <div key={template.topic} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{template.topic}</h4>
                      <Badge variant="outline">{template.category.replace('_', ' ')}</Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div><strong>Key Messages:</strong> {template.keyMessages.length}</div>
                      <div><strong>Common Myths:</strong> {template.commonMyths.length}</div>
                      <div><strong>Prevention Strategies:</strong> {template.preventionStrategies.length}</div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCampaignRequest(prev => ({ ...prev, healthTopic: template.topic }));
                        setActiveTab('setup');
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 