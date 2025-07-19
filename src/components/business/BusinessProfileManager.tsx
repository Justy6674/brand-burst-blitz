import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Plus, Building, Globe, Palette, Settings2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useBusinessProfiles, BusinessProfile } from '@/hooks/useBusinessProfiles';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useToast } from '@/hooks/use-toast';

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

export const BusinessProfileManager = () => {
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
  const { toast } = useToast();

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

      {/* Business Profiles List */}
      {businessProfiles.length > 0 && !showCreateForm && !editingProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Business Profiles
            </CardTitle>
            <CardDescription>Manage your business profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businessProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`p-4 border rounded-lg ${
                    activeProfile?.id === profile.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-semibold flex items-center">
                          {profile.business_name}
                          {profile.is_primary && (
                            <Badge variant="default" className="ml-2">Primary</Badge>
                          )}
                          {activeProfile?.id === profile.id && (
                            <Badge variant="outline" className="ml-2">Active</Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {industries.find(i => i.value === profile.industry)?.label || profile.industry}
                        </p>
                        {profile.website_url && (
                          <p className="text-sm text-muted-foreground">
                            <Globe className="h-3 w-3 inline mr-1" />
                            {profile.website_url}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveProfile(profile)}
                        disabled={activeProfile?.id === profile.id}
                      >
                        {activeProfile?.id === profile.id ? 'Active' : 'Set Active'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProfile(profile)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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