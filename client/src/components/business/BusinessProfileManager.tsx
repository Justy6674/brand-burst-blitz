import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Plus, Building, Globe, Palette, Settings2, Eye, BarChart3, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useBusinessProfiles, BusinessProfile } from '@/hooks/useBusinessProfiles';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useToast } from '@/hooks/use-toast';
import { BusinessBrandingSetup } from './BusinessBrandingSetup';

const industries = [
  { value: 'general', label: 'General' },
  { value: 'tech', label: 'Technology' },
  { value: 'health', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'legal', label: 'Legal' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'beauty', label: 'Beauty & Cosmetics' },
];

const aiTones = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'exciting', label: 'Exciting' },
];

interface FormData {
  business_name: string;
  industry: 'general' | 'tech' | 'health' | 'finance' | 'legal' | 'fitness' | 'beauty';
  website_url: string;
  default_ai_tone: 'professional' | 'friendly' | 'casual' | 'authoritative' | 'empathetic' | 'exciting';
  is_primary: boolean;
}

interface BusinessProfileManagerProps {
  onOpenIntegration?: (businessId: string) => void;
}

export const BusinessProfileManager: React.FC<BusinessProfileManagerProps> = ({ onOpenIntegration }) => {
  const { profile: userProfile, updateProfile: updateUserProfile } = useUserProfile();
  const { 
    businessProfiles, 
    activeProfile, 
    isLoading, 
    createBusinessProfile, 
    updateBusinessProfile, 
    setActiveProfile 
  } = useBusinessProfiles();
  
  const [editingProfile, setEditingProfile] = useState<BusinessProfile | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBrandingStatus = (business: BusinessProfile) => {
    try {
      const branding = typeof business.brand_colors === 'string' 
        ? JSON.parse(business.brand_colors)
        : business.brand_colors;
      return branding ? 'configured' : 'default';
    } catch {
      return 'default';
    }
  };

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>();

  // Initialize form with active profile or default values
  useEffect(() => {
    if (editingProfile) {
      reset({
        business_name: editingProfile.business_name,
        industry: editingProfile.industry,
        website_url: editingProfile.website_url || '',
        default_ai_tone: editingProfile.default_ai_tone,
        is_primary: editingProfile.is_primary,
      });
    } else if (showCreateForm) {
      reset({
        business_name: '',
        industry: 'general',
        website_url: '',
        default_ai_tone: 'professional',
        is_primary: businessProfiles.length === 0,
      });
    }
  }, [editingProfile, showCreateForm, businessProfiles.length, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      if (editingProfile) {
        // Update existing profile
        const success = await updateBusinessProfile(editingProfile.id, data);
        if (success) {
          setEditingProfile(null);
        }
      } else {
        // Create new profile
        const success = await createBusinessProfile(data);
        if (success) {
          setShowCreateForm(false);
        }
      }
    } catch (error) {
      console.error('Error saving business profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProfile(null);
    setShowCreateForm(false);
    reset();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Settings</h1>
          <p className="text-muted-foreground">Manage your business profiles and settings</p>
        </div>
        {!showCreateForm && !editingProfile && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Business Profile
          </Button>
        )}
      </div>

      {/* User Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings2 className="h-5 w-5 mr-2" />
            User Profile
          </CardTitle>
          <CardDescription>Your personal account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={userProfile?.full_name || ''}
                onChange={(e) => updateUserProfile({ full_name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label>Account Type</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Badge variant="secondary">Trial Account</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Profiles Grid */}
      {businessProfiles.length > 0 && !showCreateForm && !editingProfile && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Business Profiles
              </CardTitle>
              <CardDescription>Manage your business profiles and their settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businessProfiles.map((profile) => (
                  <Card 
                    key={profile.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      activeProfile?.id === profile.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedBusinessId(profile.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={profile.favicon_url || profile.logo_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(profile.business_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{profile.business_name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {profile.industry || 'General'}
                            </p>
                          </div>
                        </div>
                        {profile.is_primary && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Branding</p>
                          <Badge 
                            variant={getBrandingStatus(profile) === 'configured' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {getBrandingStatus(profile) === 'configured' ? 'Custom' : 'Default'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge 
                            variant={activeProfile?.id === profile.id ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {activeProfile?.id === profile.id ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveProfile(profile);
                          }}
                          disabled={activeProfile?.id === profile.id}
                          className="flex-1"
                        >
                          {activeProfile?.id === profile.id ? 'Active' : 'Set Active'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenIntegration?.(profile.id);
                          }}
                        >
                          <Globe className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Management for Selected Business */}
          {selectedBusinessId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Business Settings
                </CardTitle>
                <CardDescription>
                  Configure detailed settings for {businessProfiles.find(b => b.id === selectedBusinessId)?.business_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="branding" className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Branding
                    </TabsTrigger>
                    <TabsTrigger value="integrations" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Integrations
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Business Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {(() => {
                            const business = businessProfiles.find(b => b.id === selectedBusinessId);
                            if (!business) return null;

                            return (
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                                  <p className="font-medium">{business.business_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Industry</label>
                                  <p className="capitalize">{business.industry || 'General'}</p>
                                </div>
                                {business.website_url && (
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Website</label>
                                    <p className="text-blue-600 hover:underline">
                                      <a href={business.website_url} target="_blank" rel="noopener noreferrer">
                                        {business.website_url}
                                      </a>
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Default AI Tone</label>
                                  <p className="capitalize">{business.default_ai_tone || 'Professional'}</p>
                                </div>
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => setSelectedTab('branding')}
                          >
                            <Palette className="w-4 h-4 mr-2" />
                            Customize Branding
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => onOpenIntegration?.(selectedBusinessId)}
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            Setup Platform Integration
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => setEditingProfile(businessProfiles.find(b => b.id === selectedBusinessId) || null)}
                          >
                            <Settings2 className="w-4 h-4 mr-2" />
                            Edit Business Details
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="branding" className="mt-6">
                    <BusinessBrandingSetup businessId={selectedBusinessId} />
                  </TabsContent>

                  <TabsContent value="integrations" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Platform Integrations</CardTitle>
                        <CardDescription>
                          Configure how your content is published to different platforms
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Platform Integration Setup</h3>
                          <p className="text-muted-foreground mb-4">
                            Configure blog integrations for your website platform
                          </p>
                          <Button onClick={() => onOpenIntegration?.(selectedBusinessId)}>
                            Setup Integration
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Business Analytics</CardTitle>
                        <CardDescription>
                          Track performance and engagement for this business
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                          <p className="text-muted-foreground mb-4">
                            Content performance analytics coming soon
                          </p>
                          <Button variant="outline" disabled>
                            View Analytics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingProfile) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProfile ? 'Edit Business Profile' : 'Create Business Profile'}
            </CardTitle>
            <CardDescription>
              {editingProfile 
                ? 'Update your business profile information'
                : 'Add a new business profile to your account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    {...register('business_name', { required: 'Business name is required' })}
                    placeholder="Your Business Name"
                  />
                  {errors.business_name && (
                    <p className="text-sm text-red-600">{errors.business_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select onValueChange={(value) => setValue('industry', value as 'general' | 'tech' | 'health' | 'finance' | 'legal' | 'fitness' | 'beauty')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    {...register('website_url')}
                    placeholder="https://yourbusiness.com"
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_ai_tone">Default AI Tone</Label>
                  <Select onValueChange={(value) => setValue('default_ai_tone', value as 'professional' | 'friendly' | 'casual' | 'authoritative' | 'empathetic' | 'exciting')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {aiTones.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_primary"
                  checked={watch('is_primary')}
                  onCheckedChange={(checked) => setValue('is_primary', checked)}
                />
                <Label htmlFor="is_primary">Set as primary business profile</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : editingProfile ? 'Update Profile' : 'Create Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {businessProfiles.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Business Profiles</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first business profile to start using JB-SaaS features
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Business Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};